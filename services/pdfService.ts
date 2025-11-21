
import * as pdfjsLib from 'pdfjs-dist';

// Handle potential default export wrapping in some ESM builds to prevent top-level crashes
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Configure the worker src safely
if (typeof window !== 'undefined' && 'Worker' in window) {
  if (!pdfjs.GlobalWorkerOptions) {
      (pdfjs as any).GlobalWorkerOptions = {};
  }
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
}

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    // Limit pages to avoid massive memory usage in browser-only env
    const maxPages = Math.min(pdf.numPages, 20); 

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return fullText;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to extract text from PDF.");
  }
};
