document.addEventListener("DOMContentLoaded", function () {
    // 1. Simulate biased emoji data with timestamps
    const commonEmojis = ["😂", "❤️", "🔥", "👍", "🎉", "😎", "😭", "💯", "🤔"];
    const rareEmojis = ["✨", "👀", "😡", "🥺", "🙌", "🍕", "🧠", "🐱", "📈", "🫠"];
    const favorites = Array.from({ length: 300 }, () => {
        const isCommon = Math.random() < 0.9;
        const pool = isCommon ? commonEmojis : rareEmojis;
        const emoji = pool[Math.floor(Math.random() * pool.length)];
        const timestamp = new Date(Date.now() - Math.floor(Math.random() * 60 * 60 * 1000));
        return { emoji, timestamp };
    });

    // 2. Count frequencies and get top emojis
    const counts = d3.rollup(
        favorites,
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
    favorites
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .forEach(d => {
            if (!topEmojiSet.has(d.emoji) && !seen.has(d.emoji)) {
                recentOtherEmojis.push(d.emoji);
                seen.add(d.emoji);
            }
        });

    const displayedEmojis = recentOtherEmojis.slice(0, 5);
    const showEllipsis = recentOtherEmojis.length > 5;

    // 4. Group data, place "Other" bar last
    const grouped = d3.rollup(
        favorites,
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
        otherEntry.showEllipsis = showEllipsis;
        countArray.push(otherEntry); // always last
    }

    // 5. Layout
    const svg = d3.select("#emoji-countplot"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        margin = { top: 20, right: 40, bottom: 40, left: 40 };

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

    // 6. Bars
    g.selectAll("rect")
        .data(countArray)
        .join("rect")
        .attr("x", d => x(d.emoji))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => plotHeight - y(d.count))
        .attr("fill", "#87CEFA");

    // 7. Grid lines in front
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

    g.selectAll("text.grid-label")
        .data(yTicks)
        .join("text")
        .attr("x", plotWidth + 4)
        .attr("y", d => y(d))
        .attr("dominant-baseline", "middle")
        .attr("font-size", "13px")
        .attr("fill", "#666")
        .text(d => d);

    // 8. Emoji labels — stacked or single
    countArray.forEach(d => {
        const centerX = x(d.emoji) + x.bandwidth() / 2;

        if (d.emoji === "Other" && d.stackedEmojis) {
            const barTopY = y(d.count);
            const barHeight = plotHeight - barTopY;
            const showAbove = barHeight < plotHeight / 2;
            const startY = showAbove ? barTopY - 6 : barTopY + 18;
            const direction = showAbove ? -1 : 1;
            const lineHeight = 18;

            const stack = [...d.stackedEmojis];
            if (d.showEllipsis) stack.push("...");

            const stackToRender = showAbove ? [...stack].reverse() : stack;

            stackToRender.forEach((emoji, i) => {
                g.append("text")
                    .attr("x", centerX)
                    .attr("y", startY + direction * i * lineHeight)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "16px")
                    .text(emoji);
            });
        } else {
            // For normal bars: draw single emoji above the bar
            g.append("text")
                .attr("x", centerX)
                .attr("y", y(d.count) - 6)
                .attr("text-anchor", "middle")
                .attr("font-size", "20px")
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


});
