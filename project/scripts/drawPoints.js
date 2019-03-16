/*
    提供一个画点方案，在整个项目里面占有十分重要的比重，不要随便更改
 */
const utils = require('./utils');

exports.drawPoint = function (gl, proxy) {
    utils.bindArrayBuffer(gl, proxy);
    gl.clear(gl.COLOR_BIT_BUFFER);
    gl.drawArrays(gl.POINTS, 0, proxy.points.length);
}
// not finished
exports.drawCircle = function (gl, proxy, radius) {
    let points = proxy.points;
    for (let i = 0; i < points.length; i++) {
        let point = points[i];
    }

    utils.bindArrayBuffer(gl, proxy);
    gl.clear(gl.COLOR_BIT_BUFFER);
    gl.drawArrays(gl.POINTS, 0, proxy.points.length);
}