/*
    pos must be the Vec3
 */
exports.BresenhamLine = function (point1, point2) {
    // pos1 === pos2
    let pos1 = point1.pos;
    let pos2 = point2.pos;
    // save the line poinits
    let tempPoints = [];
    tempPoints.push(point1);
    tempPoints.push(point2);

    let dir = point1.pos.dir(point2.pos);
    if (pos1.x === pos2.x && pos1.y !== pos2.y) {
        let x = pos1.x;
        let dy = Math.max((pos2.y - pos1.y), (pos1.y - pos2.y));
        let startY, startZ, stepZ = 0
        if (pos1.y < pos2.y) {
            startY = pos1.y;
            startZ = pos1.z;
            stepZ = accDiv((pos2.z - pos1.z), Math.abs(dy));
        }
        else {
            startY = pos2.y;
            startZ = pos2.z;
            stepZ = accDiv((pos1.z - pos2.z), Math.abs(dy));
        }

        for (let i = 1; i < dy; i++) {
            let y = startY + i;
            let z = startZ + stepZ * (i - 1);
            tempPoints.push(createPoint(x, y, z, dir, point1, point2));
        }
    }
    else if (pos1.y === pos2.y && pos1.x !== pos2.x) {
        let y = pos1.y;
        let dx = Math.max((pos2.x - pos1.x), (pos1.x - pos2.x));
        let startX, startZ, stepZ = 0
        if (pos1.x < pos2.x) {
            startX = pos1.x;
            startZ = pos1.z;
            stepZ = accDiv((pos2.z - pos1.z), Math.abs(dx));
        }
        else {
            startX = pos2.x;
            startZ = pos2.z;
            stepZ = accDiv((pos1.z - pos2.z), Math.abs(dx));
        }

        for (let i = 1; i < dx; i++) {
            let x = startX + i;
            let z = startZ + stepZ * (i - 1);
            tempPoints.push(createPoint(x, y, z, dir, point1, point2));
        }
    }
    else {
        // 这里应该优先计算 dy 和 dx，确认最长差
        let dx = pos1.x - pos2.x;
        let dy = pos1.y - pos2.y;
        let startPos = null;
        // 斜率
        let rate = dy / dx;
        if (Math.abs(dx) < Math.abs(dy)) {
            // from left to right
            let sym = rate < 0 ? -1 : 1;
            let stepZ, startZ = 0;
            if (rate > 0 && pos1.y < pos2.y || rate < 0 && pos1.y > pos2.y) {
                startPos = pos1;
                startZ = pos1.z;
                stepZ = accDiv((pos2.z - pos1.z), Math.abs(dy));
            }
            else {
                startPos = pos2;
                startZ = pos2.z;
                stepZ = accDiv((pos1.z - pos2.z), Math.abs(dy));
            }

            let curX = startPos.x;
            for (let i = 1; i < Math.abs(dy); i++) {
                let y = startPos.y + sym * i;
                let curRate = i / (curX - startPos.x);
                let z = startZ + stepZ * (i - 1);
                if (Math.abs(curRate) > Math.abs(rate)) {
                    curX += 1;
                }
                tempPoints.push(createPoint(curX, y, z, dir, point1, point2));
            }
        }
        else {
            // from left to right
            startPos = pos1.x < pos2.x ? pos1 : pos2;
            let stepZ, startZ = 0;
            if (startPos.equal(pos1)) {
                startZ = pos1.z;
                stepZ = accDiv((pos2.z - pos1.z), Math.abs(dx));
            }
            else {
                startZ = pos2.z;
                stepZ = accDiv((pos1.z - pos2.z), Math.abs(dx));
            }

            let curY = startPos.y;
            for (let i = 1; i < Math.abs(dx); i++) {
                let x = startPos.x + i;
                let curRate = (curY - startPos.y) / i;
                let z = startZ + stepZ * (i - 1);
                if (Math.abs(curRate) < Math.abs(rate)) {
                    curY += rate < 0 ? -1 : 1;
                }
                tempPoints.push(createPoint(x, curY, z, dir, point1, point2));
            }
        }
    }
    return tempPoints;
}

