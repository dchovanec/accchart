// pay-curve-chart.js
/**
MIT License

Copyright (c) 2025 David Chovanec

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
class PayAccelerationChart extends HTMLElement {
    /** 
     * attainment percentages - displayed on the X axis
     * @type {Array} */
    #labels
    /**
     * payout percentages - displayed on the Y axis
     * @type {Array} */
    #values;
    /**
     * The padding in local coordinates.
     * @typedef {Object} ElementPadding
     * @property {number} left - space on the left of the chart area - includes the Y-axis labels
     * @property {number} right - space on the right of the chart area
     * @property {number} top - space on the top of the chart area
     * @property {number} bottom - space on the bottom of the chart area - includes the X-axis labels
     */
    /** @type {ElementPadding} */
    #padding;

    /**
     * Constructor for the BarChart component
     */
    constructor() {
        super();
        this.attachShadow({ mode: "open" }); // Attach a Shadow DOM

        // Initialize the defaults
        this.data = { bands: [] };
        this.#labels = [];
        this.#values = [];
        this.width = 400; // Default width
        this.height = 300; // Default height

        // Use the root element font size to set the padding
        const oneRem = parseFloat(
            getComputedStyle(document.documentElement).fontSize
        );
        this.#padding = { left: oneRem * 4, right: oneRem, top: 0, bottom: oneRem * 3 };
    }

    /**
     * Called when the component is connected to the DOM
     */
    connectedCallback() {
        // Read attributes when the component is connected to the DOM
        this.width = parseInt(this.getAttribute("width") || 400, 10);
        this.height = parseInt(this.getAttribute("height") || 300, 10);
        const dataAttribute = this.getAttribute("data");
        if (dataAttribute) {
            try {
                this.data = JSON.parse(dataAttribute);
            } catch (error) {
                console.error("Invalid data attribute:", error);
                this.data = { bands: [] };; // Fallback to empty array
            }
            this.#generateChartData();
        }
        this.render();
    }

    /**
     * Define the attributes that the component will observe for changes
     */
    static get observedAttributes() {
        return ["data", "width", "height"];
    }

    /**
     * Render the chart
     */
    render() {
        this.#drawChart();
    }

    /**
     * Get the graph scale object
     * @returns {Object} The scale object with x and y properties representing 
     *                      scale across X and Y scales
     */
    get #scale() {
        return {
            x: (this.width - this.#padding.left - this.#padding.right) / this.#labels.at(-1),
            y: (this.height - this.#padding.top - this.#padding.bottom) / this.#values.at(-1)
        };
    }

    /**
     * Get the X coordinate in the local coordinate system for the given attainment value
     * @param {number} value - The attainment value to convert to the local coordinate system
     * @returns {number} The X coordinate in the local coordinate system
     * @private
     */
    #cX(value) {
        return this.#padding.left + value * this.#scale.x;
    }

    /**
     * Get the Y coordinate in the local coordinate system for the given payout value
     * @param {number} value - The payout value to convert to the local coordinate system
     * @returns {number} The Y coordinate in the local coordinate system
     * @private
     */
    #cY(value) {
        return this.height - this.#padding.bottom - this.#padding.top - value * this.#scale.y;
    }

    /**
     * Called when an observed attribute changes
     * @param {string} name - The name of the attribute that changed    
     * @param {string} oldValue - The old value of the attribute
     * @param {string} newValue - The new value of the attribute
     * @private
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "data" && newValue) {
            try {
                this.data = JSON.parse(newValue);
            } catch (error) {
                console.error("Invalid data attribute:", error);
                this.data = { bands: [] };; // Fallback to empty array
            }
            this.#generateChartData();
        } else if (name === "width" && newValue) {
            this.width = parseInt(newValue, 10);
        } else if (name === "height" && newValue) {
            this.height = parseInt(newValue, 10);
        }
        this.render();
    }

    /**
     * Calculate the payout for a given attainment
     * @param {number} attainment - The attainment percentage
     * @returns {number} The payout percentage
     * @private
     */
    #calculatePayout(attainment) {
        const bands = this.data.bands;
        let payout = 0;
        for (let band of bands) {
            if (attainment > band.min) {
                const range = band.max
                    ? Math.min(attainment, band.max) - band.min
                    : attainment - band.min;
                payout += range * band.rate;
            } else {
                break; // Stop if attainment is below the current band's minimum
            }
        }
        return payout;
    }

    /**
     * Generate the chart data from the pay bands
     * 
     * The chart data is generated from the pay bands. The #labels[] are the attainment
     * percentages and the #values[] are the corresponding payout percentages.
     * 
     * @private
     */
    #generateChartData() {
        this.#labels = [];
        this.#values = [];
        const bands = this.data.bands;

        // Ensure bands is an array
        if (!Array.isArray(bands)) {
            console.error("bands is not an array:", bands);
        }

        bands.forEach((band, index) => {
            this.#labels.push(band.min);
            this.#values.push(this.#calculatePayout(band.min));
        });

        // Add the last point 100% away from the last band minimum
        const lastBand = bands[bands.length - 1];
        if (lastBand) {
            this.#labels.push(lastBand.min + 100);
            this.#values.push(this.#calculatePayout(this.#labels[this.#labels.length - 1], bands));
        }
    }

    /**
     * Draw the grid lines and labels for the X and Y axes
     * @param {Element} svg - The SVG element to which the grid lines and labels are added
     * @private
     */
    #drawGridLinesWithLabels(svg) {
        const svgNS = "http://www.w3.org/2000/svg";

        // Draw X-axis grid lines and labels
        this.#labels.forEach((value, index) => {
            const x = this.#cX(value);

            // don't draw the last tick
            if (index == this.#labels.length - 1) {
                return;
            }

            // Grid line
            const gridLine = document.createElementNS(svgNS, "line");
            gridLine.setAttribute("x1", x);
            gridLine.setAttribute("y1", this.#cY(this.#values[index]));
            gridLine.setAttribute("x2", x);
            gridLine.setAttribute("y2", this.#cY(0));
            gridLine.classList.add("grid-line");
            svg.appendChild(gridLine);

            // Label
            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", x);
            text.setAttribute("y", this.#cY(0) + 20);
            text.classList.add("axis-label");
            text.textContent = `${value}%`;
            svg.appendChild(text);
        });

        // Draw Y-axis grid lines and labels
        this.#values.forEach((value, index) => {
            const y = this.#cY(value);

            // don't draw the last tick
            if (index == this.#values.length - 1) {
                return;
            }

            // Grid line
            const gridLine = document.createElementNS(svgNS, "line");
            gridLine.setAttribute("x1", this.#cX(0));
            gridLine.setAttribute("y1", y);
            gridLine.setAttribute("x2", this.#cX(this.#labels[index]));
            gridLine.setAttribute("y2", y);
            gridLine.classList.add("grid-line");
            svg.appendChild(gridLine);

            // Label
            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", this.#cX(0) - 10);
            text.setAttribute("y", y + 5);
            text.classList.add("axis-label", "y-axis-label");
            text.textContent = `${value}%`;
            svg.appendChild(text);
        });
    }

    // Draw the chart using SVG
    #drawChart() {
        const payBands = this.data;
        const svgNS = "http://www.w3.org/2000/svg";
        const oneRem = parseFloat(
            getComputedStyle(document.documentElement).fontSize
        );

        // create the cotainer SVG element
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", this.width);
        svg.setAttribute("height", this.height);

        // Define an arrowhead marker
        const defs = document.createElementNS(svgNS, "defs");
        const marker = document.createElementNS(svgNS, "marker");
        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("markerWidth", "9");
        marker.setAttribute("markerHeight", "5");
        marker.setAttribute("refX", "7");
        marker.setAttribute("refY", "2.5");
        marker.setAttribute("orient", "auto");
        const arrow = document.createElementNS(svgNS, "path");
        arrow.setAttribute("d", "M0,0 L8,2.5 L0,5 Z");
        marker.classList.add("arrow-marker");
        marker.appendChild(arrow);
        defs.appendChild(marker);
        svg.appendChild(defs);

        // Add X-axis title
        const xAxisTitle = document.createElementNS(svgNS, "text");
        xAxisTitle.setAttribute("x", this.#padding.left 
            + (this.width - this.#padding.left - this.#padding.right) / 2); // Center the title label on the X-axis
        xAxisTitle.setAttribute("y", this.height - oneRem / 3);
        xAxisTitle.classList.add("axis-title");
        xAxisTitle.textContent = "Attainment (%)";
        svg.appendChild(xAxisTitle);

        // Add Y-axis title
        const yAxisTitle = document.createElementNS(svgNS, "text");
        yAxisTitle.setAttribute("x",  
            - (this.height - this.#padding.bottom - this.#padding.top) / 2);
        yAxisTitle.setAttribute("y", 0);
        yAxisTitle.setAttribute("transform", "rotate(-90)");
        yAxisTitle.setAttribute("dominant-baseline", "hanging");
        yAxisTitle.classList.add("axis-title");
        yAxisTitle.textContent = "Payout (%)";
        svg.appendChild(yAxisTitle);

        // Draw X and Y axes
        const xAxis = document.createElementNS(svgNS, "line");
        xAxis.setAttribute("x1", this.#padding.left);
        xAxis.setAttribute("y1", this.height - this.#padding.bottom);
        xAxis.setAttribute("x2", this.width - this.#padding.right);
        xAxis.setAttribute("y2", this.height - this.#padding.bottom);
        xAxis.classList.add("axis");
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS(svgNS, "line");
        yAxis.setAttribute("x1", this.#padding.left);
        yAxis.setAttribute("y1", this.#padding.top);
        yAxis.setAttribute("x2", this.#padding.left);
        yAxis.setAttribute("y2", this.height - this.#padding.bottom);
        yAxis.classList.add("axis");
        svg.appendChild(yAxis);

        // Draw XY-axis grid lines and labels
        this.#drawGridLinesWithLabels(svg);

        if (this.data.hasgate) {
            // Draw the no acceleration dashed line
            const oneXLine = document.createElementNS(svgNS, "line");
            oneXLine.setAttribute("x1", this.#cX(this.#labels[1]));
            oneXLine.setAttribute("y1", this.#cY(this.#values[1]));
            oneXLine.setAttribute("x2", this.#cX(this.#labels.at(-1)));
            oneXLine.setAttribute("y2", this.#cY(this.#labels.at(-1)));
            oneXLine.classList.add("one-x-line");
            svg.appendChild(oneXLine);

            // Draw the no acceleration dashed line label
            const labelText = document.createElementNS(svgNS, "text");
            labelText.setAttribute("x", this.#cX(this.#labels.at(-2)));
            labelText.setAttribute("y", this.#cY(this.#labels.at(-2)) + oneRem);
            labelText.classList.add("gate-label", "no-acceleration-label");
            labelText.textContent = `gate not met`;
            svg.appendChild(labelText);
        }

        // Draw the chart line and add band rate labels
        const path = document.createElementNS(svgNS, "path");
        let pathData = `M${this.#cX(0)},${this.#cY(0)}`;
        this.#labels.forEach((label, index) => {
            const x = this.#cX(label);
            const y = this.#cY(this.#values[index]);
            pathData += ` L${x},${y}`;

            // Add band rate labels at the midpoint of each segment
            if (index > 0) {
                const prevX = this.#cX(this.#labels[index - 1]);
                const prevY = this.#cY(this.#values[index - 1]);
                const midX = (prevX + x) / 2;
                const midY = (prevY + y) / 2;

                // Find the corresponding band rate
                const band = payBands.bands.find(
                    (b) => label >= b.min && (b.max ? label <= b.max : true)
                );
                if (band) {
                    const labelText = document.createElementNS(svgNS, "text");
                    labelText.setAttribute("x", midX - 5);
                    labelText.setAttribute("y", midY - 5); // Position above the line
                    labelText.classList.add("band-rate-label");
                    labelText.textContent = `${band.rate}x`;
                    svg.appendChild(labelText);

                    // Add Gate-met label in the first accelerating band
                    if (this.data.hasgate && index === 2) {
                        const gateText = document.createElementNS(svgNS, "text");
                        gateText.setAttribute("x", this.#cX(0) + oneRem/2);
                        gateText.setAttribute("y", midY - 5); // Position next to rate label
                        gateText.classList.add("gate-label", "acceleration-label");
                        gateText.textContent = `gate met`;
                        svg.appendChild(gateText);
                    }
                }
            }
        });
        path.setAttribute("d", pathData);
        path.classList.add("chart-line");
        path.setAttribute("marker-end", "url(#arrowhead)"); // Add arrowhead to the end of the line
        svg.appendChild(path);

        // Clear the shadow root and append the new SVG
        this.shadowRoot.innerHTML = `
      <style>
      .axis {
          stroke: black;
          stroke-width: 1;
      }
  
      .grid-line {
          stroke: #ddd;
          stroke-width: .5;
      }
  
      .axis-label {
          font-size: 0.7rem;
          fill: black;
          text-anchor: middle;
      }
  
      .y-axis-label {
          text-anchor: end;
      }
      .chart-line {
          stroke: rgb(5, 106, 200);
          stroke-width: 2;
          fill: none;
      }
      .arrow-marker {
          fill: rgb(5, 106, 200);
      }
  
      .one-x-line {
          stroke: rgb(5, 106, 200);
          stroke-width: 1;
          stroke-dasharray: 5, 5; /* Dashed line */
      }
  
      .band-rate-label {
          font-size: 0.7rem;
          fill: black;
          text-anchor: end;
          font-weight: bold;
      }
  
      .axis-title {
          font-size: .7rem;
          fill: #000;
          text-anchor: middle;
      }
      .gate-label {
          font-size: .7rem;
          text-anchor: left;
          font-weight: regular;
      }
  
      .no-acceleration-label {
          fill: red;
      }
  
      .acceleration-label {
          fill: green;
      }
      </style>`;
        this.shadowRoot.appendChild(svg);
    }
}

customElements.define("pay-acceleration-chart", PayAccelerationChart);
