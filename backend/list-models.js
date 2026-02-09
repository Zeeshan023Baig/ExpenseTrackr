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
        console.log("--- Listing Models (v1) ---");
        const resV1 = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const dataV1 = await resV1.json();

        if (dataV1.error) {
            console.error(`❌ v1 Error: ${dataV1.error.message}`);
        } else if (dataV1.models) {
            dataV1.models.forEach(m => {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
            });
        }

        console.log("\n--- Listing Models (v1beta) ---");
        const resBeta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const dataBeta = await resBeta.json();

        if (dataBeta.error) {
            console.error(`❌ v1beta Error: ${dataBeta.error.message}`);
        } else if (dataBeta.models) {
            dataBeta.models.forEach(m => {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
            });
        }

    } catch (error) {
        console.error(`❌ Discovery Failed: ${error.message}`);
    }
}

listModels();
