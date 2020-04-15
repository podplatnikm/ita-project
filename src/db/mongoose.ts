import mongoose from 'mongoose';

import config from '../config/config';
import logger from '../shared/Logger';

export async function connectToMongo() {
    try {
        const url = `${config.database.prefix}://${config.database.user}:${config.database.password}@${config.database.url}/${config.database.name}?retryWrites=true/`;
        await mongoose
            .connect(url, {
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false,
                useUnifiedTopology: true,
            });
        logger.info(`MongoDB Initialized - ${config.database.url}/${config.database.name}`);
    } catch (error) {
        logger.error('ERROR: Database connection could not be established', error);
    }
}
