const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');

const app = express();


app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font')))
app.use('/css', express.static(path.join(__dirname, 'static/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'static/js')))
app.use('/html', express.static(path.join(__dirname, 'static/html')))
app.use('/img', express.static(path.join(__dirname, 'static/images')))
app.use('/img', express.static(path.join(__dirname, 'static/html/images')))
app.use('/pdf', express.static(path.join(__dirname, 'static/pdf')))

nunjucks.configure('templates', {
    autoescape: true,
    express: app
});

function findObjectById(list, id) {
    return list.find((obj) => obj.id === id);
}
function get_child_categories(list, id) {
    return list.filter((obj) => obj.parent === id);
}
function findPostByCategoryId(list, id) {
    return list.filter((obj) => obj.categories.indexOf(id) != -1);
}
function findPostBySlug(list, id) {
    return list.find((obj) => obj.slug === id);
}
    
const posts = require(path.join(__dirname, 'static/json/posts.json'))
const new_posts = posts.slice(0, 5);
const categories = require(path.join(__dirname, 'static/json/categories.json'))

app.get('/', function(req, res) {
    res.render('index.html',{ home_url : 'http://localhost:3000', categories : categories, new_posts : new_posts });
});

app.get('/cv', function(req, res) {
    res.render('cv.html',{ home_url : 'http://localhost:3000', categories : categories, new_posts : new_posts });
});

app.get('/blog/*.html', function(req, res) {
    var requestedURL = req.originalUrl;
    const regex = /\/blog\/(.*)\/(.*\.html)/gm;
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

    var category = findObjectById(categories, matches[1])
    var singlepost = findPostBySlug(posts, matches[2])
    
    res.render('single.html',{ home_url : 'http://localhost:3000', singlepost : singlepost, categories : categories, category : category, new_posts : new_posts });
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

    var category = findObjectById(categories, matches[1])
    console.log(category);
    if(category !== undefined) {
        var children = get_child_categories(categories, category.id)
        console.log(children);
        var myposts = findPostByCategoryId(posts, category.id)
        console.log(myposts);
    }
    res.render('blog.html',{ home_url : 'http://localhost:3000', categories : categories, category : category, children : children, myposts : myposts, new_posts : new_posts });
});

app.use((req, res) => {
    res.status(404);
    res.send(`<h1>Error 404</h1>`);
});

app.listen(3000, () => {
    console.log("App listening on port 3000");
});