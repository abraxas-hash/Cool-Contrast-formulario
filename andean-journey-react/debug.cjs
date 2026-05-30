const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
        
        console.log("Going directly to custom tour page...");
        await page.goto('http://localhost:5173/cotizar/personalizado', {waitUntil: 'networkidle0'});
        
        await new Promise(r => setTimeout(r, 2000));
        await browser.close();
        console.log("Done");
    } catch(e) {
        console.error('PUPPETEER ERROR', e);
    }
})();
