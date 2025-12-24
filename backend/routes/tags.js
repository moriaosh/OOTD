const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getTags, createTag, updateTag, deleteTag } = require('../controllers/tagController');

// All routes require authentication
router.get('/', verifyToken, getTags);
router.post('/', verifyToken, createTag);
router.put('/:id', verifyToken, updateTag);
router.delete('/:id', verifyToken, deleteTag);

module.exports = router;


