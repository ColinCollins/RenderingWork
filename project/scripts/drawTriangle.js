exports.line1 = [];
exports.line2 = [];
exports.line3 = [];
// #region myownFillTriangle
/*
    这是我自己想出来的绘制方案，应该会有瑕疵，但是应该最终可以实现，通过最长边 dx / dy (这里需要通过 BresherHam 获取 points 数组)
    保留三个线段的 points 数组之后循环嵌套进行 piexl 的 fill，好处是我们不需要重新找一个 point4 而且可以利用现有的方法，对后续的
    color weight 应该也有帮助。
*/
exports.myownFillTriangle = function (point1, point2, point3, lines) {
    let tempPoints = [];
    tempPoints.push(point1);
    tempPoints.push(point2);
    tempPoints.push(point3);

    let pos1 = point1.pos;
    let pos2 = point2.pos;
    let pos3 = point3.pos;

    let dir1 = Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
    let dir2 = Math.max(Math.abs(pos1.x - pos3.x), Math.abs(pos1.y - pos3.y));
    let dir3 = Math.max(Math.abs(pos2.x - pos3.x), Math.abs(pos2.y - pos3.y));

    if (dir1 >= dir2 && dir1 >= dir3) {
        tempPoints = tempPoints.concat(this.myownFillFlatTriangle(point1, point2, point3, lines));
    }
    else if (dir2 >= dir1 && dir2 >= dir3) {
        tempPoints = tempPoints.concat(this.myownFillFlatTriangle(point1, point3, point2, lines));
    }
    else {
        tempPoints = tempPoints.concat(this.myownFillFlatTriangle(point2, point3, point1, lines));
    }

    return tempPoints;
}
// 生成三角形边框
exports.createTriangleBoundary = function (point1, point2, point3, lines, triangle) {
    this.line1 = lines.BresenhamLine(point1, point2);
    this.line2 = lines.BresenhamLine(point2, point3);
    this.line3 = lines.BresenhamLine(point3, point1);
    // remove the repeat point
    this.line1.splice(0, 2);
    this.line2.splice(0, 2);
    this.line3.splice(0, 2);
}

exports.clearTriangleBoundaryCache = function () {
    this.line1 = [];
    this.line2 = [];
    this.line3 = [];
}

// line1 must be the longest
exports.myownFillFlatTriangle = function (point1, point2, point3, lines) {
    this.createTriangleBoundary(point1, point2, point3, lines);
    let pos1 = point1.pos;
    let pos2 = point2.pos;
    // left to right
    let dx = pos1.x - pos2.x;
    let dy = pos1.y - pos2.y;
    let tempPoints = [];
    tempPoints = tempPoints.concat(this.line1);
    tempPoints = tempPoints.concat(this.line2);
    tempPoints = tempPoints.concat(this.line3);

    // 最长边的 dx 和 dy 比不一定与其他两个边的保持一致
    if (Math.abs(dx) > Math.abs(dy)) {
        tempPoints = tempPoints.concat(fillPixelsX(this.line1, this.line2, this.line3, lines));
    }
    else {
        // vertical triangle
        tempPoints = tempPoints.concat(fillPixelsY(this.line1, this.line2, this.line3, lines));
    }
    return tempPoints;
}

function fillPixelsX (line1, line2, line3, lines) {
    let tempPoints = [];
    // save time waste
    let isFind = false;
    for (let i = 0; i < line1.length; i++) {
        let p1 = line1[i];
        isFind = false;
        for (let j = 0; j < line2.length; j++) {
            let p2 = line2[j];
            if (p1.pos.x === p2.pos.x) {
                let fillLine = lines.BresenhamLine(p1, p2);
                tempPoints = tempPoints.concat(fillLine);
                line2.splice(j, 1);
                isFind = true;
                break;
            }
        }
        if (!isFind) {
            for (let j = 0; j < line3.length; j++) {
                let p2 = line3[j];
                if (p1.pos.x === p2.pos.x) {
                    let fillLine = lines.BresenhamLine(p1, p2);
                    tempPoints = tempPoints.concat(fillLine);
                    line3.splice(j, 1);
                    break;
                }
            }
        }
    }
    return tempPoints;
}

