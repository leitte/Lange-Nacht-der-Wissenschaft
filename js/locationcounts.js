document.addEventListener("DOMContentLoaded", function () {
  // 1. Simulate dummy data for location visits
  const locations = [
    { name: "Universität", icon: "rptu.png" },
    { name: "Bremerhof", icon: "bremerhof.png" },
    { name: "Humbergturm", icon: "humbergturm.jpg" },
    { name: "IKEA", icon: "ikea.png" },
    { name: "Monte Mare", icon: "montemare.jpg" },
    { name: "Gartenschau", icon: "gartenschau.png" },
    { name: "Betze", icon: "fck.png" },
    { name: "Kammgarn", icon: "kammgarn.png" },
    { name: "Pfalztheater", icon: "pfalztheater.png" },
    { name: "42kaiserslautern", icon: "42kaiserslautern.svg" }
  ];

  const countArray = locations.map(location => ({
    name: location.name,
    icon: location.icon,
    count: Math.floor(Math.random() * 100) + 1 // Random visit count between 1 and 100
  }));

  // Sort locations by descending visit count
  countArray.sort((a, b) => d3.descending(a.count, b.count));

  // 5. Layout
  const svg = d3.select("#location-countplot"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    margin = { top: 0, right: 30, bottom: 15, left: 30 };

  console.log(svg.attr("width"), svg.attr("height"));

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const x = d3.scaleLinear()
    // .domain([0, d3.max(countArray, d => d.count)])
    .domain([0, 100])
    .nice()
    .range([0, plotWidth]);

  const y = d3.scaleBand()
    .domain(countArray.map(d => d.name))
    .range([0, plotHeight])
    .padding(0.2);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 6. Bars
  g.selectAll("rect")
    .data(countArray)
    .join("rect")
    .attr("x", 0) // Bars start at x = 0
    .attr("y", d => y(d.name)) // Position bars based on name
    .attr("width", d => x(d.count)) // Bar length based on count
    .attr("height", y.bandwidth()) // Bar height based on y scale
    .attr("fill", "#abd9ec");

  // 7. Grid lines in front
  const xTicks = x.ticks(4);
  g.selectAll("line.grid")
    .data(xTicks)
    .join("line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", 0)
    .attr("y2", plotHeight)
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "2,2");

  g.selectAll("text.grid-label")
    .data(xTicks)
    .join("text")
    .attr("x", d => x(d))
    .attr("y", plotHeight + 10)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("fill", "#666")
    .text(d => `${d}%`);

  // 8. Location logos
  countArray.forEach(d => {
    const centerY = y(d.name) + y.bandwidth() / 2; // Center of the bar
    const imageSize = y.bandwidth() * 0.8; // Adjust image size relative to bar height

    g.append("image")
      .attr("x", x(d.count) + 5) // Position image slightly to the right of the bar
      .attr("y", centerY - imageSize / 2) // Center the image vertically
      .attr("width", imageSize) // Set image width
      .attr("height", imageSize) // Set image height
      .attr("href", `static/logos/${d.icon}`); // Path to the logo image
  });
});
