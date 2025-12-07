#!/usr/bin/env node

/**
 * Measure page widths on desktop (1024px viewport)
 * Renders each page route and checks the container max-width
 * 
 * Usage: node measure-page-widths.js http://localhost:5173
 */

const puppeteer = require('puppeteer');

const baseUrl = process.argv[2] || 'http://localhost:5173';
const viewportWidth = 1024;
const viewportHeight = 768;

// Pages to test (route path)
const pages = [
  { path: '/', name: 'Home / Events' },
  { path: '/wallet', name: 'Wallet' },
  { path: '/games', name: 'Games' },
  { path: '/challenges', name: 'Challenges' },
  { path: '/myevents', name: 'My Events' },
  { path: '/profile', name: 'Profile' },
  { path: '/messages', name: 'Messages' },
  { path: '/notifications', name: 'Notifications' },
  { path: '/leaderboard', name: 'Leaderboard' },
  { path: '/settings', name: 'Settings' },
  { path: '/referral', name: 'Referral' },
  { path: '/levels', name: 'Levels' },
  { path: '/help', name: 'Help' },
  { path: '/privacy', name: 'Privacy' },
  { path: '/terms', name: 'Terms' },
];

async function measurePageWidths() {
  console.log(`\n📐 Measuring page widths on desktop (${viewportWidth}px viewport)\n`);
  console.log(`Base URL: ${baseUrl}\n`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const results = [];

  try {
    for (const page of pages) {
      const fullUrl = `${baseUrl}${page.path}`;
      console.log(`Measuring: ${page.name} (${page.path})...`);

      const browserPage = await browser.newPage();
      await browserPage.setViewport({ width: viewportWidth, height: viewportHeight });

      try {
        await browserPage.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await browserPage.waitForTimeout(1000); // Wait for styles to apply

        // Measure various container widths
        const measurements = await browserPage.evaluate(() => {
          const main = document.querySelector('main');
          const container = document.querySelector('[class*="container"]') || 
                          document.querySelector('[class*="max-w"]') ||
                          main;
          
          const mainStyle = main ? window.getComputedStyle(main) : null;
          const containerStyle = container ? window.getComputedStyle(container) : null;

          return {
            mainMaxWidth: mainStyle?.maxWidth || 'none',
            mainWidth: mainStyle?.width || 'auto',
            containerMaxWidth: containerStyle?.maxWidth || 'none',
            containerWidth: containerStyle?.width || 'auto',
            bodyWidth: document.body.clientWidth,
            documentWidth: document.documentElement.clientWidth,
          };
        });

        results.push({
          path: page.path,
          name: page.name,
          ...measurements,
        });

        console.log(`  ✓ Body width: ${measurements.bodyWidth}px`);
        console.log(`  ✓ Main max-width: ${measurements.mainMaxWidth}`);
        console.log(`  ✓ Container max-width: ${measurements.containerMaxWidth}\n`);
      } catch (err) {
        console.log(`  ✗ Error: ${err.message}\n`);
        results.push({
          path: page.path,
          name: page.name,
          error: err.message,
        });
      }

      await browserPage.close();
    }
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n📊 Summary:\n');
  console.log('Page | Desktop Width (at 1024px viewport)');
  console.log('-----|-----------------------------------');
  results.forEach(r => {
    if (r.error) {
      console.log(`${r.name} | ERROR: ${r.error}`);
    } else {
      const mainMaxWidth = r.mainMaxWidth !== 'none' ? r.mainMaxWidth : r.containerMaxWidth;
      console.log(`${r.name} | ${mainMaxWidth} (actual body: ${r.bodyWidth}px)`);
    }
  });

  console.log('\n✨ Done!\n');
}

measurePageWidths().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
