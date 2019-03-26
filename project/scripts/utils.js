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
        vertexArray.push(point.z / 1000.0);
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

window.clearCanvas = function () {
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
exports.pushDepthBuffer = function (triangleBuffer, index) {
    // depthTest not open
    // 记录数据 
    this.depthTriangleBuffer.push(triangleBuffer); 
    // depthTest not open 
    if (!this.isDepth) return; 
    // 三角形完整填充数据集合 
    let depthTriangles = this.depthTriangleBuffer; 
    // 对应三角形顶点数据集合 
    let pointTriangles = this.trianglesBuffer; 
    // 当前三角形顶点数据 
    let curTriangle = pointTriangles[index]; 
    // 因为后绘制的三角形一般会在上面所以不用全都遍历，很消耗性能。 
    for (let i = 0; i < index; i++) { 
        let triangle = pointTriangles[i]; 
        if (triangle.isContain(curTriangle)) { 
            // 因为 depthTriangle 导入顺序和 pointsTriangles 是相同的 
            let pointsData = depthTriangles[i]; 
            // 遍历传入三角形像素数据 
            for (let j = 0; j < triangleBuffer.length; j++) { 
                let pos1 = triangleBuffer[j].pos; 
                for (let k = 0; k < pointsData.length; k++) { 
                    let pos2 = pointsData[k].pos; 
                    if (pos1.x === pos2.x && pos1.y === pos2.y) { 
                        if (pos1.z <= pos2.z) { 
                            pointsData[k].dropByDepth = true; 
                            break; 
                        } 
                        triangleBuffer[j].dropByDepth = true; 
                        break; 
                    } 
                } 
            } 
        } 
    } 
}
// 存储数据到 arrayBuffer 中
exports.inputDataArrayBuffer = function () {
    // 清空深度检测数据缓存
    this.depthTriangleBuffer = [];
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
        // let triangleBuffer = drawTriangle.myownFillTriangle(triangle.point1, triangle.point2, triangle.point3, drawLines) 
        let triangleBuffer = drawTriangle.normalFillTriangle(triangle.point1, triangle.point2, triangle.point3, drawLines); 
        this.pushDepthBuffer(triangleBuffer, i); 
    } 
    // 所有的像素点数据处理完毕之后写入数据到 arrayBuffer 
    for (let j = 0; j < this.depthTriangleBuffer.length; j++) { 
        let points = this.depthTriangleBuffer[j]; 
        for (let k = 0; k < points.length; k++) { 
            let point = points[k]; 
            if (point.dropByDepth) continue; 
            this.arrayBuffer.push(point); 
        } 
    } 
    // 清空深度检测数据缓存 
    this.depthTriangleBuffer = []; 
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