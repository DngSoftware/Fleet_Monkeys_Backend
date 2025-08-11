const fs = require('fs').promises;
const path = require('path');

class ImageController {
  static async uploadImage(req, res) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded', data: null });
      }

      const filename = `${Date.now()}-${file.originalname}`;
      const imagePath = path.join(__dirname, '../Uploads', filename);

      await fs.writeFile(imagePath, file.buffer);

      return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: { itemImageFileName: filename }
      });
    } catch (err) {
      console.error('uploadImage error:', err);
      return res.status(500).json({ success: false, message: `Server error: ${err.message}`, data: null });
    }
  }

  static async updateImage(req, res) {
    try {
      const { filename } = req.params;
      const file = req.file;

      if (!filename) {
        return res.status(400).json({ success: false, message: 'Filename is required', data: null });
      }

      if (!file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded', data: null });
      }

      const oldImagePath = path.join(__dirname, '../Uploads', filename);
      try {
        await fs.access(oldImagePath);
        await fs.unlink(oldImagePath);
      } catch (err) {
        // Ignore if file doesn't exist
      }

      const newImagePath = path.join(__dirname, '../Uploads', filename);
      await fs.writeFile(newImagePath, file.buffer);

      return res.status(200).json({
        success: true,
        message: 'Image updated successfully',
        data: { itemImageFileName: filename }
      });
    } catch (err) {
      console.error('updateImage error:', err);
      return res.status(500).json({ success: false, message: `Server error: ${err.message}`, data: null });
    }
  }

  static async deleteImage(req, res) {
    try {
      const { filename } = req.params;

      if (!filename) {
        return res.status(400).json({ success: false, message: 'Filename is required', data: null });
      }

      const imagePath = path.join(__dirname, '../Uploads', filename);
      try {
        await fs.access(imagePath);
        await fs.unlink(imagePath);
      } catch (err) {
        return res.status(404).json({ success: false, message: 'Image not found', data: null });
      }

      return res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        data: null
      });
    } catch (err) {
      console.error('deleteImage error:', err);
      return res.status(500).json({ success: false, message: `Server error: ${err.message}`, data: null });
    }
  }
}

module.exports = ImageController;