const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload.middleware');
const { createPost, getFeed, getMyPosts } = require('../controllers/postsController');

// Create a new post (requires authentication)
router.post('/', verifyToken, upload.single('image'), createPost);

// Get public feed (no authentication required)
router.get('/feed', getFeed);

// Get user's own posts (requires authentication)
router.get('/my-posts', verifyToken, getMyPosts);

module.exports = router;

