import { userShcema } from "../schemas/user.schema.js";
import mongoose from "mongoose";

const User = mongoose.model("User",userShcema);

export default User;