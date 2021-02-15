const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let WIDTH = canvas.offsetWidth;
let HEIGHT = canvas.offsetHeight;
function onResize() {
    WIDTH = canvas.offsetWidth;
    HEIGHT = canvas.offsetHeight;

    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    return
    if (window.devicePixelRatio > 1) {
        canvas.width = canvas.clientWidth * 2;
        canvas.height = canvas.clientHeight * 2;
        ctx.scale(2, 2);
    } else {
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
    }
}
window.addEventListener('resize', onResize);
onResize();


let imgCount = 0;

window.requestAnimationFrame(update);
function update() {
    var img = new Image();
    img.onload = function () {
        ctx.drawImage(img, 0, 0);
    }
    img.src = "puppeteer.jpeg?rnd=" + imgCount;

    setTimeout(() => {
        imgCount++;
        window.requestAnimationFrame(update);
    }, 1000);
}

canvas.addEventListener("mousedown", (e) => {
    console.log(e.which, e.layerX, e.layerY)
    if (e.which == 4 || e.which == 5) {
        e.preventDefault();
    } else {
        ws.send(JSON.stringify({ type: 'm', x: e.layerX, y: e.layerY, b: e.which }))
    }
})
canvas.addEventListener("mouseup", (e) => {
    if (e.which == 4 || e.which == 5) {
        e.preventDefault();
        ws.send(JSON.stringify({ type: 'm', b: e.which }))
    }
})

canvas.addEventListener('wheel', (e) => {
    console.log(e)
    ws.send(JSON.stringify({ type: 'w', y: e.deltaY }))
})

canvas.addEventListener("keydown", (e) => {
    console.log('+', e.code)
    ws.send(JSON.stringify({ type: 'kd', c: e.code }))
})
canvas.addEventListener("keyup", (e) => {
    console.log('-', e.code)
    ws.send(JSON.stringify({ type: 'ku', c: e.code }))
})
/*
document.addEventListener("keydown", (e) => {
    e.preventDefault()
})
document.addEventListener("keyup", (e) => {
    e.preventDefault()
})

 */
