const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const iconv = require('iconv-lite');

const outputDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const rawAFile = path.join(outputDir, 'raw_transactions_a.json');
const rawBFile = path.join(outputDir, 'raw_transactions_b.json');

function downloadZip(url) {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 30000 }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadZip(res.headers.location).then(resolve);
            }
            if (res.statusCode !== 200) {
                return resolve(null);
            }
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                try {
                    const zip = new AdmZip(buffer);
                    const entries = zip.getEntries();
                    const gA = entries.find(e => e.entryName.toLowerCase() === 'g_lvr_land_a.csv');
                    const gB = entries.find(e => e.entryName.toLowerCase() === 'g_lvr_land_b.csv');
                    
                    const parseEntry = (entry) => {
                        if (!entry) return '';
                        const data = entry.getData();
                        let str = data.toString('utf-8');
                        if (str.includes('\ufffd')) {
                            str = iconv.decode(data, 'big5');
                        }
                        return str;
                    };

                    resolve({
                        textA: parseEntry(gA),
                        textB: parseEntry(gB)
                    });
                } catch (e) {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

function parseCSV(text) {
    if (!text || text.trim().length === 0) return [];
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        if (i === 1 && (lines[i].includes('The village') || lines[i].includes('district'))) continue;
        const vals = parseCSVLine(lines[i]);
        if (vals.length <= 1) continue;

        const row = {};
        headers.forEach((h, idx) => {
            row[h] = vals[idx] !== undefined ? vals[idx].trim() : '';
        });
        rows.push(row);
    }
    return rows;
}

function parseCSVLine(text) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
            inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
        } else {
            cur += c;
        }
    }
    result.push(cur);
    return result;
}

async function fetchLatestTransactions() {
    console.log('🔄 [Step 1/4] 下載內政部最新實價登錄全量與最新季別資料庫...');

    const currentRocYear = new Date().getFullYear() - 1911;
    const seasons = [];
    for (let y = 106; y <= currentRocYear + 1; y++) {
        for (let s = 1; s <= 4; s++) {
            seasons.push(`${y}S${s}`);
        }
    }

    const allTxA = [];
    const allTxB = [];

    for (const season of seasons) {
        process.stdout.write(`  抓取 ${season} 批次... `);
        const url = `https://plvr.land.moi.gov.tw/DownloadSeason?season=${season}&type=csv&fileName=lvr_landcsv.zip`;
        const res = await downloadZip(url);
        if (res && (res.textA || res.textB)) {
            const rowsA = parseCSV(res.textA);
            const rowsB = parseCSV(res.textB);
            
            rowsA.forEach(r => r._season = season);
            rowsB.forEach(r => r._season = season);

            allTxA.push(...rowsA);
            allTxB.push(...rowsB);
            console.log(`✓ (買賣成屋: ${rowsA.length} 筆, 預售屋: ${rowsB.length} 筆)`);
        } else {
            console.log(`- 無資料或尚未發布`);
        }
    }

    // Also download current latest active period
    try {
        process.stdout.write(`  抓取當期最新實價登錄 (lvr_landcsv.zip)... `);
        const currentUrl = `https://plvr.land.moi.gov.tw/DownloadOpenData`;
        const resCurr = await downloadZip(currentUrl);
        if (resCurr && (resCurr.textA || resCurr.textB)) {
            const rowsA = parseCSV(resCurr.textA);
            const rowsB = parseCSV(resCurr.textB);
            rowsA.forEach(r => r._season = 'current');
            rowsB.forEach(r => r._season = 'current');
            allTxA.push(...rowsA);
            allTxB.push(...rowsB);
            console.log(`✓ (當期成屋: ${rowsA.length} 筆, 當期預售: ${rowsB.length} 筆)`);
        } else {
            console.log(`- 無當期增量`);
        }
    } catch (e) {}

    console.log(`\n📊 實價登錄下載完成：`);
    console.log(`  - 買賣移轉與土地歷史紀錄 (A檔): ${allTxA.length.toLocaleString()} 筆`);
    console.log(`  - 預售屋買賣交易紀錄 (B檔): ${allTxB.length.toLocaleString()} 筆`);

    fs.writeFileSync(rawAFile, JSON.stringify(allTxA), 'utf-8');
    fs.writeFileSync(rawBFile, JSON.stringify(allTxB), 'utf-8');
    return { rawAFile, rawBFile };
}

if (require.main === module) {
    fetchLatestTransactions().catch(err => {
        console.error('Error fetching transactions:', err);
        process.exit(1);
    });
}

module.exports = { fetchLatestTransactions };
