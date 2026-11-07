const fs = require('fs');

async function extractAll() {
  const urls = {
    home: 'http://localhost:3000/',
    apply: 'http://localhost:3000/apply',
    status: 'http://localhost:3000/status',
    adminLogin: 'http://localhost:3000/admin/login',
    adminDashboard: 'http://localhost:3000/admin'
  };

  const results = {};

  for (const [key, url] of Object.entries(urls)) {
    console.log('Fetching', key, 'from', url);
    const res = await fetch(url);
    const html = await res.text();
    const s = html.indexOf('<main');
    const e = html.lastIndexOf('</main>');
    results[key] = html.substring(s, e + 7);
    console.log(`- ${key}: length ${results[key].length}`);
  }

  // Also get header and footer
  const homeRes = await fetch('http://localhost:3000/');
  const homeHtml = await homeRes.text();
  const headerS = homeHtml.indexOf('<header');
  const headerE = homeHtml.indexOf('</header>');
  results.header = homeHtml.substring(headerS, headerE + 9);

  const footerS = homeHtml.indexOf('<footer');
  const footerE = homeHtml.lastIndexOf('</footer>');
  results.footer = homeHtml.substring(footerS, footerE + 9);

  // Logo data URI
  const logoBuf = fs.readFileSync('public/logo.png');
  results.logoDataUri = `data:image/png;base64,${logoBuf.toString('base64')}`;

  // CSS
  const cssMatch = homeHtml.match(/href="(\/_next\/static\/css\/[^"]+\.css)"/);
  if (cssMatch) {
    const cssRes = await fetch('http://localhost:3000' + cssMatch[1]);
    results.css = await cssRes.text();
  }

  fs.writeFileSync('extracted_pages.json', JSON.stringify(results, null, 2));
  console.log('Done! Saved to extracted_pages.json');
}

extractAll();
