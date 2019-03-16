exports.isDeveloped = true;

window.log = (msg, flag = true) => {
    if (this.isDeveloped && flag) console.log(msg);
}

window.warn = (msg, flag = true) => {
    if (this.isDeveloped && flag) console.warn(msg);
}

window.error = (msg, flag = true) => {
    if (this.isDeveloped && flag) console.error(msg);
}