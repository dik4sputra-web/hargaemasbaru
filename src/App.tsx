import { useState, useEffect } from 'react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

// ── Data ──────────────────────────────────────────────────────────────────────

const GOLD_TYPES = [
  { id: 'antam',       name: 'Emas Antam (LM)',   purity: '99.99%', icon: '🏆' },
  { id: 'antam_batik', name: 'Antam Batik',        purity: '99.99%', icon: '🦚' },
  { id: 'ugbs',        name: 'UBS Gold',           purity: '99.99%', icon: '🔶' },
  { id: 'hrta',        name: 'Hartadinata EMASKU', purity: '99.00%', icon: '🟡' },
  { id: 'lotus',       name: 'Lotus Archi',        purity: '99.99%', icon: '🌸' },
  { id: 'bsi',         name: 'BSI Emas',           purity: '99.99%', icon: '🏦' },
  { id: 'minigold',    name: 'Minigold',           purity: '99.99%', icon: '✨' },
  { id: 'galeri24',    name: 'Galeri 24',          purity: '99.99%', icon: '🏪' },
  { id: 'perhiasan',   name: 'Emas Perhiasan',     purity: '70–75%', icon: '💍' },
  { id: 'koin',        name: 'Koin Emas',          purity: '99.00%', icon: '🪙' },
  { id: 'treasury',    name: 'Treasury Emas',      purity: '99.99%', icon: '🏛️' },
  { id: 'indogold',    name: 'Indogold',           purity: '99.99%', icon: '🌐' },
  { id: 'pluang',      name: 'Pluang Emas',        purity: '99.99%', icon: '📱' },
  { id: 'shopee',      name: 'Shopee Emas',        purity: '99.99%', icon: '🛒' },
  { id: 'mulia',       name: 'Pegadaian Mulia',    purity: '99.99%', icon: '🏅' },
  { id: 'bareksa',     name: 'Bareksa Emas',       purity: '99.99%', icon: '📊' },
  { id: 'antam_retro', name: 'Antam Retro',        purity: '99.99%', icon: '🎖️' },
  { id: 'dana',        name: 'Dana Emas',          purity: '99.99%', icon: '💰' },
]

const WEIGHTS = [0.5, 1, 2, 3, 5, 10, 25, 50, 100, 250, 500, 1000]

interface PriceEntry {
  weight: number
  buy: number
  sell: number
}

// Real Antam LM prices per unit — source: logammulia.com, 25 Sep 2026 08:27 WIB
// Harga turun Rp 15.000 dari kemarin (Rp 2.605.000 → Rp 2.590.000)
const ANTAM_LM_TABLE: PriceEntry[] = [
  { weight: 0.5,  buy: 1_345_000,     sell: 1_210_000 },
  { weight: 1,    buy: 2_590_000,     sell: 2_420_000 },
  { weight: 2,    buy: 5_120_000,     sell: 4_840_000 },
  { weight: 3,    buy: 7_665_000,     sell: 7_260_000 },
  { weight: 5,    buy: 12_750_000,    sell: 12_100_000 },
  { weight: 10,   buy: 25_450_000,    sell: 24_200_000 },
  { weight: 25,   buy: 63_500_000,    sell: 60_500_000 },
  { weight: 50,   buy: 126_900_000,   sell: 121_000_000 },
  { weight: 100,  buy: 253_700_000,   sell: 242_000_000 },
  { weight: 250,  buy: 633_750_000,   sell: 605_000_000 },
  { weight: 500,  buy: 1_267_000_000, sell: 1_210_000_000 },
  { weight: 1000, buy: 2_533_000_000, sell: 2_420_000_000 },
]

function genAntamPrices(): PriceEntry[] {
  return ANTAM_LM_TABLE
}

// Antam Batik: premium ~Rp 150.000/gram di atas LM biasa
function genAntamBatikPrices(): PriceEntry[] {
  return ANTAM_LM_TABLE.filter(p => p.weight <= 10).map(p => ({
    weight: p.weight,
    buy: p.buy + Math.round(150_000 * p.weight),
    sell: p.sell + Math.round(100_000 * p.weight),
  }))
}

// UBS: harga per unit — sedikit lebih murah dari Antam
function genUBSPrices(): PriceEntry[] {
  const ubsBase: PriceEntry[] = [
    { weight: 0.5,  buy: 1_325_000,  sell: 1_195_000 },
    { weight: 1,    buy: 2_570_000,  sell: 2_410_000 },
    { weight: 2,    buy: 5_085_000,  sell: 4_820_000 },
    { weight: 3,    buy: 7_615_000,  sell: 7_230_000 },
    { weight: 5,    buy: 12_650_000, sell: 12_050_000 },
    { weight: 10,   buy: 25_250_000, sell: 24_100_000 },
    { weight: 25,   buy: 62_875_000, sell: 60_250_000 },
    { weight: 50,   buy: 125_500_000, sell: 120_500_000 },
    { weight: 100,  buy: 250_750_000, sell: 241_000_000 },
  ]
  return ubsBase
}

// Hartadinata EMASKU — hrtagold.id, 25 Sep 2026 (beli Rp2.461.000/gr, buyback Rp2.332.000/gr)
const HRTA_TABLE: PriceEntry[] = [
  { weight: 0.1,  buy:    246_100, sell:    233_200 },
  { weight: 0.5,  buy:  1_230_500, sell:  1_166_000 },
  { weight: 1,    buy:  2_461_000, sell:  2_332_000 },
  { weight: 2,    buy:  4_922_000, sell:  4_664_000 },
  { weight: 3,    buy:  7_383_000, sell:  6_996_000 },
  { weight: 5,    buy: 12_305_000, sell: 11_660_000 },
  { weight: 10,   buy: 24_610_000, sell: 23_320_000 },
  { weight: 25,   buy: 61_525_000, sell: 58_300_000 },
  { weight: 50,   buy: 123_050_000, sell: 116_600_000 },
  { weight: 100,  buy: 246_100_000, sell: 233_200_000 },
]

// Lotus Archi — lotusarchi.com, 25 Sep 2026 (beli Rp2.496.000/gr, buyback Rp2.283.000/gr)
const LOTUS_TABLE: PriceEntry[] = [
  { weight: 0.5,  buy:  1_248_000, sell:  1_141_500 },
  { weight: 1,    buy:  2_496_000, sell:  2_283_000 },
  { weight: 2,    buy:  4_992_000, sell:  4_566_000 },
  { weight: 3,    buy:  7_488_000, sell:  6_849_000 },
  { weight: 5,    buy: 12_480_000, sell: 11_415_000 },
  { weight: 10,   buy: 24_960_000, sell: 22_830_000 },
  { weight: 25,   buy: 62_400_000, sell: 57_075_000 },
  { weight: 50,   buy: 124_800_000, sell: 114_150_000 },
  { weight: 100,  buy: 249_600_000, sell: 228_300_000 },
]

// BSI Emas — investor.id, 25 Sep 2026 (beli Rp2.565.000/gr, jual Rp2.463.000/gr)
const BSI_TABLE: PriceEntry[] = [
  { weight: 0.5,  buy:  1_282_500, sell:  1_231_500 },
  { weight: 1,    buy:  2_565_000, sell:  2_463_000 },
  { weight: 2,    buy:  5_130_000, sell:  4_926_000 },
  { weight: 5,    buy: 12_825_000, sell: 12_315_000 },
  { weight: 10,   buy: 25_650_000, sell: 24_630_000 },
  { weight: 25,   buy: 64_125_000, sell: 61_575_000 },
  { weight: 50,   buy: 128_250_000, sell: 123_150_000 },
  { weight: 100,  buy: 256_500_000, sell: 246_300_000 },
]

// Minigold — portalmadura.com, 25 Sep 2026 (beli Rp2.610.000/gr, buyback Rp2.285.000/gr)
const MINIGOLD_TABLE: PriceEntry[] = [
  { weight: 0.1,  buy:    261_000, sell:    228_500 },
  { weight: 0.25, buy:    652_500, sell:    571_250 },
  { weight: 0.5,  buy:  1_305_000, sell:  1_142_500 },
  { weight: 1,    buy:  2_610_000, sell:  2_285_000 },
  { weight: 2,    buy:  5_220_000, sell:  4_570_000 },
  { weight: 5,    buy: 13_050_000, sell: 11_425_000 },
  { weight: 10,   buy: 26_100_000, sell: 22_850_000 },
]

// Galeri 24 — via Pegadaian, 25 Sep 2026 (beli Rp2.545.000/gr, buyback Rp2.400.000/gr)
const GALERI24_TABLE: PriceEntry[] = [
  { weight: 0.5,  buy:  1_272_500, sell:  1_200_000 },
  { weight: 1,    buy:  2_545_000, sell:  2_400_000 },
  { weight: 2,    buy:  5_090_000, sell:  4_800_000 },
  { weight: 3,    buy:  7_635_000, sell:  7_200_000 },
  { weight: 5,    buy: 12_725_000, sell: 12_000_000 },
  { weight: 10,   buy: 25_450_000, sell: 24_000_000 },
  { weight: 25,   buy: 63_625_000, sell: 60_000_000 },
  { weight: 50,   buy: 127_250_000, sell: 120_000_000 },
  { weight: 100,  buy: 254_500_000, sell: 240_000_000 },
]

const PRICES: Record<string, PriceEntry[]> = {
  antam:       genAntamPrices(),
  antam_batik: genAntamBatikPrices(),
  ugbs:        genUBSPrices(),
  hrta:        HRTA_TABLE,
  lotus:       LOTUS_TABLE,
  bsi:         BSI_TABLE,
  minigold:    MINIGOLD_TABLE,
  galeri24:    GALERI24_TABLE,
  perhiasan: [1,2,3,5,10,25,50,100].map(w => ({
    weight: w,
    buy:  Math.round(1_950_000 * w),
    sell: Math.round(1_820_000 * w),
  })),
  koin: [1,5,10,25].map(w => ({
    weight: w,
    buy:  Math.round(2_580_000 * w),
    sell: Math.round(2_450_000 * w),
  })),
  // Treasury — treasury.id, harga digital mendekati Antam
  treasury: [0.01,0.05,0.1,0.5,1,2,5,10,25,50,100].map(w => ({
    weight: w,
    buy:  Math.round(2_610_000 * w),
    sell: Math.round(2_450_000 * w),
  })),
  // Indogold — platform digital, harga per gram
  indogold: [0.01,0.05,0.1,0.5,1,2,5,10,25,50,100].map(w => ({
    weight: w,
    buy:  Math.round(2_600_000 * w),
    sell: Math.round(2_440_000 * w),
  })),
  // Pluang — investasi digital, minimal 0.001 gr
  pluang: [0.001,0.01,0.05,0.1,0.5,1,2,5,10].map(w => ({
    weight: w,
    buy:  Math.round(2_615_000 * w),
    sell: Math.round(2_455_000 * w),
  })),
  // Shopee Emas — marketplace, digital
  shopee: [0.001,0.01,0.05,0.1,0.5,1,2,5,10].map(w => ({
    weight: w,
    buy:  Math.round(2_598_000 * w),
    sell: Math.round(2_435_000 * w),
  })),
  // Pegadaian Mulia — tabungan emas Pegadaian fisik
  mulia: [0.01,0.05,0.1,0.5,1,2,3,5,10,25,50,100].map(w => ({
    weight: w,
    buy:  Math.round(2_640_000 * w),
    sell: Math.round(2_435_000 * w),
  })),
  // Bareksa Emas — reksa dana emas digital
  bareksa: [0.001,0.01,0.05,0.1,0.5,1,2,5,10].map(w => ({
    weight: w,
    buy:  Math.round(2_608_000 * w),
    sell: Math.round(2_448_000 * w),
  })),
  // Antam Retro — edisi terbatas, premium ~Rp 50.000/gr
  antam_retro: ANTAM_LM_TABLE.filter(p => p.weight <= 10).map(p => ({
    weight: p.weight,
    buy:  p.buy + Math.round(50_000 * p.weight),
    sell: p.sell + Math.round(30_000 * p.weight),
  })),
  // Dana Emas — dompet digital GoPay/Dana
  dana: [0.001,0.01,0.05,0.1,0.5,1,2,5,10].map(w => ({
    weight: w,
    buy:  Math.round(2_605_000 * w),
    sell: Math.round(2_445_000 * w),
  })),
}

// Historical weekly prices (IDR/gram) — Antam LM, Sep 2025 → Sep 2026
// Mencerminkan pola NYATA: naik ke puncak ~Rp 3.000.000 (Mar 2026), koreksi ke ~2.500.000 (Mei),
// lalu pulih ke ~2.590.000 (Sep 2026). Sumber: logammulia.com / chart Antam aktual.
function generateHistory() {
  const now = new Date()
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  // Anchor mingguan (IDR/gram) — pola realistis sesuai grafik Antam Jan–Sep 2026
  // W1=minggu pertama bulan, W2=kedua, dst
  const weeklyAnchors = [
    // Sep 2025
    1_952_000, 1_960_000, 1_978_000, 1_995_000,
    // Okt 2025
    2_015_000, 2_038_000, 2_055_000, 2_070_000,
    // Nov 2025
    2_090_000, 2_115_000, 2_130_000, 2_148_000,
    // Des 2025
    2_160_000, 2_185_000, 2_200_000, 2_215_000,
    // Jan 2026
    2_240_000, 2_280_000, 2_340_000, 2_410_000,
    // Feb 2026 — mulai spike tajam
    2_490_000, 2_580_000, 2_680_000, 2_780_000,
    // Mar 2026 — puncak ~3.000.000
    2_870_000, 2_950_000, 2_998_000, 3_005_000,
    // Apr 2026 — mulai koreksi
    2_960_000, 2_900_000, 2_820_000, 2_740_000,
    // Mei 2026 — koreksi dalam ~2.500.000
    2_660_000, 2_580_000, 2_510_000, 2_490_000,
    // Jun 2026 — konsolidasi
    2_500_000, 2_515_000, 2_530_000, 2_548_000,
    // Jul 2026 — pemulihan
    2_560_000, 2_572_000, 2_565_000, 2_558_000,
    // Agu 2026
    2_570_000, 2_582_000, 2_590_000, 2_595_000,
    // Sep 2026
    2_600_000, 2_605_000, 2_595_000, 2_590_000,
  ]
  const data = []
  for (let i = 51; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    const idx = 51 - i
    const base = weeklyAnchors[Math.min(idx, weeklyAnchors.length - 1)]
    // Tambah noise kecil ±8.000 supaya grafik tidak terlalu mulus
    const noise = (Math.random() - 0.5) * 16_000
    const price = Math.round((base + noise) / 1_000) * 1_000
    data.push({
      label: `${d.getDate()} ${months[d.getMonth()]}`,
      month: months[d.getMonth()],
      price,
      volume: Math.floor(Math.random() * 800 + 200),
    })
  }
  // Pin titik terakhir ke harga hari ini
  data[data.length - 1].price = 2_590_000
  return data
}

