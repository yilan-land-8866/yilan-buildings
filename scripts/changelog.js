// 每期更新日誌：比對前後兩版 data.json，產生並寫入 changelog.json
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const changelogPath = path.join(rootDir, 'changelog.json');

function txKey(t) {
    return [t.source, t.dateRoc, t.unit, t.floor, t.areaPing, t.totalPrice, t.pricePerPing, t.isParking ? 1 : 0].join('|');
}
function rocToNum(s) { return Number(String(s || '').replace(/\D/g, '')) || 0; }

function computeDiff(oldProjects, newProjects) {
    const oldByCode = new Map(oldProjects.map(p => [p.numberCode || p.caseName, p]));
    const newByCode = new Map(newProjects.map(p => [p.numberCode || p.caseName, p]));
    const brief = p => ({ caseName: p.caseName, town: p.town, builder: p.builder || '', household: p.household || 0 });
    const addedCases = [...newByCode.keys()].filter(k => !oldByCode.has(k)).map(k => brief(newByCode.get(k)));
    const removedCases = [...oldByCode.keys()].filter(k => !newByCode.has(k)).map(k => brief(oldByCode.get(k)));

    const byCase = [];
    let minD = null, maxD = null, total = 0;
    for (const [code, p] of newByCode) {
        const oldP = oldByCode.get(code);
        const count = new Map();
        ((oldP && oldP.salesStats && oldP.salesStats.transactions) || []).forEach(t => {
            const k = txKey(t); count.set(k, (count.get(k) || 0) + 1);
        });
        const added = [];
        ((p.salesStats && p.salesStats.transactions) || []).forEach(t => {
            const k = txKey(t);
            if (count.get(k) > 0) count.set(k, count.get(k) - 1); else added.push(t);
        });
        const presale = added.filter(t => t.source === '預售屋實登' && !t.isParking);
        if (!presale.length) continue;
        presale.forEach(t => {
            const n = rocToNum(t.dateRoc);
            if (minD === null || n < rocToNum(minD)) minD = t.dateRoc;
            if (maxD === null || n > rocToNum(maxD)) maxD = t.dateRoc;
        });
        total += presale.length;
        const prices = presale.map(t => t.pricePerPing).filter(Number.isFinite);
        byCase.push({
            caseName: p.caseName, town: p.town, count: presale.length,
            minPricePerPing: prices.length ? Math.min(...prices) : null,
            maxPricePerPing: prices.length ? Math.max(...prices) : null
        });
    }
    byCase.sort((a, b) => b.count - a.count || a.town.localeCompare(b.town, 'zh-Hant'));
    const byTown = {};
    byCase.forEach(c => { byTown[c.town] = (byTown[c.town] || 0) + c.count; });

    return {
        totalCases: newProjects.length,
        addedCases, removedCases,
        presaleTx: { total, caseCount: byCase.length, tradeDateFrom: minD, tradeDateTo: maxD, byTown, byCase }
    };
}

function parseReleaseNote(note) {
    if (!note) return {};
    const r = {};
    const m1 = note.match(/登記日期\s*(\d+)年(\d+)月(\d+)日至\s*(\d+)年(\d+)月(\d+)日之買賣/);
    if (m1) r.saleRegPeriod = `${m1[1]}/${m1[2]}/${m1[3]}–${m1[4]}/${m1[5]}/${m1[6]}`;
    const m2 = note.match(/交易日期\s*(\d+)年(\d+)月(\d+)日至\s*(\d+)年(\d+)月(\d+)日之預售屋/);
    if (m2) r.presalePeriod = `${m2[1]}/${m2[2]}/${m2[3]}–${m2[4]}/${m2[5]}/${m2[6]}`;
    return r;
}

