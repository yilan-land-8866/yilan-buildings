const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const jsonPath = path.join(rootDir, 'data.json');
const buildersDbPath = path.join(rootDir, 'builders_database.json');
const htmlPath = path.join(rootDir, '宜蘭建案檢索系統.html');
const indexPath = path.join(rootDir, 'index.html');

function buildHTML() {
    console.log('📄 [Step 3/4] 編譯產生 index.html 與 宜蘭建案檢索系統.html...');
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const buildersData = fs.readFileSync(buildersDbPath, 'utf-8');


const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>宜蘭縣預售屋建案備查與實價登錄銷售檢索系統</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;700;900&family=Noto+Sans+TC:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --wabi-bg: #F6F3ED;
            --wabi-surface: #FFFFFF;
            --wabi-card-bg: #FFFFFF;
            --wabi-border: #DCD4C5;
            --wabi-border-subtle: #EBE5DA;
            --wabi-ink: #1C1B18;
            --wabi-ink-secondary: #423E37;
            --wabi-ink-muted: #6E675B;
            --wabi-clay: #7A5338;
            --wabi-clay-bg: #F7EFE8;
            --wabi-moss: #4A5D44;
            --wabi-moss-bg: #EEF4EC;
        }

        html {
            font-size: 16px;
        }
        @media (max-width: 640px) {
            html { font-size: 14.5px; }
        }
        @media (min-width: 1536px) {
            html { font-size: 16.5px; }
        }

        body {
            font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--wabi-bg);
            color: var(--wabi-ink);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
        }

        .font-serif-tc {
            font-family: 'Noto Serif TC', 'Noto Sans TC', serif;
        }

        /* Fluid Container with Safe Edge Margin */
        .fluid-container {
            width: 100%;
            max-width: 1400px;
            margin-left: auto;
            margin-right: auto;
            padding-left: clamp(0.75rem, 2.5vw, 2rem);
            padding-right: clamp(0.75rem, 2.5vw, 2rem);
        }

        /* Fluid Card Grids */
        .fluid-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(clamp(280px, 28vw, 380px), 1fr));
            gap: clamp(1rem, 1.6vw, 1.5rem);
        }

        .builders-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(clamp(300px, 30vw, 420px), 1fr));
            gap: clamp(1rem, 1.6vw, 1.5rem);
        }

        /* Wabi Sabi Card */
        .wabi-card {
            background-color: #FFFFFF;
            border: 1px solid #DCD4C5;
            border-radius: clamp(1rem, 1.4vw, 1.3rem);
            padding: clamp(1.15rem, 1.8vw, 1.5rem);
            box-shadow: 0 3px 12px rgba(45, 40, 30, 0.03);
            transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .wabi-card:hover {
            transform: translateY(-3px);
            border-color: #BAAF9C;
            box-shadow: 0 12px 28px rgba(45, 40, 30, 0.075);
        }

        /* Badges */
        .badge {
            display: inline-flex;
            align-items: center;
            padding: 0.28rem clamp(0.55rem, 0.8vw, 0.8rem);
            border-radius: 9999px;
            font-size: clamp(0.76rem, 0.15vw + 0.75rem, 0.86rem);
            font-weight: 600;
            letter-spacing: 0.02em;
            line-height: 1.25;
        }

        /* Township Pills */
        .town-btn {
            background-color: #FFFFFF;
            color: #423E37;
            border: 1px solid #DCD4C5;
            padding: 0.38rem clamp(0.65rem, 0.9vw, 0.9rem);
            border-radius: 9999px;
            font-size: clamp(0.8rem, 0.15vw + 0.78rem, 0.88rem);
            font-weight: 600;
            transition: all 0.18s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            white-space: nowrap;
        }
        .town-btn:hover {
            background-color: #EAE4D8;
            color: #1C1B18;
            border-color: #BAAF9C;
        }
        .town-btn.active {
            background-color: #1C1B18;
            color: #FFFFFF;
            border-color: #1C1B18;
            box-shadow: 0 3px 10px rgba(28, 27, 24, 0.16);
        }

        /* Sorter Toggle Button */
        .sort-toggle-btn {
            background-color: #FFFFFF;
            color: #38342D;
            border: 1px solid #DCD4C5;
            padding: 0.38rem clamp(0.6rem, 0.8vw, 0.85rem);
            border-radius: 0.75rem;
            font-size: clamp(0.78rem, 0.15vw + 0.76rem, 0.86rem);
            font-weight: 600;
            transition: all 0.18s ease;
            user-select: none;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            white-space: nowrap;
        }
        .sort-toggle-btn:hover {
            background-color: #EAE4D8;
            color: #1C1B18;
            border-color: #BAAF9C;
        }
        .sort-toggle-btn.active {
            background-color: #1C1B18;
            color: #FFFFFF;
            border-color: #1C1B18;
            box-shadow: 0 3px 10px rgba(28, 27, 24, 0.14);
        }
        .sort-toggle-btn.active .sort-arrow {
            color: #E5C392;
        }
        .sort-toggle-btn.active .sort-icon {
            color: #E5C392;
        }

        .sortable-th {
            cursor: pointer;
            user-select: none;
            transition: all 0.15s ease;
        }
        .sortable-th:hover {
            background-color: #E6DFD2;
            color: #1C1B18;
        }
        .sortable-th.active-sort {
            background-color: #DDD4C4;
            color: #1C1B18;
            font-weight: 700;
        }

        /* Progress Bar Animation */
        .progress-bar-fill {
            transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #EAE4D8;
        }
        ::-webkit-scrollbar-thumb {
            background: #C4B9A7;
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #A09480;
        }
        @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { background: white; }
        }
    </style>
