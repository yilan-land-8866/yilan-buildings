const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function getFileHash(filePath) {
    if (!fs.existsSync(filePath)) return '';
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
}

async function main() {
    console.log('=====================================================');
    console.log('🚀 開始執行宜蘭建案備查與實價登錄全自動更新流程');
    console.log(`⏰ 執行時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`);
    console.log('=====================================================\n');

    const t0 = Date.now();
    const rootDir = path.resolve(__dirname, '..');
    const isForce = process.argv.includes('--force') || process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';

    // Record hashes before download
    const rawBPath = path.join(rootDir, 'data', 'raw_transactions_b.json');
    const rawAPath = path.join(rootDir, 'data', 'raw_transactions_a.json');
    const buildcasePath = path.join(rootDir, 'g_lvr_buildcase.xls');
    const dataJsonPath = path.join(rootDir, 'data.json');

    const hashRawBBefore = getFileHash(rawBPath);
    const hashRawABefore = getFileHash(rawAPath);
    const hashBuildcaseBefore = getFileHash(buildcasePath);
    const hashDataJsonBefore = getFileHash(dataJsonPath);

    // Step 1: Download & sync latest pre-sale declaration list (建案備查清冊)
    const { syncLatestBuildcases } = require('./fetch_buildcase');
    await syncLatestBuildcases();

    console.log('\n-----------------------------------------------------');

    // Step 2: Download latest transactions
    const { fetchLatestTransactions } = require('./download_lvr_data');
    await fetchLatestTransactions();

    console.log('\n-----------------------------------------------------');

    // Check if downloaded source files changed
    const hashRawBAfter = getFileHash(rawBPath);
    const hashRawAAfter = getFileHash(rawAPath);
    const hashBuildcaseAfter = getFileHash(buildcasePath);

    const isSourceChanged = (hashRawBBefore !== hashRawBAfter) ||
                            (hashRawABefore !== hashRawAAfter) ||
                            (hashBuildcaseBefore !== hashBuildcaseAfter);

    if (!isSourceChanged && !isForce) {
        console.log('ℹ️ [Step 3/5] 經比對內政部官方伺服器本次無新資料（預售交易、移轉登記與備查清冊皆維持原樣）。');
        console.log('ℹ️ 本次跳過資料庫重新勾稽與網頁編譯，保持現有發布狀態。若為排程執行，將待下午 15:30 或下一旬再次檢查。');
        console.log('=====================================================');
        return;
    }

    console.log('✨ [Step 3/5] 偵測到內政部最新資料釋出（或強制執行），開始執行特徵勾稽與銷售統計...');
    // Step 3: Strict precision matching with cumulative transaction protection
    const { runMatching } = require('./match_strict_precision');
    runMatching();

    console.log('\n-----------------------------------------------------');

    // Step 4: Generate HTML files
    const { buildHTML } = require('./generate_html');
    buildHTML();

    console.log('\n-----------------------------------------------------');

    // Step 5: Health Check & Verification
    console.log('🔍 [Step 5/5] 執行自動健康檢查與資料完整性驗證...');
    const dataJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'data.json'), 'utf-8'));
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
    const excelPath = path.join(rootDir, '宜蘭建案實價登錄銷售統計.xlsx');
    const excelStats = fs.existsSync(excelPath);

    // Verify critical case integrity (e.g. 鳳凰愛買27期, 美澍家10)
    const p27 = dataJson.find(p => p.caseName === '鳳凰愛買27期');
    const p27Sold = p27 && p27.salesStats ? p27.salesStats.soldUnits : 0;

    const p520 = dataJson.find(p => p.id === 520 || p.caseName === '美澍家10');
    const p520Sold = p520 && p520.salesStats ? p520.salesStats.soldUnits : 0;

    console.log(`  - 建案資料庫: 共 ${dataJson.length} 筆建案`);
    console.log(`  - 關鍵指標檢查 (鳳凰愛買27期): 實登售出 ${p27Sold} 戶 ${p27Sold >= 3 ? '✓' : '❌ 異常'}`);
    console.log(`  - 關鍵指標檢查 (美澍家10): 實登售出 ${p520Sold} 戶 ${p520Sold >= 6 ? '✓' : '❌ 異常'}`);
    console.log(`  - index.html: ${(indexHtml.length / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`  - Excel 統計表: ${excelStats ? '正常產生 ✓' : '異常 ❌'}`);

    if (dataJson.length < 580 || p27Sold < 3 || p520Sold < 6 || indexHtml.length < 1000000 || !excelStats) {
        throw new Error('❌ 健康檢查未通過，資料可能不完整或有遺漏！');
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\n🎉 全自動更新流程全部成功完成！總耗時：${elapsed} 秒`);
    console.log('=====================================================');
}

if (require.main === module) {
    main().catch(err => {
        console.error('\n❌ 自動更新流程發生錯誤：', err);
        process.exit(1);
    });
}

module.exports = { main };
