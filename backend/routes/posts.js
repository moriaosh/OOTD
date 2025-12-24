const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload.middleware');
const { createPost, getFeed, getMyPosts, updatePost, deletePost } = require('../controllers/postsController');

// IMPORTANT: Specific routes must come before parameterized routes
// Get public feed (no authentication required)
router.get('/feed', getFeed);

// Get user's own posts (requires authentication)
router.get('/my-posts', verifyToken, getMyPosts);

// Create a new post (requires authentication)
router.post('/', verifyToken, upload.single('image'), createPost);

// Update a post (requires authentication, only by owner)
router.put('/:postId', verifyToken, updatePost);

// Delete a post (requires authentication, only by owner)
router.delete('/:postId', verifyToken, deletePost);

module.exports = router;

