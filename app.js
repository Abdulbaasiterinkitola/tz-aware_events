import express from "express";
import { PORT } from "./config/env.js";
import connectDB from "./config/db.js";
import eventRouter from "./routes/event.js";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/events", eventRouter);

connectDB().then(() => {    
    
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to connect to the database:", error);
});

export default app;