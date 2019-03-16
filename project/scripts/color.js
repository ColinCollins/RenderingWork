function Color (r = 0, g = 0, b = 0, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.elements = new Float32Array([
        this.r, this.g, this.b, this.a
    ]);
}

let prop = Color.prototype;

prop.equal = function (color) {
    if (this.r !== color.r || this.g !== color.g || this.b !== color.b || this.a !== color.a) {
        return false;
    }

    return true;
}

prop.multiply = function (value) {
    return new Color(
        this.r *= value,
        this.g *= value,
        this.b *= value,
        this.a *= value
    );
}

prop.set = function (color) {
    if (!(color instanceof Color)) {
        warn(`Color set method can't accept the value that not inherit from the Color`);
        return;
    }
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;

    return this;
}

prop.add = function (color) {
    if (!(color instanceof Color)) {
        warn(`Color add method can't accept the value that not inherit from the Color`);
        return;
    }
    return new Color (
        this.r + color.r,
        this.g + color.g,
        this.b + color.b,
        this.a + color.a
    );
}

Object.defineProperty(Color.prototype, 'random', {
        get: function () {
            return new Color((Math.floor(Math.random() * 200) + 50), (Math.floor(Math.random() * 200) + 50), (Math.floor(Math.random() * 200) + 50), 1);
        }
    }
);

module.exports = Color;