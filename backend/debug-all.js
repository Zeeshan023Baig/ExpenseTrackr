import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function debugModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log("❌ API KEY MISSING");
        return;
    }
    console.log(`API KEY FOUND (Preview: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)})`);

    const versions = ["v1", "v1beta"];
    for (const v of versions) {
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`);
            const data = await res.json();
            if (data.models) {
                console.log(`\nModels for ${v}:`);
                data.models.forEach(m => console.log(`- ${m.name}`));
            } else if (data.error) {
                console.log(`❌ Error ${v}: ${data.error.message}`);
            }
        } catch (e) {
            console.log(`❌ Fetch failed ${v}: ${e.message}`);
        }
    }
}
debugModels();
