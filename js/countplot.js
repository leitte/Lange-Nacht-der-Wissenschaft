document.addEventListener("DOMContentLoaded", function () {
    // Check if DashboardData is available
    if (typeof DashboardData !== "undefined" && DashboardData.subscribe) {
        // Use live data
        DashboardData.subscribe(renderChart);
    } else {
        // Use fallback/synthetic data
        const data = Array.from({ length: 200 }, () => {
            const hour = 17 + Math.floor(Math.random() * 6);
            const minute = Math.floor(Math.random() * 60);
            const timestamp = new Date();
            timestamp.setHours(hour, minute, 0, 0);
            return { Timestamp: timestamp.toISOString() };
        });
        renderChart(data);
    }
});

function renderChart(users) {
    // Aggregate counts per hour
    const counts = d3.rollup(
        users,
        v => v.length,
        d => new Date(d.Timestamp).getHours()
    );

    const countArray = Array.from({ length: 6 }, (_, i) => {
        const hour = 17 + i;
        return { hour, count: counts.get(hour) || 0 };
    });

    // Setup SVG
    const svg = d3.select("#countplot"),
        [ , , width, height ] = svg.attr("viewBox").split(" ").map(Number),
        margin = { top: 0, right: 0, bottom: 0, left: 0 };

    svg.selectAll("*").remove();

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const x = d3.scaleBand()
        .domain(countArray.map(d => d.hour))
        .range([0, plotWidth])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(countArray, d => d.count)])
        .range([plotHeight, 0]);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    // Bars
    g.selectAll("rect")
        .data(countArray)
        .join("rect")
        .attr("x", d => x(d.hour))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => plotHeight - y(d.count))
        .attr("fill", colorSchemes[currentTheme]); // Use theme-based color

    // Hour labels
    g.selectAll("text")
        .data(countArray)
        .join("text")
        .attr("x", d => x(d.hour) + x.bandwidth() / 2)
        .attr("y", plotHeight - 4)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", textColors[currentTheme]) // Use theme-based text color
        .text(d => `${d.hour}h`);

    svg.datum(users); // Bind the data to the SVG for future updates
}
