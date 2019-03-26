function Triangle (point1, point2, point3) {
    this.point1 = point1;
    this.point2 = point2;
    this.point3 = point3;

    let pos1 = this.point1.pos;
    let pos2 = this.point2.pos;
    let pos3 = this.point3.pos;

    let dx1 = pos1.x - pos2.x;
    let dx2 = pos2.x - pos3.x;
    let dx3 = pos3.x - pos1.x;

    let dy1 = pos1.y - pos2.y;
    let dy2 = pos2.y - pos3.y;
    let dy3 = pos3.y - pos1.y;
    // vector
    this.lineVector1 = new Vec3(dx1, dy1);
    this.lineVector2 = new Vec3(dx2, dy2);
    this.lineVector3 = new Vec3(dx3, dy3);

    // 质心
    this.centroid = this.getCentroid(pos1, pos2, pos3);
}

let prop = Triangle.prototype;
/*
    碰撞检测原理类似，这回是 3D triangle 检测是否相交（包含）实际还是 2D 考虑：
    - 相交一点在三角形内
    - 相交两点在三角形内
    - 内置三角形
    - 不相交
*/
prop.isContain = function (triangle) {
    // 实际上只要有一边和另一个三角形相交就能判断是相交三角形，最多检测两条线
    // 额外考虑的是内置与不相交的情况
    let pos1 = triangle.point1.pos;
    let pos2 = triangle.point2.pos;
    let pos3 = triangle.point3.pos;
    if (this.checkLinesCross(pos1, pos2) || this.checkLinesCross(pos2, pos3) || this.checkLinesCross(pos1, pos3)) {
        return true;
    }

    // 逆时针转 cross > 0 点，表示在内侧， 算一个点就行
    if (this.checkPointInSideTriangle(pos1)) return true;

    return false;
}
// 这里应该要测三条边, 确保应该是有可能相交
prop.checkLinesCross = function (pos1, pos2) {
    let tempPos1 = this.point1.pos;
    let tempPos2 = this.point2.pos;
    let tempPos3 = this.point3.pos;

    if (
        isLineCrossed(pos1, pos2, tempPos1, tempPos2, this.lineVector1) ||
        isLineCrossed(pos1, pos2, tempPos2, tempPos3, this.lineVector2) ||
        isLineCrossed(pos1, pos2, tempPos3, tempPos1, this.lineVector3)
    ) {
        //log(`checkLinesCross: isContained.`);
        return true;
    }

    return false;
}

prop.checkPointInSideTriangle = function (pos) {
    let tempPos1 = this.point1.pos;
    let tempPos2 = this.point2.pos;
    let tempPos3 = this.point3.pos;

    let newVector1 = new Vec3((tempPos1.x - pos.x), (tempPos1.y - pos.y));
    let newVector2 = new Vec3((tempPos2.x - pos.x), (tempPos2.y - pos.y));
    let newVector3 = new Vec3((tempPos3.x - pos.x), (tempPos3.y - pos.y));

    let d1 = this.lineVector1.cross2D(newVector1);
    let d2 = this.lineVector2.cross2D(newVector2);
    let d3 = this.lineVector3.cross2D(newVector3);
    // 逆时针
    if (d1 > 0 && d2 > 0 && d3 > 0) return true;
    // 顺时针
    if (d1 < 0 && d2 < 0 && d3 < 0) return true;
    return false;
}

// #region move
/*
    move prehaps need triangle origin to save the position
    return a new Triangle with new points
 */
prop.moveTo = function (x = 0, y = 0, z = 0) {
    // first keep the points diff
    let pos1 = this.point1.pos;
    let pos2 = this.point2.pos;
    let pos3 = this.point3.pos;

    let diff1 = new Vec3(pos1.x - this.centroid.x, pos1.y - this.centroid.y);
    let diff2 = new Vec3(pos2.x - this.centroid.x, pos2.y - this.centroid.y);
    let diff3 = new Vec3(pos3.x - this.centroid.x, pos3.y - this.centroid.y);

    this.centroid = new Vec3(x, y, z);
    let point1 = new Point(new Vec3().set(this.centroid).add(diff1), this.point1.color);
    let point2 = new Point(new Vec3().set(this.centroid).add(diff2), this.point2.color);
    let point3 = new Point(new Vec3().set(this.centroid).add(diff3), this.point3.color);

    return new Triangle(point1, point2, point3);
}

prop.moveBy = function (x, y, z) {
    // first keep the points diff
    let v3 = new Vec3(x, y, z);
    let point1 = new Point(new Vec3().set(this.point1.pos).add(v3), this.point1.color);
    let point2 = new Point(new Vec3().set(this.point2.pos).add(v3), this.point2.color);
    let point3 = new Point(new Vec3().set(this.point3.pos).add(v3), this.point3.color);

    return new Triangle(point1, point2, point3);
}
/**
 *  return a new triangle
 *  flag 用来记录传入的数据是否是单位数据
*/
prop.multiplyMatrix = function (matrix4, flag = false) {

    let pos1 = this.point1.pos.multiplyMatrix(matrix4, flag);
    let pos2 = this.point2.pos.multiplyMatrix(matrix4, flag);
    let pos3 = this.point3.pos.multiplyMatrix(matrix4, flag);

    let newPoint1 = new Point(pos1, this.point1.color);
    let newPoint2 = new Point(pos2, this.point2.color);
    let newPoint3 = new Point(pos3, this.point3.color);

    return new Triangle(newPoint1, newPoint2, newPoint3);
}

prop.getCentroid = function (pos1, pos2, pos3) {
    if (!pos1 || !pos2 || !pos3) {
        warn(`Triangle getCentroid method failed`);
        return;
    }

    let x = (pos1.x + pos2.x + pos3.x) / 3;
    let y = (pos1.y + pos2.y + pos3.y) / 3;
    let z = (pos1.z + pos2.z + pos3.z) / 3;
    return new Vec3(ownParseInt(x), ownParseInt(y), ownParseInt(z));
}
// #endregion
function isLineCrossed (pos1, pos2, tempPos1, tempPos2, line) {
    let dx1 = tempPos1.x - pos1.x;
    let dy1 = tempPos1.y - pos1.y;

    let dx2 = tempPos1.x - pos2.x;
    let dy2 = tempPos1.y - pos2.y;

    let newVector1 = new Vec3(dx1, dy1);
    let newVector2 = new Vec3(dx2, dy2);

    let d1 = line.cross2D(newVector1);
    let d2 = line.cross2D(newVector2);

    let dv = new Vec3((pos1.x - pos2.x), (pos1.y - pos2.y));
    dx1 = pos1.x - tempPos1.x;
    dy1 = pos1.y - tempPos1.y;

    dx2 = pos1.x - tempPos2.x;
    dy2 = pos1.y - tempPos2.y;

    newVector1 = new Vec3(dx1, dy1);
    newVector2 = new Vec3(dx2, dy2);
    let d3 = dv.cross2D(newVector1);
    let d4 = dv.cross2D(newVector2);

    if (d1 * d2 < 0 && d3 * d4 < 0) return true;
    return false;
}

module.exports = Triangle;
