/**
 * Vector Store Service - Pinecone Implementation
 * Cloud-based vector database for RAG (no Docker needed!)
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

let genAI = null;
let embedModel = null;
let pinecone = null;
let index = null;

const INDEX_NAME = 'forex-knowledge';
const EMBEDDING_DIMENSION = 768; // Gemini text-embedding-004 dimension

// Initialize Gemini Embedding Model
if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    embedModel = genAI.getGenerativeModel({ model: 'models/text-embedding-004' });
}

// Initialize Pinecone
if (PINECONE_API_KEY && PINECONE_API_KEY !== 'your_pinecone_api_key_here') {
    pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
}

/**
 * Initialize the vector store (create index if needed)
 */
export async function initializeVectorStore() {
    try {
        if (!pinecone) {
            throw new Error('Pinecone API key not configured');
        }

        // Check if index exists
        const indexes = await pinecone.listIndexes();
        const indexExists = indexes.indexes?.some(idx => idx.name === INDEX_NAME);

        if (!indexExists) {
            console.log(`📦 Creating Pinecone index: ${INDEX_NAME}...`);
            await pinecone.createIndex({
                name: INDEX_NAME,
                dimension: EMBEDDING_DIMENSION,
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: 'us-east-1'
                    }
                }
            });
            console.log('✅ Index created successfully');
            // Wait for index to be ready
            await new Promise(resolve => setTimeout(resolve, 10000));
        }

        // Connect to index
        index = pinecone.index(INDEX_NAME);
        console.log(`✅ Connected to Pinecone index: ${INDEX_NAME}`);

        return { success: true, index: INDEX_NAME };
    } catch (error) {
        console.error('❌ Vector Store initialization error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Generate embedding for text using Gemini
 */
async function generateEmbedding(text) {
    if (!embedModel) {
        throw new Error('Gemini embedding model not initialized');
    }

    try {
        const result = await embedModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Embedding generation error:', error.message);
        throw error;
    }
}

/**
 * Add documents to Pinecone
 * @param {Array} documents - Array of {id, text, metadata}
 */
export async function addDocuments(documents) {
    if (!index) {
        throw new Error('Vector store not initialized. Call initializeVectorStore() first.');
    }

    try {
        // Generate embeddings for all texts
        const vectors = await Promise.all(
            documents.map(async (doc) => {
                const embedding = await generateEmbedding(doc.text);
                return {
                    id: doc.id,
                    values: embedding,
                    metadata: {
                        text: doc.text.substring(0, 40000), // Pinecone metadata limit
                        ...doc.metadata
                    }
                };
            })
        );

        // Upsert to Pinecone (batch of 100 max)
        for (let i = 0; i < vectors.length; i += 100) {
            const batch = vectors.slice(i, i + 100);
            await index.upsert(batch);
        }

        console.log(`✅ Added ${documents.length} documents to Pinecone`);
        return { success: true, count: documents.length };
    } catch (error) {
        console.error('Add documents error:', error.message);
        throw error;
    }
}

/**
 * Search for relevant documents using semantic similarity
 * @param {string} query - Search query
 * @param {number} topK - Number of results to return (default: 5)
 */
export async function searchDocuments(query, topK = 5) {
    if (!index) {
        throw new Error('Vector store not initialized');
    }

    try {
        const queryEmbedding = await generateEmbedding(query);

        const results = await index.query({
            vector: queryEmbedding,
            topK,
            includeMetadata: true
        });

        // Format results
        const formattedResults = results.matches.map(match => ({
            text: match.metadata.text,
            metadata: match.metadata,
            distance: 1 - match.score, // Convert similarity to distance
            id: match.id
        }));

        return formattedResults;
    } catch (error) {
        console.error('Search error:', error.message);
        throw error;
    }
}

/**
 * Get index statistics
 */
export async function getStats() {
    if (!index) {
        return { initialized: false };
    }

    try {
        const stats = await index.describeIndexStats();
        return {
            initialized: true,
            indexName: INDEX_NAME,
            documentCount: stats.totalRecordCount || 0,
            dimension: stats.dimension
        };
    } catch (error) {
        console.error('Stats error:', error.message);
        return { initialized: true, error: error.message };
    }
}

/**
 * Delete all documents from index (use carefully!)
 */
export async function clearCollection() {
    if (!index) {
        throw new Error('Vector store not initialized');
    }

    try {
        await index.deleteAll();
        console.log('✅ All documents cleared from Pinecone index');
        return { success: true };
    } catch (error) {
        console.error('Clear collection error:', error.message);
        throw error;
    }
}

export { index, pinecone };
