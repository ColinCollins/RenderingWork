/*
 * pos {Vec3}
 * color {color}
 */
function Point (pos, color) {
    this.pos = pos || new Vec3().Zero;
    this.color = color || new Color();
}


module.exports = Point;