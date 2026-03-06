// Using pdfjs-dist direct import
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker - using CDN for simplicity
if (typeof window !== 'undefined') {
    // @ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
        console.log('Starting PDF text extraction...');
        const arrayBuffer = await file.arrayBuffer();
        console.log('PDF file loaded into array buffer');

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        console.log(`PDF loaded, total pages: ${pdf.numPages}`);

        let text = '';

        // Iterate through each page
        for (let i = 1; i <= pdf.numPages; i++) {
            console.log(`Processing page ${i}/${pdf.numPages}`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Extract text items with proper spacing
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ')
                .trim();

            if (pageText) {
                text += `Page ${i}:\n${pageText}\n\n`;
            }
        }

        console.log(`Successfully extracted ${text.length} characters from PDF`);
        return text;
    } catch (error: any) {
        console.error('Error extracting text from PDF:', error);
        console.error('Error details:', error.message, error.stack);
        throw new Error(`Failed to extract text from PDF: ${error.message || 'Unknown error'}`);
    }
};
