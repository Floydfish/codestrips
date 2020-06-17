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
            res.send({ strips: rows });
        }
    })
});

module.exports = app;