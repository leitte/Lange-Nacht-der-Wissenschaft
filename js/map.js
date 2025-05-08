document.addEventListener("DOMContentLoaded", function () {
  if (typeof DashboardData !== "undefined" && DashboardData.subscribe) {
    // Use live data
    DashboardData.subscribe(updateMapWithSurveyData);
  } else {
    // Dummy data for placeCounts
    const data = {
      "Universität": 50,
      "Bremerhof": 30,
      "Humbergturm": 20,
      "IKEA": 40,
      "Monte Mare": 25,
      "Gartenschau": 35,
      "Betze": 45,
      "Kammgarn": 15,
      "Pfalztheater": 10,
      "42kaiserslautern": 60
    };
    total = 80;
    drawMap([data, total]);
  }
});

function updateMapWithSurveyData(data) {
  const counts = {};
  var total = 0;
  // Loop through the data and count the occurrences of each place
  data.forEach(row => {
    const places = row["Welche Orte in Kaiserslautern hast du schon besucht?"].trim().split(", ");

    if (places[0] != "") {
      total += 1;
      places.forEach(place => {
        const key = `${place}`;
        counts[key] = (counts[key] || 0) + 1;
      })
    }
  });

  drawMap([counts, total]);
}

function drawMap(data) {
  const counts = data[0];
  const total = data[1];
  const firstdraw = Object.prototype.toString.call(map) != "[object Object]";

  // Create a map instance
  if (firstdraw) {
    map = L.map('map', { attributionControl: false, zoomControl: false }).setView([49.437, 7.757], 13);
  }

  // Create a map background
  if (firstdraw) {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    // L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(map); // bunt mit labels
    // L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map); // bunt ohne labels
    // L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', { ext: 'jpg' }).addTo(map); // satellite
    // L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd' }).addTo(map); // weiß ohne labels
    // L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png').addTo(map); // gray with labels
  }

  // Define locations
  const glyphsize = 100;
  const donutSize = 75;
  const locations = [
    { name: "Universität", coords: [49.424011, 7.752635], icon: "rptu_g.svg", anchor: [0.5, 1], shift: [0, -75] },
    { name: "Bremerhof", coords: [49.416823, 7.763354], icon: "bremerhof_g.svg", anchor: [0.5, 1], shift: [0, -75] },
    { name: "Humbergturm", coords: [49.415029, 7.779889], icon: "humberg_g.svg", anchor: [0.5, 1], shift: [0, -75] },
    { name: "IKEA", coords: [49.440440, 7.701132], icon: "ikea_g.svg", anchor: [0.5, 0.95], shift: [0, -70] },
    { name: "Monte Mare", coords: [49.453559, 7.810702], icon: "monte_g.svg", anchor: [0.5, 0.05], shift: [0, 70] },
    { name: "Gartenschau", coords: [49.448448, 7.749647], icon: "lgs_g.svg", anchor: [0.95, 0.5], shift: [-70, 0] },
    { name: "Betze", coords: [49.434652, 7.776432], icon: "fck_g.svg", anchor: [0.05, 0.5], shift: [71, 0] },
    { name: "Kammgarn", coords: [49.447248, 7.756385], icon: "kammgarn_g.svg", anchor: [0.5, 0.95], shift: [0, -70] },
    { name: "Pfalztheater", coords: [49.446875, 7.769721], icon: "theater_g.svg", anchor: [0.5, 0.95], shift: [0, -70] },
    { name: "42kaiserslautern", coords: [49.440389, 7.771076], icon: "42_g2.svg", anchor: [0.05, 0.95], shift: [71, -70] }
  ];

  if (!firstdraw) {
    // Remove all markers from the map
    map.eachLayer(function (layer) {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
  }

  // Add a marker for each location
  locations.forEach(({ name, coords, icon, shift, anchor }) => {

    // draw logo
    const logo = L.marker(coords, {
      icon: L.icon({
        iconUrl: `static/${icon}`, // Path to the image file
        iconSize: [glyphsize, glyphsize], // Size of the icon
        iconAnchor: [glyphsize * anchor[0], glyphsize * anchor[1]] // Anchor point of the icon
      })
    }).addTo(map);

    // calculate donut data
    const count = counts[name] || 0; // Get the count for the location
    const percentage = (count / total) * 100; // Calculate the percentage
    const dashArray = `${percentage} ${100 - percentage}`; // Set the stroke-dasharray

    // draw donut
    const donut = L.marker(coords, {
      icon: L.divIcon({
        className: 'donut-icon',
        html: `
              <svg width="${donutSize}" height="${donutSize}" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" style="border: none; transform: translate(${shift[0]}px, ${shift[1]}px);">
                  <circle cx="19" cy="19" r="14.9155" fill="transparent" stroke="#fff" stroke-width="6.5"></circle>
                  <circle cx="19" cy="19" r="18.3" fill="transparent" stroke="#DCDBDC" stroke-width="0.5"></circle>
                  <circle cx="19" cy="19" r="14.9155" fill="transparent" stroke="#9ed5e8" stroke-width="7" stroke-dasharray="${dashArray}" stroke-dashoffset="30"></circle>
              </svg>
          `,
        iconSize: [donutSize, donutSize],
        iconAnchor: [donutSize / 2, donutSize / 2]
      })
    }).addTo(map);

    // Remove the role="button" attribute
    const logoElement = logo.getElement();
    if (logoElement) {
      logoElement.removeAttribute("role");
    }
    const donutElement = donut.getElement();
    if (donutElement) {
      donutElement.removeAttribute("role");
    }
  });
}

