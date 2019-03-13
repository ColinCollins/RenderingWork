function color (r = 0, g = 0, b = 0, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.elements = new Float32Array([
        this.r, this.g, this.b, this.a
    ]);
}

module.exports = color;