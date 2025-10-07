import express from "express"
import cors from "cors"
import "dotenv/config"
import job from "./lib/cron.js"

import authRoutes from "./routes/authRoute.js"
import bookRoutes from "./routes/bookRoute.js"

import { connectDB } from "./lib/db.js";

const app=express();
const PORT=process.env.PORT || 3000

job.start();
app.use(express.json({ limit: "10mb" })); // 10mb tak allow
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());


app.use("/api/auth",authRoutes)
app.use("/api/books",bookRoutes)

app.listen(PORT,()=>{
    console.log(`Server is listing on port ${PORT}`)
    connectDB();
});