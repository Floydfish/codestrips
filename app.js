const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './db.sqlite');

const app = express();

const PORT = process.env.PORT || 4001;

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static('public'));
app.listen(PORT, () => {
    `Server is listening on port: ${PORT}`
});

app.get('/strips', (req, res, next) => {
    db.all('SELECT * FROM Strip', (err, rows) => {
        if (err) {
            res.sendStatus(500); // Internal server error
        } else {
            res.send({strips: rows});
        }
    })
});

const validateStrip = (req,res,next) => {
    const stripToCreate = req.body.strip;
    if (
        !stripToCreate.head ||
        !stripToCreate.body ||
        !stripToCreate.background ||
        !stripToCreate.bubbleType 
    ) {
        return res.sendStatus(400); // bad request
    }
    next();   
}

app.post('/strips', validateStrip, (req, res, next) => {
    const stripToCreate = req.body.strip;
    db.run(
        `INSERT INTO Strip (head, body, background, bubble_type, bubble_text, caption)
        VALUES ($head, $body, $background, $bubbleType, $bubbleText, $caption)`,
        {
            $head: stripToCreate.head,
            $body: stripToCreate.body,
            $background: stripToCreate.background,
            $bubbleType: stripToCreate.bubbleType,
            $bubbleText: stripToCreate.bubbleText,
            $caption: stripToCreate.caption

        },
        function(err) { // allow theuse of this.lastID
            if (err) {
                return res.sendStatus(500); // internal server error
            }
            db.get(`SELECT * FROM Strip WHERE id = ${this.lastID}`, (err, row) => {
                if (!row) {
                    return res.sendStatus(500)
                }
                res.status(201).send({ strip: row })
            })
        }
    )
})

module.exports = app;