import dotenv from 'dotenv';
import { addTradingKnowledge } from './services/knowledgeBase.js';
import { initializeVectorStore, searchDocuments, getStats } from './services/vectorStore.js';

dotenv.config();

// Small test with 3 key candlestick patterns
const testKnowledge = [
    {
        title: "Bullish Engulfing Pattern",
        content: `A bullish engulfing pattern is a two-candle reversal pattern that appears at the bottom of a downtrend. The second candle (bullish) completely engulfs the body of the first candle (bearish). This signals strong buying pressure and potential trend reversal from bearish to bullish. Entry: Above the high of the engulfing candle. Stop Loss: Below the low of the pattern. Take Profit: Previous resistance level or 1:2 risk-reward ratio.`,
        category: "candlestick_patterns"
    },
    {
        title: "Bearish Engulfing Pattern",
        content: `A bearish engulfing pattern appears at the top of an uptrend. The second candle (bearish) completely engulfs the body of the first candle (bullish). This indicates strong selling pressure and potential reversal from bullish to bearish. Entry: Below the low of the engulfing candle. Stop Loss: Above the high of the pattern. Take Profit: Previous support level or 1:2 risk-reward ratio.`,
        category: "candlestick_patterns"
    },
    {
        title: "Doji Candle - Indecision",
        content: `A doji candle has very small or no body (opening and closing prices nearly equal) with long wicks. It signals market indecision. When appearing after a strong trend, it often indicates a potential reversal. At support/resistance, it's a powerful signal. Traders wait for confirmation with the next candle before entering.`,
        category: "candlestick_patterns"
    }
];

async function testRAG() {
    try {
        console.log('🚀 Initializing vector store...\n');
        await initializeVectorStore();

        console.log('📚 Adding trading knowledge (3 patterns)...\n');
        for (const knowledge of testKnowledge) {
            const result = await addTradingKnowledge(
                knowledge.title,
                knowledge.content,
                { category: knowledge.category, source: 'manual_test' }
            );
            console.log(`✅ Added: ${result.title}`);
            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('\n📊 Checking stats...');
        const stats = await getStats();
        console.log(`Documents in collection: ${stats.documentCount}\n`);

        console.log('🔍 Testing semantic search...');
        const searchResults = await searchDocuments('bullish reversal pattern', 2);
        console.log(`\nFound ${searchResults.length} results:`);
        searchResults.forEach((result, idx) => {
            console.log(`\n${idx + 1}. ${result.metadata?.title || 'Unknown'}`);
            console.log(`   Similarity: ${(1 - result.distance).toFixed(3)}`);
            console.log(`   Preview: ${result.text.substring(0, 100)}...`);
        });

        console.log('\n\n✅ RAG TEST COMPLETE!');
        console.log('🎯 Next: Request AI Insight from browser to see RAG in action');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

testRAG();
