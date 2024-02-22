// mapboxgl.accessToken = 'pk.eyJ1IjoiamRlYm9pIiwiYSI6ImNraTlqZjI5dzBiczcyeW12b3JqczVqcjQifQ.Ixa9kxflypCdfdL289pPiA';
var filePaths = [
    "Amberjack",
    "BS_Downstream",
    "Breton_Sound_Gathering",
    "East_Cameron_Gathering",
    "Empire_Deepwater_Adjacent",
    "Empire_Deepwater",
    "Feeder_Lines",
    "Tarpon_DownStream",
    "Tarpon",
    "Trunk_line",
    "Trunk_Lines",
    "Whitecap"
];

// Initialize map
mapboxgl.accessToken = 'pk.eyJ1IjoiamRlYm9pIiwiYSI6ImNraTlqZjI5dzBiczcyeW12b3JqczVqcjQifQ.Ixa9kxflypCdfdL289pPiA';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: [-91, 29], // starting position [lng, lat]
    zoom: 7 // starting zoom
});

map.on('load', () => {
    // addPoints(map, "Amberjack", "red");
    // addPoints(map, "BS_Downstream", "green");
    // addPoints(map, "Breton_Sound_Gathering", "pink");
    // addPoints(map, "East_Cameron_Gathering", "purple");
    // addPoints(map, "Empire_Deepwater_Adjacent", "orange");
    // addPoints(map,  "Empire_Deepwater", "black");
    // addPoints(map, "Feeder_Lines", "gray");
    // addPoints(map, "Tarpon_DownStream", "white");
    // addPoints(map, "Tarpon", "yellow");
    // addPoints(map, "Trunk_line", "cyan");
    // addPoints(map, "Trunk_Lines", "blue");
    // addPoints(map, "Whitecap", "lime");
    addPoints(map, "Amberjack", "red");
    addPoints(map, "BS_Downstream", "green");
    addPoints(map, "Breton_Sound_Gathering", "pink");
    addPoints(map, "East_Cameron_Gathering", "purple");
    addPoints(map, "Empire_Deepwater_Adjacent", "orange");
    addPoints(map,  "Empire_Deepwater", "black");
    addPoints(map, "Feeder_Lines", "gray");
    addPoints(map, "Tarpon_DownStream", "blue");
    addPoints(map, "Tarpon", "yellow");
    addPoints(map, "Trunk_line", "cyan");
    addPoints(map, "Trunk_Lines", "blue");
    addPoints(map, "Whitecap", "lime");
});

function addPoints(map, filePath, col) {
    map.addSource(filePath, {
        type: 'geojson',
        // Use a URL for the value for the `data` property.
        data: `/geojson/${filePath}.geojson`
    });

    map.addLayer({
        'id': `${filePath}-points`,
        'type': 'circle',
        'source': filePath,
        'filter': ['==', '$type', 'Point'],
        'paint': {
            'circle-radius': 4,
            'circle-stroke-width': 2,
            'circle-color': col,
            'circle-stroke-color': 'white'
        }
    });

    map.addLayer({
        'id': `${filePath}-line`,
        'type': 'line',
        'source': filePath,
        'filter': ['==', '$type', 'LineString'],
        'paint': {
            'line-color': col,
            'line-width': 4
        }
    });

   
}