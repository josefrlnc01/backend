import dotenv from 'dotenv'
import { connectToDB } from "./config/db";
dotenv.config()
import express from "express";
import cors from 'cors';
import { corsConfig } from './config/cors';
import projectRoutes from './routes/projectRoutes'
import authRoutes from './routes/authRoutes';
const app = express();
app.use(express.json());
app.use(cors(corsConfig))

connectToDB()


//Routes
app.use('/api/projects', projectRoutes)
app.use('/api/auth', authRoutes)


export default app;