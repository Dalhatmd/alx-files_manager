const { MongoClient } = require('mongodb');
const mongo = require('mongodb');
const { pwdHashed } = require('./utils');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    const dbUrl = `mongodb://${host}:${port}`;
    this.connected = false;
    this.client = new MongoClient(dbUrl, { 
      useUnifiedTopology: true, 
      useNewUrlParser: true 
    });
    
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.connected = true;
      this.db = this.client.db(this.database);
    } catch (err) {
      console.log('Database connection error:', err.message);
      this.connected = false;
    }
  }


  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    await this.client.connect();
    const users = await this.client.db(this.database).collection('users').countDocuments();
    return users;
  }

  async nbFiles() {
    await this.client.connect();
    const users = await this.client.db(this.database).collection('files').countDocuments();
    return users;
  }

  async createUser(email, password) {
    const hashedPwd = pwdHashed(password);
    await this.client.connect();
    const user = await this.client.db(this.database).collection('users').insertOne({ email, password: hashedPwd });
    return user;
  }

  async getUser(email) {
    await this.client.connect();
    const user = await this.client.db(this.database).collection('users').find({ email }).toArray();
    if (!user.length) {
      return null;
    }
    return user[0];
  }

  async getUserById(id) {
    try {
      // Validate and convert the ID
      let _id;
      try {
        _id = new mongo.ObjectId(id.trim());
      } catch (err) {
        console.error('Invalid ID format:', id);
        return null;
      }
  
      await this.client.connect();
      const user = await this.client.db(this.database).collection('users').findOne({ _id });
      
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }
  async userExist(email) {
    const user = await this.getUser(email);
    if (user) {
      return true;
    }
    return false;
  }

  collection(name) {
    return this.db.collection(name);
  }
  
  async insertFile(fileData) {
    return await this.db.collection('files').insertOne(fileData);
 }
}


const dbClient = new DBClient();
module.exports = dbClient;
