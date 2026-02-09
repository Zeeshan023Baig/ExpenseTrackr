import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function findWorkingModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro",
        "gemini-2.0-flash-exp"
    ];

    const versions = ["v1", "v1beta"];

    for (const mName of models) {
        for (const v of versions) {
            try {
                const model = genAI.getGenerativeModel({ model: mName }, { apiVersion: v });
                const result = await model.generateContent("ping");
                const response = await result.response;
                if (response.text()) {
                    console.log(`WINNER_FOUND: Model="${mName}" Version="${v}"`);
                    return;
                }
            } catch (e) {
                // console.error(`Failed ${mName} on ${v}: ${e.message}`);
            }
        }
    }
    console.log("WINNER_FOUND: NONE");
}
findWorkingModel();
