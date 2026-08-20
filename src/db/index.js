import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import config from "../config/env.js";
import logger from "../shared/logging/logger.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${config.db.url}/${DB_NAME}`);
        logger.info({ host: connectionInstance.connection.host, dbName: DB_NAME }, "MongoDB Database connected successfully!");
    } catch (err) {
        logger.error({ err }, "Error connecting to MongoDB database");
        process.exit(1);
    }
};

export default connectDB;