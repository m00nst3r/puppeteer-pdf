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

function generatePdf(req, res) {
    async function get() {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto('http://localhost:3000', {waitUntil: 'networkidle'});
        await page.waitForNavigation({waitUntil: 'networkidle'});
        await page.pdf({
            path: 'hn.pdf',
            format: 'letter'
        });

        await browser.close();
    }
    get().then(v => {
        res.json({"status": "ok"})
    }).catch(err => {
        console.log(err);
        res.send('error');
    })
}

function getPdf(url, req, res) {
    const Auth = req.headers.authorization;
    const {settings} = req.body;
    const config = typeof settings !== "undefined" ? settings : null;
    async function get (auth, config) {
        const options = {
            waitUntil: config.waitUntil || 'load',
            format:  config.format || 'A4',
            landscape: config.landscape || false,
            printBackground: config.printBackground || true,
            displayHeaderFooter: config.displayHeaderFooter || true
        };
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(url, {waitUntil: 'networkidle'});
        await page.evaluate(jwt => {
            localStorage.setItem('full-auth', jwt);
            localStorage.setItem('userName', jwt);
        }, auth);
        await page.reload({waitUntil: 'networkidle'});
        await page.waitForNavigation({waitUntil: 'networkidle'});
        await page.pdf({
            path: 'public/example.pdf',
            format: options.format,
            landscape: options.landscape,
            printBackground: options.printBackground,
            displayHeaderFooter: options.displayHeaderFooter
        });
        await browser.close();
    }
    get(Auth, config).then(v => {
        res.send('cool')
    }).catch(err => {
        console.log(err);
        res.send('error');
    })
}

app.post('/', (req, res) => {
    console.log(req.body);
    if (req.body.url) {
        getPdf(req.body.url, req, res);
        // generatePdf(req, res);
    } else {
        res.send('oops')
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
    }, 10000);
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});
