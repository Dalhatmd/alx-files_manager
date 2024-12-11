const { v4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { getAuthzHeader, getToken, pwdHashed } = require('../utils/utils');
const { decodeToken, getCredentials } = require('../utils/utils');

class AuthController {
  static async getConnect(req, res) {
    const authzHeader = getAuthzHeader(req);
    if (!authzHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const token = getToken(authzHeader);
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const { email, password } = getCredentials(decodedToken);
    const user = await dbClient.getUser(email);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    if (user.password !== pwdHashed(password)) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const accessToken = v4();
    await redisClient.set(`auth_${accessToken}`, user._id.toString(), 60 * 60 * 24);
    res.json({ token: accessToken });
    res.end();
  }
  static async getMe(req, res) {
    try {
      console.log('X-Token headers:', req.headers);
      const token = req.headers['x-token']; // Note the lowercase
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized - No Token' });
      }
  
      const userId = await redisClient.get(`auth_${token}`);
      console.log('Retrieved User ID:', userId); // Debug logging
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
      }
  
      const user = await dbClient.getUserById(userId);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized - User Not Found' });
      }
  
      res.status(200).json({ id: user._id, email: user.email });
    } catch (error) {
      console.error('Get Me Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const id = await redisClient.get(`auth_${token}`);
    if (!id) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const user = await dbClient.getUserById(id);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    await redisClient.del(`auth_${token}`);
    res.status(204).end();
  }
}
module.exports = AuthController;
