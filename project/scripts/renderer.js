// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// const Data = require('../lib/Data');
const { ipcRenderer } = require('electron');
const Program = require('./program');
const utils = require('./utils');
const drawMain = require('./drawMain');
const drawLines = require('./drawLines');

main();

function main () {
    ipcRenderer.send('Init-success');
}

ipcRenderer.on('load shader source', (e, sources) => {
    // pointScene(sources);
    // line 不能使用 depth 检测
    // lineScene(sources);
     triangleScene(sources);
    // translateScene(sources);
    // textureScene(sources);
    // cubeScene(sources);
    // pointLightScene(sources);
});

// #region translate
/*
    Checking move, scale, rotate, skew
*/
function translateScene (sources) {
    InitScene(sources);
    // 综合就行
    let color1 = new Color().random;
    let color2 = new Color().random;
    let color3 = new Color().random;

    // translate
    clearCanvas();
    // setIn
    let pos1 = new Vector3([100, 0, 0]);
    let pos2 = new Vector3([-100, 0, 0]);
    let pos3 = new Vector3([0, 150, 0]);

    // draw(pos1, pos2, pos3, color1, color2, color3);

    function drawTranslate (pos1, pos2, pos3, color1, color2, color3) {
        let point1 = new Point(pos1, color1);
        let point2 = new Point(pos2, color2);
        let point3 = new Point(pos3, color3);
        let points = triangles.normalFillTriangle(point1, point2, point3, lines);
        if (points) {
            proxy.points = proxy.points.concat(points);
            drawPoints.drawPoint(gl, proxy);
        }
        else {
            warn(`drawTriangle get Error`);
        }
    }
}

// #endregion

// #region triangle
function triangleScene (sources) {
    InitScene(sources);
     normalFillTriangle();
    // myownFillTriangle();
}

function normalFillTriangle () {
    // Random Triangle generator
    for (let i = 0; i < 10; i++) {
        let tempColor = new Color().random;
        let point1 = new Point(getRandomVec (), tempColor);
        tempColor = new Color().random;
        let point2 = new Point(getRandomVec (), tempColor);
        tempColor = new Color().random;
        let point3 = new Point(getRandomVec (), tempColor);

        utils.trianglesBuffer.push(new Triangle(point1, point2, point3));
    }
    // utils.isDepth = true;
    // isContain Test
/*
    let tempColor = new Color().random;
    let point1 = new Point(new Vec3(-100, 0), tempColor);
    tempColor = new Color().random;
    let point2 = new Point(new Vec3(100, 0), tempColor);
    tempColor = new Color().random;
    let point3 = new Point(new Vec3(0, 150), tempColor);
    utils.trianglesBuffer.push(new Triangle(point1, point2, point3));

    tempColor = new Color().random;
    let point4 = new Point(new Vec3(-100, 150), tempColor);
    tempColor = new Color().random;
    let point5 = new Point(new Vec3(100, 150), tempColor);
    tempColor = new Color().random;
    let point6 = new Point(new Vec3(0, 300), tempColor);
    utils.trianglesBuffer.push(new Triangle(point4, point5, point6)); */


    // point contain test
    // utils.trianglesBuffer[0].checkPointInSideTriangle(new Vec3(150, 75));
     draw();
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
    utils.isDepth = true;
    for (let i = 0; i < 100; i++) {
        let tempColor = new Color().random;
        let point1 = new Point(getRandomVec(), tempColor);
        tempColor = new Color().random;
        let point2 = new Point(getRandomVec(), tempColor);

        let points = drawLines.CohenSutherland(point1, point2);
        if (points.length === 2) {
            utils.linesArrayBuffer.push(new Line(points[0], points[1]));
        }
        else {
            log(`Drop Line: (${point1.pos.x}, ${point1.pos.y}) : (${point2.pos.x}, ${point2.pos.y})`);
        }
    }
    draw();
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
        utils.linesArrayBuffer.push(new Line(point1, point2));
    }
    draw();
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
        /* let tempPoint = new Point(location, new Color(1.0, 0.0, 0.0));
        utils.pointsBuffer.push(tempPoint);
        draw(); */
        drawMain.drawCircle(gl, location);
    }
}

// return back the webgl coordation point
function getTouchPoint (handle) {
    let x = handle.clientX;
    let y = handle.clientY;
    let rect = handle.target.getBoundingClientRect();
    x = ((x - rect.left) - canvasWidth / 2);
    y = (canvasHeight / 2 - (y - rect.top));

    return new Vec3(x, y);
}

// #endregion

function draw () {
    drawMain.drawPoints(gl, proxy);
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
    /* attribute */
    proxy.a_Position = getAttribProp(gl, proxy.program, 'a_Position');
    proxy.a_Color = getAttribProp(gl, proxy.program, 'a_Color');
    /* uniform */
    proxy.u_PointSize = getUniformProp(gl, proxy.program, 'u_PointSize');
    gl.uniform1f(proxy.u_PointSize, 2.0);

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

/* animate rotate
exports.initRotation = function (step) {
    this.angleStep = step;
    this.data = new Date();
}

exports.rotate = function (angle) {
    let now = new Date();
    let elapse = now - this.data;
    this.data = now;
    let newAngle = angle + (this.angleStep * elapse) / 1000.0;
    return newAngle % 360;
} */