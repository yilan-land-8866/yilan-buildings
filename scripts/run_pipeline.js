const path = require('path');
const fs = require('fs');

async function main() {
    console.log('=====================================================');
    console.log('🚀 開始執行宜蘭建案備查與實價登錄全自動更新流程');
    console.log(`⏰ 執行時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`);
    console.log('=====================================================\n');

    const t0 = Date.now();

    // Step 1: Download & sync latest pre-sale declaration list (建案備查清冊)
    const { syncLatestBuildcases } = require('./fetch_buildcase');
    await syncLatestBuildcases();

    console.log('\n-----------------------------------------------------');

    // Step 2: Download latest transactions
    const { fetchLatestTransactions } = require('./download_lvr_data');
    await fetchLatestTransactions();

    console.log('\n-----------------------------------------------------');

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
    const rootDir = path.resolve(__dirname, '..');
    const dataJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'data.json'), 'utf-8'));
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
    const excelPath = path.join(rootDir, '宜蘭建案實價登錄銷售統計.xlsx');
    const excelStats = fs.existsSync(excelPath);

    // Verify critical case integrity (e.g. 鳳凰愛買27期)
    const p27 = dataJson.find(p => p.caseName === '鳳凰愛買27期');
    const p27Sold = p27 && p27.salesStats ? p27.salesStats.soldUnits : 0;

    console.log(`  - 建案資料庫: 共 ${dataJson.length} 筆建案`);
    console.log(`  - 關鍵指標檢查 (鳳凰愛買27期): 實登售出 ${p27Sold} 戶 ${p27Sold >= 3 ? '✓' : '❌ 異常'}`);
    console.log(`  - index.html: ${(indexHtml.length / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`  - Excel 統計表: ${excelStats ? '正常產生 ✓' : '異常 ❌'}`);

    if (dataJson.length < 580 || p27Sold < 3 || indexHtml.length < 1000000 || !excelStats) {
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
