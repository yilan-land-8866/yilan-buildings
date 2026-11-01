// 修正內政部清冊中無法以 Big5 表示而被輸出成「?」、U+FFFD 或私用區 (PUA) 字元的名稱。
// 1) scripts/name_fixes.json 人工查證的覆寫表（以 numberCode 為鍵）
// 2) 起造人（建商）名稱含「?」時，自動查宜蘭縣建築執照開放資料（UTF-8）比對同一建照字號取得正確字
const fs = require('fs');
const path = require('path');
const https = require('https');

const FIXES_PATH = path.join(__dirname, 'name_fixes.json');
const NAME_FIELDS = ['town', 'caseName', 'builder', 'location'];
const BAD_CHAR_RE = /[?\uFFFD\uE000-\uF8FF]/;

function hasBadChars(s) {
    return typeof s === 'string' && BAD_CHAR_RE.test(s);
}

function loadFixes() {
    try {
        return JSON.parse(fs.readFileSync(FIXES_PATH, 'utf-8')).byNumberCode || {};
    } catch (e) {
        return {};
    }
}

function saveFix(numberCode, field, value, source) {
    if (!numberCode) return;
    let doc = { byNumberCode: {} };
    try { doc = JSON.parse(fs.readFileSync(FIXES_PATH, 'utf-8')); } catch (e) {}
    doc.byNumberCode = doc.byNumberCode || {};
    const entry = doc.byNumberCode[numberCode] = doc.byNumberCode[numberCode] || {};
    entry[field] = value;
    entry._source = [entry._source, source].filter(Boolean).join('；');
    fs.writeFileSync(FIXES_PATH, JSON.stringify(doc, null, 2) + '\n', 'utf-8');
}

function escapeRe(s) {
    return s.replace(/[.*+^${}()|[\]\\\/]/g, '\\$&');
}

// 將含錯字的名稱轉成比對用正規式：「?」/U+FFFD/PUA 各代表任一個字
function patternFromBad(name) {
    return new RegExp(Array.from(name).map(ch => BAD_CHAR_RE.test(ch) ? '([^\\s?])' : escapeRe(ch)).join(''));
}

function httpGetJson(url, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
            if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
                try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8'))); } catch (e) { reject(e); }
            });
        });
        req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
        req.on('error', reject);
    });
}

// 民國日期 1140725 -> "(114)(7)(25)"
function rocToPermitPrefix(raw) {
    const m = String(raw || '').match(/^(\d{2,3})(\d{2})(\d{2})$/);
    if (!m) return '';
    return `(${parseInt(m[1], 10)})(${parseInt(m[2], 10)})(${parseInt(m[3], 10)})`;
}

// 依建照字號查宜蘭縣建築執照開放資料，找出符合「?」樣式的起造人名稱
async function resolveBuilderFromPermit(badBuilder, permits) {
    const re = patternFromBad(badBuilder);
    const found = new Set();
    for (const p of permits || []) {
        if (!p || !p.permitNo) continue;
        const prefix = rocToPermitPrefix(p.dateRaw);
        const url = 'https://building.e-land.gov.tw/opendata/OpenDataSearchUrl.do?d=OPENDATA&c=BUILDLIC&Start=1&'
            + encodeURIComponent('核發執照字號') + '=' + encodeURIComponent('.*' + escapeRe(p.permitNo));
        let json;
        try { json = await httpGetJson(url); } catch (e) { console.warn(`  ⚠️ 建照開放資料查詢失敗 (${p.permitNo})：${e.message}`); continue; }
        for (const rec of (json && json.data) || []) {
            const no = rec['核發執照字號'] || '';
            if (prefix && !no.startsWith(prefix)) continue;
            const m = (rec['起造人代表人'] || '').match(re);
            if (m && !hasBadChars(m[0])) found.add(m[0]);
        }
        if (found.size) break;
    }
    return found.size === 1 ? Array.from(found)[0] : null;
}

// 將覆寫表套用到 projects（含既有建案），同步更新 searchTokens。回傳修改筆數。
function applyNameFixes(projects, generateSearchAliases) {
    const fixes = loadFixes();
    let changed = 0;
    for (const p of projects) {
        const fix = p.numberCode && fixes[p.numberCode];
        if (!fix) continue;
        for (const field of NAME_FIELDS) {
            const newVal = fix[field];
            const oldVal = p[field];
            if (!newVal || !oldVal || oldVal === newVal) continue;
            if (!hasBadChars(oldVal) && field !== 'caseName' && field !== 'builder') continue;
            p[field] = newVal;
            if (field === 'caseName' && p._caseNameNorm !== undefined) {
                p._caseNameNorm = String(p._caseNameNorm).split(oldVal).join(newVal);
            }
            if (typeof p.searchTokens === 'string') {
                const pairs = [[oldVal.toLowerCase(), newVal.toLowerCase()]];
                if (generateSearchAliases) {
                    const a = generateSearchAliases(oldVal).split(' ');
                    const b = generateSearchAliases(newVal).split(' ');
                    if (a.length === b.length) a.forEach((x, i) => pairs.push([x, b[i]]));
                }
                pairs.sort((x, y) => y[0].length - x[0].length);
                for (const [o, n] of pairs) if (o) p.searchTokens = p.searchTokens.split(o).join(n);
            }
            changed++;
            console.log(`  ✎ 名稱修正 [${p.numberCode}] ${field}: ${JSON.stringify(oldVal)} → ${newVal}`);
        }
    }
    return changed;
}

function reportBadNames(projects) {
    const bad = [];
    for (const p of projects) {
        for (const field of NAME_FIELDS) {
            if (hasBadChars(p[field])) bad.push(`[${p.id}] ${p.town || ''} ${p.caseName}：${field}=${JSON.stringify(p[field])}`);
        }
    }
    if (bad.length) {
        console.warn(`  ⚠️ 仍有 ${bad.length} 個名稱含「?」/亂碼/私用區字元，請查證後寫入 scripts/name_fixes.json：`);
        bad.forEach(b => console.warn('     ' + b));
    }
    return bad;
}

module.exports = { hasBadChars, loadFixes, saveFix, applyNameFixes, reportBadNames, resolveBuilderFromPermit, patternFromBad };
