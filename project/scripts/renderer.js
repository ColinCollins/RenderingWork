// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// const Data = require('../lib/Data');
const { ipcRenderer } = require('electron');
const Program = require('./program');
const Vec2 = require('./Vec2');
const color = require('./color');
const utils = require('./utils');
const points = require('./points');

main();

function main () {
    ipcRenderer.send('Init-success');
}

ipcRenderer.on('load shader source', (e, sources) => {
     pointScene(sources);
    // #region
/*
    let currentAngle = 0.0;
    // rotation animation
     function tick () {
        currentAngle = animate(currentAngle);
        requestAnimationFrame(tick);
    }

    tick();
*/
// #endregion
});

function LineScene (sources) {
    let gl = InitScene(sources);
    BreshMenLine();
}

function pointScene (sources) {
    let gl = InitScene(sources);
    // draw randowm point at the canvas
    canvas.onmousedown = function (handle) {
        let location = getTouchPoint(handle);
        proxy.points.push(location);
        let tempColor = new color(1.0, 0.0, 0.0);
        proxy.colors.push(tempColor);
        points.drawPoint(gl, proxy, utils);
        // drawCircle(gl, proxy);
    }
}

// return back the webgl coordation point
function getTouchPoint (handle) {
    let x = handle.clientX;
    let y = handle.clientY;
    let rect = handle.target.getBoundingClientRect();
    x = ((x - rect.left) - canvasWidth / 2) / (canvasWidth / 2);
    y = (canvasHeight / 2 - (y - rect.top)) / (canvasHeight / 2);

    return new Vec2(x, y);
}

function getAttribProp (gl, program, name) {
    let prop = gl.getAttribLocation(program, name);
    if (prop < 0) {
        console.error('attribute prop init failed.');
        return null;
    }
    return prop;
}

function getUniformProp (gl, program, name) {
    let prop = gl.getUniformLocation(program, name);
    if(!prop) {
        console.error('uniform prop init failed.');
        return null;
    }
    return prop;
}

function InitScene (sources) {
    window.canvas = $('#webgl')[0];
    window.canvasWidth = canvas.width;
    window.canvasHeight = canvas.height;

    window.gl = getWebGLContext(canvas);
    log(`Init gl: ${gl}`);

    window.proxy = new Program(gl, sources.vshaderSource, sources.fshaderSource);
    log(`Init program: ${proxy}`);

    gl.useProgram(proxy.program);

    proxy.a_Position = getAttribProp(gl, proxy.program, 'a_Position');
    proxy.a_Color = getAttribProp(gl, proxy.program, 'a_Color');
    proxy.points = [];
    proxy.colors = [];

    return gl;
}

let angleStep = 0;
let data = new Date();

function animate (angle) {
    let now = new Date();
    let elapse = now - data;
    data = now;
    let newAngle = angle + (angleStep * elapse) / 1000.0;
    return newAngle % 360;
}