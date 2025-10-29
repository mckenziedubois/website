const markerColors = {
  hotel: 'rgba(218, 140, 95, 1)',
  restaurant: 'hsla(293, 64%, 65%, 1)',
  activity: 'hsla(134, 82%, 13%, 1.00)',
  default: 'rgba(107, 191, 255, 1)'
};

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

      // Add markers with popups (if any)
    if (config.markers && Array.isArray(config.markers)) {
    config.markers.forEach(marker => {
        addColoredMarker(map, marker);
    });
    }

    } catch (err) {
      console.error(`Error loading map for ${div.id}:`, err);
    }
  }
};

// Define a helper to create colored circle markers
function addColoredMarker(map, marker) {
    
  var color = markerColors[marker.pintype] || markerColors.default;

  const circleMarker = L.circleMarker(marker.coords, {
    radius: 6,
    fillColor: color,
    color: color,      // optional outline
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  }).addTo(map);

  if (marker.message) {
    L.popup({ autoClose: false, closeOnClick: false })
        .setLatLng(marker.coords)
        .setContent(marker.message)
        .openOn(map);
    }

}
