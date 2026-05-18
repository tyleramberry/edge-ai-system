async function extractTextFromPDF(buffer) {
  try {
    const PDFParser = require('pdf2json');
    
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      
      pdfParser.on('pdfParser_dataError', (err) => {
        resolve({ success: false, error: err.parserError });
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          let text = '';
          pdfData.Pages.forEach(page => {
            page.Texts.forEach(textItem => {
              textItem.R.forEach(r => {
                try {
                  text += decodeURIComponent(r.T) + ' ';
                } catch (e) {
                  text += r.T + ' ';
                }
              });
              text += '\n';
            });
          });
          resolve({
            success: true,
            text: text.trim(),
            pages: pdfData.Pages.length
          });
        } catch (e) {
          resolve({ success: false, error: e.message });
        }
      });
      
      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    console.error('PDF parse error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { extractTextFromPDF };
