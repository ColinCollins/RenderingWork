/*
 * pos {Vec3}
 * color {color}
 * uv {Vec3} -> texture coordiate
 */
function Point (pos, color, uv) {
    this.pos = pos || new Vec3();
    this.color = color || new Color();
    this.uv = uv || new Vec3();
    // keep the Depth state
    this.dropByDepth = false;
}


module.exports = Point;