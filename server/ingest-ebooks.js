import dotenv from 'dotenv';
import path from 'path';
import { processDocument } from './services/knowledgeBase.js';
import { initializeVectorStore } from './services/vectorStore.js';

// Load environment variables
dotenv.config();

const EBOOKS = [
    'axitrader-ebook2-13-pro-tips-for-chart-setups-v2.pdf',
    'axitrader-ebook3-hat-trick-3-easy-entry-exit-strategies-v2.pdf'
];

const BASE_DIR = 'c:\\Users\\barne\\OneDrive\\Desktop\\Muheez_crypto_tracker\\TRADERS-HUB';

async function ingestEbooks() {
    try {
        console.log('🚀 Initializing vector store...');
        await initializeVectorStore();

        for (const ebook of EBOOKS) {
            const fullPath = path.join(BASE_DIR, ebook);
            console.log(`📚 Processing ${ebook}...`);

            const result = await processDocument(fullPath, {
                category: 'trading_strategies',
                tags: ['pro_tips', 'entry_exit', 'technical_analysis'],
                author: 'AxiTrader'
            });

            console.log(`✅ Ingested ${ebook}: ${result.chunksCreated} chunks created.`);
        }

        console.log('\n✨ ALL EBOOKS INGESTED SUCCESSFULLY!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ingestion Error:', error);
        process.exit(1);
    }
}

ingestEbooks();
