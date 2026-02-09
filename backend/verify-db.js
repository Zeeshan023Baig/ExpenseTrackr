import User from './models/User.js';
import { sequelize } from './config/db.js';

const verify = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Sync models
        await sequelize.sync();
        console.log('✅ Models synced');

        // Check columns
        const desc = await sequelize.getQueryInterface().describeTable('Users');
        console.log('Columns in Users table:', Object.keys(desc));

        if (desc.resetPasswordToken && desc.resetPasswordExpires) {
            console.log('✅ New columns found!');
        } else {
            console.error('❌ New columns NOT found!');
        }

    } catch (error) {
        console.error('❌ DB Verification Failed:', error.message);
    } finally {
        await sequelize.close();
    }
};

verify();
