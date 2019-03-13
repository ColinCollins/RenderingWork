exports.isDeveloped = true;

window.log = (msg) => {
    if (this.isDeveloped) console.log(msg);
}

window.warn = (msg) => {
    if (this.isDeveloped) console.warn(msg);
}

window.error = (msg) => {
    if (this.isDeveloped) console.error(msg);
}