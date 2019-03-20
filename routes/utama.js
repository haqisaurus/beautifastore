const express = require('express')
const router = express.Router();
const request = require('request')
const cheerio = require('cheerio')
const path = require('path')
const shortid = require('shortid');
const db = require('./db')
ObjectId = require('mongodb').ObjectID

router.get('/', (req, res) => {
    db.get().collection('product').find({
    }).sort({
        '_id': -1
    }).limit(1).toArray((err, data) => {
        res.render(__dirname + '/../views/index.html', { data })
    })
})
router.get('/insert', async (req, res) => {
    db.get().collection('product').find({
    }).sort({
        '_id': -1
    }).limit(1).toArray((err, data) => {
        let sku = 'B010'
        console.log(data.length)
        if (data.length) {
            sku = incrementNumberInString(data[0].code)
        }
        // console.log(req.flash('sku'))
        let success = req.flash('sku')
        res.render(__dirname + '/../views/insert.html', { sku: sku, messages: success })
        // delete res.session.sku; // remove from further requests
    })
})
router.post('/insert', (req, res) => {
    db.get().collection('product').findOne({
        url: req.body.url,
    }).then(data => {
        console.log(data)
        if (data) {
            res.render(__dirname + '/../views/insert.html', {
                name: data.name,
                sku: data.code,
                url: data.url,
                from: data.radio,
                price: data.price,
                error: 'DATA EXIST'
            })
        } else {

            db.get().collection('product').insertOne({
                name: req.body.name,
                code: req.body.sku,
                url: req.body.url,
                from: req.body.radio,
                price: req.body.price,
                stock: 'tersedia'
            }).then(result => {
                console.log(result)
                if (result.insertedCount) {
                    req.flash('sku', req.body.sku);
                    res.redirect('/insert')
                }
            })
        }
    })
})

function incrementNumberInString (input) {
    var number = parseInt(input.trim().match(/\d+$/), 10),
        letter = input.trim().match(/^[A-Za-z]/)[0];

    if (number >= 999) {
        number = 1;
        letter = String.fromCharCode(letter.charCodeAt(0) + 1);
        letter = letter === '[' ? 'A' : (letter === '{' ? 'a' : letter);
    } else {
        number++;
    }

    number = '000'.substring(0, '000'.length - number.toString().length) + number;

    return letter + number.toString();
}


module.exports = router