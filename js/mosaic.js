document.addEventListener("DOMContentLoaded", function () {
    const data = [
        { place: "beach", type: "relaxed", count: 30 },
        { place: "beach", type: "active", count: 10 },
        { place: "beach", type: "culture", count: 5 },
        { place: "mountains", type: "relaxed", count: 5 },
        { place: "mountains", type: "active", count: 20 },
        { place: "mountains", type: "culture", count: 10 },
        { place: "city", type: "relaxed", count: 10 },
        { place: "city", type: "active", count: 5 },
        { place: "city", type: "culture", count: 25 },
        { place: "at home", type: "relaxed", count: 15 },
        { place: "at home", type: "active", count: 5 },
        { place: "at home", type: "culture", count: 5 },
    ];

    const svg = d3.select("#mosaic-plot"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        margin = { top: 2, right: 110, bottom: 60, left: 2 };

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

    const color = d3.scaleOrdinal()
        .domain(["relaxed", "active", "culture"])
        .range(["#87CEFA", "#90EE90", "#FFD700"]);

    const plotGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let xOffset = 0;

    // Emoji mapping
    const emojiMap = {
        "beach": "🏖️",
        "mountains": "🏔️",
        "city": "🏙️",
        "at home": "🏡"
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
        const labelText = `${d.type} (${typePercent.toFixed(0)}%)`;

        const labelWidth = 100;
        const labelHeight = fontSize + 4;

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
        svg.append("text")
            .attr("x", labelX + labelWidth / 2)
            .attr("y", midY)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", `${fontSize}px`)
            .attr("fill", "#000")
            .text(labelText);

        labelYOffset += h;
    });
});
