const { Router } = require('express');
const app = Router();
const Product = require('../../model/product');
const User = require('../../model/user');
// const Category = require('../../model/Category');


app.get('/products', (req, res) => {
    Product.find({})
        .exec()
        .then(product => {
            res.json(
                product
            );
        })
});

app.get('/products/:id', (req, res) => {
    Product.findById({ _id: req.params.id })
        .exec()
        .then(product => {
            res
                .status(200)
                .json({
                    product
                });
        })
});

app.get('/users', (req, res)=>{
    User.find({})
        .exec()
        .then(user =>{
            res.json(
                user
            );
        })
});

app.get('/users/:id', (req, res) => {
    User.findById({ _id: req.params.id })
        .exec()
        .then(product => {
            res
                .status(200)
                .json({
                    product
                });
        })
});

module.exports = app;