function fillPixelsY (line1, line2, line3, lines) {
    let tempPoints = [];
    // save time waste
    let isFind = false;
    for (let i = 0; i < line1.length; i++) {
        let p1 = line1[i];
        isFind = false;
        for (let j = 0; j < line2.length; j++) {
            let p2 = line2[j];
            if (p1.pos.y === p2.pos.y) {
                let fillLine = lines.BresenhamLine(p1, p2);
                tempPoints = tempPoints.concat(fillLine);
                line2.splice(j, 1);
                isFind = true;
                break;
            }
        }
        if (!isFind) {
            for (let j = 0; j < line3.length; j++) {
                let p2 = line3[j];
                if (p1.pos.y === p2.pos.y) {
                    let fillLine = lines.BresenhamLine(p1, p2);
                    tempPoints = tempPoints.concat(fillLine);
                    line3.splice(j, 1);
                    break;
                }
            }
        }
    }

    return tempPoints;
}
// #endregion
// #region normalFillTriangle
/*
    根据当前的绘制需求，首先需要分离出最高顶点和最低顶点，再判断是否存在相同水平坐标顶点
    排序最优先，不需要考虑是否要保留 point1,2,3 但是为了数据着想，还是新建 point 对象用于存储 point1,2,3
    top: p1,
    bottom: p3
*/

exports.normalFillTriangle = function (triangle, lines) {
    let tempPoints = [];

    let point1 = triangle.point1;
    let point2 = triangle.point2;
    let point3 = triangle.point3;

    let pos1 = point1.pos;
    let pos2 = point2.pos;
    let pos3 = point3.pos;

    let dx1 = pos1.x - pos2.x;
    let dy1 = pos1.y - pos2.y;
    let vector1 = new Vec3(dx1, dy1);
    let dx2 = pos3.x - pos2.x;
    let dy2 = pos3.y - pos2.y;
    let vector2 = new Vec3(dx2, dy2);
    let dx3 = pos1.x - pos3.x;
    let dy3 = pos1.y - pos3.y;
    let vector3 = new Vec3(dx3, dy3);
    // cross2D sinθ === 180 / 0 === 0
    if ((vector1.cross2D(vector2) === 0) || (vector1.cross2D(vector3) === 0) || (vector2.cross2D(vector3) === 0)) {
        warn(`Those points can't compose a triangle`);
        return [];
    }
    else if (dy1 === 0) {
        tempPoints = tempPoints.concat(this.fillFlatTriangle(point1, point3, point2, null, lines, triangle));
        return tempPoints;
    }
    else if (dy2 === 0) {
        tempPoints = tempPoints.concat(this.fillFlatTriangle(point2, point1, point3, null, lines, triangle));
        return tempPoints;
    }
    else if (dy3 === 0) {
        tempPoints = tempPoints.concat(this.fillFlatTriangle(point1, point2, point3, null, lines, triangle));
        return tempPoints;
    }

    tempPoints = this.fillTrianglePixels(point1, point2, point3, lines, triangle);
    if (!tempPoints) tempPoints = this.fillTrianglePixels(point2, point3, point1, lines, triangle);
    if (!tempPoints) tempPoints = this.fillTrianglePixels(point3, point2, point1, lines, triangle);
    if (!tempPoints) warn(`The normal triangle tempPoints is empty.`);

    return tempPoints;
}

