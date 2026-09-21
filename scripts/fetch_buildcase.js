const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const rootDir = path.resolve(__dirname, '..');
const xlsPath = path.join(rootDir, 'g_lvr_buildcase.xls');
const dataJsonPath = path.join(rootDir, 'data.json');

const BUILDCASE_URL = 'https://plvr.land.moi.gov.tw/Download?PayType=saleremark&fileName=g_lvr_buildcase.xls';

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://plvr.land.moi.gov.tw/DownloadOpenData'
            },
            timeout: 45000
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            const fileStream = fs.createWriteStream(destPath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(destPath);
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('下載超時 (Timeout)')); });
    });
}

function parseRocDate(val) {
    if (!val) return { raw: '', rocFormatted: '', adDate: '', yearRoc: null, yearAd: null };
    const str = String(val).trim().replace(/[年月日\/\-\.]/g, '');
    if (!str || isNaN(str)) return { raw: String(val).trim(), rocFormatted: String(val).trim(), adDate: '', yearRoc: null, yearAd: null };
    
    let yearRoc, month, day;
    if (str.length === 7) {
        yearRoc = parseInt(str.slice(0, 3), 10);
        month = parseInt(str.slice(3, 5), 10);
        day = parseInt(str.slice(5, 7), 10);
    } else if (str.length === 6) {
        yearRoc = parseInt(str.slice(0, 2), 10);
        month = parseInt(str.slice(2, 4), 10);
        day = parseInt(str.slice(4, 6), 10);
    } else {
        return { raw: str, rocFormatted: str, adDate: '', yearRoc: null, yearAd: null };
    }

    const yearAd = yearRoc + 1911;
    const mStr = String(month).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return {
        raw: str,
        rocFormatted: `${yearRoc}/${mStr}/${dStr}`,
        adDate: `${yearAd}-${mStr}-${dStr}`,
        yearRoc: yearRoc,
        yearAd: yearAd
    };
}

function parseChineseNum(str) {
    const map = {
        '零': 0, '〇': 0, 'O': 0, 'o': 0,
        '一': 1, '壹': 1,
        '二': 2, '貳': 2, '两': 2, '兩': 2,
        '三': 3, '參': 3, '叁': 3,
        '四': 4, '肆': 4,
        '五': 5, '伍': 5,
        '六': 6, '陸': 6,
        '七': 7, '柒': 7,
        '八': 8, '捌': 8,
        '九': 9, '玖': 9
    };
    if (!str) return null;
    str = str.trim();
    if (/^\d+$/.test(str)) return parseInt(str, 10);

    let total = 0;
    let section = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (map[char] !== undefined) {
            section = section * 10 + map[char];
        } else if (char === '十' || char === '拾') {
            if (section === 0) section = 1;
            total += section * 10;
            section = 0;
        } else if (char === '百' || char === '佰') {
            if (section === 0) section = 1;
            total += section * 100;
            section = 0;
        } else {
            return null;
        }
    }
    total += section;
    return total;
}

function numToChinese(num) {
    const chnDigits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (num >= 1 && num <= 10) return chnDigits[num];
    if (num > 10 && num < 20) return '十' + chnDigits[num - 10];
    if (num >= 20 && num < 30) return '二十' + (num === 20 ? '' : chnDigits[num - 20]);
    if (num >= 30 && num < 40) return '三十' + (num === 30 ? '' : chnDigits[num - 30]);
    return String(num);
}

