import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

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
        console.log("Database Synced...");

        // Forcefully add webhookToken if alter fails
        try {
            await sequelize.query("ALTER TABLE Users ADD COLUMN webhookToken VARCHAR(255) NULL UNIQUE;");
            console.log("Forced webhookToken column creation.");
        } catch (err) {
            // Ignore if exists
        }
    } catch (error) {
        console.error("Error connecting to MySQL:", error.message);
        process.exit(1);
    }
};


export { sequelize, connectDB };
