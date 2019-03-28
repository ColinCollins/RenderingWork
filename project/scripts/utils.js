const drawLines = require('./drawLines');
const drawTriangle = require('./drawTriangle');

exports.bindArrayBuffer = function (gl, proxy) {
    // depth 状态下通过 depthArrayBuffer 填充绘制数据
    let points = this.arrayBuffer;
    let vertexArray = [];
    let colorArray = [];
    for (let i = 0; i < points.length; i++) {
        let point = points[i].pos;
        // add the z-index test method
        vertexArray.push(point.x / (canvasWidth / 2.0));
        vertexArray.push(point.y / (canvasHeight / 2.0));
        vertexArray.push(point.z / 10.0);
        let color = points[i].color;
        colorArray.push(color.r / 255.0);
        colorArray.push(color.g / 255.0);
        colorArray.push(color.b / 255.0);
        if (color.a > 1) color.a = 1;
        colorArray.push(color.a);
    }

    let vertexbuffer = new Float32Array(vertexArray);
    // create the array buffer to save the data
    this.declDataBuffer(gl, proxy.a_Position, vertexbuffer, gl.FLOAT, 3);

    let colorbuffer = new Float32Array(colorArray);
    this.declDataBuffer(gl, proxy.a_Color, colorbuffer, gl.FLOAT, 4);
    return points;
}

exports.declDataBuffer = function (gl, target, data, type, num) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(target, num, type, false, 0, 0);
    gl.enableVertexAttribArray(target);
}
/* rotate animation */
exports.angleStep = 0;
exports.data = new Date();

exports.clearCanvas = function () {
    gl.clear(gl.COLOR_BIT_BUFFER);
    this.linesArrayBuffer = [];
    this.trianglesBuffer = [];
    this.pointsBuffer = [];
    this.circlesBuffer = [];
    this.arrayBuffer = [];
}
// 是否进行深度检测，可以用于节省内存
exports.isDepth = false;
// 存储 lines
exports.linesArrayBuffer = [];
// 存储 triangle，存储顶点数据
exports.trianglesBuffer = [];
// 这是一个临时存储数据对象, 存储填充数据
exports.depthTriangleBuffer = [];
// 存储 point
exports.pointsBuffer = [];
// 存储 circles
exports.circlesBuffer = [];
// 最终的像素数据集合
exports.arrayBuffer = [];
// depth 前提下存储 tirangles 数据, 传参影响有效
exports.pushDepthBuffer = function (triangleBuffer) {
     // depthTest not open
     if (!this.isDepth) {
        // 记录数据
        this.depthTriangleBuffer.push(triangleBuffer);
        return;
    };
    for (let i = 0; i < triangleBuffer.length; i++) {
        let point = triangleBuffer[i];
        let x = point.pos.x - 1 + canvasWidth / 2;
        let y = point.pos.y - 1 + canvasHeight / 2;
        let tarPoint = this.depthTriangleBuffer[x][y];
        if (tarPoint instanceof Point) {
            if (tarPoint.pos.z <= point.pos.z) continue;
        }
        this.depthTriangleBuffer[x][y] = point;
    }
}
// 存储数据到 arrayBuffer 中
exports.inputDataArrayBuffer = function () {
    // 清空深度检测数据缓存
    this.depthTriangleBuffer = this.isDepth ? initPixelArea() : [];
    // input points
    for (let i = 0; i < this.pointsBuffer.length; i++) {
        this.arrayBuffer.push(this.pointsBuffer[i])
    }
    // input line
    for (let i = 0; i < this.linesArrayBuffer.length; i++) {
        let line = this.linesArrayBuffer[i];
        let linePoints = drawLines.BresenhamLine(line.point1, line.point2);
        this.arrayBuffer = this.arrayBuffer.concat(linePoints);
    }
    // input triangle
    for (let i = 0; i < this.trianglesBuffer.length; i++) {
        let triangle = this.trianglesBuffer[i];
        let triangleBuffer = [];
        if (triangle.isBindTexture) {
            triangleBuffer = drawTriangle.textureFillTriangle(triangle, drawLines);
        }
        else {
            triangleBuffer = drawTriangle.normalFillTriangle(triangle, drawLines);
        }
        this.pushDepthBuffer(triangleBuffer);
    }
    // 所有的像素点数据处理完毕之后写入数据到 arrayBuffer
    if (this.isDepth) {
        for (let j = 0; j < this.depthTriangleBuffer.length; j++) {
            let points = this.depthTriangleBuffer[j];
            for (let k = 0; k < points.length; k++) {
                let point = points[k];
                if (point === -1 || point.dropByDepth) continue;
                this.arrayBuffer.push(point);
            }
        }
    }
    else {
        for (let j = 0; j < this.depthTriangleBuffer.length; j++) {
            let points = this.depthTriangleBuffer[j];
            for (let k = 0; k < points.length; k++) {
                let point = points[k];
                // 临时的 clip 处理
                if (point.dropByDepth || !isContain(point.pos)) continue;
                this.arrayBuffer.push(point);
            }
        }
    }
}

function initPixelArea () {
    let array = [];
    for (let i = 0; i < canvasWidth; i++) {
        let height = [];
        for (let j = 0; j < canvasHeight; j++) {
            height.push(-1);
        }
        array.push(height)
    }
    return array;
}

window.ownParseInt = function (judge, value) {
    if (!value) value = judge;
    return Math.round(value);
}


window.accMul = function (arg1, arg2) {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try {
        m += s1.split(".")[1].length;
    }
    catch (e) {
    }
    try {
        m += s2.split(".")[1].length;
    }
    catch (e) {
    }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
}

window.accDiv = function (arg1, arg2) {
    var t1 = 0, t2 = 0, r1, r2;
    try {
        t1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
    }
    try {
        t2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
    }
    with (Math) {
        r1 = Number(arg1.toString().replace(".", ""));
        r2 = Number(arg2.toString().replace(".", ""));
        return (r1 / r2) * pow(10, t2 - t1);
    }
}