"use strict";
//it will be handy to have references to some of our WebGL related objects
var gl;
var canvas;
var program;
var bufferId;

var umv;
var uproj;

var carx;
var cary;
var carz;

var moving;
var wheelRotation;
var shapePoints;
var carposition;

var lookatx;
var lookaty;
var lookatz;

var fileExists;

var railtieStart;
var railtieLength;
var railstart;
var railLength;
var carStart;
var carLength;
var wheelfaceStart;
var wheelfaceLength;
var wheelrimStart;
var wheelrimLength;
var riderHeadStart;
var riderHeadLength;
var riderGlassesStart;
var riderGlassesLength;

var riderRotation;

var lensZoom;
var dollyZoom;
var cameraLookAt;
var camera;


window.onload = function init() {

    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("WebGL isn't available");
    }

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    umv = gl.getUniformLocation(program, "model_view");
    uproj = gl.getUniformLocation(program, "projection");

    // Initialize global variables
    carposition = [0, 0, 0, -1, 0, 0];
    fileExists = false;
    carx = 0;
    cary = 1;
    carz = 2;
    lookatx = 0;
    lookaty = 20;
    lookatz = 40;
    riderRotation = 0;
    lensZoom = 0;
    dollyZoom = 0;
    cameraLookAt = 0;
    camera = 0;

    window.addEventListener("keydown", function(event) {
        switch (event.key) {
            // "m" makes the car move
            case "m":
                if (moving) {
                    moving = false;
                } else {
                    moving = true;
                }
                break;
            case "ArrowLeft": //left
                if(riderRotation>-60) {
                    riderRotation=riderRotation-3;
                }
                break;
            case "ArrowRight": //right
                if(riderRotation<60) {
                    riderRotation=riderRotation+3;
                }
                break;
            case "z": // lens zoom in
                if(lensZoom<40) {
                    lensZoom++;
                }
                break;
            case "x": // lens zoom out
                if(lensZoom>-40) {
                    lensZoom--;
                }
                break;
            case "r": // reset lens
                lensZoom = 0;
                dollyZoom = 0;
                break;
            case "q": // dolly in
                if(dollyZoom<10) {
                    dollyZoom++;
                }
                break;
            case "e": // dolly out
                if(dollyZoom>-15) {
                    dollyZoom--;
                }
                break;
            case "f": // toggle between looking at origin and looking at car
                if(cameraLookAt === 0) {
                    cameraLookAt = 1;
                }
                else {
                    cameraLookAt = 0;
                }
                break;
            case "c": // toggle between camera angles (free, perspective, reaction)
                if(camera === 0) {
                    camera = 1;
                } else if(camera === 1) {
                    camera = 2;
                } else if(camera === 2) {
                    camera = 0;
                }
                break;
            // various camera angles for testing purposes
            case "0":
                lookatx = 20;
                lookaty = 10;
                lookatz = 20;
                break;
            case "9":
                lookatx = 0;
                lookaty = 20;
                lookatz = 40;
                break;
            case "8":
                lookatx = 0;
                lookaty = 50;
                lookatz = 1;
                break;

        }
        requestAnimationFrame(render);
    });

    // Parse text file data
    var fileInput = document.getElementById("fileInput");
    fileInput.addEventListener('change', function(e) {
        var file = fileInput.files[0];
        var textType = /text.*/;
        if (file.type.match(textType)) {

            var reader = new FileReader();
            reader.onload = function(e) {
                parseData(reader.result); //ok, we have our data, so parse it
                requestAnimationFrame(render); //ask for a new frame
            };
            reader.readAsText(file);
            fileExists = true;
        } else {
            console.log("File not supported: " + file.type + ".");
            fileExists = false;
        }
    });

    makeShapes();
    bufferShapes();

    //we'll talk more about this in a future lecture, but this is saying what part of the canvas
    //we want to draw to.  In this case, that's all of it.
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Background color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //we need to do this to avoid having objects that are behind other objects show up anyway
    gl.enable(gl.DEPTH_TEST);


    window.setInterval(update, 16); //target 60 frames per second
};

