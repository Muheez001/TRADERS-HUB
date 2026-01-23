import dotenv from 'dotenv';
import { addTradingKnowledge } from './services/knowledgeBase.js';
import { initializeVectorStore, searchDocuments, getStats } from './services/vectorStore.js';

dotenv.config();

// Expanded knowledge base with 10 key candlestick patterns from "The Candlestick Trading Bible"
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
    },
    {
        title: "Hammer / Bullish Pin Bar",
        content: `The hammer is a bullish reversal pattern that forms at the bottom of a downtrend. It has a small body at the top with a long lower wick (at least 2x the body size) and minimal upper wick. The long lower wick shows buyers rejected lower prices. Entry: Above the hammer's high. Stop Loss: Below the hammer's low. Works best at key support levels. Confirmation with next bullish candle increases reliability.`,
        category: "candlestick_patterns"
    },
    {
        title: "Shooting Star / Bearish Pin Bar",
        content: `The shooting star is a bearish reversal pattern at the top of an uptrend. It has a small body at the bottom with a long upper wick (at least 2x the body size) and minimal lower wick. The long upper wick shows sellers rejected higher prices. Entry: Below the shooting star's low. Stop Loss: Above the shooting star's high. Most effective at resistance levels.`,
        category: "candlestick_patterns"
    },
    {
        title: "Morning Star Pattern",
        content: `The morning star is a powerful three-candle bullish reversal pattern. First candle: large bearish candle continuing the downtrend. Second candle: small body (can be doji) showing indecision, often gaps down. Third candle: large bullish candle that closes into the first candle's body. Entry: Above the third candle's high. Stop Loss: Below the pattern's low. This pattern signals the end of selling pressure and beginning of buying momentum.`,
        category: "candlestick_patterns"
    },
    {
        title: "Evening Star Pattern",
        content: `The evening star is a three-candle bearish reversal pattern at market tops. First candle: large bullish candle continuing the uptrend. Second candle: small body showing indecision at the peak. Third candle: large bearish candle closing into the first candle's body. Entry: Below the third candle's low. Stop Loss: Above the pattern's high. This signals exhaustion of buying pressure and incoming selling.`,
        category: "candlestick_patterns"
    },
    {
        title: "Three White Soldiers",
        content: `Three white soldiers is a strong bullish continuation pattern consisting of three consecutive bullish candles. Each candle opens within the previous candle's body and closes higher than the previous close. Bodies should be large with small wicks. This pattern shows sustained buying pressure and trend strength. Entry: On pullback to the pattern or above the third candle. Best used after a consolidation or minor pullback in an uptrend.`,
        category: "candlestick_patterns"
    },
    {
        title: "Three Black Crows",
        content: `Three black crows is a bearish continuation pattern with three consecutive bearish candles. Each opens within the previous body and closes lower. Large bodies with small wicks show strong selling pressure. Entry: Below the third candle's low or on retest. Stop Loss: Above the first candle's high. This pattern indicates sustained distribution and trend continuation to the downside.`,
        category: "candlestick_patterns"
    },
    {
        title: "Tweezer Tops and Bottoms",
        content: `Tweezer patterns are two-candle reversal formations. Tweezer Top: Two candles at a high with nearly identical highs - first bullish, second bearish. Signals resistance and potential reversal. Tweezer Bottom: Two candles at a low with nearly identical lows - first bearish, second bullish. Signals support and potential reversal. Entry: After the second candle confirms direction. These patterns are especially powerful at key support/resistance zones.`,
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
