
/**
 * 这里我们默认渲染的纹理图片都是 2 次幂图片以标准的 mipmap 金字塔纹理为准。
 * 通过向服务主进程发送获取 image 请求
 */
function Texture(path) {
    let tempCanvas = document.createElement('canvas');
    // max texture size is 2048 * 2048
    tempCanvas.width = 2048;
    tempCanvas.height = 2048;
    let ctx = tempCanvas.getContext('2d');
    if (path) {
        let image = new Image();
        image.src = path;
        image.onload = function () {
            ctx.drawImage(image, 0, 0);
            this.image = ctx.getImageData(0, 0, image.width, image.height);
            if (!this.image) {
                log(`texture can't read image data`);
                return;
            }
        }.bind(this);
    }
    this.mipmapData = [];
}

let prop = Texture.prototype;
// 渲染一个矩形, drawLine 使用新的填充方式
prop.renderSquare = function (mvpMatrix, modelMatrix) {
    if (!this.image) return;
    // triangle1
    let imgWidth = this.image.width;
    let imgHeight = this.image.height;
    // 设定好与原 texture 相同尺寸
    let pos1 = new Vec3(imgWidth / 2 / (canvasWidth / 2), imgHeight / 2 / (canvasHeight / 2), 1);
    let pos2 = new Vec3(-imgWidth / 2 / (canvasWidth / 2), imgHeight / 2 / (canvasHeight / 2), 1);
    let pos3 = new Vec3(-imgWidth / 2 / (canvasWidth / 2), -imgHeight / 2 / (canvasHeight / 2), 1);
    let pos4 = new Vec3(imgWidth / 2 / (canvasWidth / 2), -imgHeight / 2 / (canvasHeight / 2), 1);

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
        let triangle = new Triangle(point1, point2, point3, mvpMatrix, modelMatrix);
        triangle = triangle.depthBufferTest();
        triangle.isBindTexture = true;
        // 暂时先只考虑原本的像素信息
        triangle.textureMipMap = this.image;
        triangles.push(triangle);
    }

    return triangles;
}

prop.updateMipmap = function (image) {
    let width = image.width;
    let height = image.height;
    let data = image.data;
    // 非 二次幂 贴图不生成 mipmap
    if (width % 2 !== 0 || height % 2 !== 0) {
        return;
    }
    this.mipmapData.push(image);
    let nWidth = image.width / 2;
    let nHeight = image.height / 2;
    let nData = [];
    let nImage = {
        width: nWidth,
        height: nHeight,
        data: nData
    };
    let v = height * 4;
    for (let j = 0; j < height - 1; j += 2) {
        for (let i = 0; i < width * 4; i += 8) {
            let r1 = data[(v * j) + i];
            let g1 = data[(v * j) + i + 1];
            let b1 = data[(v * j) + i + 2];
            let a1 = data[(v * j) + i + 3];

            let r2 = data[(v * (j + 1)) + i];
            let g2 = data[(v * (j + 1)) + i + 1];
            let b2 = data[(v * (j + 1)) + i + 2];
            let a2 = data[(v * (j + 1)) + i + 3];

            let r3, g3, b3, a3, r4, g4, b4, a4 = 0;
            if (i % (width * 4) < (width - 1) * 4) {
                r3 = data[(v * j) + i + 4];
                g3 = data[(v * j) + i + 5];
                b3 = data[(v * j) + i + 6];
                a3 = data[(v * j) + i + 7];

                r4 = data[(v * (j + 1)) + i + 4];
                g4 = data[(v * (j + 1)) + i + 5];
                b4 = data[(v * (j + 1)) + i + 6];
                a4 = data[(v * (j + 1)) + i + 7];
            }

            let nr = GammaCorrectedAverage(r1, r2, r3, r4);
            let ng = GammaCorrectedAverage(g1, g2, g3, g4);
            let nb = GammaCorrectedAverage(b1, b2, b3, b4);
            let na = GammaCorrectedAverage(a1, a2, a3, a4);
            nData.push(nr);
            nData.push(ng);
            nData.push(nb);
            nData.push(na);
        }
    }

    this.updateMipmap(nImage);
}
// 伽马校正计算 mipmap （实际上是对颜色值或者亮度值的校正）
function GammaCorrectedAverage(a, b, c, d) {
    return (a + b + c + d) / 4;
}

prop.renderMipmap = function () {
    if (!this.mipmapData || this.mipmapData.length <= 0) return;
    let triangles = [];
    let step = 0.48;
    for (let i = 0; i < this.mipmapData.length; i++) {
        let img = this.mipmapData[i];
        let texture = new Texture();
        texture.image = img;
        let mvpMatrix = new Matrix4().setPerspective(50.0, canvasWidth / canvasHeight, 1, 100);
        mvpMatrix.lookAt(
            0.0, 0.0, 3.0,
            0.0, 0.0, 0.0,
            0.0, 1.0, 0.0
        );
        let modelMatrix = new Matrix4().setTranslate(-0.9 + step, 0, 0);
        step += 0.4 / (i + 1);
        // log(step);
        mvpMatrix.multiply(modelMatrix);
        triangles = triangles.concat(texture.renderSquare(mvpMatrix, modelMatrix));
    }
    return triangles;
}

module.exports = Texture;