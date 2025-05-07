document.addEventListener("DOMContentLoaded", function () {
    if (typeof DashboardData !== "undefined" && DashboardData.subscribe) {
        // Use live data
        DashboardData.subscribe(updateMosaicPlotWithSurveyData);
    } else {
        const data = [
            { place: "Strände", type: "Wellness", count: 30 },
            { place: "Strände", type: "Abenteuer", count: 10 },
            { place: "Strände", type: "Kultur", count: 5 },
            { place: "Berge", type: "Wellness", count: 5 },
            { place: "Berge", type: "Abenteuer", count: 20 },
            { place: "Berge", type: "Kultur", count: 10 },
            { place: "Städte", type: "Wellness", count: 10 },
            { place: "Städte", type: "Abenteuer", count: 5 },
            { place: "Städte", type: "Kultur", count: 25 },
            { place: "Balkonien", type: "Wellness", count: 15 },
            { place: "Balkonien", type: "Abenteuer", count: 5 },
            { place: "Balkonien", type: "Kultur", count: 5 },
        ];

        renderMosaicPlot(data);
    }
});

function updateMosaicPlotWithSurveyData(data) {
    const counts = {};

    data.forEach(row => {
        const place = row["Lieblings Urlaubsort?"]?.trim();
        const type = row["Lieblings Urlaubsaktivität?"]?.trim();

        if (place && type) {
            const key = `${place}|${type}`;
            counts[key] = (counts[key] || 0) + 1;
        }
    });

    const formattedData = Object.entries(counts).map(([key, count]) => {
        const [place, type] = key.split("|");
        return { place, type, count };
    });

    formattedData.sort((a, b) => {
        if (a.place === b.place) {
            return a.type.localeCompare(b.type);
        }
        return a.place.localeCompare(b.place);
    });

    renderMosaicPlot(formattedData)
}

function renderMosaicPlot(data) {
    const svg = d3.select("#mosaic-plot"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        margin = { top: 2, right: 100, bottom: 40, left: 10 };

    svg.selectAll("*").remove();

    const fontSize = 16;
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const total = d3.sum(data, d => d.count);

    const nested = d3.group(data, d => d.place);
    const placeTotals = Array.from(nested, ([place, values]) => ({
        place,
        total: d3.sum(values, d => d.count),
        values
    }));

    const xScale = d3.scaleLinear()
        .domain([0, total])
        .range([0, plotWidth]);

    // const blue = #abd9ec;
    // const yellow = #f9e055;
    const color = d3.scaleOrdinal()
        .domain(["Wellness", "Abenteuer", "Kultur", "Shopping"])
        .range(["#abd9ec", "#B7CF9F", "#f9e055", "#FFB6C1"]);

    const plotGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let xOffset = 0;

    // Emoji mapping
    const emojiMap = {
        "Strände": "🏖️",
        "Berge": "🏔️",
        "Städte": "🏙️",
        "Balkonien": "🏡"
    };

    placeTotals.forEach(place => {
        const colWidth = xScale(place.total);
        const xStart = xScale(xOffset);
        const colGroup = plotGroup.append("g").attr("transform", `translate(${xStart},0)`);

        const placeTotal = d3.sum(place.values, d => d.count);
        const yScale = d3.scaleLinear()
            .domain([0, placeTotal])
            .range([0, plotHeight]);

        let yOffset = 0;
        place.values.forEach(d => {
            const h = yScale(d.count);

            // Rectangle
            colGroup.append("rect")
                .attr("x", 0)
                .attr("y", yOffset)
                .attr("width", colWidth)
                .attr("height", h)
                .attr("fill", color(d.type))
                .attr("stroke", "#fff")
                .attr("stroke-width", 2.5);

            // Inside % label
            const percent = (d.count / total) * 100;
            if (h > 12 && colWidth > 25) {
                colGroup.append("text")
                    .attr("x", colWidth / 2)
                    .attr("y", yOffset + h / 2)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("font-size", "12px")
                    .attr("fill", "#333")
                    .text(`${percent.toFixed(0)}%`);
            }

            yOffset += h;
        });

        // Column % total on top
        const placePercent = (place.total / total) * 100;
        // X-axis label with emoji + % on second line
        plotGroup.append("text")
            .attr("x", xStart + colWidth / 2)
            .attr("y", plotHeight + 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .selectAll("tspan")
            .data([
                `${place.place}`,
                `${emojiMap[place.place] || ""} ${placePercent.toFixed(0)}%`
            ])
            .join("tspan")
            .attr("x", xStart + colWidth / 2)
            .attr("dy", (d, i) => i === 0 ? 0 : "1.2em")
            .text(d => d);


        xOffset += place.total;
    });

    // === Y-axis Labels aligned to RIGHT-most column ===
    const last = placeTotals.at(-1);
    const lastYScale = d3.scaleLinear()
        .domain([0, d3.sum(last.values, d => d.count)])
        .range([0, plotHeight]);

    // Compute totals per type
    const typeTotals = d3.rollup(
        data,
        v => d3.sum(v, d => d.count),
        d => d.type
    );

    let labelYOffset = 0;
    const labelX = margin.left + plotWidth + 10;

    last.values.forEach(d => {
        const h = lastYScale(d.count);
        const midY = margin.top + labelYOffset + h / 2;

        const typeTotal = typeTotals.get(d.type);
        const typePercent = (typeTotal / total) * 100;

        const labelWidth = 80;
        const labelHeight = 2 * fontSize + 4;

        // Background box
        svg.append("rect")
            .attr("x", labelX)
            .attr("y", midY - labelHeight / 2)
            .attr("width", labelWidth)
            .attr("height", labelHeight)
            .attr("fill", color(d.type))
            .attr("stroke-width", 0.5)
            .attr("rx", 3);

        // Label text
        // Multiline label using <tspan>
        const lineHeightEm = 1.2;  // line spacing in em units
        const verticalOffset = fontSize * (lineHeightEm ); // ~20% padding

        const textGroup = svg.append("text")
            .attr("x", labelX + labelWidth / 2)
            .attr("y", midY - verticalOffset) // Start slightly above midY to center two lines
            .attr("text-anchor", "middle")
            .attr("font-size", `${fontSize}px`)
            .attr("fill", "#000");

        textGroup.append("tspan")
            .attr("x", labelX + labelWidth / 2)
            .attr("dy", "1em")
            .text(d.type);

        textGroup.append("tspan")
            .attr("x", labelX + labelWidth / 2)
            .attr("dy", "1.2em")
            .attr("font-size", `${fontSize * 0.8}px`)
            .text(`(${typePercent.toFixed(0)}%)`);



        labelYOffset += h;
    });
};
