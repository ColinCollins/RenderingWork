function Vec2 (x, y) {
    if (!x && !y) {
        this.x = 0;
        this.y = 0;
    }
    else if (!y) {
        this.x = this.y = x;
    }
    else {
        this.x = x;
        this.y = y;
    }
}

let prop = Vec2.prototype;
// set the vec2
prop.set = function (vec2) {
    this.x = vec2.x;
    this.y = vec2.y;
}

module.exports = Vec2;