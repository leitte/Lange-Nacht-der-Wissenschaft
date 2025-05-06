document.addEventListener("DOMContentLoaded", function () {
    // Simulate hourly timestamps between 17:00 and 23:00
    const users = Array.from({ length: 200 }, () => {
      const hour = 17 + Math.floor(Math.random() * 6);
      const minute = Math.floor(Math.random() * 60);
      const timestamp = new Date();
      timestamp.setHours(hour, minute, 0, 0);
      return { timestamp: timestamp.toISOString() };
    });
  
    // Aggregate counts per hour
    const counts = d3.rollup(
      users,
      v => v.length,
      d => new Date(d.timestamp).getHours()
    );
  
    const countArray = Array.from({ length: 6 }, (_, i) => {
      const hour = 17 + i;
      return { hour, count: counts.get(hour) || 0 };
    });
  
    // Setup SVG
    const svg = d3.select("#countplot"),
          width = +svg.attr("width"),
          height = +svg.attr("height"),
          margin = { top: 5, right: 5, bottom: 5, left: 5 };
  
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
  
    // Light blue bars
    g.selectAll("rect")
     .data(countArray)
     .join("rect")
       .attr("x", d => x(d.hour))
       .attr("y", d => y(d.count))
       .attr("width", x.bandwidth())
       .attr("height", d => plotHeight - y(d.count))
       .attr("fill", "#87CEFA"); // light blue (relaxed)
  
    // Dark bottom-aligned hour labels
    g.selectAll("text")
     .data(countArray)
     .join("text")
       .attr("x", d => x(d.hour) + x.bandwidth() / 2)
       .attr("y", plotHeight - 4)
       .attr("text-anchor", "middle")
       .attr("font-size", "10px")
       .attr("fill", "#333") // dark gray or use "#000" for black
       .text(d => `${d.hour}h`);
  });
  