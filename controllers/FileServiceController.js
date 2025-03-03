
const path = require('path');
const fs = require("fs").promises;
const fs1 = require("fs");
const puppeteer = require("puppeteer");
let formidable = require('formidable');

async function readFile(req, res) {
    try {
        const { url = '' } = req.query;  //Default to page 1 and 20 records per page
        if(url=='') return res.status(404).json({ code: 404, status:'Error', message: 'file url is required' });
        const filePath = path.join(__dirname, '..', 'views', url);
        console.log(filePath);
        if (fs1.existsSync(filePath)) {
            return res.sendFile(filePath);
        } else {
            return res.status(404).json({ code: 404, status:'Error', message: 'File not found' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ code: 500, status:'Error', message: 'Interner Serverfehler.' });
    }
}

async function htmltoPDF(data){
    try {
        const browser = await puppeteer.launch({
            headless: true, // Change to false to debug in a visible browser
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setContent(data, { waitUntil: "load" });
        const pdfBuffer = await page.pdf(
            { 
                format: "A4", 
                printBackground: true, 
                landscape: true,
                margin: { top: "10px", bottom: "10px", left: "10px", right: "10px" },
            }
        );
        await browser.close();
        return pdfBuffer;
    } catch (error) {
        throw new Error("Failed to generate PDF: " + error.message);
    }
}


async  function htmlToPDFConverter(req,res,next){
  const user = req.user;    // req.user;
  const maxFileSizeInBytes = 10 * 1024 * 1024;
//   const allowedFileExtensions = ['.blob'];
  let form = new formidable.IncomingForm();
  form.parse(req, async function (error, fields, file) 
  {
    try {      
        if (file.file && file.file.length > 0) {
          const fileObj = file.file[0];
          const fileName = fileObj.originalFilename;
          const newfileName = `${fileName}.pdf`;
          console.log(fileName);
          console.log(newfileName);
          const fileExtension = path.extname(fileName).toLowerCase();
        //   if (!allowedFileExtensions.includes(fileExtension)) return res.status(400).json({ code: 400, status: 'Validation Error', message: 'Ungültiger Dateityp. Erlaubte Typen sind: ' + allowedFileExtensions.join(', ') });
          
          const fileSizeInBytes = fileObj.size;
          if (fileSizeInBytes > maxFileSizeInBytes) return res.status(400).json({ code: 400, status: 'Validation Error', message: 'Die Dateigröße überschreitet das zulässige Maximum (10 MB).'});
          
          const filePathSource = fileObj.filepath;
          
          const htmlFileContent = await fs.readFile(filePathSource, "utf8");

          let generatedPDF = await htmltoPDF(htmlFileContent);
          fs1.writeFileSync("views/test.pdf", generatedPDF);
          generatedPDF = Buffer.from(generatedPDF);
          console.log(Buffer.isBuffer(generatedPDF)); // Should print: true
          console.log("successful generated pdf");
          res.removeHeader("Content-Length");
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `attachment; filename="${newfileName}"`);
          res.setHeader("Content-Length", generatedPDF.length);
          if (!res.headersSent) {
            res.end(generatedPDF);
          }
          console.log(res);
          console.log("PDF Buffer Size:", generatedPDF.length);
        }else {
          res.status(404).json({ code: 404, status: 'Error', message: 'No file found' });
        }
      
    } catch (error) 
    {
      console.log(error);
      res.status(500).json({code: 500, status:'Error', message: error.message});
    }
  });
} 

module.exports = {
    readFile, htmlToPDFConverter
};
    