const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'expense_tracker',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '1323',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
        logging: false, // Set to console.log to see SQL queries
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Connected...');
        // Sync models
        await sequelize.sync();
        console.log('Database Synced...');
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