function generateSearchAliases(text) {
    if (!text) return '';
    const aliases = new Set();
    aliases.add(text.toLowerCase());
    const cleanPunct = text.replace(/[-_－—·•．\s]/g, '');
    aliases.add(cleanPunct.toLowerCase());

    const m = text.match(/第?\s*([零一二三四五六七八九十百壹貳兩參肆伍陸柒捌玖拾佰\d]+)\s*期/);
    if (m) {
        const rawNum = m[1];
        const numVal = parseChineseNum(rawNum);
        if (numVal !== null) {
            const chnStr = numToChinese(numVal);
            const prefix = text.slice(0, m.index);
            const suffix = text.slice(m.index + m[0].length);

            [prefix, prefix.replace(/[-_－—·•．\s]/g, '')].forEach(pfx => {
                aliases.add(`${pfx}第${numVal}期${suffix}`.toLowerCase());
                aliases.add(`${pfx}${numVal}期${suffix}`.toLowerCase());
                aliases.add(`${pfx}第${chnStr}期${suffix}`.toLowerCase());
                aliases.add(`${pfx}${chnStr}期${suffix}`.toLowerCase());
                aliases.add(`${pfx}${numVal}${suffix}`.toLowerCase());
            });
        }
    }

    const roman = [
        [/\bX\b/gi, '10'], [/\bIX\b/gi, '9'], [/\bVIII\b/gi, '8'], [/\bVII\b/gi, '7'],
        [/\bVI\b/gi, '6'], [/\bV\b/gi, '5'], [/\bIV\b/gi, '4'], [/\bIII\b/gi, '3'],
        [/\bII\b/gi, '2'], [/\bI\b/gi, '1']
    ];
    let romVer = text;
    roman.forEach(([reg, rep]) => { romVer = romVer.replace(reg, rep); });
    aliases.add(romVer.toLowerCase());

    return Array.from(aliases).join(' ');
}

function classifyZoning(raw) {
    if (!raw) return {
        planType: '未提供',
        planTypeShort: '未提供',
        category: '未提供',
        urbanZone: null,
        urbanSubZone: null,
        nonUrbanZone: null,
        nonUrbanLandType: null,
        normalized: '未提供',
        badgeText: '未填寫分區',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
    };

    let s = String(raw).trim()
        .replace(/[\s\(\)\-_\/、]/g, '')
        .replace('甲總', '甲種')
        .replace('甲種建築用$', '甲種建築用地');

    const isNonUrban = s.includes('特定農業區') || s.includes('一般農業區') || s.includes('鄉村區') || s.includes('風景區') || (s.includes('工業區') && s.includes('丁種'));

    if (isNonUrban) {
        let nonUrbanZones = [];
        if (s.includes('特定農業區')) nonUrbanZones.push('特定農業區');
        if (s.includes('一般農業區')) nonUrbanZones.push('一般農業區');
        if (s.includes('鄉村區')) nonUrbanZones.push('鄉村區');
        if (s.includes('風景區')) nonUrbanZones.push('風景區');
        if (s.includes('工業區') && s.includes('丁種')) nonUrbanZones.push('工業區');

        let landTypes = [];
        if (s.includes('甲種')) landTypes.push('甲種建築用地');
        if (s.includes('乙種')) landTypes.push('乙種建築用地');
        if (s.includes('丙種')) landTypes.push('丙種建築用地');
        if (s.includes('丁種')) landTypes.push('丁種建築用地');

        let primaryCategory = '非都市土地';
        if (nonUrbanZones.includes('特定農業區') && landTypes.includes('甲種建築用地')) primaryCategory = '特定農業區甲種建築用地';
        else if (nonUrbanZones.includes('一般農業區') && landTypes.includes('甲種建築用地')) primaryCategory = '一般農業區甲種建築用地';
        else if (nonUrbanZones.includes('鄉村區') && landTypes.includes('乙種建築用地')) primaryCategory = '鄉村區乙種建築用地';
        else if (nonUrbanZones.includes('風景區') && landTypes.includes('丙種建築用地')) primaryCategory = '風景區丙種建築用地';
        else if (landTypes.includes('丁種建築用地')) primaryCategory = '工業區丁種建築用地';
        else primaryCategory = `${nonUrbanZones.join('/') || '非都市分區'}${landTypes.join('/') || ''}`;

        const zName = nonUrbanZones[0] || '非都市分區';
        const lName = landTypes[0] || '建築用地';

        return {
            planType: '都市計畫外 (非都市土地)',
            planTypeShort: '都市計畫外',
            category: primaryCategory,
            urbanZone: null,
            urbanSubZone: null,
            nonUrbanZone: zName,
            nonUrbanZones: nonUrbanZones,
            nonUrbanLandType: lName,
            nonUrbanLandTypes: landTypes,
            normalized: primaryCategory,
            badgeText: `非都 · ${zName} · ${lName.replace('建築用地', '建')}`,
            badgeColor: (lName === '甲種建築用地') ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        (lName === '乙種建築用地') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        (lName === '丙種建築用地') ? 'bg-teal-50 text-teal-800 border-teal-200' :
                        'bg-slate-100 text-slate-800 border-slate-200'
        };
    }

    let urbanCategory = '都市計畫內其他分區';
    let subType = '住宅區';

    if (s.includes('住宅區') || s.includes('住三') || s.includes('住二') || s.includes('住一') || s.includes('住四')) {
        urbanCategory = '住宅區';
        if (s.includes('第一種') || s.includes('住一')) subType = '第一種住宅區';
        else if (s.includes('第二種') || s.includes('住二')) subType = '第二種住宅區';
        else if (s.includes('第四種') || s.includes('住四')) subType = '第四種住宅區';
        else if (s.includes('住三')) subType = '第三種住宅區';
        else subType = '住宅區';
    } else if (s.includes('商業區')) {
        urbanCategory = '商業區';
        subType = '商業區';
    } else if (s.includes('乙種工業區') || s.includes('產業專') || s.includes('工商特定專用區')) {
        urbanCategory = '工業區/產業專用區';
        subType = '都市計畫工業區';
    } else if (s.includes('農業區') || s.includes('保護區')) {
        urbanCategory = '都市農業區/保護區';
        subType = '都市農業區';
    }

    return {
        planType: '都市計畫內 (都市土地)',
        planTypeShort: '都市計畫內',
        category: urbanCategory,
        urbanZone: subType,
        urbanSubZone: s,
        nonUrbanZone: null,
        nonUrbanZones: [],
        nonUrbanLandType: null,
        nonUrbanLandTypes: [],
        normalized: urbanCategory,
        badgeText: `都市計畫 · ${subType}`,
        badgeColor: (urbanCategory === '商業區') ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    (urbanCategory === '住宅區') ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    'bg-purple-50 text-purple-800 border-purple-200'
    };
}

