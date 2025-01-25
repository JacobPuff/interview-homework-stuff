var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");

const WIDTH = 1000;
const HEIGHT = 1000;

// These getting used as code tokens means there will be no spelling errors. N S E W are probably fine tho.
const TURN = {
    "LEFT": 0,
    "STRAIGHT": 1, //I'm realizing this being a "turn" is a bit silly. Meh, it gets the point across.
    "RIGHT": 2,
}
const COLOR = {
    "RED": 0,
    "YEL": 1,
    "GRE": 2,
    "FLA": 3 // flashing
}
const INT_TO_CARDINAL = ["N", "S", "E", "W"] // mostly for convenience, and so I don't need to convert NSEW to a type
const CARDINAL_TO_INT = {
    "N": 0,
    "S": 1,
    "E": 2,
    "W": 3,
}
const LANES_PER_SIDE = 5

const ACTIONS = {
    "NS_LEFT": 1,
    "NS_LEFT_FLASH":2,
    "NS_STRAIGHT":3,
    "EW_LEFT":4,
    "EW_LEFT_FLASH":5,
    "EW_STRAIGHT":6,
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
        {dir: TURN.STRAIGHT, state: COLOR.GRE, last_state_change: new Date()},
        {dir: TURN.RIGHT, state: COLOR.GRE, last_state_change: new Date()},
    ],
    "W": [
        {dir: TURN.LEFT, state: COLOR.RED, last_state_change: new Date()},
        {dir: TURN.STRAIGHT, state: COLOR.GRE, last_state_change: new Date()},
        {dir: TURN.RIGHT, state: COLOR.GRE, last_state_change: new Date()},
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
    useDynamic: true, // false = time based
    useHistoricalData: false,
    trafficCondition: TRAFFIC_TYPE.HEAVY_EW,
    lastCarSpawn: new Date(), // may cause a short delay before cars spawn, but thats ok.
    carSpawnRate: 20, // Used to adjust global spawn rate independent of traffic coniditions. I dunno how sensitive this will be yet. I'm thinking like, 1-10 scale.
    lastCarSpawnLane: 0,
    lastTrafficControlAction: null,
    trafficControlQueue: [],
}