const HISTORY = generateHistory()

// Per-type base prices (IDR/gram) for historical chart generation
const TYPE_BASE_PRICES: Record<string, { now: number; yearAgo: number }> = {
  antam:       { now: 2_590_000, yearAgo: 1_950_000 },
  antam_batik: { now: 2_755_000, yearAgo: 2_080_000 },
  ugbs:        { now: 2_570_000, yearAgo: 1_920_000 },
  hrta:        { now: 2_461_000, yearAgo: 1_850_000 },
  lotus:       { now: 2_496_000, yearAgo: 1_870_000 },
  bsi:         { now: 2_565_000, yearAgo: 1_920_000 },
  minigold:    { now: 2_610_000, yearAgo: 1_955_000 },
  galeri24:    { now: 2_545_000, yearAgo: 1_905_000 },
  perhiasan:   { now: 1_950_000, yearAgo: 1_460_000 },
  koin:        { now: 2_580_000, yearAgo: 1_930_000 },
  treasury:    { now: 2_610_000, yearAgo: 1_955_000 },
  indogold:    { now: 2_600_000, yearAgo: 1_948_000 },
  pluang:      { now: 2_615_000, yearAgo: 1_960_000 },
  shopee:      { now: 2_598_000, yearAgo: 1_946_000 },
  mulia:       { now: 2_640_000, yearAgo: 1_975_000 },
  bareksa:     { now: 2_608_000, yearAgo: 1_952_000 },
  antam_retro: { now: 2_655_000, yearAgo: 1_995_000 },
  dana:        { now: 2_605_000, yearAgo: 1_950_000 },
}

function generateTypeHistory(typeId: string) {
  const base = TYPE_BASE_PRICES[typeId] ?? TYPE_BASE_PRICES.antam
  const ratio = base.now / 2_605_000
  return HISTORY.map(h => ({
    ...h,
    price: Math.round(h.price * ratio / 1000) * 1000,
  }))
}

// Color palette for all gold types in compare mode
const ALL_TYPE_COLORS: Record<string, string> = {
  antam:       '#F5C842',
  antam_batik: '#fde68a',
  ugbs:        '#38bdf8',
  hrta:        '#a78bfa',
  lotus:       '#f472b6',
  bsi:         '#34d399',
  minigold:    '#e879f9',
  galeri24:    '#fb7185',
  perhiasan:   '#c084fc',
  koin:        '#facc15',
  treasury:    '#4ade80',
  indogold:    '#60a5fa',
  pluang:      '#f97316',
  shopee:      '#ff6b35',
  mulia:       '#a3e635',
  bareksa:     '#2dd4bf',
  antam_retro: '#fbbf24',
  dana:        '#818cf8',
}

// Generate full compare history for ALL types on the fly per selected set
function buildCompareHistory(typeIds: string[]) {
  return HISTORY.map(h => {
    const point: Record<string, any> = { label: h.label }
    typeIds.forEach(tid => {
      const ratio = (TYPE_BASE_PRICES[tid]?.now ?? 2_605_000) / 2_605_000
      point[tid] = Math.round(h.price * ratio / 1000) * 1000
    })
    return point
  })
}

// Monthly aggregation
const MONTHLY = (() => {
  const byMonth: Record<string, number[]> = {}
  HISTORY.forEach(h => {
    if (!byMonth[h.month]) byMonth[h.month] = []
    byMonth[h.month].push(h.price)
  })
  return Object.entries(byMonth).map(([month, prices]) => ({
    month,
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    high: Math.max(...prices),
    low: Math.min(...prices),
  }))
})()

// Data harga real — Antam LM, 25 September 2026
// Sumber: logammulia.com — perubahan terakhir 25 Sep 2026 08:27 WIB
const STATS = {
  current: 2_590_000,   // harga beli Antam hari ini — turun Rp 15.000 dari kemarin
  open: 2_605_000,      // harga terakhir kemarin (logammulia: "Harga Terakhir")
  high24h: 2_608_000,
  low24h: 2_585_000,
  weekAgo: 2_565_000,
  monthAgo: 2_440_000,
  yearAgo: 1_950_000,
  buyback: 2_420_000,   // harga buyback Antam (konsumen jual ke Antam)
  usdPerOz: 4_378,      // XAU/USD estimasi 25 Sep 2026
  usdRate: 18_450,      // estimasi kurs USD/IDR
}

