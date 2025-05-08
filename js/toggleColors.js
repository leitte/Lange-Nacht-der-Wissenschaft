let currentTheme = "light"; // Default theme
let isDark = false; // Flag to track if dark mode is enabled

// Define color schemes for light and dark themes
const colorSchemes = {
    light: "#abd9ec", // light blue
    dark: "#87CEFA"  // dark teal
};

const backgroundColors = {
    light: "#f0f0f0", // light gray
    dark: "#f0f0f0"      // dark gray
};

const textColors = {
    light: "#333", // dark gray
    dark: "#333"   // white
};

const mosaicColors = {
    light: ["#abd9ec", "#B7CF9F", "#f9e055", "#FFB6C1"],
    dark: ["#87CEFA", "#90EE90", "#FFD700", "#FFB6C1"]
};

const juiceColors = {
    light: [
        { waveColor: "#94550b", waveTextColor: "#F3F3F3" },
        { waveColor: "#B7CF9F", waveTextColor: "#333333" },
        { waveColor: "#90EE90", waveTextColor: "#333333" },
        { waveColor: "#f9e055", waveTextColor: "#333333" }
    ],
    dark: [
        { waveColor: "#5a2e0a", waveTextColor: "#F3F3F3" },
        { waveColor: "#6b7a4d", waveTextColor: "#F3F3F3" },
        { waveColor: "#1b5e20", waveTextColor: "#F3F3F3" },
        { waveColor: "#b3541e", waveTextColor: "#F3F3F3" }
    ]
};

document.getElementById("theme-toggle").addEventListener("click", () => {
    currentTheme = currentTheme === "light" ? "dark" : "light";

    const mosaic_data = d3.select("#mosaic-plot").datum(); // Retrieve the current data bound to the SVG
    if (mosaic_data) {
        renderMosaicPlot(mosaic_data); // Re-render the plot with the new theme
    }

    const count_data = d3.select("#countplot").datum(); // Retrieve the current data bound to the SVG
    if (count_data) {
        renderChart(count_data); // Re-render the chart with the new theme
    }

    const location_data = d3.select("#location-countplot").datum(); // Retrieve the current data bound to the SVG
    if (location_data) {
        drawBars(location_data); // Re-render the bars with the new theme
    }

    const emoji_data = d3.select("#emoji-countplot").datum(); // Retrieve the current data bound to the SVG
    if (emoji_data) {
        drawLollis(emoji_data); // Re-render the lollipop chart with the new theme
    }

    const map_data = d3.select("#map").datum(); // Retrieve the current data bound to the map
    if (map_data) {
        drawMap(map_data); // Re-render the map with the new theme
    }
});