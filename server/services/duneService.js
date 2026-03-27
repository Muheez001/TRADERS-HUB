/**
 * Dune Analytics Service
 * Fetches high-quality on-chain data to enhance trading signals.
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DUNE_API_KEY = process.env.DUNE_API_KEY;
const BASE_URL = 'https://api.dune.com/api/v1';

/**
 * Execute a Dune Query and wait for results (polls for completion)
 * @param {number} queryId - The ID of the Dune query to run
 * @param {Object} queryParameters - Parameters for the query
 * @returns {Array} Query results
 */
export async function getDuneData(queryId, queryParameters = {}) {
    if (!DUNE_API_KEY || DUNE_API_KEY === 'your_dune_api_key_here') {
        console.warn('⚠️ Dune API Key missing. Skipping on-chain analysis.');
        return null;
    }

    try {
        // 1. Execute the query
        const executionResponse = await axios.post(
            `${BASE_URL}/query/${queryId}/execute`,
            { query_parameters: queryParameters },
            { headers: { 'X-DUNE-API-KEY': DUNE_API_KEY } }
        );

        const executionId = executionResponse.data.execution_id;
        console.log(`🚀 Dune query ${queryId} executing: ${executionId}`);

        // 2. Poll for results (max 10 attempts, 2s apart)
        let attempts = 0;
        while (attempts < 10) {
            const statusResponse = await axios.get(
                `${BASE_URL}/execution/${executionId}/results`,
                { headers: { 'X-DUNE-API-KEY': DUNE_API_KEY } }
            );

            const state = statusResponse.data.state;

            if (state === 'QUERY_STATE_COMPLETED') {
                return statusResponse.data.result.rows;
            } else if (state === 'QUERY_STATE_FAILED') {
                throw new Error(`Dune query failed: ${statusResponse.data.error}`);
            }

            console.log(`⏳ Waiting for Dune results (Attempt ${attempts + 1}/10)...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
        }

        throw new Error('Dune query timed out.');
    } catch (error) {
        console.error('❌ Dune Service Error:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Fetch specific on-chain metrics for a symbol
 * Note: These Query IDs are placeholders and should be replaced with actual 
 * high-performing community or custom queries.
 */
export async function fetchOnChainMetrics(symbol) {
    if (symbol.toUpperCase() === 'BTC') {
        // Example: Smart Money Flow query
        // Normally you'd find a specific query on Dune and use its ID
        // return await getDuneData(123456, { symbol: 'BTC' });
        return [
            { metric: 'Smart Money Inflow', value: '+1240 BTC', sentiment: 'bullish' },
            { metric: 'Exchange Reserves', value: 'Decreasing', sentiment: 'bullish' },
            { metric: 'Whale Activity', value: 'High Accumulation', sentiment: 'bullish' }
        ];
    }
    
    // Return mock data if no specific query mapped yet
    return [
        { metric: 'Net Exchange Flow', value: 'Neutral', sentiment: 'neutral' },
        { metric: 'Social Sentiment', value: 'Improving', sentiment: 'bullish' }
    ];
}
