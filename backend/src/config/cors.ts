import { CorsOptions } from 'cors';
import dotenv from 'dotenv';

dotenv.config();

export const corsConfig: CorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true
};


