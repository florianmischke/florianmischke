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

app.get('/blog/*', function(req, res) {
    var requestedURL = req.originalUrl;
    const regex = /\/blog\/(.*)/gm;
    const matches = [];
    while ((m = regex.exec(requestedURL)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            console.log(`Found match, group ${groupIndex}: ${match}`);
            matches[groupIndex] = match;
        });
    }

    const posts = require(path.join(__dirname, 'static/json/posts.json'))
    const categories = require(path.join(__dirname, 'static/json/categories.json'))

    function findObjectById(list, id) {
        return list.find((obj) => obj.id === id);
    }
    function findPostByCategoryId(list, id) {
        return list.filter((obj) => obj.categories.indexOf(id) != -1);
    }
    function get_child_categories(list, id) {
        return list.filter((obj) => obj.parent === id);
    }

    var category = findObjectById(categories, matches[1])
    console.log(category);
    if(category !== undefined) {
        var children = get_child_categories(categories, category.id)
        console.log(children);
        var myposts = findPostByCategoryId(posts, category.id)
        console.log(myposts);
    }
    res.render('blog.html',{ home_url : 'http://localhost:3000', category : category, children : children, myposts : myposts, requestedURL : matches });
});

app.use((req, res) => {
    res.status(404);
    res.send(`<h1>Error 404</h1>`);
});

app.listen(3000, () => {
    console.log("App listening on port 3000");
});