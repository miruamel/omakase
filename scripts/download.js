#!/usr/bin/env node
/**
 * Omakase downloader for Windows
 * Usage: node download.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO = 'miruamel/omakase';
const BINARY_NAME = 'omakase.exe';

function fetchLatestVersion() {
    return new Promise((resolve, reject) => {
        https.get(`https://api.github.com/repos/${REPO}/releases/latest`, {
            headers: { 'User-Agent': 'omakase-installer' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const release = JSON.parse(data);
                    const tag = release.tag_name.replace(/^v/, '');
                    resolve(tag);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function downloadBinary(version) {
    return new Promise((resolve, reject) => {
        const url = `https://github.com/${REPO}/releases/download/v${version}/${BINARY_NAME}`;
        const file = fs.createWriteStream(BINARY_NAME);

        https.get(url, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                https.get(res.headers.location, (res2) => {
                    res2.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                }).on('error', reject);
            } else {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }
        }).on('error', reject);
    });
}

async function main() {
    console.log('Fetching latest version...');
    const version = await fetchLatestVersion();
    console.log(`Latest version: v${version}`);

    console.log('Downloading binary...');
    await downloadBinary(version);
    console.log(`Downloaded ${BINARY_NAME}`);

    console.log('');
    console.log('Next steps:');
    console.log('  1. Add omakase.exe to your PATH');
    console.log('  2. Set your API key: set ANTHROPIC_API_KEY=sk-ant-...');
    console.log('  3. Run: omakase');
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
