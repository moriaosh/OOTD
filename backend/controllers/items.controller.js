const prisma = require("../prisma/client");
const cloudinary = require("../utils/cloudinary");

exports.createItem = async (req, res) => {
    try {
        const { name, category, color, season, occasion, notes } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "תמונה חובה" });
        }

        cloudinary.uploader.upload_stream(
            { folder: "ootd_items" },
            async (error, result) => {
                if (error) return res.status(500).json(error);

                const newItem = await prisma.item.create({
                    data: {
                        name,
                        category,
                        color,
                        season,
                        occasion,
                        notes,
                        imageUrl: result.secure_url,
                    },
                });

                res.json(newItem);
            }
        ).end(req.file.buffer);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "שגיאה בשרת" });
    }
};
