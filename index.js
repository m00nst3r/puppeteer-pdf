const express = require('express');
const bodyParser = require('body-parser');
const fileMethods = require('./fileMethods');
const fs = require('fs');
const PORT = process.env.PORT || 3333;

const app = express();

app.use((req, res, next) =>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Disposition");
    next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/generate/png/', (req, res) => {
    fileMethods.generatePNG(req, res);
});

app.post('/', (req, res) => {
    console.log(`requested url: ${req.body.url}`);
    if (req.body.url) {
        fileMethods.generatePdf(req.body.url, req, res);
    } else {
        res.json({'response': 'no url'})
    }
});

app.post('/generate/pdf/settings', (req, res) => {
    fileMethods.generatePdfWithSetting(req, res);
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
