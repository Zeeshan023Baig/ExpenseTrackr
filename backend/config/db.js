import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: "mysql",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        logging: false,
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: "mysql",
            logging: false,
        }
    );

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("MySQL Connected...");

        await sequelize.sync(); // Schema verified

        // Force migration for Category ENUM -> VARCHAR (Fix for custom categories)
        try {
            await sequelize.query("ALTER TABLE Expenses MODIFY COLUMN category VARCHAR(255) NOT NULL;");
            console.log("Schema migration (Category -> VARCHAR) executed.");
        } catch (err) {
            console.log("Schema migration skipped/error (safe to ignore if already altered):", err.message);
        }

        console.log("Database Synced...");
    } catch (error) {
        console.error("Error connecting to MySQL:", error.message);
        process.exit(1);
    }
};


export { sequelize, connectDB };
