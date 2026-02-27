import { sequelize } from './config/db.js';

const checkSchema = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const [results] = await sequelize.query("DESCRIBE Expenses;");
        console.log('--- TABLE SCHEMA ---');
        results.forEach(col => {
            if (col.Field === 'category') {
                console.log(`COLUMN: ${col.Field} | TYPE: ${col.Type}`);
            }
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
};

checkSchema();
