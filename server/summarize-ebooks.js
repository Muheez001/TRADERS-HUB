import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

const EBOOKS = [
    'axitrader-ebook2-13-pro-tips-for-chart-setups-v2.pdf',
    'axitrader-ebook3-hat-trick-3-easy-entry-exit-strategies-v2.pdf'
];

const BASE_DIR = 'c:\\Users\\barne\\OneDrive\\Desktop\\Muheez_crypto_tracker\\TRADERS-HUB';

async function summarizeEbooks() {
    for (const ebook of EBOOKS) {
        try {
            const dataBuffer = await fs.readFile(`${BASE_DIR}\\${ebook}`);
            const data = await pdfParse(dataBuffer);
            console.log(`\n=== SUMMARY OF ${ebook} ===`);
            console.log(data.text.substring(0, 2000)); // First 2000 chars
            console.log('====================================\n');
        } catch (error) {
            console.error(`Error reading ${ebook}:`, error.message);
        }
    }
}

summarizeEbooks();
