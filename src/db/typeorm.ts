import {createConnection, createConnections, Connection} from 'typeorm';
import logger from '@shared/Logger';

createConnection().then(connection => {
    logger.info('Connection to database OK');
}).catch(error => logger.error('ERROR: connecting to database...', error));