// Parse the track data
function parseData(input) {

    makeShapes();

    railtieStart = shapePoints.length/2;

    // This is a 3D rail tie
    shapePoints.push(vec4(1.5, 0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, 0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, -0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, -0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(1.5, -0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(1.5, 0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown

    shapePoints.push(vec4(1.5, 0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, 0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, -0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, -0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(1.5, -0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(1.5, 0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown

    shapePoints.push(vec4(1.5, 0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, 0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(1.5, 0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(1.5, 0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, 0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, 0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown

    shapePoints.push(vec4(1.5, -0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, -0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(1.5, -0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(1.5, -0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, -0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, -0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown

    shapePoints.push(vec4(1.5, 0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(1.5, -0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(1.5, -0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(1.5, -0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(1.5, 0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(1.5, 0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown

    shapePoints.push(vec4(-1.5, 0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, -0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, -0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, -0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, 0.1, -0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown
    shapePoints.push(vec4(-1.5, 0.1, 0.1, 1.0));
    shapePoints.push(vec4(0.5, 0.3, 0.1, 1.0)); // brown

    railtieLength = shapePoints.length/2 - railtieStart;
    railstart = shapePoints.length/2;

    // The rails
    shapePoints.push(vec4(-0.1, 0.2, 0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(-0.1, 0.2, 0.8, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(0.1, 0.2, 0.8, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(0.1, 0.2, 0.8, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(0.1, 0.2, 0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(-0.1, 0.2, 0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black

    shapePoints.push(vec4(-0.1, 0.4, 0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(-0.1, 0.4, 0.8, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(0.1, 0.4, 0.8, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(0.1, 0.4, 0.8, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(0.1, 0.4, 0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(-0.1, 0.4, 0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black

    shapePoints.push(vec4(-0.1, 0.4, 0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(-0.1, 0.4, 0.8, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(-0.1, 0.2, 0.8, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(-0.1, 0.2, 0.8, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(-0.1, 0.4, 0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(-0.1, 0.2, 0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black

    shapePoints.push(vec4(0.1, 0.4, 0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(0.1, 0.4, 0.8, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(0.1, 0.2, 0.8, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(0.1, 0.2, 0.8, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(0.1, 0.4, 0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black
    shapePoints.push(vec4(0.1, 0.2, 0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // black

    railLength = shapePoints.length/2 - railstart;

    carposition = input.split(/\s+/); //split on white space

    // scale the track points down
    for (var i = 0; i < carposition.length; i++) {
        carposition[i] = carposition[i] * 0.2;
    }

    bufferShapes();
}

//Make the ground and send it over to the graphics card
function makeShapes() {
    shapePoints = [];

    // The ground
    shapePoints.push(vec4(20, -20, 0.0, 1.0));
    shapePoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green
    shapePoints.push(vec4(20, 20, 0.0, 1.0));
    shapePoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green
    shapePoints.push(vec4(-20, 20, 0.0, 1.0));
    shapePoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green
    shapePoints.push(vec4(-20, -20, 0.0, 1.0));
    shapePoints.push(vec4(0.0, 1.0, 0.0, 1.0)); //green

    carStart = shapePoints.length/2;

    // The car
    // red side
    shapePoints.push(vec4(1.5, -0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(1.5, 0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, 0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(1.5, -0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, -0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, 0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 0.0, 0.0, 1.0)); //color

    // blue side
    shapePoints.push(vec4(1.5, -0.5, 1.0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(1.5, 0.5, 1.0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, 0.5, 1.0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(1.5, -0.5, 1.0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, -0.5, 1.0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, 0.5, 1.0, 1.0));
    shapePoints.push(vec4(0.0, 0.0, 1.0, 1.0)); //color

    // magenta side
    shapePoints.push(vec4(1.5, -0.5, 1.0, 1.0));
    shapePoints.push(vec4(1.0, 0.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(1.5, 0.5, 1.0, 1.0));
    shapePoints.push(vec4(1.0, 0.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(1.5, 0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 0.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(1.5, -0.5, 1.0, 1.0));
    shapePoints.push(vec4(1.0, 0.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(1.5, -0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 0.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(1.5, 0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 0.0, 1.0, 1.0)); //color

    // cyan side
    shapePoints.push(vec4(-1.5, -0.5, 1.0, 1.0));
    shapePoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, 0.5, 1.0, 1.0));
    shapePoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, 0.5, -1.0, 1.0));
    shapePoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, -0.5, 1.0, 1.0));
    shapePoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, -0.5, -1.0, 1.0));
    shapePoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, 0.5, -1.0, 1.0));
    shapePoints.push(vec4(0.0, 1.0, 1.0, 1.0)); //color

    // yellow side
    shapePoints.push(vec4(1.5, -0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(1.5, -0.5, 1.0, 1.0));
    shapePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, -0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(1.5, -0.5, 1.0, 1.0));
    shapePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, -0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, -0.5, 1.0, 1.0));
    shapePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //color

    // top yellow side
    shapePoints.push(vec4(1.5, 0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(1.5, 0.5, 1.0, 1.0));
    shapePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, 0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(1.5, 0.5, 1.0, 1.0));
    shapePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, 0.5, -1.0, 1.0));
    shapePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //color
    shapePoints.push(vec4(-1.5, 0.5, 1.0, 1.0));
    shapePoints.push(vec4(1.0, 1.0, 0.0, 1.0)); //color

    carLength = shapePoints.length/2 - carStart;

    // TODO use define statements to give names to the indices
    // TODO use a seperate file with the indices for different objects (mesh)?

    // wheels
    var vertexNum = 50;
    moving = false;
    wheelRotation = 0;

    wheelfaceStart = shapePoints.length/2;

    for (var i = 0; i < vertexNum; i++) {
        var percent = i / (vertexNum - 1);
        var radians = 2 * Math.PI * percent;
        var x = 0.0 + 0.5 * Math.cos(radians);
        var y = 0.0 + 0.5 * Math.sin(radians);
        shapePoints.push(vec4(x, y, 0, 1.0));
        if (i % 2 == 0) {
            shapePoints.push(vec4(1.0, 1.0, 1.0, 1.0));

        } else {
            shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0));
        }
    }

    wheelfaceLength = shapePoints.length/2 - wheelfaceStart;
    wheelrimStart = shapePoints.length/2;

    // wheel rim
    for (var i = 0; i < vertexNum; i++) {
        var percent = i / (vertexNum - 1);
        var radians = 2 * Math.PI * percent;
        var x = 0.5 * Math.cos(radians);
        var y = 0.5 * Math.sin(radians);
        shapePoints.push(vec4(x, y, -0.125, 1.0));
        shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0));
        shapePoints.push(vec4(x, y, 0.125, 1.0));
        shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0));
    }

    wheelrimLength = shapePoints.length/2 - wheelrimStart;

    createRider(15);

    bufferShapes();
}

function createRider(subdiv){

    var step = (360.0 / subdiv)*(Math.PI / 180.0); //how much do we increase the angles by per triangle?
    
    // Create rider's head
    riderHeadStart = shapePoints.length/2;

    for (var lat = 0; lat <= Math.PI ; lat += step){ //latitude
        for (var lon = 0; lon + step <= 2*Math.PI; lon += step){ //longitude
            //triangle 1
            shapePoints.push(vec4(0.6*Math.sin(lat)*Math.cos(lon), 0.6*Math.sin(lon)*Math.sin(lat), 0.6*Math.cos(lat), 1.0)); //position
            shapePoints.push(vec4(0.6*Math.sin(lat)*Math.cos(lon), 0.6*Math.sin(lon)*Math.sin(lat), 0.6*Math.cos(lat), 0.0)); //normal
            shapePoints.push(vec4(0.6*Math.sin(lat)*Math.cos(lon+step), 0.6*Math.sin(lat)*Math.sin(lon+step), 0.6*Math.cos(lat), 1.0)); //position
            shapePoints.push(vec4(0.6*Math.sin(lat)*Math.cos(lon+step), 0.6*Math.sin(lat)*Math.sin(lon+step), 0.6*Math.cos(lat), 0.0)); //normal
            shapePoints.push(vec4(0.6*Math.sin(lat+step)*Math.cos(lon+step), 0.6*Math.sin(lon+step)*Math.sin(lat+step), 0.6*Math.cos(lat+step), 1.0)); //etc
            shapePoints.push(vec4(0.6*Math.sin(lat+step)*Math.cos(lon+step), 0.6*Math.sin(lon+step)*Math.sin(lat+step), 0.6*Math.cos(lat+step), 0.0));

            //triangle 2
            shapePoints.push(vec4(0.6*Math.sin(lat+step)*Math.cos(lon+step), 0.6*Math.sin(lon+step)*Math.sin(lat+step), 0.6*Math.cos(lat+step), 1.0));
            shapePoints.push(vec4(0.6*Math.sin(lat+step)*Math.cos(lon+step), 0.6*Math.sin(lon+step)*Math.sin(lat+step), 0.6*Math.cos(lat+step), 0.0));
            shapePoints.push(vec4(0.6*Math.sin(lat+step)*Math.cos(lon), 0.6*Math.sin(lat+step)*Math.sin(lon), 0.6*Math.cos(lat+step), 1.0));
            shapePoints.push(vec4(0.6*Math.sin(lat+step)*Math.cos(lon), 0.6*Math.sin(lat+step)*Math.sin(lon), 0.6*Math.cos(lat+step),0.0));
            shapePoints.push(vec4(0.6*Math.sin(lat)*Math.cos(lon), 0.6*Math.sin(lon)*Math.sin(lat), 0.6*Math.cos(lat), 1.0));
            shapePoints.push(vec4(0.6*Math.sin(lat)*Math.cos(lon), 0.6*Math.sin(lon)*Math.sin(lat), 0.6*Math.cos(lat), 0.0));
        }
    }

    riderHeadLength = shapePoints.length/2 - riderHeadStart;

    // Create rider's glasses
    riderGlassesStart = shapePoints.length/2;

    var vertexNum = 50;
    for (var i = 0; i < vertexNum; i++) {
        var percent = i / (vertexNum - 1);
        var radians = 2 * Math.PI * percent;
        var x = 0.2 * Math.cos(radians);
        var y = 0.2 * Math.sin(radians);
        shapePoints.push(vec4(x, y, 0, 1.0));
        shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0));
    }

    riderGlassesLength = shapePoints.length/2 - riderGlassesStart;
}

// Simple buffer method
function bufferShapes() {
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(shapePoints), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");

    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(vPosition);

    var vColor = gl.getAttribLocation(program, "vColor");

    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 32, 16);
    gl.enableVertexAttribArray(vColor);
}

function update() {
    if (moving) {
        wheelRotation -= 10
        // if it's back at the beginning, set back to 0 1 and 2
        if (fileExists) {
            if (carx < carposition.length) {
                carx += 3%(carposition.length);
                cary += 3%(carposition.length);
                carz += 3%(carposition.length);
            } else {
                carx = 0;
                cary = 1;
                carz = 2;
            }
        }
    }
    requestAnimationFrame(render);
}

function render() {
    // Clear previous color and buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // now set up the model view matrix and send it over as a uniform
    // Roaming camera
    if(camera === 0) {

        var p = perspective(45.0+lensZoom, canvas.width / canvas.height, 1.0, 100.0);
        gl.uniformMatrix4fv(uproj, false, flatten(p));

        if (cameraLookAt === 1 && fileExists) {
            var mv = lookAt(vec3(lookatx, lookaty - dollyZoom, lookatz - (2 * dollyZoom)), vec3(carposition[carx], carposition[cary], carposition[carz]), vec3(0, 1, 0));
        } else {
            var mv = lookAt(vec3(lookatx, lookaty - dollyZoom, lookatz - (2 * dollyZoom)), vec3(0, 0, 0), vec3(0, 1, 0));
        }
    // Viewpoint camera
    } else if(camera === 1) {

        var p = perspective(70, canvas.width / canvas.height, 1.0, 100.0);
        gl.uniformMatrix4fv(uproj, false, flatten(p));

        var tempUp = normalize(vec3(0, 1, 0));
        var point = vec3(carposition[carx], carposition[cary], carposition[carz]);
        var point2 = vec3(carposition[(carx + 3) % (carposition.length)], carposition[(cary + 3) % (carposition.length)], carposition[(carz + 3) % (carposition.length)]);
        var forward = normalize(subtract(point2, point));
        var right = normalize(cross(forward, tempUp));
        var up = normalize(cross(forward, right));
        var cameraPoint = add(point, scale(-3, up)); // This is the origin of the camera
        var cameraF = add(add(add(point2, scale(-2.5, up)), scale(6, forward)), scale(riderRotation/6, right)); // This is where the camera is pointing

        var mv = lookAt(cameraPoint, cameraF, vec3(0, 1, 0));
    // Reaction camera
    } else {

        var p = perspective(45.0+lensZoom, canvas.width / canvas.height, 1.0, 100.0);
        gl.uniformMatrix4fv(uproj, false, flatten(p));

        var tempUp = normalize(vec3(0, 1, 0));
        var point = vec3(carposition[carx], carposition[cary], carposition[carz]);
        var point2 = vec3(carposition[(carx + 3) % (carposition.length)], carposition[(cary + 3) % (carposition.length)], carposition[(carz + 3) % (carposition.length)]);
        var forward = normalize(subtract(point2, point));
        var right = normalize(cross(forward, tempUp));
        var up = normalize(cross(forward, right));
        var cameraPoint = add(add(add(point, scale(7, forward)), scale(riderRotation/6, right)), scale(-3, up)); // This is the origin of the camera
        var cameraF = add(point2, scale(-1, up)); // This is where the camera is pointing

        var mv = lookAt(cameraPoint, cameraF, vec3(0, 1, 0));
    }
    var newmv = mult(mv, rotateX(90));

    gl.uniformMatrix4fv(umv, false, flatten(newmv));

    //we only have one object at the moment, but just so we don't forget this step later...
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    //draw the geometry we previously sent over.  It's a list of 12 triangle(s),
    //we want to start at index 0, and there will be a total of 36 vertices (6 faces with 6 vertices each)

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // draw the ground

    // Create the transform matrix
    if (fileExists) {
        var tempUp = normalize(vec4(0, 1, 0, 0));
        var forward = normalize(subtract(vec4(carposition[(carx + 3) % (carposition.length)], carposition[(cary + 3) % (carposition.length)], carposition[(carz + 3) % (carposition.length)], 1),
            vec4(carposition[carx], carposition[cary], carposition[carz], 1)));
        // TODO figure out this error thing
        // console.log("this one: " + carx + cary + carz);
        // console.log("next one:" + (carx + 3) % (carposition.length) + (cary + 3) % (carposition.length) + (carz + 3) % (carposition.length));
        var right = vec4(normalize(cross(forward, tempUp)), 0);
        var point = vec4(carposition[carx], carposition[cary], carposition[carz], 1);
        var up = vec4(normalize(cross(forward, right)), 0);
        var transformMatrix = transpose(mat4(right, up, forward, point)); // transpose because mat4 uses rows to make mat4
        var matrix = mult(mv, transformMatrix);
        matrix = mult(matrix, translate(0, -1.5, 0));
        matrix = mult(matrix, rotateY(90));
    } else {
        // If there isn't a loaded file, give this default transformation matrix
        matrix = mv;
        matrix = mult(matrix, translate(0, 1, 0));
        matrix = mult(matrix, rotateX(180));
    }

    newmv = matrix;
    newmv = mult(newmv, rotateX(180));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLES, carStart, carLength); // draw the car

    newmv = matrix;
    newmv = mult(newmv, translate(0, -1, 0));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLES, riderHeadStart, riderHeadLength); // draw the rider

    newmv = matrix;
    newmv = mult(newmv, rotateY(riderRotation));
    newmv = mult(newmv, translate(-0.6, -1, 0.25));
    newmv = mult(newmv, rotateY(90));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_FAN, riderGlassesStart, riderGlassesLength); // draw the glasses

    newmv = matrix;
    newmv = mult(newmv, rotateY(riderRotation));
    newmv = mult(newmv, translate(-0.6, -1, -0.25));
    newmv = mult(newmv, rotateY(90));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_FAN, riderGlassesStart, riderGlassesLength); // draw the glasses

    // wheels
    // wheel 1
    newmv = matrix;
    newmv = mult(newmv, translate(1, 0.5, 1.20));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_FAN, wheelfaceStart, wheelfaceLength);
    newmv = matrix;
    newmv = mult(newmv, translate(1, 0.5, 1.125));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_STRIP, wheelrimStart, wheelrimLength);

    // wheel 2
    newmv = matrix;
    newmv = mult(newmv, translate(-1, 0.5, 1.20));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_FAN, wheelfaceStart, wheelfaceLength);
    newmv = matrix;
    newmv = mult(newmv, translate(-1, 0.5, 1.125));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_STRIP, wheelrimStart, wheelrimLength);

    // wheel 3
    newmv = matrix;
    newmv = mult(newmv, translate(1, 0.5, -1.20));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_FAN, wheelfaceStart, wheelfaceLength);
    newmv = matrix;
    newmv = mult(newmv, translate(1, 0.5, -1.125));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_STRIP, wheelrimStart, wheelrimLength);

    // wheel 4
    newmv = matrix;
    newmv = mult(newmv, translate(-1, 0.5, -1.20));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_FAN, wheelfaceStart, wheelfaceLength);
    newmv = matrix;
    newmv = mult(newmv, translate(-1, 0.5, -1.125));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_STRIP, wheelrimStart, wheelrimLength);

    // make the track
    if (fileExists) {
        for (var i = 0; i < carposition.length; i += 3) {
            var tempUp = normalize(vec4(0, 1, 0, 0));
            var forward = normalize(subtract(vec4(carposition[(i + 3) % (carposition.length)], carposition[(i + 4) % (carposition.length)], carposition[(i + 5) % (carposition.length)], 1),
                vec4(carposition[i], carposition[i + 1], carposition[i + 2], 1)));
            var right = vec4(normalize(cross(forward, tempUp)), 0);
            var point = vec4(carposition[i], carposition[i + 1], carposition[i + 2], 1);
            var up = vec4(normalize(cross(forward, right)), 0);
            // Lecture 9 slide 11
            var transformMatrix = transpose(mat4(right, up, forward, point)); // transpose because mat4 uses rows to make mat4
            var matrix = mult(mv, transformMatrix);
            matrix = mult(matrix, rotateX(180));
            gl.uniformMatrix4fv(umv, false, flatten(matrix));
            gl.drawArrays(gl.TRIANGLES, railtieStart, railtieLength);
            // draw the rails
            newmv = mult(matrix, translate(-1, 0, 0, 0));
            gl.uniformMatrix4fv(umv, false, flatten(newmv));
            gl.drawArrays(gl.TRIANGLES, railstart, railLength);
            newmv = mult(matrix, translate(1, 0, 0, 0));
            gl.uniformMatrix4fv(umv, false, flatten(newmv));
            gl.drawArrays(gl.TRIANGLES, railstart, railLength);
        }
    }
}
