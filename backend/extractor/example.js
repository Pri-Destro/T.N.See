import { chromium } from 'playwright';
import { promises as fs } from 'fs';

async function extractTermsAndConditions(url) {
    const browser = await chromium.launch({
        headless: false,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials',
            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials'
        ]
    });

    try {
        console.log(`Given URL : ${url}`);
        const context = await browser.newContext();
        const page = await context.newPage();

        // Navigate to the URL with timeout and wait until network is idle
        await page.goto(url, {
            timeout: 60000,
            waitUntil: 'networkidle'
        });

        await page.waitForLoadState('domcontentloaded');
 
        // finding terms n conditions link
        const links = await page.$$eval('a', anchors => anchors.map(a => ({
            href: a.href,
            text: a.innerText.toLowerCase()
        })));
        
        const termsLink = links.find(link => {
            const containsTerms = ['terms', 'conditions', 'tos', 'legal'].some(term => link.text.includes(term));
            return containsTerms && link.href !== url; // Exclude the current URL
        });

        // navigating to terms and condition page  

        if (termsLink) {
            console.log(`Found terms and conditions link: ${termsLink.href}`);
            await page.goto(termsLink.href, {
                timeout: 60000,
                waitUntil: 'domcontentloaded'
            });
        }

        // Extract all text
        const content = await page.evaluate(() => {
            
            
            

            
        });

        // Clean up the extracted content
        const cleanedContent = content
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();

        // Save the content to a file
        const filename = `terms.txt`;
        await fs.writeFile(filename, cleanedContent);
        console.log(`Content saved to ${filename}`);

        return {
            success: true,
            filename,
            contentLength: cleanedContent.length,
            content: cleanedContent.substring(0, 200) + '...'
        };
    } catch (error) {
        console.error('Error during extraction:', error);
        return {
            success: false,
            error: error.message
        };
    } finally {
        await browser.close();
    }
}

async function main() {
    const url = 'https://chatgpt.com'

    console.log(`\nProcessing ${url}...`);
    const result = await extractTermsAndConditions(url);
    console.log('Result:', result);
}

main().catch(console.error);