// Creating the map object
let myMap = L.map("map", {
    center: [27.96044, -82.30695], // Adjust to your area of interest
    zoom: 4 // Initial zoom level
});

// Base Layers (Tile Layers)
let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://opentopomap.org/copyright">OpenTopoMap</a>'
});

// Add default tile layer to map
streetMap.addTo(myMap);

// Load the Earthquake Data
let earthquakeData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Load the Tectonic Plates Data (GitHub Repository)
let tectonicPlatesData = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Function to get color based on earthquake depth
function getColor(depth) {
    return depth > 90 ? "#b10026" :
           depth > 70 ? "#e31a1c" :
           depth > 50 ? "#fc4e2a" :
           depth > 30 ? "#fd8d3c" :
           depth > 10 ? "#feb24c" :
                        "#ffffb2"; 
}

// Function to get marker size based on magnitude
function getSize(magnitude) {
    return magnitude * 4; // Adjust size for better visibility
}

// Create layer groups
let earthquakeLayer = L.layerGroup();
let tectonicLayer = L.layerGroup();

// Fetch Earthquake GeoJSON Data
d3.json(earthquakeData).then(function(data) {
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
    }).addTo(earthquakeLayer);
    earthquakeLayer.addTo(myMap);
});

// Fetch Tectonic Plate GeoJSON Data
d3.json(tectonicPlatesData).then(function(data) {
    L.geoJson(data, {
        style: function() {
            return {
                color: "orange", 
                weight: 2
            };
        }
    }).addTo(tectonicLayer);
});

// Add Layer Controls
let baseMaps = {
    "Street Map": streetMap,
    "Topographic Map": topoMap
};

let overlayMaps = {
    "Earthquakes": earthquakeLayer,
    "Tectonic Plates": tectonicLayer
};

// Add Layer Control to Map
L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

// Add Legend
let legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ["#ffffb2", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"];

    div.innerHTML = "<h3>Depth (km)</h3>";

    // Loop through depth ranges and create color labels
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            `<i style="background: ${colors[i]}; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ` +
            `${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] : "+"} km<br>`;
    }
    return div;
};

legend.addTo(myMap);
