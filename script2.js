const empireLogos = [
  {
    name: "Empire",
    coords: [-90.93106408, 29.62906012],
  },
];

const citiesOfInterest = [
  { name: "Lafayette", coords: [-89.11705402887617, 29.57865889597915] },
];

const palette1 = {
  owned: "#B00B0C",
  interest: "#FFA629",
  managed: "#595859",
  connecting: "#4182BC",
};

const palette2 = {
  owned: "#00F0FF",
  interest: "#F24822",
  managed: "#000AFF",
  connecting: "#FFA629",
};

const palette3 = {
  owned: "lime",
  interest: "cyan",
  managed: "#000AFF",
  connecting: "magenta",
};

let colors = { ...palette1 };

document.querySelector(".legend-color.owned").style.backgroundColor =
  colors.owned;
document.querySelector(".legend-color.managed").style.backgroundColor =
  colors.managed;
document.querySelector(".legend-color.interest").style.backgroundColor =
  colors.interest;
document.querySelector(".legend-color.connecting").style.backgroundColor =
  colors.connecting;

const STROKE_WIDTH = 4;

mapboxgl.accessToken =
  "pk.eyJ1IjoiamRlYm9pIiwiYSI6ImNsc3dvNmJ0NzBua2gyam82OHIyMDJlaXoifQ.vml5fodiy2NC8Zu2yvmPew";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/jdeboi/clxazw5aw09d201ql0vyj7fyk",
  center: [-90.5, 28.9],
  zoom: 7,
  maxZoom: 12, // Set the maximum zoom level
  minZoom: 6, // Set the minimum zoom level
  bearingSnap: 0, // Ensure the map snaps to north when dragged
  pitchWithRotate: false, // Disable pitch (3D perspective) with rotation
  dragRotate: false, // Disable map rotation when dragging
});

async function fetchAndFilterPointsGeoJSON(url) {
  const response = await fetch(url);
  const geoJson = await response.json();

  const filteredFeatures = geoJson.features.filter((feature) => {
    var scale = feature.properties["label-scale"];
    return scale == undefined || scale >= 0.95;
  });

  return {
    type: "FeatureCollection",
    features: filteredFeatures,
  };
}

async function fetchAndFilterGeoJSON(url) {
  const response = await fetch(url);
  const geoJson = await response.json();
  const filteredFeatures = geoJson.features.filter((feature) => {
    return (
      feature.geometry.type === "LineString" &&
      feature.properties["stroke-width"] >= 2.5
    );
  });
  filteredFeatures.forEach((feature) => {
    feature.properties["stroke-width"] = STROKE_WIDTH;
    if (feature.properties.stroke === "#ff00ff") {
      feature.properties.stroke = colors.connecting;
    } else if (feature.properties.stroke === "#55ff00") {
      feature.properties.stroke = colors.owned;
    } else if (feature.properties.stroke === "#55ff01") {
      feature.properties.stroke = colors.interest;
    } else if (feature.properties.stroke === "#55ff02") {
      feature.properties.stroke = colors.managed;
    } else {
      feature.properties["stroke-width"] = 0;
    }
  });
  return {
    type: "FeatureCollection",
    features: filteredFeatures,
  };
}

async function fetchGeoJSON(url) {
  const response = await fetch(url);
  const geoJson = await response.json();
  return {
    type: "FeatureCollection",
    features: geoJson.features,
  };
}

