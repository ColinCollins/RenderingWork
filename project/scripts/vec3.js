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

Object.defineProperty(Vec3.prototype, 'ZERO', {
    get function () {
        return new Vec3();
    }
}
);

module.exports = Vec3;