import mongoose from "mongoose";
import { sessionSchema } from "../schemas/session.schema.js";

const Session = mongoose.model("Session",sessionSchema);

export default Session;