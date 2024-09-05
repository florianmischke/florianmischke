const helmet = require('helmet');
const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');
const { DateTime } = require("luxon");

const app = express();
// Configure the Content-Security-Policy header.
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                "script-src": ["'self'"],
                // "object-src": ["'self'"]
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
const { query, validationResult } = require('express-validator');

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font')))
app.use('/css', express.static(path.join(__dirname, 'static/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist/')))
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
    return list.filter((obj) => obj.categories.includes(id));
}
function findPostBySlug(list, id) {
    return list.find((obj) => obj.slug === id);
}
function findPostsByTag(list, id) {
    return list.filter((obj) => obj.tags.map(v => v.toLowerCase()).includes(id));
}
    
const posts = require(path.join(__dirname, 'static/json/posts.json')).sort((a, b) => parseFloat(b.id) - parseFloat(a.id));
const new_posts = posts.slice(0, 5);
const categories = require(path.join(__dirname, 'static/json/categories.json'))
const tags = [...new Set(posts.flatMap(item => item.tags))];

app.all("*", function (req, res, next) {  // runs on ALL requests
    home_url = req.protocol + '://' + req.get('host')
        next()
})

app.get('/', function(req, res) {
    res.render('home.html',{ home_url : home_url, categories : categories, new_posts : new_posts });
});

app.get('/cv', function(req, res) {
    res.render('cv.html',{ home_url : home_url, categories : categories, new_posts : new_posts });
});

app.get('/impressum', function(req, res) {
    res.render('impressum.html',{ home_url : home_url, categories : categories, new_posts : new_posts });
});

app.get('/stuff', function(req, res) {
    res.render('stuff.html',{ home_url : home_url, categories : categories, new_posts : new_posts });
});

app.get('/datenschutz', function(req, res) {
    res.render('datenschutz.html',{ home_url : home_url, categories : categories, new_posts : new_posts });
});

app.get('/blog', function(req, res) {
    res.render('blog.html',{ home_url : home_url, categories : categories, new_posts : new_posts });
});

app.get('/blog/tag/:tag', function(req, res) {
    const tag = req.params.tag
    var myposts = findPostsByTag(posts, tag)
    if (!myposts) {
        return error_404(req, res)
    }
    var mytagindex = myposts[0].tags.map(v => v.toLowerCase()).indexOf(tag)
    var mytag = myposts[0].tags[mytagindex]

    res.render('blog.html',{ home_url : home_url, tag: mytag, categories : categories, myposts : myposts, new_posts : new_posts });
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

    const fs = require('fs');
    if (singlepost.template && singlepost.template != "" && fs.existsSync(path.join(__dirname, 'templates/', singlepost.template))) {
        var templateFile = singlepost.template
    } else {        
        var templateFile = 'single.html'
    }
    var date = DateTime.fromISO(singlepost.date)
    var updated = DateTime.fromISO(singlepost.updated)
    var date_formatted = date.setLocale('de-DE').toFormat("dd.MM.yyyy HH:mm")
    if(+date !== +updated) {
        var updated_formatted = updated.setLocale('de-DE').toFormat("dd.MM.yyyy HH:mm")
    } else {
        var updated_formatted = false
    }

    singlepost.date_formatted = date_formatted
    singlepost.updated_formatted = updated_formatted
    
    res.render(templateFile,{ home_url : home_url, singlepost : singlepost, categories : categories, category : category, new_posts : new_posts });
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
    res.render('blog.html',{ home_url : home_url, categories : categories, category : category, children : children, myposts : myposts, new_posts : new_posts });
});

app.get('/search', query('term').trim().notEmpty(), (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // res.send({ errors: result.array() });
        return error_404(req, res)
    }

    const searchterm = req.query.term
    const searchterm_lowercase = searchterm.toLowerCase()
    if (!searchterm) {
        return error_404(req, res)
    }
    var results = []

    // push Posts
    const filtered_posts = posts.filter((obj) => obj.name.toLowerCase().includes(searchterm_lowercase) || obj.description.toLowerCase().includes(searchterm_lowercase));
    const myposts = filtered_posts.map(post => {
        const highlighted_name = post.name.toLowerCase().includes(searchterm_lowercase) 
            ? post.name.replace(new RegExp('('+searchterm+')', 'gi'), `<span class="bg-warning text-dark">$1</span>`)
            : post.name;
        const highlighted_desc = post.description.toLowerCase().includes(searchterm_lowercase) 
            ? post.description.replace(new RegExp('('+searchterm+')', 'gi'), `<span class="bg-warning text-dark">$1</span>`)
            : post.description;
        
        return {
            id: post.id,
            name: highlighted_name,
            description: highlighted_desc,
            img: post.img,
            img_alt: post.img_alt,
            caption: post.caption,
            url: post.url
        };
    });
    results.push(myposts);

    // push Categories
    const filtered_cats = categories.filter((obj) => obj.name.toLowerCase().includes(searchterm_lowercase));
    const mycats = filtered_cats.map(cat => {
        const highlighted = cat.name.toLowerCase().includes(searchterm_lowercase) 
            ? cat.name.replace(new RegExp('('+searchterm+')', 'gi'), `<span class="bg-warning text-dark">$1</span>`)
            : cat.name;
        
        return {
            id: cat.id,
            name: highlighted,
            url: cat.id,
            icon: cat.icon
        };
    });
    results.push(mycats);
    
    // push Tags
    const filtered_tags = tags.filter(tag => tag.toLowerCase().includes(searchterm_lowercase));
    const mytags = filtered_tags.map(tag => {
        const highlighted = tag.toLowerCase().includes(searchterm_lowercase) 
            ? tag.replace(new RegExp('('+searchterm+')', 'gi'), `<span class="bg-warning text-dark">$1</span>`)
            : tag;
        
        return {
            original: tag,
            highlighted: highlighted
        };
    });
    results.push(mytags)

    res.render('search.html',{ home_url : home_url, searchterm : searchterm, results : results, myposts : results[0], mycats : results[1], categories : categories, new_posts : new_posts });
})

function error_404(req, res) {
    res.status(404);
    // res.send(`<h1>Error 404</h1>`);
    res.render('error/404.html',{ home_url : home_url, categories : categories, new_posts : new_posts });
}

// serve single files
app.use("/favicon.ico", express.static(__dirname + '/favicon.ico'));
app.use("/android-chrome-192x192.png", express.static(__dirname + '/android-chrome-192x192.png'));
app.use("/android-chrome-384x384.png", express.static(__dirname + '/android-chrome-384x384.png'));
app.use("/apple-touch-icon.png", express.static(__dirname + '/apple-touch-icon.png'));
app.use("/favicon-16x16.png", express.static(__dirname + '/favicon-16x16.png'));
app.use("/favicon-32x32.png", express.static(__dirname + '/favicon-32x32.png'));
app.use("/favicon.png", express.static(__dirname + '/favicon.png'));
app.use("/favicon.svg", express.static(__dirname + '/favicon.svg'));
app.use("/mstile-150x150.png", express.static(__dirname + '/mstile-150x150.png'));
app.use("/safari-pinned-tab.svg", express.static(__dirname + '/safari-pinned-tab.svg'));
app.use("/browserconfig.xml", express.static(__dirname + '/browserconfig.xml'));
app.use("/site.webmanifest", express.static(__dirname + '/site.webmanifest'));

app.use((req, res) => {
    error_404(req, res)
});

app.listen(3000, () => {
    console.log("App listening on port 3000");
});