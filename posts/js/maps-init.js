window.initMaps = async function() {
  const mapDivs = document.querySelectorAll(".leaflet-map");

  for (const div of mapDivs) {
    try {

      // Load JSON config from the /maps folder
      const res = await fetch(`./maps/${div.id}.json`);
      const data = await res.json();

      // Extract config directly by city name
      const config = data[div.id];
      if (!config || !config.center || !config.zoom) {
        console.error(`Invalid config format for ${div.id}`);
        continue;
      }

      // Initialize the map
      const map = L.map(div.id).setView(config.center, config.zoom);

      // Add OpenStreetMap tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Optional: add a small marker at the center
      L.marker(config.center).addTo(map);

    } catch (err) {
      console.error(`Error loading map for ${div.id}:`, err);
    }
  }
};
