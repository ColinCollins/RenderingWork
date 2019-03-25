// indices 为索引数据
/**
 * sideLength {int} must large than 0
*/
function Cube (indices, vertexData, colorData, normalData, uvVertexData, flag, mvpMatrix) {
    this.indices = indices;
    this.colorData = colorData;
    this.normalData = normalData;
    this.uvVertexData = uvVertexData;
    this.flag = flag;
    this.mvpMatrix = mvpMatrix;
    this.vertexData = vertexData;
}

let prop = Cube.prototype;
// tempData color
prop.normalCubeTriangles = function () {
    let points = [];
    let triangles = [];

    for (let i = 0; i < this.vertexData.length; i += 3) {
        let pos1 = this.vertexData[i];
        let pos2 = this.vertexData[i + 1];
        let pos3 = this.vertexData[i + 2];

        let color1 = this.colorData[i];
        let color2 = this.colorData[i + 1];
        let color3 = this.colorData[i + 2];

        points.push(new Point(new Vec3(pos1, pos2, pos3), new Color(color1, color2, color3)));
    }

    for (let i = 0; i < this.indices.length; i += 3) {
        let point1 = points[this.indices[i]];
        let point2 = points[this.indices[i + 1]];
        let point3 = points[this.indices[i + 2]];
        triangles.push(new Triangle(point1, point2, point3).multiplyMatrix(this.mvpMatrix, this.flag));
    }
    return triangles;
}

module.exports = Cube;