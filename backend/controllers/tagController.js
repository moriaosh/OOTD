const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all tags (system tags + user's custom tags)
const getTags = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get system tags (userId is null) and user's custom tags
    const tags = await prisma.tag.findMany({
      where: {
        OR: [
          { userId: null }, // System tags
          { userId: userId } // User's custom tags
        ]
      },
      orderBy: [
        { userId: 'asc' }, // System tags first
        { name: 'asc' }
      ]
    });

    res.status(200).json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'שגיאה בשליפת התגיות.' });
  }
};

// Create a custom tag (only for the logged-in user)
const createTag = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'שם התגית הוא חובה.' });
    }

    // Check if user already has a tag with this name
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: name.trim(),
        userId: userId
      }
    });

    if (existingTag) {
      return res.status(409).json({ message: 'תגית עם שם זה כבר קיימת.' });
    }

    // Create the tag
    const newTag = await prisma.tag.create({
      data: {
        name: name.trim(),
        userId: userId
      }
    });

    res.status(201).json({ message: 'תגית נוצרה בהצלחה!', tag: newTag });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ message: 'שגיאה ביצירת התגית.' });
  }
};

// Update a custom tag (only if it belongs to the user)
const updateTag = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'שם התגית הוא חובה.' });
    }

    // Check if tag exists and belongs to user
    const tag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!tag) {
      return res.status(404).json({ message: 'תגית לא נמצאה.' });
    }

    if (tag.userId === null) {
      return res.status(403).json({ message: 'לא ניתן לערוך תגיות מערכת.' });
    }

    if (tag.userId !== userId) {
      return res.status(403).json({ message: 'אין לך הרשאה לערוך תגית זו.' });
    }

    // Check if another tag with this name already exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: name.trim(),
        userId: userId,
        NOT: { id: id }
      }
    });

    if (existingTag) {
      return res.status(409).json({ message: 'תגית עם שם זה כבר קיימת.' });
    }

    // Update the tag
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: { name: name.trim() }
    });

    res.status(200).json({ message: 'תגית עודכנה בהצלחה!', tag: updatedTag });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ message: 'שגיאה בעדכון התגית.' });
  }
};

// Delete a custom tag (only if it belongs to the user)
const deleteTag = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if tag exists and belongs to user
    const tag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!tag) {
      return res.status(404).json({ message: 'תגית לא נמצאה.' });
    }

    if (tag.userId === null) {
      return res.status(403).json({ message: 'לא ניתן למחוק תגיות מערכת.' });
    }

    if (tag.userId !== userId) {
      return res.status(403).json({ message: 'אין לך הרשאה למחוק תגית זו.' });
    }

    // Delete the tag (Cascade will remove ClotheTag relationships)
    await prisma.tag.delete({
      where: { id }
    });

    res.status(200).json({ message: 'תגית נמחקה בהצלחה!' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ message: 'שגיאה במחיקת התגית.' });
  }
};

module.exports = {
  getTags,
  createTag,
  updateTag,
  deleteTag
};

