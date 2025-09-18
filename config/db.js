import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { MONGO_URI } from "./env.js";


const connectDB = async () => {
    return mongoose
    .connect(MONGO_URI)
    .then(() => logger.info("Connected to the database successfully"))
    .catch((error) =>logger.info(`Unable to connect to the database ${error}`))

}

export default connectDB