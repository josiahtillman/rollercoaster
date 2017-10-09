"use strict";
//it will be handy to have references to some of our WebGL related objects
var gl;
var canvas;
var program;
var bufferId;

var umv;
var uproj;

var groundx;
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
    carposition = 0;
    fileExists = false;
    carx = 0;
    cary = 1;
    carz = 2;
    lookatx = 0;
    lookaty = 20;
    lookatz = 40;

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

    // red side
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

    // TODO use define statements to give names to the indices
    // TODO use a seperate file with the indices for different objects (mesh)?

    // wheels
    var vertexNum = 50;
    moving = false;
    wheelRotation = 0;

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

    // wheel rim
    for (var i = 0; i < vertexNum; i++) {
        var percent = i / (vertexNum - 1);
        var radians = 2 * Math.PI * percent;
        var x = 0.0 + 0.5 * Math.cos(radians);
        var y = 0.0 + 0.5 * Math.sin(radians);
        shapePoints.push(vec4(x, y, -0.125, 1.0));
        shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0));
        shapePoints.push(vec4(x, y, 0.125, 1.0));
        shapePoints.push(vec4(0.0, 0.0, 0.0, 1.0));
    }

    groundx = 90

    bufferShapes();
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

    //we'll discuss projection matrices in a couple of days, but use this for now:
    var p = perspective(45.0, canvas.width / canvas.height, 1.0, 100.0);
    gl.uniformMatrix4fv(uproj, false, flatten(p));

    //now set up the model view matrix and send it over as a uniform
    //the inputs to this lookAt are to move back 20 units, point at the origin, and the positive y axis is up
    var mv = lookAt(vec3(lookatx, lookaty, lookatz), vec3(0, 0, 0), vec3(0, 1, 0));
    var newmv = mult(mv, rotateX(groundx));

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
        matrix = mv;
        matrix = mult(matrix, translate(0, 1, 0));
        matrix = mult(matrix, rotateX(180));
    }

    newmv = matrix;
    newmv = mult(newmv, rotateX(180));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLES, 4, 30); // draw the car

    // wheels
    // wheel 1
    newmv = matrix;
    newmv = mult(newmv, translate(1, 0.5, 1.20));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_FAN, 34, 50);
    newmv = matrix;
    newmv = mult(newmv, translate(1, 0.5, 1.125));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_STRIP, 84, 100);

    // wheel 2
    newmv = matrix;
    newmv = mult(newmv, translate(-1, 0.5, 1.20));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_FAN, 34, 50);
    newmv = matrix;
    newmv = mult(newmv, translate(-1, 0.5, 1.125));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_STRIP, 84, 100);

    // wheel 3
    newmv = matrix;
    newmv = mult(newmv, translate(1, 0.5, -1.20));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_FAN, 34, 50);
    newmv = matrix;
    newmv = mult(newmv, translate(1, 0.5, -1.125));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_STRIP, 84, 100);

    // wheel 4
    newmv = matrix;
    newmv = mult(newmv, translate(-1, 0.5, -1.20));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_FAN, 34, 50);
    newmv = matrix;
    newmv = mult(newmv, translate(-1, 0.5, -1.125));
    newmv = mult(newmv, rotateZ(wheelRotation));
    gl.uniformMatrix4fv(umv, false, flatten(newmv));
    gl.drawArrays(gl.TRIANGLE_STRIP, 84, 100);

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
            gl.drawArrays(gl.TRIANGLES, 184, 36);
            // draw the rails
            newmv = mult(matrix, translate(-1, 0, 0, 0));
            gl.uniformMatrix4fv(umv, false, flatten(newmv));
            gl.drawArrays(gl.TRIANGLES, 220, 24);
            newmv = mult(matrix, translate(1, 0, 0, 0));
            gl.uniformMatrix4fv(umv, false, flatten(newmv));
            gl.drawArrays(gl.TRIANGLES, 220, 24);
        }
    }
    // Pseudo code for this loop ^
    // initialize mv
    // for loop {
    //     create transformMatrix
    //     mult(mv, transformMatrix)
    //     send to Graphics card
    //     draw
    // }
}
