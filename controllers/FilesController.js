const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');


class FilesController {
  static async postUpload(req, res) {
    try {
      // Retrieve user from token (assuming you have authentication middleware)
      const user = redisClient.get(`auth_${token}`);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Destructure request body
      const { 
        name, 
        type, 
        parentId = 0, 
        isPublic = false, 
        data 
      } = req.body;

      // Validate name
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      // Validate type
      const acceptedTypes = ['folder', 'file', 'image'];
      if (!type || !acceptedTypes.includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }

      // Validate data for non-folder types
      if ((type === 'file' || type === 'image') && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      // Check parent folder
      if (parentId !== 0) {
        const parentFile = await File.findById(parentId);
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      // Determine storage path
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      
      // Ensure folder exists
      await fs.mkdir(folderPath, { recursive: true });

      let localPath = null;
      
      // Handle file storage for non-folder types
      if (type !== 'folder') {
        // Generate unique filename
        const filename = uuidv4();
        localPath = path.join(folderPath, filename);
        
        // Decode base64 data and save file
        const fileBuffer = Buffer.from(data, 'base64');
        await fs.writeFile(localPath, fileBuffer);
      }

      // Create file document
      const newFile = new File({
        userId: user._id,
        name,
        type,
        isPublic,
        parentId,
        localPath: type === 'folder' ? null : localPath
      });

      // Save file to database
      await dbClient.save();

      // Return file details
      return res.status(201).json({
        id: newFile._id,
        userId: newFile.userId,
        name: newFile.name,
        type: newFile.type,
        isPublic: newFile.isPublic,
        parentId: newFile.parentId
      });

    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = FilesController;