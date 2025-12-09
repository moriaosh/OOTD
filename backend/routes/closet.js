// This file routes API calls to the correct controller functions.

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.js'); 
const { addItem, getMyItems } = require('../controllers/closetController'); // Imports functions from the controller

// POST /api/closet/add-item
// This endpoint is responsible for image upload and saving item data.
// The Multer and Cloudinary logic is now located in the Controller.
router.post('/add-item', verifyToken, addItem);

// GET /api/closet/my-items
// This endpoint retrieves all clothing items for the logged-in user.
router.get('/my-items', verifyToken, getMyItems);

module.exports = router;