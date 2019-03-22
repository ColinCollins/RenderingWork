function Line (point1, point2) {
    this.point1 = point1;
    this.point2 = point2;
    // get origin
    let x = (this.point1.pos.x + this.point2.pos.x) / 2;
    let y = (this.point1.pos.y + this.point2.pos.y) / 2;
    let z = (this.point1.pos.z + this.point2.pos.z) / 2;
    this.centroid = new Vec3(x, y, z);
}

let prop = Line.prototype;

// moveTo

// moveBy

// add

module.exports = Line;