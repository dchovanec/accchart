document.addEventListener("DOMContentLoaded", () => {
    const testResults = document.getElementById("test-results");

    // Helper function to display test results
    function displayTestResult(testName, passed, testSet) {
        const testCase = document.createElement("div");
        testCase.className = "test-case";
        testCase.innerHTML = `${testName}: <span class="${passed ? 'pass' : 'fail'}">${passed ? 'PASS' : 'FAIL'}</span>`;
        testSet.appendChild(testCase);
        return passed; // Return whether the test passed
    }

    // Helper function to display test set
    function displayTestSet(testSetName) {
        const testSet = document.createElement("div");
        testSet.className = "test-set";

        const header = document.createElement("div");
        header.className = "test-set-header";
        header.innerHTML = `<h3>${testSetName}</h3>`;
        testSet.appendChild(header);

        const content = document.createElement("div");
        content.className = "test-set-content";
        testSet.appendChild(content);

        // Add a button to toggle visibility
        const toggleButton = document.createElement("button");
        toggleButton.textContent = "Toggle";
        toggleButton.addEventListener("click", () => {
            content.style.display = content.style.display === "none" ? "block" : "none";
        });
        header.appendChild(toggleButton);

        testResults.appendChild(testSet);
        return content; // Return the content container for adding test results
    }

    // Test 1: Check if the SVG element exists
    function testSVGElement(testSet) {
        const svgComponent = document.querySelector("pay-acceleration-chart");
        const svg = svgComponent.shadowRoot.querySelector("svg");
        const passed = svg !== null;
        return displayTestResult("SVG element exists", passed, testSet);
    }

    // Check if the component has 2 axis titles rendered in the SVG
    function testAxisTitle(testSet) {
        let passed = false;
        try {
            const svgComponent = document.querySelector("pay-acceleration-chart");
            const axis = svgComponent.shadowRoot.querySelectorAll(".axis-title");
            passed = axis.length === 2;
        } finally {
            return displayTestResult("Component has 2 axis rendered", passed, testSet);
        }
    }
    // Check the axis title text
    function testAxisTitleText(testSet) {
        let passed = false;
        try {
            const svgComponent = document.querySelector("pay-acceleration-chart");
            const axis = svgComponent.shadowRoot.querySelectorAll(".axis-title");
            passed = axis[0].textContent === "Attainment (%)" 
                && axis[1].textContent === "Payout (%)";
        } catch (e) {
            console.error(e);
        } finally {
            return displayTestResult("Axis titles have correct text", passed, testSet);
        }
    }

    //check if the componenet has 2 axis rendered
    function testAxis(testSet) {
        let passed = false;
        try {
            const svgComponent = document.querySelector("pay-acceleration-chart");
            const axis = svgComponent.shadowRoot.querySelectorAll(".axis");
            passed = axis.length === 2;
        } finally {
            return displayTestResult("Component has 2 axis rendered", passed, testSet);
        }
    }

    //check if conponenet has 4 X axis labels
    function testAxisLabelsX(data, testSet) {
        let passed = false;
        try {
            const svgComponent = document.querySelector("pay-acceleration-chart");
            const axis = svgComponent.shadowRoot.querySelectorAll(".x-axis-label");
            passed = axis.length === data.bands.length;
        } catch (e) {
            console.error(e);
        } finally {
            return displayTestResult(`Component has ${data.bands.length} X axis labels rendered`, passed, testSet);
        }
    }

    // check if componenet has 4 Y axis labels
    function testAxisLabelsY(data, testSet) {
        let passed = false;
        try {
            const svgComponent = document.querySelector("pay-acceleration-chart");
            const axis = svgComponent.shadowRoot.querySelectorAll(".y-axis-label");
            passed = axis.length === data.bands.length;
        } catch (e) {
            console.error(e);
        } finally {
            return displayTestResult(`Component has ${data.bands.length} Y axis labels rendered`, passed, testSet);
        }
    }

    // check if gane not met is rendered
    function testGateNotMet(data, testSet) {
        let passed = false;
        try {
            const svgComponent = document.querySelector("pay-acceleration-chart");
            const gate = svgComponent.shadowRoot.querySelector(".no-acceleration-label");
            const hasgate = 'hasgate' in data ? data.hasgate : false;
            passed = !((gate !== null) ^ (hasgate));
        } finally {
            return displayTestResult("Gate not met label is rendered", passed, testSet);
        }
    }
    // check if gane met is rendered
    function testGateMet(data, testSet) {
        let passed = false;
        try {
            const svgComponent = document.querySelector("pay-acceleration-chart");
            const gate = svgComponent.shadowRoot.querySelector(".acceleration-label");
            const hasgate = 'hasgate' in data ? data.hasgate : false;
            passed = !((gate !== null) ^ (hasgate));
        } finally {
            return displayTestResult("Gate met label is rendered", passed, testSet);
        }
    }

    // Run all tests for a given data set
    function runTestSet(testSetName, data) {
        const testSetContent = displayTestSet(testSetName);
        let allPassed = true;

        // Run individual tests
        allPassed &= testSVGElement(testSetContent);
        allPassed &= testAxisTitle(testSetContent);
        allPassed &= testAxisTitleText(testSetContent);
        allPassed &= testAxis(testSetContent);
        allPassed &= testAxisLabelsX(data, testSetContent);
        allPassed &= testAxisLabelsY(data, testSetContent);
        allPassed &= testGateNotMet(data, testSetContent);
        allPassed &= testGateMet(data, testSetContent);

        // Collapse the test set if all tests passed
        if (allPassed) {
            testSetContent.style.display = "none";
        }
    }

    // Run initial test set with data from HTML attribute
    let svg = document.querySelector("pay-acceleration-chart");
    let data = JSON.parse(svg.getAttribute("data"));
    runTestSet("Test 0: Check with data passed from HTML attribute", data);

    const tests = [
        {
            testName: "Test 1: 3 bands, no gate",
            data : {
                bands: [
                    { min: 0, max: 100, rate: 1 },
                    { min: 100, max: 200, rate: 2 },
                    { min: 200, rate: 1.5 }
                ],
                hasgate: false
            }
        },
        {
            testName: "Test 2: 2 bands, no gate",
            data : {
                bands: [
                    { min: 0, max: 100, rate: 1 },
                    { min: 100, rate: 2 },
                ],
                hasgate: false
            }
        },        
        {
            testName: "Test 3: 1 band, no gate",
            data : {
                bands: [
                    { min: 0, rate: 1 },
                ],
                hasgate: false
            }
        },        
        {
            testName: "Test 4: 3 bands, missing gate",
            data : {
                bands: [
                    { min: 0, max: 100, rate: 1 },
                    { min: 100, max: 200, rate: 2 },
                    { min: 200, rate: 1.5 }
                ]
            }
        }
    ];

    // Run additional test sets
    tests.forEach(test => {
        svg.setAttribute("data", JSON.stringify(test.data));
        runTestSet(test.testName, test.data);
    });
});