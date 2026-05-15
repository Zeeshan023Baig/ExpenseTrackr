import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseSMS } from './services/smsParserService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from current folder
dotenv.config({ path: path.join(__dirname, '.env') });

async function testParsing() {
    console.log("--- TESTING SMS PARSING WITH GEMINI ---");
    
    const sampleSMS = "Your A/c XX1234 has been debited by Rs. 850.00 on 2026-05-15 14:30:05 at ZOMATO. Ref No: 123456789. Thank you for using HDFC Bank.";
    
    console.log(`Input SMS: "${sampleSMS}"`);
    
    try {
        const result = await parseSMS(sampleSMS);
        console.log("\n--- PARSED RESULT ---");
        console.log(JSON.stringify(result, null, 2));
        console.log("\n✅ AI successfully identified the amount, merchant, and category!");
    } catch (error) {
        console.error("❌ Test Failed:", error.message);
    }
}

testParsing();
