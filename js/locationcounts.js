document.addEventListener("DOMContentLoaded", function () {
  if (typeof DashboardData !== "undefined" && DashboardData.subscribe) {
    // Use live data
    DashboardData.subscribe(updateBarsWithSurveyData);
  } else {
    // Dummy data for placeCounts
    const data = [
      { name: "Universität", icon: "rptu.png", count: 80 },
      { name: "Bremerhof", icon: "bremerhof.png", count: 60 },
      { name: "Humbergturm", icon: "humbergturm.jpg", count: 50 },
      { name: "IKEA", icon: "ikea.png", count: 85 },
      { name: "Monte Mare", icon: "montemare.jpg", count: 30 },
      { name: "Gartenschau", icon: "gartenschau.png", count: 40 },
      { name: "Betze", icon: "fck.png", count: 25 },
      { name: "Kammgarn", icon: "kammgarn.png", count: 20 },
      { name: "Pfalztheater", icon: "pfalztheater.png", count: 15 },
      { name: "42kaiserslautern", icon: "42kaiserslautern.svg", count: 5 }
    ];
    total = 100;
    drawBars([data, total]);
  }
});

function updateBarsWithSurveyData(data) {
  // Define the locations with their icons
  const locations = [
    { name: "Universität", icon: "rptu.png", count: 0 },
    { name: "Bremerhof", icon: "bremerhof.png", count: 0 },
    { name: "Humbergturm", icon: "humbergturm.jpg", count: 0 },
    { name: "IKEA", icon: "ikea.png", count: 0 },
    { name: "Monte Mare", icon: "montemare.jpg", count: 0 },
    { name: "Gartenschau", icon: "gartenschau.png", count: 0 },
    { name: "Betze", icon: "fck.png", count: 0 },
    { name: "Kammgarn", icon: "kammgarn.png", count: 0 },
    { name: "Pfalztheater", icon: "pfalztheater.png", count: 0 },
    { name: "42kaiserslautern", icon: "42kaiserslautern.svg", count: 0 }
  ];

  // Loop through the data and count the occurrences of each place
  let total = 0;
  data.forEach(row => {
    const places = row["Welche Orte in Kaiserslautern hast du schon besucht?"].trim().split(", ");

    if (places[0] !== "") {
      total += 1;
      places.forEach(place => {
        // Find the matching location by name
        const location = locations.find(loc => loc.name === place);
        if (location) {
          location.count += 1; // Increment the count for the matching location
        }
      });
    }
  });

  drawBars([locations, total]);
}

function drawBars(data) {
  const counts = data[0];
  const total = data[1];

  // Add percentage field to each count
  counts.forEach(d => {
    d.percentage = ((d.count / total) * 100).toFixed(1); // Calculate percentage and round to 1 decimal place
  });

  // Sort locations by descending visit count
  counts.sort((a, b) => b.count - a.count);

  // 5. Layout
  var svg = d3.select("#location-countplot"),
    [, , width, height] = svg.attr("viewBox").split(" ").map(Number),
    margin = { top: 0, right: 20, bottom: 15, left: 10 };

  svg.selectAll("*").remove();

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const x = d3.scaleLinear()
    .domain([0, 100])
    .nice()
    .range([0, plotWidth]);

  const y = d3.scaleBand()
    .domain(counts.map(d => d.name))
    .range([0, plotHeight])
    .padding(0.2);

    const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 6. Bars
  g.selectAll("rect.background")
    .data(counts)
    .join("rect")
    .attr("class", "background")
    .attr("x", 0) // Background bars start at x = 0
    .attr("y", d => y(d.name)) // Position bars based on name
    .attr("width", plotWidth) // Full width of the plot
    .attr("height", y.bandwidth()) // Bar height based on y scale
    .attr("fill", backgroundColors[currentTheme]); // Light gray color

  g.selectAll("rect.bar")
    .data(counts)
    .join("rect")
    .attr("class", "bar")
    .attr("x", 0) // Bars start at x = 0
    .attr("y", d => y(d.name)) // Position bars based on name
    .attr("width", d => x(d.percentage)) // Bar length based on count
    .attr("height", y.bandwidth()) // Bar height based on y scale
    .attr("fill", colorSchemes[currentTheme]) // Use theme-based color;

  // 7. Grid lines in front
  const xTicks = x.ticks(4);
  g.selectAll("line.grid")
    .data(xTicks)
    .join("line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", 0)
    .attr("y2", plotHeight)
    .attr("stroke", textColors[currentTheme]) // Use theme-based grid color
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "2,2");

  g.selectAll("text.grid-label")
    .data(xTicks)
    .join("text")
    .attr("x", d => x(d))
    .attr("y", plotHeight + 10)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", textColors[currentTheme]) // Use theme-based text color
    .text(d => `${d}%`);

  // 8. Location logos
  counts.forEach(d => {
    const centerY = y(d.name) + y.bandwidth() / 2; // Center of the bar
    const imageSize = y.bandwidth() * 0.8; // Adjust image size relative to bar height

    g.append("circle")
      .attr("cx", x(d.percentage)) // Position circle slightly to the right of the bar
      .attr("cy", centerY)
      .attr("r", imageSize * 0.6) // Circle radius
      .attr("fill", "#fff") // White background for the logo
      .attr("stroke", "none") // no border

    g.append("image")
      .attr("x", x(d.percentage) - imageSize / 2) // Position image slightly to the right of the bar
      .attr("y", centerY - imageSize / 2) // Center the image vertically
      .attr("width", imageSize) // Set image width
      .attr("height", imageSize) // Set image height
      .attr("href", `static/logos/${d.icon}`); // Path to the logo image

    g.append("circle")
      .attr("cx", x(d.percentage)) // Position circle slightly to the right of the bar
      .attr("cy", centerY)
      .attr("r", imageSize * 0.65) // Circle radius
      .attr("fill", "transparent") // Transparent background for the logo
      .attr("stroke", colorSchemes[currentTheme]) // Light gray border
      .attr("stroke-width", 4);
  });

  svg.datum(data); // Bind the data to the SVG for future updates
}


