var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");

const WIDTH = 1000;
const HEIGHT = 1000;
const LANE_WIDTH = 80;


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
const INT_TO_CARDINAL = ["N", "S", "E", "W"] // mostly for convenience, and so I don't need to convert NSEW to a type

var lights = {
    "N": [
        {dir: TURN.LEFT, state: COLOR.RED, last_state_change: new Date()},
        {dir: TURN.STRAIGHT, state: COLOR.RED, last_state_change: new Date()},
        {dir: TURN.RIGHT, state: COLOR.RED, last_state_change: new Date()},
    ],
    "S": [
        {dir: TURN.LEFT, state: COLOR.GRE, last_state_change: new Date()},
        {dir: TURN.STRAIGHT, state: COLOR.GRE, last_state_change: new Date()},
        {dir: TURN.RIGHT, state: COLOR.GRE, last_state_change: new Date()},
    ],
    "E": [
        {dir: TURN.LEFT, state: COLOR.YEL, last_state_change: new Date()},
        {dir: TURN.STRAIGHT, state: COLOR.YEL, last_state_change: new Date()},
        {dir: TURN.RIGHT, state: COLOR.YEL, last_state_change: new Date()},
    ],
    "W": [
        {dir: TURN.LEFT, state: COLOR.FLA, last_state_change: new Date()},
        {dir: TURN.STRAIGHT, state: COLOR.FLA, last_state_change: new Date()},
        {dir: TURN.RIGHT, state: COLOR.FLA, last_state_change: new Date()},
    ],
}

var intersection = {
    "N": {
        lanes: [
            {dir: TURN.LEFT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.LEFT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.RIGHT, sensor_on: false, sensor_on_since: null, car_count: 0},
        ]
    },
    "S": {
        lanes: [
            {dir: TURN.LEFT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.LEFT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.RIGHT, sensor_on: false, sensor_on_since: null, car_count: 0},
        ]
        

    },
    "E": {
        lanes: [
            {dir: TURN.LEFT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.LEFT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.RIGHT, sensor_on: false, sensor_on_since: null, car_count: 0},
        ]
        
    },
    "W": {
        lanes: [
            {dir: TURN.LEFT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.LEFT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.STRAIGHT, sensor_on: false, sensor_on_since: null, car_count: 0},
            {dir: TURN.RIGHT, sensor_on: false, sensor_on_since: null, car_count: 0},
        ]
    },
}

const TRAFFIC_TYPE = {
    "RANDOM": 0,
    "HEAVY_EW": 1,
    "EVEN": 2,
}
var worldStateAndControls = {
    useDynamic: false, // false = time based
    useHistoricalData: false,
    trafficCondition: TRAFFIC_TYPE.HEAVY_EW,
    lastCarSpawn: new Date(), // may cause a short delay before cars spawn, but thats ok.
    carSpawnRate: 20, // Used to adjust global spawn rate independent of traffic coniditions. I dunno how sensitive this will be yet. I'm thinking like, 1-10 scale.
    lastCarLane: 0,
}

