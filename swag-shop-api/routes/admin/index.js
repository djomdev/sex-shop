const express = require('express');
const router = express.Router();
const faker = require('faker');
const Product = require('../../model/product');
const { userAuthenticated } = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {
    res.render('admin/index');
});

router.post('/generate-fake-posts', (req, res) => {
    // res.send('it works');
    for (let i = 0; i < req.body.amount; i++) {
        let product = new Product();
        product.title = faker.name.title();
        product.price = faker.random.number();
        product.body = faker.lorem.sentence();

        product.save(function (err) {
            if (err) throw err;
        });
    }
    res.redirect('/admin/products');

});


module.exports = router;