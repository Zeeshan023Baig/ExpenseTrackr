import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('expense_tracker', 'root', '1323', {
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: console.log
});

const test = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection successful!');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    } finally {
        await sequelize.close();
    }
};

test();