async function loadDataAndAddLayers() {
  const augerData = await fetchGeoJSON("geojson2/Auger.geojson");
  const gibsonData = await fetchGeoJSON("geojson2/Gibson.geojson");
  const linesData = await fetchAndFilterGeoJSON("mapshaper/lines.json");
  const pointsData = await fetchAndFilterPointsGeoJSON("mapshaper/points.json");

  map.addSource("auger", {
    type: "geojson",
    data: augerData,
  });

  map.addLayer({
    id: `auger-layer`,
    class: "line-auger",
    type: "line",
    source: "auger",
    paint: {
      "line-color": colors.owned,
      "line-width": STROKE_WIDTH, // Set a fixed stroke width (adjust as needed)
      "line-opacity": 1,
      "line-cap": "round",
    },
  });

  map.addSource("gibson", {
    type: "geojson",
    data: gibsonData,
  });

  map.addLayer({
    id: `gibson-layer`,
    type: "fill",
    source: "gibson",
    paint: {
      "fill-color": ["get", "fill"],
      "fill-opacity": 0.4,
    },
  });

  map.addSource("lines", {
    type: "geojson",
    data: linesData,
  });

  map.addLayer({
    id: "lines",
    class: "lines-layer",
    type: "line",
    source: "lines",
    paint: {
      "line-color": ["get", "stroke"],
      "line-width": STROKE_WIDTH, // Set a fixed stroke width (adjust as needed)
      "line-opacity": 1,
      "line-cap": "round",
    },
  });

  map.addSource("points", {
    type: "geojson",
    data: pointsData,
  });

  map.addLayer({
    id: "labels",
    type: "symbol",
    source: "points",
    layout: {
      "text-field": [
        "case",
        ["!=", ["get", "name"], "Untitled Path"], // Filter out labels with 'untitled name'
        ["get", "name"],
        "", // Empty string for labels to be filtered out
      ],
      "text-size": [
        "case",
        ["==", ["get", "label-scale"], null], // Check if label-scale is null
        20, // Set size to 10 if label-scale is null
        10, // Otherwise, use the value of label-scale
      ],

      "text-variable-anchor": ["top", "bottom", "left", "right"],
      "text-radial-offset": 0.5,
      "text-justify": "auto",
      "icon-image": ["get", "icon"],
    },
  });

  empireLogos.forEach((place) => {
    const el = document.createElement("div");
    el.className = "empire-marker";

    // Create an image element for the marker icon
    const img = document.createElement("img");
    img.src = "empire_logo.webp"; // Path to your marker image
    img.style.width = "60px"; // Set the width of the image
    img.style.height = "60px"; // Set the height of the image

    el.appendChild(img);

    // Add the custom marker to the map
    new mapboxgl.Marker(el).setLngLat(place.coords).addTo(map);
  });
}

map.on("load", loadDataAndAddLayers);

const dashArraySequence = [
  [0, 4, 3],
  [0.5, 4, 2.5],
  [1, 4, 2],
  [1.5, 4, 1.5],
  [2, 4, 1],
  [2.5, 4, 0.5],
  [3, 4, 0],
  [0, 0.5, 3, 3.5],
  [0, 1, 3, 3],
  [0, 1.5, 3, 2.5],
  [0, 2, 3, 2],
  [0, 2.5, 3, 1.5],
  [0, 3, 3, 1],
  [0, 3.5, 3, 0.5],
];
let step = dashArraySequence.length - 1;

function animateDashArray(timestamp, map) {
  let newStep = parseInt((timestamp / 50) % dashArraySequence.length);
  newStep = dashArraySequence.length - newStep - 1;

  if (newStep !== step) {
    setPaintDash(map);
    step = newStep;
  }

  requestAnimationFrame((tm) => animateDashArray(tm, map));
}

function setPaintDash(map) {
  if (map && map.getLayer("lines-d")) {
    map.setPaintProperty(
      "lines-d",
      "line-dasharray",
      dashArraySequence[dashArraySequence.length - 1 - step]
    );
  }
}

document.getElementById("map-style").addEventListener("change", function () {
  const selectedStyle = this.value;

  map.setStyle(selectedStyle);

  // Reload layers after style change
  map.once("styledata", loadDataAndAddLayers);
});

document.getElementById("map-color").addEventListener("change", function () {
  const selectedCol = this.value;

  switch (selectedCol) {
    case "1":
      colors = palette1;
      break;
    case "2":
      colors = palette2;
      break;
    case "3":
      colors = palette3;
      break;
    default:
      break;
  }

  if (map.getSource("auger")) {
    map.removeLayer("auger-layer");
    map.removeSource("auger");
  }
  if (map.getSource("gibson")) {
    map.removeLayer("gibson-layer");
    map.removeSource("gibson");
  }
  if (map.getSource("lines")) {
    map.removeLayer("lines");
    map.removeSource("lines");
  }
  if (map.getSource("points")) {
    map.removeLayer("labels");
    map.removeSource("points");
  }

  // Reload layers with the new colors
  loadDataAndAddLayers();

  document.querySelector(".legend-color.owned").style.backgroundColor =
    colors.owned;
  document.querySelector(".legend-color.managed").style.backgroundColor =
    colors.managed;
  document.querySelector(".legend-color.interest").style.backgroundColor =
    colors.interest;
  document.querySelector(".legend-color.connecting").style.backgroundColor =
    colors.connecting;
});
