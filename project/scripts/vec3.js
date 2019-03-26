function Vec3 (x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
}

let prop = Vec3.prototype;
// set the vec3
prop.set = function (vec3) {
    if (!(vec3 instanceof Vec3)) {
        warn(`Vec3 set can't accept the value that not inherit from the Vec3`);
        return;
    }

    this.x = vec3.x;
    this.y = vec3.y;
    this.z = vec3.z;
}

prop.dir = function (vec3) {
    if (!(vec3 instanceof Vec3)) {
        warn(`Vec3 dir can't accept the value that not inherit from the Vec3`);
        return;
    }

    let dx = this.x - vec3.x;
    let dy = this.y - vec3.y;
    let dz = this.z - vec3.z;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
}

prop.cross2D = function (pos) {
    return this.x * pos.y - this.y * pos.x;
}

prop.dot2D = function (pos) {
    return this.x * pos.y + this.y * pos.x;
}

prop.add = function (newVec3) {
    if (!(newVec3 instanceof Vec3)) {
        warn(`Vec3 add method can't accept value: ${newVec3}`) ;
        return;
    }
    return new Vec3(
        this.x + newVec3.x,
        this.y + newVec3.y,
        this.z + newVec3.z
    );
}

prop.equal = function (vec3) {
    if (vec3.x !== this.x || this.y !== vec3.y || this.z !== vec3.z) {
        return false;
    }
    return true;
}

prop.cut = function (newVec3) {
    if (!(newVec3 instanceof Vec3)) {
        warn(`Vec3 add method can't accept value: ${newVec3}`) ;
        return;
    }
    return new Vec3(
        this.x - newVec3.x,
        this.y - newVec3.y,
        this.z - newVec3.z
    );
}
/**
 * matrix4 {Matrix4}
 * return new Vec3
*/
prop.multiplyMatrix = function (matrix4, flag = false) {
    let result = new Vec3();
    let e = matrix4.elements;
    // translate from the camera
    result.x = accMul(this.x, e[0]) + accMul(this.y, e[4]) + accMul(this.z, e[8]) + e[12];  // Nx
    result.y = accMul(this.x, e[1]) + accMul(this.y, e[5]) + accMul(this.z, e[9])  + e[13]; // Ny
    result.z = accMul(this.x, e[2]) + accMul(this.y, e[6]) + accMul(this.z, e[10]) + e[14]; // az + b
    result.w = accMul(this.x, e[3]) + accMul(this.y, e[7]) + accMul(this.z, e[11]) + e[15]; // -z
    fromat(result, flag);
    return result;
}

function fromat (result, flag) {
    result.x = result.x / result.w;
    result.y = result.y / result.w;
    result.z = result.z / result.w;
    let value1 = accMul(result.x, canvasWidth / 2);
    let value2 = accMul(result.y, canvasHeight / 2);
    if (flag) {
        result.x = ownParseInt(result.x, value1);
        result.y = ownParseInt(result.y, value2);
        result.z = ownParseInt(result.z, (result.z * 1000.0));
    }
    else {
        result.x = ownParseInt(result.x);
        result.y = ownParseInt(result.y);
        result.z = result.z;
    }
    log(`result: ${result.x} : ${result.y} : ${result.z}`);
    // result.w = result.w % 1 > 0.5 ? Math.ceil(result.w) : Math.floor(result.w);
}

Object.defineProperty(Vec3.prototype, 'ZERO', {
    get function () {
        return new Vec3();
    }
}
);

function accMul(arg1, arg2) {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try {
        m += s1.split(".")[1].length;
    }
    catch (e) {
    }
    try {
        m += s2.split(".")[1].length;
    }
    catch (e) {
    }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
}

module.exports = Vec3;