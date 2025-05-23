/*!
 * Source: "https://gist.github.com/tissera/3f0b647d4928d2960a53738ef683b0a6.js"
 * @license Open source under BSD 2-clause (http://choosealicense.com/licenses/bsd-2-clause/)
 * Copyright (c) 2015, Curtis Bratton
 * All rights reserved.
 *
 * Liquid Fill Gauge v1.1
 */

document.addEventListener("DOMContentLoaded", function () {
    function updateGauges(data) {
        const validRows = data.filter(d => d.Timestamp && d.Timestamp.trim() !== "");
        const total = validRows.length;
        const drinks = validRows.map(d => d["Ich trinke gerne ..."]);
        var absolute = 0;
        // Update the gauges with new values
        ['Kaffee', 'Tee', 'Energy Drink', 'Saft'].forEach((label, index) => {
            const gauge = [gauge_coffee, gauge_tea, gauge_energy, gauge_juice][index];
            absolute = drinks.filter(e => e && e.includes(label)).length;
            const value = Math.round(absolute / total * 100);
            gauge.update(value);
        });
    }

    const themeToggle = document.getElementById("theme-toggle");

    // Configure the gauges
    var config_coffee = liquidFillGaugeDefaultSettings();
    config_coffee.waveColor = "#94550b";
    config_coffee.waveTextColor = "#F3F3F3";
    var config_tea = liquidFillGaugeDefaultSettings();
    config_tea.waveColor = "#B7CF9F";
    config_tea.waveOffset = 0.5;
    config_tea.waveAnimateTime = 1700;
    var config_energy = liquidFillGaugeDefaultSettings();
    config_energy.waveColor = "#90EE90";
    var config_juice = liquidFillGaugeDefaultSettings();
    config_juice.waveColor = "#f9e055";
    config_juice.waveOffset = 0.5;
    config_juice.waveAnimateTime = 1700;

    var gauge_coffee = loadLiquidFillGauge("coffee-gauge", 0, config_coffee, "Kaffee");
    var gauge_tea = loadLiquidFillGauge("tea-gauge", 0, config_tea, "Tee");
    var gauge_energy = loadLiquidFillGauge("energy-gauge", 0, config_energy, "Energy Drink");
    var gauge_juice = loadLiquidFillGauge("juice-gauge", 0, config_juice, "Saft");

    // Add event listener to the theme toggle button
    themeToggle.addEventListener("click", function () {
        [gauge_coffee, gauge_tea, gauge_energy, gauge_juice].forEach((gauge, index) => {
            const { waveColor, waveTextColor } = juiceColors[currentTheme][index];
            gauge.changeWaveColor(waveColor, waveTextColor);
        });
    });

    if (typeof DashboardData !== "undefined" && DashboardData.subscribe) {
        DashboardData.subscribe(updateGauges);
    }
    else {
        [gauge_coffee, gauge_tea, gauge_energy, gauge_juice].forEach(gauge => {
            gauge.update(Math.floor(Math.random() * 101));
        }
        );
    }
});

function liquidFillGaugeDefaultSettings() {
    return {
        minValue: 0, // The gauge minimum value.
        maxValue: 100, // The gauge maximum value.
        circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
        circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
        circleColor: "#e4e4e4", // The color of the outer circle.
        waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
        waveCount: 1, // The number of full waves per width of the wave circle.
        waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime: 1500, // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
        waveAnimate: true, // Controls if the wave scrolls or is static.
        waveColor: "#178BCA", // The color of the fill wave.
        waveOffset: 0.25, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        textVertPosition: .8, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
        textSize: 0.7, // The relative height of the text to display in the wave circle. 1 = 50%
        valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
        displayPercent: true, // If true, a % symbol is displayed after the value.
        textColor: "#333", // The color of the value text when the wave does not overlap it.
        waveTextColor: "#333333", // The color of the value text when the wave overlaps it.  
        labelTextSize: 0.6 // The relative height of the label text to display in the wave circle. 1 = 50%
    };
}

