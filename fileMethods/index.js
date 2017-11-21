const puppeteer = require('puppeteer');
const get_pdf = require('./getPdf');

function generatePNG(req, res) {
    res.json({"status": "ok"});
}

function generatePdf(url, req, res) {
    const Auth = req.headers.authorization;
    const {settings} = req.body;
    const config = typeof settings !== "undefined" ? settings : null;
    async function get (auth, config) {
        console.log(`request started at ${new Date()}`);
        const options = {
            landscape: typeof config.landscape  !== "undefined" ? config.landscape : false,
            printBackground: typeof config.printBackground  !== "undefined" ? config.printBackground : true,
            displayHeaderFooter: typeof config.displayHeaderFooter !== "undefined" ? config.displayHeaderFooter : true,
            networkSetting: {
                timeout: 0,
                waitUntil: 'networkidle'
            }
        };
        const browser = await puppeteer.launch({
            headless: true,
            timeout: 0,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1280,
            height: config.pageSize.height || 0,
            deviceScaleFactor: 1
        });
        await page.goto(url);
        await page.evaluate(jwt => {
            window.localStorage.setItem('full-auth', jwt);
            window.localStorage.setItem('userName', jwt);
        }, auth);
        const dimensions = await page.evaluate(() => {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
                deviceScaleFactor: window.devicePixelRatio
            };
        });
        console.log(dimensions);
        await page.reload();
        await page.waitForNavigation({
            timeout: 0,
            waitUntil: 'networkidle'
        });
        await page.pdf({
            path: 'public/example.pdf',
            format: config.format || 'A4',
            scale: 1,
            landscape: options.landscape,
            printBackground: options.printBackground,
            displayHeaderFooter: options.displayHeaderFooter,
            height: dimensions.height,
            width: dimensions.width
        });
        // await page.close();
        await browser.close();
    }
    get(Auth, config).then(v => {
        console.log(`request finished at ${new Date()}`);
        console.log('pdf generated');
        res.download('public/example.pdf', 'example.pdf', (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('cool');
            }
        });
        console.log('FINISHED');
    }).catch(err => {
        console.log(`request failed at ${new Date()}`);
        console.log(err);
        res.json({"response": err});
    })
}

function generatePdfWithSetting(req, res) {
    const Auth = req.headers.authorization;
    const {settings} = req.body;
    const config = typeof settings !== "undefined" ? settings : null;
    const mergedSettings = get_pdf.getSettings(config);
    async function get (auth, config) {
        const browser = await puppeteer.launch(config.launch);
        const page = await browser.newPage();
        await page.setViewport(config.setViewport);
        await page.goto(req.body.url);
        await page.evaluate(jwt => {
            window.localStorage.setItem('full-auth', jwt);
            window.localStorage.setItem('userName', jwt);
        }, auth);
        const dimensions = await page.evaluate(() => {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
                deviceScaleFactor: window.devicePixelRatio
            };
        });
        await page.reload();
        await page.waitForNavigation(config.network);
        let pdf = config.pdf;
        pdf.height = dimensions.height;
        pdf.width = dimensions.width;
        pdf.deviceScaleFactor = dimensions.deviceScaleFactor;
        await page.pdf(pdf);
        await page.close();
        await browser.close();
    }

    get(Auth, mergedSettings)
        .then(() => {
            console.log(`request finished at ${new Date()}`);
            console.log('pdf generated');
            res.download('public/example.pdf', 'example.pdf', (err) => {
                if (err) {
                    console.log("Error: \n", err);
                } else {
                    console.log('cool');
                }
            });
        })
        .catch(err => {
            console.log(`request failed at ${new Date()}`);
            console.log(err);
            res.json({"response": err});
        })
}

module.exports = {
    generatePNG,
    generatePdf,
    generatePdfWithSetting
};