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
    result.x = this.x * e[0] + this.y * e[4] + this.z * e[ 8] + e[12];  // Nx
    result.y = this.x * e[1] + this.y * e[5] + this.z * e[ 9] + e[13];  // Ny
    result.z = this.x * e[2] + this.y * e[6] + this.z * e[10] + e[14];  // az + b
    result.w = this.x * e[3] + this.y * e[7] + this.z * e[11] + e[15];  // -z
    fromat(result, flag);
    return result;
}

function fromat (result, flag) {
    result.x = result.x / result.w;
    result.y = result.y / result.w;
    result.z = result.z / result.w;
    if (flag) {
        result.x = result.x % 1 > 0.5 ? Math.floor(result.x * canvasWidth / 2) : Math.ceil(result.x * canvasWidth / 2);
        result.y = result.y % 1 > 0.5 ? Math.floor(result.y * canvasHeight / 2) : Math.ceil(result.y * canvasHeight / 2);
        result.z = result.z % 1 > 0.5 ? Math.floor(result.z * 100) : Math.ceil(result.z * 100);
    }
    else {
        result.x = result.x % 1 > 0.5 ? Math.floor(result.x) : Math.ceil(result.x);
        result.y = result.y % 1 > 0.5 ? Math.floor(result.y) : Math.ceil(result.y);
        result.z = result.z % 1 > 0.5 ? Math.floor(result.z) : Math.ceil(result.z);
    }
    // result.w = result.w % 1 > 0.5 ? Math.ceil(result.w) : Math.floor(result.w);
}

Object.defineProperty(Vec3.prototype, 'ZERO', {
    get function () {
        return new Vec3();
    }
}
);

module.exports = Vec3;