</head>
<body class="antialiased min-h-screen flex flex-col selection:bg-[#DCD3C3] selection:text-[#1C1B18]">

    <!-- Top Navigation / Header -->
    <header class="bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#DCD4C5] sticky top-0 z-30 shadow-xs">
        <div class="fluid-container">
            <div class="flex items-center justify-between h-18 sm:h-20 py-2.5">
                <!-- Logo & Title -->
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#1C1B18] flex items-center justify-center text-[#FAF8F5] font-serif-tc font-black text-lg sm:text-xl shadow-sm border border-[#38342D] shrink-0">
                        宜
                    </div>
                    <div>
                        <h1 class="text-base sm:text-2xl font-serif-tc font-black tracking-wide text-[#1C1B18]">
                            宜蘭縣建案備查與實價登錄檢索系統
                        </h1>
                        <p class="text-xs sm:text-sm text-[#6E675B] hidden md:block font-normal">
                            整合預售屋申報備查、實價登錄銷售率、成交單價區間與建商負責人資料庫
                        </p>
                    </div>
                </div>

                <!-- Navigation Tabs & Actions -->
                <div class="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
                    <!-- 1. 建案檢索 Tab -->
                    <button id="tabSearchBtn" onclick="switchView('search')" class="px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#1C1B18] text-[#FAF8F5] flex items-center gap-1.5 transition shadow-xs">
                        <svg class="w-4 h-4 text-[#E5C392]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <span>建案檢索</span>
                    </button>
                    
                    <!-- 2. 建商名冊 Tab -->
                    <button id="tabBuildersBtn" onclick="switchView('builders')" class="px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-[#38342D] hover:bg-[#EAE4D8] border border-[#DCD4C5] bg-[#FFFFFF] flex items-center gap-1.5 transition">
                        <svg class="w-4 h-4 text-[#7A5338]" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        <span>建商名冊</span>
                    </button>

                    <!-- 3. 行情統計 Tab -->
                    <button id="tabStatsBtn" onclick="switchView('stats')" class="px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-[#38342D] hover:bg-[#EAE4D8] border border-[#DCD4C5] bg-[#FFFFFF] flex items-center gap-1.5 transition">
                        <svg class="w-4 h-4 text-[#4A5D44]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
                        <span class="hidden sm:inline">行情統計</span>
                        <span class="sm:hidden">統計</span>
                    </button>

                    <!-- Export Excel -->
                    <button onclick="exportCurrentViewToExcel()" title="匯出 Excel" class="px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#FFFFFF] text-[#3E523A] border border-[#C5D4C2] hover:bg-[#EEF4EC] flex items-center gap-1.5 transition shadow-xs">
                        <svg class="w-4 h-4 text-[#4A5D44]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                        <span class="hidden sm:inline">匯出</span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content Container -->
    <main class="fluid-container py-6 flex-1 w-full">

        <!-- KPI Metrics Banner (簡潔流體卡片 - 隨篩選條件動態連動) -->
        <section class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4.5 mb-6">
            
            <!-- 1. 建案備查總數 -->
            <div class="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#DCD4C5] shadow-xs flex items-center justify-between transition-all duration-200">
                <div>
                    <p id="kpiLabelTotalCases" class="text-xs font-semibold text-[#6E675B] uppercase tracking-wider truncate max-w-[140px] sm:max-w-none">建案備查總數</p>
                    <h3 id="kpiTotalCases" class="text-2xl sm:text-3xl font-serif-tc font-bold text-[#1C1B18] mt-0.5">--</h3>
                </div>
                <div class="w-10 h-10 rounded-xl bg-[#F7EFE8] text-[#7A5338] flex items-center justify-center border border-[#DECDBE] shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-9h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.75a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5V21"/></svg>
                </div>
            </div>

            <!-- 2. 實登已售總戶數 -->
            <div class="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#DCD4C5] shadow-xs flex items-center justify-between transition-all duration-200">
                <div>
                    <p class="text-xs font-semibold text-[#6E675B] uppercase tracking-wider flex items-center gap-1">
                        <span id="kpiLabelSoldUnits">實登已售總戶數</span>
                        <span id="kpiOverallSalesRate" class="text-[11px] font-bold text-[#4A5D44] bg-[#EEF4EC] px-1.5 py-0.2 rounded-md transition-all">--%</span>
                    </p>
                    <h3 id="kpiTotalSoldUnits" class="text-2xl sm:text-3xl font-serif-tc font-bold text-[#4A5D44] mt-0.5">--</h3>
                </div>
                <div class="w-10 h-10 rounded-xl bg-[#EEF4EC] text-[#4A5D44] flex items-center justify-center border border-[#C9DAC5] shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
            </div>

            <!-- 3. 實登平均單價 -->
            <div class="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#DCD4C5] shadow-xs flex items-center justify-between transition-all duration-200">
                <div>
                    <p id="kpiLabelAvgPrice" class="text-xs font-semibold text-[#6E675B] uppercase tracking-wider truncate max-w-[140px] sm:max-w-none">實登平均單價</p>
                    <h3 id="kpiAvgUnitPrice" class="text-2xl sm:text-3xl font-serif-tc font-bold text-[#7A5338] mt-0.5">--</h3>
                </div>
                <div class="w-10 h-10 rounded-xl bg-[#F8F3E6] text-[#8C6D2B] flex items-center justify-center border border-[#E5D7B3] shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
            </div>

            <!-- 4. 申報總戶數 -->
            <div class="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#DCD4C5] shadow-xs flex items-center justify-between transition-all duration-200">
                <div>
                    <p id="kpiLabelTotalHouseholds" class="text-xs font-semibold text-[#6E675B] uppercase tracking-wider truncate max-w-[140px] sm:max-w-none">申報總戶數</p>
                    <h3 id="kpiTotalHouseholds" class="text-2xl sm:text-3xl font-serif-tc font-bold text-[#1C1B18] mt-0.5">--</h3>
                    <p id="kpiTotalHouseholdsSub" class="text-[11px] text-[#4A5D44] font-semibold">已銷售 -- 戶</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-[#EEF3F7] text-[#3D5266] flex items-center justify-center border border-[#C5D5E2] shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v6M12 3v18"/></svg>
                </div>
            </div>
        </section>

        <!-- VIEW 1: SEARCH & FILTER VIEW (建案檢索) -->
        <div id="searchView">
            <!-- Search & Filter Card (精簡極簡化版面) -->
            <div class="bg-[#FFFFFF] rounded-2xl sm:rounded-3xl border border-[#DCD4C5] shadow-xs p-4 sm:p-6 mb-6 space-y-4">
                <!-- 1. Main Search Bar (簡潔 Placeholder) -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-[#736B5E]">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <input 
                        type="text" 
                        id="globalKeyword" 
                        placeholder="請搜尋案名、建設公司、負責人、街道..." 
                        class="w-full pl-12 sm:pl-14 pr-24 sm:pr-28 py-3 sm:py-3.5 bg-[#FAF8F5] border border-[#D0C7B8] rounded-xl sm:rounded-2xl text-sm sm:text-base text-[#1C1B18] placeholder-[#7A7366] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#7A5338]/40 focus:border-[#7A5338] transition font-medium"
                        oninput="debounceSearch()"
                    >
                    <button 
                        onclick="clearKeyword()" 
                        id="clearKeywordBtn" 
                        class="hidden absolute inset-y-0 right-20 sm:right-24 px-2 flex items-center text-[#7A7366] hover:text-[#1C1B18]"
                        title="清除輸入"
                    >
                        ✕
                    </button>
                    <button 
                        onclick="performSearch()" 
                        class="absolute inset-y-1.5 sm:inset-y-2 right-1.5 sm:right-2 px-4 sm:px-5 bg-[#1C1B18] hover:bg-[#38342D] text-[#FAF8F5] font-semibold rounded-lg sm:rounded-xl text-xs sm:text-sm transition shadow-xs"
                    >
                        檢索
                    </button>
                </div>

                <!-- 2. Township Quick Filter Pills (乾淨橫向滑動) -->
                <div class="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none" id="townPillsContainer">
                    <!-- Populated by JavaScript -->
                </div>

                <!-- 3. Core Quick Dropdowns Row (精簡整合) -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#EBE5DA]">
                    
                    <!-- 土地使用分區 -->
                    <div>
                        <select id="filterUnifiedZoning" class="w-full text-xs sm:text-sm bg-[#FAF8F5] border border-[#D0C7B8] rounded-xl p-2.5 text-[#1C1B18] focus:bg-[#FFFFFF] focus:outline-none font-medium" onchange="performSearch()">
                            <option value="">全部土地分區 (不限)</option>
                            <optgroup label="── 非都市土地 (都市計畫外) ──">
                                <option value="nonurban_all">全部非都市土地 (337 案)</option>
                                <option value="特定農業區甲種建築用地">特定農業區 · 甲種建築用地 (257 案)</option>
                                <option value="鄉村區乙種建築用地">鄉村區 · 乙種建築用地 (52 案)</option>
                                <option value="一般農業區甲種建築用地">一般農業區 · 甲種建築用地 (19 案)</option>
                                <option value="工業區丁種建築用地">工業區 · 丁種建築用地 (6 案)</option>
                                <option value="風景區丙種建築用地">風景區 · 丙種建築用地 (3 案)</option>
                            </optgroup>
                            <optgroup label="── 都市土地 (都市計畫內) ──">
                                <option value="urban_all">全部都市計畫內 (240 案)</option>
                                <option value="住宅區">住宅區 (含住一、住二、住四) (187 案)</option>
                                <option value="都市計畫農業區">都市計畫農業區 (38 案)</option>
                                <option value="商業區">商業區 (10 案)</option>
                                <option value="工業/產業專用區">工業區 / 產業專用區 (4 案)</option>
                                <option value="特定專用區">特定專用區 (1 案)</option>
                            </optgroup>
                        </select>
                    </div>

                    <!-- 起造建商 -->
                    <div>
                        <select id="filterBuilder" class="w-full text-xs sm:text-sm bg-[#FAF8F5] border border-[#D0C7B8] rounded-xl p-2.5 text-[#1C1B18] focus:bg-[#FFFFFF] focus:outline-none font-medium" onchange="performSearch()">
                            <option value="">全部建設公司 (不限)</option>
                        </select>
                    </div>

                    <!-- 實價登錄銷售進度 -->
                    <div>
                        <select id="filterSalesRate" class="w-full text-xs sm:text-sm bg-[#FAF8F5] border border-[#D0C7B8] rounded-xl p-2.5 text-[#1C1B18] focus:bg-[#FFFFFF] focus:outline-none font-medium" onchange="performSearch()">
                            <option value="">全部實登銷售進度 (不限)</option>
                            <option value="100">已完銷 100% (55 案)</option>
                            <option value="90">熱銷 90% 以上 (接近完銷)</option>
                            <option value="60-89">銷售 60% ~ 89% (熱賣中)</option>
                            <option value="1-59">銷售 1% ~ 59% (銷售中)</option>
                            <option value="has_sales">已有實價登錄成交 (455 案)</option>
                            <option value="no_sales">尚無實登交易紀錄 (122 案)</option>
                        </select>
                    </div>
                </div>

                <!-- 4. Advanced Filter Toggle Bar -->
                <div class="flex items-center justify-between text-xs sm:text-sm pt-1">
                    <button 
                        type="button" 
                        onclick="toggleAdvancedFilters()" 
                        class="font-semibold text-[#7A5338] hover:text-[#4A2F1C] flex items-center gap-1.5 py-1 transition"
                    >
                        <svg id="advFilterArrow" class="w-3.5 h-3.5 transform transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                        <span id="advFilterText">更多進階條件 (單價行情 / 用途 / 年份 / 戶數)</span>
                        <span id="activeFilterBadge" class="hidden bg-[#EFEAE1] text-[#5C4530] px-2 py-0.2 rounded-full text-[11px] font-bold border border-[#D5C7B5]">已篩選</span>
                    </button>
                    <button 
                        type="button" 
                        onclick="resetAllFilters()" 
                        class="text-[#6E675B] hover:text-[#992E2E] font-medium flex items-center gap-1 py-1 transition text-xs"
                    >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        重設
                    </button>
                </div>

                <!-- Advanced Extra Drawer -->
                <div id="advancedFiltersBox" class="hidden grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-[#EBE5DA]">
                    <div>
                        <label class="block text-xs font-semibold text-[#38342D] mb-1">成交單價行情</label>
                        <select id="filterPriceRange" class="w-full text-xs bg-[#FAF8F5] border border-[#D0C7B8] rounded-lg p-2 text-[#1C1B18]" onchange="performSearch()">
                            <option value="">全部單價區間</option>
                            <option value="40_up">40 萬/坪 以上</option>
                            <option value="30_40">30 ~ 40 萬/坪</option>
                            <option value="20_30">20 ~ 30 萬/坪</option>
                            <option value="20_down">20 萬/坪 以下</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-[#38342D] mb-1">主要用途</label>
                        <select id="filterMainUse" class="w-full text-xs bg-[#FAF8F5] border border-[#D0C7B8] rounded-lg p-2 text-[#1C1B18]" onchange="performSearch()">
                            <option value="">全部用途</option>
                            <option value="純住宅用">純住宅用</option>
                            <option value="住商用 (含店面)">住商用 / 含店面</option>
                            <option value="商辦/倉儲">商辦 / 倉儲</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-[#38342D] mb-1">建照核發年份</label>
                        <select id="filterPermitYear" class="w-full text-xs bg-[#FAF8F5] border border-[#D0C7B8] rounded-lg p-2 text-[#1C1B18]" onchange="performSearch()">
                            <option value="">全部年份</option>
                            <option value="115">民國 115 年</option>
                            <option value="114">民國 114 年</option>
                            <option value="113">民國 113 年</option>
                            <option value="112">民國 112 年</option>
                            <option value="111">民國 111 年</option>
                            <option value="110">民國 110 年</option>
                            <option value="109">民國 109 年</option>
                            <option value="108">民國 108 年</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-[#38342D] mb-1">戶數規模區間</label>
                        <div class="flex items-center space-x-1.5">
                            <input type="number" id="filterMinUnits" placeholder="最小" class="w-1/2 text-xs bg-[#FAF8F5] border border-[#D0C7B8] rounded-lg p-2 text-[#1C1B18]" oninput="debounceSearch()">
                            <span class="text-[#7A7366] text-xs">~</span>
                            <input type="number" id="filterMaxUnits" placeholder="最大" class="w-1/2 text-xs bg-[#FAF8F5] border border-[#D0C7B8] rounded-lg p-2 text-[#1C1B18]" oninput="debounceSearch()">
                        </div>
                    </div>
                </div>
            </div>

            <!-- PROMINENT SORTING TOOLBAR (簡潔流體排版) -->
            <div class="bg-[#FFFFFF] rounded-2xl border border-[#DCD4C5] shadow-xs p-3.5 sm:p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <!-- Left: Quick Sort Buttons -->
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <span id="resultsCountBadge" class="bg-[#1C1B18] text-[#FAF8F5] text-xs font-bold px-3 py-1 rounded-full font-mono shrink-0">共 0 筆</span>
                    
                    <button onclick="toggleSortButton('permitDate')" id="btnSort_permitDate" class="sort-toggle-btn active" title="點擊切換建照日期排序">
                        <span>最新建照</span>
                        <span id="arrowSort_permitDate" class="sort-arrow font-mono">▼</span>
                    </button>

                    <button onclick="toggleSortButton('salesRate')" id="btnSort_salesRate" class="sort-toggle-btn" title="點擊切換銷售率排序">
                        <span>銷售率</span>
                        <span id="arrowSort_salesRate" class="sort-arrow font-mono">▼</span>
                    </button>

                    <button onclick="toggleSortButton('avgPrice')" id="btnSort_avgPrice" class="sort-toggle-btn" title="點擊切換單價排序">
                        <span>實登單價</span>
                        <span id="arrowSort_avgPrice" class="sort-arrow font-mono">▼</span>
                    </button>

                    <button onclick="toggleSortButton('caseName')" id="btnSort_caseName" class="sort-toggle-btn" title="點擊切換案名期數排序">
                        <span>建案名稱</span>
                        <span id="arrowSort_caseName" class="sort-arrow font-mono">▲</span>
                    </button>

                    <button onclick="toggleSortButton('household')" id="btnSort_household" class="sort-toggle-btn" title="點擊切換總戶數排序">
                        <span>總戶數</span>
                        <span id="arrowSort_household" class="sort-arrow font-mono">▼</span>
                    </button>
                </div>

                <!-- Right: View Mode Toggle -->
                <div class="inline-flex p-1 bg-[#F0EBE1] rounded-xl text-xs sm:text-sm font-semibold border border-[#D5C7B5] shrink-0 self-end sm:self-auto">
                    <button id="viewCardBtn" onclick="switchResultMode('cards')" class="px-3 py-1 rounded-lg bg-[#FFFFFF] text-[#1C1B18] shadow-xs transition flex items-center gap-1 font-bold">
                        <svg class="w-3.5 h-3.5 text-[#7A5338]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>
                        圖卡
                    </button>
                    <button id="viewTableBtn" onclick="switchResultMode('table')" class="px-3 py-1 rounded-lg text-[#5C564C] hover:text-[#1C1B18] transition flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 text-[#7A7366]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/></svg>
                        表格
                    </button>
                </div>
            </div>

            <!-- CARD VIEW CONTAINER -->
            <div id="cardsContainer" class="fluid-grid">
                <!-- Dynamic Cards -->
            </div>

            <!-- TABLE VIEW CONTAINER (自適應螢幕寬度，完全不溢出) -->
            <div id="tableContainer" class="hidden bg-[#FFFFFF] rounded-2xl border border-[#DCD4C5] shadow-xs overflow-hidden w-full">
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-xs sm:text-sm text-[#24211D] border-collapse">
                        <thead class="bg-[#F2ECE1] text-[#38342D] font-serif-tc font-bold border-b border-[#DCD4C5]">
                            <tr>
                                <th class="py-3 px-3 w-16 sm:w-20 sortable-th" onclick="toggleSortButton('town')" id="th_town">
                                    <div class="flex items-center gap-1">
                                        <span>鄉鎮</span>
                                        <span class="text-[11px] text-[#7A7366] font-mono" id="sortIcon_town">↕</span>
                                    </div>
                                </th>
                                <th class="py-3 px-3 min-w-[8.5rem] sortable-th" onclick="toggleSortButton('caseName')" id="th_caseName">
                                    <div class="flex items-center gap-1">
                                        <span>建案名稱</span>
                                        <span class="text-[11px] text-[#7A7366] font-mono" id="sortIcon_caseName">↕</span>
                                    </div>
                                </th>
                                <th class="py-3 px-3 min-w-[9.5rem] sortable-th" onclick="toggleSortButton('builder')" id="th_builder">
                                    <div class="flex items-center gap-1">
                                        <span>起造人 / 負責人</span>
                                        <span class="text-[11px] text-[#7A7366] font-mono" id="sortIcon_builder">↕</span>
                                    </div>
                                </th>
                                <th class="py-3 px-2 text-center min-w-[5.5rem] sortable-th" onclick="toggleSortButton('household')" id="th_household">
                                    <div class="flex items-center justify-center gap-1">
                                        <span>戶數規模</span>
                                        <span class="text-[11px] text-[#7A7366] font-mono" id="sortIcon_household">↕</span>
                                    </div>
                                </th>
                                <th class="py-3 px-2 text-center min-w-[6.5rem] sortable-th" onclick="toggleSortButton('salesRate')" id="th_salesRate">
                                    <div class="flex items-center justify-center gap-1">
                                        <span>實登銷售率</span>
                                        <span class="text-[11px] text-[#7A7366] font-mono" id="sortIcon_salesRate">↕</span>
                                    </div>
                                </th>
                                <th class="py-3 px-2 text-center min-w-[6.5rem] sortable-th" onclick="toggleSortButton('avgPrice')" id="th_avgPrice">
                                    <div class="flex items-center justify-center gap-1">
                                        <span>實登均價</span>
                                        <span class="text-[11px] text-[#7A7366] font-mono" id="sortIcon_avgPrice">↕</span>
                                    </div>
                                </th>
                                <th class="py-3 px-3 min-w-[10rem]">坐落街道 / 基地</th>
                                <th class="py-3 px-3 w-24 sm:w-28 sortable-th" onclick="toggleSortButton('permitDate')" id="th_permitDate">
                                    <div class="flex items-center gap-1">
                                        <span>建照核發日</span>
                                        <span class="text-[11px] text-[#7A5338] font-bold font-mono" id="sortIcon_permitDate">▼</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody id="tableBody" class="divide-y divide-[#EBE5DA]">
                            <!-- Dynamic Table Rows -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- No Results Message -->
            <div id="noResultsState" class="hidden text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#DCD4C5] shadow-xs">
                <h3 class="text-lg font-serif-tc font-bold text-[#1C1B18]">查無符合條件的建案紀錄</h3>
                <p class="text-xs text-[#6E675B] mt-1">請嘗試放寬搜尋條件或點擊重設</p>
                <button onclick="resetAllFilters()" class="mt-4 px-5 py-2 bg-[#1C1B18] text-[#FAF8F5] rounded-xl text-xs font-semibold hover:bg-[#38342D] transition shadow-xs">
                    重設所有條件
                </button>
            </div>

            <!-- Pagination Bar -->
            <div id="paginationBar" class="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-[#6E675B] py-2">
                <span id="pageInfoText" class="font-medium">顯示 1 ~ 30 筆</span>
                <div id="paginationControls" class="flex items-center gap-1.5 mt-2.5 sm:mt-0">
                </div>
            </div>
        </div>

        <!-- VIEW 2: BUILDERS DIRECTORY VIEW (全新優化建商名冊資料庫) -->
        <div id="buildersView" class="hidden space-y-5">
            <!-- Search & Controls for Builders -->
            <div class="bg-[#FFFFFF] rounded-2xl sm:rounded-3xl border border-[#DCD4C5] shadow-xs p-4 sm:p-6 space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 class="text-lg sm:text-xl font-serif-tc font-black tracking-wide text-[#1C1B18] flex items-center gap-2">
                            <svg class="w-5 h-5 text-[#7A5338]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                            <span>宜蘭起造建商與負責人名冊</span>
                        </h2>
                        <p class="text-xs text-[#6E675B] mt-0.5">
                            收錄 360 家建設公司之負責人、統一編號、資本額與累計推案總覽
                        </p>
                    </div>

                    <!-- Builder View Switcher & Export -->
                    <div class="flex items-center gap-2">
                        <div class="inline-flex p-1 bg-[#F0EBE1] rounded-xl text-xs font-semibold border border-[#D5C7B5]">
                            <button id="builderCardModeBtn" onclick="switchBuilderViewMode('cards')" class="px-3 py-1 rounded-lg bg-[#FFFFFF] text-[#1C1B18] shadow-xs font-bold transition">
                                名片模式
                            </button>
                            <button id="builderTableModeBtn" onclick="switchBuilderViewMode('table')" class="px-3 py-1 rounded-lg text-[#5C564C] hover:text-[#1C1B18] transition">
                                清冊模式
                            </button>
                        </div>
                        <button onclick="exportBuildersDatabaseToExcel()" class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#FFFFFF] text-[#3E523A] border border-[#C5D4C2] hover:bg-[#EEF4EC] flex items-center gap-1 transition shadow-xs">
                            <svg class="w-3.5 h-3.5 text-[#4A5D44]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                            <span>匯出名冊</span>
                        </button>
                    </div>
                </div>

                <!-- Builder Search Bar -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#736B5E]">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <input 
                        type="text" 
                        id="builderKeyword" 
                        placeholder="搜尋建商名稱、負責人姓名、統編或公司地址..." 
                        class="w-full pl-11 pr-10 py-2.5 sm:py-3 bg-[#FAF8F5] border border-[#D0C7B8] rounded-xl text-xs sm:text-sm text-[#1C1B18] placeholder-[#7A7366] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7A5338] focus:outline-none transition font-medium"
                        oninput="filterBuilders()"
                    >
                </div>
            </div>

            <!-- 1. BUILDERS CARDS CONTAINER (名片模式) -->
            <div id="buildersCardsContainer" class="builders-grid">
                <!-- Dynamically generated builder cards -->
            </div>

            <!-- 2. BUILDERS TABLE CONTAINER (清冊模式) -->
            <div id="buildersTableContainer" class="hidden bg-[#FFFFFF] rounded-2xl border border-[#DCD4C5] shadow-xs overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs sm:text-sm text-[#24211D]">
                        <thead class="bg-[#F2ECE1] text-[#38342D] font-serif-tc font-bold border-b border-[#DCD4C5]">
                            <tr>
                                <th class="py-3 px-3.5">起造人 / 公司名稱</th>
                                <th class="py-3 px-3 font-bold text-[#7A5338]">負責人 / 代表人</th>
                                <th class="py-3 px-3">統一編號</th>
                                <th class="py-3 px-2.5 text-center">推案量</th>
                                <th class="py-3 px-2.5 text-center">總戶數</th>
                                <th class="py-3 px-3">資本額</th>
                                <th class="py-3 px-3">公司登記地址</th>
                                <th class="py-3 px-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody id="buildersTableBody" class="divide-y divide-[#EBE5DA]">
                            <!-- Populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- VIEW 3: STATISTICS DASHBOARD VIEW (行情數據圖鑑) -->
        <div id="statsView" class="hidden space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Town Distribution Chart -->
                <div class="bg-[#FFFFFF] p-5 sm:p-6 rounded-2xl border border-[#DCD4C5] shadow-xs">
                    <h3 class="text-sm sm:text-base font-serif-tc font-bold text-[#1C1B18] mb-3 flex items-center gap-2">
                        <svg class="w-4 h-4 text-[#7A5338]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                        <span>各鄉鎮市推案數量統計</span>
                    </h3>
                    <div class="h-60 sm:h-68">
                        <canvas id="chartTownCases"></canvas>
                    </div>
                </div>

                <!-- Town Avg Unit Price Chart -->
                <div class="bg-[#FFFFFF] p-5 sm:p-6 rounded-2xl border border-[#DCD4C5] shadow-xs">
                    <h3 class="text-sm sm:text-base font-serif-tc font-bold text-[#1C1B18] mb-3 flex items-center gap-2">
                        <svg class="w-4 h-4 text-[#8C6D2B]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span>各鄉鎮市實價登錄平均單價排行 (萬/坪)</span>
                    </h3>
                    <div class="h-60 sm:h-68">
                        <canvas id="chartTownPrice"></canvas>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Zoning System Distribution -->
                <div class="bg-[#FFFFFF] p-5 sm:p-6 rounded-2xl border border-[#DCD4C5] shadow-xs">
                    <h3 class="text-sm sm:text-base font-serif-tc font-bold text-[#1C1B18] mb-3 flex items-center gap-2">
                        <svg class="w-4 h-4 text-[#7A5338]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5H4.5V21"/></svg>
                        <span>土地規劃體系與分區結構分布</span>
                    </h3>
                    <div class="h-60 sm:h-68">
                        <canvas id="chartZoningDistribution"></canvas>
                    </div>
                </div>

                <!-- Top Builders Chart -->
                <div class="bg-[#FFFFFF] p-5 sm:p-6 rounded-2xl border border-[#DCD4C5] shadow-xs">
                    <h3 class="text-sm sm:text-base font-serif-tc font-bold text-[#1C1B18] mb-3 flex items-center gap-2">
                        <svg class="w-4 h-4 text-[#7A5338]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.496m5.007 0a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0014.503 3H9.496a2.25 2.25 0 00-2.25 2.25v7.875a2.25 2.25 0 002.25 2.25z"/></svg>
                        <span>推案量領先建設公司 (Top 10)</span>
                    </h3>
                    <div class="h-60 sm:h-68">
                        <canvas id="chartTopBuilders"></canvas>
                    </div>
                </div>
            </div>
        </div>

    </main>

    <!-- Footer -->
    <footer class="bg-[#FFFFFF] border-t border-[#DCD4C5] py-6 mt-12 text-center text-xs text-[#6E675B] no-print">
        <p class="font-serif-tc font-bold text-[#38342D] tracking-wide">宜蘭縣建案備查與實價登錄銷售檢索系統</p>
        <p class="mt-0.5 text-xs text-[#7A7366] font-normal">資料來源：內政部不動產交易實價查詢服務網 ＆ 經濟部商工登記資料庫</p>
    </footer>

    <!-- DETAIL MODAL -->
    <div id="detailModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-[#1C1B18]/70 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-5">
        <div class="bg-[#FFFFFF] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#C5BCAD] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <!-- Modal Header -->
            <div class="px-6 sm:px-8 py-4.5 sm:py-5 bg-[#1C1B18] text-[#FAF8F5] flex items-start justify-between border-b border-[#38342D]">
                <div>
                    <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span id="modalTownBadge" class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#38342D] text-[#E5C392] border border-[#544F45]"></span>
                        <span id="modalPlanBadge" class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#38342D] text-[#D5CEC2] border border-[#544F45]"></span>
                        <span id="modalNumberCode" class="text-xs text-[#A8A090] font-mono"></span>
                    </div>
                    <h2 id="modalCaseName" class="text-xl sm:text-2xl font-serif-tc font-black tracking-wide text-[#FAF8F5]"></h2>
                    <p id="modalBuilderHeader" class="text-xs sm:text-sm text-[#D5CEC2] font-medium mt-1"></p>
                </div>
                <button onclick="closeModal()" class="text-[#A8A090] hover:text-[#FAF8F5] p-1.5 rounded-xl hover:bg-[#38342D] transition">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>

            <!-- Modal Body Scrollable -->
            <div class="p-5 sm:p-7 overflow-y-auto space-y-5 text-[#24211D] text-xs sm:text-sm">
                
                <!-- 1. 實價登錄銷售成效與單價行情 -->
                <div class="bg-[#F4EFE6] p-4 sm:p-5 rounded-2xl border border-[#D5C7B5] shadow-xs space-y-3">
                    <div class="flex items-center justify-between flex-wrap gap-2">
                        <span class="text-sm font-serif-tc font-black text-[#1C1B18] tracking-wide flex items-center gap-1.5">
                            <svg class="w-4 h-4 text-[#4A5D44]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25l3-3m0 0l3 3m-3-3v7.5"/></svg>
                            <span>實價登錄銷售進度與成交行情</span>
                        </span>
                        <span id="modalSalesStatusBadge" class="px-2.5 py-0.5 text-xs font-bold rounded-full font-mono"></span>
                    </div>

                    <!-- Progress Bar -->
                    <div>
                        <div class="flex items-center justify-between text-xs sm:text-sm font-bold text-[#1C1B18] mb-1">
                            <span id="modalSalesCountText">已售 0 / 0 戶</span>
                            <span id="modalSalesRateText" class="font-serif-tc font-black text-base text-[#4A5D44]">0%</span>
                        </div>
                        <div class="w-full h-2 bg-[#E5DDD0] rounded-full overflow-hidden">
                            <div id="modalProgressBar" class="h-full bg-[#4A5D44] progress-bar-fill rounded-full" style="width: 0%"></div>
                        </div>
                    </div>

                    <!-- Core Sales Metrics Grid -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
                        <div class="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#D5C7B5]">
                            <span class="text-[#6E675B] block font-medium">實登平均單價</span>
                            <span id="modalAvgPricePing" class="text-base font-serif-tc font-black text-[#7A5338] mt-0.5 block">--</span>
                        </div>
                        <div class="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#D5C7B5]">
                            <span class="text-[#6E675B] block font-medium">成交單價區間</span>
                            <span id="modalPriceRangePing" class="text-xs font-bold text-[#1C1B18] mt-0.5 block font-mono">--</span>
                        </div>
                        <div class="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#D5C7B5]">
                            <span class="text-[#6E675B] block font-medium">平均成交總價</span>
                            <span id="modalAvgTotalPrice" class="text-base font-serif-tc font-black text-[#1C1B18] mt-0.5 block">--</span>
                        </div>
                        <div class="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#D5C7B5]">
                            <span class="text-[#6E675B] block font-medium">最新成交日期</span>
                            <span id="modalLatestTransDate" class="text-xs font-semibold text-[#5C564C] mt-0.5 block font-mono">--</span>
                        </div>
                    </div>
                </div>

                <!-- 2. 各戶實價登錄成交明細表 -->
                <div class="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#DCD4C5] shadow-xs">
                    <div class="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                        <span class="text-sm font-serif-tc font-bold text-[#1C1B18] tracking-wide flex items-center gap-1.5">
                            <svg class="w-4 h-4 text-[#7A5338]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/></svg>
                            <span>各戶實價登錄成交明細清冊</span>
                            <span id="modalTransCountBadge" class="bg-[#EFEAE1] text-[#5C564C] px-2 py-0.2 rounded-full text-xs font-mono font-bold">0 筆交易</span>
                        </span>
                    </div>
                    
                    <div class="overflow-x-auto max-h-64 overflow-y-auto rounded-xl border border-[#EBE5DA]">
                        <table class="w-full text-left text-xs text-[#24211D]">
                            <thead class="bg-[#FAF8F5] text-[#38342D] font-serif-tc font-bold sticky top-0 border-b border-[#DCD4C5]">
                                <tr>
                                    <th class="py-2 px-2.5">交易年月</th>
                                    <th class="py-2 px-2.5">棟別 / 門牌</th>
                                    <th class="py-2 px-2 text-center">樓層</th>
                                    <th class="py-2 px-2 text-right">建坪</th>
                                    <th class="py-2 px-2 text-right font-bold text-[#7A5338]">單價(萬/坪)</th>
                                    <th class="py-2 px-2 text-right font-bold text-[#1C1B18]">總價(萬元)</th>
                                    <th class="py-2 px-2 text-center">格局</th>
                                    <th class="py-2 px-2">車位</th>
                                </tr>
                            </thead>
                            <tbody id="modalTransactionsTableBody" class="divide-y divide-[#EBE5DA]">
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 2.5 基地原始購地實價紀錄 (建商購地成本參考 - 獨立呈現) -->
                <div class="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#DCD4C5] shadow-xs">
                    <div class="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                        <span class="text-sm font-serif-tc font-bold text-[#1C1B18] tracking-wide flex items-center gap-1.5">
                            <span class="text-base">🌱</span>
                            <span>基地原始購地實價紀錄 (建商購地成本參考)</span>
                            <span id="modalLandTxCountBadge" class="bg-[#EEF4EC] text-[#2C4A24] px-2 py-0.2 rounded-full text-xs font-mono font-bold">0 筆購地</span>
                        </span>
                    </div>

                    <!-- Land KPI Overview Grid -->
                    <div id="modalLandSummaryGrid" class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs bg-[#FAF8F5] p-3 rounded-xl border border-[#EBE5DA]">
                        <div>
                            <span class="text-[#6E675B] block font-medium">基地平均地價</span>
                            <span id="modalAvgLandPrice" class="text-sm font-serif-tc font-black text-[#2C4A24] mt-0.5 block">--</span>
                        </div>
                        <div>
                            <span class="text-[#6E675B] block font-medium">購地成交總額</span>
                            <span id="modalTotalLandCost" class="text-xs font-mono font-bold text-[#1C1B18] mt-0.5 block">--</span>
                        </div>
                        <div>
                            <span class="text-[#6E675B] block font-medium">移轉土地面積</span>
                            <span id="modalTotalLandArea" class="text-xs font-mono font-semibold text-[#1C1B18] mt-0.5 block">--</span>
                        </div>
                        <div>
                            <span class="text-[#6E675B] block font-medium">最新購地日期</span>
                            <span id="modalLatestLandDate" class="text-xs font-mono text-[#5C564C] mt-0.5 block">--</span>
                        </div>
                    </div>

                    <!-- Land Tx Table -->
                    <div id="modalLandTableContainer" class="overflow-x-auto max-h-48 overflow-y-auto rounded-xl border border-[#EBE5DA]">
                        <table class="w-full text-left text-xs text-[#24211D]">
                            <thead class="bg-[#FAF8F5] text-[#38342D] font-serif-tc font-bold sticky top-0 border-b border-[#DCD4C5]">
                                <tr>
                                    <th class="py-2 px-2.5">交易年月</th>
                                    <th class="py-2 px-2.5">地段地號</th>
                                    <th class="py-2 px-2 text-right">土地坪數</th>
                                    <th class="py-2 px-2 text-right font-bold text-[#2C4A24]">土地單價(萬/坪)</th>
                                    <th class="py-2 px-2 text-right font-bold text-[#1C1B18]">總價(萬元)</th>
                                    <th class="py-2 px-2">備註說明</th>
                                </tr>
                            </thead>
                            <tbody id="modalLandTableBody" class="divide-y divide-[#EBE5DA]">
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 3. 起造建商商工檔案 -->
                <div class="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-[#DCD4C5] shadow-xs">
                    <span class="text-sm font-serif-tc font-bold text-[#1C1B18] tracking-wide flex items-center gap-1.5 mb-2.5">
                        <svg class="w-4 h-4 text-[#7A5338]" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        <span>起造公司與負責人商工檔案</span>
                    </span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div class="bg-[#FFFFFF] p-3 rounded-xl border border-[#DCD4C5]">
                            <span class="text-[#6E675B] block font-medium">負責人 / 代表人</span>
                            <span id="modalBuilderRep" class="text-sm font-serif-tc font-black text-[#7A5338] mt-0.5 block"></span>
                        </div>
                        <div class="bg-[#FFFFFF] p-3 rounded-xl border border-[#DCD4C5]">
                            <span class="text-[#6E675B] block font-medium">統一編號 / 現況</span>
                            <span id="modalBuilderUni" class="text-xs font-mono font-bold text-[#1C1B18] mt-0.5 block"></span>
                        </div>
                        <div class="bg-[#FFFFFF] p-3 rounded-xl border border-[#DCD4C5]">
                            <span class="text-[#6E675B] block font-medium">登記資本額</span>
                            <span id="modalBuilderCap" class="text-xs font-semibold text-[#1C1B18] mt-0.5 block"></span>
                        </div>
                        <div class="bg-[#FFFFFF] p-3 rounded-xl border border-[#DCD4C5]">
                            <span class="text-[#6E675B] block font-medium">公司地址</span>
                            <span id="modalBuilderAddr" class="text-xs font-medium text-[#423E37] mt-0.5 block truncate"></span>
                        </div>
                    </div>
                </div>

                <!-- 4. 基地位置與基本資訊 -->
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-[#DCD4C5] text-xs">
                    <div>
                        <span class="text-[#6E675B] block font-medium">申報總戶數</span>
                        <span id="modalHousehold" class="text-sm font-serif-tc font-bold text-[#1C1B18] mt-0.5 block"></span>
                        <span id="modalHouseholdSoldSub" class="text-[11px] font-semibold text-[#4A5D44] block"></span>
                    </div>
                    <div>
                        <span class="text-[#6E675B] block font-medium">主要用途</span>
                        <span id="modalMainUse" class="text-xs font-semibold text-[#1C1B18] mt-0.5 block"></span>
                    </div>
                    <div>
                        <span class="text-[#6E675B] block font-medium">主要建材</span>
                        <span id="modalMaterial" class="text-xs font-semibold text-[#1C1B18] mt-0.5 block"></span>
                    </div>
                    <div>
                        <span class="text-[#6E675B] block font-medium">建照核發日</span>
                        <span id="modalPermitDate" class="text-xs font-semibold text-[#1C1B18] font-mono mt-0.5 block"></span>
                    </div>
                    <div>
                        <span class="text-[#6E675B] block font-medium">申報備查日</span>
                        <span id="modalDeclareDate" class="text-xs font-semibold text-[#1C1B18] font-mono mt-0.5 block"></span>
                    </div>
                    <div>
                        <span class="text-[#6E675B] block font-medium">第1次登記日</span>
                        <span id="modalFirstRegDate" class="text-xs font-semibold text-[#1C1B18] font-mono mt-0.5 block"></span>
                    </div>
                </div>

                <!-- 5. 坐落街道與基地地號 -->
                <div class="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#DCD4C5] shadow-xs">
                    <div class="flex items-center justify-between mb-1.5">
                        <span class="text-sm font-serif-tc font-bold text-[#38342D] tracking-wide">坐落街道與基地</span>
                        <a id="modalMapLink" href="#" target="_blank" class="text-xs font-bold text-[#7A5338] hover:text-[#4A2F1C] flex items-center gap-1 bg-[#F7EFE8] px-2.5 py-0.5 rounded-lg transition border border-[#DECDBE]">
                            Google 地圖 ➔
                        </a>
                    </div>
                    <div class="text-xs sm:text-sm font-semibold text-[#1C1B18]" id="modalStreetLocation"></div>
                    <div class="text-xs text-[#5C564C] font-mono mt-0.5" id="modalMainLand"></div>
                </div>
            </div>

            <!-- Modal Footer Actions -->
            <div class="px-6 sm:px-8 py-3.5 bg-[#FAF8F5] border-t border-[#DCD4C5] flex items-center justify-between">
                <button onclick="copyModalCaseSummary()" class="px-4 py-2 bg-[#FFFFFF] border border-[#D0C7B8] hover:bg-[#EAE4D8] text-[#1C1B18] rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs">
                    複製檔案
                </button>
                <button onclick="closeModal()" class="px-5 py-2 bg-[#1C1B18] hover:bg-[#38342D] text-[#FAF8F5] rounded-xl text-xs font-semibold transition shadow-xs">
                    關閉
                </button>
            </div>
        </div>
    </div>

    <!-- Notification Toast -->
    <div id="toastNotification" class="hidden fixed bottom-6 right-6 z-50 bg-[#1C1B18] text-[#FAF8F5] px-4.5 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-[#423E37]">
        <svg class="w-4 h-4 text-[#E5C392]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
        <span id="toastMessage">已完成操作</span>
    </div>

    <!-- Embedded Complete Data Engine -->
    <script id="embeddedDataScript">
        window.YILAN_CASES_DATA = ${jsonData};
        window.YILAN_BUILDERS_DATA = ${buildersData};
    </script>

    <!-- Application Logic Script -->
    <script>
        let allProjects = [];
        let filteredProjects = [];
        let allBuilders = [];
        let filteredBuilders = [];
        let buildersMap = {};

        let selectedTown = '全部';
        let currentView = 'search';
        let resultViewMode = 'cards';
        let builderViewMode = 'cards';
        let currentPage = 1;
        const pageSize = 30;
        let activeModalProject = null;
        let chartInstances = {};
        let debounceTimer = null;

        let currentSortKey = 'permitDate';
        let currentSortDir = 'desc';

        const sortDescriptions = {
            'permitDate_desc': '最新建照 ▼',
            'permitDate_asc': '最舊建照 ▲',
            'salesRate_desc': '實登銷售率 ▼',
            'salesRate_asc': '實登銷售率 ▲',
            'avgPrice_desc': '實登單價 ▼',
            'avgPrice_asc': '實登單價 ▲',
            'caseName_asc': '建案名稱 ▲',
            'caseName_desc': '建案名稱 ▼',
            'household_desc': '總戶數 ▼',
            'household_asc': '總戶數 ▲',
            'town_asc': '鄉鎮市區 ▲',
            'town_desc': '鄉鎮市區 ▼',
            'builder_asc': '建商名稱 ▲',
            'builder_desc': '建商名稱 ▼'
        };

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
            if (/^\\d+$/.test(str)) return parseInt(str, 10);

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

        function normalizeSmartText(raw) {
            if (!raw) return '';
            let s = String(raw);

            const roman = [
                [/\\bX\\b/gi, '10'], [/\\bIX\\b/gi, '9'], [/\\bVIII\\b/gi, '8'], [/\\bVII\\b/gi, '7'],
                [/\\bVI\\b/gi, '6'], [/\\bV\\b/gi, '5'], [/\\bIV\\b/gi, '4'], [/\\bIII\\b/gi, '3'],
                [/\\bII\\b/gi, '2'], [/\\bI\\b/gi, '1'],
                [/III(?=[\\s期號]|$)/g, '3'], [/II(?=[\\s期號]|$)/g, '2'], [/IV(?=[\\s期號]|$)/g, '4'], [/VI(?=[\\s期號]|$)/g, '6'],
                [/VII(?=[\\s期號]|$)/g, '7'], [/VIII(?=[\\s期號]|$)/g, '8'], [/IX(?=[\\s期號]|$)/g, '9'], [/X(?=[\\s期號]|$)/g, '10']
            ];
            roman.forEach(([reg, rep]) => { s = s.replace(reg, rep); });

            s = s.replace(/第\\s*([零一二三四五六七八九十百壹貳兩參肆伍陸柒捌玖拾佰\\d]+)\\s*期/g, (match, p1) => {
                const num = parseChineseNum(p1);
                return num !== null ? \`\${num}期\` : match;
            });

            s = s.replace(/[Nn][Oo][\\.\\s]*([零一二三四五六七八九十百壹貳兩參肆伍陸柒捌玖拾佰\\d]+)/g, (match, p1) => {
                const num = parseChineseNum(p1);
                return num !== null ? \`NO\${num}\` : match;
            });

            s = s.replace(/([零一二三四五六七八九十百壹貳兩參肆伍陸柒捌玖拾佰]+)(?=\\s*(?:期|代|段|區|號|棟))/g, (match, p1) => {
                const num = parseChineseNum(p1);
                return num !== null ? String(num) : match;
            });

            return s;
        }

        function getNaturalSortTokens(str) {
            const norm = normalizeSmartText(str).replace(/[-_－—·\\s]/g, '');
            const parts = norm.split(/(\\d+)/).filter(Boolean);
            return parts.map(p => {
                if (/^\d+$/.test(p)) {
                    return { isNum: true, val: parseInt(p, 10) };
                }
                return { isNum: false, val: p.toLowerCase() };
            });
        }

        function smartNaturalCompare(a, b) {
            const tokensA = getNaturalSortTokens(a);
            const tokensB = getNaturalSortTokens(b);

            const len = Math.min(tokensA.length, tokensB.length);
            for (let i = 0; i < len; i++) {
                const itemA = tokensA[i];
                const itemB = tokensB[i];

                if (itemA.isNum && itemB.isNum) {
                    if (itemA.val !== itemB.val) return itemA.val - itemB.val;
                } else if (!itemA.isNum && !itemB.isNum) {
                    const cmp = itemA.val.localeCompare(itemB.val, 'zh-Hant');
                    if (cmp !== 0) return cmp;
                } else if (itemA.isNum && !itemB.isNum) {
                    return -1;
                } else {
                    return 1;
                }
            }
            return tokensA.length - tokensB.length;
        }

        const townColors = {
            '員山鄉': 'bg-[#EEF5EC] text-[#2C4A24] border-[#BDD9B4]',
            '宜蘭市': 'bg-[#EDF3F7] text-[#253D52] border-[#BACFDF]',
            '冬山鄉': 'bg-[#F2F4EB] text-[#3E4D20] border-[#C8D4B4]',
            '五結鄉': 'bg-[#EFF4F5] text-[#24424D] border-[#BAD1D8]',
            '壯圍鄉': 'bg-[#F5F2EB] text-[#523F20] border-[#D8CEBA]',
            '礁溪鄉': 'bg-[#F4EFF5] text-[#4A2552] border-[#D5BCD8]',
            '蘇澳鎮': 'bg-[#F7EFE8] text-[#5C2B14] border-[#E0C0AF]',
            '三星鄉': 'bg-[#F7F4EB] text-[#594819] border-[#DFCFA2]',
            '羅東鎮': 'bg-[#F7EFEF] text-[#5E2020] border-[#DFC0C0]',
            '頭城鎮': 'bg-[#F8F1EB] text-[#5E3716] border-[#E0C3A8]'
        };

        document.addEventListener('DOMContentLoaded', async () => {
            if (window.YILAN_BUILDERS_DATA) {
                allBuilders = window.YILAN_BUILDERS_DATA;
                filteredBuilders = [...allBuilders];
                allBuilders.forEach(b => {
                    buildersMap[b.builderName] = b;
                    if (b.matchedName) buildersMap[b.matchedName] = b;
                });
            }

            if (window.YILAN_CASES_DATA && window.YILAN_CASES_DATA.length > 0) {
                initData(window.YILAN_CASES_DATA);
            }
        });

        function initData(data) {
            allProjects = data;
            filteredProjects = [...allProjects];
            buildTownPills();
            populateBuilderDropdown();
            renderBuildersView();
            performSearch();
        }

        function updateDynamicKPIs(data) {
            const list = data || filteredProjects || allProjects;
            const totalCases = list.length;
            document.getElementById('kpiTotalCases').innerText = totalCases.toLocaleString() + ' 筆';
            
            const totalPlannedUnits = list.reduce((acc, p) => acc + (p.household || 0), 0);
            const totalSold = list.reduce((acc, p) => acc + (p.salesStats?.soldUnits || 0), 0);
            
            document.getElementById('kpiTotalSoldUnits').innerText = totalSold.toLocaleString() + ' 戶';
            const rateVal = totalPlannedUnits > 0 ? ((totalSold / totalPlannedUnits) * 100).toFixed(1) : '0';

            // Determine active scope label
            const scopeParts = [];
            if (selectedTown && selectedTown !== '全部') {
                scopeParts.push(selectedTown);
            }
            const permitYear = document.getElementById('filterPermitYear')?.value;
            if (permitYear) {
                scopeParts.push(\`\${permitYear}年\`);
            }
            const builder = document.getElementById('filterBuilder')?.value;
            if (builder) {
                const shortBuilder = builder.length > 6 ? builder.slice(0, 6) + '…' : builder;
                scopeParts.push(shortBuilder);
            }
            const keyword = (document.getElementById('globalKeyword')?.value || '').trim();
            if (keyword && scopeParts.length === 0) {
                scopeParts.push(\`「\${keyword.length > 5 ? keyword.slice(0, 5) + '…' : keyword}」\`);
            }

            const isFiltered = scopeParts.length > 0;
            const scopeText = isFiltered ? scopeParts.join(' · ') : '全縣';

            document.getElementById('kpiOverallSalesRate').innerText = \`\${scopeText} \${rateVal}%\`;

            // Dynamic card headers
            const labelTotalCases = document.getElementById('kpiLabelTotalCases');
            if (labelTotalCases) labelTotalCases.innerText = isFiltered ? \`\${scopeText} 建案數\` : '建案備查總數';

            const labelSoldUnits = document.getElementById('kpiLabelSoldUnits');
            if (labelSoldUnits) labelSoldUnits.innerText = isFiltered ? \`\${scopeText} 已售\` : '實登已售總戶數';

            const labelAvgPrice = document.getElementById('kpiLabelAvgPrice');
            if (labelAvgPrice) labelAvgPrice.innerText = isFiltered ? \`\${scopeText} 均價\` : '實登平均單價';

            const labelHouseholds = document.getElementById('kpiLabelTotalHouseholds');
            if (labelHouseholds) labelHouseholds.innerText = isFiltered ? \`\${scopeText} 申報戶數\` : '申報總戶數';

            const validPrices = list.filter(p => p.salesStats?.avgPricePerPing > 0).map(p => p.salesStats.avgPricePerPing);
            const avgPrice = validPrices.length > 0 ? (validPrices.reduce((a, b) => a + b, 0) / validPrices.length).toFixed(1) : '--';
            document.getElementById('kpiAvgUnitPrice').innerText = (avgPrice !== '--') ? \`\${avgPrice} 萬/坪\` : '--';

            document.getElementById('kpiTotalHouseholds').innerText = totalPlannedUnits.toLocaleString() + ' 戶';
            document.getElementById('kpiTotalHouseholdsSub').innerText = \`已銷售 \${totalSold.toLocaleString()} 戶 (佔 \${rateVal}%)\`;
        }

        function buildTownPills() {
            const counts = { '全部': allProjects.length };
            allProjects.forEach(p => {
                const t = p.town || '其他';
                counts[t] = (counts[t] || 0) + 1;
            });

            const order = ['全部', '員山鄉', '宜蘭市', '冬山鄉', '五結鄉', '壯圍鄉', '礁溪鄉', '蘇澳鎮', '三星鄉', '羅東鎮', '頭城鎮'];
            const container = document.getElementById('townPillsContainer');
            container.innerHTML = '';

            order.forEach(town => {
                if (counts[town] === undefined && town !== '全部') return;
                const count = counts[town] || 0;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = \`town-btn \${town === selectedTown ? 'active' : ''}\`;
                btn.innerHTML = \`<span>\${town}</span> <span class="text-[11px] px-1.5 py-0.2 rounded-full font-mono font-bold \${town === selectedTown ? 'bg-[#38342D] text-[#FAF8F5]' : 'bg-[#EAE4D8] text-[#423E37]'}">\${count}</span>\`;
                btn.onclick = () => selectTown(town);
                container.appendChild(btn);
            });
        }

        function selectTown(town) {
            selectedTown = town;
            buildTownPills();
            performSearch();
        }

        function populateBuilderDropdown() {
            const buildersCounts = {};
            allProjects.forEach(p => {
                if (p.builder) buildersCounts[p.builder] = (buildersCounts[p.builder] || 0) + 1;
            });

            const sortedBuilders = Object.entries(buildersCounts).sort((a, b) => b[1] - a[1]);
            const topBuilders = sortedBuilders.filter(b => b[1] >= 4);
            const otherBuilders = sortedBuilders.filter(b => b[1] < 4).sort((a, b) => a[0].localeCompare(b[0], 'zh-Hant'));

            const select = document.getElementById('filterBuilder');
            select.innerHTML = '<option value="">全部建設公司 (不限)</option>';

            const topGroup = document.createElement('optgroup');
            topGroup.label = '── 活躍推案建商 (4 案以上) ──';
            topBuilders.forEach(([b, cnt]) => {
                const bInfo = buildersMap[b];
                const repText = bInfo?.representative ? \` (\${bInfo.representative})\` : '';
                const opt = document.createElement('option');
                opt.value = b;
                opt.textContent = \`\${b}\${repText} - \${cnt} 案\`;
                topGroup.appendChild(opt);
            });
            select.appendChild(topGroup);

            const otherGroup = document.createElement('optgroup');
            otherGroup.label = '── 其他建商 (筆畫排序) ──';
            otherBuilders.forEach(([b, cnt]) => {
                const bInfo = buildersMap[b];
                const repText = bInfo?.representative ? \` (\${bInfo.representative})\` : '';
                const opt = document.createElement('option');
                opt.value = b;
                opt.textContent = \`\${b}\${repText} - \${cnt} 案\`;
                otherGroup.appendChild(opt);
            });
            select.appendChild(otherGroup);
        }

        function debounceSearch() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(performSearch, 200);
        }

        function clearKeyword() {
            document.getElementById('globalKeyword').value = '';
            document.getElementById('clearKeywordBtn').classList.add('hidden');
            performSearch();
        }

        function toggleAdvancedFilters() {
            const box = document.getElementById('advancedFiltersBox');
            const arrow = document.getElementById('advFilterArrow');
            const text = document.getElementById('advFilterText');
            if (box.classList.contains('hidden')) {
                box.classList.remove('hidden');
                arrow.classList.add('rotate-180');
                text.innerText = '收合進階條件';
            } else {
                box.classList.add('hidden');
                arrow.classList.remove('rotate-180');
                text.innerText = '更多進階條件 (單價行情 / 用途 / 年份 / 戶數)';
            }
        }

        function resetAllFilters() {
            document.getElementById('globalKeyword').value = '';
            document.getElementById('clearKeywordBtn').classList.add('hidden');
            selectedTown = '全部';
            buildTownPills();
            document.getElementById('filterUnifiedZoning').value = '';
            document.getElementById('filterBuilder').value = '';
            document.getElementById('filterSalesRate').value = '';
            document.getElementById('filterPriceRange').value = '';
            document.getElementById('filterMainUse').value = '';
            document.getElementById('filterPermitYear').value = '';
            document.getElementById('filterMinUnits').value = '';
            document.getElementById('filterMaxUnits').value = '';
            document.getElementById('activeFilterBadge').classList.add('hidden');
            
            currentSortKey = 'permitDate';
            currentSortDir = 'desc';
            updateSortUI();
            performSearch();
        }

        function toggleSortButton(key) {
            if (currentSortKey === key) {
                currentSortDir = (currentSortDir === 'asc') ? 'desc' : 'asc';
            } else {
                currentSortKey = key;
                if (key === 'permitDate' || key === 'household' || key === 'salesRate' || key === 'avgPrice') {
                    currentSortDir = 'desc';
                } else {
                    currentSortDir = 'asc';
                }
            }
            updateSortUI();
            performSortAndRender();
        }

        function updateSortUI() {
            const sortKeys = ['permitDate', 'salesRate', 'avgPrice', 'caseName', 'household', 'builder', 'town'];
            sortKeys.forEach(k => {
                const btn = document.getElementById(\`btnSort_\${k}\`);
                const arrow = document.getElementById(\`arrowSort_\${k}\`);
                if (!btn || !arrow) return;

                if (currentSortKey === k) {
                    btn.classList.add('active');
                    arrow.innerText = (currentSortDir === 'desc') ? '▼' : '▲';
                } else {
                    btn.classList.remove('active');
                    if (k === 'permitDate' || k === 'household' || k === 'salesRate' || k === 'avgPrice') arrow.innerText = '▼';
                    else arrow.innerText = '▲';
                }
            });

            ['town', 'caseName', 'builder', 'salesRate', 'avgPrice', 'household', 'permitDate'].forEach(col => {
                const th = document.getElementById(\`th_\${col}\`);
                const icon = document.getElementById(\`sortIcon_\${col}\`);
                if (!th || !icon) return;

                if (currentSortKey === col) {
                    th.classList.add('active-sort');
                    icon.innerText = (currentSortDir === 'asc') ? '▲' : '▼';
                    icon.className = 'text-[11px] text-[#7A5338] font-bold font-mono';
                } else {
                    th.classList.remove('active-sort');
                    icon.innerText = '↕';
                    icon.className = 'text-[11px] text-[#7A7366] font-mono';
                }
            });
        }

        function sortArray(arr) {
            return arr.sort((a, b) => {
                let res = 0;
                if (currentSortKey === 'caseName') {
                    res = smartNaturalCompare(a.caseName || '', b.caseName || '');
                } else if (currentSortKey === 'salesRate') {
                    res = (a.salesStats?.salesRate || 0) - (b.salesStats?.salesRate || 0);
                } else if (currentSortKey === 'avgPrice') {
                    res = (a.salesStats?.avgPricePerPing || 0) - (b.salesStats?.avgPricePerPing || 0);
                } else if (currentSortKey === 'builder') {
                    res = smartNaturalCompare(a.builder || '', b.builder || '');
                } else if (currentSortKey === 'town') {
                    res = (a.town || '').localeCompare(b.town || '', 'zh-Hant');
                } else if (currentSortKey === 'permitDate') {
                    res = (a.permitDateRaw || '').localeCompare(b.permitDateRaw || '');
                } else if (currentSortKey === 'household') {
                    res = (a.household || 0) - (b.household || 0);
                }
                return currentSortDir === 'desc' ? -res : res;
            });
        }

        function performSortAndRender() {
            sortArray(filteredProjects);
            currentPage = 1;
            renderResults();
        }

        function performSearch() {
            const rawKeyword = (document.getElementById('globalKeyword').value || '').trim();
            const clearBtn = document.getElementById('clearKeywordBtn');
            if (rawKeyword) clearBtn.classList.remove('hidden');
            else clearBtn.classList.add('hidden');

            const keywords = rawKeyword.toLowerCase().split(/\\s+/).filter(Boolean);
            const unifiedZoning = document.getElementById('filterUnifiedZoning').value;
            const builder = document.getElementById('filterBuilder').value;
            const salesRateFilter = document.getElementById('filterSalesRate').value;
            const priceRangeFilter = document.getElementById('filterPriceRange').value;
            
            const mainUse = document.getElementById('filterMainUse').value;
            const permitYear = document.getElementById('filterPermitYear').value;
            const minUnits = parseInt(document.getElementById('filterMinUnits').value, 10);
            const maxUnits = parseInt(document.getElementById('filterMaxUnits').value, 10);

            let hasAdvFilter = (mainUse || permitYear || !isNaN(minUnits) || !isNaN(maxUnits) || priceRangeFilter);
            const activeBadge = document.getElementById('activeFilterBadge');
            if (hasAdvFilter) activeBadge.classList.remove('hidden');
            else activeBadge.classList.add('hidden');

            filteredProjects = allProjects.filter(p => {
                if (selectedTown !== '全部' && p.town !== selectedTown) return false;

                if (unifiedZoning) {
                    if (unifiedZoning === 'nonurban_all') {
                        if (!p.zoningInfo.planType.includes('都市計畫外')) return false;
                    } else if (unifiedZoning === 'urban_all') {
                        if (!p.zoningInfo.planType.includes('都市計畫內')) return false;
                    } else {
                        if (p.zoningInfo.category !== unifiedZoning && p.zoningInfo.urbanZone !== unifiedZoning && p.zoningInfo.nonUrbanZone !== unifiedZoning) {
                            return false;
                        }
                    }
                }

                if (builder && p.builder !== builder) return false;

                if (salesRateFilter) {
                    const s = p.salesStats;
                    if (salesRateFilter === '100' && (!s.hasSalesData || s.salesRate < 100)) return false;
                    if (salesRateFilter === '90' && (!s.hasSalesData || s.salesRate < 90)) return false;
                    if (salesRateFilter === '60-89' && (!s.hasSalesData || s.salesRate < 60 || s.salesRate >= 90)) return false;
                    if (salesRateFilter === '1-59' && (!s.hasSalesData || s.salesRate <= 0 || s.salesRate >= 60)) return false;
                    if (salesRateFilter === 'has_sales' && (!s.hasSalesData || s.soldUnits === 0)) return false;
                    if (salesRateFilter === 'no_sales' && (s.hasSalesData && s.soldUnits > 0)) return false;
                }

                if (priceRangeFilter) {
                    const s = p.salesStats;
                    if (!s.hasSalesData || !s.avgPricePerPing) return false;
                    if (priceRangeFilter === '40_up' && s.avgPricePerPing < 40) return false;
                    if (priceRangeFilter === '30_40' && (s.avgPricePerPing < 30 || s.avgPricePerPing >= 40)) return false;
                    if (priceRangeFilter === '20_30' && (s.avgPricePerPing < 20 || s.avgPricePerPing >= 30)) return false;
                    if (priceRangeFilter === '20_down' && s.avgPricePerPing >= 20) return false;
                }

                if (mainUse && p.normalizedUse !== mainUse) return false;
                if (permitYear && String(p.permitYearRoc) !== String(permitYear)) return false;
                if (!isNaN(minUnits) && p.household < minUnits) return false;
                if (!isNaN(maxUnits) && p.household > maxUnits) return false;

                if (keywords.length > 0) {
                    const bInfo = buildersMap[p.builder];
                    const repName = bInfo?.representative || '';
                    const uniNo = bInfo?.unifiedNo || '';
                    const extraSearchTokens = \`\${p.searchTokens} \${repName.toLowerCase()} \${uniNo}\`;

                    const matched = keywords.every(kw => {
                        if (extraSearchTokens.includes(kw)) return true;
                        const normW = normalizeSmartText(kw).replace(/[-_－—·\\s]/g, '').toLowerCase();
                        return extraSearchTokens.includes(normW);
                    });
                    if (!matched) return false;
                }

                return true;
            });

            updateSortUI();
            performSortAndRender();
            updateDynamicKPIs(filteredProjects);
            if (currentView === 'stats') renderStatsCharts();
        }

        function renderResults() {
            const countBadge = document.getElementById('resultsCountBadge');
            countBadge.innerText = \`共 \${filteredProjects.length.toLocaleString()} 筆\`;

            const noResults = document.getElementById('noResultsState');
            const cardsContainer = document.getElementById('cardsContainer');
            const tableContainer = document.getElementById('tableContainer');
            const paginationBar = document.getElementById('paginationBar');

            if (filteredProjects.length === 0) {
                noResults.classList.remove('hidden');
                cardsContainer.innerHTML = '';
                document.getElementById('tableBody').innerHTML = '';
                paginationBar.classList.add('hidden');
                return;
            }

            noResults.classList.add('hidden');
            paginationBar.classList.remove('hidden');

            const totalPages = Math.ceil(filteredProjects.length / pageSize);
            const startIdx = (currentPage - 1) * pageSize;
            const pageData = filteredProjects.slice(startIdx, startIdx + pageSize);

            document.getElementById('pageInfoText').innerText = \`顯示第 \${startIdx + 1} ~ \${Math.min(startIdx + pageSize, filteredProjects.length)} 筆 (共 \${filteredProjects.length} 筆)\`;

            renderPaginationControls(totalPages);

            if (resultViewMode === 'cards') {
                cardsContainer.classList.remove('hidden');
                tableContainer.classList.add('hidden');
                renderCards(pageData);
            } else {
                cardsContainer.classList.add('hidden');
                tableContainer.classList.remove('hidden');
                renderTable(pageData);
            }
        }

        function renderCards(projects) {
            const container = document.getElementById('cardsContainer');
            container.innerHTML = '';

            projects.forEach(p => {
                const townColor = townColors[p.town] || 'bg-[#FFFFFF] text-[#38342D] border-[#DCD4C5]';
                const bInfo = buildersMap[p.builder];
                const repLabel = bInfo?.representative ? \`<span class="text-[11px] bg-[#FAF8F5] text-[#7A5338] px-2 py-0.5 rounded-md border border-[#DCD4C5] font-serif-tc font-bold">負責人: \${bInfo.representative}</span>\` : '';

                const s = p.salesStats || {};
                const hasSales = s.hasSalesData && s.soldUnits > 0;
                const isSoldOut = s.isSoldOut || s.salesRate >= 100;
                
                let progressBg = 'bg-[#7A5338]';
                let rateBadgeColor = 'bg-[#F7EFE8] text-[#7A5338] border-[#DECDBE]';
                let rateBadgeText = \`\${s.salesRate}%\`;
                if (isSoldOut) {
                    progressBg = 'bg-[#2C4A24]';
                    rateBadgeColor = 'bg-[#EEF4EC] text-[#2C4A24] border-[#BDD9B4]';
                    rateBadgeText = '完銷 100%';
                } else if (s.salesRate >= 90) {
                    progressBg = 'bg-[#4A5D44]';
                    rateBadgeColor = 'bg-[#EEF4EC] text-[#2C4A24] border-[#BDD9B4]';
                } else if (s.salesRate < 50) {
                    progressBg = 'bg-[#8C6D2B]';
                    rateBadgeColor = 'bg-[#F7F4EB] text-[#594819] border-[#DFCFA2]';
                }

                const card = document.createElement('div');
                card.className = 'wabi-card';
                card.onclick = () => openDetailModal(p.id);

                card.innerHTML = \`
                    <div>
                        <!-- Header: 鄉鎮與總戶數 (下方標示已售戶數) -->
                        <div class="flex items-start justify-between gap-2 mb-2.5">
                            <span class="badge border \${townColor} text-xs font-bold font-serif-tc">\${p.town || '宜蘭縣'}</span>
                            <div class="text-right ml-auto">
                                <span class="badge bg-[#F7F4EE] text-[#38342D] font-mono border border-[#D5C7B5] font-bold text-xs">
                                    總 \${p.household ? p.household + ' 戶' : '未填'}
                                </span>
                                <div class="text-[11px] font-semibold \${isSoldOut ? 'text-[#2C4A24] font-bold' : (hasSales ? 'text-[#4A5D44]' : 'text-[#7A7366]')} mt-0.5 font-mono">
                                    \${isSoldOut ? \`已完銷 (\${s.soldUnits}戶)\` : (hasSales ? \`已售 \${s.soldUnits} 戶\` : '尚無實登')}
                                </div>
                            </div>
                        </div>

                        <!-- Case Name -->
                        <h4 class="text-base sm:text-lg font-serif-tc font-black text-[#1C1B18] tracking-wide mb-1 hover:text-[#7A5338] transition flex items-center gap-1.5">
                            \${escapeHtml(p.caseName || '未命名建案')}
                        </h4>

                        <!-- Builder & Representative -->
                        <div class="flex items-center justify-between gap-2 mb-3 flex-wrap">
                            <p class="text-xs sm:text-sm text-[#4A463E] font-medium flex items-center gap-1 truncate">
                                <svg class="w-3.5 h-3.5 text-[#7A7366] shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                                <span class="truncate font-semibold">\${escapeHtml(p.builder || '未提供起造人')}</span>
                            </p>
                            \${repLabel}
                        </div>

                        <!-- REAL PRICE SALES & PROGRESS BOX -->
                        <div class="bg-[#FAF8F5] p-2.5 sm:p-3 rounded-xl border border-[#DCD4C5] mb-3 space-y-1.5">
                            <div class="flex items-center justify-between text-xs">
                                <span class="font-serif-tc font-bold text-[#1C1B18] flex items-center gap-1">
                                    <svg class="w-3.5 h-3.5 \${isSoldOut ? 'text-[#2C4A24]' : 'text-[#4A5D44]'}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    實登銷售：\${hasSales ? (isSoldOut ? \`已售 \${s.soldUnits} / \${s.totalHouseholds} 戶 (完銷)\` : \`已售 \${s.soldUnits} / \${s.totalHouseholds} 戶\`) : '尚無實登交易'}
                                </span>
                                <span class="font-mono font-bold px-1.5 py-0.2 rounded-md border text-[11px] \${rateBadgeColor}">
                                    \${hasSales ? rateBadgeText : '無交易'}
                                </span>
                            </div>
                            
                            <!-- Mini Progress Bar -->
                            <div class="w-full h-1.5 bg-[#EAE4D8] rounded-full overflow-hidden">
                                <div class="h-full \${progressBg} rounded-full" style="width: \${hasSales ? s.salesRate : 0}%"></div>
                            </div>

                            <!-- Price Highlights -->
                            \${hasSales && s.avgPricePerPing ? \`
                            <div class="flex items-center justify-between text-[11px] pt-1 border-t border-[#EAE4D8] text-[#5C564C]">
                                <span>均價：<b class="text-[#7A5338] font-bold text-xs">\${s.avgPricePerPing}</b> 萬/坪</span>
                                <span class="font-mono text-[10.5px]">區間: \${s.minPricePerPing}~\${s.maxPricePerPing}萬</span>
                            </div>
                            \` : \`
                            <div class="text-[11px] text-[#7A7366] pt-0.5">尚未登錄建案實價買賣紀錄</div>
                            \`}

                            <!-- Separate Land Acquisition Cost (🌱 基地購地實價) -->
                            \${p.landStats && p.landStats.hasLandData ? \`
                            <div class="flex items-center justify-between text-[11px] pt-1 border-t border-[#EAE4D8] text-[#2C4A24]">
                                <span class="flex items-center gap-0.5"><span>🌱</span> 基地購地：<b class="font-bold text-xs font-mono">\${p.landStats.avgLandPricePerPing}</b> 萬/坪</span>
                                <span class="font-mono text-[10px] text-[#5C564C]">\${p.landStats.latestLandDate}</span>
                            </div>
                            \` : ''}
                        </div>

                        <!-- Info Rows -->
                        <div class="space-y-1.5 text-xs text-[#423E37] border-t border-[#EBE5DA] pt-2.5 mb-2.5">
                            <div class="flex items-start gap-1.5">
                                <span class="text-[#7A7366] shrink-0 font-medium min-w-[3.2rem]">地點：</span>
                                <span class="text-[#1C1B18] font-medium truncate">\${escapeHtml(p.location || p.mainLand || '無詳細地址')}</span>
                            </div>
                            <div class="flex items-start gap-1.5">
                                <span class="text-[#7A7366] shrink-0 font-medium min-w-[3.2rem]">建照：</span>
                                <span class="text-[#1C1B18] font-medium font-mono">\${p.permitDate ? \`核發 \${p.permitDate}\` : '無核發日'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Card Footer Actions -->
                    <div class="flex items-center justify-between pt-2 border-t border-[#EBE5DA] text-[11px] sm:text-xs">
                        <span class="text-[#6E675B] font-mono">備查: \${p.declareDate || '--'}</span>
                        <span class="text-[#7A5338] font-bold hover:text-[#4A2F1C] flex items-center gap-0.5">
                            實登詳情 ➔
                        </span>
                    </div>
                \`;
                container.appendChild(card);
            });
        }

        function renderTable(projects) {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';

            projects.forEach(p => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-[#F7F3EB] transition-colors cursor-pointer group';
                tr.onclick = () => openDetailModal(p.id);

                const townColor = townColors[p.town] || 'bg-[#FAF8F5] text-[#38342D] border-[#DCD4C5]';
                const bInfo = buildersMap[p.builder];
                const repBadge = bInfo?.representative ? \`<span class="text-[11px] font-serif-tc font-bold text-[#7A5338] bg-[#F7EFE8] px-1.5 py-0.2 rounded border border-[#DECDBE] ml-1">\${bInfo.representative}</span>\` : '';

                const s = p.salesStats || {};
                const hasSales = s.hasSalesData && s.soldUnits > 0;
                const isSoldOut = s.isSoldOut || s.salesRate >= 100;

                tr.innerHTML = \`
                    <!-- 鄉鎮 -->
                    <td class="py-2.5 px-3 whitespace-nowrap">
                        <span class="badge border \${townColor} text-xs px-2 py-0.2 font-serif-tc font-bold">
                            \${p.town || '宜蘭縣'}
                        </span>
                    </td>
                    <!-- 建案名稱 -->
                    <td class="py-2.5 px-3 font-serif-tc font-black text-xs sm:text-sm text-[#1C1B18] group-hover:text-[#7A5338] whitespace-nowrap transition-colors">
                        \${escapeHtml(p.caseName || '未命名')}
                    </td>
                    <!-- 起造人 / 負責人 -->
                    <td class="py-2.5 px-3 text-[#38342D] font-medium whitespace-nowrap text-xs">
                        <span>\${escapeHtml(p.builder || '--')}</span>
                        \${repBadge}
                    </td>
                    <!-- 戶數規模 (總戶數 + 下方顯示已售戶數) -->
                    <td class="py-2.5 px-2 text-center whitespace-nowrap">
                        <div class="font-mono font-bold text-xs text-[#1C1B18]">\${p.household ? p.household + ' 戶' : '--'}</div>
                        <div class="text-[10.5px] font-semibold \${isSoldOut ? 'text-[#2C4A24] font-bold' : (hasSales ? 'text-[#4A5D44]' : 'text-[#7A7366]')}">
                            \${isSoldOut ? '已完銷' : (hasSales ? \`已售 \${s.soldUnits} 戶\` : '尚無實登')}
                        </div>
                    </td>
                    <!-- 實登銷售率 -->
                    <td class="py-2.5 px-2 text-center whitespace-nowrap">
                        \${hasSales ? (isSoldOut ? \`
                        <span class="font-mono font-bold text-xs text-[#2C4A24] bg-[#EEF4EC] px-2 py-0.5 rounded-md border border-[#BDD9B4]">完銷 100%</span>
                        \` : \`
                        <div class="inline-flex items-center gap-1">
                            <div class="w-10 sm:w-12 h-1.5 bg-[#EAE4D8] rounded-full overflow-hidden">
                                <div class="h-full bg-[#4A5D44] rounded-full" style="width: \${s.salesRate}%"></div>
                            </div>
                            <span class="font-mono font-bold text-xs text-[#4A5D44]">\${s.salesRate}%</span>
                        </div>
                        \`) : \`<span class="text-xs text-[#7A7366]">--</span>\`}
                    </td>
                    <!-- 實登平均單價 -->
                    <td class="py-2.5 px-2 text-center whitespace-nowrap">
                        \${hasSales && s.avgPricePerPing ? \`
                        <div>
                            <span class="font-mono font-bold text-xs text-[#7A5338]">\${s.avgPricePerPing}</span>
                            <span class="text-[10px] text-[#6E675B]">萬/坪</span>
                        </div>
                        \` : \`<span class="text-xs text-[#7A7366]">--</span>\`}
                    </td>
                    <!-- 坐落街道 -->
                    <td class="py-2.5 px-3 text-[#423E37] max-w-xs truncate text-xs" title="\${escapeHtml(p.location || p.mainLand || '')}">
                        \${escapeHtml(p.location || p.mainLand || '--')}
                    </td>
                    <!-- 建照核發日 -->
                    <td class="py-2.5 px-3 text-[#1C1B18] font-mono font-medium whitespace-nowrap text-xs">
                        \${p.permitDate || '--'}
                    </td>
                \`;
                tbody.appendChild(tr);
            });
        }

        /* ── BUILDERS DIRECTORY: BEAUTIFUL WABI-SABI CARDS & TABLE ── */
        function switchBuilderViewMode(mode) {
            builderViewMode = mode;
            const cardBtn = document.getElementById('builderCardModeBtn');
            const tableBtn = document.getElementById('builderTableModeBtn');
            const cardsBox = document.getElementById('buildersCardsContainer');
            const tableBox = document.getElementById('buildersTableContainer');

            if (mode === 'cards') {
                cardBtn.className = 'px-3 py-1 rounded-lg bg-[#FFFFFF] text-[#1C1B18] shadow-xs font-bold transition';
                tableBtn.className = 'px-3 py-1 rounded-lg text-[#5C564C] hover:text-[#1C1B18] transition';
                cardsBox.classList.remove('hidden');
                tableBox.classList.add('hidden');
            } else {
                tableBtn.className = 'px-3 py-1 rounded-lg bg-[#FFFFFF] text-[#1C1B18] shadow-xs font-bold transition';
                cardBtn.className = 'px-3 py-1 rounded-lg text-[#5C564C] hover:text-[#1C1B18] transition';
                tableBox.classList.remove('hidden');
                cardsBox.classList.add('hidden');
            }
            renderBuildersView();
        }

        function renderBuildersView() {
            if (builderViewMode === 'cards') {
                renderBuildersCards();
            } else {
                renderBuildersTable();
            }
        }

        function renderBuildersCards() {
            const container = document.getElementById('buildersCardsContainer');
            container.innerHTML = '';

            filteredBuilders.forEach(b => {
                const card = document.createElement('div');
                card.className = 'wabi-card';

                const repText = b.representative || '未載明';
                const uniText = b.unifiedNo || '個人起造';
                const townsList = (b.towns || []).slice(0, 3).map(t => \`<span class="px-2 py-0.5 bg-[#FAF8F5] text-[#423E37] rounded-md border border-[#DCD4C5] text-[11px]">\${t}</span>\`).join(' ');
                const casesPreview = (b.cases || []).slice(0, 3).map(c => escapeHtml(c.caseName)).join('、');

                card.innerHTML = \`
                    <div>
                        <!-- Header -->
                        <div class="flex items-start justify-between gap-2 mb-2.5">
                            <div>
                                <h3 class="text-base sm:text-lg font-serif-tc font-black text-[#1C1B18] tracking-wide">
                                    \${escapeHtml(b.builderName)}
                                </h3>
                                <div class="flex items-center gap-1.5 mt-0.5">
                                    <span class="text-[11px] font-mono font-semibold text-[#6E675B]">\${uniText}</span>
                                    <span class="text-[10.5px] px-1.5 py-0.2 rounded font-bold \${b.status === '核准設立' ? 'bg-[#EEF4EC] text-[#2C4A24] border border-[#BDD9B4]' : 'bg-[#FAF8F5] text-[#7A7366] border border-[#DCD4C5]'}">
                                        \${b.status || '核准設立'}
                                    </span>
                                </div>
                            </div>
                            <span class="badge bg-[#1C1B18] text-[#FAF8F5] font-mono text-xs shrink-0 font-bold">
                                \${b.caseCount} 案 · \${b.totalHouseholds ? b.totalHouseholds + '戶' : ''}
                            </span>
                        </div>

                        <!-- Key Highlight Grid -->
                        <div class="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD4C5] mb-3 text-xs">
                            <div>
                                <span class="text-[#6E675B] block font-medium text-[11px]">負責人 / 代表人</span>
                                <span class="text-sm font-serif-tc font-bold text-[#7A5338] mt-0.5 block">
                                    \${escapeHtml(repText)}
                                </span>
                            </div>
                            <div>
                                <span class="text-[#6E675B] block font-medium text-[11px]">登記資本額</span>
                                <span class="text-xs font-semibold text-[#1C1B18] font-mono mt-0.5 block">
                                    \${b.capital || '未提供'}
                                </span>
                            </div>
                        </div>

                        <!-- 推案區域與代表作 -->
                        <div class="space-y-1.5 text-xs text-[#423E37] mb-3">
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="text-[#7A7366] shrink-0 text-[11px]">推案區域：</span>
                                \${townsList || '<span class="text-[#7A7366]">宜蘭全縣</span>'}
                            </div>
                            \${casesPreview ? \`
                            <div class="flex items-start gap-1.5 text-[11.5px]">
                                <span class="text-[#7A7366] shrink-0">代表建案：</span>
                                <span class="text-[#1C1B18] font-medium truncate" title="\${casesPreview}">\${casesPreview}</span>
                            </div>
                            \` : ''}
                        </div>
                    </div>

                    <!-- Footer Action -->
                    <div class="pt-2.5 border-t border-[#EBE5DA] flex items-center justify-between text-xs">
                        <span class="text-[#7A7366] text-[11px] truncate max-w-[140px]" title="\${escapeHtml(b.address || '')}">
                            \${escapeHtml(b.address || '未登錄地址')}
                        </span>
                        <button onclick="filterBySpecificBuilder('\${escapeHtml(b.builderName)}')" class="px-3 py-1 bg-[#1C1B18] hover:bg-[#38342D] text-[#FAF8F5] rounded-lg font-semibold text-xs transition shadow-xs">
                            查推案 (\${b.caseCount}) ➔
                        </button>
                    </div>
                \`;
                container.appendChild(card);
            });
        }

        function renderBuildersTable() {
            const tbody = document.getElementById('buildersTableBody');
            tbody.innerHTML = '';

            filteredBuilders.forEach(b => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-[#FAF8F5] transition text-xs sm:text-sm';

                tr.innerHTML = \`
                    <td class="py-3 px-3.5 font-serif-tc font-black text-[#1C1B18]">
                        \${escapeHtml(b.builderName)}
                        \${b.status && b.status !== '核准設立' ? \`<span class="text-[10px] text-[#992E2E] bg-[#FDF2F2] px-1.5 py-0.2 rounded border border-[#F5C2C2] ml-1">\${b.status}</span>\` : ''}
                    </td>
                    <td class="py-3 px-3 font-serif-tc font-bold text-[#7A5338] whitespace-nowrap">
                        \${escapeHtml(b.representative || '未提供')}
                    </td>
                    <td class="py-3 px-3 font-mono text-[#423E37] font-semibold whitespace-nowrap text-xs">
                        \${b.unifiedNo || '無/個人'}
                    </td>
                    <td class="py-3 px-2.5 text-center font-mono font-bold text-sm text-[#1C1B18]">
                        \${b.caseCount}
                    </td>
                    <td class="py-3 px-2.5 text-center font-mono text-[#38342D] text-xs">
                        \${b.totalHouseholds ? b.totalHouseholds.toLocaleString() + ' 戶' : '--'}
                    </td>
                    <td class="py-3 px-3 text-xs text-[#423E37] font-mono whitespace-nowrap">
                        \${b.capital || '未提供'}
                    </td>
                    <td class="py-3 px-3 text-xs text-[#6E675B] max-w-xs truncate" title="\${escapeHtml(b.address || '')}">
                        \${escapeHtml(b.address || '未提供')}
                    </td>
                    <td class="py-3 px-3 text-center whitespace-nowrap">
                        <button onclick="filterBySpecificBuilder('\${escapeHtml(b.builderName)}')" class="px-2.5 py-1 bg-[#FFFFFF] border border-[#D0C7B8] hover:bg-[#EAE4D8] text-[#1C1B18] rounded-lg font-bold text-xs transition shadow-xs">
                            查建案 (\${b.caseCount})
                        </button>
                    </td>
                \`;
                tbody.appendChild(tr);
            });
        }

        function filterBuilders() {
            const kw = (document.getElementById('builderKeyword').value || '').trim().toLowerCase();
            if (!kw) {
                filteredBuilders = [...allBuilders];
            } else {
                filteredBuilders = allBuilders.filter(b => {
                    const searchStr = \`\${b.builderName} \${b.representative || ''} \${b.unifiedNo || ''} \${b.address || ''} \${(b.towns || []).join(' ')}\`.toLowerCase();
                    return searchStr.includes(kw);
                });
            }
            renderBuildersView();
        }

        function filterBySpecificBuilder(builderName) {
            switchView('search');
            document.getElementById('filterBuilder').value = builderName;
            document.getElementById('globalKeyword').value = '';
            selectedTown = '全部';
            buildTownPills();
            performSearch();
            window.scrollTo({ top: 350, behavior: 'smooth' });
        }

        function renderPaginationControls(totalPages) {
            const controls = document.getElementById('paginationControls');
            controls.innerHTML = '';
            if (totalPages <= 1) return;

            const prevBtn = document.createElement('button');
            prevBtn.className = \`px-2.5 py-1 rounded-lg border text-xs font-semibold \${currentPage === 1 ? 'opacity-30 cursor-not-allowed bg-[#FAF8F5]' : 'bg-[#FFFFFF] hover:bg-[#EAE4D8] text-[#38342D] border-[#D0C7B8]'}\`;
            prevBtn.innerHTML = '‹ 上頁';
            prevBtn.disabled = currentPage === 1;
            prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderResults(); window.scrollTo({top: 200, behavior: 'smooth'}); } };
            controls.appendChild(prevBtn);

            let startP = Math.max(1, currentPage - 2);
            let endP = Math.min(totalPages, startP + 4);
            if (endP - startP < 4) startP = Math.max(1, endP - 4);

            for (let i = startP; i <= endP; i++) {
                const btn = document.createElement('button');
                btn.className = \`px-2.5 py-1 rounded-lg border text-xs font-bold font-mono \${i === currentPage ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18] shadow-xs' : 'bg-[#FFFFFF] hover:bg-[#EAE4D8] text-[#38342D] border-[#D0C7B8]'}\`;
                btn.innerText = i;
                btn.onclick = () => { currentPage = i; renderResults(); window.scrollTo({top: 200, behavior: 'smooth'}); };
                controls.appendChild(btn);
            }

            const nextBtn = document.createElement('button');
            nextBtn.className = \`px-2.5 py-1 rounded-lg border text-xs font-semibold \${currentPage === totalPages ? 'opacity-30 cursor-not-allowed bg-[#FAF8F5]' : 'bg-[#FFFFFF] hover:bg-[#EAE4D8] text-[#38342D] border-[#D0C7B8]'}\`;
            nextBtn.innerHTML = '下頁 ›';
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderResults(); window.scrollTo({top: 200, behavior: 'smooth'}); } };
            controls.appendChild(nextBtn);
        }

        function switchResultMode(mode) {
            resultViewMode = mode;
            const cardBtn = document.getElementById('viewCardBtn');
            const tableBtn = document.getElementById('viewTableBtn');
            if (mode === 'cards') {
                cardBtn.className = 'px-3 py-1 rounded-lg bg-[#FFFFFF] text-[#1C1B18] shadow-xs transition flex items-center gap-1 font-bold';
                tableBtn.className = 'px-3 py-1 rounded-lg text-[#5C564C] hover:text-[#1C1B18] transition flex items-center gap-1';
            } else {
                tableBtn.className = 'px-3 py-1 rounded-lg bg-[#FFFFFF] text-[#1C1B18] shadow-xs transition flex items-center gap-1 font-bold';
                cardBtn.className = 'px-3 py-1 rounded-lg text-[#5C564C] hover:text-[#1C1B18] transition flex items-center gap-1';
            }
            updateSortUI();
            renderResults();
        }

        function switchView(view) {
            currentView = view;
            const searchView = document.getElementById('searchView');
            const buildersView = document.getElementById('buildersView');
            const statsView = document.getElementById('statsView');

            const searchBtn = document.getElementById('tabSearchBtn');
            const buildersBtn = document.getElementById('tabBuildersBtn');
            const statsBtn = document.getElementById('tabStatsBtn');

            [searchBtn, buildersBtn, statsBtn].forEach(btn => {
                btn.className = 'px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-[#38342D] hover:bg-[#EAE4D8] border border-[#DCD4C5] bg-[#FFFFFF] flex items-center gap-1.5 transition';
            });

            searchView.classList.add('hidden');
            buildersView.classList.add('hidden');
            statsView.classList.add('hidden');

            if (view === 'search') {
                searchView.classList.remove('hidden');
                searchBtn.className = 'px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#1C1B18] text-[#FAF8F5] flex items-center gap-1.5 transition shadow-xs';
            } else if (view === 'builders') {
                buildersView.classList.remove('hidden');
                buildersBtn.className = 'px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#1C1B18] text-[#FAF8F5] flex items-center gap-1.5 transition shadow-xs';
                renderBuildersView();
            } else {
                statsView.classList.remove('hidden');
                statsBtn.className = 'px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#1C1B18] text-[#FAF8F5] flex items-center gap-1.5 transition shadow-xs';
                renderStatsCharts();
            }
        }

        function openDetailModal(id) {
            const p = allProjects.find(item => item.id === id);
            if (!p) return;
            activeModalProject = p;

            const z = p.zoningInfo;
            const bInfo = buildersMap[p.builder];
            const s = p.salesStats || {};
            const hasSales = s.hasSalesData && s.soldUnits > 0;

            document.getElementById('modalTownBadge').innerText = p.town || '宜蘭縣';
            document.getElementById('modalPlanBadge').innerText = z.planTypeShort || '土地分區';
            document.getElementById('modalNumberCode').innerText = p.numberCode ? \`備查編號: \${p.numberCode}\` : '';
            document.getElementById('modalCaseName').innerText = p.caseName || '未命名建案';
            document.getElementById('modalBuilderHeader').innerText = \`起造人：\${p.builder || '未提供'}\`;
            
            const statusBadge = document.getElementById('modalSalesStatusBadge');
            const progBar = document.getElementById('modalProgressBar');
            if (hasSales) {
                document.getElementById('modalSalesCountText').innerText = \`實登已售 \${s.soldUnits} / \${s.totalHouseholds || s.soldUnits} 戶\`;
                document.getElementById('modalSalesRateText').innerText = \`\${s.salesRate}%\`;
                progBar.style.width = \`\${s.salesRate}%\`;
                
                if (s.salesRate >= 90) {
                    statusBadge.className = 'px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#EEF4EC] text-[#2C4A24] border border-[#BDD9B4]';
                    statusBadge.innerText = '熱銷完銷倒數';
                    progBar.className = 'h-full bg-[#4A5D44] progress-bar-fill rounded-full';
                } else {
                    statusBadge.className = 'px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#F7EFE8] text-[#7A5338] border border-[#DECDBE]';
                    statusBadge.innerText = '熱烈銷售中';
                    progBar.className = 'h-full bg-[#7A5338] progress-bar-fill rounded-full';
                }

                document.getElementById('modalAvgPricePing').innerText = \`\${s.avgPricePerPing} 萬/坪\`;
                document.getElementById('modalPriceRangePing').innerText = \`\${s.minPricePerPing} ~ \${s.maxPricePerPing} 萬/坪\`;
                document.getElementById('modalAvgTotalPrice').innerText = \`\${s.avgTotalPrice ? s.avgTotalPrice.toLocaleString() + ' 萬元' : '--'}\`;
                document.getElementById('modalLatestTransDate').innerText = s.latestTransactionDate || '--';
            } else {
                document.getElementById('modalSalesCountText').innerText = '實登已售 0 戶 (尚未登錄或剛公開)';
                document.getElementById('modalSalesRateText').innerText = '0%';
                progBar.style.width = '0%';
                statusBadge.className = 'px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#FAF8F5] text-[#7A7366] border border-[#DCD4C5]';
                statusBadge.innerText = '尚無實登交易';

                document.getElementById('modalAvgPricePing').innerText = '--';
                document.getElementById('modalPriceRangePing').innerText = '--';
                document.getElementById('modalAvgTotalPrice').innerText = '--';
                document.getElementById('modalLatestTransDate').innerText = '尚無成交';
            }

            // Populate Transactions Ledger Table
            const txBody = document.getElementById('modalTransactionsTableBody');
            txBody.innerHTML = '';
            const txList = s.transactions || [];
            document.getElementById('modalTransCountBadge').innerText = \`\${txList.length} 筆交易\`;

            if (txList.length === 0) {
                txBody.innerHTML = '<tr><td colspan="8" class="text-center py-5 text-[#7A7366]">目前尚未有實價登錄成交明細紀錄</td></tr>';
            } else {
                txList.slice(0, 60).forEach(tx => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-[#FAF8F5] transition text-xs';
                    row.innerHTML = \`
                        <td class="py-2 px-2.5 font-mono font-medium text-[#1C1B18] whitespace-nowrap">\${tx.dateRoc || '--'}</td>
                        <td class="py-2 px-2.5 font-medium text-[#38342D] max-w-xs truncate" title="\${escapeHtml(tx.unit)}">\${escapeHtml(tx.unit || '未揭示')}</td>
                        <td class="py-2 px-2 text-center font-mono text-[#6E675B]">\${tx.floor ? tx.floor + 'F' : '--'}</td>
                        <td class="py-2 px-2 text-right font-mono">\${tx.areaPing ? tx.areaPing + ' 坪' : '--'}</td>
                        <td class="py-2 px-2 text-right font-mono font-bold text-[#7A5338]">\${tx.pricePerPing ? tx.pricePerPing + ' 萬' : '--'}</td>
                        <td class="py-2 px-2 text-right font-mono font-bold text-[#1C1B18]">\${tx.totalPrice ? tx.totalPrice.toLocaleString() + ' 萬' : '--'}</td>
                        <td class="py-2 px-2 text-center text-[#6E675B] whitespace-nowrap">\${tx.layout || '--'}</td>
                        <td class="py-2 px-2 text-[#7A7366] text-[10.5px] whitespace-nowrap">\${tx.parking || '無車位'}</td>
                    \`;
                    txBody.appendChild(row);
                });
            }

            // Populate Land Acquisition Stats (基地原始購地實價紀錄)
            const l = p.landStats || {};
            const landBody = document.getElementById('modalLandTableBody');
            landBody.innerHTML = '';

            if (l.hasLandData && l.txCount > 0) {
                document.getElementById('modalLandTxCountBadge').innerText = \`\${l.txCount} 筆購地交易\`;
                document.getElementById('modalAvgLandPrice').innerText = \`\${l.avgLandPricePerPing} 萬/坪\`;
                document.getElementById('modalTotalLandCost').innerText = \`\${l.totalLandCostWan ? l.totalLandCostWan.toLocaleString() + ' 萬元' : '--'}\`;
                document.getElementById('modalTotalLandArea').innerText = \`\${l.totalLandAreaPing ? l.totalLandAreaPing.toLocaleString() + ' 坪' : '--'}\`;
                document.getElementById('modalLatestLandDate').innerText = l.latestLandDate || '--';

                (l.transactions || []).forEach(tx => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-[#FAF8F5] transition text-xs';
                    row.innerHTML = \`
                        <td class="py-2 px-2.5 font-mono font-medium text-[#1C1B18] whitespace-nowrap">\${tx.dateRoc || '--'}</td>
                        <td class="py-2 px-2.5 font-medium text-[#38342D] max-w-xs truncate" title="\${escapeHtml(tx.landParcel)}">\${escapeHtml(tx.landParcel || '未揭示')}</td>
                        <td class="py-2 px-2 text-right font-mono">\${tx.areaPing ? tx.areaPing + ' 坪' : '--'}</td>
                        <td class="py-2 px-2 text-right font-mono font-bold text-[#2C4A24]">\${tx.pricePerPing ? tx.pricePerPing + ' 萬' : '--'}</td>
                        <td class="py-2 px-2 text-right font-mono font-bold text-[#1C1B18]">\${tx.totalPrice ? tx.totalPrice.toLocaleString() + ' 萬' : '--'}</td>
                        <td class="py-2 px-2 text-[#7A7366] text-[10.5px] max-w-xs truncate" title="\${escapeHtml(tx.note || '')}">\${escapeHtml(tx.note || '無特殊備註')}</td>
                    \`;
                    landBody.appendChild(row);
                });
            } else {
                document.getElementById('modalLandTxCountBadge').innerText = '無購地揭露';
                document.getElementById('modalAvgLandPrice').innerText = '--';
                document.getElementById('modalTotalLandCost').innerText = '--';
                document.getElementById('modalTotalLandArea').innerText = '--';
                document.getElementById('modalLatestLandDate').innerText = '無紀錄';
                landBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-[#7A7366]">實價登錄暫無此基地在建照核發前之土地獨立買賣揭露紀錄（可能為地主合建、自地自建或早期取得）</td></tr>';
            }

            // Builder Info
            if (bInfo) {
                document.getElementById('modalBuilderRep').innerText = bInfo.representative || '自然人/未提供';
                document.getElementById('modalBuilderUni').innerText = \`\${bInfo.unifiedNo || '無統編'} (\${bInfo.status || '核准設立'})\`;
                document.getElementById('modalBuilderCap').innerText = bInfo.capital || '未提供';
                document.getElementById('modalBuilderAddr').innerText = bInfo.address || '未提供公司地址';
            } else {
                document.getElementById('modalBuilderRep').innerText = p.builder || '未提供';
                document.getElementById('modalBuilderUni').innerText = '未建立工商登記';
                document.getElementById('modalBuilderCap').innerText = '未提供';
                document.getElementById('modalBuilderAddr').innerText = '未提供';
            }

            document.getElementById('modalHousehold').innerText = p.household ? \`\${p.household} 戶\` : '未填寫';
            document.getElementById('modalHouseholdSoldSub').innerText = hasSales ? \`已銷售 \${s.soldUnits} 戶 (去化率 \${s.salesRate}%)\` : '尚無實登交易';
            
            document.getElementById('modalMainUse').innerText = p.normalizedUse || '住宅';
            document.getElementById('modalMaterial').innerText = p.normalizedMaterial || 'RC';
            document.getElementById('modalPermitDate').innerText = p.permitDate || '未填寫';
            document.getElementById('modalDeclareDate').innerText = p.declareDate || '未填寫';
            document.getElementById('modalFirstRegDate').innerText = p.firstRegDate || '尚未登記';
            
            document.getElementById('modalStreetLocation').innerText = \`坐落位置：\${p.town || ''} \${p.location || '無街道路名'}\`;
            document.getElementById('modalMainLand').innerText = \`基地地號：\${p.mainLand || '無'}\`;

            const mapQuery = encodeURIComponent(\`宜蘭縣 \${p.town || ''} \${p.location || p.mainLand || p.caseName}\`);
            document.getElementById('modalMapLink').href = \`https://www.google.com/maps/search/?api=1&query=\${mapQuery}\`;

            document.getElementById('detailModal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('detailModal').classList.add('hidden');
            activeModalProject = null;
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        function copyModalCaseSummary() {
            if (!activeModalProject) return;
            const p = activeModalProject;
            const z = p.zoningInfo;
            const bInfo = buildersMap[p.builder];
            const s = p.salesStats || {};
            const l = p.landStats || {};

            const landText = l.hasLandData ? \`\${l.avgLandPricePerPing} 萬/坪 (總地價: \${l.totalLandCostWan ? l.totalLandCostWan.toLocaleString() + '萬元' : '--'}, 成交日: \${l.latestLandDate || '--'})\` : '無獨立購地揭露';

            const text = \`【宜蘭建案實登檔案 - \${p.caseName}】
■ 鄉鎮地區：\${p.town}
■ 起造建商：\${p.builder}
■ 建商負責人：\${bInfo?.representative || '自然人/未載明'}
■ 總戶數量：\${p.household ? p.household + ' 戶' : '未填寫'}
■ 實登已售戶數：\${s.soldUnits || 0} 戶 (銷售率: \${s.salesRate || 0}%)
■ 實登平均單價：\${s.avgPricePerPing ? s.avgPricePerPing + ' 萬/坪' : '尚無成交'} (\${s.minPricePerPing || 0}~\${s.maxPricePerPing || 0} 萬/坪)
■ 實登平均總價：\${s.avgTotalPrice ? s.avgTotalPrice + ' 萬元' : '--'}
■ 基地購地地價：\${landText}
■ 土地分區：\${z.category} (\${z.planType})
■ 坐落街道：\${p.location || '無'}
■ 主要基地：\${p.mainLand || '無'}
■ 建照核發：\${p.permitDate || '無'} (\${p.permitNo || '無字號'})
■ 申報備查：\${p.declareDate || '無'}\`;

            navigator.clipboard.writeText(text).then(() => {
                showToast('建案銷售檔案已複製至剪貼簿');
            }).catch(() => {
                showToast('複製失敗，請手動複製');
            });
        }

        function showToast(msg) {
            const toast = document.getElementById('toastNotification');
            document.getElementById('toastMessage').innerText = msg;
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 2200);
        }

        function exportCurrentViewToExcel() {
            if (currentView === 'builders') {
                exportBuildersDatabaseToExcel();
            } else {
                exportCasesToExcel();
            }
        }

        function exportCasesToExcel() {
            if (!filteredProjects || filteredProjects.length === 0) {
                showToast('目前沒有可匯出的建案資料！');
                return;
            }

            const exportData = filteredProjects.map((p, idx) => {
                const bInfo = buildersMap[p.builder];
                const s = p.salesStats || {};
                const l = p.landStats || {};
                return {
                    '序號': idx + 1,
                    '鄉鎮市區': p.town,
                    '建案名稱': p.caseName,
                    '起造建商': p.builder,
                    '建商負責人': bInfo?.representative || '未提供',
                    '申報總戶數': p.household || '未填寫',
                    '實價登錄已售戶數': s.hasSalesData ? s.soldUnits : 0,
                    '銷售率(%)': s.hasSalesData ? \`\${s.salesRate}%\` : '尚無實登',
                    '建案平均單價(萬/坪)': s.hasSalesData && s.avgPricePerPing ? s.avgPricePerPing : '--',
                    '建案單價區間(萬/坪)': s.hasSalesData && s.minPricePerPing ? \`\${s.minPricePerPing} ~ \${s.maxPricePerPing}\` : '--',
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

            if (typeof XLSX !== 'undefined') {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, '宜蘭建案實價登錄銷售統計');
                const filename = \`宜蘭建案實價登錄銷售統計_\${selectedTown}_\${new Date().toISOString().slice(0, 10)}.xlsx\`;
                XLSX.writeFile(wb, filename);
                showToast(\`已匯出 \${filteredProjects.length} 筆建案資料至 Excel\`);
            }
        }

        function exportBuildersDatabaseToExcel() {
            if (!filteredBuilders || filteredBuilders.length === 0) {
                showToast('目前沒有可匯出的建商資料！');
                return;
            }

            const exportData = filteredBuilders.map((b, idx) => ({
                '編號': idx + 1,
                '起造人 / 公司名稱': b.builderName,
                '負責人 / 代表人': b.representative || '未提供',
                '統一編號': b.unifiedNo || '無/個人',
                '登記現況': b.status || '核准設立',
                '資本額': b.capital || '未提供',
                '公司地址': b.address || '未提供',
                '宜蘭推案量 (案)': b.caseCount,
                '累計總戶數 (戶)': b.totalHouseholds,
                '主要推案區域': (b.towns || []).join('、'),
                '代表建案列表': (b.cases || []).map(c => \`\${c.caseName}(\${c.town || ''},\${c.household || 0}戶)\`).slice(0, 10).join('; ')
            }));

            if (typeof XLSX !== 'undefined') {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, '宜蘭建商公司與負責人名冊');
                const filename = \`宜蘭建商與負責人名冊_\${new Date().toISOString().slice(0, 10)}.xlsx\`;
                XLSX.writeFile(wb, filename);
                showToast(\`已匯出 \${filteredBuilders.length} 家建商名冊至 Excel\`);
            }
        }

        function renderStatsCharts() {
            if (typeof Chart === 'undefined') return;

            Chart.defaults.font.family = "'Noto Sans TC', sans-serif";
            Chart.defaults.color = '#5C564C';
            Chart.defaults.font.size = 12;

            // 1. 各鄉鎮推案量
            const townCounts = {};
            allProjects.forEach(p => {
                const t = p.town || '未分類';
                townCounts[t] = (townCounts[t] || 0) + 1;
            });
            const sortedTowns = Object.entries(townCounts).sort((a, b) => b[1] - a[1]);

            if (chartInstances.town) chartInstances.town.destroy();
            const ctxTown = document.getElementById('chartTownCases').getContext('2d');
            chartInstances.town = new Chart(ctxTown, {
                type: 'bar',
                data: {
                    labels: sortedTowns.map(t => t[0]),
                    datasets: [{
                        label: '建案數量 (案)',
                        data: sortedTowns.map(t => t[1]),
                        backgroundColor: '#7A5338',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#EAE4D8' }, border: { dash: [4, 4] } },
                        x: { grid: { display: false } }
                    }
                }
            });

            // 2. 各鄉鎮實登平均單價排行
            const townPrices = {};
            allProjects.forEach(p => {
                const t = p.town || '未分類';
                if (p.salesStats?.avgPricePerPing > 0) {
                    if (!townPrices[t]) townPrices[t] = [];
                    townPrices[t].push(p.salesStats.avgPricePerPing);
                }
            });
            const townAvgList = Object.entries(townPrices).map(([t, arr]) => ({
                town: t,
                avg: (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
            })).sort((a, b) => b.avg - a.avg);

            if (chartInstances.townPrice) chartInstances.townPrice.destroy();
            const ctxTownPrice = document.getElementById('chartTownPrice').getContext('2d');
            chartInstances.townPrice = new Chart(ctxTownPrice, {
                type: 'bar',
                data: {
                    labels: townAvgList.map(t => t.town),
                    datasets: [{
                        label: '平均單價 (萬/坪)',
                        data: townAvgList.map(t => t.avg),
                        backgroundColor: '#8C6D2B',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#EAE4D8' }, border: { dash: [4, 4] } },
                        x: { grid: { display: false } }
                    }
                }
            });

            // 3. 分區結構
            const zCounts = {};
            allProjects.forEach(p => {
                const c = p.zoningInfo.category || '未分類';
                zCounts[c] = (zCounts[c] || 0) + 1;
            });
            const sortedZ = Object.entries(zCounts).sort((a, b) => b[1] - a[1]);

            if (chartInstances.zoning) chartInstances.zoning.destroy();
            const ctxZ = document.getElementById('chartZoningDistribution').getContext('2d');
            chartInstances.zoning = new Chart(ctxZ, {
                type: 'bar',
                data: {
                    labels: sortedZ.map(x => x[0]),
                    datasets: [{
                        label: '推案數量',
                        data: sortedZ.map(x => x[1]),
                        backgroundColor: [
                            '#7A5338', '#4A5D44', '#8C6D2B', '#3D5266', '#8C4B30',
                            '#6B5E4F', '#465E48', '#826B50', '#4A5B69', '#73614F'
                        ],
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { beginAtZero: true, grid: { color: '#EAE4D8' }, border: { dash: [4, 4] } },
                        y: { grid: { display: false } }
                    }
                }
            });

            // 4. 活躍建商
            const builderCounts = {};
            allProjects.forEach(p => {
                if (p.builder) builderCounts[p.builder] = (builderCounts[p.builder] || 0) + 1;
            });
            const top10Builders = Object.entries(builderCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

            if (chartInstances.builder) chartInstances.builder.destroy();
            const ctxBuilder = document.getElementById('chartTopBuilders').getContext('2d');
            chartInstances.builder = new Chart(ctxBuilder, {
                type: 'bar',
                data: {
                    labels: top10Builders.map(b => {
                        const bInfo = buildersMap[b[0]];
                        return bInfo?.representative ? \`\${b[0]} (\${bInfo.representative})\` : b[0];
                    }),
                    datasets: [{
                        label: '推案數量',
                        data: top10Builders.map(b => b[1]),
                        backgroundColor: '#3D5266',
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { beginAtZero: true, grid: { color: '#EAE4D8' }, border: { dash: [4, 4] } },
                        y: { grid: { display: false } }
                    }
                }
            });
        }

        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    </script>
</body>
</html>`;

    fs.writeFileSync(htmlPath, htmlTemplate, 'utf-8');
    fs.writeFileSync(indexPath, htmlTemplate, 'utf-8');
    console.log('✓ 成功編譯產出最新 index.html 與 宜蘭建案檢索系統.html！');
}

if (require.main === module) {
    buildHTML();
}

module.exports = { buildHTML };
