exports.bindArrayBuffer = function (gl, proxy) {
    let points = proxy.points;
    let colors = proxy.colors;
    let tempArray = [];
    for (let i = 0; i < points.length; i++) {
        let point = points[i];
        tempArray.push(point.x);
        tempArray.push(point.y);
    }

    let vertexbuffer = new Float32Array(tempArray);
    // create the array buffer to save the data
    this.declDataBuffer(gl, proxy.a_Position, vertexbuffer, gl.FLOAT, 2);

    tempArray = [];
    for (let i = 0; i < colors.length; i++) {
        let color = colors[i];
        tempArray.push(color.r);
        tempArray.push(color.g);
        tempArray.push(color.b);
    }

    let colorbuffer = new Float32Array(tempArray);
    this.declDataBuffer(gl, proxy.a_Color, colorbuffer, gl.FLOAT, 3);
}

exports.declDataBuffer = function (gl, target, data, type, num) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(target, num, type, false, 0, 0);
    gl.enableVertexAttribArray(target);
}