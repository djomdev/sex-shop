const express = require('express');
const app = express();


const Product = require('./model/product');
const WishList = require('./model/wishlist');

app.post('/product', function(req, res){
    var product = new Product();
    product.title = req.body.title;
    product.price = req.body.price;
    product.save(function(err, savedProduct){
        if(err){
            res.status(500).send({error: "Could not save product"});
        } else {
            res.status(200).send(savedProduct);
        }
    });
});

app.get('/product', function(req, res){
    Product.find({},function(err, products){
        if(err){
            res.status(500).send({error: "Could not fetch products"});
        } else {
            res.send(products);
        }    
    });
});

module.exports = app;