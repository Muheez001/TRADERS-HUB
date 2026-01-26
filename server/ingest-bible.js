import dotenv from 'dotenv';
import path from 'path';
import { processDocument } from './services/knowledgeBase.js';
import { initializeVectorStore } from './services/vectorStore.js';

// Load environment variables
dotenv.config();

const EBOOK = 'THE CANDLESTICK TRADING BIBLE(1).pdf';
const BASE_DIR = 'c:\\Users\\barne\\OneDrive\\Desktop\\Muheez_crypto_tracker\\TRADERS-HUB';

async function ingestBible() {
    try {
        console.log('🚀 Initializing vector store...');
        await initializeVectorStore();

        const fullPath = path.join(BASE_DIR, EBOOK);
        console.log(`📚 Processing ${EBOOK}...`);

        const result = await processDocument(fullPath, {
            category: 'candlestick_patterns',
            tags: ['price_action', 'reversal_patterns', 'continuation_patterns'],
            author: 'Munehisa Homma (Modernized)'
        });

        console.log(`✅ Ingested ${EBOOK}: ${result.chunksCreated} chunks created.`);
        console.log('\n✨ Knowledge base is now complete with all 3 books!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ingestion Error:', error);
        process.exit(1);
    }
}

ingestBible();
