import dotenv from "dotenv";

dotenv.config({});

if (!process.env.MONGO_URL) {
  throw new Error("MONGO_URL VARIABLE NOT EXISTS AT .ENV FILE ");
}

if (!process.env.BACKEND_PORT) {
  throw new Error("BACKEND_PORT VARIABLE NOT EXISTS AT .ENV FILE ");
}

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL VARIABLE NOT EXISTS AT .ENV FILE ");
}

if (!process.env.EMAIL_USER) {
  throw new Error("EMAIL_USER VARIABLE NOT EXISTS AT .ENV FILE ");
}

if (!process.env.EMAIL_PASS) {
  throw new Error("EMAIL_PASS VARIABLE NOT EXISTS AT .ENV FILE ");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET VARIABLE NOT EXISTS AT .ENV FILE ");
}



const config = {
  MONGO_URL: process.env.MONGO_URL,
  BACKEND_PORT:process.env.BACKEND_PORT,
  REDIS_URL:process.env.REDIS_URL,
  EMAIL_USER:process.env.EMAIL_USER,
  EMAIL_PASS:process.env.EMAIL_PASS,
  JWT_SECRET:process.env.JWT_SECRET
};

export default config;
