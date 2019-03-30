/*
    pos must be the Vec3
 */
exports.BresenhamLine = function (point1, point2) {
    // pos1 === pos2
    let pos1 = point1.pos;
    let pos2 = point2.pos;

    let uv1 = point1.uv;
    let uv2 = point2.uv;
    // save the line poinits
    let tempPoints = [];
    tempPoints.push(point1);
    tempPoints.push(point2);
    // 用来计算权重
    let dir = point1.pos.dir(point2.pos);
    if (pos1.x === pos2.x && pos1.y !== pos2.y) {
        let x = pos1.x;
        let dy = Math.max((pos2.y - pos1.y), (pos1.y - pos2.y));
        let startY, startZ, stepZ = 0;
        let startUV, stepV = 0;
        let startW, stepW = 0;
        if (pos1.y < pos2.y) {
            startY = pos1.y;
            startZ = pos1.z;
            stepZ = accDiv((pos2.z - pos1.z), Math.abs(dy));
            startUV = uv1;
            stepV = uv2.sub(uv1).y / dy;
            startW = pos1.w;
            stepW = (pos2.w - pos1.w) / dy;
        }
        else {
            startY = pos2.y;
            startZ = pos2.z;
            stepZ = accDiv((pos1.z - pos2.z), Math.abs(dy));
            startUV = uv2;
            stepV = uv1.sub(uv2).y / dy;
            startW = pos2.w;
            stepW = (pos1.w - pos2.w) / dy;
        }

        for (let i = 1; i < dy; i++) {
            let y = startY + i;
            let z = startZ + stepZ * i;
            let uv = new Vec3(startUV.x, startUV.y + (stepV * i));
            let w = startW + stepW * i;
            tempPoints.push(createPoint(x, y, z, w, uv, dir, point1, point2));
        }
    }
    else if (pos1.y === pos2.y && pos1.x !== pos2.x) {
        let y = pos1.y;
        let dx = Math.max((pos2.x - pos1.x), (pos1.x - pos2.x));
        let startX, startZ, stepZ = 0
        let startUV, stepUV = 0;
        let startW, stepW = 0;
        if (pos1.x < pos2.x) {
            startX = pos1.x;
            startZ = pos1.z;
            stepZ = accDiv((pos2.z - pos1.z), Math.abs(dx));
            startUV = uv1;
            stepUV = new Vec3(uv2.sub(uv1).x / dx, uv2.sub(uv1).y / dx);
            startW = pos1.w;
            stepW = (pos2.w - pos1.w) / dx;
        }
        else {
            startX = pos2.x;
            startZ = pos2.z;
            stepZ = accDiv((pos1.z - pos2.z), Math.abs(dx));
            startUV = uv2;
            stepUV = new Vec3(uv1.sub(uv2).x / dx, uv1.sub(uv2).y / dx);
            startW = pos2.w;
            stepW = (pos1.w - pos2.w) / dx;
        }

        for (let i = 1; i < dx; i++) {
            let x = startX + i;
            let z = startZ + stepZ * i;
            let uv = new Vec3(startUV.x + (stepUV.x * i), startUV.y + (stepUV.y * i));
            let w = startW + stepW * i;
            tempPoints.push(createPoint(x, y, z, w, uv, dir, point1, point2));
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
            let startUV, stepUV;
            let startW, stepW = 0;
            if (rate > 0 && pos1.y < pos2.y || rate < 0 && pos1.y > pos2.y) {
                startPos = pos1;
                startZ = pos1.z;
                stepZ = accDiv((pos2.z - pos1.z), Math.abs(dy));
                startUV = uv1;
                stepUV = new Vec3(uv2.sub(uv1).x / Math.abs(dx), uv2.sub(uv1).y / Math.abs(dy));
                startW = pos1.w;
                stepW = (pos2.w - pos1.w) / Math.abs(dy);
            }
            else {
                startPos = pos2;
                startZ = pos2.z;
                stepZ = accDiv((pos1.z - pos2.z), Math.abs(dy));
                startUV = uv2;
                stepUV = new Vec3(uv1.sub(uv2).x / Math.abs(dx), uv1.sub(uv2).y / Math.abs(dy));
                startW = pos2.w;
                stepW = (pos1.w - pos2.w) / Math.abs(dy);
            }

            let diff = 0;
            for (let i = 1; i < Math.abs(dy); i++) {
                let y = startPos.y + sym * i;
                let curRate = diff !== 0 ? i / diff : 0;
                let z = startZ + stepZ * i;
                if (Math.abs(curRate) > Math.abs(rate) || curRate === 0) {
                    diff += 1;
                }
                let uv = new Vec3(startUV.x + (diff * stepUV.x), startUV.y + (i * stepUV.y));
                let w = startW + stepW * i;
                tempPoints.push(createPoint((diff + startPos.x), y, z, w, uv, dir, point1, point2));
            }
        }
        else {
            // from left to right
            startPos = pos1.x < pos2.x ? pos1 : pos2;
            let stepZ, startZ = 0;
            let startUV, stepUV;
            let startW, stepW = 0;
            if (startPos.equal(pos1)) {
                startZ = pos1.z;
                stepZ = accDiv((pos2.z - pos1.z), Math.abs(dx));
                startUV = uv1;
                stepUV = new Vec3(uv2.sub(uv1).x / Math.abs(dx), uv2.sub(uv1).y / Math.abs(dy));
                startW = pos1.w;
                stepW = (pos2.w - pos1.w) / Math.abs(dx);
            }
            else {
                startZ = pos2.z;
                stepZ = accDiv((pos1.z - pos2.z), Math.abs(dx));
                startUV = uv2;
                stepUV = new Vec3(uv1.sub(uv2).x / Math.abs(dx), uv1.sub(uv2).y / Math.abs(dy));
                startW = pos2.w;
                stepW = (pos1.w - pos2.w) / Math.abs(dx);
            }

            let diff = 0;
            for (let i = 1; i < Math.abs(dx); i++) {
                let x = startPos.x + i;
                let curRate = diff / i;
                let z = startZ + stepZ * i;
                if (Math.abs(curRate) < Math.abs(rate)) {
                    diff += rate < 0 ? -1 : 1;
                }
                let uv = new Vec3(startUV.x + (i * stepUV.x), startUV.y + (Math.abs(diff) * stepUV.y));
                let w = startW + stepW * i;
                tempPoints.push(createPoint(x, (diff + startPos.y), z, w, uv, dir, point1, point2));
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

function createPoint(x, y, z, w, uv, totalDir, point1, point2) {
    if (point1.pos.z === point2.pos.z) z = point1.pos.z;
    let tempPos = new Vec3(x, y, z, w);
    let tempColor = analysisColor(tempPos, totalDir, point1, point2);
    let tempPoint = new Point(tempPos, tempColor, uv);
    return tempPoint;
}

/* analysis color keep in triangle */
function analysisColor(pos, totalDir, point1, point2) {
    if (!point1.color || !point2.color) return null;
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