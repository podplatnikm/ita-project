import morgan from 'morgan';

import express, { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import 'express-async-errors';

import BaseRouter from './routes';
import logger from '@shared/Logger';

import './db/typeorm';


// Init express
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Show routes called in console during development
app.use(morgan('dev'));

// Add APIs
app.use('/api', BaseRouter);

// Print API errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
        success: false,
        message: err.message,
    });
});

// Export express instance
export default app;
