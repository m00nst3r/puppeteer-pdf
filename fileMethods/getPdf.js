function getSettings(conf) {
    let settings = {};
    for(let item in defaultSettings) {
        if (typeof conf[item] !== 'undefined') {
            let obj = {};
            for (let i in defaultSettings[item]) {
                if (typeof conf[item][i] !== "undefined") {
                    obj[i] = conf[item][i]
                } else {
                    obj[i] = defaultSettings[item][i]
                }
            }
            settings[item] = obj;
        } else {
            settings[item] = defaultSettings[item];
        }
    }
    return settings;
}

const defaultSettings = {
    launch: {
        headless: true,
        timeout: 0,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    setViewport: {
        width: 0,
        height: 0,
        deviceScaleFactor: 1
    },
    pdf: {
        path: 'public/example.pdf',
        format: 'A4',
        scale: 1,
        landscape: false,
        printBackground: true,
        displayHeaderFooter: true,
    },
    network: {
        timeout: 0,
        waitUntil: 'networkidle'
    }
};

module.exports = {
    getSettings,
    defaultSettings
};