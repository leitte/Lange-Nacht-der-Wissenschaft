document.addEventListener("DOMContentLoaded", function () {
  if (typeof DashboardData !== "undefined" && DashboardData.subscribe) {
    // Use live data
    DashboardData.subscribe(updateLollisWithSurveyData);
  } else {
    console.log("No live data available. Using simulated data.");
    // Simulate biased emoji data with timestamps
    const commonEmojis = ["😂", "❤️", "🔥", "👍", "🎉", "😎", "😭", "💯", "🤔"];
    const rareEmojis = ["✨", "👀", "😡", "🥺", "🙌", "🍕", "🧠", "🐱", "📈", "🫠"];
    const emojiTimestampPairs = Array.from({ length: 300 }, () => {
      const isCommon = Math.random() < 0.9;
      const pool = isCommon ? commonEmojis : rareEmojis;
      const emoji = pool[Math.floor(Math.random() * pool.length)];
      const timestamp = new Date(Date.now() - Math.floor(Math.random() * 60 * 60 * 1000));
      return { emoji, timestamp };
    });

    drawLollis(emojiTimestampPairs);
  }
});

function updateLollisWithSurveyData(data) {
  // Regular expression to check if a string is an emoji
  const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/u;

  // Extract an array of emoji-timestamp pairs
  const emojiTimestampPairs = data
    .filter(row => row["Lieblingsemoji?"] && row["Timestamp"]) // Ensure both fields exist
    .map(row => ({
      emoji: row["Lieblingsemoji?"],
      timestamp: new Date(row["Timestamp"]) // Convert timestamp to a Date object
    }))
    .filter(pair => emojiRegex.test(pair.emoji)); // Filter out non-emoji entries

  drawLollis(emojiTimestampPairs);
}

function drawLollis(data) {

  // 2. Count frequencies and get top emojis
  const counts = d3.rollup(
    data,
    v => v.length,
    d => d.emoji
  );

  const fullSorted = Array.from(counts, ([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => d3.descending(a.count, b.count));

  const TOP_N = 10;
  const topEmojis = fullSorted.slice(0, TOP_N).map(d => d.emoji);
  const topEmojiSet = new Set(topEmojis);

  // 3. Get last 5 unique non-top emojis by timestamp
  const recentOtherEmojis = [];
  const seen = new Set();
  data
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .forEach(d => {
      if (!topEmojiSet.has(d.emoji) && !seen.has(d.emoji)) {
        recentOtherEmojis.push(d.emoji);
        seen.add(d.emoji);
      }
    });
  const displayedEmojis = recentOtherEmojis.slice(0, 5);

  // 4. Group data, place "Other" bar last
  const grouped = d3.rollup(
    data,
    v => v.length,
    d => topEmojiSet.has(d.emoji) ? d.emoji : "Other"
  );

  let countArray = Array.from(grouped, ([emoji, count]) => ({ emoji, count }));
  const otherEntry = countArray.find(d => d.emoji === "Other");

  countArray = countArray
    .filter(d => d.emoji !== "Other")
    .sort((a, b) => d3.descending(a.count, b.count));

  if (otherEntry) {
    otherEntry.stackedEmojis = displayedEmojis;
    countArray.push(otherEntry); // always last
  }

  // 5. Layout
  const svg = d3.select("#emoji-countplot"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    margin = { top: 32, right: 35, bottom: 37, left: 0 };

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const x = d3.scaleBand()
    .domain(countArray.map(d => d.emoji))
    .range([0, plotWidth])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(countArray, d => d.count)])
    .nice()
    .range([plotHeight, 0]);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 6.1 Lollipop stems (lines)
  g.selectAll("line.stem")
    .data(countArray)
    .join("line")
    .attr("class", "stem")
    .attr("x1", d => x(d.emoji) + x.bandwidth() / 2)
    .attr("x2", d => x(d.emoji) + x.bandwidth() / 2)
    .attr("y1", y(0)) // Start at the bottom (y = 0)
    .attr("y2", d => y(d.count)) // End at the count value
    .attr("stroke", (d, i) => {
      if (i === 0) return "#FFD700"; // Gold for the first stem
      if (i === 1) return "#C0C0C0"; // Silver for the second stem
      if (i === 2) return "#CD7F32"; // Bronze for the third stem
      return "#E0E0E0"; // Default color for other stems
    })
    .attr("stroke-width", (d, i) => {
      if (i < 3) return 10;
      if (i === 10) return 12;
      return 8; // Default size for other stems
    }); // Line thickness

  // 6.2 Lollipop heads (circles)
  g.selectAll("circle.lollipop")
    .data(countArray)
    .join("circle")
    .attr("class", "lollipop")
    .attr("cx", d => x(d.emoji) + x.bandwidth() / 2)
    .attr("cy", (d, i) => (i === countArray.length - 1 ? y(d.count) - 3 : y(d.count) - 10)) // Position at the count value
    .attr("r", (d, i) => (i === countArray.length - 1 ? 35 : 18)) // Radius of the circle
    .attr("fill", "white") // Transparent fill
    .attr("stroke", (d, i) => {
      if (i === 0) return "#FFD700"; // Gold for the first stem
      if (i === 1) return "#C0C0C0"; // Silver for the second stem
      if (i === 2) return "#CD7F32"; // Bronze for the third stem
      return "#abd9ec"; // Default color for other stems
    })
    .attr("stroke-width", (d, i) => {
      if (i === 10) return 9;
      return 6;
    }); // Border thickness

  // 7. Y-axis ticks
  const yTicks = y.ticks(4);
  g.selectAll("text.grid-label")
    .data(yTicks)
    .join("text")
    .attr("x", plotWidth + 18)
    .attr("y", d => y(d))
    .attr("dominant-baseline", "middle")
    .attr("font-size", "13px")
    .attr("fill", "#666")
    .text(d => d);

  // 8. Emoji labels — stacked or single
  countArray.forEach(d => {
    const centerX = x(d.emoji) + x.bandwidth() / 2;

    if (d.emoji === "Other" && d.stackedEmojis) {
      const centerX = x(d.emoji) + x.bandwidth() / 2; // Center of the lollipop
      const centerY = y(d.count); // Center of the circle
      const radius = 35; // Radius of the big circle
      const emojiRadius = 18; // Radius for emoji placement

      // Calculate positions for emojis in a circular layout
      const angleStep = (2 * Math.PI) / d.stackedEmojis.length; // Angle between emojis
      const nodes = d.stackedEmojis.map((emoji, i) => ({
        emoji,
        x: Math.cos(i * angleStep) * emojiRadius, // X position
        y: Math.sin(i * angleStep) * emojiRadius  // Y position
      }));

      // Append a group for the emojis
      const emojiGroup = g.append("g")
        .attr("transform", `translate(${centerX},${centerY})`); // Position at the center of the circle

      // Append emojis as text elements
      emojiGroup.selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "20px")
        .text(d => d.emoji);
    } else {
      // For normal bars: draw single emoji above the bar
      g.append("text")
        .attr("x", centerX)
        .attr("y", y(d.count))
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .text(d.emoji);
    }
  });

  // 9. X-axis labels: 1–10 for top emojis, 🔥 for "Other"
  countArray.forEach((d, i) => {
    const centerX = x(d.emoji) + x.bandwidth() / 2;
    const labelY = plotHeight + 20;

    const labelText = d.emoji === "Other" ? "🔥" : (i + 1);  // number 1–10 or trending emoji

    g.append("text")
      .attr("x", centerX)
      .attr("y", labelY)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("fill", "#333")
      .text(labelText);
  });
};