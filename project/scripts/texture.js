
/**
 * 这里我们默认渲染的纹理图片都是 2 次幂图片以标准的 mipmap 金字塔纹理为准。
 * 通过向服务主进程发送获取 image 请求
 */
function Texture (path) {
    let tempCanvas = document.createElement('canvas');
    // max texture size is 2048 * 2048
    tempCanvas.width = 2048;
    tempCanvas.height = 2048;
    let ctx = tempCanvas.getContext('2d');

    let image = new Image();
    image.src = path;

    image.onload = function () {
        ctx.drawImage(image, 0, 0);
        this.image = ctx.getImageData(0, 0, image.width, image.height);
        if (!this.image) {
            log(`texture can't read image data`);
            return;
        }
        this.updateMipmap();
    }.bind(this);
}

let prop = Texture.prototype;
// 渲染一个矩形, drawLine 使用新的填充方式
prop.renderSquare = function (x, y, mvpMatrix) {
    if (!this.image) return;
    // triangle1
    let imgWidth = this.image.width;
    let imgHeight = this.image.height;
    // 设定好与原 texture 相同尺寸
    let pos1 = new Vec3((imgWidth / 2 + x), (imgHeight / 2 + y), 1);
    let pos2 = new Vec3((-imgWidth / 2 + x), (imgHeight / 2 + y), 1);
    let pos3 = new Vec3((-imgWidth / 2 + x), (-imgHeight / 2 + y), 1);
    let pos4 = new Vec3((imgWidth / 2 + x), (-imgHeight / 2 + y), 1);

    let point1 = new Point(pos1, null, new Vec3(1, 1, 0));
    let point2 = new Point(pos2, null, new Vec3(0, 1, 0));
    let point3 = new Point(pos3, null, new Vec3(0, 0, 0));
    let point4 = new Point(pos4, null, new Vec3(1, 0, 0));
    let points = [point1, point2, point3, point4];
    let indices = new Float32Array([
        0, 1, 2, 0, 2, 3
    ]);
    let triangles = [];
    for (let i = 0; i < 6; i += 3) {
        let point1 = points[indices[i]];
        let point2 = points[indices[i + 1]];
        let point3 = points[indices[i + 2]];
        let triangle = new Triangle(point1, point2, point3).multiplyMatrix(mvpMatrix);
        triangle.isBindTexture = true;
        // 暂时先只考虑原本的像素信息
        triangle.textureMipMap = this.image;
        triangles.push(triangle);
    }

    return triangles;
}

prop.updateMipmap = function () {
    let width = this.image.width;
    let height = this.image.height;
    // 非 二次幂 贴图不生成 mipmap
    if (width & (width - 1) !== 0 || (height & height - 1) !== 0) {
        return;
    }
}
// 伽马校正计算 mipmap （实际上是对颜色值或者亮度值的校正）
function GammaCorrectedAverage (a, b, c, d) {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c * 2) + Math.pow(d, 2)) / 4;
}

module.exports = Texture;