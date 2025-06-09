const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');

// Ensure the docs directory exists
const docsDir = path.join(__dirname);
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Read the markdown file
const markdownPath = path.join(docsDir, 'FCDS_System_Documentation.md');
const cssPath = path.join(docsDir, 'styles.css');

// Configure markdown-pdf options
const options = {
  cssPath: cssPath,
  remarkable: {
    html: true,
    breaks: true,
    plugins: ['markdown-it-anchor']
  },
  paperFormat: 'A4',
  paperBorder: '1cm',
  renderDelay: 1000
};

// Create PDF
markdownpdf(options)
  .from(markdownPath)
  .to(path.join(docsDir, 'FCDS_System_Documentation.pdf'), function () {
    console.log('PDF generated successfully!');
  }); 