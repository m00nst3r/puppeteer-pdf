const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const storage = require('node-persist');
const PORT = process.env.PORT || 3333;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
storage.initSync();

function getImage(url, req, res) {
    const Auth = req.headers.authorization;
    async function get (auth) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(url, {
            waitUntil: 'networkidle'
        });
        await page.evaluate(jwt => {
            localStorage.setItem('full-auth', jwt);
            localStorage.setItem('userName', jwt);
        }, auth);
        await page.reload();
        await page.goto(url);
        await page.pdf({
            path: 'public/example.pdf',
            format: 'A4',
            landscape: true,
            printBackground: true,
            displayHeaderFooter: true
        });
        await browser.close();
    }
    get(Auth).then(v => {
        res.send('cool')
    }).catch(err => {
        console.log(err);
        res.send('error');
    })
}

app.post('/', (req, res) => {
    // console.log(req);
    // console.log(req.headers.authorization);
    if (req.body.url) {
        getImage(req.body.url, req, res);
    } else {
        req.send('oops')
    }
});

app.get('/', (req, res) => {
    async function get () {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto('http://localhost:3000');
        await page.pdf({path: 'public/example.pdf', format: 'A4'});
        await browser.close();
    }

    get().then(v => {
        res.send('cool')
    }).catch(err => {
        console.log(err);
        res.send('error');
    })
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});
