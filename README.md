# Pay acceleration web component

Implementation of a minimalistic web component displaying pay acceleration curve. 
Web component code with no frameworks, no dependencies. 

Example:

<img width="274" alt="image" src="https://github.com/user-attachments/assets/071bb9ee-9b60-4e92-8144-499231d58d80" />

## Usage

### Usage in HTML:

Download the ../components/pay-curve-chart.js into your project.

```html
<pay-acceleration-chart width="300" height="200" data='{
            "bands": [
                { "min": 0, "max": 100, "rate": 1 },
                { "min": 100, "max": 200, "rate": 2.5 },
                { "min": 200, "max": 300, "rate": 1.5 },
                { "min": 300, "rate": 1.15 }
            ],
            "hasgate": true
        }'>
</pay-acceleration-chart>
<!-- Include the component file -->
<script src="../components/pay-curve-chart.js"></script>
```

Adjust the styling of the chart components in the pay-curve-chart.js. CSS is at the very bottom of the source code.

## Demo

Checkout the example running under github pages: [Examples](https://dchovanec.github.io/accchart/examples/)

## Unit Tests

Unit test results here: [unit tests](https://dchovanec.github.io/accchart/tests/)

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