// This is a convenience that might get used a couple times, but I may want to update the intersection data structure to make this less annoying
// This works for our purposes in this project though.
getLaneMapFromGlobalId = function(laneId) {
    dirLane = laneId % LANES_PER_SIDE
    cardinal = INT_TO_CARDINAL[(laneId - dirLane) / LANES_PER_SIDE]
    return [cardinal, dirLane] // I wanted to return an object ref here. I cannot.
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

        // fill sensor ellipse
        ctx.save()
        ctx.translate(WIDTH/2, HEIGHT/2)
        ctx.rotate(rotation * Math.PI /180)

        ctx.strokeStyle = l.sensor_on ? "cyan" : "#333"
        ctx.lineWidth = 2
        ctx.beginPath();
        ctx.scale(1, 1.5);
        ctx.arc(x+10, y/1.5-7, 20, 0, 2*Math.PI);
        ctx.stroke();
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


lightToColor = function(card, lightId, color) {
    lights[card][lightId].state = color
    lights[card][lightId].last_state_change = new Date()
}

yellowDurationSeconds = 2
lightToRedSmooth = function(card, lightId) {
    light = lights[card][lightId]
    now = new Date()
    if (light.state != COLOR.YEL && light.state != COLOR.RED){
        lightToColor(card, lightId, COLOR.YEL)
    }
    if (light.state == COLOR.YEL && (((now.getTime() - light.last_state_change.getTime()) /1000)) > yellowDurationSeconds) {
        lightToColor(card, lightId, COLOR.RED)
    }
    return light.state == COLOR.RED
}




stopSides = function(cardinals) {
    if (!cardinals || !cardinals.length) return true
    let done = false
    for (const card of cardinals) {
        lightToRedSmooth(card, 0)
        lightToRedSmooth(card, 1)
        done = lightToRedSmooth(card, 2)
    }
    return done
}

switchForward = function(isNS) {
    let done = false
    if (isNS) {
        let stopped = [stopSides(["E", "W"]), lightToRedSmooth("N", 0), lightToRedSmooth("S", 0)]
        if (stopped.every(Boolean)) {
            lightToColor("N", 1, COLOR.GRE)
            lightToColor("N", 2, COLOR.GRE)
            lightToColor("S", 1, COLOR.GRE)
            lightToColor("S", 2, COLOR.GRE)
            done = true
        }
        return done
    }
    let stopped = [stopSides(["N", "S"]), lightToRedSmooth("E", 0), lightToRedSmooth("W", 0)]
    if (stopped.every(Boolean)) {
        lightToColor("E", 1, COLOR.GRE)
        lightToColor("E", 2, COLOR.GRE)
        lightToColor("W", 1, COLOR.GRE)
        lightToColor("W", 2, COLOR.GRE)
        done = true
    }
    return done

}

switchLeftTurns = function (isNS, useFlash = false) {
    let done = false
    if (isNS) {
        let stopped = [
            stopSides(["E", "W"]),
            lightToRedSmooth("N", 1),
            lightToRedSmooth("N", 2),
            lightToRedSmooth("S", 1),
            lightToRedSmooth("S", 2),
        ]
        if (stopped.every(Boolean)) {
            lightToColor("N", 0, useFlash ? COLOR.FLA : COLOR.GRE)
            lightToColor("S", 0, useFlash ? COLOR.FLA :COLOR.GRE)
            done = true
        }
        return done
    }
    let stopped = [
        stopSides(["N", "S"]),
        lightToRedSmooth("E", 1),
        lightToRedSmooth("E", 2),
        lightToRedSmooth("W", 1),
        lightToRedSmooth("W", 2),
    ]
    if (stopped.every(Boolean)) {
        lightToColor("E", 0, useFlash ? COLOR.FLA :COLOR.GRE)
        lightToColor("W", 0, useFlash ? COLOR.FLA :COLOR.GRE)
        done = true
    }
    return done

}

getMaxWaitLaneIdForSides = function(cardinals) {
    now = new Date()
    maxLane = null // none waiting
    cardinals.forEach(card => {
        maxLane = intersection[card].lanes.reduce((prev, curr, idx) => {
            if (!curr.sensor_on) {
                return prev
            }
            currId = CARDINAL_TO_INT[card]*LANES_PER_SIDE + idx
            if (prev == null) return currId
            prevData = getLaneMapFromGlobalId(prev)
            prevSens = intersection[prevData[0]].lanes[prevData[1]]
            return prev.sensor_on_since < curr.sensor_on_since ? prev : currId
        }, maxLane)
    })
    return maxLane
}

addTrafficAction = function(action) {
    if (worldStateAndControls.trafficControlQueue.findIndex(v=> v == action) == -1) {
        worldStateAndControls.trafficControlQueue.push(action)
    }
}

trafficControl = function() {
    /**
     * This is our main traffic controller func!
     * For now, both the time based and dynamic versions will live here, until I figure out where I want to separate them.
     */
    /**
     * I am adding variables as knobs we can turn, but they may be changed or removed later.
     */
    maxWaitSeconds = 5 // Our cars are just numbers right now, so this seems reasonable.
    minSecondsPerTrafficChange = 3
    if (worldStateAndControls.useDynamic) {

        if (worldStateAndControls.trafficCondition == TRAFFIC_TYPE.HEAVY_EW) {
            // Handle sensor wait times
            maxLaneIdNS = getMaxWaitLaneIdForSides(["N", "S"])
            if (maxLaneIdNS){
                maxLaneDataNS = getLaneMapFromGlobalId(maxLaneIdNS)
                maxLaneNS = intersection[maxLaneDataNS[0]].lanes[maxLaneDataNS[1]]

                if ((now.getTime() - maxLaneNS.sensor_on_since.getTime()) / 1000 >= maxWaitSeconds) {

                    switch(maxLaneNS.dir) {
                        case TURN.LEFT:
                            /**
                             * If it's a left turn, we want to do the straights if there are any since we're interupting this side anyways
                             * Otherwise a flashing light is fine.
                             */
                            straights = [
                                intersection["N"].lanes[2].sensor_on,
                                intersection["N"].lanes[3].sensor_on,
                                intersection["S"].lanes[2].sensor_on,
                                intersection["S"].lanes[3].sensor_on,
                            ]
                            if (straights.some(v => v == true)) {
                                addTrafficAction(ACTIONS.NS_STRAIGHT)
                                addTrafficAction(ACTIONS.NS_LEFT)
                            } else {
                                addTrafficAction(ACTIONS.NS_LEFT_FLASH)
                            }
                            break;
                        case TURN.STRAIGHT:
                            addTrafficAction(ACTIONS.NS_STRAIGHT)

                            lefts = [
                                intersection["N"].lanes[0].sensor_on,
                                intersection["N"].lanes[1].sensor_on,
                                intersection["S"].lanes[0].sensor_on,
                                intersection["S"].lanes[1].sensor_on,
                            ]
                            if (lefts.some(v => v == true)) {
                                // IMPROVEMENT: We could make lefts flash if there have not been many straight cars
                                addTrafficAction(ACTIONS.NS_LEFT)
                            }
                            break;
                        case TURN.RIGHT:
                            addTrafficAction(ACTIONS.NS_STRAIGHT)
                            break;
                    }
                }
            }
            maxSensorIdEW = getMaxWaitLaneIdForSides(["E", "W"])
            if (maxSensorIdEW){
                maxSensorDataEW = getLaneMapFromGlobalId(maxSensorIdEW)
                maxSensorEW = intersection[maxSensorDataEW[0]].lanes[maxSensorDataEW[1]]
                if ((now.getTime() - maxSensorEW.sensor_on_since.getTime()) / 1000 >= maxWaitSeconds) {
                    
                    /**
                     * If it's a left turn, we want to do the straights first since we're interupting this side anyways
                     */
                    switch(maxLaneNS.dir) {
                        case TURN.LEFT:
                            straights = [
                                intersection["E"].lanes[2].sensor_on,
                                intersection["E"].lanes[3].sensor_on,
                                intersection["W"].lanes[2].sensor_on,
                                intersection["W"].lanes[3].sensor_on,
                            ]
                            if (straights.some(v => v == true)) {
                                addTrafficAction(ACTIONS.EW_STRAIGHT)
                                addTrafficAction(ACTIONS.EW_LEFT)
                            } else {
                                addTrafficAction(ACTIONS.EW_LEFT_FLASH)
                            }
                            break;
                        case TURN.STRAIGHT:
                            addTrafficAction(ACTIONS.EW_STRAIGHT)

                            lefts = [
                                intersection["E"].lanes[0].sensor_on,
                                intersection["E"].lanes[1].sensor_on,
                                intersection["W"].lanes[0].sensor_on,
                                intersection["W"].lanes[1].sensor_on,
                            ]
                            if (lefts.some(v => v == true)) {
                                addTrafficAction(ACTIONS.EW_LEFT)
                            }
                            break;
                        case TURN.RIGHT:
                            addTrafficAction(ACTIONS.EW_STRAIGHT)
                            break;
                        default:
                            addTrafficAction(ACTIONS.EW_STRAIGHT)
                    }
                }
            }
        }

    }
    // time based, probably will do later. If not, you know what this might look like.
    if (!worldStateAndControls.useDynamic) {
        
    }
}

handleTrafficActionQueue = function() {
    if (!worldStateAndControls.trafficControlQueue.length) return
    action = worldStateAndControls.trafficControlQueue[0]
    done = false
    switch(action){
        case ACTIONS.NS_LEFT:
            done = switchLeftTurns(true, false)
            break;
        case ACTIONS.NS_LEFT_FLASH:
            done = switchLeftTurns(true, true)
            break;
        case ACTIONS.NS_STRAIGHT:
            done = switchForward(true)
            break;
        case ACTIONS.EW_LEFT:
            done = switchLeftTurns(false, false)
            break;
        case ACTIONS.EW_LEFT_FLASH:
            done = switchLeftTurns(false, true)
            break;
        case ACTIONS.EW_STRAIGHT:
            done = switchForward(false)
            break;
        default:
            console.error("Unrecognized control action:", action)
    }
    if (!done) return

    worldStateAndControls.lastTrafficControlAction = action
    worldStateAndControls.trafficControlQueue.shift()
}

/**
 * Ideally there would be a delay inbetween car added to lane and sensor on, but until we have moving vehicles on screen this is fine.
 **/
handleSensors = function() {
    if (!worldStateAndControls.useDynamic) {
        return
    }
    Object.keys(intersection).forEach(cardinal => {
        intersection[cardinal].lanes.forEach(l => {
            if (l.car_count > 0 && !l.sensor_on) {
                l.sensor_on = true
                l.sensor_on_since = new Date()

            }
            if (l.car_count == 0 && l.sensor_on) {
                l.sensor_on = false
                l.sensor_on_since = null
            } 
        })
    })
}

addCarToLane= function (laneId){
    dirLane = laneId % LANES_PER_SIDE
    cardinal = INT_TO_CARDINAL[(laneId - dirLane) / LANES_PER_SIDE]
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
        worldStateAndControls.lastCarSpawnLane = globalLane
    }

    if (TRAFFIC_TYPE.EVEN == worldStateAndControls.trafficCondition) {
        next = (worldStateAndControls.lastCarSpawnLane + 1) % 20
        addCarToLane(worldStateAndControls.lastCarSpawnLane)
        worldStateAndControls.lastCarSpawnLane = next
    }

    if (TRAFFIC_TYPE.HEAVY_EW == worldStateAndControls.trafficCondition) {
        useEW = (Math.floor(Math.random() * 10) + 1) <= 7 // (N * 10)% of traffic is on EW direcitons.
        side = Math.round(Math.random())
        lane = Math.floor(Math.random() * LANES_PER_SIDE)

        if (useEW) lane += 10
        if (side) lane += LANES_PER_SIDE
        addCarToLane(lane)
        worldStateAndControls.lastCarSpawnLane = lane
    }
}

/**
 * This is where the car's logic will check light states before "moving".
 * If we get to visual car sprites, this will be moved into a Car class which handles it's own state and speed and such.
 * 
 * For now though, this will just use the intersection states.
 * I will not be simulating crashes in here. If we get to the Car class, we can easily do that there.
 */
moveCars = function() {

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
        handleSensors()
        spawnCars()
        moveCars()
        trafficControl()
        handleTrafficActionQueue()
    }, 1000/FPS);
};

dostuff()