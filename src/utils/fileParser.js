import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

// Use the bundled worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

/**
 * Extract text content from a PDF file
 * @param {File} file - The PDF file to parse
 * @returns {Promise<string>}
 */
async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    const pageCount = pdf.numPages;

    for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map(item => item.str)
            .join(' ');
        fullText += pageText + '\n\n';
    }

    return { text: fullText, pageCount };
}

/**
 * Extract text content from a DOCX file using mammoth
 * @param {File} file - The DOCX file to parse
 * @returns {Promise<string>}
 */
async function extractTextFromDocx(file) {
    const arrayBuffer = await file.arrayBuffer();
    // mammoth extracts the raw text from the document
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return { text: result.value, pageCount: 1 }; // DOCX doesn't easily expose page count without rendering
}

/**
 * Extract text content from a TXT file
 * @param {File} file - The TXT file to parse
 * @returns {Promise<string>}
 */
function extractTextFromTxt(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ text: e.target.result, pageCount: 1 });
        reader.onerror = (e) => reject(new Error("Failed to read TXT file"));
        reader.readAsText(file);
    });
}

/**
 * Extract text content from an image file using Tesseract OCR
 * @param {File} file - The Image file to parse (JPG/PNG)
 * @returns {Promise<{text: string, pageCount: number}>}
 */
async function extractTextFromImage(file) {
    // Tesseract.js automatically handles fetching the worker and language data
    const result = await Tesseract.recognize(
        file,
        'eng',
        {
            // logger: m => console.log(m) // Optional: log progress
        }
    );
    return { text: result.data.text, pageCount: 1 };
}

/**
 * Universal function to parse a resume file based on type
 * @param {File} file - The file to parse (.pdf, .docx, .txt)
 * @returns {Promise<{text: string, pageCount: number, wordCount: number}>}
 */
export async function parseResumeFile(file) {
    if (!file) throw new Error("No file provided");

    const extension = file.name.split('.').pop().toLowerCase();
    let extractionResult;

    if (extension === 'pdf' || file.type === 'application/pdf') {
        extractionResult = await extractTextFromPDF(file);
    }
    else if (extension === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractionResult = await extractTextFromDocx(file);
    }
    else if (extension === 'txt' || file.type === 'text/plain') {
        extractionResult = await extractTextFromTxt(file);
    }
    else if (['jpg', 'jpeg', 'png'].includes(extension) || file.type.startsWith('image/')) {
        extractionResult = await extractTextFromImage(file);
    }
    else {
        throw new Error("Unsupported file format. Please upload a PDF, DOCX, TXT, or Image file.");
    }

    // Clean up text
    const cleanedText = extractionResult.text
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();

    // Calculate word count
    const wordCount = cleanedText.split(/\s+/).filter(w => w.length > 0).length;

    return {
        text: cleanedText,
        pageCount: extractionResult.pageCount || 1,
        wordCount: wordCount
    };
}
