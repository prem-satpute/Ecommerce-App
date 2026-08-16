import app from "./src/app.js";
import http from 'http';
import config from "./src/config/config.js";
import connectMongo from "./src/connections/mongoConnection.js";
import { redisClient } from "./src/connections/redisConnection.js";


const server = http.createServer(app);
const PORT = config.BACKEND_PORT || 5000

connectMongo()
    .then((res)=>{console.log("Successfully connect to mongo ✅")})
    .catch((err)=>{console.log("Something Went Wrong At Mongo connection ❌")})

redisClient.connect()
    .then((res)=>{console.log("Successfully  connected to redis ✅")})
    .catch((err)=>{console.log("Something WenT Wrong in Redis Connection ❌")})

server.listen(PORT,()=>{
    console.log(`app is strted at port ${PORT} 🚀`)
});