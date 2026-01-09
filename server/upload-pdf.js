import dotenv from 'dotenv';
import { processDocument } from './services/knowledgeBase.js';
import { initializeVectorStore } from './services/vectorStore.js';

// Load environment variables
dotenv.config();

const pdfPath = 'C:\\Users\\PR1M3\\Desktop\\Antigravity lessons\\TRADER HUB V2\\THE CANDLESTICK TRADING BIBLE(1).pdf';

async function uploadPDF() {
    try {
        console.log('🚀 Initializing vector store...');
        await initializeVectorStore();

        console.log('📚 Processing PDF:', pdfPath);
        const result = await processDocument(pdfPath, {
            category: 'candlestick_patterns',
            tags: ['technical_analysis', 'price_action']
        });

        console.log('\n✅ SUCCESS!');
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

uploadPDF();
