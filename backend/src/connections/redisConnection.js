import {createClient} from 'redis'
import config from "../config/config.js";

export const redisClient = createClient({
    url:config.REDIS_URL
})

redisClient.on('error',()=>{
    console.oog("Something Went Wrong in Redis Client ❌")
})