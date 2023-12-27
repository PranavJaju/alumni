import express, { Request, Response, Application, urlencoded } from 'express';
import dotenv from 'dotenv';
import { error } from 'console';
dotenv.config({ path: "./config.env" });
require("../model/db");

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req: Request, res: Response) => {
    try {
        res.send("Hello");
    }
    catch (err: any) {
        console.log(err);
    }
})
const postsRoutes = require('../router/postsRoutes');
const userRoutes = require('../router/userRoutes');
const adminRoutes = require('../router/adminRoutes');
const filterRoutes = require('../router/filterRoutes');
const profileRoutes = require('../router/profileRoutes');
const commentRoutes = require('../router/commentRoutes');
import s3Routes from '../router/s3Routes';

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/filter', filterRoutes);
app.use('/profile', profileRoutes);
app.use('/posts', postsRoutes);
const port = process.env.PORT || 3000;

app.listen(process.env.PORT, (): void => {
    console.log('server is running');
}) 
