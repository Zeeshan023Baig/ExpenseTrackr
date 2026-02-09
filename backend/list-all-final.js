import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function listAll() {
    const apiKey = process.env.GEMINI_API_KEY;
    let output = "API Models Discovery\n\n";

    for (const v of ["v1", "v1beta"]) {
        output += `--- Version ${v} ---\n`;
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`);
            const data = await res.json();
            if (data.models) {
                data.models.forEach(m => {
                    output += `- ${m.name} (${m.supportedGenerationMethods.join(", ")})\n`;
                });
            } else {
                output += `Error: ${JSON.stringify(data.error)}\n`;
            }
        } catch (e) {
            output += `Fetch Failed: ${e.message}\n`;
        }
        output += "\n";
    }

    fs.writeFileSync("models_list_final.txt", output, "utf-8");
    console.log("Written to models_list_final.txt");
}
listAll();