function normalizeMainUse(use) {
    if (!use) return '其他';
    if (use.includes('住') || use.includes('店鋪') || use.includes('集合住宅')) return '住宅/住商用';
    if (use.includes('商') || use.includes('辦公') || use.includes('旅館')) return '商業/辦公用';
    if (use.includes('廠') || use.includes('工') || use.includes('作業廠房')) return '工業/廠房用';
    return use;
}

function normalizeMaterial(mat) {
    if (!mat) return '其他';
    if (mat.includes('鋼筋混凝土') || mat.includes('RC')) return 'RC (鋼筋混凝土)';
    if (mat.includes('鋼骨') || mat.includes('SC') || mat.includes('SS')) return 'SC/SS (鋼骨構造)';
    if (mat.includes('鋼骨鋼筋') || mat.includes('SRC')) return 'SRC (鋼骨鋼筋混凝土)';
    if (mat.includes('加強磚造')) return '加強磚造';
    return mat;
}

function cleanStr(s) {
    return (s || '')
        .replace(/[\s\-_－—·•．\?？\(\)（）\/]/g, '')
        .replace(/臺/g, '台')
        .toLowerCase();
}

async function syncLatestBuildcases() {
    console.log('🔄 [Step 1/5] 自動下載與同步內政部最新預售建案備查清冊 (g_lvr_buildcase.xls)...');

    // 1. Download latest XLS from MOI
    try {
        process.stdout.write('  下載備查清冊中... ');
        await downloadFile(BUILDCASE_URL, xlsPath);
        console.log(`✓ (檔案大小: ${(fs.statSync(xlsPath).size / 1024).toFixed(1)} KB)`);
    } catch (err) {
        console.warn(`  ⚠️ 線上下載失敗 (${err.message})，嘗試使用本地已有清冊檔案`);
        if (!fs.existsSync(xlsPath)) {
            throw new Error(`找不到備查清冊檔案：${xlsPath}`);
        }
    }

    // 2. Read and parse XLS
    const workbook = XLSX.readFile(xlsPath);
    const sheetMain = workbook.Sheets['預售屋備查'];
    const sheetLand = workbook.Sheets['坐落基地'];
    const sheetPermit = workbook.Sheets['建執照'];

    if (!sheetMain) {
        throw new Error('清冊格式異常：找不到「預售屋備查」工作表');
    }

    const rawMain = XLSX.utils.sheet_to_json(sheetMain, { header: 1 });
    const rawLand = sheetLand ? XLSX.utils.sheet_to_json(sheetLand, { header: 1 }) : [];
    const rawPermit = sheetPermit ? XLSX.utils.sheet_to_json(sheetPermit, { header: 1 }) : [];

    // Build lookup maps
    const landsByNumber = {};
    if (rawLand.length > 1) {
        for (let i = 1; i < rawLand.length; i++) {
            const row = rawLand[i];
            const num = row[0];
            const land = row[1];
            if (num && land) {
                if (!landsByNumber[num]) landsByNumber[num] = [];
                if (!landsByNumber[num].includes(land)) landsByNumber[num].push(land);
            }
        }
    }

    const permitsByNumber = {};
    if (rawPermit.length > 1) {
        for (let i = 1; i < rawPermit.length; i++) {
            const row = rawPermit[i];
            const num = row[0];
            const permitNo = row[1];
            const pDate = parseRocDate(row[2]);
            if (num && permitNo) {
                if (!permitsByNumber[num]) permitsByNumber[num] = [];
                permitsByNumber[num].push({
                    permitNo,
                    dateRaw: row[2],
                    rocFormatted: pDate.rocFormatted,
                    adDate: pDate.adDate
                });
            }
        }
    }

    // Read existing data.json
    let projects = [];
    if (fs.existsSync(dataJsonPath)) {
        projects = JSON.parse(fs.readFileSync(dataJsonPath, 'utf-8'));
    }

    let newProjectsCount = 0;

    for (let i = 1; i < rawMain.length; i++) {
        const row = rawMain[i];
        if (!row || !row[1] || row[1] === 'BUILDCASE' || row[1] === '建案名稱') continue;

        const town = (row[0] || '').trim();
        const caseName = (row[1] || '').trim();
        const permitNo = (row[12] || '').trim();
        const numberCode = (row[14] || '').trim();

        // Check if exists in projects
        const exists = projects.some(p => {
            if (numberCode && p.numberCode && numberCode === p.numberCode) return true;
            if (permitNo && p.permitNo && permitNo === p.permitNo && p.town === town) return true;
            if (p.town === town && cleanStr(p.caseName) === cleanStr(caseName)) return true;
            return false;
        });

        if (exists) {
            continue;
        }

        // New project found!
        const location = (row[2] || '').trim();
        const builder = (row[3] || '').trim();
        const householdRaw = (row[4] || '').trim();
        const useZoning = (row[5] || '').trim();
        const mainUse = (row[6] || '').trim();
        const mainMaterial = (row[7] || '').trim();
        const declareDateRaw = (row[8] || '').trim();
        const sellingPeriod = (row[9] || '').trim();
        const mainLand = (row[10] || '').trim();
        const permitDateRaw = (row[11] || '').trim();
        const firstRegDateRaw = (row[13] || '').trim();

        let household = null;
        const hMatch = householdRaw.match(/(\d+)\s*戶/);
        if (hMatch) household = parseInt(hMatch[1], 10);

        const declareDate = parseRocDate(declareDateRaw);
        const permitDate = parseRocDate(permitDateRaw);
        const firstRegDate = parseRocDate(firstRegDateRaw);

        let allLands = [];
        if (mainLand) allLands.push(mainLand);
        if (numberCode && landsByNumber[numberCode]) {
            landsByNumber[numberCode].forEach(l => {
                if (!allLands.includes(l)) allLands.push(l);
            });
        }

        let allPermits = [];
        if (permitNo || permitDateRaw) {
            allPermits.push({
                permitNo: permitNo,
                dateRaw: permitDateRaw,
                rocFormatted: permitDate.rocFormatted,
                adDate: permitDate.adDate
            });
        }
        if (numberCode && permitsByNumber[numberCode]) {
            permitsByNumber[numberCode].forEach(p => {
                const exists = allPermits.some(ap => ap.permitNo === p.permitNo && ap.dateRaw === p.dateRaw);
                if (!exists) allPermits.push(p);
            });
        }

        const zoningInfo = classifyZoning(useZoning);
        const normalizedUse = normalizeMainUse(mainUse);
        const normalizedMaterial = normalizeMaterial(mainMaterial);

        const caseAliases = generateSearchAliases(caseName);
        const builderAliases = generateSearchAliases(builder);

        const searchTokens = [
            town, caseName, caseAliases, location, builder, builderAliases,
            useZoning, zoningInfo.planType, zoningInfo.category, zoningInfo.normalized,
            mainUse, normalizedUse, mainMaterial, normalizedMaterial,
            permitNo, mainLand, sellingPeriod, numberCode,
            declareDate.rocFormatted, permitDate.rocFormatted,
            ...allLands,
            ...allPermits.map(p => `${p.permitNo} ${p.rocFormatted}`)
        ].filter(Boolean).join(' ').toLowerCase();

        const newId = projects.length + 1;
        const newProj = {
            id: newId,
            numberCode,
            town,
            caseName,
            location,
            builder,
            household,
            householdRaw,
            useZoning,
            zoningInfo,
            mainUse,
            normalizedUse,
            mainMaterial,
            normalizedMaterial,
            sellingPeriod,
            mainLand,
            allLands,
            permitNo,
            permitDateRaw,
            permitDate: permitDate.rocFormatted,
            permitDateAd: permitDate.adDate,
            permitYearRoc: permitDate.yearRoc,
            permitYearAd: permitDate.yearAd,
            declareDateRaw,
            declareDate: declareDate.rocFormatted,
            declareDateAd: declareDate.adDate,
            declareYearRoc: declareDate.yearRoc,
            declareYearAd: declareDate.yearAd,
            firstRegDateRaw,
            firstRegDate: firstRegDate.rocFormatted,
            firstRegDateAd: firstRegDate.adDate,
            allPermits,
            searchTokens,
            salesStats: {
                hasSalesData: false,
                soldUnits: 0,
                rawTxCount: 0,
                residentialCount: 0,
                parkingCount: 0,
                presaleCount: 0,
                completedCount: 0,
                totalHouseholds: household || 0,
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
            },
            landStats: {
                hasLandData: false,
                txCount: 0,
                latestLandDate: '',
                avgLandPricePerPing: 0,
                minLandPrice: 0,
                maxLandPrice: 0,
                totalLandCostWan: 0,
                totalLandAreaPing: 0,
                transactions: []
            }
        };

        projects.push(newProj);
        newProjectsCount++;
        console.log(`  + 發現新增建案：[${town}] ${caseName} (編號: ${numberCode || permitNo || '--'})`);
    }

    if (newProjectsCount > 0) {
        fs.writeFileSync(dataJsonPath, JSON.stringify(projects, null, 2), 'utf-8');
        console.log(`✓ 備查清冊同步完成：新增 ${newProjectsCount} 筆建案，總建案數：${projects.length} 案`);
    } else {
        console.log(`✓ 備查清冊已為最新狀態：目前共 ${projects.length} 筆建案 (無新增案件)`);
    }

    return { totalCases: projects.length, newCasesAdded: newProjectsCount };
}

if (require.main === module) {
    syncLatestBuildcases().catch(err => {
        console.error('Error syncing buildcases:', err);
        process.exit(1);
    });
}

module.exports = { syncLatestBuildcases };