drawIntersectionSide = function(cardinal_dir) {
    let rotation = 0;
    spacing = 100;
    offsetX = -100;
    offsetY = 300;
    carCountOffsetX = 20 // half font size
    carCountOffsetY = 100
    // This will make the general drawing process a lot easier by letting me slide stuff around.
    switch(cardinal_dir) {
        case "N":
            rotation = 0
            carCountOffsetX = 0
            break;
        case "W":
            rotation = 90
            break;
        case "S":
            rotation = 180
            break;
        case "E":
            rotation = 270
            carCountOffsetX = 0
            break;
    }
    // Use
    intersection[cardinal_dir].lanes.forEach((l, idx) => {
        text = "↑"
        if (l.dir == TURN.LEFT) {
            text = "↰"
        }
        if (l.dir == TURN.RIGHT) {
            text = "↱"
        }
        
        style = "#fff"
        ctx.fillStyle = style
        ctx.font = '40px serif'

        x = spacing * (idx-1)+offsetX
        y = offsetY

        // fill turn lane symbol
        ctx.save()
        ctx.translate(WIDTH/2, HEIGHT/2)
        ctx.rotate(rotation * Math.PI /180)
        ctx.fillText(text, x, y)
        ctx.restore()
        
        // fill car count
        ctx.save()
        ctx.translate(WIDTH/2, HEIGHT/2)
        ctx.rotate(rotation * Math.PI /180)
        ctx.translate(x+carCountOffsetX, y+carCountOffsetY)
        ctx.rotate(-rotation * Math.PI /180)
        ctx.fillText(l.car_count, 0, 0)
        ctx.restore()
    })
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
    
    rotation = 0;
    spacing = 100;
    offsetX = 0;
    offsetY = -150;
    // This will make the general drawing process a lot easier by letting me slide stuff around.
    switch(cardinal_dir) {
        case "N":
            rotation = 0
            break;
        case "W":
            rotation = 90
            break;
        case "S":
            rotation = 180
            break;
        case "E":
            rotation = 270
            break;
    }
    lights[cardinal_dir].forEach((l, idx) => {
        text = "⬤"
        if (l.dir == TURN.LEFT) {
            text = "◄"
        }
        if (l.dir == TURN.RIGHT) {
            text = "►"
        }
        
        style = "#fff"
        switch(l.state) {
            case COLOR.RED:
                style = "red"
                break;
            case COLOR.YEL:
                style = "yellow"
                break;
            case COLOR.GRE:
                style = "#00FF00"
                break;
            case COLOR.FLA:
                if ((new Date().getMilliseconds()) < 500) {
                    style = "orange"
                } else {
                    style = "black";
                }
                break;
        }
        ctx.fillStyle = style
        ctx.font = '20px serif'

        x =  spacing * (idx-1)+offsetX
        y = offsetY
        ctx.save()
        ctx.translate(WIDTH/2, HEIGHT/2)
        ctx.rotate(rotation * Math.PI /180)
        ctx.fillText(text, x, y)
        ctx.restore()
    })
}

drawLights = function () {
    /**
     * These will need to be drawn separate from the intersection, so we don't have cars drawn over lights.
     * Sure, this will lead to some boilerplate, but I'm not writing a 2D game engine with Z indexing right now.
     * 
     * I could probably simplify how many funcs we have, but, meh, we'll get there later.
     * Like, the rotation and position can end up as constants later. For now though, this makes it easier to programatically draw stuff.
     **/
    drawLightsSide("N")
    drawLightsSide("S")
    drawLightsSide("E")
    drawLightsSide("W")
}

trafficControl = function() {
    /**
     * This is our main traffic controller func!
     * For now, both the time based and dynamic versions will live here, until I figure out where I want to separate them.
     */
}

addCarToLane= function (lane){
    dirLane = lane % 5
    cardinal = INT_TO_CARDINAL[(lane - dirLane) / 5]
    intersection[cardinal].lanes[dirLane].car_count += 1
}

spawnCars = function() {
    /**
     * Yeh
     */
    
    // Are we even spawning cars?
    if (worldStateAndControls.carSpawnRate <= 0) {
        return
    }

    // Can we spawn a car yet?
    now = new Date()
    threshold = 10000/(worldStateAndControls.carSpawnRate)
    if (now - worldStateAndControls.lastCarSpawn < threshold) {
        return
    }
    worldStateAndControls.lastCarSpawn = now


    if (TRAFFIC_TYPE.RANDOM == worldStateAndControls.trafficCondition) {
        //4 dirs * 5 lanes = 20 total lanes
        globalLane = Math.floor(Math.random() * 20)
        addCarToLane(globalLane)
        worldStateAndControls.lastCarLane = globalLane
    }

    if (TRAFFIC_TYPE.EVEN == worldStateAndControls.trafficCondition) {
        next = (worldStateAndControls.lastCarLane + 1) % 20
        addCarToLane(worldStateAndControls.lastCarLane)
        worldStateAndControls.lastCarLane = next
    }

    if (TRAFFIC_TYPE.HEAVY_EW == worldStateAndControls.trafficCondition) {
        useEW = (Math.floor(Math.random() * 10) + 1) <= 7 // (N * 10)% of traffic is on EW direcitons.
        side = Math.round(Math.random())
        lane = Math.floor(Math.random() * 5)

        if (useEW) lane += 10
        if (side) lane += 5
        addCarToLane(lane)
        worldStateAndControls.lastCarLane = lane
    }
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
        spawnCars()
        trafficControl()
        if (new Date() - lights["N"][0].last_state_change > 1000) {
            lights["N"][0].state = (lights["N"][0].state + 1) % 4
            lights["N"][0].last_state_change = new Date()
        } 
    }, 1000/FPS);
};

dostuff()