exports.fillTrianglePixels = function (p1, p2, p3, lines, triangle) {
    let tempPoints = [];
    let pos = p1.pos;
    this.createTriangleBoundary(p1, p2, p3, lines, triangle);
    for (let i = 0; i < this.line2.length; i++) {
        let point = this.line2[i];
        if (pos.y === point.pos.y) {
            let p4 = new Point(point.pos, point.color);
            // clear the lines
            this.clearTriangleBoundaryCache();
            tempPoints = tempPoints.concat(this.fillFlatTriangle(p1, p2, p3, p4, lines, triangle));
            tempPoints = tempPoints.concat(this.fillFlatTriangle(p1, p3, p2, p4, lines, triangle));
            return tempPoints;
        }
    }
    this.clearTriangleBoundaryCache();
    // error(`can't find point4 in createFourthPoint method`);
    return null;
}

exports.fillFlatTriangle = function (point1, point2, point3, point4, lines, triangle) {
    let tempPoints = [];
    // exectue the fillFlatTriangle straightly
    if (!point4) point4 = point3;
    this.createTriangleBoundary(point1, point2, point4, lines);
    // 避免直接绘制的平顶三角形缺少边框
    tempPoints = tempPoints.concat(this.line1);
    tempPoints = tempPoints.concat(this.line2);
    tempPoints = tempPoints.concat(this.line3);

    let l1, l2 = [];
    if (this.line1.length > this.line2.length) {
        l1 = this.line1;
        l2 = this.line2;
    }
    else {
        l1 = this.line2;
        l2 = this.line1;
    }
    for (let i = 0; i < l1.length; i++) {
        let p1 = l1[i];
        for (let j = 0; j < l2.length; j++) {
            let p2 = l2[j];
            if (p1.pos.y === p2.pos.y) {
                if (triangle.isBindTexture) {
                    // 只能是逆行推导了, 添加 uv 坐标计算。
                    let line = lines.BresenhamLine(p1, p2);
                    // 重新分析 color
                    this.fillTexturePixel(line, triangle);
                    tempPoints = tempPoints.concat(line);
                    l2.splice(j, 1);
                }
                else {
                    let line = lines.BresenhamLine(p1, p2);
                    analysisColor(point1, point2, point3, line)
                    tempPoints = tempPoints.concat(line);
                    l2.splice(j, 1);
                }
                break;
            }
        }
    }

    this.clearTriangleBoundaryCache();
    return tempPoints;
}
// #endregion

// triangle color analy, line use to save the line points
function analysisColor (point1, point2, point3, line) {
    let pos1 = point1.pos;
    let pos2 = point2.pos;
    let pos3 = point3.pos;
    for (let i = 0; i < line.length; i++) {
        let tempPoint = line[i];
        let pos = line[i].pos;
        let dir1 = pos1.dir(pos);
        let dir2 = pos2.dir(pos);
        let dir3 = pos3.dir(pos);

        let totalDir = dir1 + dir2 + dir3;
        let weight1 = dir1 / totalDir;
        let weight2 = dir2 / totalDir;
        let weight3 = dir3 / totalDir;

        let color1 = new Color().set(point1.color).multiply(weight1);
        let color2 = new Color().set(point2.color).multiply(weight2);
        let color3 = new Color().set(point3.color).multiply(weight3);

        tempPoint.color =  new Color().set(color1.add(color2.add(color3)));
    }
}

// 填充 texture 数据
exports.fillTexturePixel = function (lineBuffer, triangle) {
    let imgData = triangle.textureMipMap.data;
    let imgWidth = triangle.textureMipMap.width;
    let imgHeight = triangle.textureMipMap.height;
    for (let i = 0; i < lineBuffer.length; i ++) {
        let point = lineBuffer[i];
        // uv -> Vec3() -> 屏幕坐标
        let uv = point.uv;

        uv.x = Math.round(uv.x * point.pos.z * imgWidth);
        uv.y = Math.round(uv.y * point.pos.z * imgHeight);
        let index = (uv.x - 1 + (imgHeight - uv.y) * imgHeight) * 4;
        let red = imgData[index];
        let green = imgData[index + 1];
        let blue = imgData[index + 2];
        let alpha = imgData[index + 3] / 255.0;
        // 不确定单位区间
        let color = new Color(red, green, blue, alpha);
        point.color = color;
    }
}