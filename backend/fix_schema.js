import { sequelize } from './config/db.js';

const fixSchema = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        console.log('Running ALTER TABLE...');
        // Force conversion to VARCHAR(255) to support any string
        await sequelize.query("ALTER TABLE Expenses MODIFY COLUMN category VARCHAR(255) NOT NULL;");

        console.log('SUCCESS: Table Altered. You can now save any category.');

    } catch (err) {
        console.error('Alter Failed:', err);
    } finally {
        await sequelize.close();
    }
};

fixSchema();
