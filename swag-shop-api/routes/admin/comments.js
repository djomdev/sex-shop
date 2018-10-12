const express = require('express');
const router = express.Router();
const Product = require('../../model/product');
const Comment = require('../../model/comment');


router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
})

router.get('/', (req, res) => {
    Comment.find({ user: req.user.id }).populate('user')
        .then(comments => {
            res.render('admin/comments', { comments: comments });
        });
});

router.post('/', (req, res) => {

    Product.findOne({ _id: req.body.id }).then(product => {
        const newComment = new Comment({
            user: req.user.id,
            body: req.body.body
        });
        product.comments.push(newComment);
        product.save().then(savedPost => {
            newComment.save().then(savedComment => {
                res.redirect(`/product/${product.id}`);
            })
        });
    });
});

router.delete('/:id', (req, res) => {
    Comment.remove({ _id: req.params.id }).then(deleteItem => {
        Product.findOneAndUpdate({ comments: req.params.id }, { $pull: { comments: req.params.id } }, (err, data) => {
            if (err) throw err;
            res.redirect('/admin/comments');
        });
    });
});

module.exports = router;