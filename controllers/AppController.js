import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

const AppController = {
  getStatus: (req, res) => {
    if (dbClient.isAlive() && redisClient.isAlive()) {
      res.status(200).send({ redis: true, db: true });
    }
  },

  getStats: (req, res) => {
    const numberOfUsers = dbClient.nbUsers();
    const numberOfFiles = dbClient.nbFiles();
    res.status(200).send({ users: numberOfUsers, files: numberOfFiles });
  }
};

export default AppController;
