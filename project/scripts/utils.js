exports.bindArrayBuffer = function (gl, proxy) {
    let points = !this.isDepth ? proxy.points : this.depthArrayBuffer;
    let vertexArray = [];
    let colorArray = [];
    for (let i = 0; i < points.length; i++) {
        let point = points[i].pos;
        // add the z-index test method
        vertexArray.push(point.x / (canvasWidth / 2));
        vertexArray.push(point.y / (canvasHeight / 2));
        vertexArray.push(point.z);
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
}

window.clearCanvas = function () {
    gl.clear(gl.COLOR_BIT_BUFFER);
    proxy.points = [];
}
// 是否进行深度检测，可以用于节省内存
exports.isDepth = false;

exports.depthArrayBuffer = [];

exports.pushDepthBuffer = function (point) {
    if (!isDepth) {
        warn(`Depth test not open`);
        return;
    }
    let array = depthArrayBuffer;
    let pos = point.pos;
    for (let i = 0; i < array.length; i++) {
        let tempPos = array[i];
        if (tempPos.x === pos.x && tempPos.y === pos.y) {
            // view dir is lead to -z-index
            if (tempPos.z > pos.z) {
                array[i] = point;
                break;
            }
        }
    }
}