const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');
// const db = mongoose.connect('mongodb://localhost:27017/sex-shop');

const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const morgan = require('morgan');
const api = require('./routes/api/api');
const port = process.env.PORT || 3001;


const Product = require('./model/product');
const WishList = require('./model/wishlist');



mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/sex-shop').then((db) => {
    console.log('MONGO connected');
}).catch(error => console.log('COULD NOT CONNECT' + error));

app.use(express.static(path.join(__dirname, 'public')));

//Set View Engine

const { select, generateTime } = require('./helpers/handlebars-helpers');

app.engine('handlebars', exphbs({ defaultLayout: 'home', helpers: { select: select, generateTime: generateTime } }));
app.set('view engine', 'handlebars');

// Upload Middleware

app.use(upload());
app.use(morgan('dev'));

app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    next();
});

// Body Parser

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Method Override

app.use(methodOverride('_method'));

app.use(session({
    secret: 'diegodortega123',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

// Passport

app.use(passport.initialize());
app.use(passport.session());

// Local Variables using Middleware

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.form_errors = req.flash('form_errors');
    res.locals.error = req.flash('error');
    next();
})

const home = require('./routes/home/index')
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');
// const blog = require('./routes/blog/index');
// const blogposts = require('./routes/blog/blogposts');

app.use('/', home);
app.use('/admin', admin);
app.use('/admin/products', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);
// app.use('/blog', blog);
// app.use('/blog/posts', blogposts);

app.use('/api/v1/', api);



app.use(express.json());



// app.post('/product', function(req, res){
//     var product = new Product();
//     product.title = req.body.title;
//     product.price = req.body.price;
//     product.save(function(err, savedProduct){
//         if(err){
//             res.status(500).send({error: "Could not save product"});
//         } else {
//             res.status(200).send(savedProduct);
//         }
//     });
// });

// app.get('/product', function(req, res){
//     Product.find({},function(err, products){
//         if(err){
//             res.status(500).send({error: "Could not fetch products"});
//         } else {
//             res.send(products);
//         }    
//     });
// });

app.get('/wishlist', function(req, res){
    WishList.find({}).populate({path: 'products', model: 'Product'}).exec(function (err, wishLists){
        if(err){
            res.status(500).send({error: "Could not fetch wishLists"});
        } else {
            res.status(200).send(wishLists);
        }
    });
})

app.post('/wishlist', function(req, res){
    const wishList = new  WishList();
    wishList.title = req.body.title;
    
    wishList.save(function(err, newWishList){
    if (err){
            res.status(500).send({error: "Could not create wishList"});
        } else {
            res.send(newWishList);
        }              
    });
});

app.put('/wishlist/product/add', function(req, res){
    Product.findOne({_id: req.body.productId}, function(err, product){
        if(err){
            res.status(500).send({error:"Could not add item to wishList"});
        }else{
            WishList.update({_id:req.body.wishListId}, {$addToSet:{products: product._id}}, function(err, wishList){
                if(err){
                    res.status(500).send({error:"Could not add item to wishList"});
                } else {
                    res.send("Successfully added to wishList");
                }
            });
        }
    });
});


app.listen(port, function(){
    console.log(`Play Toy running on port ${port}...`);
});



//create wish list and new product