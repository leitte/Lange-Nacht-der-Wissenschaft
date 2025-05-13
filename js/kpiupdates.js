document.addEventListener("DOMContentLoaded", function () {
  function updateKPIs(data) {
    const validRows = data.filter(d => d.Timestamp && d.Timestamp.trim() !== "");
    const total = validRows.length;

    // --- 👇 New Emoji Frequency Logic ---
    const emojis = validRows
      .map(d => d["Lieblingsemoji?"])
      .filter(e => e && e.trim() !== "");

    const frequency = {};
    emojis.forEach(emoji => {
      frequency[emoji] = (frequency[emoji] || 0) + 1;
    });

    // Find the most frequent emoji
    let mostFrequentEmoji = null;
    let maxCount = 0;

    for (const [emoji, count] of Object.entries(frequency)) {
      if (count > maxCount) {
        mostFrequentEmoji = emoji;
        maxCount = count;
      }
    }

    // --- 👇 Most Frequent Location Logic ---
    const locations = [];

    data.forEach(row => {
      const cell = row["Welche Orte in Kaiserslautern hast du schon besucht?"];
      if (cell && cell.trim() !== "") {
        const items = cell.split(",").map(loc => loc.trim()).filter(Boolean);
        locations.push(...items);
      }
    });

    const locationCounts = {};
    locations.forEach(loc => {
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    let mostFrequentLocation = null;
    let locationMaxCount = 0;

    for (const [loc, count] of Object.entries(locationCounts)) {
      if (count > locationMaxCount) {
        mostFrequentLocation = loc;
        locationMaxCount = count;
      }
    }

    document.getElementById("kpi-total").textContent = total;
    document.getElementById("kpi-emoji-count").textContent = maxCount;
    document.getElementById("kpi-emoji").textContent = mostFrequentEmoji;
    document.getElementById("kpi-location-count").textContent = locationMaxCount;
    document.getElementById("kpi-location").textContent = mostFrequentLocation;
  }
  function animateClockHand() {
    const clockHand = document.getElementById("clock-hand");
    let angle = 0; // Start angle

    const updateInterval = 15000; 
    const pointerInteval = 1000;

    setInterval(() => {
      angle = (angle + (360*pointerInteval/updateInterval)) % 360;
      clockHand.setAttribute("transform", `rotate(${angle} 50 50)`); // Rotate around the clock's center
    }, pointerInteval);
  }

  if (typeof DashboardData !== "undefined" && DashboardData.subscribe) {
    DashboardData.subscribe(updateKPIs);
    // Start the clock animation
    animateClockHand();
  }
});
