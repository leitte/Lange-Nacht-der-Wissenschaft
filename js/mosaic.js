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
          margin = {top: 20, right: 10, bottom: 40, left: 110};
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
  
    // Draw mosaic rectangles
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
      
        // Draw rectangle with outline
        colGroup.append("rect")
                .attr("x", 0)
                .attr("y", yOffset)
                .attr("width", colWidth)
                .attr("height", h)
                .attr("fill", color(d.type))
                .attr("stroke", "#333")       // outline
                .attr("stroke-width", 0.5);   // thin border
      
        // Add percent label in center
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

      // Emoji mapping
      const emojiMap = {
        "beach": "🏖️",
        "mountains": "🏔️",
        "city": "🏙️",
        "at home": "🏡"
    };
    
    // Add top-center total % for the bar
    const placePercent = (place.total / total) * 100;
    plotGroup.append("text")
            .attr("x", xStart + colWidth / 2)
            .attr("y", -5) // above the plot area
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "#333")
            .text(`${emojiMap[place.place] || ""} ${placePercent.toFixed(0)}%`);

      
  

    
    plotGroup.append("text")
            .attr("x", xStart + colWidth / 2)
            .attr("y", plotHeight + 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .text(`${place.place}`);
  
  
      xOffset += place.total;
    });
  
    // Add Y-axis category labels (aligned to the first column)
    const first = placeTotals[0];
    const firstYScale = d3.scaleLinear()
                          .domain([0, d3.sum(first.values, d => d.count)])
                          .range([0, plotHeight]);
  
    let labelYOffset = 0;
    // Compute total per type across all places
    const typeTotals = d3.rollup(
        data,
        v => d3.sum(v, d => d.count),
        d => d.type
    );
    
    labelYOffset = 0;
    first.values.forEach(d => {
        const h = firstYScale(d.count);
        const midY = margin.top + labelYOffset + h / 2;
    
        const textPadding = 4;
        const labelWidth = 100;
        const labelHeight = fontSize + textPadding;
    
        const typeTotal = typeTotals.get(d.type);
        const typePercent = (typeTotal / total) * 100;
    
        const labelText = `${d.type} (${typePercent.toFixed(0)}%)`;
    
        // Background box
        svg.append("rect")
            .attr("x", margin.left - labelWidth - 10)
            .attr("y", midY - labelHeight / 2)
            .attr("width", labelWidth)
            .attr("height", labelHeight)
            .attr("fill", color(d.type))
            // .attr("stroke", "#333")
            .attr("stroke-width", 0.5)
            .attr("rx", 3); // rounded corners
    
        // Label text with percent
        svg.append("text")
            .attr("x", margin.left - labelWidth / 2 - 10)
            .attr("y", midY)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", `${fontSize}px`)
            .attr("fill", "#000")
            .text(labelText);
    
        labelYOffset += h;
    });
  
  
      
  });
  