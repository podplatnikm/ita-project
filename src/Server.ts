import morgan from 'morgan';
import cors from 'cors';
import express, {NextFunction, Request, Response} from 'express';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import 'express-async-errors';
import passport from 'passport';

import BaseRouter from './routes';
import logger from './shared/Logger';

import { connectToMongo } from './db/mongoose';

connectToMongo();


// Init express
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
app.use(morgan('dev'));

app.use(passport.initialize());

// Add APIs
app.use('/api', BaseRouter);

// Print API errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, err);

    const status = (err as any).status
        || (err as any).statusCode
        || (err as any).status_code
        || INTERNAL_SERVER_ERROR;
    return res.status(status).send({ success: false, error: err, message: err.message });
});

// Export express instance
export default app;
