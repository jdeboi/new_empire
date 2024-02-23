
// Initialize map
mapboxgl.accessToken = 'pk.eyJ1IjoiamRlYm9pIiwiYSI6ImNraTlqZjI5dzBiczcyeW12b3JqczVqcjQifQ.Ixa9kxflypCdfdL289pPiA';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: [-91, 29], // starting position [lng, lat]
    zoom: 7 // starting zoom
});

map.on('load', () => {
    map.addSource("lines", {
        type: 'geojson',
        data: "mapshaper/lines.json"
    });

    map.addSource("points", {
        type: 'geojson',
        data: "mapshaper/points.json"
    });

    map.addLayer({
        'id': `points-layer`,
        'type': 'circle',
        'source': 'points',
        'paint': {
            'circle-radius': 3,
            'circle-stroke-width': 1,
            'circle-color': "black",
            'circle-stroke-color': 'white'
        }
    });

    map.addLayer({
        'id': 'labels',
        'type': 'symbol',
        'source': "points",
        'layout': {
            'text-field': [
                'case',
                ['!=', ['get', 'name'], 'Untitled Path'], // Filter out labels with 'untitled name'
                ['get', 'name'],
                '' // Empty string for labels to be filtered out
            ],
            "text-size": [
                "case",
                ["==", ["get", "label-scale"], null], // Check if label-scale is null
                20, // Set size to 10 if label-scale is null
                10 // Otherwise, use the value of label-scale
            ],

            'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
            'text-radial-offset': 0.5,
            'text-justify': 'auto',
            'icon-image': ['get', 'icon']
        }
    });

    // map.addLayer({
    //     'id': 'labels-l',
    //     'type': 'symbol',
    //     'source': "lines",
    //     'layout': {
    //         'text-field': [
    //             'case',
    //             ['!=', ['get', 'name'], 'Untitled Path'], // Filter out labels with 'untitled name'
    //             ['get', 'name'],
    //             '' // Empty string for labels to be filtered out
    //         ],
    //         "text-size": 10,


    //         'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
    //         'text-radial-offset': 0.5,
    //         'text-justify': 'auto',
    //         'icon-image': ['get', 'icon']
    //     }
    // });

    map.addLayer({
        'id': `lines-background`,
        'class': "line-background",
        'type': 'line',
        'source': 'lines',
        'paint': {
            'line-color': ['get', 'stroke'],
            'line-width': ['get', 'stroke-width'],
            'line-opacity': 0.4
        }
    });

    map.addLayer({
        'id': "lines-d",
        'class': "line-dashed",
        'type': 'line',
        'source': 'lines',
        'paint': {
            'line-color': ['get', 'stroke'],
            'line-width': ['get', 'stroke-width'],
            'line-dasharray': [2, 2]
        }
    });

    animateDashArray(0, map);

});

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
    [0, 3.5, 3, 0.5]
];
let step = dashArraySequence.length - 1;

function animateDashArray(timestamp, map) {
    // Update line-dasharray using the next value in dashArraySequence. The
    // divisor in the expression `timestamp / 50` controls the animation speed.
    let newStep = parseInt(
        (timestamp / 50) % dashArraySequence.length
    );
    newStep = dashArraySequence.length - newStep - 1;

    if (newStep !== step) {
        setPaintDash(map);

        step = newStep;
    }

    // Request the next frame of the animation.
    requestAnimationFrame((tm) => animateDashArray(tm, map));
}

function setPaintDash(map) {
    if (map && map.getLayer("lines-d")) {
        // Modify the line color of the layer with ID 'your-layer-id' to red
        map.setPaintProperty("lines-d", 'line-dasharray', dashArraySequence[step]);
    }
}

function getColorType(type) {
    switch (type) {
        case "owned":
            return "green";
        case "interest":
            return "cyan";
        case "managed":
            return "orange";
        case "connecting":
            return "magenta";
        case "gathering":
            return "gray";
        default:
            return "black"
    }
}