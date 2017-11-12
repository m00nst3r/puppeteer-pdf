const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const storage = require('node-persist');
const PORT = process.env.PORT || 3333;

const app = express();

app.use((req, res, next) =>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
storage.initSync();

function generatePdf(url, req, res) {
    const Auth = req.headers.authorization;
    const {settings} = req.body;
    const config = typeof settings !== "undefined" ? settings : null;
    async function get (auth, config) {
        const options = {
            waitUntil: 'networkidle',
            format:  config.format || 'A4',
            landscape: typeof config.landscape  !== "undefined" ? config.landscape : false,
            printBackground: typeof config.printBackground  !== "undefined" ? config.printBackground : true,
            displayHeaderFooter: typeof config.displayHeaderFooter !== "undefined" ? config.displayHeaderFooter : true,
            timeout: 0,
            headless: true
        };
        const browser = await puppeteer.launch({
            headless: options.headless,
            timeout: options.timeout,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({width: 1280, height: 0, deviceScaleFactor: 1});        
        await page.goto(url, {waitUntil: options.waitUntil, timeout: options.timeout});
        await page.evaluate(jwt => {
            localStorage.setItem('full-auth', jwt);
            localStorage.setItem('userName', jwt);
        }, auth);
        const dimensions = await page.evaluate(() => {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
                deviceScaleFactor: window.devicePixelRatio
            };
        });
        console.log(dimensions);
        await page.reload({waitUntil: options.waitUntil, timeout: options.timeout});
        await page.waitForNavigation({waitUntil: options.waitUntil, timeout: options.timeout});
        await page.pdf({
            path: 'public/example.pdf',
            // format: options.format,
            scale: 1,
            landscape: options.landscape,
            printBackground: options.printBackground,
            displayHeaderFooter: options.displayHeaderFooter,
            height: dimensions.height,
            width: dimensions.width
        });
        await browser.close();
    }
    get(Auth, config).then(v => {
        console.log('pdf generated');
        res.json({"response": "ok"})
    }).catch(err => {
        console.log(err);
        res.json({"response": "error"});
    })
}

app.post('/', (req, res) => {
    console.log(req.body);
    if (req.body.url) {
        generatePdf(req.body.url, req, res);
    } else {
        res.json({'response': 'no url'})
    }
});

app.get('/data', (req, res) => {
    setTimeout(() => {
        res.json({
            "response": [
                {
                    "id": 1,
                    "name": "one",
                    "description": "description 1"
                },
                {
                    "id": 2,
                    "name": "two",
                    "description": "description 1"
                },
                {
                    "id": 3,
                    "name": "three",
                    "description": "description 1"
                },
                {
                    "id": 4,
                    "name": "four",
                    "description": "description 1"
                }
            ]
        })
    }, 1000);
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});