/*
    这里有两个解决方案：
    一：增加 point 的属性，constructor 增加属性值 isContain 判断，检测是否存在与 viewport 内
    二：通过新的函数形式判断是否需要将 point 添加进入 proxy.points 数组。
    原理上是一样的
 */

exports.CohenSutherland = function (point1, point2) {
    // 这里直接引用 BreshMen 算法
    let pos1 = point1.pos;
    let pos2 = point2.pos;

    if (!isContain(pos1) && !isContain(pos2)) {
        // don't draw
        return [];
    }
    else if (isContain(pos1) && isContain(pos2)) {
        return [point1, point2];
    }
    else if (isContain(pos1) && !isContain(pos2)) {
        let newPoint = calculateNewPoint(point2, point1);
        // log (`newPoint: ${newPoint.pos.x} : ${newPoint.pos.y}`, false);
        return [point1, newPoint];
    }
    else if (!isContain(pos1) && isContain(pos2)) {
        let newPoint = calculateNewPoint(point1, point2);
        // log (`newPoint: ${newPoint.pos.x} : ${newPoint.pos.y}`, false);
        return [newPoint, point2];
    }
}

function createPoint(x, y, z, totalDir, point1, point2) {

    if (point1.pos.z === point2.pos.z) z = point1.pos.z;

    let tempPos = new Vec3(x, y, z);
    let tempColor = analysisColor(tempPos, totalDir, point1, point2);
    let tempPoint = new Point(tempPos, tempColor);
    return tempPoint;
}

/* analysis color keep in triangle */
function analysisColor(pos, totalDir, point1, point2) {
    let color1 = new Color().set(point1.color);
    let color2 = new Color().set(point2.color);
    let pos1 = point1.pos;
    if (color1.equal(color2)) {
        return color1;
    }

    let weight1 = pos1.dir(pos) / totalDir;
    let weight2 = 1 - weight1;
    let newColor = new Color().set(color1.multiply(weight1).add(color2.multiply(weight2)));
    newColor.a /= 255;
    return newColor;
}


// clip out of viewport point
function calculateNewPoint(lostPoint, containPoint) {
    let width = canvasWidth / 2;
    let height = canvasHeight / 2;

    let lostPos = lostPoint.pos;
    let containPos = containPoint.pos;

    let dy = lostPos.y - containPos.y;
    let dx = lostPos.x - containPos.x;

    let len = (lostPos.x * containPos.y) - (lostPos.y * containPos.x);

    if (dy === 0) {
        if (lostPos.x < -width) {
            return new Point(new Vec3(-width, lostPos.y), lostPoint.color);
        }
        else {
            return new Point(new Vec3(width, lostPos.y), lostPoint.color);
        }
    }
    else if (dx === 0) {
        if (lostPos.y < -height) {
            return new Point(new Vec3(lostPos.x, -height), lostPoint.color);
        }
        else {
            return new Point(new Vec3(lostPos.x, height), lostPoint.color);
        }
    }
    else {
        // 这里只能考虑 point position 而不考虑步长
        if (lostPos.x < -width) {
            let y = (dy / dx) * -width + (len / dx);
            return new Point(new Vec3(-width, y), lostPos.color);
        }
        else if (lostPos.x > width) {
            let y = (dy / dx) * width + (len / dx);
            return new Point(new Vec3(width, y), lostPos.color);
        }
        else if (lostPos.y < -height) {
            let x = (dx / dy) * -height - (len / dy);
            return new Point(new Vec3(x, -height), lostPos.color);
        }
        else {
            let x = (dx / dy) * height - (len / dy);
            return new Point(new Vec3(x, height), lostPos.color);
        }
    }
}

window.isContain = function (pos) {
    let width = canvasWidth / 2;
    let height = canvasHeight / 2;

    if (pos.x < -width || pos.x > width || pos.y < -height || pos.y > height) {
        return false;
    }
    return true;
}