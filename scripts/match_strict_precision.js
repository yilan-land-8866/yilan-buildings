const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const rootDir = path.resolve(__dirname, '..');
const dataJsonPath = path.join(rootDir, 'data.json');
const rawAFile = path.join(rootDir, 'data', 'raw_transactions_a.json');
const rawBFile = path.join(rootDir, 'data', 'raw_transactions_b.json');
const excelPath = path.join(rootDir, '宜蘭建案實價登錄銷售統計.xlsx');

function normalizeText(str) {
    if (!str) return '';
    return String(str)
        .replace(/[\s\-_－—·]/g, '')
        .replace(/臺/g, '台')
        .replace(/（/g, '(')
        .replace(/）/g, ')')
        .replace(/，/g, ',')
        .toLowerCase();
}

function parseSectionAndNum(landStr) {
    if (!landStr) return [];
    const results = [];
    const regex = /([\u4e00-\u9fa5\d]+段)(?:[\s,、]*(\d+(?:-\d+)?))?/g;
    let match;
    while ((match = regex.exec(landStr)) !== null) {
        results.push({
            section: match[1],
            normSec: normalizeText(match[1]),
            num: match[2] || '',
            numBase: match[2] ? match[2].split('-')[0] : ''
        });
    }
    return results;
}

function getVal(row, keys) {
    for (const k of keys) {
        if (row[k] !== undefined && row[k] !== '') return row[k];
        if (row['\ufeff' + k] !== undefined && row['\ufeff' + k] !== '') return row['\ufeff' + k];
    }
    return '';
}

