function Vec3 (x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    // w = 1 表示 point， 0 表示向量
    this.w = w;
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

prop.sub = function (newVec3) {
    if (!(newVec3 instanceof Vec3)) {
        warn(`Vec3 sub method can't accept value: ${newVec3}`) ;
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
prop.multiplyMatrix = function (matrix4) {
    let result = new Vec3();
    let e = matrix4.elements;
    // translate from the camera
    result.x = accMul(this.x, e[0]) + accMul(this.y, e[4]) + accMul(this.z, e[8]) + e[12];  // Nx
    result.y = accMul(this.x, e[1]) + accMul(this.y, e[5]) + accMul(this.z, e[9])  + e[13]; // Ny
    result.z = accMul(this.x, e[2]) + accMul(this.y, e[6]) + accMul(this.z, e[10]) + e[14]; // az + b
    result.w = accMul(this.x, e[3]) + accMul(this.y, e[7]) + accMul(this.z, e[11]) + e[15]; // -z

    result.x = result.x / result.w;
    result.y = result.y / result.w;
    result.z = result.z / result.w;

    return new Vec3(result.x, result.y, result.z, result.w);
}

prop.mul = function (value) {
    return new Vec3(
        this.x * value,
        this.y * value,
        this.z * value
    )
}
prop.div = function (value) {
    if (!value) return;
    return new Vec3(
        this.x / value,
        this.y / value,
        this.z / value
    );
}

prop.formatNormal = function () {
    this.x = ownParseInt(this.x);
    this.y = ownParseInt(this.y);
    this.z = this.z * 10.0;
}

prop.formatDepth = function () {
    let value1 = accMul(this.x, canvasWidth / 2);
    let value2 = accMul(this.y, canvasHeight / 2);

    this.x = ownParseInt(this.x, value1);
    this.y = ownParseInt(this.y, value2);
    this.z = this.z * 10.0;

    // log(`result: ${this.x} : ${this.y} : ${this.z}`);
}

Object.defineProperty(Vec3.prototype, 'ZERO', {
    get function () {
        return new Vec3();
    }
}
);

module.exports = Vec3;