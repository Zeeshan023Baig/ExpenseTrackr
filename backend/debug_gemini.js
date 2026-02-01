import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Load Env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key:', apiKey ? 'Loaded (' + apiKey.substring(0, 8) + '...)' : 'MISSING');

if (!apiKey) process.exit(1);

// 2. Fetch Models directly via REST (Easiest way to verify raw access)
// The SDK doesn't always expose listModels simply in all versions.
async function listModels() {
    try {
        console.log('Fetching models from Google API...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            console.error('HTTP Error:', response.status, response.statusText);
            const text = await response.text();
            console.error('Body:', text);
            return;
        }

        const data = await response.json();
        console.log('\n--- AVAILABLE MODELS ---');
        const models = data.models || [];

        // Filter for generateContent support
        const generateModels = models.filter(m => m.supportedGenerationMethods.includes('generateContent'));

        console.log('--- RAW MODEL NAMES ---');
        console.log(JSON.stringify(generateModels.map(m => m.name), null, 2));
        console.log('-----------------------\n');

        if (generateModels.length === 0) {
            console.warn('WARNING: No models support generateContent!');
        }

    } catch (error) {
        console.error('Fetch Failed:', error);
    }
}

listModels();
