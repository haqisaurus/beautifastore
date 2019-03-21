const express = require('express')
const router = express.Router();
const request = require('request')
const cheerio = require('cheerio')
const path = require('path')
const shortid = require('shortid');
const db = require('./db')
ObjectId = require('mongodb').ObjectID
router.get('/get-detail', async (req, res) => {
    console.log(req.query)
    db.get().collection('product').findOne({
        _id: ObjectId(req.query.id)
    }).then(data => {
        console.log(data)
        res.send(data)
    })
})
router.post('/update', async (req, res) => {
    db.get().collection('product').findOneAndUpdate({
        _id: ObjectId(req.body.id)
    },{
        $set: {
            name: req.body.name,
            code: req.body.sku,
            url: req.body.url,
            from: req.body.radio,
            price: req.body.price,
            desc: req.body.desc,
        }
    }).then(data => {
        console.log(data)
        res.send(data.lastErrorObject)
    })
})
router.get('/', (req, res) => {
    db.get().collection('product').find({
    }).sort({
        '_id': -1
    }).toArray((err, data) => {
        data.map(element => {
            let url = new URL(element.url)
            element.urlView = url.origin + url.pathname
            return element
        });
        let success = req.flash('sku')
        res.render(__dirname + '/../views/index.html', { data, messages: success })
    })
})
router.post('/', (req, res) => {
    db.get().collection('product').find({
        "$or" : [
            {
                name: {$regex: "^.*" + req.body.search + ".*$", $options: 'i'}
            }, 
            {
                code: {$regex: "^.*" + req.body.search + ".*$", $options: 'i'}
            },
            {
                url: {$regex: "^.*" + req.body.search + ".*$", $options: 'i'}
            },
        ]
    }).sort({
        '_id': -1
    }).toArray((err, data) => {
        data.map(element => {
            let url = new URL(element.url)
            element.urlView = url.origin + url.pathname
            return element
        })
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
    let url = new URL(req.body.url)
    url = url.origin + url.pathname
    db.get().collection('product').findOne({
        url: {$regex: "^.*" + url + ".*$", $options: 'i'},
    }).then(data => {
        console.log(data)
        if (data) {
            res.render(__dirname + '/../views/insert.html', {
                name: data.name,
                sku: data.code,
                url: data.url,
                from: data.radio,
                desc: req.body.desc,
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
                desc: req.body.desc,
                stock: 'tersedia'
            }).then(result => {
                console.log(result)
                if (result.insertedCount) {
                    req.flash('sku', req.body.sku);
                    res.redirect('/')
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