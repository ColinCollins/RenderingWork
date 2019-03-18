// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// const Data = require('../lib/Data');
const { ipcRenderer } = require('electron');
const Program = require('./program');
const drawPoints = require('./drawPoints');
const lines = require('./lines');
const triangles = require('./triangle');

main();

function main () {
    ipcRenderer.send('Init-success');
}

ipcRenderer.on('load shader source', (e, sources) => {
    // pointScene(sources);
    // lineScene(sources);
     triangleScene(sources);
    // translateScene(sources);
    // cubeScene(sources);
    // pointLightScene(sources);
    // textureScene(sources);
});

// #region triangle
function triangleScene (sources) {
    InitScene(sources);
     normalFillTriangle();
    // myownFillTriangle();
}

function normalFillTriangle () {
    for (let i = 0; i < 10; i++) {
        let tempColor = new Color().random;
        let point1 = new Point(getRandomVec (), tempColor);
        tempColor = new Color().random;
        let point2 = new Point(getRandomVec (), tempColor);
        tempColor = new Color().random;
        let point3 = new Point(getRandomVec (), tempColor);
        let points = triangles.normalFillTriangle(point1, point2, point3, lines);
        if (points) {
            proxy.points = proxy.points.concat(points);
            drawPoints.drawPoint(gl, proxy);
        }
    }

    function getRandomVec () {
        let width = Math.ceil(Math.random() * canvasWidth) - (canvasWidth / 2);
        let height = Math.ceil(Math.random() * canvasHeight) - (canvasHeight / 2);
        return new Vec3(width, height);;
    }
}

function myownFillTriangle () {
    for (let i = 0; i < 10; i++) {
        let tempColor = new Color().random;
        let point1 = new Point(getRandomVec (), tempColor);
        let point2 = new Point(getRandomVec (), tempColor);
        let point3 = new Point(getRandomVec (), tempColor);
        let points = triangles.myownFillTriangle(point1, point2, point3, lines);
        proxy.points = proxy.points.concat(points);
        drawPoints.drawPoint(gl, proxy);
    }

    function getRandomVec () {
        let width = Math.ceil(Math.random() * canvasWidth) - (canvasWidth / 2);
        let height = Math.ceil(Math.random() * canvasHeight) - (canvasHeight / 2);
        return new Vec3(width, height);;
    }
}
// #endregion

// #region Line
function lineScene (sources) {
    InitScene(sources);
    /* get the pos1, pos2 */
    // BresenhamLine();
     CohenSutherland();
}

function CohenSutherland () {
    for (let i = 0; i < 100; i++) {
        let tempColor = new Color().random;
        let point1 = new Point(getRandomVec(), tempColor);
        tempColor = new Color().random;
        log(`CohenSutherLen tempColor: ${tempColor.r} : ${tempColor.g} : ${tempColor.b}`, false);
        let point2 = new Point(getRandomVec(), tempColor);

        let points = lines.CohenSutherland(point1, point2);
        proxy.points = proxy.points.concat(points);
        drawPoints.drawPoint(gl, proxy);
    }

    function getRandomVec () {
        let width = Math.ceil(Math.random() * canvasWidth);
        width = Math.random() > 0.6 ? width : -width;
        let height = Math.ceil(Math.random() * canvasHeight);
        height = Math.random() > 0.6 ? height : -height;
        return new Vec3(width, height);
    }
}

function BresenhamLine () {
    for (let i = 0; i < 100; i++) {
        let tempColor = new Color().random;
        let point1 = new Point(getRandomVec (), tempColor);
        let point2 = new Point(getRandomVec (), tempColor);

        let points = lines.BresenhamLine(point1, point2);
        proxy.points = proxy.points.concat(points);
        drawPoints.drawPoint(gl, proxy);
    }

    function getRandomVec () {
        let width = Math.ceil(Math.random() * canvasWidth) - (canvasWidth / 2);
        let height = Math.ceil(Math.random() * canvasHeight) - (canvasHeight / 2);
        return new Vec3(width, height);;
    }
}
// #endregion

// #region point
function pointScene (sources) {
    InitScene(sources);
    // draw randowm point at the canvas
    canvas.onmousedown = function (handle) {
        let location = getTouchPoint(handle);
        let tempPoint = new Point(location, new color(1.0, 0.0, 0.0));
        proxy.points.push(tempPoint);
        drawPoints.drawPoint(gl, proxy);
        // drawPoints.drawCircle(gl, proxy, 10.0);
    }
}

// return back the webgl coordation point
function getTouchPoint (handle) {
    let x = handle.clientX;
    let y = handle.clientY;
    let rect = handle.target.getBoundingClientRect();
    x = ((x - rect.left) - canvasWidth / 2) / (canvasWidth / 2);
    y = (canvasHeight / 2 - (y - rect.top)) / (canvasHeight / 2);

    return new Vec3(x, y);
}

// #endregion

function InitScene (sources) {
    window.canvas = $('#webgl')[0];
    window.canvasWidth = canvas.width;
    window.canvasHeight = canvas.height;

    window.gl = getWebGLContext(canvas);
    log(`Init gl: ${gl}`);

    window.proxy = new Program(gl, sources.vshaderSource, sources.fshaderSource);
    log(`Init program: ${proxy}`);

    gl.useProgram(proxy.program);
    /* attribute */
    proxy.a_Position = getAttribProp(gl, proxy.program, 'a_Position');
    proxy.a_Color = getAttribProp(gl, proxy.program, 'a_Color');
    /* uniform */
    proxy.u_PointSize = getUniformProp(gl, proxy.program, 'u_PointSize');
    gl.uniform1f(proxy.u_PointSize, 2.0);

    /* prototype */
    proxy.points = [];
    return;
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