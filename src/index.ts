import './LoadEnv'; // Must be the first import
import app from '@server';
import logger from './shared/Logger';
import config from './config/config';

// Start the server
const port = Number(config.port);
app.listen(port, () => {
    logger.info(`Express server started on port: ${port}`);
});
