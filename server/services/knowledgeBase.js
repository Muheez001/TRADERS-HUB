/**
 * Knowledge Base Service
 * Processes and embeds trading documents (PDFs, DOCX, text)
 * Integrates with vector store for RAG implementation
 */

import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { addDocuments } from './vectorStore.js';

/**
 * Parse PDF file and extract text
 */
async function parsePDF(filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('PDF parsing error:', error.message);
        throw new Error(`Failed to parse PDF: ${error.message}`);
    }
}

/**
 * Parse DOCX file and extract text
 */
async function parseDOCX(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        console.error('DOCX parsing error:', error.message);
        throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
}

/**
 * Parse text file
 */
async function parseTXT(filePath) {
    try {
        const text = await fs.readFile(filePath, 'utf-8');
        return text;
    } catch (error) {
        console.error('TXT parsing error:', error.message);
        throw new Error(`Failed to parse TXT: ${error.message}`);
    }
}

/**
 * Chunk text into smaller segments for embedding
 * @param {string} text - Full document text
 * @param {number} chunkSize - Target size per chunk (characters)
 * @param {number} overlap - Overlap between chunks
 */
function chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        const endIndex = Math.min(startIndex + chunkSize, text.length);
        const chunk = text.substring(startIndex, endIndex);

        // Only add non-empty chunks
        if (chunk.trim().length > 0) {
            chunks.push(chunk.trim());
        }

        startIndex += (chunkSize - overlap);
    }

    return chunks;
}

/**
 * Process a document file and add to vector store
 * @param {string} filePath - Path to the document
 * @param {object} metadata - Additional metadata (source, category, etc.)
 */
export async function processDocument(filePath, metadata = {}) {
    try {
        const ext = path.extname(filePath).toLowerCase();
        const fileName = path.basename(filePath);
        let fullText = '';

        // Parse based on file type
        switch (ext) {
            case '.pdf':
                fullText = await parsePDF(filePath);
                break;
            case '.docx':
                fullText = await parseDOCX(filePath);
                break;
            case '.txt':
            case '.md':
                fullText = await parseTXT(filePath);
                break;
            default:
                throw new Error(`Unsupported file type: ${ext}`);
        }

        console.log(`📄 Parsed ${fileName}: ${fullText.length} characters`);

        // Chunk the text
        const chunks = chunkText(fullText);
        console.log(`✂️ Split into ${chunks.length} chunks`);

        // Prepare documents for vector store
        const documents = chunks.map((chunk, index) => ({
            id: `${fileName}_chunk_${index}`,
            text: chunk,
            metadata: {
                source: fileName,
                chunkIndex: index,
                totalChunks: chunks.length,
                fileType: ext,
                ...metadata
            }
        }));

        // Add to vector store
        const result = await addDocuments(documents);

        return {
            success: true,
            fileName,
            chunksCreated: chunks.length,
            totalCharacters: fullText.length,
            ...result
        };
    } catch (error) {
        console.error('Document processing error:', error.message);
        throw error;
    }
}

/**
 * Process multiple documents in a directory
 */
export async function processDirectory(dirPath, metadata = {}) {
    try {
        const files = await fs.readdir(dirPath);
        const supportedExtensions = ['.pdf', '.docx', '.txt', '.md'];

        const documentFiles = files.filter(file =>
            supportedExtensions.includes(path.extname(file).toLowerCase())
        );

        console.log(`📁 Found ${documentFiles.length} documents in ${dirPath}`);

        const results = [];
        for (const file of documentFiles) {
            const filePath = path.join(dirPath, file);
            try {
                const result = await processDocument(filePath, metadata);
                results.push(result);
            } catch (error) {
                console.error(`Failed to process ${file}:`, error.message);
                results.push({ success: false, fileName: file, error: error.message });
            }
        }

        return {
            success: true,
            processed: results.length,
            results
        };
    } catch (error) {
        console.error('Directory processing error:', error.message);
        throw error;
    }
}

/**
 * Add manual trading knowledge (for quick snippets)
 */
export async function addTradingKnowledge(title, content, metadata = {}) {
    try {
        const document = {
            id: `manual_${Date.now()}`,
            text: content,
            metadata: {
                source: 'manual_entry',
                title,
                addedAt: new Date().toISOString(),
                ...metadata
            }
        };

        await addDocuments([document]);

        return {
            success: true,
            title,
            id: document.id
        };
    } catch (error) {
        console.error('Add knowledge error:', error.message);
        throw error;
    }
}

export { parsePDF, parseDOCX, parseTXT, chunkText };
