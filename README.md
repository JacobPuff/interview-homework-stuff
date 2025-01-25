# Intersections interview homework

Alright! This is a project I did for an interview take-home assignment.

Between the options of a spellchecker cli tool and a simulated intersection, I am going with the latter. I've spent a lot of time stuck in traffic thinking about traffic control systems, and I think it would be fun.

## The Plan™

Because this project has quickly creeped up in scope in my head, I'm writing down a list of stuff I'm thinking about beforehand. It gives me a list to work down.

This will be a project using the HTML5 canvas for the UI, because it's a pretty easy API to use for displaying stuff in the browser, and super easy to run.

Features I'm shooting for:
- Two different types of control systems:
    - Time based
    - Dynamic (meaning there are sensors in the ground)
- Two different traffic patterns:
    - Random
    - E/W heavy (like side streets turning on to a highway)
    - Maybe a super even round robin? Not the most interesting, so maybe not.
- Manual controls for adding cars to lanes
- Fun UI elements instead of probably a text based skeleton. I want cars to be shown turning! Fancy looking traffic lights! Maybe even sprites!
- A "historical" toggle for each of the control systems to _supplement_ the control system with historical traffic data, allowing for changes on the fly.

To do all of this in a way that is sane given the scope creep and the time frame, we need to make some assumptions.

Assumptions and asterisks:
- We are assuming that this is a very isolated intersection. If one of the roads was coming off from a high throughput road like a freeway, that would *vastly* affect the system designed.
- We will not be handling emergency vehicles in our simulation
- We will not be handling large semi trucks in our simulation
- Normally a traffic study would be used to determine how an intersection should work. I'm gonna just be fiddling with values until I like it. Like how long the yellow light is on for is going to be different depending on the speed limit of the road.
- This is a simulation! The real world is awfully wiggly, and we're going to assume a variety of things that are less consistent IRL:
    - People don't stop in the intersection blocking traffic.
    - Traffic cannot back up to this intersection
    - The sensors are perfect, and will never give false positive/negative results
    - If I get to the historical data toggle, the sensors can totally sense a car whipping by at 55mph to record that.