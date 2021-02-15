const express = require('express'),
    app = express(),
    puppeteer = require('puppeteer');

const fs = require('fs')

const http = require('http')

const WebSocket = require('ws');

let browser;
let page;

async function takeScr() {
    try {
        page.screenshot({
            quality: 50,
            path: __dirname + '/public/puppeteer.jpeg'
        })
    } catch (error) {
        //console.error(error.message)
    }
    setTimeout(() => {
        takeScr()
    }, 1000);
}


async function saveCookies() {
    fs.writeFileSync('./lasturl.txt', page.url());

    let cookies = await page.cookies();
    fs.writeFileSync('./cookies.json', JSON.stringify(cookies, null, 2));
    setTimeout(() => {
        saveCookies()
    }, 30000);
}

app.use('/', express.static('public'))
const server = http.createServer(app);
var listener = server.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
    console.log('http://localhost:' + listener.address().port);

});
const wss = new WebSocket.Server({
    server,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
    }
});
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
};
console.log("Server started!");
(async () => {
    browser = await puppeteer.launch({
        //headless: false,
        args: ['--no-sandbox', '--window-size=1900,700', '--disable-setuid-sandbox'],
        slowMo: 0
    });
    page = await browser.newPage();
    await page._client.send('Emulation.clearDeviceMetricsOverride');
    try {
        const cookiesString = fs.readFileSync('./cookies.json');
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
    } catch (err) {

    }
    // set user agent (override the default headless User Agent)
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

    await page.goto(fs.readFileSync("./lasturl.txt", "utf-8"), { waitUntil: "domcontentloaded" })
    await page.waitForSelector(".margin-tiny .action")
    await page.evaluate(fs.readFileSync("./renew.js", "utf-8"))

    setTimeout(() => {
        takeScr()
    }, 10);

    setTimeout(() => {
        saveCookies()
    }, 10000);

    page.on('console', msg => {
        console.log('PAGE LOG:', msg.text())

        if (msg.text().startsWith("Expires in ")) {
            try {
                wss.broadcast(msg.text().replace("Expires in ", ""))
            } catch (error) {

            }
        }
    });

    //await browser.close();
})();




let clientCount = 0;
wss.on('connection', (ws, request) => {
    const ip = request.headers.hasOwnProperty("x-forwarded-for") ? request.headers["x-forwarded-for"].split(',')[0] : "local";
    clientCount += 1;

    ws.ip = ip;
    ws.userid = clientCount;

    console.log("a new user connected -- " + ws.userid + " -- " + ip + " --", clientCount, "users connected");

    ws.on('close', () => {
        clientCount -= 1;
        console.log("a user disconnected --" + ws.userid + " -- " + ip + " --", clientCount, "users connected");
    });

    ws.on('message', async (data) => {
        console.log('received:', data)

        if (data.startsWith("{")) {
            data = JSON.parse(data);
            if (data.type == 't') {

            }
            else if (data.type == 'm') {
                if (data.b == 4) {
                    await page.goBack()
                } else if (data.b == 5) {
                    await page.goForward()
                } else {
                    await page.mouse.click(data.x, data.y, { button: ['', 'left', 'middle', 'right'][data.b] })
                }
            }
            else if (data.type == 'kd') {
                await page.keyboard.down(data.c);
            }
            else if (data.type == 'ku') {
                await page.keyboard.up(data.c);
            }
            else if (data.type == 'w') {
                await page.evaluate((data) => {
                    window.scrollBy(0, data.y / 2)
                }, data)
            }
        }
    })

    ws.send(JSON.stringify({ userid: ws.userid }))
}) 
