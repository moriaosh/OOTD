const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const itemsController = require("../controllers/items.controller");

router.post("/", upload.single("image"), itemsController.createItem);

module.exports = router;
