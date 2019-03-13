exports.drawPoint = function (gl, proxy, utils) {
    utils.bindArrayBuffer(gl, proxy);
    gl.clear(gl.COLOR_BIT_BUFFER);
    gl.drawArrays(gl.POINTS, 0, proxy.points.length);
}

exports.drawCircle = function (gl, proxy) {

}