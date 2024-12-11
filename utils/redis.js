import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.connected = false;

    this.client.on('connect', () => {
      //console.log('Redis client connected');
      this.connected = true;
      return true;
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
      this.connected = false;
    })
  }

  isAlive() {
    return this.client.ping() === 'PONG';
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async del(key) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, _reject) => {
      this.client.del(key, (error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
