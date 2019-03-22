/*
 * pos {Vec3}
 * color {color}
 */
function Point (pos, color) {
    this.pos = pos || new Vec3().Zero;
    this.color = color || new Color();
    // keep the Depth state
    this.dropByDepth = false;
}


module.exports = Point;