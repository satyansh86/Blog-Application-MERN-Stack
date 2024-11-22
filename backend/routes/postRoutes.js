const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/post', postController.createPost);
router.put('/post', postController.updatePost);
router.get('/post', postController.getPosts);
router.get('/post/:id', postController.getPostById);

module.exports = router;