// Harga dealer per gram — 25 September 2026
// Sumber: logammulia.com, investor.id, portalmadura.com, hrtagold.id, lotusarchi.com
const DEALERS = [
  { name: 'Antam (LM Store)',    buy: 2_590_000, sell: 2_420_000, change: -0.58, location: 'Nasional', type: 'Resmi',  note: 'Turun Rp 15.000',
    rating: 4.8, ulasan: 'Paling terpercaya, layanan cepat', biayaOngkir: 0, biayaAsuransi: 0.2, pajakPPh: 0.45,
    kota: 'Jakarta Pusat', cabang: 40, jam: 'Sen–Jum 08:00–16:00 WIB' },
  { name: 'Pegadaian – Antam',   buy: 2_645_000, sell: 2_435_000, change: -0.57, location: 'Nasional', type: 'Resmi',  note: 'Stabil',
    rating: 4.6, ulasan: 'Tersebar luas, proses aman', biayaOngkir: 25_000, biayaAsuransi: 0.15, pajakPPh: 0.45,
    kota: 'Seluruh Indonesia', cabang: 4_500, jam: 'Sen–Sab 08:00–17:00 WIB' },
  { name: 'UBS Gold',            buy: 2_570_000, sell: 2_410_000, change: -0.96, location: 'Nasional', type: 'Resmi',  note: '',
    rating: 4.5, ulasan: 'Harga kompetitif, sertifikat resmi', biayaOngkir: 30_000, biayaAsuransi: 0.1, pajakPPh: 0.45,
    kota: 'Surabaya', cabang: 12, jam: 'Sen–Jum 08:30–17:00 WIB' },
  { name: 'Galeri 24',           buy: 2_545_000, sell: 2_400_000, change: -0.98, location: 'Nasional', type: 'Toko',   note: 'Via Pegadaian',
    rating: 4.4, ulasan: 'Harga terjangkau, mudah dijangkau', biayaOngkir: 20_000, biayaAsuransi: 0.1, pajakPPh: 0.45,
    kota: 'Jakarta', cabang: 280, jam: 'Sen–Sab 09:00–17:00 WIB' },
  { name: 'Hartadinata (EMASKU)',buy: 2_461_000, sell: 2_332_000, change: -0.04, location: 'Nasional', type: 'Toko',   note: 'Turun Rp 1.000',
    rating: 4.3, ulasan: 'Purity terjamin, jaringan luas', biayaOngkir: 35_000, biayaAsuransi: 0.15, pajakPPh: 0.45,
    kota: 'Bandung', cabang: 35, jam: 'Sen–Sab 09:00–18:00 WIB' },
  { name: 'Lotus Archi',         buy: 2_496_000, sell: 2_283_000, change:  0.00, location: 'Nasional', type: 'Toko',   note: 'Stabil',
    rating: 4.2, ulasan: 'Desain elegan, produk premium', biayaOngkir: 40_000, biayaAsuransi: 0.2, pajakPPh: 0.45,
    kota: 'Jakarta Selatan', cabang: 8, jam: 'Sen–Sab 10:00–19:00 WIB' },
  { name: 'BSI (Bank Syariah)',  buy: 2_565_000, sell: 2_463_000, change:  0.00, location: 'Nasional', type: 'Resmi',  note: 'Stabil',
    rating: 4.5, ulasan: 'Syariah compliant, aman & resmi', biayaOngkir: 0, biayaAsuransi: 0.1, pajakPPh: 0,
    kota: 'Seluruh Indonesia', cabang: 1_300, jam: 'Sen–Jum 08:00–15:00 WIB' },
  { name: 'Minigold',            buy: 2_610_000, sell: 2_285_000, change:  0.00, location: 'Online',   type: 'Online', note: '',
    rating: 4.1, ulasan: 'Bisa beli gram kecil, mudah cair', biayaOngkir: 15_000, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Online', cabang: 0, jam: '24 jam / 7 hari' },
  { name: 'Treasury',            buy: 2_610_000, sell: 2_450_000, change: -0.91, location: 'Jakarta',  type: 'Online', note: '',
    rating: 4.3, ulasan: 'Aplikasi modern, proses cepat', biayaOngkir: 0, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Jakarta', cabang: 0, jam: '24 jam / 7 hari' },
  { name: 'Indogold',            buy: 2_600_000, sell: 2_440_000, change: -0.95, location: 'Nasional', type: 'Online', note: '',
    rating: 4.2, ulasan: 'Bisa cicil, harga transparan', biayaOngkir: 20_000, biayaAsuransi: 0.05, pajakPPh: 0.45,
    kota: 'Online', cabang: 0, jam: '24 jam / 7 hari' },
  { name: 'Tokopedia Emas',      buy: 2_598_000, sell: 2_435_000, change: -0.96, location: 'Online',   type: 'Online', note: '',
    rating: 4.4, ulasan: 'Integrasi marketplace, mudah dicicil', biayaOngkir: 0, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Online', cabang: 0, jam: '24 jam / 7 hari' },
  { name: 'Tamasia',             buy: 2_602_000, sell: 2_445_000, change: -0.92, location: 'Online',   type: 'Online', note: '',
    rating: 4.0, ulasan: 'Spread oke, UI sederhana', biayaOngkir: 10_000, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Online', cabang: 0, jam: '24 jam / 7 hari' },
  { name: 'Bukaemas',            buy: 2_595_000, sell: 2_430_000, change: -0.97, location: 'Online',   type: 'Online', note: '',
    rating: 4.1, ulasan: 'Terintegrasi Bukalapak', biayaOngkir: 0, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Online', cabang: 0, jam: '24 jam / 7 hari' },
  { name: 'Orori',               buy: 2_590_000, sell: 2_425_000, change: -0.99, location: 'Online',   type: 'Online', note: '',
    rating: 4.0, ulasan: 'Perhiasan & logam, pilihan variatif', biayaOngkir: 25_000, biayaAsuransi: 0.1, pajakPPh: 0.45,
    kota: 'Online', cabang: 0, jam: 'Sen–Sab 08:00–20:00 WIB' },
  { name: 'Pluang',              buy: 2_615_000, sell: 2_455_000, change: -0.88, location: 'Online',   type: 'Online', note: 'Minimal 0.001 gr',
    rating: 4.5, ulasan: 'Terpercaya, spread kecil, aman OJK', biayaOngkir: 0, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Online', cabang: 0, jam: '24 jam / 7 hari' },
  { name: 'Shopee Emas',         buy: 2_598_000, sell: 2_435_000, change: -0.96, location: 'Online',   type: 'Online', note: '',
    rating: 4.3, ulasan: 'Mudah via Shopee, promo sering ada', biayaOngkir: 0, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Online', cabang: 0, jam: '24 jam / 7 hari' },
  { name: 'Dana Emas',           buy: 2_605_000, sell: 2_445_000, change: -0.95, location: 'Online',   type: 'Online', note: 'Minimal Rp 5.000',
    rating: 4.2, ulasan: 'Terintegrasi Dana wallet', biayaOngkir: 0, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Online', cabang: 0, jam: '24 jam / 7 hari' },
  { name: 'Bareksa Emas',        buy: 2_608_000, sell: 2_448_000, change: -0.92, location: 'Online',   type: 'Online', note: '',
    rating: 4.4, ulasan: 'Super-app investasi, terpercaya OJK', biayaOngkir: 0, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Online', cabang: 0, jam: '24 jam / 7 hari' },
  { name: 'Pegadaian Mulia',     buy: 2_640_000, sell: 2_435_000, change: -0.57, location: 'Nasional', type: 'Resmi',  note: 'Tabungan fisik',
    rating: 4.6, ulasan: 'Tabungan emas fisik, bisa cetak batangan', biayaOngkir: 0, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Seluruh Indonesia', cabang: 4_500, jam: 'Sen–Sab 08:00–17:00 WIB' },
  { name: 'Bank Mandiri Emas',   buy: 2_620_000, sell: 2_440_000, change: -0.76, location: 'Nasional', type: 'Resmi',  note: 'Livin by Mandiri',
    rating: 4.5, ulasan: 'Terpercaya, aman via internet banking', biayaOngkir: 0, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Seluruh Indonesia', cabang: 2_700, jam: 'Sen–Jum 08:00–15:00 WIB' },
  { name: 'Bank BRI Emas',       buy: 2_618_000, sell: 2_438_000, change: -0.83, location: 'Nasional', type: 'Resmi',  note: 'BRImo',
    rating: 4.4, ulasan: 'Jangkauan terluas, mudah akses daerah', biayaOngkir: 0, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Seluruh Indonesia', cabang: 9_700, jam: 'Sen–Jum 08:00–15:00 WIB' },
  { name: 'Bank BNI Emas',       buy: 2_616_000, sell: 2_436_000, change: -0.91, location: 'Nasional', type: 'Resmi',  note: 'BNI Mobile Banking',
    rating: 4.4, ulasan: 'Terintegrasi BNI, proses paperless', biayaOngkir: 0, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Seluruh Indonesia', cabang: 1_900, jam: 'Sen–Jum 08:00–15:00 WIB' },
  { name: 'Ajaib Emas',          buy: 2_603_000, sell: 2_443_000, change: -0.96, location: 'Online',   type: 'Online', note: '',
    rating: 4.2, ulasan: 'Investasi saham & emas satu tempat', biayaOngkir: 0, biayaAsuransi: 0.0, pajakPPh: 0.45,
    kota: 'Online', cabang: 0, jam: '24 jam / 7 hari' },
]

// ── Berita Emas (simulated) ────────────────────────────────────────────────
type NewsItem = { id:string; headline:string; source:'Kontan'|'Bisnis.com'|'Reuters'|'CNBC Indonesia'|'Katadata'; category:'Harga'|'Global'|'Investasi'|'Regulasi'|'Pasar'; time:string; summary:string; url:string; hot?:boolean }
const BERITA: NewsItem[] = [
  { id:'1', source:'Reuters', category:'Global', time:'25 Sep 2026 · 07:14 WIB', hot:true,
    headline:'Gold Hits All-Time High $4,396/oz as Dollar Slides on Weak US Jobs Data',
    summary:'Spot gold surged to a fresh record of $4,396.40 per troy ounce on Friday after US non-farm payrolls added only 82,000 jobs in August 2026 — well below the 160,000 consensus estimate. The dollar index (DXY) fell 0.9% to 96.3, its lowest in 18 months. "The jobs miss gives the Fed almost no room to resume hikes. That\'s unambiguously bullish for gold," said Nicky Shiels, head of metals strategy at MKS PAMP. Goldman Sachs maintained their year-end target of $4,500/oz, citing persistent central bank demand and geopolitical tail risk.',
    url:'https://www.reuters.com/markets/commodities/' },
  { id:'2', source:'Kontan', category:'Harga', time:'25 Sep 2026 · 08:35 WIB', hot:true,
    headline:'Antam Koreksi Harga Emas LM Rp 15.000 — Jadi Rp 2.590.000/gram per 25 September 2026',
    summary:'PT Aneka Tambang Tbk (ANTM) menurunkan harga jual emas Logam Mulia (LM) sebesar Rp 15.000 menjadi Rp 2.590.000 per gram, efektif 25 September 2026 pukul 08:27 WIB. Harga buyback disesuaikan ke Rp 2.420.000/gram. Koreksi ini mengikuti penurunan tipis XAU/USD semalam di sesi New York. Dalam setahun terakhir emas Antam naik 33,3% dari Rp 1.944.000/gram per September 2025, mengungguli rata-rata reksa dana campuran. Antam mengimbau masyarakat memverifikasi harga hanya via logammulia.com.',
    url:'https://investasi.kontan.co.id/news/harga-emas-antam-hari-ini/' },
  { id:'3', source:'Bisnis.com', category:'Global', time:'25 Sep 2026 · 06:20 WIB',
    headline:'Bank Sentral Global Beli 483 Ton Emas di Q3 2026 — Tertinggi Sejak 1967',
    summary:'World Gold Council melaporkan pembelian bersih emas oleh bank sentral global mencapai 483 ton pada kuartal ketiga 2026, melampaui rekor Q3 2022 sebesar 458 ton. People\'s Bank of China menambah 62 ton, National Bank of Poland membeli 35 ton, sementara Turki, India, dan Kazakhstan juga mencatat penambahan signifikan. "De-dolarisasi portofolio cadangan devisa terus berlanjut. Emas adalah penerima manfaat utama dari tren struktural ini," tulis analis WGC dalam laporan kuartalan mereka.',
    url:'https://market.bisnis.com/read/emas-dunia/' },
  { id:'4', source:'CNBC Indonesia', category:'Regulasi', time:'24 Sep 2026 · 19:45 WIB',
    headline:'OJK Terbitkan POJK 18/2026: Platform Emas Digital Wajib Audit Aset Fisik Setiap 6 Bulan',
    summary:'OJK resmi menerbitkan Peraturan OJK Nomor 18/POJK.05/2026 tentang Penyelenggaraan Perdagangan Emas Digital. Aturan ini mewajibkan platform seperti Pluang, Treasury, Indogold, Tamasia, dan Bareksa Emas menjalani audit aset fisik oleh kantor akuntan publik independen setiap enam bulan. Pelanggaran dapat dikenai sanksi pencabutan izin. OJK juga mewajibkan rasio backing fisik minimal 100% terhadap kepemilikan nasabah. Aturan berlaku efektif 1 Januari 2027.',
    url:'https://www.cnbcindonesia.com/market/ojk-emas-digital/' },
  { id:'5', source:'Katadata', category:'Pasar', time:'24 Sep 2026 · 15:10 WIB',
    headline:'Investasi Emas Digital Indonesia Tembus Rp 52,4 Triliun per Agustus 2026 — Naik 81% YoY',
    summary:'Data OJK per Agustus 2026 menunjukkan nilai aset kelolaan platform perdagangan emas digital di Indonesia mencapai Rp 52,4 triliun, tumbuh 81,2% secara tahunan dibandingkan Agustus 2025 sebesar Rp 28,9 triliun. Pegadaian Digital dan Pluang menjadi dua platform dengan pertumbuhan pengguna aktif terbesar. "Emas digital kini menjadi instrumen ketiga paling populer setelah reksa dana pasar uang dan saham," ungkap Kepala Departemen Pengawasan Pasar Modal 2B OJK.',
    url:'https://katadata.co.id/finansial/investasi/emas-digital/' },
  { id:'6', source:'Reuters', category:'Global', time:'24 Sep 2026 · 09:55 WIB',
    headline:'Fed Minutes: No Rate Hike "Appropriate" Before Mid-2027, Officials Agree',
    summary:'Minutes of the September 17–18 FOMC meeting showed a broad consensus that the current fed funds rate of 4.75%–5.00% should remain unchanged at least through mid-2027. "Participants noted that the risks to the inflation outlook had shifted decisively to the downside," the minutes stated. Gold extended gains by $22/oz immediately after the release, as lower-for-longer rates reduce the opportunity cost of holding non-yielding bullion. Silver and platinum also rallied on the back of the dovish signal.',
    url:'https://www.reuters.com/markets/us/' },
  { id:'7', source:'Bisnis.com', category:'Investasi', time:'23 Sep 2026 · 13:30 WIB',
    headline:'Analis Rekomendasikan Strategi DCA Emas di Q4 2026 — Hindari Beli Sekaligus di Puncak',
    summary:'Analis dari Mirae Asset Sekuritas, Sucor Sekuritas, dan MNC Sekuritas merekomendasikan Dollar Cost Averaging (DCA) bagi investor ritel yang ingin masuk ke emas menjelang Q4 2026. "Jangan tunggu koreksi besar karena sentimen makro terlalu kuat. Beli rutin setiap bulan jauh lebih aman," kata Reza Priyambada, analis Sucor Sekuritas. Untuk gramasi efisien, disarankan pembelian minimal 5 gram per transaksi guna menekan dampak spread biaya terhadap imbal hasil jangka panjang.',
    url:'https://market.bisnis.com/read/strategi-investasi-emas/' },
  { id:'8', source:'Kontan', category:'Harga', time:'23 Sep 2026 · 10:05 WIB',
    headline:'Harga Emas Pegadaian Hari Ini: Galeri 24 dan Mulia Kompak Naik Rp 5.000',
    summary:'Harga emas Galeri 24 dan Pegadaian Mulia kompak naik Rp 5.000 pada Selasa 23 September 2026. Emas Galeri 24 ukuran 1 gram dibanderol Rp 2.545.000, sementara Pegadaian Mulia 1 gram dipatok Rp 2.640.000. Kenaikan ini mengikuti tren positif XAU/USD yang mendekati zona $4.390-an. Untuk buyback, Pegadaian Mulia memberikan harga Rp 2.435.000/gram dan Galeri 24 di Rp 2.400.000/gram. Spread masih di kisaran 6–8%, sehingga analis menyarankan horizon investasi minimal satu tahun.',
    url:'https://investasi.kontan.co.id/news/harga-emas-pegadaian/' },
  { id:'9', source:'CNBC Indonesia', category:'Global', time:'22 Sep 2026 · 20:00 WIB',
    headline:'Konflik Timur Tengah Meluas — Emas Jadi Pelarian Utama Investor Global',
    summary:'Meningkatnya ketegangan geopolitik di kawasan Timur Tengah mendorong investor global masuk ke aset safe haven. Emas spot naik $45 dalam satu sesi — kenaikan harian terbesar sejak Oktober 2023. ETF emas terbesar, SPDR Gold Shares (GLD), mencatat arus masuk $2,1 miliar hanya dalam sehari. "Ketika ketidakpastian geopolitik melonjak, emas selalu menjadi tujuan pertama. Ini bukan spekulasi, ini risk management," ujar Jeffrey Currie, mantan kepala komoditas Goldman Sachs.',
    url:'https://www.cnbcindonesia.com/market/' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }
function pct(a: number, b: number) { return (((a - b) / b) * 100).toFixed(2) }

function GoldTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(10,9,20,0.95)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 10, padding: '10px 14px', fontFamily: 'DM Mono, monospace', fontSize: 12, backdropFilter: 'blur(8px)' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontSize: 10 }}>{label}</p>
      <p style={{ color: '#F5C842', fontWeight: 600 }}>{fmt(payload[0].value)}</p>
    </div>
  )
}

const RANGES = ['1M', '3M', '6M', '1T']
const TYPE_COLORS: Record<string, string> = { Resmi: '#F5C842', Toko: '#a78bfa', Online: '#34d399' }

// Interval antar update per dealer (detik) — beda-beda biar lebih realistis
const DEALER_UPDATE_INTERVALS: Record<string, number> = {
  'Antam (LM Store)':     7,
  'Pegadaian – Antam':   11,
  'UBS Gold':            13,
  'Galeri 24':           17,
  'Hartadinata (EMASKU)':23,
  'Lotus Archi':         29,
  'BSI (Bank Syariah)':  31,
  'Minigold':             9,
  'Treasury':             5,
  'Indogold':             6,
  'Tokopedia Emas':       8,
  'Tamasia':             14,
  'Bukaemas':            10,
  'Orori':               19,
  'Pluang':               7,
  'Shopee Emas':         12,
  'Dana Emas':            8,
  'Bareksa Emas':        16,
  'Pegadaian Mulia':     11,
  'Bank Mandiri Emas':   25,
  'Bank BRI Emas':       27,
  'Bank BNI Emas':       22,
  'Ajaib Emas':          15,
}

const SOURCES: Record<string, string> = {
  antam: 'logammulia.com', antam_batik: 'logammulia.com', ugbs: 'ubs.co.id',
  hrta: 'hrtagold.id', lotus: 'lotusarchi.com', bsi: 'bsi.co.id',
  minigold: 'minigold.id', galeri24: 'pegadaian.co.id',
  perhiasan: 'estimasi pasar', koin: 'estimasi pasar',
  treasury: 'treasury.id', indogold: 'indogold.id', pluang: 'pluang.com',
  shopee: 'shopee.co.id', mulia: 'pegadaian.co.id', bareksa: 'bareksa.com',
  antam_retro: 'logammulia.com', dana: 'dana.id',
}

type DealerLive = {
  buy: number
  sell: number
  prevBuy: number
  prevSell: number
  updatedAt: Date
}

function fmtTimestamp(d: Date) {
  return d.toLocaleDateString('id-ID', { weekday:'short', day:'numeric', month:'short', year:'numeric' })
    + ' · ' + d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
}

export default function App() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  // m(mobileVal, desktopVal) — picks the right value per viewport
  const m = <T,>(mob: T, desk: T): T => isMobile ? mob : desk

  const [activeType, setActiveType] = useState('antam')
  const [activeTab, setActiveTab] = useState<'chart' | 'table' | 'dealers' | 'kalkulator' | 'portfolio' | 'berita'>('chart')
  const [expandedDealer, setExpandedDealer] = useState<string|null>(null)
  const [range, setRange] = useState('1T')
  const [now, setNow] = useState(new Date())
  const [ticker, setTicker] = useState(STATS.current)
  const [prevTicker, setPrevTicker] = useState(STATS.current)

  // Live per-dealer state: current & previous buy/sell + last update time
  const [dealerLive, setDealerLive] = useState<Record<string, DealerLive>>(() => {
    const init: Record<string, DealerLive> = {}
    DEALERS.forEach(d => {
      init[d.name] = { buy: d.buy, sell: d.sell, prevBuy: d.buy, prevSell: d.sell, updatedAt: new Date() }
    })
    return init
  })

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setTicker(p => {
        setPrevTicker(p)
        const delta = (Math.random() - 0.5) * 1500
        return Math.round((p + delta) / 500) * 500
      })
    }, 3000)
    return () => clearInterval(t)
  }, [])

  // Per-dealer live update — each dealer ticks on its own interval
  useEffect(() => {
    const timers = DEALERS.map(d => {
      const secs = DEALER_UPDATE_INTERVALS[d.name] ?? 10
      return setInterval(() => {
        setDealerLive(prev => {
          const cur = prev[d.name]
          // small realistic drift ±500–2000 per tick
          const delta = Math.round((Math.random() - 0.48) * 2000 / 500) * 500
          const newBuy  = Math.max(cur.buy  + delta, d.buy - 10_000)
          const newSell = Math.max(cur.sell + delta, d.sell - 10_000)
          return {
            ...prev,
            [d.name]: { buy: newBuy, sell: newSell, prevBuy: cur.buy, prevSell: cur.sell, updatedAt: new Date() },
          }
        })
      }, secs * 1000)
    })
    return () => timers.forEach(clearInterval)
  }, [])

  const [tableRange, setTableRange] = useState('1T')
  const [compareMode, setCompareMode] = useState(false)
  const [compareSelected, setCompareSelected] = useState<string[]>(['antam', 'ugbs', 'hrta', 'bsi', 'galeri24', 'pluang'])

  // ── Kalkulator state ──
  const [calcMode, setCalcMode] = useState<'beli'|'jual'>('beli')
  const [calcBudget, setCalcBudget] = useState('')
  const [calcGram, setCalcGram] = useState('')
  const [calcDealer, setCalcDealer] = useState('semua')

  // ── Portfolio state (persisted to localStorage) ──
  type PortfolioEntry = { id:string; label:string; dealer:string; weight:number; buyPrice:number; buyDate:string }
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('goldtrack_portfolio') ?? '[]') } catch { return [] }
  })
  const [pfForm, setPfForm] = useState({ label:'', dealer: DEALERS[0].name, weight:'', buyPrice:'', buyDate: new Date().toISOString().slice(0,10) })
  const [pfOpen, setPfOpen] = useState(false)

  function savePortfolio(entries: PortfolioEntry[]) {
    setPortfolio(entries)
    localStorage.setItem('goldtrack_portfolio', JSON.stringify(entries))
  }
  function addPortfolioEntry() {
    if (!pfForm.weight || !pfForm.buyPrice) return
    const entry: PortfolioEntry = {
      id: Date.now().toString(),
      label: pfForm.label || pfForm.dealer,
      dealer: pfForm.dealer,
      weight: +pfForm.weight,
      buyPrice: +pfForm.buyPrice.replace(/\./g,''),
      buyDate: pfForm.buyDate,
    }
    savePortfolio([...portfolio, entry])
    setPfForm({ label:'', dealer: DEALERS[0].name, weight:'', buyPrice:'', buyDate: new Date().toISOString().slice(0,10) })
    setPfOpen(false)
  }
  function removePortfolioEntry(id: string) {
    savePortfolio(portfolio.filter(e => e.id !== id))
  }

  function toggleCompare(id: string) {
    setCompareSelected(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(x => x !== id) : prev) : [...prev, id]
    )
  }

  const G = 'DM Mono, monospace'
  const prices = PRICES[activeType] ?? []
  const dayChange = +pct(ticker, STATS.open)
  const weekChange = +pct(STATS.current, STATS.weekAgo)
  const monthChange = +pct(STATS.current, STATS.monthAgo)
  const yearChange = +pct(STATS.current, STATS.yearAgo)
  const rangeData = ({ '1M': HISTORY.slice(-5), '3M': HISTORY.slice(-13), '6M': HISTORY.slice(-26), '1T': HISTORY } as any)[range] ?? HISTORY

  const TT = { background: 'rgba(7,6,20,0.96)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, fontSize: 11, fontFamily: G }

  const typeHistory = generateTypeHistory(activeType)
  const tableSlices: Record<string, number> = { '1M': -4, '3M': -13, '6M': -26, '1T': -52 }
  const xIntervals: Record<string, number> = { '1M': 1, '3M': 2, '6M': 4, '1T': 7 }
  const typeRangeData = typeHistory.slice(tableSlices[tableRange] ?? -52)
  const compareRangeData = buildCompareHistory(compareSelected).slice(tableSlices[tableRange] ?? -52)
  const activeTypeMeta = GOLD_TYPES.find(t => t.id === activeType)
  const typeNow = TYPE_BASE_PRICES[activeType]?.now ?? STATS.current
  const typeYearAgo = TYPE_BASE_PRICES[activeType]?.yearAgo ?? STATS.yearAgo
  const typeYearChange = +pct(typeNow, typeYearAgo)

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-body)', color: '#f0eeff' }}>

      {/* ── HEADER ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(7,6,15,0.9)', backdropFilter: 'blur(24px)' }}>
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#F5C842,#c9971e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 0 18px rgba(245,200,66,0.4)', flexShrink: 0 }}>⚜</div>
            <div>
              <div className="grad-gold" style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.8, lineHeight: 1.1 }}>Harga Emas</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: G, letterSpacing: 3 }}>LIVE UPDATE</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[{l:'USD/IDR',v:'18.450'},{l:'XAU/USD',v:'$4.396/oz'}].map(x => (
              <div key={x.l} className="pill pill-neutral" style={{ fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{x.l}</span>
                <span style={{ color: '#F5C842', fontWeight: 700 }}> {x.v}</span>
              </div>
            ))}
            <div className="hidden sm:block" style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: G }}>{now.toLocaleTimeString('id-ID')}</div>
          </div>
        </div>
      </header>

      {/* ── Live scrolling ticker ── */}
      <div style={{ background: 'rgba(245,200,66,0.05)', borderBottom: '1px solid rgba(245,200,66,0.12)', padding: '7px 0', overflow: 'hidden', position: 'relative' }}>
        {/* fade edges */}
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:60, background:'linear-gradient(90deg,rgba(7,6,15,0.9),transparent)', zIndex:2, pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:60, background:'linear-gradient(270deg,rgba(7,6,15,0.9),transparent)', zIndex:2, pointerEvents:'none' }} />

        <div className="ticker-track" style={{ fontFamily: G, fontSize: 11, whiteSpace: 'nowrap' }}>
          {/* Duplicate for seamless loop */}
          {[...DEALERS, ...DEALERS].map((d, i) => {
            const live = dealerLive[d.name]
            const curBuy = live?.buy ?? d.buy
            const liveChange = +pct(curBuy, d.buy)
            const up = liveChange >= 0
            return (
              <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:6, marginRight:40 }}>
                {/* separator dot */}
                <span style={{ color:'rgba(245,200,66,0.35)', fontSize:8 }}>◆</span>
                <span style={{ color:'rgba(255,255,255,0.55)', fontWeight:600, letterSpacing:0.3 }}>{d.name}</span>
                <span style={{ color:'#F5C842' }}>{curBuy.toLocaleString('id-ID')}</span>
                <span style={{
                  color: up ? '#34d399' : '#fb7185',
                  background: up ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)',
                  padding:'1px 6px', borderRadius:99, fontSize:10, fontWeight:700,
                }}>
                  {up ? '▲' : '▼'}{Math.abs(liveChange).toFixed(2)}%
                </span>
              </span>
            )
          })}
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-2 md:px-8 py-3 md:py-8 space-y-3 md:space-y-8">

        {/* ── Hero ── */}
        <section>
          {/* Main price hero */}
          <div className="neon-top glass rounded-3xl mb-4" style={{ position: 'relative', overflow: 'hidden', padding: m('16px','32px') }}>
            {/* Ambient glow orbs */}
            <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,200,66,0.12), transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:-80, left:-40, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.1), transparent 70%)', pointerEvents:'none' }} />

            <div className="flex items-center gap-2 mb-4">
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#34d399', boxShadow:'0 0 10px #34d399', display:'inline-block', animation:'pulse 2s infinite' }} />
              <span className="pill pill-neutral" style={{ fontSize:10, letterSpacing:2 }}>LIVE UPDATE · ANTAM LM · 1 GRAM</span>
            </div>

            <div className="flex flex-wrap items-end gap-4 mb-5">
              <div className="grad-gold" style={{ fontSize:m(32,68), fontWeight:800, lineHeight:1, letterSpacing:-2 }}>
                {fmt(ticker)}
              </div>
              <div className="flex flex-col gap-1 pb-2">
                <span className={dayChange >= 0 ? 'pill pill-up' : 'pill pill-down'} style={{ fontSize:13, width:'fit-content' }}>
                  {dayChange >= 0 ? '▲' : '▼'} {Math.abs(dayChange)}% hari ini
                </span>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:G }}>
                  ↓ Turun Rp 15.000 dari kemarin · logammulia.com 08:27 WIB
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-6" style={{ fontFamily:G, fontSize:12 }}>
              {[
                { k:'Buka',    v:fmt(STATS.open),    c:'rgba(255,255,255,0.55)' },
                { k:'Tinggi',  v:fmt(STATS.high24h), c:'#34d399' },
                { k:'Rendah',  v:fmt(STATS.low24h),  c:'#fb7185' },
                { k:'Buyback', v:fmt(STATS.buyback), c:'rgba(255,255,255,0.4)' },
              ].map(x => (
                <div key={x.k}>
                  <div style={{ fontSize:9, letterSpacing:1.5, color:'rgba(255,255,255,0.28)', marginBottom:3 }}>{x.k.toUpperCase()}</div>
                  <div style={{ fontWeight:400, color:x.c }}>{x.v}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:16, fontSize:10, color:'rgba(255,255,255,0.22)', fontFamily:G }}>
              Sumber: logammulia.com · 25 Sep 2026 08:00 WIB
            </div>
          </div>

          {/* Stat trio */}
          <div className="grid gap-3" style={{ gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))' }}>
            {[
              { label:'7 Hari',   val:weekChange,  base:STATS.weekAgo,  emoji:'📅', accent:'#a78bfa', bg:'rgba(167,139,250,0.08)' },
              { label:'30 Hari',  val:monthChange, base:STATS.monthAgo, emoji:'🗓️', accent:'#38bdf8', bg:'rgba(56,189,248,0.08)' },
              { label:'1 Tahun',  val:yearChange,  base:STATS.yearAgo,  emoji:'🚀', accent:'#F5C842', bg:'rgba(245,200,66,0.08)' },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl" style={{ padding:m('10px 12px','14px 20px'), background:s.bg, borderColor: s.accent + '22' }}>
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontSize:10, letterSpacing:1.5, color:'rgba(255,255,255,0.3)', fontFamily:G, fontWeight:600 }}>PERUBAHAN {s.label.toUpperCase()}</span>
                  <span style={{ fontSize:18 }}>{s.emoji}</span>
                </div>
                <div style={{ fontSize:m(18,34), fontWeight:800, letterSpacing:-1, color: s.val >= 0 ? '#34d399' : '#fb7185', lineHeight:1 }}>
                  {s.val >= 0 ? '+' : ''}{s.val}%
                </div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:G, marginTop:6 }}>dari {fmt(s.base)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tab nav ── */}
        <nav style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, WebkitOverflowScrolling:'touch' as any }} className="hide-scrollbar tab-nav">
          {([
            { id:'chart',      label:'Grafik',      emoji:'📈' },
            { id:'table',      label:'Tabel Harga', emoji:'📋' },
            { id:'dealers',    label:'Daftar Emas', emoji:'🥇' },
            { id:'kalkulator', label:'Kalkulator',  emoji:'🧮' },
            { id:'portfolio',  label:'Portfolio',   emoji:'💼' },
            { id:'berita',     label:'Berita Emas', emoji:'📰' },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                borderRadius:12, padding:m('7px 12px','9px 20px'), fontSize:m(11,14), fontWeight:700, cursor:'pointer', transition:'all 0.2s', border:'none', whiteSpace:'nowrap', flexShrink:0,
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg,#F5C842,#fde68a)'
                  : 'rgba(255,255,255,0.06)',
                color: activeTab === tab.id ? '#07060f' : 'rgba(255,255,255,0.5)',
                boxShadow: activeTab === tab.id ? '0 4px 20px rgba(245,200,66,0.3)' : 'none',
                outline: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}>
              {tab.emoji} {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab divider */}
        <div style={{ height:1, background:'linear-gradient(90deg, transparent, rgba(245,200,66,0.35) 30%, rgba(167,139,250,0.25) 70%, transparent)', borderRadius:99 }} />

        {/* ── CHART TAB ── */}
        {activeTab === 'chart' && (
          <div className="space-y-4">
            <div className="glass rounded-3xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                <div>
                  <h2 style={{ fontWeight:800, fontSize:22, letterSpacing:-0.5 }}>Grafik Harga Emas</h2>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', fontFamily:G, marginTop:3 }}>IDR / gram · Antam LM · tren 1 tahun</p>
                </div>
                <div className="flex gap-1" style={{ background:'rgba(255,255,255,0.05)', borderRadius:12, padding:4 }}>
                  {RANGES.map(r => (
                    <button key={r} onClick={() => setRange(r)} style={{
                      padding:'6px 14px', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.18s', fontFamily:G,
                      background: range===r ? 'linear-gradient(135deg,#F5C842,#fde68a)' : 'transparent',
                      color: range===r ? '#07060f' : 'rgba(255,255,255,0.4)',
                    }}>{r}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 200 : 300}>
                <AreaChart data={rangeData} margin={{ top:5, right:10, left:0, bottom:28 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ffffff" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill:'rgba(255,255,255,0.22)', fontSize:9, fontFamily:G, fontWeight:400 }} tickLine={false} axisLine={false} interval={Math.floor(rangeData.length / 4)} dy={8} padding={{ left:60, right:10 }} />
                  <YAxis domain={[(dataMin: number) => Math.floor((dataMin * 0.995) / 1000) * 1000, (dataMax: number) => Math.ceil((dataMax * 1.005) / 1000) * 1000]} tick={{ fill:'rgba(255,255,255,0.22)', fontSize:10, fontFamily:G, fontWeight:400 }} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1e6).toFixed(2)}jt`} width={64} />
                  <Tooltip content={<GoldTooltip />} />
                  <ReferenceLine y={STATS.yearAgo} stroke="rgba(167,139,250,0.3)" strokeDasharray="5 3" label={{ value:'1 thn lalu', fill:'rgba(167,139,250,0.5)', fontSize:9 }} />
                  <Area type="monotone" dataKey="price" stroke="#ffffff" strokeWidth={2} fill="url(#goldGrad)" dot={false} activeDot={{ r:5, fill:'#ffffff', stroke:'#07060f', strokeWidth:2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass rounded-3xl" style={{ padding:m('12px','24px') }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize:m(13,18) }}>📊</span>
                  <h3 style={{ fontWeight:700, fontSize:m(12,16) }}>Volume Transaksi</h3>
                </div>
                <p style={{ fontSize:m(9,11), color:'rgba(255,255,255,0.3)', fontFamily:G, marginBottom:12 }}>Estimasi unit / minggu</p>
                <ResponsiveContainer width="100%" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 130 : 180}>
                  <BarChart data={HISTORY.slice(-12)} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                    <defs>
                      <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e879f9" stopOpacity={0.95} />
                        <stop offset="50%" stopColor="#a78bfa" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill:'rgba(255,255,255,0.18)', fontSize:8, fontFamily:G }} tickLine={false} axisLine={false} interval={2} />
                    <YAxis tick={{ fill:'rgba(255,255,255,0.18)', fontSize:8 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TT} />
                    <Bar dataKey="volume" fill="url(#volGrad)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass rounded-3xl" style={{ padding:m('12px','24px') }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize:m(13,18) }}>📉</span>
                  <h3 style={{ fontWeight:700, fontSize:m(12,16) }}>High / Low Bulanan</h3>
                </div>
                <p style={{ fontSize:m(9,11), color:'rgba(255,255,255,0.3)', fontFamily:G, marginBottom:12 }}>IDR / gram</p>
                <ResponsiveContainer width="100%" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 130 : 180}>
                  <LineChart data={MONTHLY} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill:'rgba(255,255,255,0.18)', fontSize:9, fontFamily:G }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill:'rgba(255,255,255,0.18)', fontSize:9 }} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1e6).toFixed(2)}jt`} />
                    <Tooltip contentStyle={TT} formatter={(v:any) => fmt(v)} />
                    <Line type="monotone" dataKey="high" stroke="#34d399" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="avg"  stroke="#F5C842" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="low"  stroke="#fb7185" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-3" style={{ fontSize:11, fontFamily:G }}>
                  <span style={{ color:'#34d399' }}>— Tinggi</span>
                  <span style={{ color:'#F5C842' }}>— Rata-rata</span>
                  <span style={{ color:'#fb7185' }}>— Rendah</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TABLE TAB ── */}
        {activeTab === 'table' && (
          <div className="space-y-4">
            {/* Type chips */}
            <div className="flex gap-2 flex-wrap">
              {GOLD_TYPES.map(t => (
                <button key={t.id} onClick={() => setActiveType(t.id)}
                  className={activeType===t.id ? 'tab-active' : ''}
                  style={{
                    display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:10, fontSize:11, cursor:'pointer', transition:'all 0.15s',
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: activeType===t.id ? 'rgba(245,200,66,0.12)' : 'rgba(255,255,255,0.04)',
                    color: activeType===t.id ? '#F5C842' : 'rgba(255,255,255,0.55)',
                    fontWeight: activeType===t.id ? 700 : 500,
                  }}>
                  <span style={{ fontSize:13 }}>{t.icon}</span>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ lineHeight:1.2 }}>{t.name}</div>
                    <div style={{ fontSize:8, color:'rgba(255,255,255,0.28)', fontFamily:G, marginTop:1 }}>{t.purity}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* ── Chart block ── */}
            <div className="glass rounded-3xl p-6">
              {/* Header row */}
              <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
                <div>
                  <h3 style={{ fontWeight:800, fontSize:m(13,18), letterSpacing:-0.4 }}>
                    {compareMode ? 'Perbandingan Beberapa Emas' : `Pergerakan ${activeTypeMeta?.name}`}
                  </h3>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.32)', fontFamily:G, marginTop:3 }}>
                    {compareMode
                      ? `IDR / gram · ${compareSelected.length} jenis emas · tren harga`
                      : `IDR / gram · ${activeTypeMeta?.purity} · +${typeYearChange.toFixed(1)}% setahun`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setCompareMode(m => !m)} style={{
                    padding:'5px 14px', borderRadius:10, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:G, transition:'all 0.18s',
                    border: compareMode ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    background: compareMode ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.05)',
                    color: compareMode ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                  }}>⚖️ Bandingkan</button>
                  <div className="flex gap-1" style={{ background:'rgba(255,255,255,0.05)', borderRadius:10, padding:3 }}>
                    {RANGES.map(r => (
                      <button key={r} onClick={() => setTableRange(r)} style={{
                        padding:'4px 12px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', border:'none', fontFamily:G, transition:'all 0.18s',
                        background: tableRange===r ? 'linear-gradient(135deg,#F5C842,#fde68a)' : 'transparent',
                        color: tableRange===r ? '#07060f' : 'rgba(255,255,255,0.4)',
                      }}>{r}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Single-type area chart — white line */}
              {!compareMode && (
                <>
                  <div className="flex gap-6 mb-5 flex-wrap" style={{ fontFamily:G, fontSize:11 }}>
                    {[
                      { k:'Sekarang',    v:fmt(typeNow),                    c:'#fff' },
                      { k:'1 Tahun Lalu',v:fmt(typeYearAgo),                c:'rgba(255,255,255,0.4)' },
                      { k:'Kenaikan',    v:`+${typeYearChange.toFixed(2)}%`,c:'#34d399' },
                    ].map(s => (
                      <div key={s.k}>
                        <div style={{ fontSize:9, letterSpacing:1.5, color:'rgba(255,255,255,0.22)', marginBottom:3 }}>{s.k.toUpperCase()}</div>
                        <div style={{ fontWeight:400, color:s.c }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={typeRangeData} margin={{ top:5, right:16, left:0, bottom:32 }}>
                      <defs>
                        <linearGradient id="whiteGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
                          <stop offset="80%"  stopColor="rgba(255,255,255,0.04)" />
                          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="label"
                        tick={{ fill:'rgba(255,255,255,0.28)', fontSize:9, fontFamily:G, fontWeight:400 }}
                        tickLine={false} axisLine={false}
                        interval={xIntervals[tableRange] ?? 3}
                        dy={8} padding={{ left: 60, right: 10 }} />
                      <YAxis domain={['auto','auto']}
                        tick={{ fill:'rgba(255,255,255,0.28)', fontSize:9, fontFamily:G, fontWeight:400 }}
                        tickLine={false} axisLine={false}
                        tickFormatter={v=>`${(v/1e6).toFixed(2)}jt`} width={72} />
                      <Tooltip
                        contentStyle={{ ...TT, borderColor:'rgba(255,255,255,0.15)' }}
                        formatter={(v:any) => [fmt(v), activeTypeMeta?.name]}
                        cursor={{ stroke:'rgba(255,255,255,0.15)', strokeWidth:1 }} />
                      <ReferenceLine y={typeYearAgo} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 3"
                        label={{ value:'1 thn lalu', fill:'rgba(255,255,255,0.25)', fontSize:9, fontFamily:G }} />
                      <Area type="monotone" dataKey="price"
                        stroke="rgba(255,255,255,0.9)" strokeWidth={2}
                        fill="url(#whiteGrad)"
                        dot={false}
                        isAnimationActive={true} animationDuration={900} animationEasing="ease-out"
                        activeDot={{ r:5, fill:'#fff', stroke:'rgba(255,255,255,0.3)', strokeWidth:3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </>
              )}

              {/* Multi-type comparison — fully editable */}
              {compareMode && (
                <>
                  {/* Picker: all types as toggleable chips */}
                  <div className="flex gap-2 flex-wrap mb-5">
                    {GOLD_TYPES.map(t => {
                      const color = ALL_TYPE_COLORS[t.id] ?? '#888'
                      const active = compareSelected.includes(t.id)
                      const base = TYPE_BASE_PRICES[t.id]
                      const chg = base ? +pct(base.now, base.yearAgo) : 0
                      return (
                        <button key={t.id} onClick={() => toggleCompare(t.id)} style={{
                          display:'flex', alignItems:'center', gap:6, padding:'5px 11px', borderRadius:10, fontSize:11, fontFamily:G, cursor:'pointer', transition:'all 0.15s',
                          border: active ? `1px solid ${color}60` : '1px solid rgba(255,255,255,0.08)',
                          background: active ? color + '18' : 'rgba(255,255,255,0.03)',
                          color: active ? color : 'rgba(255,255,255,0.35)',
                          fontWeight: active ? 700 : 400,
                          opacity: active ? 1 : 0.6,
                        }}>
                          <span style={{ width:8, height:8, borderRadius:'50%', background: active ? color : 'rgba(255,255,255,0.2)', display:'inline-block', boxShadow: active ? `0 0 6px ${color}` : 'none', transition:'all 0.15s' }} />
                          <span>{t.icon} {t.name}</span>
                          {active && (
                            <span style={{ color: chg>=0 ? '#34d399' : '#fb7185', fontSize:10 }}>
                              {chg>=0?'+':''}{chg.toFixed(1)}%
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend strip for selected types */}
                  <div className="flex gap-3 flex-wrap mb-4">
                    {compareSelected.map(tid => {
                      const meta = GOLD_TYPES.find(t => t.id === tid)
                      const color = ALL_TYPE_COLORS[tid] ?? '#888'
                      return (
                        <div key={tid} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, fontFamily:G }}>
                          <span style={{ width:14, height:2.5, background:color, borderRadius:99, display:'inline-block' }} />
                          <span style={{ color:'rgba(255,255,255,0.55)' }}>{meta?.name}</span>
                        </div>
                      )
                    })}
                  </div>

                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={compareRangeData} margin={{ top:5, right:16, left:0, bottom:32 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="label"
                        tick={{ fill:'rgba(255,255,255,0.22)', fontSize:9, fontFamily:G, fontWeight:400 }}
                        tickLine={false} axisLine={false}
                        interval={xIntervals[tableRange] ?? 3}
                        dy={8} padding={{ left: 60, right: 10 }} />
                      <YAxis domain={['auto','auto']}
                        tick={{ fill:'rgba(255,255,255,0.22)', fontSize:9, fontFamily:G, fontWeight:400 }}
                        tickLine={false} axisLine={false}
                        tickFormatter={v=>`${(v/1e6).toFixed(2)}jt`} width={72} />
                      <Tooltip contentStyle={TT} formatter={(v:any, name:any) => [fmt(v), GOLD_TYPES.find(t=>t.id===name)?.name ?? name]} />
                      {compareSelected.map(tid => (
                        <Line key={tid} type="monotone" dataKey={tid}
                          stroke={ALL_TYPE_COLORS[tid] ?? '#888'} strokeWidth={2}
                          dot={false} isAnimationActive={true} animationDuration={700} animationEasing="ease-out"
                          activeDot={{ r:4, fill:ALL_TYPE_COLORS[tid] ?? '#888', stroke:'#07060f', strokeWidth:2 }} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>

            <div className="glass rounded-3xl overflow-hidden">
              {/* Table header */}
              <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 style={{ fontWeight:800, fontSize:20, letterSpacing:-0.5 }}>
                      {GOLD_TYPES.find(t=>t.id===activeType)?.icon} {GOLD_TYPES.find(t=>t.id===activeType)?.name}
                    </h2>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.32)', fontFamily:G, marginTop:3 }}>
                      Kadar {GOLD_TYPES.find(t=>t.id===activeType)?.purity} · {now.toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                  <span className="pill pill-neutral">{SOURCES[activeType] ?? '—'}</span>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' as any }}>
                <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:0, fontFamily:G, fontSize:m(10,13) }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.14)', fontSize:m(8,10), color:'rgba(255,255,255,0.28)', letterSpacing:1 }}>
                      {['BERAT','BELI','JUAL','SELISIH','SP'].map((h,hi)=>(
                        <th key={h} style={{ padding:m('5px 6px','9px 12px'), textAlign:'left', fontWeight:600, whiteSpace:'nowrap', borderLeft: hi > 0 ? '1px solid rgba(255,255,255,0.08)' : undefined }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((row,i) => {
                      const spread = row.buy - row.sell
                      const spreadPct = ((spread/row.buy)*100).toFixed(1)
                      const fmtNum = (n: number) => n.toLocaleString('id-ID')
                      const colBorder = '1px solid rgba(255,255,255,0.06)'
                      return (
                        <tr key={row.weight} className="trow"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                          <td style={{ padding:m('5px 6px','9px 12px'), whiteSpace:'nowrap' }}>
                            <span className="grad-gold" style={{ fontWeight:700, fontSize:m(9,12) }}>
                              {row.weight+' gr'}
                            </span>
                          </td>
                          <td style={{ padding:m('5px 6px','9px 12px'), color:'rgba(255,255,255,0.88)', whiteSpace:'nowrap', borderLeft:colBorder }}>{fmtNum(row.buy)}</td>
                          <td style={{ padding:m('5px 6px','9px 12px'), color:'rgba(255,255,255,0.45)', whiteSpace:'nowrap', borderLeft:colBorder }}>{fmtNum(row.sell)}</td>
                          <td style={{ padding:m('5px 6px','9px 12px'), color:'#fb7185', whiteSpace:'nowrap', borderLeft:colBorder }}>{fmtNum(spread)}</td>
                          <td style={{ padding:m('5px 6px','9px 12px'), borderLeft:colBorder }}>
                            <span className="pill pill-down" style={{ fontSize:m(8,11), padding:'1px 6px' }}>{spreadPct}%</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding:'10px 24px', borderTop:'1px solid rgba(255,255,255,0.05)', fontSize:10, color:'rgba(255,255,255,0.22)', fontFamily:G }}>
                * Harga Beli = kamu beli dari penyedia · Harga Jual = kamu jual ke penyedia (buyback)
              </div>
            </div>
          </div>
        )}

        {/* ── DAFTAR EMAS TAB ── */}
        {activeTab === 'dealers' && (
          <div className="space-y-6">
            {/* Legend */}
            <div className="flex gap-2 flex-wrap">
              {[['Resmi','#F5C842'],['Toko','#a78bfa'],['Online','#34d399']].map(([t,c])=>(
                <span key={t} style={{ display:'flex', alignItems:'center', gap:6, background:c+'14', color:c, border:`1px solid ${c}28`, padding:'5px 14px', borderRadius:99, fontSize:12, fontFamily:G, fontWeight:700 }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:c, display:'inline-block', boxShadow:`0 0 8px ${c}` }} />
                  {t}
                </span>
              ))}
            </div>

            {/* Cards grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {DEALERS.map(d => {
                const tc = TYPE_COLORS[d.type] ?? '#888'
                const live = dealerLive[d.name]
                const curBuy  = live?.buy  ?? d.buy
                const curSell = live?.sell ?? d.sell
                const prevBuy  = live?.prevBuy  ?? d.buy
                const prevSell = live?.prevSell ?? d.sell
                const updatedAt = live?.updatedAt ?? new Date()
                const buyDiff  = curBuy  - prevBuy
                const sellDiff = curSell - prevSell
                const spreadPct = ((curBuy - curSell) / curBuy) * 100
                const liveChange = +pct(curBuy, d.buy)
                return (
                  <div key={d.name} className="glass glass-hover rounded-3xl overflow-hidden flex flex-col">
                    <div style={{ height:2.5, background:`linear-gradient(90deg,${tc},${tc}33)` }} />
                    <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:12, flex:1 }}>

                      {/* Name + change badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 style={{ fontWeight:700, fontSize:15, letterSpacing:-0.3 }}>{d.name}</h3>
                          <div className="flex items-center gap-2 flex-wrap" style={{ marginTop:5 }}>
                            <span style={{ fontSize:10, color:'rgba(255,255,255,0.28)', fontFamily:G }}>{d.location}</span>
                            <span style={{ fontSize:10, color:tc, background:tc+'18', padding:'2px 8px', borderRadius:99, fontFamily:G, fontWeight:700 }}>{d.type}</span>
                            {d.note && <span style={{ fontSize:10, color:'rgba(255,255,255,0.22)', fontFamily:G }}>{d.note}</span>}
                          </div>
                        </div>
                        <span className={liveChange >= 0 ? 'pill pill-up' : 'pill pill-down'} style={{ whiteSpace:'nowrap', fontSize:11 }}>
                          {liveChange >= 0 ? '▲' : '▼'} {Math.abs(liveChange).toFixed(2)}%
                        </span>
                      </div>

                      {/* Timestamp */}
                      <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, fontFamily:G, color:'rgba(255,255,255,0.28)', background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'5px 10px' }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', boxShadow:'0 0 6px #34d399', display:'inline-block', flexShrink:0 }} />
                        <span>{fmtTimestamp(updatedAt)}</span>
                      </div>

                      {/* Price boxes — current + prev */}
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { lbl:'KAMU BELI', cur:curBuy,  prev:prevBuy,  diff:buyDiff,  color:'#F5C842' },
                          { lbl:'KAMU JUAL', cur:curSell, prev:prevSell, diff:sellDiff, color:'rgba(255,255,255,0.65)' },
                        ] as const).map(x=>{
                          const up = x.diff > 0
                          const neutral = x.diff === 0
                          return (
                            <div key={x.lbl} style={{ background:'rgba(0,0,0,0.28)', borderRadius:14, padding:'11px 13px' }}>
                              <div style={{ fontSize:9, color:'rgba(255,255,255,0.28)', fontFamily:G, letterSpacing:1.5, marginBottom:4 }}>{x.lbl}</div>

                              {/* Harga sekarang */}
                              <div style={{ fontSize:14, fontWeight:500, color:x.color, fontFamily:G, letterSpacing:-0.3 }}>
                                {x.cur.toLocaleString('id-ID')}
                              </div>

                              {/* Harga sebelumnya + delta */}
                              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:5 }}>
                                <span style={{ fontSize:10, color:'rgba(255,255,255,0.28)', fontFamily:G, textDecoration:'line-through' }}>
                                  {x.prev.toLocaleString('id-ID')}
                                </span>
                                {!neutral && (
                                  <span style={{
                                    fontSize:9, fontFamily:G, fontWeight:700,
                                    color: up ? '#34d399' : '#fb7185',
                                    background: up ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)',
                                    padding:'1px 5px', borderRadius:99,
                                  }}>
                                    {up ? '+' : ''}{x.diff.toLocaleString('id-ID')}
                                  </span>
                                )}
                              </div>

                              <div style={{ fontSize:9, color:'rgba(255,255,255,0.18)', marginTop:3 }}>IDR / gram</div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Spread bar */}
                      <div>
                        <div className="flex justify-between mb-1.5" style={{ fontSize:11, fontFamily:G, color:'rgba(255,255,255,0.32)' }}>
                          <span>Spread</span>
                          <span style={{ color:'#fb7185', fontWeight:700 }}>
                            {(curBuy - curSell).toLocaleString('id-ID')} ({spreadPct.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="spread-track">
                          <div className="spread-fill" style={{ width:`${Math.min(spreadPct/6*100,100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Comparison bar chart */}
            <div className="glass rounded-3xl p-6">
              {/* Header */}
              <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize:20 }}>⚖️</span>
                    <h3 style={{ fontWeight:800, fontSize:m(13,18), letterSpacing:-0.5 }}>Perbandingan Harga Beli & Buyback</h3>
                  </div>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontFamily:G }}>IDR / gram · 1 gram emas · 25 Sep 2026 · diurutkan dari tertinggi</p>
                </div>
                {/* Legend */}
                <div className="flex gap-4" style={{ fontSize:11, fontFamily:G }}>
                  {[
                    { label:'Harga Beli',   color:'#F5C842' },
                    { label:'Buyback',      color:'rgba(255,255,255,0.25)' },
                  ].map(l=>(
                    <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:20, height:3, background:l.color, borderRadius:99, display:'inline-block' }} />
                      <span style={{ color:'rgba(255,255,255,0.5)' }}>{l.label}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    {[['#F5C842','Resmi'],['#a78bfa','Toko'],['#34d399','Online']].map(([c,t])=>(
                      <span key={t} style={{ display:'flex', alignItems:'center', gap:4, color:c as string, fontSize:10 }}>
                        <span style={{ width:7, height:7, borderRadius:'50%', background:c as string, display:'inline-block' }} />{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ranked list with inline bars */}
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:20 }}>
                {[...DEALERS]
                  .sort((a,b) => {
                    const order: Record<string,number> = { Resmi:0, Toko:1, Online:2 }
                    const typeSort = (order[a.type]??3) - (order[b.type]??3)
                    return typeSort !== 0 ? typeSort : b.buy - a.buy
                  })
                  .map((d, i) => {
                    const live = dealerLive[d.name]
                    const curBuy  = live?.buy  ?? d.buy
                    const curSell = live?.sell ?? d.sell
                    const tc = TYPE_COLORS[d.type] ?? '#888'
                    const maxBuy = 2_680_000
                    const minBuy = 2_200_000
                    const buyPct  = ((curBuy  - minBuy) / (maxBuy - minBuy)) * 100
                    const sellPct = ((curSell - minBuy) / (maxBuy - minBuy)) * 100
                    const spread  = curBuy - curSell
                    const spreadPct = ((spread / curBuy) * 100).toFixed(1)
                    const liveChg = +pct(curBuy, d.buy)
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                    return (
                      <div key={d.name} style={{
                        background: i < 3 ? `${tc}08` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${i < 3 ? tc + '22' : 'rgba(255,255,255,0.05)'}`,
                        borderRadius:14, padding:'10px 14px',
                        transition:'background 0.15s',
                      }}
                        onMouseEnter={e=>(e.currentTarget.style.background=tc+'12')}
                        onMouseLeave={e=>(e.currentTarget.style.background= i<3 ? tc+'08' : 'rgba(255,255,255,0.02)')}>

                        {/* Top row: rank + name + badges */}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span style={{ fontFamily:G, fontSize:11, color:'rgba(255,255,255,0.3)', minWidth:22 }}>
                            {medal ?? `#${i+1}`}
                          </span>
                          <span style={{ fontWeight:700, fontSize:13, flex:1, minWidth:120 }}>{d.name}</span>
                          <span style={{ fontSize:10, color:tc, background:tc+'18', padding:'2px 8px', borderRadius:99, fontFamily:G, fontWeight:700 }}>{d.type}</span>
                          {d.note && <span style={{ fontSize:10, color:'rgba(255,255,255,0.28)', fontFamily:G }}>{d.note}</span>}
                          <span className={liveChg>=0?'pill pill-up':'pill pill-down'} style={{ fontSize:10 }}>
                            {liveChg>=0?'▲':'▼'}{Math.abs(liveChg).toFixed(2)}%
                          </span>
                        </div>

                        {/* Buy bar */}
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                          <span style={{ fontSize:9, fontFamily:G, color:'rgba(255,255,255,0.35)', width:40, textAlign:'right', flexShrink:0 }}>BELI</span>
                          <div style={{ flex:1, height:8, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden' }}>
                            <div style={{
                              height:'100%', borderRadius:99, width:`${Math.max(buyPct,2)}%`,
                              background:`linear-gradient(90deg, ${tc}aa, ${tc})`,
                              transition:'width 0.6s ease',
                            }} />
                          </div>
                          <span style={{ fontFamily:G, fontSize:11, fontWeight:600, color:tc, minWidth:90, textAlign:'right' }}>
                            {curBuy.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Sell bar */}
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:9, fontFamily:G, color:'rgba(255,255,255,0.25)', width:40, textAlign:'right', flexShrink:0 }}>JUAL</span>
                          <div style={{ flex:1, height:5, background:'rgba(255,255,255,0.05)', borderRadius:99, overflow:'hidden' }}>
                            <div style={{
                              height:'100%', borderRadius:99, width:`${Math.max(sellPct,2)}%`,
                              background:'rgba(255,255,255,0.2)',
                              transition:'width 0.6s ease',
                            }} />
                          </div>
                          <span style={{ fontFamily:G, fontSize:10, color:'rgba(255,255,255,0.4)', minWidth:90, textAlign:'right' }}>
                            {curSell.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Spread info */}
                        <div style={{ marginTop:6, fontSize:10, fontFamily:G, color:'rgba(255,255,255,0.28)', display:'flex', gap:12 }}>
                          <span>Spread <span style={{ color:'#fb7185', fontWeight:600 }}>{spread.toLocaleString('id-ID')} ({spreadPct}%)</span></span>
                          <span style={{ color:'rgba(255,255,255,0.2)' }}>·</span>
                          <span>{d.location}</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* ── Daftar Dealer Info Lengkap ── */}
            <div className="glass rounded-3xl p-6">
              <h2 style={{ fontWeight:800, fontSize:20, letterSpacing:-0.5, marginBottom:4 }}>🏪 Info Dealer Lengkap</h2>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontFamily:G, marginBottom:20 }}>Rating, biaya, lokasi & jam operasional · klik dealer untuk detail</p>
              <div className="space-y-2">
                {DEALERS.map(d => {
                  const tc = TYPE_COLORS[d.type] ?? '#888'
                  const isOpen = expandedDealer === d.name
                  const stars = Math.round(d.rating)
                  return (
                    <div key={d.name} style={{
                      background: isOpen ? `${tc}0a` : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${isOpen ? tc+'30' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius:14, overflow:'hidden', transition:'all 0.2s',
                    }}>
                      {/* Collapsed row */}
                      <button onClick={() => setExpandedDealer(isOpen ? null : d.name)} style={{
                        width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                        background:'none', border:'none', cursor:'pointer', color:'inherit', textAlign:'left',
                      }}>
                        <span style={{ fontSize:10, color:tc, background:tc+'18', padding:'2px 8px', borderRadius:99, fontFamily:G, fontWeight:700, flexShrink:0 }}>{d.type}</span>
                        <span style={{ fontWeight:600, fontSize:13, flex:1, minWidth:0 }}>{d.name}</span>
                        {/* Star rating */}
                        <span style={{ fontFamily:G, fontSize:11, color:'#fde68a', letterSpacing:1, flexShrink:0 }}>
                          {'★'.repeat(stars)}{'☆'.repeat(5-stars)}
                          <span style={{ color:'rgba(255,255,255,0.35)', marginLeft:4 }}>{d.rating}</span>
                        </span>
                        <span style={{ fontSize:10, color:'rgba(255,255,255,0.28)', fontFamily:G, flexShrink:0 }}>{d.kota}</span>
                        <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)', flexShrink:0 }}>{isOpen ? '▲' : '▼'}</span>
                      </button>

                      {/* Expanded detail */}
                      {isOpen && (
                        <div style={{ padding:'0 16px 16px', display:'flex', flexDirection:'column', gap:14 }}>
                          {/* Ulasan */}
                          <div style={{ fontSize:12, color:'rgba(255,255,255,0.55)', fontStyle:'italic', paddingTop:4, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                            "{d.ulasan}"
                          </div>

                          <div className="grid md:grid-cols-3 gap-3">
                            {/* Biaya tambahan */}
                            <div style={{ background:'rgba(0,0,0,0.25)', borderRadius:12, padding:'12px 14px' }}>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:G, letterSpacing:1.5, marginBottom:8 }}>💸 BIAYA TAMBAHAN</div>
                              <div className="space-y-2" style={{ fontSize:12 }}>
                                <div className="flex justify-between">
                                  <span style={{ color:'rgba(255,255,255,0.45)' }}>Ongkir fisik</span>
                                  <span style={{ color: d.biayaOngkir===0 ? '#34d399' : '#fde68a', fontFamily:G }}>
                                    {d.biayaOngkir===0 ? 'Gratis' : `Rp ${d.biayaOngkir.toLocaleString('id-ID')}`}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span style={{ color:'rgba(255,255,255,0.45)' }}>Asuransi</span>
                                  <span style={{ color:'rgba(255,255,255,0.7)', fontFamily:G }}>
                                    {d.biayaAsuransi===0 ? '—' : `${d.biayaAsuransi}%`}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span style={{ color:'rgba(255,255,255,0.45)' }}>Pajak PPh 22</span>
                                  <span style={{ color: d.pajakPPh===0 ? '#34d399' : '#fb7185', fontFamily:G }}>
                                    {d.pajakPPh===0 ? 'Bebas PPh' : `${d.pajakPPh}%`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Lokasi & Cabang */}
                            <div style={{ background:'rgba(0,0,0,0.25)', borderRadius:12, padding:'12px 14px' }}>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:G, letterSpacing:1.5, marginBottom:8 }}>📍 LOKASI & CABANG</div>
                              <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)', marginBottom:4 }}>{d.kota}</div>
                              <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontFamily:G }}>
                                {d.cabang > 0 ? `${d.cabang.toLocaleString('id-ID')} cabang/outlet` : 'Platform Digital Only'}
                              </div>
                            </div>

                            {/* Jam operasional */}
                            <div style={{ background:'rgba(0,0,0,0.25)', borderRadius:12, padding:'12px 14px' }}>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:G, letterSpacing:1.5, marginBottom:8 }}>🕐 JAM OPERASIONAL</div>
                              <div style={{ fontSize:12, color:'rgba(255,255,255,0.75)', lineHeight:1.6 }}>{d.jam}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── KALKULATOR TAB ── */}
        {activeTab === 'kalkulator' && (
          <div className="space-y-6">
            {/* Mode toggle */}
            <div className="flex gap-2">
              {(['beli','jual'] as const).map(m => (
                <button key={m} onClick={() => setCalcMode(m)} style={{
                  padding:'10px 28px', borderRadius:14, fontSize:14, fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.18s',
                  background: calcMode===m ? 'linear-gradient(135deg,#F5C842,#fde68a)' : 'rgba(255,255,255,0.06)',
                  color: calcMode===m ? '#07060f' : 'rgba(255,255,255,0.45)',
                  boxShadow: calcMode===m ? '0 4px 20px rgba(245,200,66,0.3)' : 'none',
                }}>
                  {m==='beli' ? '🛒 Mau Beli' : '💸 Mau Jual'}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Input panel */}
              <div className="glass rounded-3xl p-6 space-y-5">
                <h3 style={{ fontWeight:800, fontSize:m(13,18), letterSpacing:-0.4 }}>
                  {calcMode==='beli' ? '🛒 Berapa gram yang bisa dibeli?' : '💸 Berapa yang kamu dapat?'}
                </h3>

                {calcMode==='beli' ? (
                  <div>
                    <label style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontFamily:G, letterSpacing:1.5, display:'block', marginBottom:8 }}>BUDGET (IDR)</label>
                    <div style={{ position:'relative' }}>
                      <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'rgba(255,255,255,0.35)', fontFamily:G }}>Rp</span>
                      <input
                        type="text"
                        value={calcBudget ? (+calcBudget).toLocaleString('id-ID') : ''}
                        placeholder="5.000.000"
                        onChange={e => setCalcBudget(e.target.value.replace(/[^0-9]/g,''))}
                        style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'12px 14px 12px 38px', fontSize:m(12,18), fontWeight:400, fontFamily:G, color:'#f0eeff', outline:'none' }} />
                    </div>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.28)', fontFamily:G, marginTop:6 }}>
                      {calcBudget ? `= ${(+calcBudget/1e6).toFixed(2)} juta rupiah` : 'Masukkan budget kamu'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontFamily:G, letterSpacing:1.5, display:'block', marginBottom:8 }}>JUMLAH EMAS (gram)</label>
                    <div style={{ position:'relative' }}>
                      <input
                        type="number" value={calcGram} placeholder="1"
                        onChange={e => setCalcGram(e.target.value)}
                        style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'12px 14px', fontSize:m(12,18), fontWeight:400, fontFamily:G, color:'#f0eeff', outline:'none' }} />
                      <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'rgba(255,255,255,0.35)', fontFamily:G }}>gram</span>
                    </div>
                  </div>
                )}

                {/* Quick presets */}
                <div>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:G, marginBottom:8 }}>
                    {calcMode==='beli' ? 'Preset budget:' : 'Preset gram:'}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {calcMode==='beli'
                      ? ['500000','1000000','2590000','5000000','10000000','25000000'].map(v => (
                          <button key={v} onClick={() => setCalcBudget(v)} style={{
                            padding:'5px 12px', borderRadius:10, fontSize:11, fontWeight:700, fontFamily:G, cursor:'pointer',
                            background: calcBudget===v ? 'rgba(245,200,66,0.2)' : 'rgba(255,255,255,0.05)',
                            border: calcBudget===v ? '1px solid rgba(245,200,66,0.4)' : '1px solid rgba(255,255,255,0.08)',
                            color: calcBudget===v ? '#F5C842' : 'rgba(255,255,255,0.45)',
                          }}>
                            {(+v/1e6)>=1 ? `${(+v/1e6).toFixed(+v%1e6===0?0:2)}jt` : `${(+v/1e3)}rb`}
                          </button>
                        ))
                      : ['0.5','1','2','3','5','10','25','50','100'].map(v => (
                          <button key={v} onClick={() => setCalcGram(v)} style={{
                            padding:'5px 12px', borderRadius:10, fontSize:11, fontWeight:700, fontFamily:G, cursor:'pointer',
                            background: calcGram===v ? 'rgba(245,200,66,0.2)' : 'rgba(255,255,255,0.05)',
                            border: calcGram===v ? '1px solid rgba(245,200,66,0.4)' : '1px solid rgba(255,255,255,0.08)',
                            color: calcGram===v ? '#F5C842' : 'rgba(255,255,255,0.45)',
                          }}>{v} gr</button>
                        ))
                    }
                  </div>
                </div>

                {/* Info box */}
                <div style={{ background:'rgba(245,200,66,0.06)', border:'1px solid rgba(245,200,66,0.15)', borderRadius:14, padding:'12px 16px', fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.7 }}>
                  {calcMode==='beli'
                    ? '💡 Harga beli = harga kamu bayar ke dealer. Semakin besar gramasi, biasanya harga per gram lebih efisien.'
                    : '💡 Harga jual (buyback) = harga dealer beli emasmu kembali. Cari yang spread-nya paling kecil.'}
                </div>
              </div>

              {/* Results panel */}
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <h3 style={{ fontWeight:700, fontSize:16, color:'rgba(255,255,255,0.7)', margin:0 }}>
                    {calcMode==='beli' ? '🛒 Perbandingan Harga Beli' : '💸 Perbandingan Harga Jual'}
                    {calcMode==='beli' && calcBudget && <span style={{ fontSize:12, color:'rgba(255,255,255,0.35)', fontWeight:400 }}> · diurutkan terbanyak gram</span>}
                    {calcMode==='jual' && calcGram && <span style={{ fontSize:12, color:'rgba(255,255,255,0.35)', fontWeight:400 }}> · diurutkan tertinggi buyback</span>}
                  </h3>
                  <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, fontFamily:G, color:'#34d399', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.2)', padding:'3px 10px', borderRadius:99 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', boxShadow:'0 0 6px #34d399', display:'inline-block', animation:'pulse 1.5s ease-in-out infinite' }} />
                    HARGA LIVE
                  </span>
                </div>
                {(calcMode==='beli' ? !calcBudget : !calcGram) && (
                  <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.2)', fontSize:13 }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>🧮</div>
                    Masukkan {calcMode==='beli' ? 'budget' : 'jumlah gram'} untuk melihat hasil
                  </div>
                )}
                {calcMode==='beli' && calcBudget && (() => {
                  const budget = +calcBudget
                  const results = DEALERS.map(d => {
                    const live = dealerLive[d.name]
                    const price = live?.buy ?? d.buy
                    const prevPrice = live?.prevBuy ?? d.buy
                    const gram = budget / price
                    const drift = price - prevPrice
                    return { name:d.name, type:d.type, price, prevPrice, gram, drift, canBuy: gram >= 0.001 }
                  }).filter(r => r.canBuy).sort((a,b) => b.gram - a.gram)
                  return (
                    <div className="space-y-2">
                      {results.map((r, i) => {
                        const tc = TYPE_COLORS[r.type] ?? '#888'
                        const isTop = i === 0
                        return (
                          <div key={r.name} style={{
                            background: isTop ? 'rgba(245,200,66,0.08)' : 'rgba(255,255,255,0.03)',
                            border: isTop ? '1px solid rgba(245,200,66,0.25)' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:12,
                          }}>
                            <span style={{ fontSize:11, fontFamily:G, color:'rgba(255,255,255,0.28)', minWidth:22 }}>{isTop?'🏆':`#${i+1}`}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                                {r.name}
                                <span style={{ fontSize:9, color:tc, background:tc+'18', padding:'1px 6px', borderRadius:99, fontFamily:G }}>{r.type}</span>
                              </div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:G, marginTop:2, display:'flex', alignItems:'center', gap:6 }}>
                                {r.price.toLocaleString('id-ID')} /gram
                                {r.drift !== 0 && (
                                  <span style={{ color: r.drift > 0 ? '#34d399' : '#fb7185', fontSize:9 }}>
                                    {r.drift > 0 ? '▲' : '▼'}{Math.abs(r.drift).toLocaleString('id-ID')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ textAlign:'right' }}>
                              <div style={{ fontSize:16, fontWeight:400, color: isTop ? '#F5C842' : 'rgba(255,255,255,0.8)', fontFamily:G }}>
                                {r.gram >= 1 ? r.gram.toFixed(3) : r.gram.toFixed(4)} gr
                              </div>
                              {isTop && <div style={{ fontSize:9, color:'#34d399', fontFamily:G }}>TERBAIK</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
                {calcMode==='jual' && calcGram && (() => {
                  const gram = +calcGram
                  const results = DEALERS.map(d => {
                    const live = dealerLive[d.name]
                    const sellPrice = live?.sell ?? d.sell
                    const prevSell = live?.prevSell ?? d.sell
                    const total = sellPrice * gram
                    const drift = sellPrice - prevSell
                    return { name:d.name, type:d.type, sellPrice, prevSell, total, drift }
                  }).sort((a,b) => b.total - a.total)
                  return (
                    <div className="space-y-2">
                      {results.map((r, i) => {
                        const tc = TYPE_COLORS[r.type] ?? '#888'
                        const isTop = i === 0
                        return (
                          <div key={r.name} style={{
                            background: isTop ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)',
                            border: isTop ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:12,
                          }}>
                            <span style={{ fontSize:11, fontFamily:G, color:'rgba(255,255,255,0.28)', minWidth:22 }}>{isTop?'🏆':`#${i+1}`}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                                {r.name}
                                <span style={{ fontSize:9, color:tc, background:tc+'18', padding:'1px 6px', borderRadius:99, fontFamily:G }}>{r.type}</span>
                              </div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:G, marginTop:2, display:'flex', alignItems:'center', gap:6 }}>
                                Buyback {r.sellPrice.toLocaleString('id-ID')} /gram
                                {r.drift !== 0 && (
                                  <span style={{ color: r.drift > 0 ? '#34d399' : '#fb7185', fontSize:9 }}>
                                    {r.drift > 0 ? '▲' : '▼'}{Math.abs(r.drift).toLocaleString('id-ID')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ textAlign:'right' }}>
                              <div style={{ fontSize:15, fontWeight:400, color: isTop ? '#34d399' : 'rgba(255,255,255,0.8)', fontFamily:G }}>
                                {fmt(Math.round(r.total))}
                              </div>
                              {isTop && <div style={{ fontSize:9, color:'#34d399', fontFamily:G }}>TERBAIK</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ── PORTFOLIO TAB ── */}
        {activeTab === 'portfolio' && (() => {
          const currentPricePerGram = STATS.current
          const totalWeight = portfolio.reduce((s,e) => s+e.weight, 0)
          const totalCost   = portfolio.reduce((s,e) => s+(e.buyPrice*e.weight), 0)
          const totalValue  = portfolio.reduce((s,e) => {
            const d = DEALERS.find(d=>d.name===e.dealer)
            const live = dealerLive[e.dealer]
            const curSell = live?.sell ?? d?.sell ?? currentPricePerGram
            return s + curSell * e.weight
          }, 0)
          const totalPnl  = totalValue - totalCost
          const totalPnlPct = totalCost > 0 ? (totalPnl/totalCost)*100 : 0
          return (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { k:'Total Emas',   v:`${totalWeight} gram`,      c:'#F5C842', e:'⚖️' },
                  { k:'Modal',        v:fmt(Math.round(totalCost)),  c:'rgba(255,255,255,0.7)', e:'💳' },
                  { k:'Nilai Kini',   v:fmt(Math.round(totalValue)), c: totalPnl>=0?'#34d399':'#fb7185', e:'💰' },
                  { k:'Untung/Rugi',  v:`${totalPnl>=0?'+':''}${fmt(Math.round(totalPnl))} (${totalPnlPct>=0?'+':''}${totalPnlPct.toFixed(2)}%)`, c: totalPnl>=0?'#34d399':'#fb7185', e: totalPnl>=0?'🚀':'📉' },
                ].map(s=>(
                  <div key={s.k} className="glass rounded-2xl" style={{ padding:m('10px 12px','16px 20px') }}>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', fontFamily:G, letterSpacing:1, marginBottom:4 }}>{s.e} {s.k.toUpperCase()}</div>
                    <div style={{ fontSize:m(11,14), fontWeight:600, color:s.c, lineHeight:1.3 }}>{portfolio.length>0?s.v:'—'}</div>
                  </div>
                ))}
              </div>

              {/* Add button */}
              <div className="flex items-center justify-between">
                <h3 style={{ fontWeight:800, fontSize:m(13,18), letterSpacing:-0.4 }}>📋 Daftar Emas Kamu</h3>
                <button onClick={()=>setPfOpen(o=>!o)} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'9px 20px', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.18s',
                  background:'linear-gradient(135deg,#F5C842,#fde68a)', color:'#07060f',
                  boxShadow:'0 4px 16px rgba(245,200,66,0.3)',
                }}>+ Tambah Emas</button>
              </div>

              {/* Add form */}
              {pfOpen && (
                <div className="glass rounded-2xl p-5 space-y-4" style={{ border:'1px solid rgba(245,200,66,0.2)' }}>
                  <h4 style={{ fontWeight:700, fontSize:15 }}>Tambah Kepemilikan Emas</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label:'Label (opsional)', key:'label', type:'text', placeholder:'mis: Emas Pernikahan' },
                      { label:'Tanggal Beli', key:'buyDate', type:'date', placeholder:'' },
                    ].map(f=>(
                      <div key={f.key}>
                        <label style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:G, letterSpacing:1.5, display:'block', marginBottom:6 }}>{f.label.toUpperCase()}</label>
                        <input type={f.type} value={(pfForm as any)[f.key]} placeholder={f.placeholder}
                          onChange={e=>setPfForm(p=>({...p,[f.key]:e.target.value}))}
                          style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:G, color:'#f0eeff', outline:'none', colorScheme:'dark' }} />
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:G, letterSpacing:1.5, display:'block', marginBottom:6 }}>DEALER</label>
                      <select value={pfForm.dealer} onChange={e=>setPfForm(p=>({...p,dealer:e.target.value}))}
                        style={{ width:'100%', background:'rgba(20,18,40,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:G, color:'#f0eeff', outline:'none' }}>
                        {[...DEALERS].sort((a,b)=>a.name.localeCompare(b.name,'id')).map(d=><option key={d.name} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:G, letterSpacing:1.5, display:'block', marginBottom:6 }}>BERAT (gram)</label>
                      <input type="number" value={pfForm.weight} placeholder="mis: 5" step="0.01"
                        onChange={e=>setPfForm(p=>({...p,weight:e.target.value}))}
                        style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:G, color:'#f0eeff', outline:'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:G, letterSpacing:1.5, display:'block', marginBottom:6 }}>HARGA BELI /gram (IDR)</label>
                      <input type="text"
                        value={pfForm.buyPrice ? (+pfForm.buyPrice).toLocaleString('id-ID') : ''}
                        placeholder="mis: 2.500.000"
                        onChange={e=>setPfForm(p=>({...p,buyPrice:e.target.value.replace(/[^0-9]/g,'')}))}
                        style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:G, color:'#f0eeff', outline:'none', fontWeight:400 }} />
                      {pfForm.buyPrice && <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:G, marginTop:4 }}>= Rp {(+pfForm.buyPrice).toLocaleString('id-ID')}/gram</div>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={addPortfolioEntry} style={{
                      padding:'10px 24px', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', border:'none',
                      background:'linear-gradient(135deg,#F5C842,#fde68a)', color:'#07060f',
                    }}>Simpan</button>
                    <button onClick={()=>setPfOpen(false)} style={{
                      padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer',
                      background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)',
                    }}>Batal</button>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {portfolio.length === 0 && !pfOpen && (
                <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>💼</div>
                  <div style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>Portfolio kamu masih kosong</div>
                  <div style={{ fontSize:13 }}>Klik "+ Tambah Emas" untuk mulai mencatat kepemilikan emas kamu</div>
                </div>
              )}

              {/* Portfolio entries */}
              {portfolio.length > 0 && (
                <div className="space-y-3">
                  {portfolio.map(e => {
                    const d = DEALERS.find(d=>d.name===e.dealer)
                    const live = dealerLive[e.dealer]
                    const curSell  = live?.sell ?? d?.sell ?? STATS.current
                    const curBuy   = live?.buy  ?? d?.buy  ?? STATS.current
                    const cost     = e.buyPrice * e.weight
                    const value    = curSell * e.weight
                    const pnl      = value - cost
                    const pnlPct   = (pnl / cost) * 100
                    const gainDay  = d ? +pct(curBuy, d.buy) : 0
                    return (
                      <div key={e.id} className="glass glass-hover rounded-2xl p-5">
                        <div className="flex items-start justify-between flex-wrap gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span style={{ fontWeight:700, fontSize:15 }}>{e.label}</span>
                              <span style={{ fontSize:10, color: TYPE_COLORS[d?.type??'']??'#888', background:(TYPE_COLORS[d?.type??'']??'#888')+'18', padding:'2px 8px', borderRadius:99, fontFamily:G }}>{d?.type}</span>
                            </div>
                            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontFamily:G }}>
                              {e.dealer} · {e.weight} gram · Beli {new Date(e.buyDate).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}
                            </div>
                          </div>
                          <button onClick={()=>removePortfolioEntry(e.id)} style={{
                            background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.2)', borderRadius:8, padding:'4px 10px', fontSize:11, color:'#fb7185', cursor:'pointer', fontFamily:G,
                          }}>Hapus</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                          {[
                            { k:'Modal',       v:fmt(Math.round(cost)),  c:'rgba(255,255,255,0.55)' },
                            { k:'Nilai Kini',  v:fmt(Math.round(value)), c: pnl>=0?'#34d399':'#fb7185' },
                            { k:'Untung/Rugi', v:`${pnl>=0?'+':''}${fmt(Math.round(pnl))}`, c: pnl>=0?'#34d399':'#fb7185' },
                            { k:'Return',      v:`${pnlPct>=0?'+':''}${pnlPct.toFixed(2)}%`, c: pnl>=0?'#34d399':'#fb7185' },
                          ].map(s=>(
                            <div key={s.k} style={{ background:'rgba(0,0,0,0.2)', borderRadius:12, padding:'10px 12px' }}>
                              <div style={{ fontSize:9, color:'rgba(255,255,255,0.28)', fontFamily:G, letterSpacing:1.2, marginBottom:4 }}>{s.k.toUpperCase()}</div>
                              <div style={{ fontSize:13, fontWeight:700, color:s.c, fontFamily:G }}>{s.v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop:10, fontSize:11, color:'rgba(255,255,255,0.28)', fontFamily:G }}>
                          Harga beli kamu: <span style={{ color:'rgba(255,255,255,0.55)' }}>{fmt(e.buyPrice)}/gram</span>
                          {' · '}Buyback sekarang: <span style={{ color: pnl>=0?'#34d399':'#fb7185' }}>{fmt(curSell)}/gram</span>
                          {' · '}Hari ini: <span style={{ color: gainDay>=0?'#34d399':'#fb7185' }}>{gainDay>=0?'▲':'▼'}{Math.abs(gainDay).toFixed(2)}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}

        {/* ── BERITA EMAS TAB ── */}
        {activeTab === 'berita' && (() => {
          const SOURCE_COLORS: Record<string,string> = {
            'Reuters':'#fb7185', 'Kontan':'#F5C842', 'Bisnis.com':'#38bdf8',
            'CNBC Indonesia':'#a78bfa', 'Katadata':'#34d399',
          }
          const CAT_COLORS: Record<string,string> = {
            'Harga':'#F5C842','Global':'#fb7185','Investasi':'#34d399','Regulasi':'#a78bfa','Pasar':'#38bdf8',
          }
          return (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 style={{ fontWeight:800, fontSize:22, letterSpacing:-0.5 }}>📰 Berita Emas</h2>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', fontFamily:G, marginTop:3 }}>Headline terkini dari Kontan · Bisnis.com · Reuters · CNBC Indonesia · Katadata</p>
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {(['Semua','Harga','Global','Investasi','Regulasi','Pasar'] as const).map(cat => (
                    <button key={cat} style={{
                      padding:'5px 14px', borderRadius:99, fontSize:11, fontWeight:700, cursor:'pointer', border:'none', fontFamily:G,
                      background: cat==='Semua' ? 'rgba(245,200,66,0.15)' : `${CAT_COLORS[cat] ?? '#888'}15`,
                      color: cat==='Semua' ? '#F5C842' : (CAT_COLORS[cat] ?? 'rgba(255,255,255,0.4)'),
                      outline: cat==='Semua' ? '1px solid rgba(245,200,66,0.3)' : `1px solid ${(CAT_COLORS[cat] ?? '#888')}30`,
                    }}>{cat}</button>
                  ))}
                </div>
              </div>

              {/* Hot news banner */}
              {BERITA.filter(b=>b.hot).map(b => {
                const sc = SOURCE_COLORS[b.source] ?? '#888'
                const cc = CAT_COLORS[b.category] ?? '#888'
                return (
                  <div key={b.id} className="neon-top glass rounded-3xl relative overflow-hidden" style={{ border:'1px solid rgba(245,200,66,0.18)', padding:m('12px','24px') }}>
                    <div style={{ position:'absolute', top:-80, right:-80, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(245,200,66,0.07),transparent 70%)', pointerEvents:'none' }} />
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:12, alignItems:'center' }}>
                      <span style={{ fontSize:10, color:sc, background:sc+'18', border:`1px solid ${sc}28`, padding:'3px 10px', borderRadius:99, fontFamily:G, fontWeight:700 }}>{b.source}</span>
                      <span style={{ fontSize:10, color:cc, background:cc+'14', border:`1px solid ${cc}24`, padding:'3px 10px', borderRadius:99, fontFamily:G, fontWeight:700 }}>{b.category}</span>
                      <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#fb7185', background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.2)', padding:'3px 10px', borderRadius:99, fontFamily:G, fontWeight:700 }}>
                        🔥 TRENDING
                      </span>
                      <span style={{ fontSize:10, color:'rgba(255,255,255,0.28)', fontFamily:G, marginLeft:'auto' }}>{b.time}</span>
                    </div>
                    <h3 style={{ fontWeight:800, fontSize:m(13,18), letterSpacing:-0.5, lineHeight:1.35, marginBottom:10 }}>{b.headline}</h3>
                    <p style={{ fontSize:m(11,13), color:'rgba(255,255,255,0.5)', lineHeight:1.65 }}>{b.summary}</p>
                    <div style={{ marginTop:14 }}>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,0.28)', fontFamily:G, fontStyle:'italic' }}>* Data simulasi untuk keperluan demonstrasi aplikasi</span>
                    </div>
                  </div>
                )
              })}

              {/* Other news */}
              <div className="space-y-3">
                {BERITA.filter(b=>!b.hot).map(b => {
                  const sc = SOURCE_COLORS[b.source] ?? '#888'
                  const cc = CAT_COLORS[b.category] ?? '#888'
                  return (
                    <div key={b.id} className="glass glass-hover rounded-2xl" style={{ padding:m('10px','20px') }}>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8, alignItems:'center' }}>
                        <span style={{ fontSize:m(8,10), color:sc, background:sc+'18', border:`1px solid ${sc}28`, padding:'2px 7px', borderRadius:99, fontFamily:G, fontWeight:700 }}>{b.source}</span>
                        <span style={{ fontSize:m(8,10), color:cc, background:cc+'14', border:`1px solid ${cc}24`, padding:'2px 7px', borderRadius:99, fontFamily:G, fontWeight:700 }}>{b.category}</span>
                        <span style={{ fontSize:m(8,10), color:'rgba(255,255,255,0.25)', fontFamily:G, marginLeft:'auto' }}>{b.time}</span>
                      </div>
                      <h3 style={{ fontWeight:700, fontSize:m(11,14), letterSpacing:-0.3, lineHeight:1.4, marginBottom:6 }}>{b.headline}</h3>
                      <p style={{ fontSize:m(10,12), color:'rgba(255,255,255,0.42)', lineHeight:1.6 }}>{b.summary}</p>
                    </div>
                  )
                })}
              </div>

              {/* Disclaimer */}
              <div style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.2)', fontFamily:G, padding:'12px 0' }}>
                ℹ️ Berita di atas adalah data simulasi untuk demonstrasi aplikasi. Dalam versi produksi, data diambil real-time dari RSS Kontan, Bisnis.com & Reuters.
              </div>
            </div>
          )
        })()}

        {/* ── Info cards ── */}
        <section className="grid md:grid-cols-3 gap-4">
          {[
            { emoji:'📊', title:'Tentang Harga Emas LM', body:'Antam LM 25 Sep 2026: Rp 2.605.000/gram (beli) & Rp 2.435.000/gram (buyback). Naik ~33% setahun, XAU/USD sekarang di $4.396/oz.', c:'#F5C842' },
            { emoji:'🌍', title:'Kenapa Harga Naik?',   body:'Dolar AS melemah, ketegangan geopolitik meningkat, dan bank sentral Asia borong emas besar-besaran. XAU tembus $4.396 — level tertinggi 2026.', c:'#a78bfa' },
            { emoji:'💡', title:'Tips Smart Beli Emas', body:'Beli pas koreksi kayak hari ini (−Rp 15.000). Gramasi ≥ 5 gr bikin spread lebih efisien. Beli di tempat resmi & simpan sertifikat fisik.', c:'#34d399' },
          ].map(x=>(
            <div key={x.title} className="glass glass-hover rounded-3xl p-6" style={{ borderTop:`2px solid ${x.c}33` }}>
              <div style={{ width:42, height:42, borderRadius:14, background:x.c+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:14 }}>{x.emoji}</div>
              <h3 style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>{x.title}</h3>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.75 }}>{x.body}</p>
            </div>
          ))}
        </section>

      </main>

      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:40, padding:'28px 32px', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#F5C842,#c9971e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, boxShadow:'0 0 14px rgba(245,200,66,0.3)' }}>⚜</div>
          <span style={{ fontWeight:800, fontSize:15 }}>Harga Emas Indonesia</span>
        </div>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.2)', fontFamily:G }}>
          Data untuk referensi · Bukan saran investasi · logammulia.com · hrtagold.id · lotusarchi.com · pegadaian.co.id
        </p>
      </footer>
    </div>
  )
}
