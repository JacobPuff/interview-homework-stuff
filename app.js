var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");

const WIDTH = 1000;
const HEIGHT = 1000;

// These getting used as code tokens means there will be no spelling errors. N S E W are probably fine tho.
const TURN = {
    "LEFT": 0,
    "STRAIGHT": 1,
    "RIGHT": 2,
}
const COLOR = {
    "RED": 0,
    "YEL": 1,
    "GRE": 2,
    "FLA": 3 // flashing
}

var lights = {
    "N": [
        {dir: TURN.LEFT, state: COLOR.RED, last_state_change: new Date()},
        {dir: TURN.STRAIGHT, state: COLOR.RED, last_state_change: new Date()},
        {dir: TURN.RIGHT, state: COLOR.RED, last_state_change: new Date()},
    ],
    "S": [
        {dir: TURN.LEFT, state: COLOR.RED, last_state_change: new Date()},
        {dir: TURN.STRAIGHT, state: COLOR.RED, last_state_change: new Date()},
        {dir: TURN.RIGHT, state: COLOR.RED, last_state_change: new Date()},
    ],
    "E": [
        {dir: TURN.LEFT, state: COLOR.RED, last_state_change: new Date()},
        {dir: TURN.STRAIGHT, state: COLOR.RED, last_state_change: new Date()},
        {dir: TURN.RIGHT, state: COLOR.RED, last_state_change: new Date()},
    ],
    "W": [
        {dir: TURN.LEFT, state: COLOR.RED, last_state_change: new Date()},
        {dir: TURN.STRAIGHT, state: COLOR.RED, last_state_change: new Date()},
        {dir: TURN.RIGHT, state: COLOR.RED, last_state_change: new Date()},
    ],
}

var intersection = {
    "N": {
        lanes: [
            {dir: TURN.LEFT, sensor_on: false, car_count: 0},
            {dir: TURN.LEFT, sensor_on: false, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, car_count: 0},
            {dir: TURN.RIGHT, sensor_on: false, car_count: 0},
        ]
    },
    "S": {
        lanes: [
            {dir: TURN.LEFT, sensor_on: false, car_count: 0},
            {dir: TURN.LEFT, sensor_on: false, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, car_count: 0},
            {dir: TURN.RIGHT, sensor_on: false, car_count: 0},
        ]
        

    },
    "E": {
        lanes: [
            {dir: TURN.LEFT, sensor_on: false, car_count: 0},
            {dir: TURN.LEFT, sensor_on: false, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, car_count: 0},
            {dir: TURN.RIGHT, sensor_on: false, car_count: 0},
        ]
        
    },
    "W": {
        lanes: [
            {dir: TURN.LEFT, sensor_on: false, car_count: 0},
            {dir: TURN.LEFT, sensor_on: false, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, car_count: 0},
            {dir: TURN.RIGHT, sensor_on: false, car_count: 0},
        ]
    },
}

drawIntersectionSide = function(cardinal_dir) {
    let rotation = 0;
    offsetX = 0;
    offsetY = 0;
    // This will make the general drawing process a lot easier by letting me slide stuff around.
    switch(cardinal_dir) {
        case "N":
            rotation = 0
            offsetX = 0;
            offsetY = 0;
        case "W":
            rotation = 90
            offsetX = 0;
            offsetY = 0;
        case "S":
            rotation = 180
            offsetX = 0;
            offsetY = 0;
        case "E":
            rotation = 270
            offsetX = 0;
            offsetY = 0;
    }
    // Use 
}
drawIntersection = function() {
    drawIntersectionSide("N")
    drawIntersectionSide("S")
    drawIntersectionSide("E")
    drawIntersectionSide("W")
}

drawCars = function () {
    // If we get to it, this will show the cars moving around
}


drawLightsSide = function(cardinal_dir) {
    let rotation = 0;
    offsetX = 0;
    offsetY = 0;
    // This will make the general drawing process a lot easier by letting me slide stuff around.
    switch(cardinal_dir) {
        case "N":
            rotation = 0
            offsetX = 0;
            offsetY = 0;
        case "W":
            rotation = 90
            offsetX = 0;
            offsetY = 0;
        case "S":
            rotation = 180
            offsetX = 0;
            offsetY = 0;
        case "E":
            rotation = 270
            offsetX = 0;
            offsetY = 0;
    }
}

drawLights = function () {
    /**
     * These will need to be drawn separate from the intersection, so we don't have cars drawn over lights.
     * Sure, this will lead to some boilerplate, but I'm not writing a 2D game engine with Z indexing right now.
     * 
     * I could probably simplify how many funcs we have, but, meh, we'll get there later.
     * Like, the rotation and position can end up as constants later.
     **/
    drawLightsSide("N")
    drawLightsSide("S")
    drawLightsSide("E")
    drawLightsSide("W")
}

var FPS = 60; 
dostuff = function() {
    setTimeout(function(){
        window.requestAnimationFrame(dostuff);
        ctx.clearRect(0,0,WIDTH,HEIGHT);

        // Everything is drawn from bottom up.
        drawIntersection()
        drawCars()
        drawLights()
    }, 1000/FPS);
};

dostuff()