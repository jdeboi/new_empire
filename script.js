// mapboxgl.accessToken = 'pk.eyJ1IjoiamRlYm9pIiwiYSI6ImNraTlqZjI5dzBiczcyeW12b3JqczVqcjQifQ.Ixa9kxflypCdfdL289pPiA';
let filePaths = [
    { filePath: "Amberjack", col: "red", type: "connecting" },
    { filePath: "BS_Downstream", col: "green", type: "connecting" },
    { filePath: "Breton_Sound_Gathering", col: "blue", type: "gathering" },
    { filePath: "East_Cameron_Gathering", col: "purple", type: "connecting" }, //
    { filePath: "Empire_Deepwater_Adjacent", col: "pink", type: "gathering" },
    { filePath: "Empire_Deepwater", col: "white", type: "owned" },
    { filePath: "Feeder_Lines", col: "black", type: "connecting" },
    { filePath: "Tarpon_DownStream", col: "gray", type: "interest" },
    { filePath: "Tarpon", col: "yellow", type: "connecting" },
    { filePath: "Trunk_line", col: "cyan", type: "interest" },
    { filePath: "Trunk_Lines", col: "orange", type: "managed" },
    { filePath: "Whitecap", col: "red", type: "gathering" }
];

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
let step = 0;

function animateDashArray(timestamp, map) {
    // Update line-dasharray using the next value in dashArraySequence. The
    // divisor in the expression `timestamp / 50` controls the animation speed.
    const newStep = parseInt(
        (timestamp / 50) % dashArraySequence.length
    );

    if (newStep !== step) {
        filePaths.forEach((fp) => {
            setPaintDash(map, fp);
        })

        step = newStep;
    }

    // Request the next frame of the animation.
    requestAnimationFrame((tm) => animateDashArray(tm, map));
}

function animate2(map) {
    if (!map) return;
    var dashLength = 1;
    var gapLength = 3;
 
    // We divide the animation up into 40 steps to make careful use of the finite space in
    // LineAtlas
    var steps = 40;
    // A # of steps proportional to the dashLength are devoted to manipulating the dash
    var dashSteps = steps * dashLength / (gapLength + dashLength);
    // A # of steps proportional to the gapLength are devoted to manipulating the gap
    var gapSteps = steps - dashSteps;
  
    
  
    setInterval(function() {
        step = step + 1;
        if (step >= steps) step = 0;
    
        var t, a, b, c, d;
        if (step < dashSteps) {
          t = step / dashSteps;
          a = (1 - t) * dashLength;
          b = gapLength;
          c = t * dashLength;
          d = 0;
        } else {
          t = (step - dashSteps) / (gapSteps);
          a = 0;
          b = (1 - t) * gapLength;
          c = dashLength;
          d = t * gapLength;          
        }
        
       
        // filePaths.forEach((fp) => {
            const fp = {filePath: "Amberjack"}
            if (map.getLayer(`${fp.filePath}-line-d`)) {
                // Modify the line color of the layer with ID 'your-layer-id' to red
                map.setPaintProperty(`${fp.filePath}-line-d`, 'line-dasharray', [a, b, c, d]);
            }
        // })
    }, 25);
}

// Initialize map
mapboxgl.accessToken = 'pk.eyJ1IjoiamRlYm9pIiwiYSI6ImNraTlqZjI5dzBiczcyeW12b3JqczVqcjQifQ.Ixa9kxflypCdfdL289pPiA';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: [-91, 29], // starting position [lng, lat]
    zoom: 7 // starting zoom
});

map.on('load', () => {
    filePaths.forEach((fp) => {
        addPoints(map, fp);
    })
    animateDashArray(0, map);

    // animate2(map);
});

function addPoints(map, fp) {
    const { filePath, col, type } = fp;

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
            'circle-radius': 3,
            'circle-stroke-width': 1,
            'circle-color': "black",
            'circle-stroke-color': 'white'
        }
    });



    map.addLayer({
        'id': `${filePath}-line`,
        'class': "line-background",
        'type': 'line',
        'source': filePath,
        'filter': ['==', '$type', 'LineString'],
        'paint': {
            'line-color': getColorType(type),
            'line-width': getLineWidth(type),
            'line-opacity': 0.4
        }
    });

    map.addLayer({
        'id': `${filePath}-line-d`,
        'class': "line-dashed",
        'type': 'line',
        'source': filePath,
        'filter': ['==', '$type', 'LineString'],
        'paint': {
            'line-color': getColorType(type),
            'line-width': getLineWidth(type),
            'line-dasharray': [2, 2]
        }
    });

    

    const largeT = ["Amberjack", "Breton Sound", "BS Downstream", "Ship Shoal", "Whitecap", "Crimson", "Empire Deepwater", "East Cameron"];
    const mediumT = ["Empire Terminal"];


    addTextLabels(map, filePath, "lg", largeT, true, 20);
    // addTextLabels(map, filePath, "md", mediumT, true, 15, 14);
    addTextLabels(map, filePath, "sm", [...largeT, ...mediumT], false, 0);


}
function addTextLabels(map, filePath, abbr, arr, filterIn, textSz) {
    map.addLayer({
        'id': `${filePath}-labels-${abbr}`,
        'type': 'symbol',
        'source': filePath,
        'filter': filterIn ? ['in', ['get', 'Name'], ["literal", arr]] : ['!', ['in', ['get', 'Name'], ["literal", arr]]],
        'layout': {
            'text-field': [
                'case',
                ['!=', ['get', 'Name'], 'Untitled Path'], // Filter out labels with 'untitled name'
                ['get', 'Name'],
                '' // Empty string for labels to be filtered out
            ],
            "text-size": textSz,


            'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
            'text-radial-offset': 0.5,
            'text-justify': 'auto',
            'icon-image': ['get', 'icon']
        }
    });
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

function getLineWidth(type) {
    if (type == "gathering") return 1;
    return 6;
}

function setPaintDash(map, fp) {
    if (map) {
        if (map.getLayer(`${fp.filePath}-line-d`)) {
            // Modify the line color of the layer with ID 'your-layer-id' to red
            map.setPaintProperty(`${fp.filePath}-line-d`, 'line-dasharray', dashArraySequence[step]);
        }
        else {
            console.log("nope", `${fp.filePath}-line-d`);
        }
    }

}