function loadLiquidFillGauge(elementId, value, config, label) {
    if (config == null) config = liquidFillGaugeDefaultSettings();

    const gauge = d3.select("#" + elementId);
    const [ , , width, height ] = gauge.attr("viewBox").split(" ").map(Number);
    const radius = Math.min(width, height) / 2;

    const locationX = width / 2 - radius;
    const locationY = height / 2 - radius;
    const fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;

    let waveHeightScale = null;
    if (config.waveHeightScaling) {
        waveHeightScale = d3.scaleLinear()
            .range([0, config.waveHeight, 0])
            .domain([0, 50, 100]);
    } else {
        waveHeightScale = d3.scaleLinear()
            .range([config.waveHeight, config.waveHeight])
            .domain([0, 100]);
    }

    const textPixels = (config.textSize * radius / 2);
    const labelTextPixels = (config.labelTextSize * radius / 2);
    const textFinalValue = parseFloat(value).toFixed(2);
    const textStartValue = config.valueCountUp ? config.minValue : textFinalValue;
    const percentText = config.displayPercent ? "%" : "";
    const circleThickness = config.circleThickness * radius;
    const circleFillGap = config.circleFillGap * radius;
    const fillCircleMargin = circleThickness + circleFillGap;
    const fillCircleRadius = radius - fillCircleMargin;
    const waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);

    const waveLength = fillCircleRadius * 2 / config.waveCount;
    const waveClipCount = 1 + config.waveCount;
    const waveClipWidth = waveLength * waveClipCount;

    // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
    let textRounder = function (value) { return Math.round(value); };
    if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
        textRounder = function (value) { return parseFloat(value).toFixed(1); };
    }
    if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
        textRounder = function (value) { return parseFloat(value).toFixed(2); };
    }

    // Data for building the clip wave area.
    const data = [];
    for (let i = 0; i <= 40 * waveClipCount; i++) {
        data.push({ x: i / (40 * waveClipCount), y: (i / (40)) });
    }

    // Scales for drawing the outer circle.
    const gaugeCircleX = d3.scaleLinear().range([0, 2 * Math.PI]).domain([0, 1]);
    const gaugeCircleY = d3.scaleLinear().range([0, radius]).domain([0, radius]);

    // Scales for controlling the size of the clipping path.
    const waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
    const waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);

    // Scales for controlling the position of the clipping path.
    const waveRiseScale = d3.scaleLinear()
        // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
        // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
        // circle at 100%.
        .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
        .domain([0, 1]);
    const waveAnimateScale = d3.scaleLinear()
        .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
        .domain([0, 1]);

    // Scale for controlling the position of the text within the gauge.
    const textRiseScaleY = d3.scaleLinear()
        .range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)])
        .domain([0, 1]);

    // Center the gauge within the parent SVG.
    const gaugeGroup = gauge.append("g")
        .attr('transform', 'translate(' + locationX + ',' + locationY + ')');

    // Draw the outer circle.
    const gaugeCircleArc = d3.arc()
        .startAngle(gaugeCircleX(0))
        .endAngle(gaugeCircleX(1))
        .outerRadius(gaugeCircleY(radius))
        .innerRadius(gaugeCircleY(radius - circleThickness));
    gaugeGroup.append("path")
        .attr("d", gaugeCircleArc)
        .style("fill", config.circleColor)
        .attr('transform', 'translate(' + radius + ',' + radius + ')');

    // Text where the wave does not overlap.
    const text1 = gaugeGroup.append("text")
        .text(textRounder(textStartValue) + percentText)
        .attr("class", "liquidFillGaugeText")
        .attr("text-anchor", "middle")
        .attr("font-size", textPixels + "px")
        .style("fill", config.textColor)
        .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');
    let text1InterpolatorValue = textStartValue;

    // Label text where the wave does not overlap.
    const labelText = gaugeGroup.append("text")
        .text(label)
        .attr("class", "liquidFillGaugeText")
        .attr("text-anchor", "middle")
        .attr("font-size", labelTextPixels + "px")
        .style("fill", config.textColor)
        .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(0.5) + ')');

    // The clipping wave area.
    const clipArea = d3.area()
        .x(function (d) { return waveScaleX(d.x); })
        .y0(function (d) { return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI)); })
        .y1(function (d) { return (fillCircleRadius * 2 + waveHeight); });
    const waveGroup = gaugeGroup.append("defs")
        .append("clipPath")
        .attr("id", "clipWave" + elementId);
    const wave = waveGroup.append("path")
        .datum(data)
        .attr("d", clipArea)
        .attr("T", 0);

    // The inner circle with the clipping wave attached.
    var fillCircleGroup = gaugeGroup.append("g")
        .attr("clip-path", "url(#clipWave" + elementId + ")");
    fillCircleGroup.append("circle")
        .attr("cx", radius)
        .attr("cy", radius)
        .attr("r", fillCircleRadius)
        .style("fill", config.waveColor);

    // Text where the wave does overlap.
    const text2 = fillCircleGroup.append("text")
        .text(textRounder(textStartValue))
        .attr("class", "liquidFillGaugeText")
        .attr("text-anchor", "middle")
        .attr("font-size", textPixels + "px")
        .style("fill", config.waveTextColor)
        .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');
    let text2InterpolatorValue = textStartValue;

    // Label text where the wave does overlap.
    const labelText2 = fillCircleGroup.append("text")
        .text(label)
        .attr("class", "liquidFillGaugeText")
        .attr("text-anchor", "middle")
        .attr("font-size", labelTextPixels + "px")
        .style("fill", config.waveTextColor)
        .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(0.5) + ')');

    // Make the value count up.
    if (config.valueCountUp) {
        text1.transition()
            .duration(config.waveRiseTime)
            .tween("text", function () {
                const i = d3.interpolateNumber(text1InterpolatorValue, textFinalValue);
                return function (t) {
                    text1InterpolatorValue = textRounder(i(t));
                    // Set the gauge's text with the new value and append the % sign
                    // to the end
                    text1.text(text1InterpolatorValue + percentText);
                }
            });
        text2.transition()
            .duration(config.waveRiseTime)
            .tween("text", function () {
                const i = d3.interpolateNumber(text2InterpolatorValue, textFinalValue);
                return function (t) {
                    text2InterpolatorValue = textRounder(i(t));
                    // Set the gauge's text with the new value and append the % sign
                    // to the end                
                    text2.text(text2InterpolatorValue + percentText);
                }
            });

        //var textTween = function () {
        //    var i = d3.interpolate(this.textContent, textFinalValue);
        //    return function (t) { this.textContent = textRounder(i(t)) + percentText; }
        //};
        //text1.transition()
        //    .duration(config.waveRiseTime)
        //    .tween("text", textTween);
        //text2.transition()
        //    .duration(config.waveRiseTime)
        //    .tween("text", textTween);
    }

    // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
    var waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;
    if (config.waveRise) {
        waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
            .transition()
            .duration(config.waveRiseTime)
            .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')')
            // .each("start", function () { wave.attr('transform', 'translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
            .on("start", function () { wave.attr('transform', 'translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
    } else {
        waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')');
    }

    if (config.waveAnimate) animateWave();

    function animateWave() {
        wave.attr('transform', 'translate(' + waveAnimateScale(wave.attr('T')) + ',0)');
        wave.transition()
            .duration(config.waveAnimateTime * (1 - wave.attr('T')))
            .ease(d3.easeLinear)
            .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
            .attr('T', 1)
            .on('end', function () {
                wave.attr('T', 0);
                animateWave(config.waveAnimateTime);
            });
    }

    function GaugeUpdater() {
        this.update = function (value) {
            var newFinalValue = parseFloat(value).toFixed(2);
            var textRounderUpdater = function (value) { return Math.round(value); };
            if (parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))) {
                textRounderUpdater = function (value) { return parseFloat(value).toFixed(1); };
            }
            if (parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))) {
                textRounderUpdater = function (value) { return parseFloat(value).toFixed(2); };
            }
            text1.transition()
                .duration(config.waveRiseTime)
                .tween("text", function () {
                    const i = d3.interpolateNumber(text1InterpolatorValue, newFinalValue);
                    return function (t) {
                        text1InterpolatorValue = textRounder(i(t));
                        // Set the gauge's text with the new value and append the % sign
                        // to the end
                        text1.text(text1InterpolatorValue + percentText);
                    }
                });
            text2.transition()
                .duration(config.waveRiseTime)
                .tween("text", function () {
                    const i = d3.interpolateNumber(text2InterpolatorValue, newFinalValue);
                    return function (t) {
                        text2InterpolatorValue = textRounder(i(t));
                        // Set the gauge's text with the new value and append the % sign
                        // to the end                
                        text2.text(text2InterpolatorValue + percentText);
                    }
                });
            //var textTween = function () {
            //    var i = d3.interpolate(this.textContent, parseFloat(value).toFixed(2));
            //    return function (t) { this.textContent = textRounderUpdater(i(t)) + percentText; }
            //};

            //text1.transition()
            //    .duration(config.waveRiseTime)
            //    .tween("text", textTween);
            //text2.transition()
            //    .duration(config.waveRiseTime)
            //    .tween("text", textTween);

            var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;
            var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);
            var waveRiseScale = d3.scaleLinear()
                // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
                // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
                // circle at 100%.
                .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
                .domain([0, 1]);
            var newHeight = waveRiseScale(fillPercent);
            var waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
            var waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);
            var newClipArea;
            if (config.waveHeightScaling) {
                newClipArea = d3.area()
                    .x(function (d) { return waveScaleX(d.x); })
                    .y0(function (d) { return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI)); })
                    .y1(function (d) { return (fillCircleRadius * 2 + waveHeight); });
            } else {
                newClipArea = clipArea;
            }

            var newWavePosition = config.waveAnimate ? waveAnimateScale(1) : 0;
            wave.transition()
                .duration(0)
                .transition()
                .duration(config.waveAnimate ? (config.waveAnimateTime * (1 - wave.attr('T'))) : (config.waveRiseTime))
                .ease(d3.easeLinear)
                .attr('d', newClipArea)
                .attr('transform', 'translate(' + newWavePosition + ',0)')
                .attr('T', '1')
                .on("end", function () {
                    if (config.waveAnimate) {
                        wave.attr('transform', 'translate(' + waveAnimateScale(0) + ',0)');
                        animateWave(config.waveAnimateTime);
                    }
                });
            waveGroup.transition()
                .duration(config.waveRiseTime)
                .attr('transform', 'translate(' + waveGroupXPosition + ',' + newHeight + ')')
        }

        this.changeWaveColor = function (newWaveColor, newWaveTextColor) {
            if (newWaveTextColor) {
                config.waveTextColor = newWaveTextColor;
                text2.style("fill", newWaveTextColor);
                labelText2.style("fill", newWaveTextColor);
            }
            if (newWaveColor) {
                config.waveColor = newWaveColor;
                fillCircleGroup.select("circle").style("fill", newWaveColor);
            }
        }
    }

    return new GaugeUpdater();
}