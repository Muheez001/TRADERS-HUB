import { ChromaClient } from 'chromadb';

async function testChroma() {
    try {
        const client = new ChromaClient({ path: 'http://localhost:8000' });
        const version = await client.version();
        console.log('✅ ChromaDB version:', version);
    } catch (error) {
        console.error('❌ ChromaDB error:', error.message);
    }
}

testChroma();
