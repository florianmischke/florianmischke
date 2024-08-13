const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');

const app = express();


app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font')))
app.use('/css', express.static(path.join(__dirname, 'static/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'static/js')))

nunjucks.configure('templates', {
    autoescape: true,
    express: app
});

app.get('/', function(req, res) {
    res.render('index.html');
});

app.get('/blog', function(req, res) {
    res.render('blog.html');
});

app.use((req, res) => {
    res.status(404);
    res.send(`<h1>Error 404</h1>`);
});

app.listen(3000, () => {
    console.log("App listening on port 3000");
});