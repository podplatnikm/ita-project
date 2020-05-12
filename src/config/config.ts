const config = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'st_vaja2_secret',
    database: {
        user: process.env.DB_USER || 'mongodb',
        password: process.env.DB_PASSWORD || '123rkk123',
        url: process.env.DB_URL || 'cluster0-gmege.mongodb.net',
        name: process.env.DB_NAME || 'ita-project',
        prefix: process.env.DB_PREFIX || 'mongodb+srv',
    },
    googleClientId: '769533967657-673m9eh3gr2lq20ghh66hhs4tbl9q953.apps.googleusercontent.com',
};

export default config;
