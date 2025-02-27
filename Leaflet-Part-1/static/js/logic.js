// Creating the map object
let myMap = L.map("map", {
  center: [27.96044, -82.30695], // Initial center (adjust as needed)
  zoom: 5 // Initial zoom level
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Load the GeoJSON data (Earthquakes from USGS)
let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"; 

// Function to determine color based on depth
function getColor(depth) {
  return depth > 90 ? "#b10026" :
         depth > 70 ? "#e31a1c" :
         depth > 50 ? "#fc4e2a" :
         depth > 30 ? "#fd8d3c" :
         depth > 10 ? "#feb24c" :
                      "#ffffb2"; 
}

// Function to determine size based on magnitude
function getSize(magnitude) {
  return magnitude * 4; // Adjust scale for visibility
}

// Fetch GeoJSON data
d3.json(geoData).then(function(data) {
  L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng, {
              radius: getSize(feature.properties.mag),
              fillColor: getColor(feature.geometry.coordinates[2]),
              color: "#000",
              weight: 0.5,
              opacity: 1,
              fillOpacity: 0.8
          });
      },
      onEachFeature: function(feature, layer) {
          layer.bindPopup(`
              <strong>Location:</strong> ${feature.properties.place}<br>
              <strong>Magnitude:</strong> ${feature.properties.mag}<br>
              <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km
          `);
      }
  }).addTo(myMap);

  // Add legend
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function() {
      let div = L.DomUtil.create("div", "info legend");
      let depths = [-10, 10, 30, 50, 70, 90];
      let colors = ["#ffffb2", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"];

      div.innerHTML = "<h3>Depth (km)</h3>";

      // Loop through the depth levels and add colored labels
      for (let i = 0; i < depths.length; i++) {
          div.innerHTML +=
              `<i style="background: ${colors[i]}; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ` +
              `${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] : "+"} km<br>`;
      }
      return div;
  };

  legend.addTo(myMap);
});
