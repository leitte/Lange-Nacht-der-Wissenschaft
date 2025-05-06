document.addEventListener("DOMContentLoaded", function () {
    // 1. Simulate emoji data with bias toward common emojis
    const commonEmojis = ["😂", "❤️", "🔥", "👍", "🎉", "😎", "😭", "💯", "🤔"];
    const rareEmojis = ["✨", "👀", "😡", "🥺", "🙌", "🍕", "🧠", "🐱", "📈", "🫠"];
  
    const favorites = Array.from({ length: 300 }, () => {
      const isCommon = Math.random() < 0.85; // 85% common, 15% rare
      const pool = isCommon ? commonEmojis : rareEmojis;
      const emoji = pool[Math.floor(Math.random() * pool.length)];
      return { emoji };
    });
  
    // 2. Count emoji frequencies
    const counts = d3.rollup(
      favorites,
      v => v.length,
      d => d.emoji
    );
  
    const fullSorted = Array.from(counts, ([emoji, count]) => ({ emoji, count }))
                            .sort((a, b) => d3.descending(a.count, b.count));
  
    // 3. Slice top N and group rest into "Other"
    const TOP_N = 9;
    const topEmojis = fullSorted.slice(0, TOP_N);
    const others = fullSorted.slice(TOP_N);
    const otherTotal = d3.sum(others, d => d.count);
    const otherEmojis = others.slice(-5).map(d => d.emoji); // show last 5
  
    if (otherTotal > 0) {
      topEmojis.push({
        emoji: "Other",
        count: otherTotal,
        stackedEmojis: otherEmojis
      });
    }
  
    // 4. Setup SVG and scales
    const svg = d3.select("#emoji-countplot"),
          width = +svg.attr("width"),
          height = +svg.attr("height"),
          margin = { top: 60, right: 40, bottom: 40, left: 40 };
  
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
  
    const x = d3.scaleBand()
                .domain(topEmojis.map(d => d.emoji))
                .range([0, plotWidth])
                .padding(0.2);
  
    const maxCount = d3.max(topEmojis.filter(d => d.emoji !== "Other"), d => d.count);
    const y = d3.scaleLinear()
                .domain([0, maxCount])
                .nice()
                .range([plotHeight, 0]);
  
    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // 5. Draw bars
    g.selectAll("rect")
     .data(topEmojis)
     .join("rect")
       .attr("x", d => x(d.emoji))
       .attr("y", d => y(d.count))
       .attr("width", x.bandwidth())
       .attr("height", d => plotHeight - y(d.count))
       .attr("fill", "#87CEFA");
  
    // 6. Grid lines in front
    const yTicks = y.ticks(4);
    g.selectAll("line.grid")
     .data(yTicks)
     .join("line")
       .attr("x1", 0)
       .attr("x2", plotWidth)
       .attr("y1", d => y(d))
       .attr("y2", d => y(d))
       .attr("stroke", "white")
       .attr("stroke-width", 1)
       .attr("stroke-dasharray", "2,2");
  
    // Grid value labels
    g.selectAll("text.grid-label")
     .data(yTicks)
     .join("text")
       .attr("x", plotWidth + 4)
       .attr("y", d => y(d))
       .attr("dominant-baseline", "middle")
       .attr("font-size", "10px")
       .attr("fill", "#666")
       .text(d => d);
  
    // 7. Emoji labels (normal or stacked for "Other")
    topEmojis.forEach(d => {
      const centerX = x(d.emoji) + x.bandwidth() / 2;
      if (d.emoji === "Other") {
        const baseY = y(0);
        const lineHeight = 18;
        d.stackedEmojis.forEach((emoji, i) => {
          g.append("text")
            .attr("x", centerX)
            .attr("y", baseY - (i + 1) * lineHeight)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .text(emoji);
        });
      } else {
        g.append("text")
          .attr("x", centerX)
          .attr("y", y(d.count) - 6)
          .attr("text-anchor", "middle")
          .attr("font-size", "20px")
          .text(d.emoji);
      }
    });
  });
  