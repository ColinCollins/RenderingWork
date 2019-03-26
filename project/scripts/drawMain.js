/*
    提供一个画点方案，在整个项目里面占有十分重要的比重，不要随便更改
 */
const utils = require('./utils');

exports.drawPoints = function (gl, proxy) {
    // 导入绘制数据
    utils.inputDataArrayBuffer();
    let points = utils.bindArrayBuffer(gl, proxy);
    gl.clear(gl.COLOR_BIT_BUFFER);
    gl.drawArrays(gl.POINTS, 0, points.length);
    // 每一次绘制都是数据的重新生成
    utils.arraybuffer = [];
}
// 因为不是必要的内容我们随意一点
exports.drawCircle = function (gl, pos) {
    let circles = utils.circlesBuffer;
    let radius = Math.random() * 80 + 20;
    circles.push(new Circle(pos, radius));

    // let circle = circles[circles.length - 1];
    createCircle(pos, radius);
    utils.inputDataArrayBuffer();
    let points = utils.bindArrayBuffer(gl, proxy);
    gl.drawArrays(gl.POINTS, 0, points.length);
}
// 最好是以 6 的倍数
const n = 132;
function createCircle (pos, radius) {
    pos = new Vec3(Math.floor(pos.x), Math.floor(pos.y));
    for (let i = 0; i < n; i++) {
        let theta = Math.PI * 2 * i / n;
        let cos = Math.cos(theta).toFixed(3);
        let sin = Math.sin(theta).toFixed(3);
        log(`Cos = ${cos} Sin = ${sin}`);
        let x = ownParseInt((cos * radius), (cos * radius + pos.x));
        let y = ownParseInt((sin * radius), (sin * radius + pos.y));
        let pos1 = new Vec3(x, y);
        // next pos
        theta = Math.PI * 2 * (i + 1) / n;
        cos = Math.cos(theta).toFixed(3);
        sin = Math.sin(theta).toFixed(3);
        log(`Cos = ${cos} Sin = ${sin}`);
        x = ownParseInt((cos * radius), (cos * radius + pos.x));
        y = ownParseInt((sin * radius), (sin * radius + pos.y));
        let pos2 = new Vec3(x, y);
        // color
        let red = 0;
        let green = 0;
        let blue = 0;
        let step = n / 6;
        let t = parseInt(i / step);
        switch(t) {
            case 0:
                red = 255;
                green = i % step * 255 / step;
                break;
            case 1:
                red = 255 - i %  step * 255 / step;
                green = 255;
                break;
            case 2:
                green = 255;
                blue = i % step * 255 / step;
                break;
            case 3:
                green = 255 - i % step * 255 / step;
                blue = 255;
                break;
            case 4:
                blue = 255;
                red = i % step * 255 / step;
                break;
            case 5:
                blue = 255 - i % step * 255 / step;
                red = 255;
                break;
            default:
                break;
        }
        let color = new Color(red, green, blue);
        utils.trianglesBuffer.push(new Triangle(new Point(pos1, color), new Point(pos2, color), new Point(pos, color)));
    }
}