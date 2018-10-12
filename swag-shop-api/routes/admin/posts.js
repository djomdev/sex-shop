const express = require('express');
const router = express.Router();
// const app = express();
const Product = require('../../model/product');
const Category = require('../../model/category');
const { isEmpty, uploadDir } = require('../../helpers/upload-helper');
// const path = require('path');
const fs = require('fs');
const { userAuthenticated } = require('../../helpers/authentication');


router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {
    Product.find({})
        .populate('category')
        .then(products => {
            res.render('admin/products', { products: products });
        });
});


router.get('/my-products', (req, res) => {
    Product.find({ user: req.user.id })
        .populate('category')
        .then(products => {
            res.render('admin/products/my-products', { products: products });
        });
});


router.get('/create', (req, res) => {
    Category.find({}).then(categories => {
        res.render('admin/products/create', { categories: categories });
    });
});


router.post('/create', (req, res) => {

    let errors = [];

    if (!req.body.title) {
        errors.push({ message: 'Please add a title' });
    }

    if (!req.body.body) {
        errors.push({ message: 'Please add a description' });
    }

    if (errors.length > 0) {
        res.render('admin/products/create', {
            errors: errors
        })
    } else {

        let filename = 'entrepreneurs-journal_4460x4460.jpg';

        //isEmpty function is exported from upload.helper.js
        //upload if is not empty save the file in public/uploads

        if (!isEmpty(req.files)) {
            let file = req.files.file;
            // do not redefine filename 
            // every time we move the pic the app will append it
            filename = Date.now() + '-' + file.name;

            // let dirUploads = './public/uploads';
            file.mv('./public/uploads/' + filename, (err) => {
                if (err) throw err;
            });
        }

        let onSale = true;
        let featured = true;
        let outOfStock = true;
        let allowComments = true;

        if (req.body.onSale) {
            onSale = true;
        } else {
            onSale = false;
        }
        if (req.body.featured) {
            featured = true;
        } else {
            featured = false;
        }
        if (req.body.outOfStock) {
            outOfStock = true;
        } else {
            outOfStock = false;
        }
        if (req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }

        const newProduct = new Product({

            user: req.user.id,
            title: req.body.title,
            price: req.body.price,
            onSale: onSale,
            category: req.body.category,
            featured: featured,
            outOfStock: outOfStock,
            allowComments: allowComments,
            body: req.body.body,
            imgUrl: req.body.imgUrl,
            file: filename
        });

        newProduct.save().then(savedProduct => {
            req.flash('success_message', `Product ${savedProduct.title} was created successfully`);
            // console.log(savedPost);
            res.redirect('/admin/products');
        }).catch(error => {

            // res.render('admin/posts/create', {errors: validator.errors}); 
            console.log(error, 'could not save product');
        });

    }
});

router.get('/edit/:id', (req, res) => {
    Product.findOne({ _id: req.params.id })
        .then(product => {
            Category.find({}).then(categories => {
                res.render('admin/products/edit', { product: product, categories: categories });
            });
        })
});

router.put('/edit/:id', (req, res) => {
    Product.findOne({ _id: req.params.id })
        .then(product => {

            if (req.body.onSale) {
                onSale = true;
            } else {
                onSale = false;
            }
            if (req.body.featured) {
                featured = true;
            } else {
                featured = false;
            }
            if (req.body.outOfStock) {
                outOfStock = true;
            } else {
                outOfStock = false;
            }
            if (req.body.allowComments) {
                allowComments = true;
            } else {
                allowComments = false;
            }

            product.user = req.user.id;
            product.title = req.body.title;
            product.price = req.body.price;
            product.onSale = onSale;
            product.featured = featured;
            product.outOfStock = outOfStock;
            product.allowComments = allowComments;
            product.body = req.body.body;


            if (!isEmpty(req.files)) {
                let file = req.files.file;
                // do not redefine filename 
                // every time we move the pic the app will append it
                filename = Date.now() + '-' + file.name;
                product.file = filename;

                // let dirUploads = './public/uploads';
                file.mv('./public/uploads/' + filename, (err) => {
                    if (err) throw err;
                });
            }

            product.save().then(updatedProduct => {

                req.flash('success_message', 'Product was successfully updated');

                res.redirect('/admin/products');
            });

            // res.render('admin/posts/edit', {post: post});
        });
    // res.send('IT WORKS')
});

router.delete('/:id', (req, res) => {
    Product.findOneAndDelete({ _id: req.params.id })
        .populate('comments')
        .then(product => {
            fs.unlink(uploadDir + product.file, (err) => {
                if (!product.comments.length < 1) {
                    product.comments.forEach(comment => {
                        comment.remove();
                    });
                }
                product.remove().then(productRemoved => {
                    req.flash('sucess_message', 'Product was succesfully deleted');
                    res.redirect('/admin/products');
                });
            });
        });
});




module.exports = router;