import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("connected to mongodb");
    } catch (error) {
        console.log("Database connection error:", error.message);
        process.exit(1);
    }
}

export default connectDB;