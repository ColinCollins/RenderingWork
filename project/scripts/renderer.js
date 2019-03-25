// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// const Data = require('../lib/Data');
const { ipcRenderer } = require('electron');
const Program = require('./program');
const utils = require('./utils');
const drawMain = require('./drawMain');
const drawLines = require('./drawLines');
const Data = require('../lib/data');

main();

function main () {
    ipcRenderer.send('Init-success');
}

ipcRenderer.on('load shader source', (e, sources) => {
    // pointScene(sources);
    // lineScene(sources);
    // triangleScene(sources);
    // translateScene(sources);
    // textureScene(sources);
     cubeScene(sources);
    // pointLightScene(sources);
});

// #region cube

function cubeScene (sources) {
    InitScene(sources);
    utils.isDepth = true;
    let mvpMatrix = new Matrix4().setPerspective(50.0, canvasWidth / canvasHeight, 1, 100);
    mvpMatrix.lookAt(
        0.0, 2.0, 10.0,
        0.0, 0.0, 0.0,
        0.0, 1.0, 0.0
    );

    let modelMatrix = new Matrix4().setRotate(30.0, 0.0, 1.0, 0.0);
    mvpMatrix.multiply(modelMatrix);

    let cube = new Cube(Data.initIndexData(), Data.initVerticesData(), Data.initColorData(), Data.initNormalizeData(), [], true, mvpMatrix);
    utils.trianglesBuffer = utils.trianglesBuffer.concat(cube.normalCubeTriangles());
    draw();

}

// #endregion


// #region texture

function textureScene (sources) {
    InitScene(sources);

}

// #endregion

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

    // setIn
    let pos1 = new Vec3(100, 0, 0);
    let pos2 = new Vec3(-100, 0, 0);
    let pos3 = new Vec3(0, 150, 0);


    let triangle = new Triangle(new Point(pos1, color1), new Point(pos2, color2), new Point(pos3, color3));
    // draw(pos1, pos2, pos3, color1, color2, color3);
    // not use the depth and this function is update
    let moveMatrix = new Matrix4().setTranslate(300, 0, 0);
    let rotateMatrix = new Matrix4().setTranslate(0, -150, 0).rotate(40, 0.0, 0.0, 1.0);
    let shearMatrix = new Matrix4().setShear(Math.PI / 3, 1.0, 0.0);
    let scaleMatrix = new Matrix4().setTranslate(-300, 0, 0).scale(0.2, 2, 2);
    // move
    let moveTriangle = triangle.multiplyMatrix(moveMatrix);
    utils.trianglesBuffer.push(moveTriangle);
    // rotate
    let rotateTriangle = triangle.multiplyMatrix(rotateMatrix);
    utils.trianglesBuffer.push(rotateTriangle);

    let shearTriangle = triangle.multiplyMatrix(shearMatrix);
    utils.trianglesBuffer.push(shearTriangle);

    let scaleTriangle = triangle.multiplyMatrix(scaleMatrix);
    utils.trianglesBuffer.push(scaleTriangle);
    draw();
    function clearCanvas () {
        gl.clear(gl.COLOR_BIT_BUFFER);
        utils.trianglesBuffer = [];
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
    for (let i = 0; i < 3; i++) {
        let tempColor = new Color().random;
        let point1 = new Point(getRandomVec (), tempColor);
        tempColor = new Color().random;
        let point2 = new Point(getRandomVec (), tempColor);
        tempColor = new Color().random;
        let point3 = new Point(getRandomVec (), tempColor);

        utils.trianglesBuffer.push(new Triangle(point1, point2, point3));
    }
    utils.isDepth = true;
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
    let point4 = new Point(new Vec3(-100, 50), tempColor);
    tempColor = new Color().random;
    let point5 = new Point(new Vec3(100, 50), tempColor);
    tempColor = new Color().random;
    let point6 = new Point(new Vec3(0, 200), tempColor);
    utils.trianglesBuffer.push(new Triangle(point4, point5, point6)); 
    */

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