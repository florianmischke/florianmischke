const helmet = require('helmet');
const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');

const app = express();
// Configure the Content-Security-Policy header.
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                "script-src": ["'self'", "localhost:3000"],
                "object-src": ["'self'", "localhost:3000"],
            },
        },
    }),
);
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
});
app.use(limiter);

// const { body, validationResult } = require('express-validator');

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
    res.render('home.html',{ home_url : 'http://localhost:3000', categories : categories, new_posts : new_posts });
});

app.get('/cv', function(req, res) {
    res.render('cv.html',{ home_url : 'http://localhost:3000', categories : categories, new_posts : new_posts });
});

app.get('/impressum', function(req, res) {
    res.render('impressum.html',{ home_url : 'http://localhost:3000', categories : categories, new_posts : new_posts });
});

app.get('/stuff', function(req, res) {
    res.render('stuff.html',{ home_url : 'http://localhost:3000', categories : categories, new_posts : new_posts });
});

app.get('/datenschutz', function(req, res) {
    res.render('datenschutz.html',{ home_url : 'http://localhost:3000', categories : categories, new_posts : new_posts });
});

app.get('/blog/:category/:post', function(req, res) {
    const categoryId = req.params.category
    if (!categories.find(x => x.id == categoryId)) {
        return error_404(req, res)
    }
    const postId = req.params.post
    if (!posts.find(x => x.slug == postId)) {
        return error_404(req, res)
    }

    var category = findObjectById(categories, categoryId)
    var singlepost = findPostBySlug(posts, postId)
    
    res.render('single.html',{ home_url : 'http://localhost:3000', singlepost : singlepost, categories : categories, category : category, new_posts : new_posts });
});

app.get('/blog/:category', function(req, res) {
    const categoryId = req.params.category
    if (!categories.find(x => x.id == categoryId)) {
        return error_404(req, res)
    }
    const category = findObjectById(categories, categoryId)

    if(category !== undefined) {
        var children = get_child_categories(categories, category.id)
        var myposts = findPostByCategoryId(posts, category.id)
    }
    res.render('blog.html',{ home_url : 'http://localhost:3000', categories : categories, category : category, children : children, myposts : myposts, new_posts : new_posts });
});

function error_404(req, res) {
    res.status(404);
    // res.send(`<h1>Error 404</h1>`);
    res.render('error/404.html',{ home_url : 'http://localhost:3000', categories : categories, new_posts : new_posts });
}

app.use((req, res) => {
    error_404(req, res)
});

app.listen(3000, () => {
    console.log("App listening on port 3000");
});