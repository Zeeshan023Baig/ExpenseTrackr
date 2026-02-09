import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY is missing in .env");
        return;
    }

    try {
        const checkVersions = ["v1", "v1beta"];
        for (const v of checkVersions) {
            console.log(`\n--- Models for ${v} ---`);
            const res = await fetch(`https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`);
            const data = await res.json();
            if (data.models) {
                data.models.filter(m => m.name.toLowerCase().includes("flash")).forEach(m => {
                    console.log(`FULL ID: ${m.name}`);
                });
            } else {
                console.log(`No models found for ${v}`);
            }
        }
    } catch (error) {
        console.error(`❌ Discovery Failed: ${error.message}`);
    }
}

listModels();
