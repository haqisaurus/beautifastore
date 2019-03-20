const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const db = require('./routes/db')
const bodyParser = require('body-parser')
const path = require('path')
const engines = require('consolidate');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');

app.use(cookieParser('secret'));
app.use(session({cookie: { maxAge: 60000 }}));
app.use(bodyParser.urlencoded({extend:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash())

app.set('views', __dirname + '/views');
app.engine('html', engines.mustache);
app.set('view engine', 'html');

let url = 'mongodb://beautifa:gorila28A@ds117806.mlab.com:17806/beautifa'
db.connect(url, function (err) {
    if (err) {
        
        console.log('Unable to connect to Mongo.')
        process.exit(1)
    } else {
        app.use(require('./routes/utama'))
        app.listen(port, () => console.log(`Example app listening on port ${port}!`))
    }
})