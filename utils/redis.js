import redis from 'redis';

class RedisClient {
	constructor(
		redisClient = redis.createClient({
			socket: {
				host: "localhost",
				port: 6379
			}
		})) {
		this.redisClient = redisClient;
		this.redisClient.on("error", (error) => console.error(error));
		this.redisClient.connect()
		.then(() => console.log("Redis client connected"))
		.catch((err) => console.error("Redis connection error:", err))
	}
	
	isAlive() {
		return this.redisClient.isOpen;
	}

	async get(key) {
		const value  = await this.redisClient.get(key);
		console.log(`Value for key "${key}": ${value}`);
		return value;
	}

	async set(key, value, duration) {
		this.redisClient.set(key, value, 'EX', 10, (err, reply) => {
			if (err) {
				console.error(err);
			} else {
				console.log("key set successfully with expiry: ", reply);
				return reply;
			}
		})
	}
	async del(key) {
		this.redisClient.del(key, (err, reply) => {
			if (err) {
				console.error(err)
			}
			else {
				console.log("key deleted successfully", reply);
				return reply;
			}
		})
	}
}

const redisClient = new RedisClient()
export default redisClient;
