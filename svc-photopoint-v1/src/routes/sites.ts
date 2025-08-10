import express from 'express';
import { getDbConnection } from '../database/connection';
import sql from 'mssql';

const router = express.Router();

// Function to render website content
function renderWebsite(website: any, page: any): string {
    let pageContent = '';
    
    // Handle different content formats
    if (page.content) {
        try {
            // Try to parse as JSON first (for block-based content)
            const contentObj = JSON.parse(page.content);
            if (Array.isArray(contentObj)) {
                // Handle JSON blocks format
                pageContent = contentObj.map((block: any) => {
                    switch (block.type) {
                        case 'heading':
                            return `<h${block.level || 1}>${block.text || ''}</h${block.level || 1}>`;
                        case 'paragraph':
                            return `<p>${block.text || ''}</p>`;
                        case 'image':
                            return `<img src="${block.src || ''}" alt="${block.alt || ''}" />`;
                        default:
                            return `<p>${block.text || ''}</p>`;
                    }
                }).join('\n');
            } else {
                // Handle single JSON object
                pageContent = `<div>${contentObj.content || contentObj.text || ''}</div>`;
            }
        } catch (error) {
            // Not JSON, treat as plain HTML/text
            pageContent = page.content;
        }
    }

    // Basic HTML template
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title || 'Page'} - ${website.title || 'Website'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
        }
        img {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <header>
        <h1>${website.title || 'Website'}</h1>
        <nav>
            <!-- Navigation will be added here -->
        </nav>
    </header>
    <main>
        <h2>${page.title || 'Page'}</h2>
        ${pageContent}
    </main>
    <footer>
        <p>&copy; ${new Date().getFullYear()} ${website.title || 'Website'}. All rights reserved.</p>
    </footer>
</body>
</html>`;

    return html;
}

// Handle all subdomain requests
router.use((req, res, next) => {
    // Check if this is a subdomain request
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];
    
    // Skip if it's the main domain or an API request
    if (subdomain === 'localhost' || hostname === 'localhost' || req.path.startsWith('/api/')) {
        return next();
    }

    // This is a subdomain request, handle it
    handleSubdomainRequest(req, res, subdomain);
});

async function handleSubdomainRequest(req: any, res: any, subdomain: string) {
    try {
        console.log(`🌐 SUBDOMAIN REQUEST: ${subdomain} requesting ${req.path}`);
        
        // Get website by subdomain
        const pool = await getDbConnection();
        const websiteResult = await pool.request()
            .input('subdomain', sql.VarChar, subdomain)
            .query(`
                SELECT w.*, u.username as ownerUsername 
                FROM Websites w 
                LEFT JOIN Users u ON w.userId = u.id 
                WHERE w.subdomain = @subdomain AND w.status = 'Published'
            `);

        if (websiteResult.recordset.length === 0) {
            console.log(`❌ SUBDOMAIN: No published website found for subdomain: ${subdomain}`);
            return res.status(404).send(`
                <html>
                    <head><title>Website Not Found</title></head>
                    <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                        <h1>Website Not Found</h1>
                        <p>The website "${subdomain}" could not be found.</p>
                    </body>
                </html>
            `);
        }

        const website = websiteResult.recordset[0];
        console.log(`✅ SUBDOMAIN: Found website: ${website.title} (ID: ${website.id})`);

        // Extract slug from path (remove leading slash)
        let slug = req.path.slice(1) || 'home';
        console.log(`🔍 SUBDOMAIN: Looking for page with slug: ${slug}`);

        // Get page by slug
        const pageResult = await pool.request()
            .input('websiteId', sql.UniqueIdentifier, website.id)
            .input('slug', sql.VarChar, slug)
            .query(`
                SELECT * FROM Pages 
                WHERE websiteId = @websiteId AND slug = @slug AND status = 'Published'
            `);

        if (pageResult.recordset.length === 0) {
            console.log(`❌ SUBDOMAIN: No published page found for slug: ${slug}`);
            
            // Try to get home page instead
            const homeResult = await pool.request()
                .input('websiteId', sql.UniqueIdentifier, website.id)
                .input('homeSlug', sql.VarChar, 'home')
                .query(`
                    SELECT * FROM Pages 
                    WHERE websiteId = @websiteId AND slug = @homeSlug AND status = 'Published'
                `);

            if (homeResult.recordset.length === 0) {
                return res.status(404).send(`
                    <html>
                        <head><title>Page Not Found</title></head>
                        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                            <h1>Page Not Found</h1>
                            <p>The page "${slug}" could not be found on this website.</p>
                            <a href="/">Go to Home</a>
                        </body>
                    </html>
                `);
            }
            
            const homePage = homeResult.recordset[0];
            console.log(`✅ SUBDOMAIN: Fallback to home page: ${homePage.title}`);
            
            const html = renderWebsite(website, homePage);
            return res.send(html);
        }

        const page = pageResult.recordset[0];
        console.log(`✅ SUBDOMAIN: Found page: ${page.title} (ID: ${page.id})`);
        console.log(`📄 SUBDOMAIN: Page content length: ${page.content ? page.content.length : 0} characters`);

        // Render and return the website
        const html = renderWebsite(website, page);
        res.send(html);

    } catch (error) {
        console.error('❌ SUBDOMAIN ERROR:', error);
        res.status(500).send(`
            <html>
                <head><title>Server Error</title></head>
                <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1>Server Error</h1>
                    <p>An error occurred while loading this page.</p>
                </body>
            </html>
        `);
    }
}

export default router;
