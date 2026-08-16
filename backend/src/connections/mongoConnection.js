import mongoose, { mongo } from "mongoose";
import  config from '../config/config.js'
import dns from 'dns';

dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
])

const connectMongo = async ()=>{
    await mongoose.connect(config.MONGO_URL)

}
export default connectMongo;