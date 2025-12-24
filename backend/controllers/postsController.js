// This Controller handles the core logic for managing social feed posts:
// image upload, Cloudinary integration, and PostgreSQL/Prisma saving.

const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

const prisma = new PrismaClient();

// Debug: Log available models on startup
console.log('Prisma Client initialized. Available models:', 
  Object.keys(prisma).filter(key => 
    !key.startsWith('$') && 
    !key.startsWith('_') && 
    typeof prisma[key] === 'object' && 
    prisma[key] !== null &&
    typeof prisma[key].findMany === 'function'
  )
);

// Configure Cloudinary (matching the pattern from closetController)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a new post
const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { caption, isPublic } = req.body;

    // Validate required fields
    if (!req.file) {
      return res.status(400).json({ message: 'יש לבחור קובץ תמונה להעלאה.' });
    }
    if (!caption || caption.trim() === '') {
      return res.status(400).json({ message: 'אנא הזן/י כיתוב לפרסום.' });
    }

    // Upload image to Cloudinary
    let imageUrl;
    try {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
      
      const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
        folder: `ootd-posts/${userId}`,
        transformation: [{ width: 800, crop: 'scale' }]
      });

      imageUrl = cloudinaryResponse.secure_url;
    } catch (error) {
      console.error('CLOUDINARY UPLOAD ERROR:', error);
      return res.status(500).json({ message: 'שגיאה בהעלאת התמונה.', error: error.message });
    }

    // Create post in database
    const newPost = await prisma.post.create({
      data: {
        userId,
        imageUrl,
        caption: caption.trim(),
        isPublic: isPublic === true || isPublic === 'true',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            // Do NOT include password or email
          }
        }
      }
    });

    res.status(201).json({ 
      message: 'הפרסום נוצר בהצלחה!', 
      post: newPost 
    });
  } catch (error) {
    console.error('CREATE POST ERROR:', error);
    res.status(500).json({ message: 'שגיאה ביצירת הפרסום.', error: error.message });
  }
};

// Get public feed (only posts where isPublic is true)
const getFeed = async (req, res) => {
  try {
    // Debug: Check if prisma.post exists
    if (!prisma.post) {
      console.error('ERROR: prisma.post is undefined. Prisma Client may need to be regenerated.');
      console.error('Available prisma models:', Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_')));
      return res.status(500).json({ 
        message: 'שגיאה: מודל Post לא זמין. יש להריץ: npx prisma generate && npx prisma migrate dev' 
      });
    }
    
    const posts = await prisma.post.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            // Do NOT include password or email
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error('GET FEED ERROR:', error);
    res.status(500).json({ message: 'שגיאה בשליפת הפיד.', error: error.message });
  }
};

// Get user's own posts (both public and private)
const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const posts = await prisma.post.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error('GET MY POSTS ERROR:', error);
    res.status(500).json({ message: 'שגיאה בשליפת הפרסומים שלך.', error: error.message });
  }
};

module.exports = {
  createPost,
  getFeed,
  getMyPosts,
};