function mergeInto(entry, prev) {
    const key = c => c.town + '|' + c.caseName;
    const add = new Map(prev.addedCases.map(c => [key(c), c]));
    entry.addedCases.forEach(c => add.set(key(c), c));
    const rem = new Map(prev.removedCases.map(c => [key(c), c]));
    entry.removedCases.forEach(c => rem.set(key(c), c));
    entry.addedCases = [...add.values()];
    entry.removedCases = [...rem.values()];
    const cases = new Map(prev.presaleTx.byCase.map(c => [key(c), { ...c }]));
    entry.presaleTx.byCase.forEach(c => {
        const o = cases.get(key(c));
        if (!o) { cases.set(key(c), { ...c }); return; }
        o.count += c.count;
        o.minPricePerPing = Math.min(...[o.minPricePerPing, c.minPricePerPing].filter(Number.isFinite));
        o.maxPricePerPing = Math.max(...[o.maxPricePerPing, c.maxPricePerPing].filter(Number.isFinite));
    });
    const byCase = [...cases.values()].sort((a, b) => b.count - a.count || a.town.localeCompare(b.town, 'zh-Hant'));
    const byTown = {};
    byCase.forEach(c => { byTown[c.town] = (byTown[c.town] || 0) + c.count; });
    const ds = [prev.presaleTx.tradeDateFrom, prev.presaleTx.tradeDateTo, entry.presaleTx.tradeDateFrom, entry.presaleTx.tradeDateTo].filter(Boolean).sort((a, b) => rocToNum(a) - rocToNum(b));
    entry.presaleTx = { total: prev.presaleTx.total + entry.presaleTx.total, caseCount: byCase.length,
        tradeDateFrom: ds[0] || null, tradeDateTo: ds[ds.length - 1] || null, byTown, byCase };
    entry.mergedRuns = (prev.mergedRuns || 1) + 1;
}

function hasChange(diff) {
    return diff && (diff.addedCases.length || diff.removedCases.length || diff.presaleTx.total);
}

function loadChangelog() {
    try { return JSON.parse(fs.readFileSync(changelogPath, 'utf-8')); } catch (e) { return { entries: [] }; }
}

// release: 'YYYY/MM/DD'（台灣時間）。同一天只保留一筆：已有實際變動者不會被「無新資料」覆蓋。
function upsertEntry({ release, diff, releaseNote, dryRun = false }) {
    const log = loadChangelog();
    const changed = !!hasChange(diff);
    const entry = {
        release,
        noNewData: !changed,
        summary: changed ? undefined : '本期無新資料',
        moiNote: releaseNote || '',
        ...parseReleaseNote(releaseNote),
        ...(diff || {}),
        generatedAt: new Date().toISOString()
    };
    if (!diff) delete entry.totalCases;
    const idx = log.entries.findIndex(e => e.release === release);
    if (idx >= 0) {
        const prev = log.entries[idx];
        if (!changed) {
            console.log(`ℹ️ 更新日誌：${release} 已有紀錄，保留原內容。`);
            return log;
        }
        if (!prev.noNewData && prev.presaleTx) {
            // 同日第二次執行（例如 15:30 補正）又有變動：與上午的差異合併，不重複列一筆
            mergeInto(entry, prev);
        }
        if (prev.remark && !entry.remark) entry.remark = prev.remark;
        log.entries[idx] = entry;
    } else {
        log.entries.push(entry);
    }
    log.entries.sort((a, b) => b.release.localeCompare(a.release));
    log.updatedAt = new Date().toISOString();
    if (!dryRun) fs.writeFileSync(changelogPath, JSON.stringify(log, null, 2) + '\n', 'utf-8');
    console.log(`📝 更新日誌：${release} ${changed ? `新增預售成交 ${diff.presaleTx.total} 筆／${diff.presaleTx.caseCount} 案，建案備查 +${diff.addedCases.length} −${diff.removedCases.length}` : '本期無新資料'}${dryRun ? '（dry run，未寫入）' : ''}`);
    return log;
}

function taipeiDate(d = new Date()) {
    const s = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }); // YYYY-MM-DD
    return s.replace(/-/g, '/');
}

module.exports = { computeDiff, parseReleaseNote, upsertEntry, taipeiDate, changelogPath };

if (require.main === module) {
    // node scripts/changelog.js <old.json> <new.json> <YYYY/MM/DD> [noteFile] [--write]
    const [oldF, newF, release, noteF] = process.argv.slice(2).filter(a => !a.startsWith('--'));
    const diff = computeDiff(JSON.parse(fs.readFileSync(oldF, 'utf-8')), JSON.parse(fs.readFileSync(newF, 'utf-8')));
    const note = noteF && fs.existsSync(noteF) ? fs.readFileSync(noteF, 'utf-8').trim() : '';
    const write = process.argv.includes('--write');
    upsertEntry({ release, diff, releaseNote: note, dryRun: !write });
    if (!write) console.log(JSON.stringify(diff, null, 1).slice(0, 3000));
}