function runMatching() {
    console.log('⚙️ [Step 2/4] 執行高精度防誤抓勾稽與基地購地地價分離運算...');

    if (!fs.existsSync(dataJsonPath) || !fs.existsSync(rawAFile) || !fs.existsSync(rawBFile)) {
        console.error('❌ 缺少必要資料檔案！');
        process.exit(1);
    }

    const projects = JSON.parse(fs.readFileSync(dataJsonPath, 'utf-8'));
    const rawTxA = JSON.parse(fs.readFileSync(rawAFile, 'utf-8'));
    const rawTxB = JSON.parse(fs.readFileSync(rawBFile, 'utf-8'));

    const txByTownB = {};
    const txByTownA_Building = {};
    const txByTownA_Land = {};

    // 1. Process PRE-SALE (g_lvr_land_b)
    rawTxB.forEach(row => {
        const cancel = getVal(row, ['解約情形']);
        if (cancel && cancel.includes('已解約')) return;

        const town = getVal(row, ['鄉鎮市區']).trim();
        const address = getVal(row, ['土地區段位置建物區門牌', '土地位置建物門牌', '建物門牌', '門牌']).trim();
        const rawDate = getVal(row, ['交易年月日']).trim();
        const target = getVal(row, ['交易標的']).trim();
        const unitPriceM2 = parseFloat(getVal(row, ['單價元平方公尺'])) || 0;
        const totalPrice = parseFloat(getVal(row, ['總價元'])) || 0;
        const areaM2 = parseFloat(getVal(row, ['建物移轉總面積平方公尺'])) || 0;
        const room = getVal(row, ['建物現況格局-房']);
        const hall = getVal(row, ['建物現況格局-廳']);
        const bath = getVal(row, ['建物現況格局-衛']);
        const layout = room ? `${room}房${hall}廳${bath}衛` : '';
        const floor = getVal(row, ['移轉層次', '總樓層數']).trim();
        const parking = getVal(row, ['車位類別', '交易筆棟數']).trim();
        const note = getVal(row, ['備註']).trim();
        const buildCaseName = getVal(row, ['建案名稱']).trim();

        if (!address || (totalPrice === 0 && unitPriceM2 === 0)) return;

        const pricePerPing = unitPriceM2 > 0 ? parseFloat(((unitPriceM2 * 3.305785) / 10000).toFixed(1)) : 0;
        const totalPriceWan = totalPrice > 0 ? parseFloat((totalPrice / 10000).toFixed(1)) : 0;
        const areaPing = areaM2 > 0 ? parseFloat((areaM2 * 0.3025).toFixed(1)) : 0;

        let dateRoc = rawDate;
        let rocYear = 0;
        if (rawDate.length === 7) {
            rocYear = parseInt(rawDate.slice(0, 3), 10);
            dateRoc = `${rawDate.slice(0, 3)}/${rawDate.slice(3, 5)}/${rawDate.slice(5, 7)}`;
        } else if (rawDate.length === 6) {
            rocYear = parseInt(rawDate.slice(0, 2), 10);
            dateRoc = `${rawDate.slice(0, 2)}/${rawDate.slice(2, 4)}/${rawDate.slice(4, 6)}`;
        }

        const t = town || '宜蘭縣';
        if (!txByTownB[t]) txByTownB[t] = [];
        txByTownB[t].push({
            source: '預售屋實登',
            town,
            address,
            normAddr: normalizeText(address),
            normNote: normalizeText(note),
            normCase: normalizeText(buildCaseName),
            dateRoc,
            rocYear,
            rawDate,
            target,
            pricePerPing,
            totalPriceWan,
            areaPing,
            layout,
            floor,
            parking,
            note
        });
    });

    // 2. Process COMPLETED TRANSFERS (g_lvr_land_a)
    rawTxA.forEach(row => {
        const cancel = getVal(row, ['解約情形']);
        if (cancel && cancel.includes('已解約')) return;

        const target = getVal(row, ['交易標的']).trim();
        const town = getVal(row, ['鄉鎮市區']).trim();
        const address = getVal(row, ['土地區段位置建物區門牌', '土地位置建物門牌', '建物門牌', '門牌']).trim();
        const rawDate = getVal(row, ['交易年月日']).trim();
        const unitPriceM2 = parseFloat(getVal(row, ['單價元平方公尺'])) || 0;
        const totalPrice = parseFloat(getVal(row, ['總價元'])) || 0;
        const landAreaM2 = parseFloat(getVal(row, ['土地移轉總面積平方公尺'])) || 0;
        const bldgAreaM2 = parseFloat(getVal(row, ['建物移轉總面積平方公尺'])) || 0;
        const note = getVal(row, ['備註']).trim();

        if (!address || (totalPrice === 0 && unitPriceM2 === 0)) return;

        let dateRoc = rawDate;
        let rocYear = 0;
        if (rawDate.length === 7) {
            rocYear = parseInt(rawDate.slice(0, 3), 10);
            dateRoc = `${rawDate.slice(0, 3)}/${rawDate.slice(3, 5)}/${rawDate.slice(5, 7)}`;
        } else if (rawDate.length === 6) {
            rocYear = parseInt(rawDate.slice(0, 2), 10);
            dateRoc = `${rawDate.slice(0, 2)}/${rawDate.slice(2, 4)}/${rawDate.slice(4, 6)}`;
        }

        const t = town || '宜蘭縣';

        // Check if PURE LAND ACQUISITION
        if (target === '土地' || (bldgAreaM2 === 0 && landAreaM2 > 0)) {
            const landPricePerPing = unitPriceM2 > 0 
                ? parseFloat(((unitPriceM2 * 3.305785) / 10000).toFixed(1)) 
                : (landAreaM2 > 0 ? parseFloat((((totalPrice / landAreaM2) * 3.305785) / 10000).toFixed(1)) : 0);
            const landTotalPriceWan = parseFloat((totalPrice / 10000).toFixed(1));
            const landAreaPing = parseFloat((landAreaM2 * 0.3025).toFixed(1));

            if (!txByTownA_Land[t]) txByTownA_Land[t] = [];
            txByTownA_Land[t].push({
                town,
                address,
                normAddr: normalizeText(address),
                rawDate,
                dateRoc,
                rocYear,
                pricePerPing: landPricePerPing,
                totalPriceWan: landTotalPriceWan,
                areaPing: landAreaPing,
                note
            });
            return;
        }

        // COMPLETED HOUSING TRANSACTION
        const bType = getVal(row, ['建物型態']).trim();
        if (bType.includes('工廠') || bType.includes('倉庫') || bType.includes('農舍')) return;
        if (bldgAreaM2 <= 0) return;

        const buildYearMonth = getVal(row, ['建築完成年月']).trim();
        let buildYearRoc = 0;
        if (buildYearMonth.length >= 5) {
            buildYearRoc = parseInt(buildYearMonth.slice(0, buildYearMonth.length - 2), 10);
        }

        const room = getVal(row, ['建物現況格局-房']);
        const hall = getVal(row, ['建物現況格局-廳']);
        const bath = getVal(row, ['建物現況格局-衛']);
        const layout = room ? `${room}房${hall}廳${bath}衛` : '';
        const floor = getVal(row, ['移轉層次', '總樓層數']).trim();
        const parking = getVal(row, ['車位類別', '交易筆棟數']).trim();

        const pricePerPing = unitPriceM2 > 0 ? parseFloat(((unitPriceM2 * 3.305785) / 10000).toFixed(1)) : 0;
        const totalPriceWan = totalPrice > 0 ? parseFloat((totalPrice / 10000).toFixed(1)) : 0;
        const areaPing = bldgAreaM2 > 0 ? parseFloat((bldgAreaM2 * 0.3025).toFixed(1)) : 0;

        if (!txByTownA_Building[t]) txByTownA_Building[t] = [];
        txByTownA_Building[t].push({
            source: '成屋/買賣實登',
            town,
            address,
            normAddr: normalizeText(address),
            normNote: normalizeText(note),
            buildYearRoc,
            dateRoc,
            rocYear,
            rawDate,
            target,
            pricePerPing,
            totalPriceWan,
            areaPing,
            layout,
            floor,
            parking,
            note
        });
    });

    let totalMatchedProjects = 0;
    let totalMatchedUnits = 0;
    let totalSoldOutProjects = 0;
    let totalProjectsWithLand = 0;

    projects.forEach(p => {
        const pTown = p.town || '';
        const pCaseNameNorm = normalizeText(p.caseName);
        const pMainLand = p.mainLand || '';
        const pAllLands = p.allLands || [];
        const pPermitYear = p.permitYearRoc || 0;

        const isGenericCaseName = /^[^\d]+段$/.test(pCaseNameNorm) || ['透天別墅', '花園別墅', '新成屋', '喜堂', '集合住宅'].includes(pCaseNameNorm);

        const parsedLands = [];
        [pMainLand, ...pAllLands].forEach(l => {
            parsedLands.push(...parseSectionAndNum(l));
        });

        // A. Match Pre-sale
        const candidatesB = txByTownB[pTown] || [];
        const matchedB = [];

        for (const tx of candidatesB) {
            let isMatch = false;

            if (pCaseNameNorm.length >= 2 && !isGenericCaseName) {
                if (tx.normCase && tx.normCase.includes(pCaseNameNorm)) isMatch = true;
                else if (tx.normAddr.includes(pCaseNameNorm) || tx.normNote.includes(pCaseNameNorm)) isMatch = true;
            }

            if (!isMatch && parsedLands.length > 0) {
                for (const pl of parsedLands) {
                    if (pl.normSec && tx.normAddr.includes(pl.normSec)) {
                        if (pl.num) {
                            const exactNumRegex = new RegExp(`(?:^|[^\\d])${pl.num}(?:地號|號|[^\\d]|$)`);
                            const exactBaseRegex = new RegExp(`(?:^|[^\\d])${pl.numBase}(?:地號|號|[^\\d]|$)`);
                            if (exactNumRegex.test(tx.normAddr) || exactBaseRegex.test(tx.normAddr)) {
                                isMatch = true;
                                break;
                            }
                        } else {
                            isMatch = true;
                            break;
                        }
                    }
                }
            }

            if (isMatch) {
                if (pPermitYear > 0 && tx.rocYear < pPermitYear - 1) continue;
                matchedB.push(tx);
            }
        }

        // B. Match Completed Housing
        const candidatesA_Bldg = txByTownA_Building[pTown] || [];
        const matchedA_Bldg = [];

        for (const tx of candidatesA_Bldg) {
            if (pPermitYear > 0 && tx.rocYear < pPermitYear) continue;
            if (tx.buildYearRoc > 0 && pPermitYear > 0 && tx.buildYearRoc < pPermitYear - 1) continue;

            let isMatch = false;

            if (pCaseNameNorm.length >= 3 && !isGenericCaseName) {
                if (tx.normAddr.includes(pCaseNameNorm) || tx.normNote.includes(pCaseNameNorm)) {
                    isMatch = true;
                }
            }

            if (!isMatch && parsedLands.length > 0) {
                for (const pl of parsedLands) {
                    if (pl.normSec && tx.normAddr.includes(pl.normSec) && pl.num) {
                        const exactNumRegex = new RegExp(`(?:^|[^\\d])${pl.num}(?:地號|號|[^\\d]|$)`);
                        const exactBaseRegex = new RegExp(`(?:^|[^\\d])${pl.numBase}(?:地號|號|[^\\d]|$)`);
                        if (exactNumRegex.test(tx.normAddr) || exactBaseRegex.test(tx.normAddr)) {
                            isMatch = true;
                            break;
                        }
                    }
                }
            }

            if (isMatch) {
                matchedA_Bldg.push(tx);
            }
        }

        // Deduplicate physical units
        const uniqueUnitMap = new Map();
        const allTransactions = [];

        matchedB.forEach(tx => {
            const unitKey = `${tx.address}_${tx.floor || '全'}_${tx.areaPing}`;
            if (!uniqueUnitMap.has(unitKey)) {
                uniqueUnitMap.set(unitKey, tx);
            }
            allTransactions.push(tx);
        });

        matchedA_Bldg.forEach(tx => {
            const unitKey = `${tx.address}_${tx.floor || '全'}_${tx.areaPing}`;
            if (!uniqueUnitMap.has(unitKey)) {
                uniqueUnitMap.set(unitKey, tx);
                allTransactions.push(tx);
            }
        });

        const distinctUnits = Array.from(uniqueUnitMap.values());
        const rawDistinctCount = distinctUnits.length;

        if (rawDistinctCount > 0) {
            totalMatchedProjects++;
            allTransactions.sort((a, b) => (b.rawDate || '').localeCompare(a.rawDate || ''));

            const validPrices = allTransactions.filter(t => t.pricePerPing > 0).map(t => t.pricePerPing);
            const validTotals = allTransactions.filter(t => t.totalPriceWan > 0).map(t => t.totalPriceWan);

            const avgPrice = validPrices.length > 0 ? parseFloat((validPrices.reduce((a, b) => a + b, 0) / validPrices.length).toFixed(1)) : 0;
            const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
            const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;

            const avgTotal = validTotals.length > 0 ? parseFloat((validTotals.reduce((a, b) => a + b, 0) / validTotals.length).toFixed(1)) : 0;
            const minTotal = validTotals.length > 0 ? Math.min(...validTotals) : 0;
            const maxTotal = validTotals.length > 0 ? Math.max(...validTotals) : 0;

            const plannedHouseholds = p.household || rawDistinctCount;
            const effectiveSoldUnits = (p.household > 0) ? Math.min(rawDistinctCount, p.household) : rawDistinctCount;
            const salesRate = plannedHouseholds > 0 ? Math.min(parseFloat(((effectiveSoldUnits / plannedHouseholds) * 100).toFixed(1)), 100) : 100;
            const isSoldOut = (salesRate >= 100);

            if (isSoldOut) totalSoldOutProjects++;
            totalMatchedUnits += effectiveSoldUnits;

            p.salesStats = {
                hasSalesData: true,
                soldUnits: effectiveSoldUnits,
                rawTxCount: allTransactions.length,
                totalHouseholds: plannedHouseholds,
                salesRate: salesRate,
                isSoldOut: isSoldOut,
                avgPricePerPing: avgPrice,
                minPricePerPing: minPrice,
                maxPricePerPing: maxPrice,
                avgTotalPrice: avgTotal,
                minTotalPrice: minTotal,
                maxTotalPrice: maxTotal,
                latestTransactionDate: allTransactions[0].dateRoc,
                transactions: allTransactions.map(t => ({
                    source: t.source,
                    dateRoc: t.dateRoc,
                    unit: t.address,
                    floor: t.floor,
                    areaPing: t.areaPing,
                    pricePerPing: t.pricePerPing,
                    totalPrice: t.totalPriceWan,
                    layout: t.layout,
                    parking: t.parking
                }))
            };
        } else {
            p.salesStats = {
                hasSalesData: false,
                soldUnits: 0,
                rawTxCount: 0,
                totalHouseholds: p.household || 0,
                salesRate: 0,
                isSoldOut: false,
                avgPricePerPing: 0,
                minPricePerPing: 0,
                maxPricePerPing: 0,
                avgTotalPrice: 0,
                minTotalPrice: 0,
                maxTotalPrice: 0,
                latestTransactionDate: '',
                transactions: []
            };
        }

        // C. Match Land Acquisition
        const candidatesA_Land = txByTownA_Land[pTown] || [];
        const matchedLandTx = [];

        for (const tx of candidatesA_Land) {
            if (pPermitYear > 0 && tx.rocYear > pPermitYear + 1) continue;

            let isMatch = false;
            for (const pl of parsedLands) {
                if (pl.normSec && tx.normAddr.includes(pl.normSec) && pl.num) {
                    const exactNumRegex = new RegExp(`(?:^|[^\\d])${pl.num}(?:地號|號|[^\\d]|$)`);
                    const exactBaseRegex = new RegExp(`(?:^|[^\\d])${pl.numBase}(?:地號|號|[^\\d]|$)`);
                    if (exactNumRegex.test(tx.normAddr) || exactBaseRegex.test(tx.normAddr)) {
                        isMatch = true;
                        break;
                    }
                }
            }

            if (isMatch) {
                matchedLandTx.push(tx);
            }
        }

        if (matchedLandTx.length > 0) {
            totalProjectsWithLand++;
            matchedLandTx.sort((a, b) => (b.rawDate || '').localeCompare(a.rawDate || ''));

            const validLandPrices = matchedLandTx.filter(t => t.pricePerPing > 0).map(t => t.pricePerPing);
            const validLandTotals = matchedLandTx.filter(t => t.totalPriceWan > 0).map(t => t.totalPriceWan);
            const totalLandArea = matchedLandTx.reduce((a, b) => a + (b.areaPing || 0), 0);

            const avgLandPrice = validLandPrices.length > 0 ? parseFloat((validLandPrices.reduce((a, b) => a + b, 0) / validLandPrices.length).toFixed(1)) : 0;
            const totalLandCost = validLandTotals.length > 0 ? parseFloat(validLandTotals.reduce((a, b) => a + b, 0).toFixed(1)) : 0;

            p.landStats = {
                hasLandData: true,
                txCount: matchedLandTx.length,
                latestLandDate: matchedLandTx[0].dateRoc,
                avgLandPricePerPing: avgLandPrice,
                minLandPrice: Math.min(...validLandPrices),
                maxLandPrice: Math.max(...validLandPrices),
                totalLandCostWan: totalLandCost,
                totalLandAreaPing: parseFloat(totalLandArea.toFixed(1)),
                transactions: matchedLandTx.map(t => ({
                    dateRoc: t.dateRoc,
                    landParcel: t.address,
                    pricePerPing: t.pricePerPing,
                    totalPrice: t.totalPriceWan,
                    areaPing: t.areaPing,
                    note: t.note
                }))
            };
        } else {
            p.landStats = {
                hasLandData: false,
                txCount: 0,
                latestLandDate: '',
                avgLandPricePerPing: 0,
                minLandPrice: 0,
                maxLandPrice: 0,
                totalLandCostWan: 0,
                totalLandAreaPing: 0,
                transactions: []
            };
        }
    });

    console.log(`\n📊 勾稽統計結果：`);
    console.log(`  - 建案總數: ${projects.length}`);
    console.log(`  - 精準有實登建案: ${totalMatchedProjects} 案 (${((totalMatchedProjects/projects.length)*100).toFixed(1)}%)`);
    console.log(`  - 100% 完銷建案: ${totalSoldOutProjects} 案`);
    console.log(`  - 一手真實售出總戶數: ${totalMatchedUnits.toLocaleString()} 戶`);
    console.log(`  - 勾稽出基地購地地價: ${totalProjectsWithLand} 案 (${((totalProjectsWithLand/projects.length)*100).toFixed(1)}%)`);

    fs.writeFileSync(dataJsonPath, JSON.stringify(projects, null, 2), 'utf-8');

    // Export Excel
    const excelRows = projects.map((p, idx) => {
        const s = p.salesStats;
        const l = p.landStats;

        let statusText = '尚無實登';
        if (s.hasSalesData) {
            statusText = s.isSoldOut ? '完銷 100%' : `${s.salesRate}% (${s.soldUnits}/${s.totalHouseholds}戶)`;
        }
        return {
            '序號': idx + 1,
            '鄉鎮市區': p.town,
            '建案名稱': p.caseName,
            '起造建商': p.builder,
            '申報總戶數': p.household || '未填寫',
            '實登已售戶數': s.hasSalesData ? s.soldUnits : 0,
            '銷售進度狀態': statusText,
            '銷售率(%)': s.hasSalesData ? `${s.salesRate}%` : '尚無實登',
            '建案平均單價(萬/坪)': s.hasSalesData && s.avgPricePerPing ? s.avgPricePerPing : '--',
            '建案單價區間(萬/坪)': s.hasSalesData && s.minPricePerPing ? `${s.minPricePerPing} ~ ${s.maxPricePerPing}` : '--',
            '建案平均總價(萬元)': s.hasSalesData && s.avgTotalPrice ? s.avgTotalPrice : '--',
            '最新成交日期': s.latestTransactionDate || '--',
            '🌱基地購地單價(萬/坪)': l.hasLandData && l.avgLandPricePerPing ? l.avgLandPricePerPing : '--',
            '🌱基地購地總價(萬元)': l.hasLandData && l.totalLandCostWan ? l.totalLandCostWan : '--',
            '🌱購地成交日期': l.latestLandDate || '--',
            '🌱購地移轉面積(坪)': l.hasLandData && l.totalLandAreaPing ? l.totalLandAreaPing : '--',
            '土地規劃分區': p.zoningInfo.category,
            '主要用途': p.normalizedUse,
            '坐落街道': p.location,
            '主要基地地號': p.mainLand,
            '建照核發日期': p.permitDate,
            '建造執照號碼': p.permitNo,
            '申報備查日期': p.declareDate
        };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelRows);
    XLSX.utils.book_append_sheet(wb, ws, '宜蘭建案實價登錄銷售統計');
    XLSX.writeFile(wb, excelPath);
    console.log(`✓ 已輸出最新 Excel 統計表：${excelPath}`);
}

if (require.main === module) {
    runMatching();
}

module.exports = { runMatching };
