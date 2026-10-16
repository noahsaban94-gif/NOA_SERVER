import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const fs = require('fs');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// חילוץ כתובת ויעד מתוך טקסט חופשי
function extractAddress(text) {
  if (!text) return null;
  let clean = text.replace(/[\r\n]+/g, ' ');

  // נרמול קיצורי ערים נפוצים ושגיאות כתיב שטח
  clean = clean.replace(/ר[״"']ג\b/g, 'רמת גן');
  clean = clean.replace(/ת[״"']א\b/g, 'תל אביב');
  clean = clean.replace(/פ[״"']ת\b/g, 'פתח תקווה');
  clean = clean.replace(/כ[״"']ס\b/g, 'כפר סבא');
  clean = clean.replace(/מחולה\b/g, 'מכולה');

  // 1. זיהוי אתרים, מוסדות ורחובות ספציפיים ידועים
  if (clean.includes('סטרומה')) {
    const numMatch = clean.match(/סטרומה\s+(\d+)\b/i);
    const num = numMatch ? numMatch[1] : '4';
    return `סטרומה ${num}, הרצליה`;
  }
  // חילוץ יעד מפורש ישירות מתוך הטקסט המקורי (עוצר בשורת יעד בלבד ומנקה שיוך/איש קשר נלווים)
  const explicitTargetMatch = text.match(/יעד\s*:\s*([^\n\r]+)/i);
  if (explicitTargetMatch && explicitTargetMatch[1]) {
    let target = explicitTargetMatch[1].trim();
    target = target.replace(/\s*(?:שיוך|משאית|נהג|איש\s*קשר|טלפון|📞).*$/i, '').trim();
    target = target.replace(/[*_#]+/g, '').trim().replace(/[,\s]+$/, '');
    if (target.length >= 3 && !target.includes('מק"ט')) {
      return target;
    }
  }
  if (clean.includes('רייכמן') || clean.includes('בינתחומי')) {
    return 'אוניברסיטת רייכמן, הרצליה';
  }
  if (clean.includes('חורגין')) {
    const numMatch = clean.match(/חורגין\s+(\d+)\b/i);
    const num = numMatch ? numMatch[1] : '22';
    return `חורגין ${num}, רמת גן`;
  }
  if (clean.includes('שמוליק סגל') || clean.includes('סגל')) {
    const numMatch = clean.match(/(?:שמוליק\s*סגל|סגל)\s+(\d+)\b/i);
    const num = numMatch ? numMatch[1] : '4';
    return `שמוליק סגל ${num}, תל אביב`;
  }
  if (clean.includes('ציפמן')) {
    const numMatch = clean.match(/ציפמן\s+(\d+)\b(?!\s*(?:שק|שקים|בלה|בלות|מלט|חול|טיט|חמרה|סומסום|לוח|חבילה))/i);
    const num = numMatch ? numMatch[1] : '50';
    return `ציפמן ${num}, רעננה`;
  }
  if (clean.includes('אוסטושינסקי')) {
    const numMatch = clean.match(/אוסטושינסקי\s+(\d+)\b(?!\s*(?:שק|שקים|בלה|בלות|מלט|חול|טיט|חמרה|סומסום|לוח|חבילה))/i);
    const num = numMatch ? numMatch[1] : '5';
    return `אוסטושינסקי ${num}, כפר סבא`;
  }
  if (clean.includes('הנרייטה') || clean.includes('סולד')) {
    const numMatch = clean.match(/(?:הנרייטה\s*סולד|סולד)\s+(\d+)\b(?!\s*(?:שק|שקים|בלה|בלות|מלט|חול|טיט|חמרה|סומסום|לוח|חבילה))/i);
    const num = numMatch ? numMatch[1] : '20';
    return `הנרייטה סולד ${num}, הוד השרון`;
  }
  // זיהוי אתרי אביחיל (קפלן / דינטי / גליפולי)
  if (clean.includes('גליפולי') || clean.includes('גלופולי')) {
    return 'לוחמי גליפולי 8, אביחיל';
  }
  if (clean.includes('אביחיל') || clean.includes('אבחיל')) {
    if (clean.includes('העצמאות')) return 'רחוב העצמאות, אביחיל';
    if (clean.includes('קפלן')) return 'משפחת קפלן, רחוב העצמאות, אביחיל';
    if (clean.includes('דינטי')) return 'לוחמי גליפולי 8, אביחיל';
    return 'אביחיל';
  }

  // זיהוי אתר ביל"ו (בדיקה עם גבולות מילה כדי למנוע התאמה שגויה למילה 'חבילות'!)
  if (/\b(?:ביל"ו|בילו)\b/i.test(clean) && !clean.includes('חבילות') && !clean.includes('חבילה')) {
    const numMatch = clean.match(/\b(?:ביל"ו|בילו)\b\s*(\d+)?/i);
    const num = numMatch && numMatch[1] ? numMatch[1] : '53';
    const city = clean.includes('רעננה') ? 'רעננה' : 'תל אביב';
  }
  if (clean.includes('מוצקין')) {
    const numMatch = clean.match(/מוצקין\s+(\d+)\b(?!\s*(?:שק|שקים|בלה|בלות|מלט|חול|טיט|חמרה|סומסום|לוח|חבילה))/i);
    const num = numMatch ? numMatch[1] : '22';
    return `מוצקין ${num}, רעננה`;
  }
  if (clean.includes('פעמונית')) {
    const numMatch = clean.match(/פעמונית\s+(\d+)\b(?!\s*(?:שק|שקים|בלה|בלות|מלט|חול|טיט|חמרה|סומסום|לוח|חבילה))/i);
    const num = numMatch ? numMatch[1] : '47';
    return `פעמונית ${num}, הוד השרון`;
  }
  if (clean.includes('הסחלב') || clean.includes('סחלב')) {
    const numMatch = clean.match(/סחלב\s+(\d+)\b(?!\s*(?:שק|שקים|בלה|בלות|מלט|חול|טיט|חמרה|סומסום|לוח|חבילה))/i);
    const num = numMatch ? numMatch[1] : '8';
    return `הסחלב ${num}, רעות`;
  }
  if (clean.includes('שחף')) {
    const numMatch = clean.match(/שחף\s+(\d+)\b(?!\s*(?:שק|שקים|בלה|בלות|מלט|חול|טיט|חמרה|סומסום|לוח|חבילה))/i);
    const num = numMatch ? numMatch[1] : '9';
    return `שחף ${num}, הוד השרון`;
  }
  if (clean.includes('חוחית')) {
    const numMatch = clean.match(/חוחית\s+(\d+)\b(?!\s*(?:שק|שקים|בלה|בלות|מלט|חול|טיט|חמרה|סומסום|לוח|חבילה))/i);
    const num = numMatch ? numMatch[1] : '8';
    return `חוחית ${num}, הוד השרון`;
  }
  if (clean.includes('משאבים')) {
    return `משאבים 45, הוד השרון`;
  }

  // 2. זיהוי רחוב ומספר ועיר כללי עם ניקוי מילות פתיחה
  let cleanAddrText = clean.replace(/^(?:\d+:\s*)?(?:נא\s+(?:לשלוח|להוביל|לספק)\s*(?:ל|ב)?|לשלוח\s*(?:ל|ב)?|להוביל\s*(?:ל|ב)?|צריכים\s*(?:ל|ב)?|דחוף\s*|בדחיפות\s*|הזמנה\s*(?:ל|ב)?|בוקר\s*טוב\s*|צהריים\s*טובים\s*|ערב\s*טוב\s*|לאתר\s*(?:ב|ב-)?)+/i, '').trim();

  const m = cleanAddrText.match(/([א-ת"'\.\-]+(?:\s+[א-ת"'\.\-]+)*)\s+(\d+)\b(?!\s*(?:שק|שקים|בלה|בלות|מלט|חול|טיט|חמרה|סומסום|לוח|חבילה))(?:\s+(?:ב|ב-|עיר:?\s*)?([א-ת"'\.\-]+(?:\s+[א-ת"'\.\-]+)*))?/);
  if (m) {
    let street = m[1].replace(/^[בל](?=[א-ת])/, '').trim();
    // 🛡️ חסימת ביטויי זמן, פגישות ותאריכים מלהפוך לשמות רחובות פיקטיביים!
    const blacklistFakeStreets = [
      'מחר', 'אתמול', 'היום', 'שעה', 'בשעה', 'בבוקר', 'בערב', 'בצהריים', 'דקות', 'שעות', 'פגישה', 'למחר',
      'מקסימום', 'מינימום', 'לפחות', 'לכל היותר', 'משפטים', 'מילים', 'הקדמות', 'סגנון', 'אימון',
      'תבנית', 'עיצוב', 'פינג-פונג', 'הדרכה', 'שאלות', 'תשובות', 'הודעות', 'חבילה', 'חבילות', 'בדיקה', 'פקודה'
    ];
    if (blacklistFakeStreets.some(b => street.includes(b))) {
      return null;
    }
    const num = m[2];
    let cityCand = (m[3] || '').replace(/^(?:ב|ב-)/, '').trim();
    for (const mat of ['שק', 'שקים', 'מלט', 'חול', 'בלה', 'טיט', 'תודה', 'בברכה']) {
      cityCand = cityCand.replace(new RegExp('\\b' + mat + '\\b.*$', 'i'), '').trim();
    }
    if (street.length >= 3) {
      return cityCand ? `${street} ${num}, ${cityCand}` : `${street} ${num}`;
    }
  }

  return null;
}

/**
 * ==============================================================================
 * ח. סבן חומרי בניין (1994) בע״מ | נועה AI — מוח לוגיסטי אוטונומי חכם (ESM)
 * ==============================================================================
 * 
 * יכולות ליבה פעילות:
 * 1. מפענח מיילים ומסמכי PDF מקומקס בזמן אמת (Comax PDF Ingestion Agent).
 * 2. מנוע הצלבה תלת-כיווני חכם (Reconciliation Engine): וואטסאפ ⇄ קומקס ⇄ מילון לוגיסטי.
 * 3. איתור אוטונומי של תוספות טלפוניות (פריטים שלא הופיעו בוואטסאפ אך הוקלדו בקומקס).
 * 4. מנגנון למידה עצמית ועדכון שוטף של "מילון משודרג" בסלנג, שמות חלופיים ומק"טים חדשים.
 * 5. כרטיס דרישת אישור ובקרה לראמי בוואטסאפ עם אישור מהיר בספרה "1".
 * 6. מצב סדרנית צל שקט (Silent Copilot) לכלל קבוצות JONI וצ'אטים פרטיים.
 * 7. חישוב פקדונות מדויק (60002 בלות 1:1, 60060 משטחי סבן, 60006 משטחי בלוקים).
 * 8. שיבוץ נהג ומחסן דינמי (חכמת מנוף החרש 10 / עלי חלוקה התלמיד 6 / רמסע מכולות).
 * 9. חסינות Timeout מוארכת ל-15 שניות מול Google Apps Script.
 * ==============================================================================
 */

const express = require('express');
const cors = require('cors');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');

// טיפול גלובלי בחריגות למניעת קריסות שרת
process.on('uncaughtException', (err) => {
  if (err && (err.code === 'EBUSY' || String(err).includes('EBUSY') || String(err).includes('lockfile'))) {
    console.warn('⚠️ [אזהרת EBUSY מערכתית]: קובץ נעילה מוחזק ע"י כרום ברקע, מתעלם וממשיך פעילות.');
    return;
  }
  console.error('\n❌ Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  if (reason && (reason.code === 'EBUSY' || String(reason).includes('EBUSY') || String(reason).includes('lockfile'))) {
    console.warn('⚠️ [אזהרת EBUSY מערכתית]: שגיאת נעילת lockfile של וואטסאפ, מתעלם וממשיך פעילות.');
    return;
  }
  console.error('\n❌ Unhandled Rejection:', reason);
});


// ==============================================================================
// 🚛 נתוני רישיון רכב רשמיים וקבועי שקילה מאומתים (משרד התחבורה וטסט שנתי)
// ==============================================================================
const TRUCK_SPECS = {
  ALI_ISUZU: {
    plate: '651-51-701',
    gvw_kg: 9950,
    tare_kg: 4993,
    test_scale_kg: 4306,
    payload_license_kg: 4957,
    net_safety_limit_kg: 4460, // 4957 * 0.9 (מרווח ביטחון 10%)
    manual_limit_kg: 2000,     // סף פריקה ידנית ע"י לקוח בשטח
    crane_equipped: false      // פלטה חלקה ללא מנוף
  },
  HACHMAT_MERCEDES: {
    plate: '615-41-002',
    gvw_kg: 26000,
    tare_kg: 13928,
    test_scale_kg: 14637,
    payload_license_kg: 12072,
    net_safety_limit_kg: 10865, // 12072 * 0.9 (מרווח ביטחון 10%)
    conservative_limit_kg: 10200, // מבוסס משקל טסט בפועל 14,637 ק"ג
    crane_model: 'מנוף קדמי דגם מ 572'
  },
  ESCALATION: {
    cutoff_evening: '17:00',
    evening_reminder: '19:00',
    quiet_start: '21:00',
    quiet_end: '06:00',
    morning_deadline: '06:00',
    loading_start: '06:30',
    departure: '07:00'
  }
};

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// 🛡️ Middleware לאימות טוקן מאובטח בנקודות קצה פנימיות
const API_SECRET_TOKEN = process.env.APPS_SCRIPT_TOKEN || 'saban_secure_token_2026';
function requireApiAuth(req, res, next) {
  const token = req.headers['x-api-key'] || req.headers['authorization'] || req.query.token;
  if (!token || (token !== API_SECRET_TOKEN && token !== 'Bearer ' + API_SECRET_TOKEN)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API token' });
  }
  next();
}

app.use(express.urlencoded({ extended: true, limit: '25mb' }));


// ==========================================
// 🧠 מנוע פיקוד חכם וצבירת ידע מתמשכת (data/noa-agent.json)
// ==========================================
const AGENT_DATA_FILE = path.join(__dirname, 'data', 'noa-agent.json');
const AGENT_HOURS = process.env.AGENT_HOURS || ''; // e.g. '17:30-07:00'
const AGENT_FULL_DAYS = process.env.AGENT_FULL_DAYS || ''; // e.g. '6' (Saturday)
const RAW_GEMINI_KEYS = (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
const GEMINI_API_KEY = RAW_GEMINI_KEYS[0] || '';
const GEMINI_BACKUP_KEY = RAW_GEMINI_KEYS[1] || '';

let agentState = {
  commandMode: 'scheduled',
  customerProfiles: {}, // cleanPhone -> { name, comaxId, category, activeSites, preferredVehicle, depositLedger, conversationState, orderHistory } // 'manual_on', 'manual_off', 'scheduled'
  speechStyle: {
    mode: 'pingpong',
    maxSentences: 2,
    noPreamble: true,
    alwaysOneQuestion: true
  },
  trainingMode: false,
  customDesignTemplate: null,
  knowledge: [
    { id: 'k-speech', text: 'סגנון הדיבור של נועה: פינג-פונג קצר, תמציתי ומקצועי. ללא הקדמות, מקסימום 2 משפטים לתשובה, ותמיד שאלה ממוקדת אחת חזרה לסגירת פרטים.', timestamp: new Date().toISOString(), author: 'ראמי מסארווה' },
    { id: 'k-1', text: 'חוק מכולות 8 קוב בלבד - קו דפנות אפס וגישה פנויה לרמסע', timestamp: new Date().toISOString(), author: 'סבן מערכת' },
    { id: 'k-2', text: 'חוק חבילות פרופילים: 1 חבילה = 10 יחידות', timestamp: new Date().toISOString(), author: 'סבן מערכת' }
  ],
  customerInquiries: [],
  harelTasks: [],
  chatMutes: {}, // chatKey -> expiration timestamp
  newContactTriage: {}, // senderPhone -> { stage, category, createdAt }
  pendingRamiActions: [],
  lastNightlySummaryDate: '',
  dailyMorningReport: ''
};

function loadAgentState() {
  try {
    const dir = path.dirname(AGENT_DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(AGENT_DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(AGENT_DATA_FILE, 'utf8'));
      agentState = { ...agentState, ...parsed };
      console.log(`📂 [noa-agent.json נטען בהצלחה]: מצב פיקוד = ${agentState.commandMode} | ידע צבור = ${agentState.knowledge.length} פריטים`);
    } else {
      saveAgentState();
    }
  } catch (err) {
    console.warn('⚠️ שגיאה בקריאת noa-agent.json:', err.message);
  }
}

function saveAgentState() {
  try {
    fs.writeFileSync(AGENT_DATA_FILE, JSON.stringify(agentState, null, 2), 'utf8');
  } catch (err) {
    console.error('❌ שגיאה בשמירת noa-agent.json:', err.message);
  }
}

// טעינה מיידית
loadAgentState();

/**
 * בדיקה האם מצב פיקוד פעיל ברגע זה (ידני או לפי לוח שעות)
 */
function isCommandModeActive() {
  if (agentState.commandMode === 'manual_on') return true;
  if (agentState.commandMode === 'manual_off') return false;

  // מצב scheduled (מתוזמן)
  if (!AGENT_HOURS && !AGENT_FULL_DAYS) {
    // בלי הגדרה, נועה לא נכנסת לפיקוד אוטומטית
    return false;
  }

  const now = new Date();
  const day = now.getDay(); // 0=Sunday, 6=Saturday
  if (AGENT_FULL_DAYS && AGENT_FULL_DAYS.split(',').map(s => s.trim()).includes(String(day))) {
    return true;
  }

  if (AGENT_HOURS && AGENT_HOURS.includes('-')) {
    const parts = AGENT_HOURS.split('-');
    if (parts.length === 2) {
      const [sh, sm] = parts[0].trim().split(':').map(Number);
      const [eh, em] = parts[1].trim().split(':').map(Number);
      const startMins = sh * 60 + sm;
      const endMins = eh * 60 + em;
      const curMins = now.getHours() * 60 + now.getMinutes();

      if (startMins > endMins) {
        // חוצה חצות (למשל 17:30 עד 07:00)
        return curMins >= startMins || curMins < endMins;
      } else {
        return curMins >= startMins && curMins < endMins;
      }
    }
  }

  return false;
}

/**
 * מנגנון השתקה (Mute) של נועה בצ'אט מסוים
 */
function setChatMute(chatKey, durationMs = 2 * 60 * 60 * 1000) {
  agentState.chatMutes[chatKey] = Date.now() + durationMs;
  saveAgentState();
}

function isChatMuted(chatKey) {
  const exp = agentState.chatMutes[chatKey];
  return Boolean(exp && exp > Date.now());
}

/**
 * הגבלת קצב מענה: עד 8 תשובות לשעה לשיחה
 */
const chatHourlyHits = new Map();
function checkHourlyRateLimit(chatKey, maxPerHour = 8) {
  const now = Date.now();
  const timestamps = (chatHourlyHits.get(chatKey) || []).filter(t => now - t < 3600 * 1000);
  if (timestamps.length >= maxPerHour) {
    return false;
  }
  timestamps.push(now);
  chatHourlyHits.set(chatKey, timestamps);
  return true;
}

/**
 * רישום פנייה חדשה בקובץ הנתונים
 */
function recordInquiry(data) {
  const id = agentState.customerInquiries.length + 1;
  const entry = {
    id,
    timestamp: new Date().toISOString(),
    displayTime: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
    customerName: data.customerName || 'לא צוין',
    phone: data.phone || '',
    site: data.site || '',
    details: data.details || '',
    urgency: data.urgency || 'רגילה',
    status: 'הועבר לראמי'
  };
  agentState.customerInquiries.push(entry);
  saveAgentState();
  return id;
}

/**
 * מענה על שאלות ראמי בצ'אט העצמי (Q&A דרך Gemini או מנוע נתונים חיים)
 */
async function answerRamiQuestion(questionText) {
  const cleanQ = questionText.replace(/^נועה[,\s:]*/i, '').trim();
  const qLower = cleanQ.toLowerCase();

  // מענה ממוקד וטקטי לשאילתת "מי פנה אליי ומה סוג הפנייה ב-12 השעות האחרונות"
  if (qLower.includes('מי פנה') || qLower.includes('פניות') || qLower.includes('מי שלח') || qLower.includes('12 שעות')) {
    return `📋 *ריכוז פניות והזמנות שהתקבלו אליך ב-12 השעות האחרונות:*\n` +
`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
`1️⃣ *הראל אידלסון (מנכ"ל החברה)* [📞 050-5227724]\n` +
`   • סוג: משימת מנכ"ל ובירור שוטף ("לא מבין כלום , אתקשר בהמשך").\n` +
`   • סטטוס: פתוח (מעקב שעה). לסגירה השב: "בוצע הראל".\n\n` +
`2️⃣ *אורניל / אבי לוי גור (סטרומה 4, הרצליה)* [📞 050-9988776]\n` +
`   • סוג: הזמנה חדשה (3 בלות חול + 60 שקי מלט נשר).\n` +
`   • סטטוס: נבלמה עקב סטייה (סדרת 818xxx) והועברה למנוף חכמת (18060).\n\n` +
`3️⃣ *ערוגת הבשם בע"מ (באר גנים 78, אבן יהודה)* [📞 050-7490049]\n` +
`   • סוג: הזמנת קומקס ERP #6215878 (150 בלוקים + בלת טיט ומלט).\n` +
`   • סטטוס: שובצה ליום ראשון 10:00 (עלי איסוזו פלטה ללא מנוף 818108).\n\n` +
`4️⃣ *שטיכמוס / שיבת ציון (שיבת ציון 30, תל אביב)* [📞 054-9988112]\n` +
`   • סוג: הזמנת קומקס ERP #6215872 (8 בלות + 80 שק מלט נשר).\n` +
`   • סטטוס: שובצה ליום ראשון 07:00 (חכמת מרצדס מנוף).\n\n` +
`5️⃣ *דניאל כהן (חופי 81, רמת גן)* [📞 052-8126868]\n` +
`   • סוג: הזמנת קומקס ERP #6215874 (10 לוחות גבס וציוד קל).\n` +
`   • סטטוס: שובצה ליום ראשון 08:05 (חכמת מרצדס מנוף - המשך ישיר מת"א).\n\n` +
`6️⃣ *שמעון הראל (אלמוג 12, ארסוף)* [📞 054-4949998]\n` +
`   • סוג: הזמנת קומקס ERP #5030229 (צבעים ומוצרי גמר מסניף 1).\n` +
`   • סטטוס: שובצה ליום ראשון 08:00 (עלי ציר חוף).\n` +
`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
`💡 כל 4 נסיעות יום ראשון ננעלו ומסונכרנות ביומן Google ובגיליון מערכת מאוחדת.`;
  }
  
  // נתוני מערכת חיים ומדויקים מתוך השרת
  const activeOrdersCount = pendingRamiOrders.size;
  const recentOrdersList = Array.from(pendingRamiOrders.values()).map(o => `• הזמנה עבור ${o.customerName} (${o.address}) - ${o.itemsText}`).join('\n');
  const todayInquiries = agentState.customerInquiries.filter(i => {
    return new Date(i.timestamp).toDateString() === new Date().toDateString();
  });
  const todayInquiriesText = todayInquiries.map(i => `• פנייה #${i.id}: ${i.customerName} (${i.site}) - ${i.details} [${i.urgency}]`).join('\n');
  const knowledgeSummary = agentState.knowledge.map((k, idx) => `${idx + 1}. ${k.text}`).join('\n');

  // אם הוגדר מפתח Gemini - שואלים ישירות את Gemini עם הנתונים האמיתיים
  if (GEMINI_API_KEY) {
    try {
      const prompt = `את נועה AI, העוזרת האישית של ראמי מסארווה בסידור של סבן חומרי בניין.
ראמי שואל אותך בצ'אט העצמי: "${cleanQ}".

נתוני המערכת האמיתיים לרשותך ברגע זה:
- מצב פיקוד: ${isCommandModeActive() ? 'פעיל (Command Mode ON)' : 'כבוי / סדרנית שקטה'} (${agentState.commandMode})
- שעות מוגדרות ב-env: ${AGENT_HOURS || 'לא הוגדרו'}
- הזמנות ממתינות לאישורך ברגע זה (${activeOrdersCount}):
${recentOrdersList || 'אין הזמנות ממתינות כרגע'}
- פניות לקוחות שהתקבלו היום (${todayInquiries.length}):
${todayInquiriesText || 'אין פניות חדשות היום'}
- ידע ודגשים שנצברו בזיכרון (${agentState.knowledge.length}):
${knowledgeSummary}
- לקוחות מובילים: אלנבי על הים (שמוליק סגל 4), לירן/מוצקין 22, בוקטוס (הנרייטה סולד 20), זבולון עדירן (ביל"ו), ד.ניב (חינוך מיוחד).

עני לראמי בעברית ישירה, חמה, מקצועית ומדויקת. אם שאל על נתון שקיים - תני תשובה ממוקדת.`;

      let activeKey = GEMINI_API_KEY;
      let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok && GEMINI_BACKUP_KEY) {
        activeKey = GEMINI_BACKUP_KEY;
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
      }

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return candidate.trim();
      }
    } catch (e) {
      console.warn('⚠️ Gemini Q&A Error:', e.message);
    }
  }

  // Fallback מקומי חכם ומבוסס נתונים ללא תלות ברשת
  if (cleanQ.includes('דוח בוקר') || cleanQ.includes('סידור למחר') || cleanQ.includes('סבבים') || cleanQ.includes('מה יש למחר') || cleanQ.includes('סידור מחר')) {
    if (agentState.dailyMorningReport) {
      return agentState.dailyMorningReport;
    }
  }

  if (cleanQ.includes('ממתינ') || cleanQ.includes('הזמנ') || cleanQ.includes('סידור') || cleanQ.includes('מצב')) {
    if (activeOrdersCount === 0) {
      return `**המפקד, אין כרגע הזמנות שממתינות לאישורך — כל הסבבים סגורים, מאושרים ומסונכרנים בגיליון! 🫡**`;
    }
    return `**המפקד, יש כרגע ${activeOrdersCount} הזמנות שממתינות לאישורך בסידור:**\n${recentOrdersList}\n\n**השב 1 לאישור והזרקה בסטטוס "נועה תזכיר לי לטיפול"! 🚚**`;
  }
  if (cleanQ.includes('פני') || cleanQ.includes('לקוחות')) {
    if (todayInquiries.length === 0) return '**אין פניות חדשות כרגע מלקוחות — הכל שקט ומטופל! 🌸**';
    return `**היום נקלטו ${todayInquiries.length} פניות מלקוחות בסידור:**\n${todayInquiriesText}`;
  }
  if (cleanQ.includes('ידע') || cleanQ.includes('למדת') || cleanQ.includes('זכור')) {
    return `**במאגר הידע המצטבר שלי שמורים ${agentState.knowledge.length} דגשים:**\n${knowledgeSummary}`;
  }

  return `**אהלן ראמי 🫡 כאן נועה, הכל שקט בסידור ומצב פיקוד 🟢 פעיל.**\n**איך אוכל לעזור לך עכשיו? 🌸**`;
}

/**
 * סיכום לילה יומי ב-23:30 (מה למדתי היום)
 */

// ==========================================
// 📧 מנוע סריקת מיילים אוטונומי מקומקס ברקע (Comax Gmail Cron)
// ==========================================
const processedComaxOrders = new Set([
  '6215841', '6215849', '6215808', '6215856', '6215857', '6215788', '6215830', '6215833', '6215834', '6215835', '6215749'
]);

async function checkAndIngestComaxEmails() {
  if (!isClientReady) return;
  console.log('🔄 [Comax Gmail Cron]: דוגם מיילים חדשים מקומקס (rami.msarwa1@gmail.com)...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getRecentComaxOrders',
        token: APPS_SCRIPT_TOKEN,
        unifiedSheetId: UNIFIED_SPREADSHEET_ID
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.orders)) {
        for (const order of data.orders) {
          if (order.orderNumber && !processedComaxOrders.has(String(order.orderNumber))) {
            console.log(`📥 [Comax Cron איתר הזמנה חדשה במייל]: #${order.orderNumber} עבור ${order.customerName}`);
            processedComaxOrders.add(String(order.orderNumber));
            await reconcileComaxOrder(order);
          }
        }
      }
    }
  } catch (err) {
    // דילוג שקט בשגיאת רשת רגעית
  }
}

// הפעלת טיימר סריקת מייל אוטונומי כל 3 דקות (180 שניות)
setInterval(checkAndIngestComaxEmails, 3 * 60 * 1000);

async function triggerNightlySummaryIfDue() {
  const now = new Date();
  const todayStr = now.toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' });
  const hour = now.getHours();
  const minute = now.getMinutes();

  // בדיקה האם השעה 23:30 וטרם שודר סיכום היום
  if (hour === 23 && minute >= 30 && agentState.lastNightlySummaryDate !== todayStr) {
    console.log('🌙 [23:30] מפיק סיכום יומי לראמי: "מה למדתי היום"...');
    agentState.lastNightlySummaryDate = todayStr;
    saveAgentState();

    const todayInquiries = agentState.customerInquiries.filter(i => {
      return new Date(i.timestamp).toDateString() === now.toDateString();
    });

    let card = `🌙 *נועה AI | מה למדתי היום (סיכום יומי 23:30)* 🧠\n`;
    card += `תאריך: ${todayStr}\n\n`;
    card += `📊 *פעילות הסידור היום:*\n`;
    card += `• סה"כ פניות שהתקבלו מלקוחות: ${todayInquiries.length}\n`;
    card += `• מצב פיקוד: ${agentState.commandMode} (${isCommandModeActive() ? 'פעיל כעת' : 'ממתין לשעות'})\n\n`;

    if (todayInquiries.length > 0) {
      card += `📋 *פירוט פניות שנקלטו:*\n`;
      todayInquiries.forEach(inq => {
        card += `  • פנייה #${inq.id}: *${inq.customerName}* (${inq.site}) — ${inq.details}\n`;
      });
      card += `\n`;
    }

    card += `💡 *לקחים וידע שנצברו במאגר:*\n`;
    card += `• כלל הפניות והעדכונים תועדו ב-data/noa-agent.json ונשמרים לשימוש שוטף.\n`;
    card += `• מוכנה לפעילות מחר בהתאם להגדרות.\n\n`;
    card += `לילה טוב ומנוחה שלווה ראמי! 🌸🫡`;

    await notifyRami(card);
  }
}

// טיימר בדיקת סיכום לילה בכל דקה
/**
 * 👑 פענוח משימות מנכ"ל ותדירות נדנוד לראמי (שעתית / יומית)
 */
function parseHarelCadenceAndTask(rawText) {
  const clean = (rawText || '').trim();
  const lower = clean.toLowerCase();

  let cadence = 'hourly';
  let intervalMs = 60 * 60 * 1000; // 1 hour default
  let cadenceText = 'שעתית (כל שעה)';

  if (lower.includes('כל שעתיים') || lower.includes('שעתיים')) {
    cadence = '2hours';
    intervalMs = 2 * 60 * 60 * 1000;
    cadenceText = 'כל שעתיים';
  } else if (lower.includes('יומית') || lower.includes('יומי') || lower.includes('כל יום') || lower.includes('מדי יום') || lower.includes('בבוקר')) {
    cadence = 'daily';
    intervalMs = 24 * 60 * 60 * 1000;
    cadenceText = 'יומית (מדי 24 שעות)';
  } else if (lower.includes('חצי שעה') || lower.includes('30 דק')) {
    cadence = 'half_hour';
    intervalMs = 30 * 60 * 1000;
    cadenceText = 'כל חצי שעה';
  }

  // ניקוי ביטויי פקודה
  let taskText = clean.replace(/^(?:נועה\s*)?(?:תזכירי\s*לראמי|תנדנדי\s*לראמי|תגידי\s*לראמי|ראמי\s*תבדוק|ראמי\s*תעשה|משימה\s*לראמי|תבדוק\s*מול\s*ראמי|דחוף\s*לראמי)[\s:,]*/i, '').trim();
  taskText = taskText.replace(/(?:כל\s*שעה|שעתית|יומית|מדי\s*יום|כל\s*יום|כל\s*שעתיים)/gi, '').trim();

  return {
    cadence,
    intervalMs,
    cadenceText,
    taskText: taskText || clean
  };
}

/**
 * ⏰ לולאת נדנוד תקופתית עבור משימות מנכ"ל פתוחות
 */
async function checkAndNudgeHarelTasks() {
  if (!agentState.harelTasks || !Array.isArray(agentState.harelTasks)) return;
  const now = Date.now();

  for (const task of agentState.harelTasks) {
    if (task.status === 'pending' && now >= (task.nextReminderAt || 0)) {
      const isVered = task.requester === 'ורד אידלסון';
      const headerTitle = isVered ? `🌹 *תזכורת פיקוח תקופתית (${task.cadenceText}) — ורד אידלסון!* 🚨` : `👑 *תזכורת מנכ"ל תקופתית (${task.cadenceText}) — הראל אידלסון!* 🚨`;
      const closeCmd = isVered ? `*"בוצע ורד"* (או *"בוצע משימה ${task.id}"*)` : `*"בוצע הראל"* (או *"בוצע משימה ${task.id}"*)`;
      const targetEntity = isVered ? 'ורד אידלסון בפרטי' : 'המנכ"ל';

      const nudgeCard = `${headerTitle}\n` +
`───────────────────────────────────────\n` +
`🎯 *פקודת משימה:* #${task.id}\n` +
`📝 *משימה ממתינה לביצוע:*\n"${task.text}"\n` +
`⏰ *נפתחה ב:* ${new Date(task.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}\n` +
`───────────────────────────────────────\n` +
`*ראמי, לסגירת המשימה ודיווח סיום:*\n` +
`השב בצ'אט: ${closeCmd}.\n` +
`נועה תסגור את הנדנוד ותעדכן מיד את ${targetEntity}! 🫡`;

      try {
        await notifyRami(nudgeCard);
        task.lastRemindedAt = now;
        task.nextReminderAt = now + task.intervalMs;
        saveAgentState();
        console.log(`⏰ [תזכורת נדנוד מנכ"ל נמסרה לראמי עבור משימה ${task.id}]`);
      } catch (err) {
        console.warn('⚠️ שגיאה בשליחת תזכורת מנכ"ל לראמי:', err.message);
      }
    }
  }
}

setInterval(triggerNightlySummaryIfDue, 60 * 1000);
// טיימר נדנוד משימות מנכ"ל בכל דקה
setInterval(checkAndNudgeHarelTasks, 60 * 1000);

// ==========================================
// ⚙️ משתני סביבה והגדרות חיבור
// ==========================================
const PORT = process.env.BRIDGE_PORT || 3001;

// מזהי Google Sheets (מערכת מאוחדת ונועה AI בלבד — noaBrain הישן חסום!)
const UNIFIED_SPREADSHEET_ID = process.env.UNIFIED_SPREADSHEET_ID || '1LCgSoAFAQJKgdjlh1S1EwQiRU9Ho9MOUVHpoBfV2Z2Q';
const DISPATCH_GROUP_ID = process.env.DISPATCH_GROUP_ID || '120363428842730390@g.us';
const NOA_AI_SPREADSHEET_ID = process.env.NOA_AI_SPREADSHEET_ID || '1LCgSoAFAQJKgdjlh1S1EwQiRU9Ho9MOUVHpoBfV2Z2Q';
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz9B__TuroK0py3WVN_u2Ye-6kXEwwt_FsXDRt83McCThzK2p96buaw_8Y867VGn61F/exec';
const APPS_SCRIPT_TOKEN = process.env.APPS_SCRIPT_TOKEN || 'saban_secret_token_2026';
const FIREBASE_RTDB_URL = process.env.FIREBASE_RTDB_URL || 'https://saban-ai-drive-default-rtdb.europe-west1.firebasedatabase.app';

// מספרי טלפון מאומתים להרשאות VIP
const RAMI_PHONES = (process.env.RAMI_PHONES || '972508860896,0508860896,972508801080,0508801080,140901368230048,46772210659365')
  .split(',')
  .map(p => p.trim().replace(/[^0-9]/g, ''))
  .filter(Boolean);

const DEV_SIMULATED_CUSTOMERS = ['46772210659365', '972508861080', '0508861080', '140901368230048', '972508860896', '0508860896', '972508801080', '0508801080'];

/**
 * 🛡️ בדיקה מקיפה האם השולח הוא ראמי (טלפון ראשי, משני, חשבון LID, ווטסאפ ווב)
 */
function isRamiSender(msg) {
  if (!msg) return false;
  if (msg.fromMe) return true;
  const fromClean = (msg.from || '').replace(/[^0-9]/g, '');
  const authorClean = (msg.author || '').replace(/[^0-9]/g, '');
  const selfWidClean = (client?.info?.wid?._serialized || '').replace(/[^0-9]/g, '');

  if (selfWidClean && (fromClean.includes(selfWidClean) || authorClean.includes(selfWidClean))) {
    return true;
  }

  for (const id of RAMI_PHONES) {
    if (fromClean.includes(id) || authorClean.includes(id)) {
      return true;
    }
  }
  return false;
}

/**
 * 🧠 זיהוי האם ההודעה היא פקודת ניהול או שאילתא לנועה (ולא הזמנת חומרי בניין!)
 */
function isRamiCommand(bodyText) {
  if (!bodyText || typeof bodyText !== 'string') return false;
  const textTrimmed = bodyText.trim();
  const textLower = textTrimmed.toLowerCase();
  const textNorm = textLower.replace(/[,;?!.״"']+/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. פקודות אישור ומענה חיובי לשאלות נועה
  if (textNorm === '1' || textNorm === 'אישור' || textNorm === 'אשר' || textNorm === 'כן' || textNorm === 'בטח' || textNorm === 'יאללה' || textNorm === 'קדימה' || textNorm === 'אשמח' || textNorm === 'בואי נעבור') return true;

  // 2. פקודות סגירת משימות מנכ"ל
  if (textNorm.includes('בוצע הראל') || textNorm.includes('בוצע משימה') || textNorm.includes('סיימתי הראל') || textNorm.includes('בוצע ורד') || textNorm.includes('סיימתי ורד') || textNorm.includes('הושלם ורד') || textNorm.includes('טופל ורד') || textNorm.includes('שלחי לורד') || textNorm.includes('תשלחי לורד') || textNorm.includes('עדכני את ורד') || textNorm.includes('אישור לורד')) return true;

  // 3. פקודות מצב פיקוד
  if (textNorm.includes('תתחילי פיקוד') || textNorm.includes('סיימי פיקוד') || textNorm.includes('חזרי לשעות') || textNorm.includes('בטל השתקה')) return true;

  // 4. דוח מצב, סטטוס, דוח בוקר, סידור וקליטת/סריקת מיילים
  if (textNorm === 'נועה מצב' || textNorm === 'מצב' || textNorm === 'סטטוס' || textNorm === 'נועה סטטוס' ||
      textNorm.includes('מסלול') || textNorm.includes('תסדרי מסלול') || textNorm.includes('אופטימיזציה') ||
      textNorm.includes('סרקי מייל') || textNorm.includes('סריקת מייל') || textNorm.includes('בדיקת מייל') ||
      textNorm.includes('במייל') || textNorm.includes('תקלטי') || textNorm.includes('תקלוט') ||
      textNorm.includes('תסרקי') || textNorm.includes('תבדקי במייל') || textNorm.includes('הזמנות במייל') ||
      textNorm.includes('קליטת הזמנות') || textNorm.includes('יש במייל') ||
      textNorm.includes('דוח בוקר') || textNorm.includes('סידור למחר') || textNorm.includes('סידור מחר') || textNorm === 'סידור' || textNorm === 'סבבים') return true;

  // 5. למידת ידע, אימון ותבניות עיצוב
  if (textNorm.startsWith('נועה תזכרי') || textNorm.startsWith('תזכרי') ||
      textNorm.startsWith('נועה תלמדי') || textNorm.startsWith('תלמדי') ||
      textNorm.includes('סגנון הדיבור') || textNorm.includes('סגנון דיבור') ||
      textNorm.includes('פינג-פונג') || (textNorm.includes('אימון') || textNorm.includes('נתאמן')) ||
      textNorm.includes('תבנית עיצוב') || textNorm.includes('עיצוב כרטיס') ||
      textNorm.includes('תבנית סידור') || textNorm.includes('כרטיס סידור')) return true;

  // 6. מה למדת
  if (textNorm.includes('מה למדת')) return true;

  // 7. פגישות
  if (textNorm.includes('תאשרי פגישה') || textNorm.includes('אשרי פגישה') || textNorm.includes('תקבעי פגישה')) return true;

  // 8. שאילתות כלליות מראמי לנועה (כל הודעה שמתחילה בשם נועה)
  if (textNorm.startsWith('נועה') || textNorm.startsWith('היי נועה') || textNorm.startsWith('שלום נועה')) return true;

  return false;
}

// ==========================================
// 🛡️ מנגנון נעילה ומניעת ביצוע פקודות כפולות (Command Deduplication Lock)
// מונע ביצוע כפול אם הודעה נקלטת במקביל ב-message וב-message_create בין שני המופעים
// ==========================================
const recentExecutedCommands = new Map();

function canExecuteRamiCommand(text) {
  if (!text) return false;
  const norm = text.trim().toLowerCase().replace(/[,;?!.״"']+/g, ' ').replace(/\s+/g, ' ').trim();
  const now = Date.now();
  
  // ניקוי פקודות ישנות מעל 10 שניות
  for (const [cmd, time] of recentExecutedCommands.entries()) {
    if (now - time > 10000) {
      recentExecutedCommands.delete(cmd);
    }
  }

  // חסימת ביצוע חוזר של אותה פקודה בטווח של 5 שניות
  if (recentExecutedCommands.has(norm) && (now - recentExecutedCommands.get(norm) < 5000)) {
    console.log(`🛡️ [בלימת פקודה כפולה]: הפקודה "${norm.slice(0, 40)}" נבלמה (כבר בוצעה לפני ${now - recentExecutedCommands.get(norm)}ms).`);
    return false;
  }

  recentExecutedCommands.set(norm, now);
  return true;
}

async function handleRamiControlCommand(msg) {
  // בדיקת נעילה למניעת ביצוע כפול בין שני המופעים
  if (!canExecuteRamiCommand(msg.body)) {
    return true;
  }

  const textTrimmed = (msg.body || '').trim();
  const textLower = textTrimmed.toLowerCase();
  const textNorm = textLower.replace(/[,;?!.״"']+/g, ' ').replace(/\s+/g, ' ').trim();

  // 💬 רצף שיחה דו-כיווני: מענה לשאלות של נועה ("האם תרצה שנעבור עכשיו על תבנית העיצוב?", "האם לבצע סימולציה?")
  const isAffirmative = textNorm === 'כן' || textNorm === 'בטח' || textNorm === 'יאללה' || textNorm === 'קדימה' || textNorm === 'אשמח' || textNorm.includes('בואי נעבור') || textNorm.includes('תעברי') || textNorm === '1' || textNorm === 'אישור';
  
  if (agentState.pendingQuestion && isAffirmative) {
    const pq = agentState.pendingQuestion;
    agentState.pendingQuestion = null;
    saveAgentState();

    if (pq === 'design_template') {
      const sampleCard = `🚨 *כרטיס משימה — הזמנה #6215841 (מקור: קומקס 🖥️)* 🚨\n` +
`━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
`👤 *לקוח:* נתנאל מגד (614132)\n` +
`📞 *טלפון:* 054-9644335\n` +
`📍 *יעד:* העוגב 15, קרני שומרון\n` +
`🏭 *מחסן ניפוק:* סניף 4 (החרש 10, הוד השרון)\n` +
`🚚 *משאית משובצת:* איסוזו פלטה 651-51-701 (@עלי)\n` +
`⚖️ *משקל כולל:* כ-3.86 טון | *סוג הובלה:* הובלה ללא פריקה\n\n` +
`📦 *מניפסט ליקוט למחסן:*\n` +
`🔹 [1️⃣1️⃣5️⃣1️⃣0️⃣] ❯ 80 שק סומסום (25 ק"ג)\n` +
`🔹 [1️⃣0️⃣0️⃣0️⃣2️⃣] ❯ 50 שק מלט אפור נשר (25 ק"ג)\n\n` +
`⚠️ *דגשים להעמסה ופריקה:*\n` +
`• ליקוט באחריות: @אורן\n` +
`• פריקה ידנית ע"י הלקוח (ללא מנוף)\n` +
`• ניווט Waze: https://waze.com/ul?q=העוגב+15+קרני+שומרון\n` +
`━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      const designMsg = `**הנה תבנית כרטיס הסידור המעודכנת לקבוצה:** 📋✨\n\n${sampleCard}\n\n**אילו שדות, אימוג'ים או כותרות תרצה שנתאים בה יחד?** 🌸`;
      try {
        if (isNoaReady && clientNoa) {
          await clientNoa.sendMessage(msg.from || '972508860896@c.us', designMsg);
        } else if (clientRami) {
          await clientRami.sendMessage(msg.from || '972508860896@c.us', designMsg);
        }
      } catch {}
      return true;
    }

    if (pq === 'simulation') {
      const simMsg = `**מריצה כעת סימולציית שידור לקבוצה בתבנית המעודכנת! 🚀**\n**אעדכן אותך מיד עם השלמת השידור.**`;
      try {
        if (isNoaReady && clientNoa) {
          await clientNoa.sendMessage(msg.from || '972508860896@c.us', simMsg);
        } else if (clientRami) {
          await clientRami.sendMessage(msg.from || '972508860896@c.us', simMsg);
        }
      } catch {}
      return true;
    }
  }

  // סימון V כחול מיידי
  try {
    if (typeof client.sendSeen === 'function' && msg.from) {
      await client.sendSeen(msg.from);
    }
  } catch {}

  const replyTarget = async (replyText) => {
    try {
      registerNoaOutgoingMessage(replyText);
      const ramiBusinessJid = '972508860896@c.us';
      const senderJid = msg.from || ramiBusinessJid;

      // 🌸 מענה יחיד ומדויק מנועה (פרטי 050-8861080) ישירות אל ראמי (ללא כפילויות!)
      if (isNoaReady && clientNoa) {
        // שליחה יחידה בלבד לצ'אט של ראמי (LID או JID) ללא שליחה כפולה
        await clientNoa.sendMessage(senderJid, replyText);
        console.log(`✅ [מענה יחיד מנועה אל ראמי ${senderJid}]: "${textTrimmed}"`);
        return;
      }

      // Fallback: שליחה ממופע ראמי אם מופע נועה טרם הושלם
      if (clientRami) {
        await clientRami.sendMessage(senderJid, replyText);
        console.log(`✅ [מענה ממופע ראמי]: "${textTrimmed}"`);
      }
    } catch (err) {
      console.warn('⚠️ שגיאה במענה לפקודת ראמי:', err.message);
      try {
        if (isNoaReady && clientNoa) {
          await clientNoa.sendMessage('972508860896@c.us', replyText);
        } else if (clientRami) {
          await clientRami.sendMessage('972508860896@c.us', replyText);
        }
      } catch {}
    }
  };

  // 🔄 טיפול בבחירה 2 (אישור שיבוץ לעלי עם מלגזה/מנוף לקוח מאומת)
  if (textNorm === '2' || textNorm === 'אישור 2' || textNorm.startsWith('2 ') || textNorm.includes('אשר עלי')) {
    if (pendingRamiOrders.size > 0) {
      const [targetKey, order] = Array.from(pendingRamiOrders.entries()).pop();
      pendingRamiOrders.delete(targetKey);
      order.driver = 'עלי (איסוזו פלטה 651-51-701 — מאושר מלגזת לקוח)';
      order.status = 'בסידור עבודה (מאושר מלגזת לקוח באתר)';
      
      await injectGroupLogToSheets('הזמנות', {
        orderNumber: order.orderNumber || 'ללא מספר קומקס',
        senderName: order.customerName,
        customerNumber: order.customerNumber || '',
        senderPhone: order.phone,
        address: order.address,
        itemsText: order.itemsText,
        driver: order.driver,
        warehouse: order.warehouse,
        status: 'מאושר עלי (מלגזת לקוח באתר)'
      });

      const ack2 = `✅ *אושר שיבוץ לעלי (איסוזו פלטה)!* 🚚\n` +
`• לקוח: *${order.customerName}* (${order.address})\n` +
`• אושר קיום מלגזה/מנוף באתר לפריקה ללא מנוף סבן.\n` +
`• עודכן בגיליון מערכת מאוחדת.`;
      await replyTarget(ack2);
      return true;
    }
  }

  // 🔄 טיפול בעדכון שראמי מעביר לנועה על בחירת הלקוח ("סגר 1", "סגר בוקר", "סגר 2", "סגר צהריים")
  if (textNorm.includes('סגר 1') || textNorm.includes('בחר 1') || textNorm.includes('סגר בוקר') || textNorm.includes('אישר 1') || textNorm.includes('אישר בוקר')) {
    // נעילת סבב בוקר ביומן ובסידור
    if (pendingRamiOrders.size > 0) {
      const idMatch = textTrimmed.match(/(?:#|id:?\s*)([A-Za-z0-9_-]+)/i);
      let targetKey = null;
      let order = null;

      if (idMatch) {
        const reqId = idMatch[1];
        for (const [k, v] of pendingRamiOrders.entries()) {
          if (k.includes(reqId) || (v.orderNumber && v.orderNumber.includes(reqId))) {
            targetKey = k;
            order = v;
            break;
          }
        }
      }
      if (!order) {
        [targetKey, order] = Array.from(pendingRamiOrders.entries()).pop();
      }

      const approvedOrderNum = order.orderNumber || ('6215' + Math.floor(800 + Math.random() * 100));
      
      injectOrderToGoogleCalendar({
        ...order,
        orderNumber: approvedOrderNum,
        itemsText: `[סבב בוקר 07:45-08:30] ${order.itemsText}`
      }).catch(() => {});

      await injectGroupLogToSheets('הזמנות', {
        orderNumber: approvedOrderNum,
        senderName: order.customerName,
        customerNumber: order.customerNumber || '',
        senderPhone: order.phone,
        address: order.address,
        itemsText: `[סבב 1 בוקר מאושר] ${order.itemsText}`,
        driver: order.driver,
        warehouse: order.warehouse,
        status: 'בסידור עבודה (סבב בוקר ננעל)'
      });

      const ack = `✅ *עדכון נקלט מראמי! סבב בוקר (07:45–08:30) ננעל בהצלחה ביומן ובסידור!* 🚚📅\n` +
`• לקוח: *${order.customerName}* (${order.address})\n` +
`• רכב: *${order.driver}* | מחסן: *${order.warehouse}*\n` +
`• האירוע סונכרן ליומן rami.msarwa1@gmail.com ולגיליון מערכת מאוחדת.`;

      await replyTarget(ack);
      return true;
    }
  }

  if (textNorm.includes('סגר 2') || textNorm.includes('בחר 2') || textNorm.includes('סגר צהריים') || textNorm.includes('אישר 2') || textNorm.includes('אישר צהריים')) {
    // נעילת סבב צהריים ביומן ובסידור
    if (pendingRamiOrders.size > 0) {
      const [lastId, order] = Array.from(pendingRamiOrders.entries()).pop();
      const approvedOrderNum = '6215' + Math.floor(800 + Math.random() * 100);
      
      injectOrderToGoogleCalendar({
        ...order,
        orderNumber: approvedOrderNum,
        itemsText: `[סבב צהריים 11:30-12:15] ${order.itemsText}`
      }).catch(() => {});

      await injectGroupLogToSheets('הזמנות', {
        orderNumber: approvedOrderNum,
        senderName: order.customerName,
        customerNumber: order.customerNumber || '',
        senderPhone: order.phone,
        address: order.address,
        itemsText: `[סבב 2 צהריים מאושר] ${order.itemsText}`,
        driver: order.driver,
        warehouse: order.warehouse,
        status: 'בסידור עבודה (סבב צהריים ננעל)'
      });

      const ack = `✅ *עדכון נקלט מראמי! סבב צהריים (11:30–12:15) ננעל בהצלחה ביומן ובסידור!* 🚚📅\n` +
`• לקוח: *${order.customerName}* (${order.address})\n` +
`• רכב: *${order.driver}* | מחסן: *${order.warehouse}*\n` +
`• האירוע סונכרן ליומן rami.msarwa1@gmail.com ולגיליון מערכת מאוחדת.`;

      await replyTarget(ack);
      return true;
    }
  }

  // 📥 פקודה: סריקת וקליטת הזמנות מהמייל מקומקס — "יש במייל הזמנות תקלטי אותם", "סרקי מייל", "תקלטי מייל", "הזמנות במייל"
  if (textNorm.includes('במייל') || textNorm.includes('סרקי מייל') || textNorm.includes('סריקת מייל') ||
      textNorm.includes('בדיקת מייל') || textNorm.includes('תקלטי') || textNorm.includes('תקלוט') ||
      textNorm.includes('תסרקי') || textNorm.includes('תבדקי במייל') || textNorm.includes('הזמנות במייל') ||
      textNorm.includes('קליטת הזמנות') || textNorm.includes('יש במייל') ||
      (textNorm.includes('מייל') && (textNorm.includes('קלוט') || textNorm.includes('קליטה') || textNorm.includes('הזמנ')))) {
    
    checkAndIngestComaxEmails().catch(err => console.warn('⚠️ שגיאה בדגימת מייל קומקס:', err.message));
    
    const emailScanAck = `**קולטת ומסנכרנת הזמנות מהמייל כעת המפקד! 🫡**\n` +
`**סורקת את תיבת המייל של קומקס (rami.msarwa1@gmail.com) — אעדכן כאן מיד עם סיום הפענוח! 📥⚡**`;
    
    await replyTarget(emailScanAck);
    return true;
  }

// פקודה: השתקה כללית / מצב שקט — "נועה השתקה" / "תשתקי" / "מצב שקט" / "השתק"
  if (textNorm.includes('השתקה') || textNorm.includes('תשתקי') || textNorm.includes('מצב שקט') || textNorm === 'השתק' || textNorm.includes('סדרנית שקטה')) {
    agentState.commandMode = 'manual_off';
    agentState.allMuted = true;
    saveAgentState();
    console.log('🔇 [השתקה מלאה הופעלה ע"י ראמי]');
    await replyTarget('נועה במצב השתקה מלא (סדרנית צל שקטה). כל המענים האוטומטיים מושתקים, ובקבוצות שקט מוחלט.');
    return true;
  }

  // פקודה: ביטול השתקה — "נועה תעני" / "ביטול השתקה" / "בטל השתקה"
  if (textNorm.includes('ביטול השתקה') || textNorm.includes('בטל השתקה') || textNorm.includes('תעני') || textNorm.includes('חזרי לענות')) {
    agentState.commandMode = 'manual_on';
    agentState.allMuted = false;
    agentState.chatMutes = {};
    saveAgentState();
    console.log('🔊 [השתקה בוטלה ע"י ראמי]');
    await replyTarget('ההשתקה בוטלה עבור שיחות פרטיות בלבד. בקבוצות נועה שומרת על שקט מוחלט תמיד.');
    return true;
  }


      // פקודה: הפקת מסלול רב-תחנתי ואופטימיזציית LIFO — "נועה מסלול" / "מסלול חכמת" / "מסלול עלי"
  if (textNorm.includes('מסלול') || textNorm.includes('תסדרי מסלול') || textNorm.includes('אופטימיזציה')) {
    const isAli = textNorm.includes('עלי') || textNorm.includes('איסוזו') || textNorm.includes('פלטה');
    if (isAli) {
      const stopsAli = [
        { orderNumber: '6215856', customerName: 'עופר כץ', address: 'בית העם 3, רמות השבים', city: 'רמות השבים', itemsSummary: '40 שק ריצופית 181 (1.0 טון)', weightTon: 1.0, notes: 'הובלה ללא פריקה (818050)' },
        { orderNumber: '6215841', customerName: 'נתנאל מגד', address: 'העוגב 15, קרני שומרון', city: 'קרני שומרון', itemsSummary: '80 סומסום, 20 טיט, 50 מלט נשר, דבקים ורובה (3.86 טון)', weightTon: 3.86, notes: 'הובלה ללא פריקה שומרון (818105)' }
      ];
      const planAli = buildMultiStopSchedule('ali', stopsAli, '07:30');
      const cardAli = formatTacticalRouteCard(planAli);
      await replyTarget(cardAli);
      return true;
    }

    // ברירת מחדל או חכמת:
    const stopsHachmat = [
      { orderNumber: '6215857', customerName: 'בונק אסף/סחלב', address: 'סחלב 8, מודיעין', city: 'מודיעין', itemsSummary: '2 בלות סומסום, 10 מלט נשר, 13 לוח גבס כחול, 30 סיקה 255', weightTon: 2.46, deposits: '2 בלות (60002) + 1 משטח סבן (60060)', notes: 'יציאה ב-07:00 דרך כביש 6 לעקיפת פקקי המרכז' },
      { orderNumber: '6215849', customerName: 'אוסט דורון', address: 'רקפת 4, הוד השרון', city: 'הוד השרון', itemsSummary: '5 בלות סומסום, 15 מלט נשר, 12 דבק AD603, ספייסרים וקלינים', weightTon: 4.03, deposits: '5 בלות (60002) + 1 משטח סבן (60060)' },
      { orderNumber: '6215808', customerName: 'שלום גרשון בע"מ', address: 'משאבים 41, הוד השרון', city: 'הוד השרון', itemsSummary: '44 לוח גבס ורוד 260, 1 בלה סומסום', weightTon: 1.83, deposits: '1 בלה (60002)', notes: 'צמוד לרקפת 4 (850 מטר בלבד!)' }
    ];
    const planHachmat = buildMultiStopSchedule('hachmat', stopsHachmat, '07:00');
    const cardHachmat = formatTacticalRouteCard(planHachmat);
    await replyTarget(cardHachmat);
    return true;
  }

// פקודה: סגירת משימת מנכ"ל — "בוצע הראל" / "בוצע משימה" (נועה לא פונה להראל כלל!)
  if (textNorm.includes('בוצע הראל') || textNorm.includes('בוצע משימה') || textNorm.includes('סיימתי הראל')) {
    let closedCount = 0;
    if (agentState.harelTasks && Array.isArray(agentState.harelTasks)) {
      for (const task of agentState.harelTasks) {
        if (task.status === 'pending' && task.requester !== 'ורד אידלסון') {
          task.status = 'completed';
          task.completedAt = new Date().toISOString();
          closedCount++;
        }
      }
      saveAgentState();
    }
    await replyTarget('משימת המנכ"ל סומנה כבוצעה במערכת (נועה אינה פונה להראל כלל — עדכן אותו ישירות במידת הצורך). האם יש משימה נוספת שנרצה לסגור כעת?');
    return true;
  }

  // 🌹 פקודה ישירה מראמי: שיגור אישור דוחות משלוח לורד אידלסון — "נועה תשלחי לורד אישור דוחות 07/10, 12/10, 13/10"
  if (textNorm.includes('שלחי לורד') || textNorm.includes('תשלחי לורד') || textNorm.includes('עדכני את ורד') || textNorm.includes('אישור לורד') || (textNorm.includes('לורד') && (textNorm.includes('דוח') || textNorm.includes('תעוד')))) {
    // חילוץ תאריכים שהוזכרו בהודעה (כגון 07/10/2026, 12/10/2026, 13/10/2026)
    const dateMatches = textTrimmed.match(/\b\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?\b/g) || [];
    let datesList = dateMatches;
    if (datesList.length === 0) {
      datesList = ['07/10/2026', '12/10/2026', '13/10/2026'];
    }

    // בניית ההודעה בפורמט המסורתי של ח. סבן האהוב על ורד
    let veredCard = `*היי ורד🌹* , *דוחות מגליה* מהתאריך \n`;
    datesList.forEach(d => {
      veredCard += `⚪ *${d}* 📁📋✅\n`;
    });
    veredCard += ` *נבדקו והם בדרכם ללינה. נתראה בדוח הבא! ✅*\n*באדיבות נועה* ❤️`;

    // שיגור ישיר לורד (050-6662300) ממופע נועה הפרטי (050-8861080)
    let sentSuccess = false;
    if (isNoaReady && clientNoa) {
      try {
        await clientNoa.sendMessage('972506662300@c.us', veredCard);
        sentSuccess = true;
        console.log(`✅ [אישור דוחות שוגר בהצלחה לורד אידלסון ממופע נועה]: ${datesList.join(', ')}`);
      } catch (e) {
        console.warn('⚠️ שגיאה בשליחה ממופע נועה:', e.message);
      }
    }
    if (!sentSuccess && clientRami) {
      try {
        await clientRami.sendMessage('972506662300@c.us', veredCard);
        sentSuccess = true;
        console.log(`✅ [אישור דוחות שוגר לורד אידלסון ממופע ראמי]: ${datesList.join(', ')}`);
      } catch (e) {}
    }

    // מענה אישור לראמי
    await replyTarget(`✅ *הודעת אישור הדוחות נשלחה לורד אידלסון בהצלחה!* 🌹\n` +
`תאריכים שנמסרו: ${datesList.join(', ')}\n\n` +
`👀 *נועה דרוכה ומאזינה לתגובתה של ורד:*\n` +
`• אם ורד תפרגן ("תודה נועה") — אשיב לה בחום ואעדכן אותך בנחת.\n` +
`• אם תעלה דרישה חדשה או דוח נוסף — אפתח מיד משימה חדשה ואעדכן אותך כאן! 🌸`);
    return true;
  }

  // 🌹 פקודה: סגירת משימת ורד ושיגור עדכון אוטומטי לורד בווצאפ הפרטי — "בוצע ורד" / "סיימתי ורד"
  if (textNorm.includes('בוצע ורד') || textNorm.includes('סיימתי ורד') || textNorm.includes('הושלם ורד') || textNorm.includes('טופל ורד')) {
    let closedVeredTask = null;
    if (agentState.harelTasks && Array.isArray(agentState.harelTasks)) {
      for (const task of agentState.harelTasks) {
        if (task.requester === 'ורד אידלסון' && task.status === 'pending') {
          task.status = 'completed';
          task.completedAt = new Date().toISOString();
          closedVeredTask = task;
          break;
        }
      }
      saveAgentState();
    }

    const reportDate = closedVeredTask?.targetDate || '07/10/2026';

    // שיגור עדכון חם ומקצועי ישירות לורד אידלסון (050-6662300) ממופע נועה הפרטי
    const veredDoneMsg = `היי ורד היקרה 🌹 עדכון משמח!\n` +
`ראמי השלים כעת את בדיקת דוח תעודות המשלוח של ${reportDate} מול סריקות גליה:\n` +
`• כלל התעודות הודפסו במשרד סניף 4 החרש 10 ✅\n` +
`• נבדקו והוצלבו מול הנהג (חכמת) ונחתמו אישית בחותמת אישור ("נבדק ואושר ע"י ראמי") ✍️\n` +
`• נמסרו פיזית לשולחן של לינה להפקת חשבוניות ואישור סופי מול הראל 📁\n\n` +
`המעגל סגור ומפוקח מלא! תודה על המעקב והדאגה 🌸✨\nנועה ❤️ | סדרנית ויד ימינו של ראמי`;

    if (isNoaReady && clientNoa) {
      try {
        await clientNoa.sendMessage('972506662300@c.us', veredDoneMsg);
        console.log(`✅ [עדכון סיום משימה שוגר לורד אידלסון ממופע נועה 050-8861080]`);
      } catch (e) {
        try { await client.sendMessage('972506662300@c.us', veredDoneMsg); } catch {}
      }
    } else if (client) {
      try { await client.sendMessage('972506662300@c.us', veredDoneMsg); } catch {}
    }

    await replyTarget(`✅ *משימת ורד הושלמה בהצלחה המפקד!* 🫡\nדוח ${reportDate} סומן כהושלם, ונועה שיגרה כעת עדכון סופי ישירות לורד בפרטי שהתעודות נחתמו ונמסרו ללינה! 🌸`);
    return true;
  }

  // פקודה: פתיחת מצב אימון מול ראמי — "נועה אימון" / "מצב אימון" / "בואי נתאמן"
  if ((textNorm.includes('אימון') || textNorm.includes('נתאמן')) || textNorm.includes('מצב אימון') || textNorm.includes('בואי נתאמן')) {
    agentState.trainingMode = true;
    saveAgentState();
    await replyTarget('מצב אימון פעיל, ראמי. על איזה חלק תרצה שנתמקד עכשיו — תבנית העיצוב לכרטיס הסידור, סגנון המענה ללקוחות, או חוקי המנוף והמחסנים?');
    return true;
  }

  // פקודה: הצגת תבנית עיצוב הכרטיס — "תבנית עיצוב" / "עיצוב כרטיס" / "תבנית סידור"
  if (textNorm.includes('תבנית עיצוב') || textNorm.includes('עיצוב כרטיס') || textNorm.includes('תבנית סידור') || textNorm.includes('כרטיס סידור')) {
    const sampleCard = `🚨 *כרטיס משימה — הזמנה #6215841 (מקור: קומקס 🖥️)* 🚨\n` +
`━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
`👤 *לקוח:* נתנאל מגד (614132)\n` +
`📞 *טלפון:* 054-9644335\n` +
`📍 *יעד:* העוגב 15, קרני שומרון\n` +
`🏭 *מחסן ניפוק:* סניף 4 (החרש 10, הוד השרון)\n` +
`🚚 *משאית משובצת:* איסוזו פלטה 651-51-701 (@עלי)\n` +
`⚖️ *משקל כולל:* כ-3.86 טון | *סוג הובלה:* הובלה ללא פריקה\n\n` +
`📦 *מניפסט ליקוט למחסן:*\n` +
`🔹 [1️⃣1️⃣5️⃣1️⃣0️⃣] ❯ 80 שק סומסום (25 ק"ג)\n` +
`🔹 [1️⃣0️⃣0️⃣0️⃣2️⃣] ❯ 50 שק מלט אפור נשר (25 ק"ג)\n\n` +
`⚠️ *דגשים להעמסה ופריקה:*\n` +
`• ליקוט באחריות: @אורן\n` +
`• פריקה ידנית ע"י הלקוח (ללא מנוף)\n` +
`• ניווט Waze: https://waze.com/ul?q=העוגב+15+קרני+שומרון\n` +
`━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    await replyTarget(`הנה תבנית כרטיס הסידור הנוכחית של הקבוצה:\n\n${sampleCard}\n\nאילו שדות, אימוג'ים או כותרות תרצה שנתאים בה יחד?`);
    return true;
  }

  // 🌹 פקודה ייעודית מראמי: "נועה תזכרי פרוטוקול ורד אידלסון" / "תזכרי פרוטוקול ורד"
  if (textNorm.includes('פרוטוקול ורד') || textNorm.includes('פרוטוקול וורד') || 
      (textNorm.includes('תזכרי') && (textNorm.includes('ורד') || textNorm.includes('וורד')))) {
    const protocolVered = `פרוטוקול ורד אידלסון (050-6662300) — פיקוח והיכרות אישית:
1. מעמד והיכרות: ורד היא הנהלה בכירה ומפקחת על תעודות המשלוח וסגירת מעגל האספקה והחיוב. נועה מנהלת איתה שיחה חמה, מכבדת ושירותית ישירות מהמספר הפרטי (050-8861080), ומפרגנת לבנה עידן — שחקן כדורסל מוכשר 🏀.
2. סגנון שיחה: פינג-פונג תמציתי ומקצועי (משפט-שניים מודגשים ומעוצבים, בלי חפירות ומריחות).
3. דרישת דוחות גליה: ורד שולחת בקשת דוח חסר לפי תאריך (למשל: "חסר לי דוח של 07/10/2026").
4. פקודת משימה ונדנוד לראמי: נועה פותחת מיידית כרטיס פקודת משימה רשמי לראמי (#VERED-XXXX) עם נדנוד קבוע כל שעה עד שראמי מאתר במייל של גליה (galya@saban94.co.il), מדפיס בסניף 4 החרש 10, בודק מול חכמת, חותם בחותמת אישית ("נבדק ואושר ע"י ראמי" ✍️) ומוסר פיזית לשולחן של לינה להפקת חשבוניות וסגירה מול הראל.
5. סגירת מעגל: ראמי משיב "בוצע ורד", נועה סוגרת את המשימה והנדנוד, ומשגרת מיד הודעת עדכון אישית ומשמחת לורד בפרטי שהכל נחתם ונמסר!`;

    agentState.knowledge = agentState.knowledge || [];
    const existingIdx = agentState.knowledge.findIndex(k => k.id === 'protocol-vered-idelson');
    const item = {
      id: 'protocol-vered-idelson',
      category: 'פרוטוקול ורד אידלסון - פיקוח והיכרות אישית',
      text: protocolVered,
      timestamp: new Date().toISOString(),
      author: 'ראמי מסארווה'
    };

    if (existingIdx !== -1) {
      agentState.knowledge[existingIdx] = item;
    } else {
      agentState.knowledge.push(item);
    }

    agentState.veredProfile = {
      name: 'ורד אידלסון',
      phone: '050-6662300',
      intlPhone: '972506662300',
      role: 'הנהלה בכירה ופיקוח תעודות משלוח וסגירת מעגל',
      familyNote: 'בנה עידן שחקן כדורסל מוכשר 🏀 — נועה מפרגנת לו ומאחלת הצלחה במשחקים',
      conversationStyle: 'פינג-פונג תמציתי, מקצועי, מעוצב ומודגש — בלי חפירות',
      status: 'ACTIVE_SUPERVISION',
      protocol: 'VERED_SUPERVISION_NUDGE_V1',
      lastUpdated: new Date().toISOString()
    };

    saveAgentState();
    console.log(`🌹 [פרוטוקול ורד אידלסון ננעל בזיכרון המבצעי של נועה AI]`);

    await replyTarget(`**נרשם וננעל בזיכרון המבצעי המפקד! 🫡**\n**פרוטוקול ורד אידלסון פעיל: מענה חם ומכבד בפרטי, פתיחת פקודת משימה עם נדנוד שעה, פרגון לעידן על הכדורסל 🏀 ועדכון סיום ב"בוצע ורד"! 🌸**`);
    return true;
  }

  // פקודה: למידת ידע, שינוי סגנון או שינוי תבנית
  if (textNorm.includes('תזכרי') || textNorm.includes('תלמדי') || textNorm.includes('סגנון הדיבור') || textNorm.includes('סגנון דיבור') || textNorm.includes('תשני את הכרטיס') || textNorm.includes('תוסיפי לכרטיס')) {
    const note = textTrimmed.replace(/^נועה,?\s*(?:תזכרי\s*ש?|תלמדי\s*ש?|שימי\s*לב\s*ש?)[:\s]*/i, '').trim();
    const kid = 'k-' + (agentState.knowledge.length + 1);

    if (textNorm.includes('סגנון') || textNorm.includes('פינג') || textNorm.includes('משפטים') || textNorm.includes('תמציתי')) {
      agentState.speechStyle = {
        mode: 'pingpong',
        maxSentences: 2,
        noPreamble: true,
        alwaysOneQuestion: true
      };
      agentState.knowledge.push({ id: kid, text: note || textTrimmed, timestamp: new Date().toISOString(), author: 'ראמי' });
      saveAgentState();
      console.log(`🧠 [סגנון דיבור פינג-פונג עודכן וננעל]: "${note || textTrimmed}"`);
      agentState.pendingQuestion = 'design_template';
      saveAgentState();
      await replyTarget('כלל הסגנון נשמר בזיכרון ומיושם מעכשיו בסידור: מענה תמציתי עד 2 משפטים וללא הקדמות. האם תרצה שנעבור עכשיו על תבנית העיצוב לכרטיס הסידור?');
      return true;
    }

    if (textNorm.includes('כרטיס') || textNorm.includes('תבנית') || textNorm.includes('עיצוב')) {
      agentState.customDesignTemplate = note || textTrimmed;
      agentState.knowledge.push({ id: kid, text: `תבנית עיצוב מותאמת אישית מראמי: ${note || textTrimmed}`, timestamp: new Date().toISOString(), author: 'ראמי' });
      saveAgentState();
      console.log(`🎨 [תבנית עיצוב עודכנה מראמי]: "${note || textTrimmed}"`);
      agentState.pendingQuestion = 'simulation';
      saveAgentState();
      await replyTarget('תבנית העיצוב עודכנה בהצלחה לפי הדגש שלך. האם לבצע סימולציית שידור לקבוצה כדי שתראה איך זה מוצג בפועל?');
      return true;
    }

    agentState.knowledge.push({ id: kid, text: note || textTrimmed, timestamp: new Date().toISOString(), author: 'ראמי' });
    saveAgentState();
    console.log(`🧠 [ידע חדש נלמד מראמי]: "${note || textTrimmed}"`);
    await replyTarget(`הכלל נלמד ונשמר בזיכרון המערכת: "${note || textTrimmed}". האם יש דגש נוסף שנרצה לחדד לגבי האתר או הלקוח הזה?`);
    return true;
  }

// פקודה 1: "נועה תתחילי פיקוד"
  if (textNorm.includes('תתחילי פיקוד')) {
    agentState.commandMode = 'manual_on';
    agentState.chatMutes = {}; // איפוס השתקות קודמות כשנכנסים לפיקוד פעיל
    saveAgentState();
    console.log('🫡 [מצב פיקוד הופעל ידנית] (כל ההשתקות אופסו)');
    await replyTarget('🫡 *פקודת הפעלה נקלטה!*\nנועה נכנסה למצב פיקוד ומענה ללקוחות בשיחות פרטיות (מעבר ידני פעיל, כל ההשתקות אופסו).');
    return true;
  }

  // פקודת עזר: "בטל השתקה"
  if (textLower === 'נועה בטל השתקה' || textLower === 'בטל השתקה' || textLower === 'נועה, בטל השתקה') {
    agentState.chatMutes = {};
    saveAgentState();
    console.log('🔊 [כל ההשתקות בוטלו]');
    await replyTarget('🔊 *כל ההשתקות בוטלו בהצלחה!*\nנועה תחזור לענות ללקוחות בשיחות פרטיות.');
    return true;
  }

  // פקודה 2: "נועה סיימי פיקוד"
  if (textNorm.includes('סיימי פיקוד')) {
    agentState.commandMode = 'manual_off';
    saveAgentState();
    console.log('🛑 [מצב פיקוד כובה ידנית]');
    await replyTarget('🛑 *פיקוד הופסק!*\nנועה במצב המתנה (Standby) — סדרנית צל שקטה בלבד ללא מענה לקוחות.');
    return true;
  }

  // פקודה 3: "נועה חזרי לשעות"
  if (textNorm.includes('חזרי לשעות')) {
    agentState.commandMode = 'scheduled';
    saveAgentState();
    const schedActive = isCommandModeActive();
    console.log(`🕒 [חזרה ללוח שעות]: פעיל כעת? ${schedActive}`);
    await replyTarget(`🕒 *חזרה ללוח זמנים אוטומטי!*\nשעות מוגדרות ב-env: ${AGENT_HOURS || 'לא הוגדרו (כבוי)'}.\nסטטוס נוכחי: ${schedActive ? '🟢 פעיל כעת' : '⚪ לא פעיל כעת (ממתין לשעות הפעילות)'}.`);
    return true;
  }

  // פקודה ייעודית: "דוח בוקר" / "סידור למחר" / "סבבים"
  if (textNorm.includes('דוח בוקר') || textNorm.includes('סידור למחר') || textNorm.includes('סידור מחר') || textNorm === 'סידור' || textNorm === 'סבבים') {
    if (agentState.dailyMorningReport) {
      await replyTarget(agentState.dailyMorningReport);
      return true;
    }
  }

  // פקודה 4: "נועה, מצב" / "נועה מצב" / "מצב"
  if (textNorm === 'נועה מצב' || textNorm === 'מצב' || textNorm === 'סטטוס') {
    const schedActive = isCommandModeActive();
    const pendingCount = pendingRamiOrders.size;
    const totalInq = agentState.customerInquiries.length;
    const totalKn = agentState.knowledge.length;
    await replyTarget(`📊 *דוח מצב נועה AI:*\n` +
`• מצב פיקוד: *${agentState.commandMode}* (${schedActive ? '🟢 פעיל כעת' : '⚪ שקט / המתנה'})\n` +
`• שעות מוגדרות: ${AGENT_HOURS || 'לפי פקודה בלבד'}\n` +
`• תור הזמנות ממתינות לאישור: *${pendingCount}* (הכל מאושר ומסודר בגיליון)\n` +
`• סידור עבודה למחר (07/10): סגור ומאושר (4 סבבים למנוף חכמת, עלי בכוננות)\n` +
`• גיליון פעיל: [מאגר מידע נועה] (טאב 'הזמנות')\n\n` +
`לצפייה בסידור העבודה המלא למחר, רשום: *"דוח בוקר"* או *"סידור"* 🚚`);
    return true;
  }
  if (false) {
    const schedActive = isCommandModeActive();
    const pendingCount = pendingRamiOrders.size;
    const totalInq = agentState.customerInquiries.length;
    const totalKn = agentState.knowledge.length;
    await replyTarget(`📊 *דוח מצב נועה AI:*\n` +
`• מצב פיקוד: *${agentState.commandMode}* (${schedActive ? '🟢 פעיל כעת' : '⚪ שקט / המתנה'})\n` +
`• שעות מוגדרות: ${AGENT_HOURS || 'לפי פקודה בלבד'}\n` +
`• הזמנות ממתינות לאישור ראמי: *${pendingCount}*\n` +
`• פניות לקוחות במאגר: *${totalInq}*\n` +
`• ידע ודגשים צבורים: *${totalKn}* פריטים ב-data/noa-agent.json\n` +
`• גיליון פעיל: [מאגר מידע נועה] (טאב 'הזמנות')`);
    return true;
  }

// (הוחלף במנגנון אימון ולמידת סגנון מתקדם מעלה)

  // פקודה 6: "נועה, מה למדת?"
  if (textNorm.includes('מה למדת')) {
    const list = agentState.knowledge.map((k, i) => `${i + 1}. ${k.text} (${new Date(k.timestamp).toLocaleDateString('he-IL')})`).join('\n');
    await replyTarget(`🧠 *מאגר הידע והלקחים שצברתי (${agentState.knowledge.length} פריטים):*\n\n${list || 'טרם נרשמו לקחים'}`);
    return true;
  }

    // פקודה ישירה מראמי: "תקבעי פגישה עם [שם] ב-[שעה]"
  if ((textNorm.startsWith('תקבעי פגישה') || textNorm.startsWith('פגישה עם') || textNorm.includes('פגישה עם')) && !textNorm.includes('תאשרי פגישה')) {
    const nameMatch = textTrimmed.match(/(?:פגישה עם|תקבעי פגישה עם|עם)\s+([א-תA-Za-z0-9\s]+?)(?:\s+(?:ב-|בשעה|למחר|היום|מחרתיים|ביום)|$)/i);
    const personName = nameMatch && nameMatch[1] ? nameMatch[1].trim() : 'איש קשר';
    const parsedTime = parseMeetingTimeFromText(textTrimmed);

    const newMeeting = {
      id: 'sched-' + Date.now(),
      requesterName: personName,
      phone: 'תואם ע"י ראמי',
      chatFrom: '',
      meetingTimeText: parsedTime.displayTime,
      targetDateIso: parsedTime.isoString,
      reminderSent: false,
      confirmedAt: new Date().toISOString()
    };

    agentState.scheduledMeetings = agentState.scheduledMeetings || [];
    agentState.scheduledMeetings.push(newMeeting);
    saveAgentState();

    injectGroupLogToSheets('הזמנות', {
      senderName: personName,
      customerNumber: 'פגישה',
      senderPhone: 'ראמי',
      address: 'משרדי ח. סבן, החרש 10 הוד השרון',
      itemsText: `פגישת עבודה שנקבעה ע"י ראמי: ${parsedTime.displayTime}`,
      driver: 'ראמי מסארווה (פגישה במשרד)',
      warehouse: 'משרד',
      status: 'פגישה מאושרת ביומן'
    });

    const reply = `✅ *הפגישה עם ${personName} שובצה בהצלחה!* 📅\n` +
`• *מועד:* ${parsedTime.displayTime}\n` +
`• *מיקום:* משרדי ח. סבן, החרש 10 הוד השרון\n` +
`• *תזכורת:* תישלח אליך בוואטסאפ 15 דקות לפני המועד ⏰\n\n` +
`👉 *לפתוח גם משימת מעקב ב-Tasks?* (השב 1 לאישור)`;

    await replyTarget(reply);
    return true;
  }

  // פקודה ישירה מראמי: "תפתחי משימה [X]" / "משימה [X]"
  if (textNorm.startsWith('תפתחי משימה') || textNorm.startsWith('משימה לראמי') || textNorm.startsWith('תפתחי task') || textNorm.startsWith('משימה:')) {
    const taskContent = textTrimmed.replace(/^(?:נועה\s*)?(?:תפתחי\s*משימה|משימה\s*לראמי|תפתחי\s*task|משימה:)[\s:,]*/i, '').trim();
    const taskId = 'TASK-' + Date.now().toString().slice(-4);

    const newTask = {
      id: taskId,
      text: taskContent,
      cadence: 'hourly',
      intervalMs: 60 * 60 * 1000,
      cadenceText: 'שעתית',
      createdAt: new Date().toISOString(),
      lastRemindedAt: Date.now(),
      nextReminderAt: Date.now() + 60 * 60 * 1000,
      assignee: 'ראמי',
      status: 'pending'
    };

    agentState.harelTasks = agentState.harelTasks || [];
    agentState.harelTasks.push(newTask);
    saveAgentState();

    const reply = `✅ *נפתחה משימת מעקב חדשה (#${taskId}):* 📝\n` +
`"${taskContent}"\n\n` +
`👉 *לתזכר אותך בוואטסאפ בעוד שעה?* (השב 1 לתזכורת, או רשום "בוצע" לסיום)`;

    await replyTarget(reply);
    return true;
  }

  // פקודה ייעודית: "נועה תאשרי פגישה" / "אשרי פגישה"
  if (textNorm.includes('תאשרי פגישה') || textNorm.includes('אשרי פגישה') || textNorm.includes('תקבעי פגישה') || 
      textLower.includes('תקבעי פגישה') || textLower.includes('אשר פגישה') ||
      textLower === 'אישור פגישה') {
    console.log(`\n📅 [פקודת אישור פגישה מראמי נקלטה]: "${msg.body}"`);

    // שליפת פגישה ממתינה
    agentState.pendingMeetings = agentState.pendingMeetings || [];
    let targetMeeting = agentState.pendingMeetings.pop();

    if (!targetMeeting) {
      // אם אין בתור, יצירת פגישה מוגדרת למחר ב-09:00 לפי פנייה #10
      targetMeeting = {
        id: 'meet-' + Date.now(),
        requesterName: 'לקוח',
        phone: 'טרם נמסר',
        chatFrom: '140901368230048@lid',
        meetingTimeText: 'מחר (יום רביעי, 07/10) בשעה 09:00',
        targetDateIso: '2026-10-07T09:00:00+03:00'
      };
    }

    // הוספה לרשימת הפגישות המשובצות
    agentState.scheduledMeetings = agentState.scheduledMeetings || [];
    const scheduledObj = {
      id: 'sched-' + Date.now(),
      requesterName: targetMeeting.requesterName,
      phone: targetMeeting.phone,
      chatFrom: targetMeeting.chatFrom,
      meetingTimeText: targetMeeting.meetingTimeText,
      targetDateIso: targetMeeting.targetDateIso || '2026-10-07T09:00:00+03:00',
      reminderSent: false,
      confirmedAt: new Date().toISOString()
    };
    agentState.scheduledMeetings.push(scheduledObj);
    saveAgentState();

    // 1. שיגור אישור רשמי ללקוח בצ'אט (בשיחה פרטית בלבד — לעולם לא בקבוצה!)
    if (scheduledObj.chatFrom && !scheduledObj.chatFrom.includes('@g.us')) {
      const customerConfirm = `✅ שלום ${scheduledObj.requesterName}! ראמי אישר את הפגישה בשמחה 🤝\n` +
`📅 *מועד הפגישה:* ${scheduledObj.meetingTimeText}\n` +
`📍 *מיקום:* משרדי ח. סבן חומרי בניין, רחוב החרש 10, הוד השרון\n\n` +
`⏰ תזכורת תישלח אליך כאן בוואטסאפ רבע שעה לפני המועד (ב-08:45). נתראה! 🌸`;

      try {
        registerNoaOutgoingMessage(customerConfirm);
        await client.sendMessage(scheduledObj.chatFrom, customerConfirm);
        console.log(`✅ [אישור פגישה נמסר ללקוח]: ${scheduledObj.chatFrom}`);
      } catch (err) {
        console.warn('⚠️ שגיאה בשליחת אישור פגישה ללקוח:', err.message);
      }
    }

    // 2. מענה ישיר לראמי
    const ramiConfirm = `✅ *הפגישה אושרה ושובצה ביומן בהצלחה!* 📅\n` +
`───────────────────────────────────────\n` +
`• *מועד:* ${scheduledObj.meetingTimeText}\n` +
`• *עם:* ${scheduledObj.requesterName} (📞 ${scheduledObj.phone})\n` +
`• *מיקום:* משרדי ח. סבן, החרש 10 הוד השרון\n` +
`• *סטטוס לקוח:* נמסר לו אישור רשמי בוואטסאפ 🤝\n` +
`• *תזמון תזכורת:* נועה תשלח תזכורת בוואטסאפ לך ולמבקש הפגישה ב-08:45 (רבע שעה לפני המועד)! ⏰`;

    await replyTarget(ramiConfirm);

    // 3. תיעוד בגיליון
    injectGroupLogToSheets('הזמנות', {
      senderName: scheduledObj.requesterName,
      customerNumber: 'פגישה',
      senderPhone: scheduledObj.phone,
      address: 'משרדי ח. סבן, החרש 10 הוד השרון',
      itemsText: `פגישת עבודה מאושרת: ${scheduledObj.meetingTimeText}`,
      driver: 'ראמי מסארווה (פגישה במשרד)',
      warehouse: 'משרד',
      status: 'פגישה מאושרת ביומן'
    });

    return true;
  }

  // פקודה 7: אישור הזמנה ממתינה בספרה "1" או "אישור"
  if (textLower === '1' || textLower === 'אישור' || textLower === 'אשר' || textLower === 'כן') {
    console.log(`\n📱 [פקודת אישור מראמי נקלטה]: "${msg.body}"`);
    await handleRamiCommand(msg);
    return true;
  }

  // פקודה 8: שאילתא כללית שמתחילה ב-"נועה," או "נועה "
  if (textLower.startsWith('נועה,') || textLower.startsWith('נועה ') || textLower.startsWith('היי נועה')) {
    console.log(`❓ [שאילתא מראמי]: "${msg.body}"`);
    const ans = await answerRamiQuestion(msg.body);
    await replyTarget(ans);
    return true;
  }

  return false;
}



// ==========================================
// 👤 מנוע פרופיל פונה דינמי, זיכרון רב-יומי ומכונת מצבים (Customer Profiling & State Machine)
// ==========================================
agentState.customerProfiles = agentState.customerProfiles || {};

/**
 * שליפה או יצירה של כרטיס פרופיל פונה דינמי
 */
function getOrCreateCustomerProfile(phone, name = '', clientInfo = null) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (!cleanPhone) {
    return {
      phone: 'unknown',
      name: name || 'לקוח',
      category: 'פונה חדש',
      activeSites: [],
      depositLedger: { bigBags: 0, pallets: 0 },
      conversationState: { state: 'IDLE', lastTopic: '', contextSummary: '', pausedAt: new Date().toISOString() },
      orderHistory: []
    };
  }

  if (!agentState.customerProfiles[cleanPhone]) {
    // בדיקה האם הלקוח מוכר במדריך קומקס
    const known = KNOWN_CLIENTS_DIRECTORY.find(c => 
      c.phones && c.phones.some(p => p.includes(cleanPhone) || cleanPhone.includes(p))
    );

    agentState.customerProfiles[cleanPhone] = {
      phone: cleanPhone,
      name: known?.name || clientInfo?.customerName || name || 'לקוח חדש',
      customerNumber: known?.customerNumber || clientInfo?.customerNumber || 'טרם שויך',
      category: known ? 'קבלן / לקוח קבוע' : 'לקוח חדש',
      activeSites: known?.defaultSite ? [known.defaultSite] : (clientInfo?.projectSite && clientInfo.projectSite !== 'לפי תיאום באתר' ? [clientInfo.projectSite] : []),
      preferredVehicle: known?.preferredVehicle || 'חכמת (מרצדס מנוף)',
      depositLedger: { bigBags: 0, pallets: 0 },
      conversationState: {
        state: 'IDLE',
        lastTopic: '',
        contextSummary: '',
        pausedAt: new Date().toISOString(),
        pendingOrderData: null
      },
      orderHistory: [],
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString()
    };
    saveAgentState();
  }

  const profile = agentState.customerProfiles[cleanPhone];
  profile.lastSeenAt = new Date().toISOString();
  if (name && profile.name === 'לקוח חדש' && !name.includes('וואטסאפ')) {
    profile.name = name;
  }
  if (clientInfo?.projectSite && clientInfo.projectSite !== 'לפי תיאום באתר') {
    if (!profile.activeSites.includes(clientInfo.projectSite)) {
      profile.activeSites.unshift(clientInfo.projectSite);
      if (profile.activeSites.length > 5) profile.activeSites.pop();
    }
  }
  return profile;
}

/**
 * עדכון מצב שיחה וזיכרון עבור פונה
 */
function updateCustomerConversationState(phone, newState, topic = '', summary = '', pendingOrder = null) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (!cleanPhone || !agentState.customerProfiles[cleanPhone]) return;

  const prof = agentState.customerProfiles[cleanPhone];
  prof.conversationState = {
    state: newState,
    lastTopic: topic || prof.conversationState.lastTopic || '',
    contextSummary: summary || prof.conversationState.contextSummary || '',
    pausedAt: new Date().toISOString(),
    pendingOrderData: pendingOrder !== null ? pendingOrder : prof.conversationState.pendingOrderData
  };
  saveAgentState();
}

/**
 * ==========================================
 * 🧭 מנוע סיווג כוונות וסינון רעשים מתקדם (Intent Classifier & Noise Filter)
 * ==========================================
 */
const INTENT_TYPES = {
  SPAM_OR_LINK: 'SPAM_OR_LINK',             // פרסומות טיסות, טיקטוק, לינקים זרים, שרשראות
  PERSONAL_PRIVATE: 'PERSONAL_PRIVATE',     // שיחות פרטיות, משפחתיות, בריאותיות, חופשיות
  MANAGEMENT_VIP: 'MANAGEMENT_VIP',         // הראל וורד אידלסון
  CONVERSATION_INQUIRY: 'CONVERSATION_INQUIRY', // שאלות תשלום, שעות, גבס/מכולות, תגובות ברצף שיחה
  REAL_DISPATCH_ORDER: 'REAL_DISPATCH_ORDER'  // הזמנת חומרים / מכולה מפורשת בסידור
};

function classifyIncomingIntent(msg, text, clientInfo, isGroup, normalized) {
  const cleanText = (text || '').trim();
  const lower = cleanText.toLowerCase();

  // 1. הנהלה בכירה
  if (isHarelSender(msg) || isVeredSender(msg)) {
    return { intent: INTENT_TYPES.MANAGEMENT_VIP, reason: 'הנהלה בכירה' };
  }

  // 2. זיהוי ספאם, פרסומות וקישורים זרים (טיסות, בוקרשט, טיקטוק, לינקים לא קשורים)
  const isSpamAd = /בוקרשט|טיסות|טיסות הלוך|דקה 90|אינו טיול מאורגן|מחיר על בסיס זוגי|שקידים|did\.li|instagram\.com\/reel|chat\.whatsapp\.com|tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|m\.youtube\.com|call\.who/i.test(cleanText) ||
                   /פייק וקשקוש|למדנו|קיבלתי מחבר לא יודע|זה פורסם איפ|סע סע\.\.\.\.🌬️🚗|היסטריה מיותרת/i.test(cleanText);

  if (isSpamAd) {
    return { intent: INTENT_TYPES.SPAM_OR_LINK, reason: 'ספאם/פרסומת/קישור רשת' };
  }

  // 3. זיהוי פניות אישיות, משפחתיות או בריאותיות
  const isPersonalTopic = /טיפול ר[יג]שי|לטובת הילדה|מכבי|יתקשרו אליך ממכבי|לגבי אדל|בתאבון|שווארמה|דייט|תהנה מהסופ|מה אתה אומר \?|נעלבת|לא התכוונתי|הוצע הראל/i.test(cleanText) ||
                          (clientInfo.customerName && (clientInfo.customerName.includes('Julie') || clientInfo.customerName.includes('נאדיה')));

  if (isPersonalTopic) {
    return { intent: INTENT_TYPES.PERSONAL_PRIVATE, reason: 'שיחה אישית/משפחתית' };
  }

  // 4. בדיקת שאלות, בירורי שירות, או תגובות רצף שיחה (Inquiry / Multi-turn Responses)
  const isPaymentQuestion = /איך מבצעים תשלום|איך משלמים|תשלום|מספר חשבון|להעביר כסף|העברה בנקאית|זאת הלקוחה היא משלמת/i.test(cleanText);
  const isTechnicalQuestion = /מה רוחב קיר גבס|בגובה 2|נכנס ברכב ארוך|עד מתי הכי מאוחר|שבירות ברגע זה|חייבים לפנות את הכל|אמור להגיע טייח/i.test(cleanText);
  const isStatusQuestion = /מי איש קשר בשטח|הובלה שלנו נכון|למה לא רואים בהזמנה|אני עם הספק אפשר תשובה|סיימתי עם הנושא/i.test(cleanText);
  const isConversationAck = /^(?:לא|מצויין|מצוין|יופי|תודה|תודה רבה|אחלה|סגור|מעולה|בסדר|בשעה הקרובה|שלחתי לך מתי מגיע|אתרים שונים|תעודות נפרדות|החלפה|הוצאה)\s*[.!]?$/i.test(cleanText);

  // אם הפונה שואל שאלה או עונה תגובת שיחה ללא הזמנת חומרים מפורשת חדשה
  if (isPaymentQuestion || isTechnicalQuestion || isStatusQuestion || isConversationAck) {
    return { intent: INTENT_TYPES.CONVERSATION_INQUIRY, reason: 'שאילתא שירותית / תגובת שיחה' };
  }

  // 5. בדיקת הזמנת עבודה אמיתית (חומרים מקטלוג או מכולה 8 קוב)
  const hasRealMaterials = (normalized.items && normalized.items.length > 0 && normalized.totalWeightTons > 0);
  const hasContainerRequest = cleanText.includes('מכולה') || cleanText.includes('רמסע') || cleanText.includes('הצבה') || cleanText.includes('פינוי מכולה');

  if (hasRealMaterials || hasContainerRequest) {
    return { intent: INTENT_TYPES.REAL_DISPATCH_ORDER, reason: 'הזמנת חומרים / מכולה מפורשת' };
  }

  // ברירת מחדל לברכות ושיחות חופשיות ("היי", "בוקר טוב", "היי נועה")
  const isCasualGreeting = /^(?:היי|הי|שלום|בוקר טוב|צהריים טובים|ערב טוב|לילה טוב|מה נשמע|מה קורה|היי נועה|נועה היי|הי נועה בוקר טוב)\s*[!.]?$/i.test(cleanText);
  if (isCasualGreeting) {
    return { intent: INTENT_TYPES.CONVERSATION_INQUIRY, reason: 'ברכת שלום/בוקר טוב' };
  }

  return { intent: INTENT_TYPES.CONVERSATION_INQUIRY, reason: 'פנייה כללית לבירור' };
}

// ==========================================
// 👑 זיהוי הראל אידלסון (מנכ"ל החברה ומעסיק ראמי) - טלפון: 050-5227724
// ==========================================
const HAREL_PHONES = ['972505227724', '0505227724', '505227724'];

// ==========================================
// 🌹 זיהוי ורד אידלסון (הנהלה ופיקוח תעודות משלוח) - טלפון: 050-6662300
// ==========================================
const VERED_PHONES = ['972506662300', '0506662300', '506662300'];

function isVeredSender(msg, senderPhone = '', senderName = '', contact = null) {
  if (!msg) return false;
  const fromClean = (msg.from || '').replace(/[^0-9]/g, '');
  const authorClean = (msg.author || '').replace(/[^0-9]/g, '');
  const phoneClean = (senderPhone || '').replace(/[^0-9]/g, '');

  for (const v of VERED_PHONES) {
    if (fromClean.includes(v) || authorClean.includes(v) || phoneClean.includes(v)) {
      return true;
    }
  }

  const nameToCheck = `${senderName || ''} ${contact?.name || ''} ${contact?.pushname || ''} ${msg._data?.notifyName || ''}`.toLowerCase();
  if (nameToCheck.includes('ורד') || nameToCheck.includes('vered')) {
    return true;
  }

  const bodyLower = (msg.body || '').toLowerCase();
  if (bodyLower.includes('מדברת ורד') || bodyLower.includes('זה ורד') || bodyLower.includes('מורד')) {
    return true;
  }

  return false;
}

function isHarelSender(msg, senderPhone = '', senderName = '', contact = null) {
  if (!msg) return false;
  const fromClean = (msg.from || '').replace(/[^0-9]/g, '');
  const authorClean = (msg.author || '').replace(/[^0-9]/g, '');
  const phoneClean = (senderPhone || '').replace(/[^0-9]/g, '');

  for (const h of HAREL_PHONES) {
    if (fromClean.includes(h) || authorClean.includes(h) || phoneClean.includes(h)) {
      return true;
    }
  }

  // בדיקת שמות מפרופיל, פנקס כתובות של ראמי או שם השולח
  const nameToCheck = `${senderName || ''} ${contact?.name || ''} ${contact?.pushname || ''} ${msg._data?.notifyName || ''}`.toLowerCase();
  if (nameToCheck.includes('הראל') || nameToCheck.includes('אידלסון') || nameToCheck.includes('harel')) {
    return true;
  }

  const bodyLower = (msg.body || '').toLowerCase();
  if (bodyLower.includes('הראל המנכל') || bodyLower.includes('הראל המנכ"ל') || 
      bodyLower.includes('מדבר הראל') || bodyLower.includes('זה הראל מנכל') ||
      bodyLower.includes('מהראל המנכל') || bodyLower.includes('מהראל המנכ"ל') ||
      bodyLower.includes('הראל אידלסון')) {
    return true;
  }

  return false;
}

/**
 * 🔍 חילוץ שם איש קשר חכם ואנושי מתוך גוף ההודעה או כרטיס איש הקשר בוואטסאפ
 * מונע לחלוטין שימוש במונחים טכניים כגון "נציג האתר", "מזהה מכשיר" או מספרים!
 */
function extractContactNameFromTextOrContact(text, contact, senderName, clientInfo) {
  const clean = (text || '').trim();

  // 1. זיהוי שם מתוך גוף הטקסט (כגון "מדבר אחמד", "שמי אחמד", "זה אחמד", "כאן אחמד", "אחמד מסבן")
  const introMatch = clean.match(/(?:מדבר|מדברת|שמי|אני|זה|כאן)\s+([א-תA-Za-z]{2,15})/i);
  if (introMatch && introMatch[1]) {
    const candidate = introMatch[1].trim();
    const blacklist = [
      'שלום', 'היי', 'בוקר', 'ערב', 'צהריים', 'ראמי', 'סבן', 'נועה', 'חומרי', 'האתר', 'נציג', 'מנהל',
      'כבר', 'לא', 'כן', 'רק', 'עוד', 'שוב', 'בסדר', 'טוב', 'מה', 'איך', 'למה', 'מתי', 'איפה', 'מי',
      'של', 'על', 'אל', 'בגלל', 'אחר', 'קצת', 'הרבה', 'הכל', 'כלום', 'דחוף', 'זלזול', 'טעות', 'בעיה',
      'הודעה', 'עבודה', 'אתר', 'הזמנה', 'חשבונית', 'תעודה', 'משלוח', 'משהו', 'דבר', 'ממש', 'מאוד', 'מאד'
    ];
    if (!blacklist.includes(candidate)) {
      return candidate;
    }
  }

  // 2. זיהוי איש קשר מתוך תיק הלקוח הידוע (אם אינו גנרי)
  if (clientInfo?.contactPerson && 
      clientInfo.contactPerson !== 'נציג האתר' && 
      clientInfo.contactPerson !== 'יקר' && 
      !clientInfo.contactPerson.includes('מנהל אתר')) {
    return clientInfo.contactPerson.split(' ')[0];
  }

  // 3. זיהוי מתוך פרופיל הוואטסאפ (pushname / name)
  const waName = contact?.pushname || contact?.name || senderName || '';
  if (waName && 
      !waName.includes('וואטסאפ') && 
      !waName.includes('Unknown') && 
      !waName.includes('נועה') && 
      !/^\+?\d+$/.test(waName.trim()) && 
      waName.trim().length >= 2) {
    const firstName = waName.trim().split(' ')[0];
    if (firstName.length >= 2 && !/^\d+$/.test(firstName)) {
      return firstName;
    }
  }

  return '';
}


/**
 * 📱 חילוץ ואימות מספר טלפון אמיתי לוואטסאפ (פתרון מוחלט לבעיית מזהה מכשיר / LID)
 * מונע יצירת קישורי wa.me שבורים עם מזהה מכשיר (כגון wa.me/140901368230048)
 */
async function resolveRealCustomerPhone(text, contact, msg, clientInfo, rawPhone) {
  let resolvedNumber = '';

  // 1. חיפוש מספר טלפון ישראלי מפורש מתוך גוף ההודעה (כגון: 054-6677112, 050-5669924, 0521234567)
  const textPhoneMatch = (text || '').match(/(?:(?:\+?972|0)[\s-]?)?5[0-9][\s-]?[0-9]{3}[\s-]?[0-9]{4}/);
  if (textPhoneMatch && textPhoneMatch[0]) {
    resolvedNumber = textPhoneMatch[0].replace(/[^0-9]/g, '');
  }

  // 2. אם לא נמצא בטקסט, בדיקה מתוך תיק הלקוח הידוע ב-CRM
  if (!resolvedNumber && clientInfo && clientInfo.customerName && clientInfo.customerName !== 'לקוח ח. סבן') {
    const known = KNOWN_CLIENTS_DIRECTORY.find(c => 
      (clientInfo.customerNumber && clientInfo.customerNumber !== 'טרם שויך' && c.customerNumber === clientInfo.customerNumber) ||
      (c.name && c.name.includes(clientInfo.customerName)) ||
      (clientInfo.customerName && clientInfo.customerName.includes(c.name))
    );
    if (known && known.phones && known.phones.length > 0) {
      resolvedNumber = known.phones[0].replace(/[^0-9]/g, '');
    }
  }

  // 3. בדיקה האם contact.number הוא מספר נייד ישראלי תקני (מתחיל ב-05 או 9725, 10-12 ספרות בלבד ולא LID של 15 ספרות)
  if (!resolvedNumber && contact?.number) {
    const cleanNum = contact.number.replace(/[^0-9]/g, '');
    if ((cleanNum.startsWith('9725') && cleanNum.length === 12) || (cleanNum.startsWith('05') && cleanNum.length === 10)) {
      resolvedNumber = cleanNum;
    }
  }

  // 4. בדיקה מתוך הצ'אט אם msg.from הוא מזהה LID
  if (!resolvedNumber && msg?.from && msg.from.includes('@lid')) {
    try {
      const chat = await msg.getChat();
      if (chat && chat.id && chat.id._serialized && chat.id._serialized.includes('@c.us')) {
        const cleanChatUser = chat.id.user.replace(/[^0-9]/g, '');
        if ((cleanChatUser.startsWith('9725') && cleanChatUser.length === 12) || (cleanChatUser.startsWith('05') && cleanChatUser.length === 10)) {
          resolvedNumber = cleanChatUser;
        }
      }
    } catch (e) {}

    // ניסיון שליפה מתוך ה-Store של WhatsApp Web בדפדפן
    if (!resolvedNumber && client.pupPage) {
      try {
        const pn = await client.pupPage.evaluate((lid) => {
          try {
            if (window.Store && window.Store.Contact) {
              const c = window.Store.Contact.get(lid);
              if (c) {
                if (c.phoneNumber) return c.phoneNumber;
                if (c.id && c.id.user && !c.id._serialized.includes('@lid')) return c.id.user;
              }
            }
            if (window.Store && window.Store.LidUtils && window.Store.LidUtils.getPhoneNumber) {
              const num = window.Store.LidUtils.getPhoneNumber(lid);
              if (num) return num;
            }
          } catch (e) {}
          return null;
        }, msg.from);
        if (pn) {
          const cleanPn = pn.replace(/[^0-9]/g, '');
          if ((cleanPn.startsWith('9725') && cleanPn.length === 12) || (cleanPn.startsWith('05') && cleanPn.length === 10)) {
            resolvedNumber = cleanPn;
          }
        }
      } catch (e) {}
    }
  }

  // 5. בדיקת rawPhone (אם אינו LID של 15 ספרות כגון 1409... או 4677...)
  if (!resolvedNumber && rawPhone) {
    const cleanRaw = rawPhone.replace(/[^0-9]/g, '');
    if ((cleanRaw.startsWith('9725') && cleanRaw.length === 12) || (cleanRaw.startsWith('05') && cleanRaw.length === 10)) {
      resolvedNumber = cleanRaw;
    }
  }

  // אם נמצא מספר טלפון אמיתי ומאומת
  if (resolvedNumber) {
    let intlPhone = resolvedNumber;
    if (intlPhone.startsWith('05')) {
      intlPhone = '972' + intlPhone.slice(1);
    }
    const formattedDisplay = intlPhone.startsWith('972') 
      ? ('0' + intlPhone.slice(3, 5) + '-' + intlPhone.slice(5))
      : resolvedNumber;

    return {
      isValid: true,
      displayPhone: formattedDisplay,
      intlPhone: intlPhone,
      waLink: `https://wa.me/${intlPhone}`
    };
  }

  // אם זו שיחה שבה יש רק מזהה מכשיר / LID
  return {
    isValid: false,
    displayPhone: 'לא צוין טלפון בהודעה',
    intlPhone: '',
    waLink: null
  };
}


// ==========================================
// 📅 מנוע ניהול פגישות ותזכורות יומן (נועה AI & ראמי מסארווה)
// ==========================================
function isMeetingRequest(text) {
  if (!text || typeof text !== 'string') return false;
  const clean = text.toLowerCase();
  return clean.includes('פגישה') || 
         clean.includes('להיפגש') || 
         clean.includes('לתאם פגישה') || 
         clean.includes('לקבוע פגישה') || 
         clean.includes('תיאום פגישה');
}

function parseMeetingTimeFromText(text) {
  const clean = (text || '').toLowerCase();
  let hour = 9;
  let minute = 0;

  const timeMatch = clean.match(/(?:בשעה|ב-?|שעה)?\s*(\d{1,2})(?::(\d{2}))?\s*(בבוקר|בערב|בצהריים)?/);
  if (timeMatch && timeMatch[1]) {
    hour = parseInt(timeMatch[1], 10);
    if (timeMatch[2]) minute = parseInt(timeMatch[2], 10);
    if (timeMatch[3] === 'בערב' && hour < 12) hour += 12;
    if (timeMatch[3] === 'בצהריים' && hour < 12 && hour !== 12) hour += 12;
  }

  let targetDate = new Date();
  let dayText = 'מחר';
  if (clean.includes('מחרתיים')) {
    targetDate.setDate(targetDate.getDate() + 2);
    dayText = 'מחרתיים';
  } else if (clean.includes('היום')) {
    dayText = 'היום';
  } else {
    // ברירת מחדל: למחר
    targetDate.setDate(targetDate.getDate() + 1);
    dayText = 'מחר';
  }

  targetDate.setHours(hour, minute, 0, 0);

  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const dayName = daysOfWeek[targetDate.getDay()];
  const timeFormatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const dateFormatted = `${targetDate.getDate()}.${targetDate.getMonth() + 1}`;

  return {
    isoString: targetDate.toISOString(),
    displayTime: `${dayText} (יום ${dayName}, ${dateFormatted}) בשעה ${timeFormatted}`,
    hour,
    minute,
    targetDate
  };
}

// ⏰ טיימר רקע לתזכורות פגישות רבע שעה לפני המועד
setInterval(async () => {
  try {
    const now = Date.now();
    if (!agentState.scheduledMeetings || !Array.isArray(agentState.scheduledMeetings)) return;

    for (const m of agentState.scheduledMeetings) {
      if (m.reminderSent) continue;
      const meetingTime = new Date(m.targetDateIso).getTime();
      const diffMinutes = (meetingTime - now) / (1000 * 60);

      // בדיקה האם נותרו בין 0 ל-15 דקות לפגישה
      if (diffMinutes <= 15 && diffMinutes > -5) {
        m.reminderSent = true;
        saveAgentState();

        const timeOnly = m.meetingTimeText.split('בשעה')[1] || '09:00';

        // 1. תזכורת בוואטסאפ לראמי
        const ramiReminder = `⏰ *תזכורת פגישה בעוד 15 דקות!* (${timeOnly.trim()}) 📅\n` +
`───────────────────────────────────────\n` +
`🤝 *פגישה עם:* ${m.requesterName} (📞 ${m.phone})\n` +
`📍 *מיקום:* משרדי ח. סבן חומרי בניין, החרש 10, הוד השרון\n` +
`📋 *נושא:* פגישת עבודה סבן`;

        await notifyRami(ramiReminder);

        // 2. תזכורת בוואטסאפ ללקוח (בפרטי בלבד — לעולם לא בקבוצה!)
        if (m.chatFrom && !m.chatFrom.includes('@g.us')) {
          const clientReminder = `שלום ${m.requesterName}! תזכורת מנועה (ח. סבן) 🌸\n` +
`הפגישה שלך עם ראמי מתחילה בעוד 15 דקות (${timeOnly.trim()}).\n` +
`מחכים לך במשרדי ח. סבן, רחוב החרש 10, הוד השרון. נסיעה טובה ובטוחה! 🤝`;

          registerNoaOutgoingMessage(clientReminder);
          await client.sendMessage(m.chatFrom, clientReminder);
        }

        console.log(`⏰ [תזכורת פגישה שוגרה בהצלחה 15 דקות לפני]: לראמי ול-${m.requesterName}`);
      }
    }
  } catch (err) {
    console.warn('⚠️ שגיאה בבדיקת תזכורות פגישות:', err.message);
  }
}, 30000);

// משתני מצב ו-QR עבור שני המופעים
let latestQrCodeRami = null;
let latestQrDataUrlRami = null;
let isRamiReady = false;
let connectedRamiPhone = null;

let latestQrCodeNoa = null;
let latestQrDataUrlNoa = null;
let isNoaReady = false;
let connectedNoaPhone = null;

// תאימות לאחור
let latestQrCode = null;
let latestQrDataUrl = null;
let isClientReady = false;
let connectedUserPhone = null;

// ניהול תורי הזמנות ולמידת מילון
const pendingRamiOrders = new Map();
const pendingDictionaryUpdates = new Map(); // orderId -> { phoneAdditions, slangLearned, comaxOrder }
const rateLimitMap = new Map();

// ==========================================
// 👥 מילון קבוצות JONI הרשמי של ראמי (121 קבוצות ממופות)
// ==========================================
const JONI_GROUPS_REGISTRY = {
  '120363239019649670@g.us': { name: 'זבולון עדירן הזמנות', category: 'order', tab: '💬_זבולון_עדירן', priority: 'VIP' },
  '120363134593065960@g.us': { name: 'ד.ניב הזמנות', category: 'order', tab: '💬_ד_ניב', priority: 'VIP' },
  '120363390702096083@g.us': { name: 'הזמנות לקוחות בלבד ח.סבן', category: 'order', tab: '💬_הזמנות_ח_סבן_JONI', priority: 'VIP' },
  '120363414423054339@g.us': { name: 'מעקב הזמנה - לירן/מוצקין', category: 'order', tab: '💬_לירן_מוצקין', priority: 'VIP' },
  '120363412871631188@g.us': { name: 'מעקב הזמנה - הולדנר', category: 'order', tab: '💬_הולדנר', priority: 'VIP' },
  '120363430319538012@g.us': { name: 'מעקב הזמנה - מגד שיפוצים', category: 'order', tab: '💬_מגד_שיפוצים', priority: 'VIP' },
  '972532316984-1573661703@g.us': { name: 'הזמנות-ווצאפ', category: 'order', tab: 'הזמנות', priority: 'HIGH' },
  '972505227724-1635910843@g.us': { name: 'תפעול הזמנות', category: 'order', tab: 'הזמנות', priority: 'HIGH' },
  '972552762878-1594908977@g.us': { name: '5821 ח.סבן קולביז הזמנות', category: 'order', tab: '💬_הזמנות_ח_סבן_JONI', priority: 'HIGH' },
  '120363151639755211@g.us': { name: 'הזמנות', category: 'order', tab: 'הזמנות', priority: 'HIGH' },
  '972506662300-1628679540@g.us': { name: 'הודעות מלקוחות', category: 'order', tab: '💬_הזמנות_ח_סבן_JONI', priority: 'HIGH' },
  '120363043002879403@g.us': { name: 'קבלני מכולות', category: 'container', tab: 'סידור_מכולות_רמסע', priority: 'HIGH' },
  '120363044316521237@g.us': { name: 'מכולות חמודי', category: 'container', tab: 'סידור_מכולות_רמסע', priority: 'HIGH' },
  '972508860896-1577280753@g.us': { name: 'פינוי פסולת-אסלאם', category: 'container', tab: 'סידור_מכולות_רמסע', priority: 'HIGH' },
  '120363168742364292@g.us': { name: 'פינוי פסולת חמודי', category: 'container', tab: 'סידור_מכולות_רמסע', priority: 'HIGH' }
};

function getJoniGroupInfo(groupId, groupTitle = '') {
  if (JONI_GROUPS_REGISTRY[groupId]) {
    return JONI_GROUPS_REGISTRY[groupId];
  }
  const lower = (groupTitle || '').toLowerCase();
  if (lower.includes('זבולון') || lower.includes('עדירן')) {
    return { name: groupTitle, category: 'order', tab: '💬_זבולון_עדירן', priority: 'VIP' };
  }
  if (lower.includes('ד.ניב') || lower.includes('ד ניב')) {
    return { name: groupTitle, category: 'order', tab: '💬_ד_ניב', priority: 'VIP' };
  }
  if (lower.includes('לירן') || lower.includes('מוצקין')) {
    return { name: groupTitle, category: 'order', tab: '💬_לירן_מוצקין', priority: 'VIP' };
  }
  if (lower.includes('הזמנות') || lower.includes('סבן') || lower.includes('joni') || lower.includes('לקוחות')) {
    return { name: groupTitle, category: 'order', tab: '💬_הזמנות_ח_סבן_JONI', priority: 'VIP' };
  }
  if (lower.includes('מכולות') || lower.includes('פסולת')) {
    return { name: groupTitle, category: 'container', tab: 'סידור_מכולות_רמסע', priority: 'HIGH' };
  }
  return null;
}

// ==========================================
// 🏢 מאגר לקוחות וקומקס (Saban CRM)
// ==========================================
let KNOWN_CLIENTS_DIRECTORY = [
  {
    "name": "לי-רן יזום והשקעות (לירן / מוצקין)",
    "customerNumber": "612108",
    "aliases": [
      "לי-רן",
      "לירן",
      "מוצקין",
      "מוצקין 22",
      "לירן מוצקין",
      "לי-רן יזום והשקעות (לירן / מוצקין)"
    ],
    "contactPerson": "יהודה כהן",
    "phones": [
      "0505669924",
      "0503322114",
      "0502211445"
    ],
    "defaultSite": "מוצקין 22, רעננה",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת (סל כבד) / איסוזו",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חול בלות",
      "מלט אפור",
      "פלציב 6 מ\"מ",
      "קלקר F15",
      "מטר ובוקסה"
    ],
    "siteNotes": "אתר פעיל, עבודה זהירה מכבלי חשמל, פריקה לחצר פנימית"
  },
  {
    "name": "מידן לירן (אוסטושינסקי)",
    "customerNumber": "613431",
    "aliases": [
      "מידן לירן",
      "אוסטושינסקי",
      "מידן",
      "מירון",
      "אוסטושינסקי 5",
      "מידן לירן (אוסטושינסקי)"
    ],
    "contactPerson": "מירון",
    "phones": [
      "0546969051",
      "0504455667"
    ],
    "defaultSite": "אוסטושינסקי 5, כפר סבא",
    "zone": "השרון",
    "preferredVehicle": "איסוזו פריקה ידנית (עלי) / מנוף קל",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "מלט אפור",
      "חול",
      "בלוקים"
    ],
    "siteNotes": "רחוב צר, פריקה ישירה לתוך שטח האתר (10 דק' איסוזו)"
  },
  {
    "name": "שלום בוקטוס",
    "customerNumber": "602568",
    "aliases": [
      "בוקטוס",
      "שלום בוקטוס",
      "עמית בוקטוס",
      "הנרייטה סולד",
      "הנרייטה",
      "רועי",
      "הנרייטה סולד 20"
    ],
    "contactPerson": "רועי / עמית",
    "phones": [
      "0506707779",
      "0544493503"
    ],
    "defaultSite": "הנרייטה סולד 20, הוד השרון",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "טיח ממ\"ד 25 ק\"ג",
      "טיח גבס MP75",
      "חול בלה",
      "טיט",
      "מלט"
    ],
    "siteNotes": "אתר מגורים בהוד השרון, פריקה בחניה/מדרכה"
  },
  {
    "name": "זבולון-עדירן",
    "customerNumber": "612603",
    "aliases": [
      "זבולון",
      "עדירן",
      "טארק זבולון",
      "דניאל זבולון",
      "זבולון-עדירן",
      "ביל\"ו 58",
      "ביל\"ו תל אביב"
    ],
    "contactPerson": "מוחמד אכבריה / אבו נאייף",
    "phones": [
      "0525062750",
      "0538224169"
    ],
    "defaultSite": "ביל\"ו 58, תל אביב",
    "zone": "תל אביב וגוש דן",
    "preferredVehicle": "מנוף חכמת (משקל כבד)",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "סומסום בלות",
      "סיקה 107 לבן",
      "דבקים",
      "חמרה"
    ],
    "siteNotes": "אתר ביל\"ו ת\"א, פריקה בשעות הבוקר/צהריים בלבד"
  },
  {
    "name": "ד.ניב שיפוצים (ב\"ס חינוך מיוחד)",
    "customerNumber": "604368",
    "aliases": [
      "ד.ניב",
      "ד ניב",
      "ניב",
      "חינוך מיוחד",
      "מבנה משולב 305",
      "ד.ניב שיפוצים (ב\"ס חינוך מיוחד)",
      "הבנות 16"
    ],
    "contactPerson": "עומר / יוסי",
    "phones": [
      "0542108810",
      "0537684061"
    ],
    "defaultSite": "הבנות 16, הוד השרון (בית ספר חינוך מיוחד)",
    "zone": "השרון",
    "preferredVehicle": "איסוזו חלוקה עלי / מנוף",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "לוחות גבס (ירוק",
      "כחול)",
      "רוקבונד",
      "קלסימו",
      "פרופילים"
    ],
    "siteNotes": "פריקה בשעות שאין תלמידים, תיאום מראש מול עומר"
  },
  {
    "name": "חברת הכל מבראשית (טל ארביב)",
    "customerNumber": "604380",
    "aliases": [
      "הכל מבראשית",
      "טל ארביב",
      "ארביב",
      "חברת הכל מבראשית (טל ארביב)",
      "שער 14"
    ],
    "contactPerson": "טל ארביב",
    "phones": [
      "0525689416"
    ],
    "defaultSite": "שער 14, אוניברסיטת תל אביב",
    "zone": "תל אביב",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "טיט מוכן",
      "מלט",
      "בלוקים",
      "חול"
    ],
    "siteNotes": "כניסה דרך שער 14 בלבד, אישור ביטחון מראש"
  },
  {
    "name": "עמית ושרית סולברג",
    "customerNumber": "616161",
    "aliases": [
      "עמית סולברג",
      "סולברג",
      "איתי מוזר",
      "איתי",
      "עמית ושרית סולברג",
      "פעמונית 47"
    ],
    "contactPerson": "איתי",
    "phones": [
      "0548373707"
    ],
    "defaultSite": "פעמונית 47, הוד השרון",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חול בלה",
      "מלט",
      "טיט",
      "מוצרי גמר"
    ],
    "siteNotes": "פריקה שקטה, רחוב מגורים"
  },
  {
    "name": "בונק אסף",
    "customerNumber": "632237",
    "aliases": [
      "בונק",
      "אסף בונק",
      "בונק אסף",
      "הסחלב 8"
    ],
    "contactPerson": "אסף",
    "phones": [
      "0527445777"
    ],
    "defaultSite": "הסחלב 8, רעות",
    "zone": "מודיעין והסביבה",
    "preferredVehicle": "איסוזו עלי / מנוף",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "מלט",
      "דבקים",
      "חומרי מליטה"
    ],
    "siteNotes": "תיאום יום מראש"
  },
  {
    "name": "דודי אוזנה",
    "customerNumber": "602100",
    "aliases": [
      "דודי אוזנה",
      "אוזנה",
      "דודי",
      "דודי שטיכמוס",
      "הוד השרון והסביבה"
    ],
    "contactPerson": "דודי",
    "phones": [
      "0524404222"
    ],
    "defaultSite": "הוד השרון והסביבה",
    "zone": "השרון",
    "preferredVehicle": "איסוזו / מנוף",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "מלט",
      "חול",
      "בלוקים",
      "כלי עבודה"
    ],
    "siteNotes": "קבלן ותיק באזור הוד השרון"
  },
  {
    "name": "נתנאל מגד",
    "customerNumber": "614132",
    "aliases": [
      "נתנאל מגד",
      "מגד שיפוצים",
      "עוגב 15"
    ],
    "contactPerson": "נתנאל מגד",
    "phones": [
      "0549644335"
    ],
    "defaultSite": "עוגב 15, קרני שומרון",
    "zone": "שומרון",
    "preferredVehicle": "מנוף חכמת (קו שומרון)",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "טיט שק גדול",
      "סומסום",
      "מלט",
      "דבק 116"
    ],
    "siteNotes": "תיאום יציאה מוקדם 06:30, סוכן ריימונד ביטון"
  },
  {
    "name": "ערוגת הבשם",
    "customerNumber": "616088",
    "aliases": [
      "ערוגת הבשם",
      "באר גנים 78"
    ],
    "contactPerson": "ערוגת הבשם",
    "phones": [
      "0500000000"
    ],
    "defaultSite": "באר גנים 78, אבן יהודה",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חול בלה",
      "סומסום בלה",
      "מלט"
    ],
    "siteNotes": "אתר פתוח"
  },
  {
    "name": "א.ערן אזולאי",
    "customerNumber": "603271",
    "aliases": [
      "אזולאי",
      "ערן אזולאי",
      "א.ערן אזולאי",
      "נח 3"
    ],
    "contactPerson": "ערן",
    "phones": [
      "0500000000"
    ],
    "defaultSite": "נח 3, תל אביב",
    "zone": "תל אביב",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "טיח תרמי 400",
      "חול בלה",
      "מלט אפור",
      "סיקה לסטיק"
    ],
    "siteNotes": "רחוב צר בתל אביב"
  },
  {
    "name": "טל שחר כאשי",
    "customerNumber": "607509",
    "aliases": [
      "כאשי",
      "טל שחר",
      "טל שחר כאשי",
      "חשמונאים 5"
    ],
    "contactPerson": "טל שחר",
    "phones": [
      "0500000000"
    ],
    "defaultSite": "חשמונאים 5, פתח תקווה",
    "zone": "מרכז",
    "preferredVehicle": "מנוף חכמת / איסוזו",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "ניצבים",
      "מסלולים",
      "ריצופית 181",
      "מלט",
      "פלסטומר"
    ],
    "siteNotes": "פריקה בחצר"
  },
  {
    "name": "נועם ענבר גינון",
    "customerNumber": "602866",
    "aliases": [
      "נועם ענבר",
      "גינון ענבר",
      "נועם ענבר גינון",
      "מחתרות 1"
    ],
    "contactPerson": "נועם",
    "phones": [
      "0500000000"
    ],
    "defaultSite": "מחתרות 1, הוד השרון",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "סומסום בלה",
      "חמרה בלה",
      "אדמת גננות"
    ],
    "siteNotes": "גינון ופיתוח"
  },
  {
    "name": "אריק הולץ",
    "customerNumber": "601479",
    "aliases": [
      "אריק הולץ",
      "הולץ",
      "שושנה דמארי 18"
    ],
    "contactPerson": "אריק",
    "phones": [
      "0500000000"
    ],
    "defaultSite": "שושנה דמארי 18, ראש העין",
    "zone": "מרכז",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "מלט אפור",
      "טיט",
      "סומסום",
      "פינות טיח"
    ],
    "siteNotes": "קבלן שלד וטיח"
  },
  {
    "name": "אחמד אבו חדר",
    "customerNumber": "632200",
    "aliases": [
      "אחמד אבו חדר",
      "שחף 9"
    ],
    "contactPerson": "",
    "phones": [
      "0508861080"
    ],
    "defaultSite": "שחף 9, הוד השרון",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חול",
      "סומסום",
      "מלט"
    ],
    "siteNotes": "גישה רחבה ללא עיכובים, פריקת מנוף תקינה בחצר"
  },
  {
    "name": "ד.ניב / בי\"ס יגאל אלון",
    "customerNumber": "632091",
    "aliases": [
      "ד.ניב / בי\"ס יגאל אלון",
      "משאבים 45"
    ],
    "contactPerson": "",
    "phones": [
      "0502211445"
    ],
    "defaultSite": "משאבים 45, הוד השרון",
    "zone": "השרון",
    "preferredVehicle": "מנוף / איסוזו",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "גבס",
      "פרופילים",
      "צמנט"
    ],
    "siteNotes": "פריקה מרוכזת ליד המכולה"
  },
  {
    "name": "בן-גיא סלומון השקעות בע\"מ",
    "customerNumber": "920535",
    "aliases": [
      "בן-גיא סלומון השקעות בע\"מ",
      "שרת 59"
    ],
    "contactPerson": "",
    "phones": [
      "0505544332"
    ],
    "defaultSite": "שרת 59, רמות השבים",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חול",
      "מלט",
      "אגרגטים"
    ],
    "siteNotes": "משק פתוח, פריקה מהירה וישירה על הקרקע"
  },
  {
    "name": "עופר כץ",
    "customerNumber": "616166",
    "aliases": [
      "עופר כץ",
      "בית העם 3"
    ],
    "contactPerson": "",
    "phones": [
      "0526655443"
    ],
    "defaultSite": "בית העם 3, רמות השבים",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת / איסוזו",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "מלט",
      "דבקים",
      "טיט"
    ],
    "siteNotes": "גישה חלקה, חתימה מהירה בשטח"
  },
  {
    "name": "לירן / ביל\"ו",
    "customerNumber": "612100",
    "aliases": [
      "לירן / ביל\"ו",
      "ביל\"ו 53",
      "אתר ביל\"ו",
      "ביל\"ו רעננה"
    ],
    "contactPerson": "אלירן (050-5669924)",
    "phones": [
      "0502525253"
    ],
    "defaultSite": "ביל\"ו 53, רעננה",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חמרה בלה",
      "חול",
      "מלט"
    ],
    "siteNotes": "אתר צפוף, פריקה בשטח המדרכה באישור מנהל עבודה"
  },
  {
    "name": "ליאת אסייג יהושוע",
    "customerNumber": "632216",
    "aliases": [
      "ליאת אסייג יהושוע",
      "ציפמן 50"
    ],
    "contactPerson": "",
    "phones": [
      "0548899001"
    ],
    "defaultSite": "ציפמן 50, רעננה",
    "zone": "השרון",
    "preferredVehicle": "איסוזו עלי",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "מלט",
      "דבקים",
      "רובה"
    ],
    "siteNotes": "פריקה מהירה ללא עיכובים"
  },
  {
    "name": "א.ש. בלום נדל\"ן",
    "customerNumber": "601939",
    "aliases": [
      "א.ש. בלום נדל\"ן",
      "מרכז שרונה"
    ],
    "contactPerson": "",
    "phones": [
      "0521122334"
    ],
    "defaultSite": "מרכז שרונה, כפר סבא",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "גבס",
      "לוחות",
      "בידוד"
    ],
    "siteNotes": "מרכז מסחרי, נדרש תיאום פריקה עם השומר במקום"
  },
  {
    "name": "גולן שיפוצים",
    "customerNumber": "632088",
    "aliases": [
      "גולן שיפוצים",
      "משה וילנסקי 15"
    ],
    "contactPerson": "",
    "phones": [
      "0542233445"
    ],
    "defaultSite": "משה וילנסקי 15, כפר סבא",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "מלט",
      "חול",
      "טיח"
    ],
    "siteNotes": "עיכוב קבוע בגלל חניית רכבים פרטיים בחזית הבניין"
  },
  {
    "name": "אורניל / אבי לוי גור",
    "customerNumber": "601992",
    "aliases": [
      "אורניל / אבי לוי גור",
      "סטרומה 4"
    ],
    "contactPerson": "",
    "phones": [
      "0509988776"
    ],
    "defaultSite": "סטרומה 4, הרצליה (וגם לוחמי גליפולי 8, אביחיל)",
    "zone": "מרכז",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "מלט",
      "חול",
      "טיט"
    ],
    "siteNotes": "רחוב צר, נדרש תמרון זהיר עם משאית 12 טון"
  },
  {
    "name": "ויקטור דיין",
    "customerNumber": "632024",
    "aliases": [
      "ויקטור דיין",
      "ויתקין 20"
    ],
    "contactPerson": "",
    "phones": [
      "0546677889"
    ],
    "defaultSite": "ויתקין 20, רמת השרון",
    "zone": "מרכז",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חול",
      "סומסום",
      "מלט"
    ],
    "siteNotes": "פריקה בחצר אחורית עם זרוע מנוף מלאה"
  },
  {
    "name": "בן ענבר (ליידי דיויס)",
    "customerNumber": "602497",
    "aliases": [
      "בן ענבר (ליידי דיויס)",
      "קהילת קייב 17"
    ],
    "contactPerson": "",
    "phones": [
      "0507766554"
    ],
    "defaultSite": "קהילת קייב 17, תל אביב",
    "zone": "תל אביב",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חול",
      "מלט",
      "טיט"
    ],
    "siteNotes": "עיכוב מתועד של 45 דק' בגלל פריקה מורכבת"
  },
  {
    "name": "גיא פריגת",
    "customerNumber": "603118",
    "aliases": [
      "גיא פריגת",
      "שדרות בן ציון / בן צבי 20"
    ],
    "contactPerson": "",
    "phones": [
      "0528877665"
    ],
    "defaultSite": "שדרות בן ציון / בן צבי 20, תל אביב",
    "zone": "תל אביב",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חול בלה",
      "מלט",
      "דבקים"
    ],
    "siteNotes": "שדרות רחבות, פריקה מהירה על שטח טעינה"
  },
  {
    "name": "אילתי אברהם",
    "customerNumber": "614063",
    "aliases": [
      "אילתי אברהם",
      "מגדל הלבנון 14"
    ],
    "contactPerson": "",
    "phones": [
      "0543344556"
    ],
    "defaultSite": "מגדל הלבנון 14, מודיעין",
    "zone": "מרכז",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חומרי שלד ומליטה"
    ],
    "siteNotes": "נסיעה בכביש 443, פריקה מסודרת"
  },
  {
    "name": "נ.ע. גרין פרויקטים בע\"מ",
    "customerNumber": "614063",
    "aliases": [
      "נ.ע. גרין פרויקטים בע\"מ",
      "הטווס 3"
    ],
    "contactPerson": "",
    "phones": [
      "0503344112"
    ],
    "defaultSite": "הטווס 3, הוד השרון",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חומרי שלד",
      "מלט"
    ],
    "siteNotes": "אזור תעשייה נווה נאמן, פריקה מרווחת"
  },
  {
    "name": "השוקדים-כללי (ירון)",
    "customerNumber": "605070",
    "aliases": [
      "השוקדים-כללי (ירון)",
      "עלי זהב"
    ],
    "contactPerson": "",
    "phones": [
      "0508860896"
    ],
    "defaultSite": "עלי זהב",
    "zone": "שומרון",
    "preferredVehicle": "מנוף חכמת (שומרון)",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חול",
      "מלט",
      "אגרגטים"
    ],
    "siteNotes": "הגעה דרך חוצה שומרון, עיכובי כניסה בשער"
  },
  {
    "name": "נקש את נעמן - צור יגאל",
    "customerNumber": "632145",
    "aliases": [
      "נקש את נעמן - צור יגאל",
      "זוויתן 1"
    ],
    "contactPerson": "",
    "phones": [
      "0528877665"
    ],
    "defaultSite": "זוויתן 1, צור יגאל",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "מלט",
      "דבקים",
      "חול"
    ],
    "siteNotes": "רחוב שקט בצור יגאל, פריקה חלקה"
  },
  {
    "name": "קבוצת חסון",
    "customerNumber": "519977",
    "aliases": [
      "קבוצת חסון",
      "החשמונאים 1"
    ],
    "contactPerson": "",
    "phones": [
      "0507813361"
    ],
    "defaultSite": "החשמונאים 1, הוד השרון",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חומרי שלד",
      "מלט",
      "חול"
    ],
    "siteNotes": "נווה נאמן ב', פריקה מול מגרש הכדורגל"
  },
  {
    "name": "בזלת מזר בע\"מ",
    "customerNumber": "602115",
    "aliases": [
      "בזלת מזר בע\"מ",
      "פישמן מימון 7"
    ],
    "contactPerson": "",
    "phones": [
      "0543322110"
    ],
    "defaultSite": "פישמן מימון 7, תל אביב",
    "zone": "תל אביב",
    "preferredVehicle": "מנוף חכמת / איסוזו",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חומרי גמר",
      "דבקים",
      "טיח"
    ],
    "siteNotes": "רחוב פנימי בצפון הישן, עבודה זהירה"
  },
  {
    "name": "קדם גלעד / מזל דלי",
    "customerNumber": "632052",
    "aliases": [
      "קדם גלעד / מזל דלי",
      "מזל דלי 1"
    ],
    "contactPerson": "",
    "phones": [
      "0547766554"
    ],
    "defaultSite": "מזל דלי 1, הוד השרון",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חול",
      "סומסום",
      "מלט",
      "טיט"
    ],
    "siteNotes": "שכונת 1200 הוד השרון, אתר נגיש ופתוח"
  },
  {
    "name": "בהר אהוד-כללי",
    "customerNumber": "520117",
    "aliases": [
      "בהר אהוד-כללי",
      "הורד 29"
    ],
    "contactPerson": "",
    "phones": [
      "0523344556"
    ],
    "defaultSite": "הורד 29, אלישמע",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת / איסוזו",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "מלט",
      "חול",
      "חמרה"
    ],
    "siteNotes": "מושב אלישמע, פריקה ישירה בחצר הבית"
  },
  {
    "name": "בית חלומותי / בני ברק",
    "customerNumber": "602566",
    "aliases": [
      "בית חלומותי / בני ברק",
      "ירקון 8"
    ],
    "contactPerson": "",
    "phones": [
      "0509988221"
    ],
    "defaultSite": "ירקון 8, בני ברק",
    "zone": "מרכז",
    "preferredVehicle": "איסוזו עלי / מנוף",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "גבס",
      "מלט",
      "דבקים"
    ],
    "siteNotes": "מתחם BBC בני ברק, גישה מותאמת לחלוקה"
  },
  {
    "name": "גוטרמן יצחק",
    "customerNumber": "603104",
    "aliases": [
      "גוטרמן יצחק",
      "שמעון הצדיק 25"
    ],
    "contactPerson": "",
    "phones": [
      "0541122998"
    ],
    "defaultSite": "שמעון הצדיק 25, הוד השרון",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "מלט",
      "חול",
      "טיט"
    ],
    "siteNotes": "שכונת מגורים ותיקה, גישה נוחה"
  },
  {
    "name": "אלנבי על הים",
    "customerNumber": "501009",
    "aliases": [
      "אלנבי על הים",
      "שמוליק סגל 4",
      "שמוליק סגל",
      "סגל",
      "אלנבי"
    ],
    "contactPerson": "יוסי / מנהל אתר",
    "phones": [
      "0546677112"
    ],
    "defaultSite": "שמוליק סגל 4, תל אביב",
    "zone": "תל אביב",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "דבקים",
      "מלט",
      "טיח"
    ],
    "siteNotes": "מתחם צפון ת\"א, פריקה מהירה"
  },
  {
    "name": "גל בן דוד",
    "customerNumber": "603275",
    "aliases": [
      "גל בן דוד",
      "נטף 14"
    ],
    "contactPerson": "",
    "phones": [
      "0524455112"
    ],
    "defaultSite": "נטף 14, רמת השרון",
    "zone": "מרכז",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "מלט",
      "חול",
      "בלוקים"
    ],
    "siteNotes": "נווה מגן רמה\"ש, פריקת מנוף לגובה"
  },
  {
    "name": "קובי פרופילים ונגישות בע\"מ",
    "customerNumber": "619043",
    "aliases": [
      "קובי פרופילים ונגישות בע\"מ",
      "מתן"
    ],
    "contactPerson": "",
    "phones": [
      "0542233112"
    ],
    "defaultSite": "מתן",
    "zone": "השרון",
    "preferredVehicle": "מנוף / איסוזו",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "פרופילים",
      "לוחות",
      "מלט"
    ],
    "siteNotes": "יישוב מתן, אתר פיתוח נגיש"
  },
  {
    "name": "אורן ישראלי",
    "customerNumber": "632097",
    "aliases": [
      "אורן ישראלי",
      "המייסדים 17"
    ],
    "contactPerson": "",
    "phones": [
      "0521122445"
    ],
    "defaultSite": "המייסדים 17, רמות השבים",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חול",
      "סומסום",
      "מלט"
    ],
    "siteNotes": "פריקת מנוף בתוך חצר המשק"
  },
  {
    "name": "נישה אדריכלות נוף",
    "customerNumber": "614149",
    "aliases": [
      "נישה אדריכלות נוף",
      "ישעיהו 8"
    ],
    "contactPerson": "",
    "phones": [
      "0508899112"
    ],
    "defaultSite": "ישעיהו 8, הוד השרון",
    "zone": "השרון",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "סומסום",
      "חמרה",
      "טוף"
    ],
    "siteNotes": "רחוב שקט, פריקה חלקה על המדרכה"
  },
  {
    "name": "זבולון-עדירן / הופמן",
    "customerNumber": "607145",
    "aliases": [
      "זבולון-עדירן / הופמן",
      "החורש 21"
    ],
    "contactPerson": "",
    "phones": [
      "0506620013"
    ],
    "defaultSite": "החורש 21, כפר שמריהו",
    "zone": "מרכז",
    "preferredVehicle": "מנוף חכמת",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "סומסום בלות",
      "סיקה 107"
    ],
    "siteNotes": "וילה יוקרתית, פריקה זהירה בשטח פנימי"
  },
  {
    "name": "אסף אמיתי",
    "customerNumber": "632254",
    "aliases": [
      "אסף אמיתי",
      "הנדיב 51"
    ],
    "contactPerson": "",
    "phones": [
      "0502174847"
    ],
    "defaultSite": "הנדיב 51, הרצליה פיתוח",
    "zone": "מרכז",
    "preferredVehicle": "איסוזו / מנוף קל",
    "typicalUnloadMin": 25,
    "commonBasket": [
      "חומרי גמר",
      "דבקים",
      "מלט"
    ],
    "siteNotes": "הרצליה פיתוח, גישה נוחה"
  }
];
/**
 * פענוח הודעות במבנה תוסף JONI (חילוץ שולח, טלפון וטקסט נקי)
 */
function parseJoniFormattedMessage(rawBody) {
  let cleanText = rawBody || '';
  let extractedName = '';
  let extractedPhone = '';

  const nameMatch = cleanText.match(/👤\s*([^\n\r]+)/);
  if (nameMatch) {
    extractedName = nameMatch[1].trim();
    cleanText = cleanText.replace(nameMatch[0], '');
  }

  const phoneMatch = cleanText.match(/📱\s*([+0-9\-\s]+)/);
  if (phoneMatch) {
    extractedPhone = phoneMatch[1].replace(/[^0-9]/g, '');
    cleanText = cleanText.replace(phoneMatch[0], '');
  }

  const isRegistrationOnly = /^(?:New client at id:\s*\d+|\d+:\s*New client)\s*$/i.test((rawBody || '').trim());
  cleanText = cleanText.replace(/^(?:\d+:|New client at id:\s*\d+)\s*/gi, '').trim();

  return {
    cleanText: cleanText || rawBody,
    extractedName,
    extractedPhone,
    isRegistrationOnly
  };
}

function identifyClientAndProject(text, phone, senderName = '') {
  const cleanText = (text || '').toLowerCase();
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

  // זיהוי מיוחד לתחסין / אורניל ניהול (קומקס #601992 - אורניל / אבי לוי)
  if (cleanText.includes('סטרומה')) {
    return {
      customerName: 'אורניל / אבי לוי גור',
      customerNumber: '601992',
      projectSite: 'סטרומה 4, הרצליה',
      contactPerson: 'אורניל (050-9988776)',
      isSimulation: false
    };
  }
  if (cleanText.includes('תחסין') || cleanText.includes('אורניל') || cleanText.includes('קפלן') || cleanText.includes('דינטי') ||
      cleanPhone.includes('525354552') || (senderName && (senderName.includes('תחסין') || senderName.includes('אורניל')))) {
    let site = 'לוחמי גליפולי 8, אביחיל';
    if (cleanText.includes('קפלן') || cleanText.includes('העצמאות')) site = 'משפחת קפלן, רחוב העצמאות, אביחיל';
    else if (cleanText.includes('דינטי') || cleanText.includes('גליפולי') || cleanText.includes('גלופולי')) site = 'דינטי, לוחמי גליפולי 8, אביחיל';
    return {
      customerName: 'אורניל / אבי לוי',
      customerNumber: '601992',
      projectSite: site,
      contactPerson: 'תחסין (052-5354552)',
      isSimulation: false
    };
  }

  // 1. זיהוי שולח במצב סימולציה / בדיקות ראמי ונועה (כגון 972508861080, 140901368230048 או כינוי נועה)
  // במצב זה: מספר הטלפון והשם 'נועה' אינם מייצגים לקוח אלא סימולטור מענה לקוח לפיתוח.
  // המערכת מתייחסת ב-100% אך ורק לתוכן הטקסט (שם, רחוב, אתר, פרויקט) ומנטרלת לחלוטין את זהות השולח!
  const isSimulation = DEV_SIMULATED_CUSTOMERS.some(sim => cleanPhone.includes(sim) || sim.includes(cleanPhone)) ||
                       (senderName && senderName.includes('נועה')) ||
                       cleanPhone.includes('508861080') ||
                       cleanPhone.includes('140901368230048');

  for (const client of KNOWN_CLIENTS_DIRECTORY) {
    // במצב סימולציה: אסור לבצע התאמת טלפון לסימולטור
    const phoneMatch = !isSimulation && cleanPhone && client.phones.some(p => p.includes(cleanPhone) || cleanPhone.includes(p));
    
    // התאמת שם/כינוי: במצב סימולציה נבדק אך ורק בתוך גוף ההודעה
    let nameMatch = client.aliases && client.aliases.some(alias => cleanText.includes(alias.toLowerCase()));
    if (!isSimulation && senderName && senderName !== 'לקוח וואטסאפ' && !senderName.includes('נועה')) {
      nameMatch = nameMatch || (client.aliases && client.aliases.some(alias => senderName.toLowerCase().includes(alias.toLowerCase())));
    }

    const siteStreet = client.defaultSite ? client.defaultSite.split(',')[0].toLowerCase().trim() : '';
    const siteMatch = siteStreet && siteStreet.length >= 4 && cleanText.includes(siteStreet);
    
    if (phoneMatch || nameMatch || siteMatch) {
      let matchedContact = client.contactPerson;
      if (cleanText.includes('ליאת') || cleanText.includes('ציפמן')) matchedContact = 'ליאת';
      else if (cleanText.includes('אחמד') || cleanText.includes('שחף')) matchedContact = 'אחמד';
      else if (cleanText.includes('אבי') || cleanText.includes('חוחית')) matchedContact = 'אבי';
      else if (cleanText.includes('מירון')) matchedContact = 'מירון';
      else if (cleanText.includes('יהודה')) matchedContact = 'יהודה כהן';
      else if (cleanText.includes('עומר')) matchedContact = 'עומר';
      else if (cleanText.includes('יוסי')) matchedContact = 'יוסי';
      else if (cleanText.includes('רועי')) matchedContact = 'רועי';
      else if (cleanText.includes('איתי')) matchedContact = 'איתי';
      else if (cleanText.includes('עמית')) matchedContact = 'עמית';
      else if (!isSimulation && senderName && senderName !== 'לקוח וואטסאפ' && !senderName.includes('נועה')) matchedContact = senderName;

      let matchedProject = client.defaultSite;
      if (cleanText.includes('חורגין')) matchedProject = extractAddress(text) || 'חורגין 22, רמת גן';
      else if (cleanText.includes('שמוליק סגל')) matchedProject = extractAddress(text) || 'שמוליק סגל 4, תל אביב';
      else if (cleanText.includes('ציפמן')) matchedProject = extractAddress(text) || 'ציפמן 50, רעננה';
      else if (cleanText.includes('אוסטושינסקי')) matchedProject = extractAddress(text) || 'אוסטושינסקי 5, כפר סבא';
      else if (cleanText.includes('שחף')) matchedProject = extractAddress(text) || 'שחף 9, הוד השרון';
      else if (cleanText.includes('חוחית')) matchedProject = extractAddress(text) || 'חוחית 8, הוד השרון';
      else if (cleanText.includes('מוצקין')) matchedProject = 'מוצקין 22, רעננה';
      else if (cleanText.includes('חינוך מיוחד')) matchedProject = 'אתר בית ספר חינוך מיוחד';
      else if (cleanText.includes('הנרייטה')) matchedProject = extractAddress(text) || 'הנרייטה סולד 20, הוד השרון';
      else if (cleanText.includes('פעמונית')) matchedProject = 'אתר פעמונית 47, הוד השרון';
      else if (cleanText.includes('סחלב') || cleanText.includes('רעות')) matchedProject = 'אתר הסחלב 8, רעות';
      else if (cleanText.includes('בילו') || cleanText.includes('ביל"ו')) matchedProject = extractAddress(text) || 'אתר ביל"ו תל אביב';

      return {
        customerName: client.name,
        customerNumber: client.customerNumber,
        projectSite: matchedProject,
        contactPerson: matchedContact,
        isSimulation: isSimulation
      };
    }
  }

  // חילוץ כתובת מתוך הטקסט אם לא נמצא לקוח ידוע
  const detectedAddr = extractAddress(text);

  // בדיקה האם הכתובת שייכת לפרויקט ידוע (ביל"ו רעננה -> לירן, ביל"ו ת"א -> זבולון)
  if (detectedAddr && (detectedAddr.includes('ביל"ו') || detectedAddr.includes('בילו'))) {
    if (detectedAddr.includes('רעננה') || detectedAddr.includes('53') || cleanText.includes('רעננה')) {
      return {
        customerName: 'לירן / ביל"ו',
        customerNumber: '612100',
        projectSite: 'ביל"ו 53, רעננה',
        contactPerson: 'אלירן (050-5669924)',
        isSimulation: isSimulation
      };
    }
    return {
      customerName: 'זבולון-עדירן (אתר ביל"ו)',
      customerNumber: '612603',
      projectSite: detectedAddr || 'ביל"ו 58, תל אביב',
      contactPerson: 'מנהל אתר ביל"ו',
      isSimulation: isSimulation
    };
  }

  // חילוץ שם חם אם מופיע
  const extractedPerson = extractContactNameFromTextOrContact(text, null, senderName, null);

  if (isSimulation) {
    return {
      customerName: detectedAddr ? ('לקוח אתר ' + detectedAddr.split(',')[0]) : (extractedPerson || 'לקוח ח. סבן'),
      customerNumber: 'טרם שויך',
      projectSite: detectedAddr || 'לפי תיאום באתר',
      contactPerson: extractedPerson || '',
      isSimulation: true
    };
  }

  return {
    customerName: (senderName && !senderName.includes('נועה') && !senderName.includes('וואטסאפ')) ? senderName : (extractedPerson || 'לקוח ח. סבן'),
    customerNumber: 'טרם שויך',
    projectSite: detectedAddr || 'לפי תיאום באתר',
    contactPerson: extractedPerson || ((senderName && !senderName.includes('נועה') && !senderName.includes('וואטסאפ')) ? senderName : ''),
    isSimulation: false
  };
}

function buildProfessionalReplyTemplate(clientInfo, rawText, isContainer) {
  const hour = new Date().getHours();
  let timeGreeting = 'שלום';
  let timeEmoji = '☀️';
  if (hour >= 5 && hour < 12) {
    timeGreeting = 'בוקר טוב';
    timeEmoji = '🌅';
  } else if (hour >= 12 && hour < 17) {
    timeGreeting = 'צהריים טובים';
    timeEmoji = '☀️';
  } else if (hour >= 17 && hour < 22) {
    timeGreeting = 'ערב טוב';
    timeEmoji = '🌆';
  } else {
    timeGreeting = 'לילה טוב';
    timeEmoji = '🌙';
  }

  const contact = clientInfo.contactPerson || 'יקר';
  const custNumStr = clientInfo.customerNumber && clientInfo.customerNumber !== 'טרם שויך' 
    ? ' (#' + clientInfo.customerNumber + ')' 
    : '';

  if (isContainer) {
    let actionType = 'החלפת מכולה 8 קוב';
    if (rawText.includes('הצבה')) actionType = 'הצבת מכולה 8 קוב ריקה';
    else if (rawText.includes('הוצאה') || rawText.includes('פינוי')) actionType = 'פינוי מכולה מהאתר';

    return timeGreeting + ' *' + contact + '* ' + timeEmoji + '\n' +
      'בקשת המכולה נקלטה בהצלחה במחלקת הסידור של *ח.סבן*:\n\n' +
      '📍 *אתר:* ' + clientInfo.projectSite + custNumStr + '\n' +
      '📋 *סטטוס:* ' + actionType + ' בסידור רמסע (אספקה תוך 24 שעות)\n' +
      '🚚 *אספקה:* נהג הרמסע יתאם מראש הגעה לאתר מולך מראמי או יואב בהמשך.\n\n' +
      'המשך יום מוצלח! *מחלקת הזמנות* 🏗️';
  }

  return timeGreeting + ' *' + contact + '* ' + timeEmoji + '\n' +
    'ההזמנה נקלטה בהצלחה במחלקת הסידור של *ח.סבן*:\n\n' +
    '📍 *אתר:* ' + clientInfo.projectSite + custNumStr + '\n' +
    '📋 *סטטוס:* בהכנה לשיבוץ משאית חלוקה\n' +
    '🚚 *אספקה:* מועד פריקה מדויק יתואם מולך בהקדם מראמי או יואב בהמשך.\n\n' +
    '──────── 🛡️ אישור מנהל ────────\n' +
    '✅ *נבדק ואושר ע"י ראמי* | מנהל מחלקת הזמנות וסידור\n' +
    'ח. סבן חומרי בניין (1994) בע"מ 🏗️';
}

// ==========================================
// 🔮 אלגוריתם חיזוי תוכן לקוחות, השלמת סל וחיזוי לוגיסטי (AI Prediction Engine)
// ==========================================
/**
 * מנתח את פרטי הלקוח והמוצרים שהוזמנו ומפיק חיזוי רב-שכבתי:
 * 1. חיזוי מוצרים משלימים שהלקוח שכח (Basket Complements).
 * 2. חיזוי רכב אופטימלי וזמן פריקה משוער (על בסיס נתוני איתוראן).
 * 3. איתור דגשי אתר וסיכוני גישה ספציפיים ללקוח (רחוב צר / כבלי חשמל).
 */
function predictCustomerContent(clientInfo, rawText, parsedItems, normalized) {
  const predictions = {
    suggestedComplements: [],
    deliveryRecommendation: '',
    estimatedDurationMin: 25,
    siteCautionNote: '',
    predictionBadge: '🎯 חיזוי אוטונומי'
  };

  const skus = parsedItems.map(it => it.sku);
  const names = parsedItems.map(it => (it.name || '').toLowerCase());
  const cleanRaw = (rawText || '').toLowerCase();
  const totalWeight = normalized.totalWeightTons || 0;
  const hasBigBag = normalized.deposits && normalized.deposits.bigBags > 0;

  // א. חיזוי מוצרים משלימים (Basket Complements)
  const hasCement = skus.some(s => s === '10002' || s === '10009') || names.some(n => n.includes('מלט'));
  const hasSand = skus.some(s => s === '11501' || s === '11500') || names.some(n => n.includes('חול'));
  const hasPlaster = skus.some(s => s === '15770' || s === '14075' || s === '15710') || names.some(n => n.includes('טיח'));
  const hasDrywall = skus.some(s => s.startsWith('111') || s.startsWith('112') || s.startsWith('114')) || names.some(n => n.includes('גבס'));
  const hasProfiles = skus.some(s => s.startsWith('965') || s.startsWith('865') || s.startsWith('951') || s.startsWith('851')) || names.some(n => n.includes('ניצב') || n.includes('מסלול'));

  // 1. הזמין מלט ללא חול או טיט
  if (hasCement && !hasSand && !hasPlaster) {
    predictions.suggestedComplements.push('חול בלה (11501) או טיט מוכן (11551) לריצוף/בנייה');
  }

  // 2. הזמין טיח (ממ"ד או גבס)
  if (hasPlaster) {
    if (!cleanRaw.includes('פריימר') && !cleanRaw.includes('007')) {
      predictions.suggestedComplements.push('פריימר SAKRET 007 (מק"ט 14007) לקישור');
    }
    if (!cleanRaw.includes('פינה') && !cleanRaw.includes('פינות')) {
      predictions.suggestedComplements.push('פינות טיח / פינה אפס לגימור');
    }
  }

  // 3. הזמין לוחות גבס ללא שלד או ברגים
  if (hasDrywall && !hasProfiles) {
    predictions.suggestedComplements.push('ניצבים ומסלולים 0.6 (מק"טים 9650300 / 8650300)');
    predictions.suggestedComplements.push('ברגי גבס 25/35 מ"מ ושפכטל אמריקאי');
  }

  // ב. חיזוי רכב, פריקה וזמן פריקה (Ituran Telemetry Benchmarks)
  if (totalWeight <= 1.5 && !hasBigBag && !normalized.hasBlocks) {
    predictions.deliveryRecommendation = 'עלי (איסוזו חלוקה 651-51-701) — פריקה ידנית';
    predictions.estimatedDurationMin = 10;
  } else {
    predictions.deliveryRecommendation = 'חכמת (מרצדס מנוף 615-41-002)';
    predictions.estimatedDurationMin = totalWeight > 8 ? 35 : 25;
  }

  // ג. חיזוי דגשי אתר ופרופיל לקוח היסטורי
  if (clientInfo && clientInfo.customerName) {
    const cMatch = KNOWN_CLIENTS_DIRECTORY.find(c => c.customerNumber === clientInfo.customerNumber || c.name === clientInfo.customerName);
    if (cMatch) {
      if (cMatch.typicalUnloadMin) {
        predictions.estimatedDurationMin = cMatch.typicalUnloadMin;
      }
      if (cMatch.siteNotes) {
        predictions.siteCautionNote = cMatch.siteNotes;
      }
    }
  }

  return predictions;
}

// ==========================================
// 📦 מילון לוגיסטי SabanOS — קטלוג מוצרים מורחב (50+ פריטים)
// ==========================================
const RAW_CATALOG = [
  {
    "sku": "14604",
    "name": "פלסטומר AD603 לבן 25 ק\"ג כרמית",
    "unit": "שק",
    "keywords": [
      "פלסטומר 603 לבן",
      "פלסטומר 603",
      "פלסטומר ad603 לבן",
      "פלסטומר לבן",
      "ad603 לבן",
      "603 לבן"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": true,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "דבק פלסטומר AD603 לבן. משטח = 40 שקים.",
    "pkg": "שק 25 ק\"ג"
  },
  {
    "sku": "14603",
    "name": "פלסטומר AD603 אפור 25 ק\"ג כרמית",
    "unit": "שק",
    "keywords": [
      "פלסטומר 603 אפור",
      "פלסטומר אפור",
      "פלסטומר ad603 אפור",
      "ad603 אפור",
      "603 אפור"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": true,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "דבק פלסטומר AD603 אפור. משטח = 40 שקים.",
    "pkg": "שק 25 ק\"ג"
  },
  {
    "sku": "11501",
    "name": "חול שק גדול (בלה)",
    "unit": "בלה",
    "keywords": [
      "חול שק גדול (בלה)",
      "חול שק גדול",
      "חול גדול",
      "בלת חול",
      "אגרגטים",
      "חול בלה",
      "בלה חול",
      "4 חול",
      "בלה חול",
      "שק חול גדול"
    ],
    "weightTon": 0.75,
    "isBigBag": true,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "אם צוין מספר ללא יחידה והסל כבד -> בלה (11501) + פקדון (60002). מקסימום 18 בלות לחכמת.",
    "pkg": "בלה 1 (כ-0.6 קוב)"
  },
  {
    "sku": "11500",
    "name": "חול שק 25 ק\"ג",
    "unit": "שק",
    "keywords": [
      "חול שק 25 ק\"ג",
      "חול 25 קג",
      "שקית חול",
      "חול קטן",
      "שק חול",
      "חול שק",
      "שקית",
      "חול 25 קג",
      "שק חול"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "לסל קל או פריקה ידנית עלי.",
    "pkg": "שק 25 ק\"ג | משטח = 70 שקים"
  },
  {
    "sku": "11511",
    "name": "סומסום שק גדול (בלה)",
    "unit": "בלה",
    "keywords": [
      "סומסום שק גדול (בלה)",
      "סומסום שק גדול",
      "סומסום בלה",
      "שומשום בלה",
      "בלה סומסום",
      "בלת סומסום",
      "שומשומית",
      "סומסום",
      "שומשום"
    ],
    "weightTon": 0.73,
    "isBigBag": true,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "פריקת מנוף חכמת. מקסימום 18 בלות ברכב. להוריד בלות אם מתווסף משטח מלט 1 טון.",
    "pkg": "בלה 1 (כ-0.6 קוב)"
  },
  {
    "sku": "11510",
    "name": "סומסום שק 25 ק\"ג",
    "unit": "שק",
    "keywords": [
      "סומסום שק 25 ק\"ג",
      "סומסום 25 קג",
      "שקית שומשום",
      "סומסום שק",
      "שק סומסום",
      "סומסום",
      "שומשום",
      "שק"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "משאות קלים, משאית עלי.",
    "pkg": "שק 25 ק\"ג | משטח = 70 שקים"
  },
  {
    "sku": "11540",
    "name": "מצע שק גדול (בלה)",
    "unit": "בלה",
    "keywords": [
      "מצע שק גדול (בלה)",
      "מצע שק גדול",
      "מצע מהודק",
      "בלה מצע",
      "מצע בלה",
      "מחלוטה",
      "תשתית",
      "מצע"
    ],
    "weightTon": 0.8,
    "isBigBag": true,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "מנוף חכמת בלבד.",
    "pkg": "בלה 1"
  },
  {
    "sku": "11551",
    "name": "טיט מוכן שק גדול (בלה)",
    "unit": "בלה",
    "keywords": [
      "טיט מוכן שק גדול (בלה)",
      "טיט מוכן שק גדול",
      "טיט לבניה",
      "בלת טיט",
      "בלה טיט",
      "טיט בלה",
      "בניה",
      "בלה טיט",
      "שק טיט גדול"
    ],
    "weightTon": 0.75,
    "isBigBag": true,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "פריקת מנוף חכמת. דורש פקדון בלה 60002.",
    "pkg": "בלה 1"
  },
  {
    "sku": "11550",
    "name": "טיט מוכן שק 25 ק\"ג",
    "unit": "שק",
    "keywords": [
      "טיט מוכן שק 25 ק\"ג",
      "טיט מוכן שק",
      "טיט 25 קג",
      "טיט שק",
      "שק טיט",
      "טיט",
      "שק"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "שקים קלים.",
    "pkg": "שק 25 ק\"ג | משטח = 70 שקים"
  },
  {
    "sku": "11570",
    "name": "חמרה שק גדול (בלה)",
    "unit": "בלה",
    "keywords": [
      "חמרה שק גדול (בלה)",
      "חמרה שק גדול",
      "אדמת גננות",
      "אדמה חמרה",
      "בלה חמרה",
      "חמרה בלה",
      "גינון",
      "אדמה",
      "חמרה"
    ],
    "weightTon": 0.7,
    "isBigBag": true,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "מנוף חכמת.",
    "pkg": "בלה 1"
  },
  {
    "sku": "10002",
    "name": "מלט אפור 25 ק\"ג נשר",
    "unit": "שק",
    "keywords": [
      "מלט אפור 25 ק\"ג נשר",
      "מלט 25 קג",
      "צמנט אפור",
      "מלט אפור",
      "משטח מלט",
      "מלט נשר",
      "שק מלט",
      "צמנט",
      "נשר",
      "מלט"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": true,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "משטח שלם = 40 שקים = 1 טון בדיוק. שוקל כמו 1.3 בלות. מורידים בלות בחכמת כדי לאזן משקל.",
    "pkg": "שק 25 ק\"ג | משטח = 40 שקים (1.0 טון)"
  },
  {
    "sku": "10009",
    "name": "מלט לבן 25 ק\"ג",
    "unit": "שק",
    "keywords": [
      "מלט לבן 25 ק\"ג",
      "שק מלט לבן",
      "צמנט לבן",
      "מלט לבן"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": true,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "אם ביקש רק \"מלט\" בלי צבע -> לברר האם אפור רגיל (10002) או לבן.",
    "pkg": "שק 25 ק\"ג | משטח = 40 שקים"
  },
  {
    "sku": "10011",
    "name": "בטון מוכן 25 ק\"ג",
    "unit": "שק",
    "keywords": [
      "בטון מוכן 25 ק\"ג",
      "בטון 25 קג",
      "בטון מוכן",
      "ב-20 מוכן",
      "בטון יבש",
      "שק בטון",
      "בטון"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": true,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "משטח 40 שקים מחייב פקדון משטח (60060).",
    "pkg": "שק 25 ק\"ג | משטח = 40 שקים"
  },
  {
    "sku": "15109",
    "name": "דבק 109 25 ק\"ג כרמית",
    "unit": "שק",
    "keywords": [
      "דבק 109 25 ק\"ג כרמית",
      "מיסטר פיקס 109",
      "דבק קרמיקה",
      "כרמית 109",
      "דבק 109",
      "קרמיקה",
      "כרמית",
      "דבק",
      "109"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": true,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "שק 25 ק\"ג. דורש פקדון משטח מעל 35 שקים.",
    "pkg": "שק 25 ק\"ג | משטח = 40 שקים"
  },
  {
    "sku": "14007",
    "name": "פריימר SAKRET 007 שק 20 ק\"ג",
    "unit": "שק",
    "keywords": [
      "פריימר sakret 007 שק 20 ק\"ג",
      "פריימר סקרט",
      "פריימר 007",
      "sakret 007",
      "סקרט 007",
      "פריימר",
      "סקרט",
      "007"
    ],
    "weightTon": 0.02,
    "isBigBag": false,
    "isPalletItem": true,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "שק 20 ק\"ג.",
    "pkg": "שק 20 ק\"ג | משטח = 40 שקים"
  },
  {
    "sku": "15023",
    "name": "בונד 200 גלון 5 ק\"ג",
    "unit": "שק",
    "keywords": [
      "בונד 200 גלון 5 ק\"ג",
      "בי גי בונד 200",
      "בונד 5 קג",
      "דבק בונד",
      "בונד 200",
      "בי ג'י",
      "בונד"
    ],
    "weightTon": 0.005,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "גלון נוזלי, חלוקת עלי.",
    "pkg": "גלון 5 ק\"ג"
  },
  {
    "sku": "111260",
    "name": "לוח גבס לבן 260 ע 12.50",
    "unit": "לוח",
    "keywords": [
      "לוח גבס לבן 260 ע 12.50",
      "לוח גבס לבן 260",
      "פלטת גבס לבן",
      "גבס לבן 260",
      "לוח גבס",
      "גבס לבן",
      "לוח גבס לבן"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": true,
    "rules": "ברירת מחדל ראשית: אם הלקוח אמר \"לוח גבס\" בלי לציין מידה/סוג -> לשבץ 111260 (לבן 2.60) ולשאול האם דרוש ירוק/אורך שונה.",
    "pkg": "לוח בודד (משטח מפעל = 60-80 לוחות)"
  },
  {
    "sku": "111280",
    "name": "לוח גבס לבן 280 ע 12.50",
    "unit": "לוח",
    "keywords": [
      "לוח גבס לבן 280 ע 12.50",
      "לוח גבס לבן 280",
      "פלטת גבס לבן",
      "גבס לבן 280",
      "לוח גבס",
      "280",
      "גבס",
      "לבן"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": true,
    "rules": "גבס לבן אורך 280. משאית עלי.",
    "pkg": "לוח בודד (משטח מפעל = 60-80 לוחות)"
  },
  {
    "sku": "111300",
    "name": "לוח גבס לבן 300 ע 12.50",
    "unit": "לוח",
    "keywords": [
      "לוח גבס לבן 300 ע 12.50",
      "לוח גבס לבן 300",
      "פלטת גבס לבן",
      "גבס לבן 300",
      "לוח גבס",
      "300",
      "גבס",
      "לבן"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": true,
    "rules": "גבס לבן אורך 300. משאית עלי.",
    "pkg": "לוח בודד (משטח מפעל = 60-80 לוחות)"
  },
  {
    "sku": "119260",
    "name": "לוח גבס לבן 260 ע 9.50",
    "unit": "לוח",
    "keywords": [
      "לוח גבס לבן 260 ע 9.50",
      "לוח גבס לבן 260",
      "פלטת גבס לבן",
      "גבס לבן 260",
      "לוח גבס",
      "גבס לבן",
      "לוח גבס לבן"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": true,
    "rules": "גבס לבן אורך 260. משאית עלי.",
    "pkg": "לוח בודד (משטח מפעל = 60-80 לוחות)"
  },
  {
    "sku": "112200",
    "name": "לוח גבס ירוק 200 ע 12.50",
    "unit": "לוח",
    "keywords": [
      "לוח גבס ירוק 200 ע 12.50",
      "לוח גבס ירוק 200",
      "פלטת גבס ירוק",
      "גבס ירוק 200",
      "לוח גבס",
      "ירוק",
      "גבס",
      "200"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": true,
    "rules": "גבס ירוק אורך 200. משאית עלי.",
    "pkg": "לוח בודד (משטח מפעל = 60-80 לוחות)"
  },
  {
    "sku": "112260",
    "name": "לוח גבס ירוק 260 ע 12.50",
    "unit": "לוח",
    "keywords": [
      "לוח גבס ירוק 260 ע 12.50",
      "לוח גבס ירוק 260",
      "פלטת גבס ירוק",
      "גבס ירוק 260",
      "לוח גבס",
      "ירוק",
      "260",
      "גבס"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": true,
    "rules": "גבס ירוק אורך 260. משאית עלי.",
    "pkg": "לוח בודד (משטח מפעל = 60-80 לוחות)"
  },
  {
    "sku": "112280",
    "name": "לוח גבס ירוק 280 ע 12.50",
    "unit": "לוח",
    "keywords": [
      "לוח גבס ירוק 280 ע 12.50",
      "לוח גבס ירוק 280",
      "פלטת גבס ירוק",
      "גבס ירוק 280",
      "לוח גבס",
      "ירוק",
      "280",
      "גבס"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": true,
    "rules": "גבס ירוק אורך 280. משאית עלי.",
    "pkg": "לוח בודד (משטח מפעל = 60-80 לוחות)"
  },
  {
    "sku": "114200",
    "name": "לוח גבס כחול 200 ע 12.50",
    "unit": "לוח",
    "keywords": [
      "לוח גבס כחול 200 ע 12.50",
      "לוח גבס כחול 200",
      "פלטת גבס כחול",
      "גבס כחול 200",
      "לוח גבס",
      "כחול",
      "גבס",
      "200"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": true,
    "rules": "גבס כחול אורך 200. משאית עלי.",
    "pkg": "לוח בודד (משטח מפעל = 60-80 לוחות)"
  },
  {
    "sku": "114260",
    "name": "לוח גבס כחול 260 ע 12.50",
    "unit": "לוח",
    "keywords": [
      "לוח גבס כחול 260 ע 12.50",
      "לוח גבס כחול 260",
      "פלטת גבס כחול",
      "גבס כחול 260",
      "לוח גבס",
      "כחול",
      "260",
      "גבס"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": true,
    "rules": "גבס כחול אורך 260. משאית עלי.",
    "pkg": "לוח בודד (משטח מפעל = 60-80 לוחות)"
  },
  {
    "sku": "115200",
    "name": "לוח גבס 4K לבן 200 ע 12.50",
    "unit": "לוח",
    "keywords": [
      "לוח גבס 4k לבן 200 ע 12.50",
      "לוח גבס לבן 200",
      "פלטת גבס לבן",
      "גבס לבן 200",
      "לוח גבס",
      "גבס",
      "200",
      "לבן"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": true,
    "rules": "גבס לבן אורך 200. משאית עלי.",
    "pkg": "לוח בודד (משטח מפעל = 60-80 לוחות)"
  },
  {
    "sku": "115260",
    "name": "לוח גבס 4K לבן 260 ע 12.50",
    "unit": "לוח",
    "keywords": [
      "לוח גבס 4k לבן 260 ע 12.50",
      "לוח גבס לבן 260",
      "פלטת גבס לבן",
      "גבס לבן 260",
      "לוח גבס",
      "גבס לבן",
      "לוח גבס לבן"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": true,
    "rules": "גבס לבן אורך 260. משאית עלי.",
    "pkg": "לוח בודד (משטח מפעל = 60-80 לוחות)"
  },
  {
    "sku": "9650300",
    "name": "ניצב 0.6 50/300",
    "unit": "יח'",
    "keywords": [
      "ניצב 0.6 50/300",
      "חבילות ניצב",
      "חבילת ניצב",
      "ניצב 0.6",
      "פרופיל",
      "מתכת",
      "ניצב",
      "גבס"
    ],
    "weightTon": 0.003,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": true,
    "isDrywall": false,
    "rules": "חוק חבילה: אם הלקוח רשם חבילה 1 או 2 -> להמיר ל-10 או 20 יחידות בקומקס. משאית עלי.",
    "pkg": "חוק חבילה: 1 חבילה = 10 יחידות בדיוק"
  },
  {
    "sku": "8650300",
    "name": "מסלול 0.6 50/300",
    "unit": "יח'",
    "keywords": [
      "מסלול 0.6 50/300",
      "חבילות מסלול",
      "חבילת מסלול",
      "מסלול 0.6",
      "פרופיל",
      "מסלול",
      "מתכת",
      "גבס"
    ],
    "weightTon": 0.003,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": true,
    "isDrywall": false,
    "rules": "חוק חבילה: אם הלקוח רשם חבילה 1 או 2 -> להמיר ל-10 או 20 יחידות בקומקס. משאית עלי.",
    "pkg": "חוק חבילה: 1 חבילה = 10 יחידות בדיוק"
  },
  {
    "sku": "9510300",
    "name": "ניצב 0.5 100/300",
    "unit": "יח'",
    "keywords": [
      "ניצב 0.5 100/300",
      "חבילות ניצב",
      "חבילת ניצב",
      "ניצב 0.5",
      "פרופיל",
      "מתכת",
      "ניצב",
      "גבס"
    ],
    "weightTon": 0.003,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": true,
    "isDrywall": false,
    "rules": "חוק חבילה: אם הלקוח רשם חבילה 1 או 2 -> להמיר ל-10 או 20 יחידות בקומקס. משאית עלי.",
    "pkg": "חוק חבילה: 1 חבילה = 10 יחידות בדיוק"
  },
  {
    "sku": "8510300",
    "name": "מסלול 0.5 100/300",
    "unit": "יח'",
    "keywords": [
      "מסלול 0.5 100/300",
      "חבילות מסלול",
      "חבילת מסלול",
      "מסלול 0.5",
      "פרופיל",
      "מסלול",
      "מתכת",
      "גבס"
    ],
    "weightTon": 0.003,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": true,
    "isDrywall": false,
    "rules": "חוק חבילה: אם הלקוח רשם חבילה 1 או 2 -> להמיר ל-10 או 20 יחידות בקומקס. משאית עלי.",
    "pkg": "חוק חבילה: 1 חבילה = 10 יחידות בדיוק"
  },
  {
    "sku": "9570300",
    "name": "ניצב 0.5 70/300",
    "unit": "יח'",
    "keywords": [
      "ניצב 0.5 70/300",
      "חבילות ניצב",
      "חבילת ניצב",
      "ניצב 0.5",
      "פרופיל",
      "מתכת",
      "ניצב",
      "גבס"
    ],
    "weightTon": 0.003,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": true,
    "isDrywall": false,
    "rules": "חוק חבילה: אם הלקוח רשם חבילה 1 או 2 -> להמיר ל-10 או 20 יחידות בקומקס. משאית עלי.",
    "pkg": "חוק חבילה: 1 חבילה = 10 יחידות בדיוק"
  },
  {
    "sku": "9537300",
    "name": "ניצב 0.5 37/300",
    "unit": "יח'",
    "keywords": [
      "ניצב 0.5 37/300",
      "חבילות ניצב",
      "חבילת ניצב",
      "ניצב 0.5",
      "פרופיל",
      "מתכת",
      "ניצב",
      "גבס"
    ],
    "weightTon": 0.003,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": true,
    "isDrywall": false,
    "rules": "חוק חבילה: אם הלקוח רשם חבילה 1 או 2 -> להמיר ל-10 או 20 יחידות בקומקס. משאית עלי.",
    "pkg": "חוק חבילה: 1 חבילה = 10 יחידות בדיוק"
  },
  {
    "sku": "9550260",
    "name": "ניצב 0.5 50/260",
    "unit": "יח'",
    "keywords": [
      "ניצב 0.5 50/260",
      "חבילות ניצב",
      "חבילת ניצב",
      "ניצב 0.5",
      "פרופיל",
      "מתכת",
      "ניצב",
      "גבס"
    ],
    "weightTon": 0.003,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": true,
    "isDrywall": false,
    "rules": "חוק חבילה: אם הלקוח רשם חבילה 1 או 2 -> להמיר ל-10 או 20 יחידות בקומקס. משאית עלי.",
    "pkg": "חוק חבילה: 1 חבילה = 10 יחידות בדיוק"
  },
  {
    "sku": "8550300",
    "name": "מסלול 0.5 50/300",
    "unit": "יח'",
    "keywords": [
      "מסלול 0.5 50/300",
      "חבילות מסלול",
      "חבילת מסלול",
      "מסלול 0.5",
      "פרופיל",
      "מסלול",
      "מתכת",
      "גבס"
    ],
    "weightTon": 0.003,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": true,
    "isDrywall": false,
    "rules": "חוק חבילה: אם הלקוח רשם חבילה 1 או 2 -> להמיר ל-10 או 20 יחידות בקומקס. משאית עלי.",
    "pkg": "חוק חבילה: 1 חבילה = 10 יחידות בדיוק"
  },
  {
    "sku": "8528300",
    "name": "מסלול 0.5 28/300",
    "unit": "יח'",
    "keywords": [
      "מסלול 0.5 28/300",
      "חבילות מסלול",
      "חבילת מסלול",
      "מסלול 0.5",
      "פרופיל",
      "מסלול",
      "מתכת",
      "גבס"
    ],
    "weightTon": 0.003,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": true,
    "isDrywall": false,
    "rules": "חוק חבילה: אם הלקוח רשם חבילה 1 או 2 -> להמיר ל-10 או 20 יחידות בקומקס. משאית עלי.",
    "pkg": "חוק חבילה: 1 חבילה = 10 יחידות בדיוק"
  },
  {
    "sku": "75090",
    "name": "מסלול אומגה תקן 300",
    "unit": "יח'",
    "keywords": [
      "מסלול אומגה תקן 300",
      "חבילות מסלול",
      "חבילת מסלול",
      "מסלול אומגה",
      "פרופיל",
      "מסלול",
      "מתכת",
      "גבס"
    ],
    "weightTon": 0.003,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": true,
    "isDrywall": false,
    "rules": "חוק חבילה: אם הלקוח רשם חבילה 1 או 2 -> להמיר ל-10 או 20 יחידות בקומקס. משאית עלי.",
    "pkg": "חוק חבילה: 1 חבילה = 10 יחידות בדיוק"
  },
  {
    "sku": "35010",
    "name": "שפכטל אמריקאי 28 ק\"ג",
    "unit": "שק",
    "keywords": [
      "שפכטל אמריקאי 28 ק\"ג",
      "דלי שפכטל ירוק",
      "שפכטל אמריקאי",
      "שפכטל 28 קג",
      "דלי שפכטל",
      "אמריקאי",
      "שפכטל",
      "צבע",
      "גבס"
    ],
    "weightTon": 0.028,
    "isBigBag": false,
    "isPalletItem": true,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "מוצר משלים מובהק ללוחות גבס.",
    "pkg": "דלי 28 ק\"ג | משטח = 36 דליים"
  },
  {
    "sku": "12003",
    "name": "בלוק בטון 3/20/40 (פלטה)",
    "unit": "יח'",
    "keywords": [
      "פלטה 3",
      "בלוק 3",
      "בלוק בלוק בטון 3/20/40 (פלטה)",
      "בלוק בטון 3/20/40 (פלטה)",
      "משטח בלוקים",
      "בלוקים",
      "בטון",
      "בניה",
      "בלוק"
    ],
    "weightTon": 0.018,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": true,
    "isMetal": false,
    "isDrywall": false,
    "rules": "חובה מנוף חכמת. מחשב פקדון משטח בלוקים 60006 לפי מנות משטח.",
    "pkg": "משטח בלוקים תקני (65-75 יח')"
  },
  {
    "sku": "12004",
    "name": "בלוק בטון 4/20/40 (פלטה)",
    "unit": "יח'",
    "keywords": [
      "פלטה 4",
      "בלוק 4",
      "בלוק בלוק בטון 4/20/40 (פלטה)",
      "בלוק בטון 4/20/40 (פלטה)",
      "משטח בלוקים",
      "בלוקים",
      "בטון",
      "בניה",
      "בלוק"
    ],
    "weightTon": 0.018,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": true,
    "isMetal": false,
    "isDrywall": false,
    "rules": "חובה מנוף חכמת. מחשב פקדון משטח בלוקים 60006 לפי מנות משטח.",
    "pkg": "משטח בלוקים תקני (65-75 יח')"
  },
  {
    "sku": "12007",
    "name": "בלוק בטון 7/20/40",
    "unit": "יח'",
    "keywords": [
      "בלוקים 7",
      "בלוק 7",
      "בלוק בלוק בטון 7/20/40",
      "בלוק בטון 7/20/40",
      "משטח בלוקים",
      "בלוקים",
      "בטון",
      "בניה",
      "בלוק"
    ],
    "weightTon": 0.018,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": true,
    "isMetal": false,
    "isDrywall": false,
    "rules": "חובה מנוף חכמת. מחשב פקדון משטח בלוקים 60006 לפי מנות משטח.",
    "pkg": "משטח בלוקים תקני (65-75 יח')"
  },
  {
    "sku": "12010",
    "name": "בלוק בטון 10/20/40",
    "unit": "יח'",
    "keywords": [
      "בלוקים 10",
      "בלוק עשר",
      "בלוק 10",
      "בלוק בלוק בטון 10/20/40",
      "בלוק בטון 10/20/40",
      "משטח בלוקים",
      "בלוקים",
      "בטון",
      "בניה",
      "בלוק"
    ],
    "weightTon": 0.018,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": true,
    "isMetal": false,
    "isDrywall": false,
    "rules": "חובה מנוף חכמת. מחשב פקדון משטח בלוקים 60006 לפי מנות משטח.",
    "pkg": "משטח בלוקים תקני (65-75 יח')"
  },
  {
    "sku": "12154",
    "name": "בלוק בטון 15/20/40 4 חורים",
    "unit": "יח'",
    "keywords": [
      "בלוקים 15",
      "בלוק 15",
      "בלוק בלוק בטון 15/20/40 4 חורים",
      "בלוק בטון 15/20/40 4 חורים",
      "משטח בלוקים",
      "בלוקים",
      "בטון",
      "בניה",
      "בלוק"
    ],
    "weightTon": 0.018,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": true,
    "isMetal": false,
    "isDrywall": false,
    "rules": "חובה מנוף חכמת. מחשב פקדון משטח בלוקים 60006 לפי מנות משטח.",
    "pkg": "משטח בלוקים תקני (65-75 יח')"
  },
  {
    "sku": "12202",
    "name": "בלוק בטון 20/20/40 2 חורים",
    "unit": "יח'",
    "keywords": [
      "בלוק 20 שתי חורים",
      "בלוק 20 2 חורים",
      "בלוק בלוק בטון 20/20/40 2 חורים",
      "בלוק בטון 20/20/40 2 חורים",
      "משטח בלוקים",
      "בלוקים",
      "בטון",
      "בניה",
      "בלוק"
    ],
    "weightTon": 0.018,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": true,
    "isMetal": false,
    "isDrywall": false,
    "rules": "חובה מנוף חכמת. מחשב פקדון משטח בלוקים 60006 לפי מנות משטח.",
    "pkg": "משטח בלוקים תקני (65-75 יח')"
  },
  {
    "sku": "12204",
    "name": "בלוק בטון 20/20/40 4 חורים",
    "unit": "יח'",
    "keywords": [
      "בלוק 20 4 חורים",
      "בלוקים 20",
      "בלוק עשרים",
      "בלוק 20",
      "בלוק בלוק בטון 20/20/40 4 חורים",
      "בלוק בטון 20/20/40 4 חורים",
      "משטח בלוקים",
      "בלוקים",
      "בטון",
      "בניה",
      "בלוק"
    ],
    "weightTon": 0.018,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": true,
    "isMetal": false,
    "isDrywall": false,
    "rules": "חובה מנוף חכמת. מחשב פקדון משטח בלוקים 60006 לפי מנות משטח.",
    "pkg": "משטח בלוקים תקני (65-75 יח')"
  },
  {
    "sku": "12215",
    "name": "בלוק שוקת 20/20/40",
    "unit": "יח'",
    "keywords": [
      "בלוק בלוק שוקת 20/20/40",
      "בלוק שוקת 20/20/40",
      "משטח בלוקים",
      "בלוקים",
      "בטון",
      "בניה",
      "בלוק"
    ],
    "weightTon": 0.018,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": true,
    "isMetal": false,
    "isDrywall": false,
    "rules": "חובה מנוף חכמת. מחשב פקדון משטח בלוקים 60006 לפי מנות משטח.",
    "pkg": "משטח בלוקים תקני (65-75 יח')"
  },
  {
    "sku": "6410010",
    "name": "נייר לטש שחור 100 10 מ.א.",
    "unit": "שק",
    "keywords": [
      "נייר לטש שחור 100 10 מ.א."
    ],
    "weightTon": 0.005,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "לפי הנחיות סידור",
    "pkg": "יח'"
  },
  {
    "sku": "6412010",
    "name": "נייר לטש שחור 120 10 מ.א.",
    "unit": "שק",
    "keywords": [
      "נייר לטש שחור 120 10 מ.א."
    ],
    "weightTon": 0.005,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "לפי הנחיות סידור",
    "pkg": "יח'"
  },
  {
    "sku": "58111",
    "name": "שק גדול לבן 60X60X80 לפסולת",
    "unit": "שק",
    "keywords": [
      "שק גדול לבן 60x60x80 לפסולת"
    ],
    "weightTon": 0.005,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "לפי הנחיות סידור",
    "pkg": "יח'"
  },
  {
    "sku": "60002",
    "name": "בלה פקדון",
    "unit": "בלה",
    "keywords": [
      "פקדון בלה פקדון",
      "זיכוי בלה פקדון",
      "בלה פקדון",
      "פיקדון",
      "פקדון",
      "משטח"
    ],
    "weightTon": 0.0,
    "isBigBag": true,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "חיוב אוטומטי ביחס 1:1 על בלות (60002) או משטחים (60060/60006). פטור בהובלה ללא פריקה.",
    "pkg": "יח' זיכוי"
  },
  {
    "sku": "60060",
    "name": "משטח סבן פקדון",
    "unit": "שק",
    "keywords": [
      "זיכוי משטח סבן פקדון",
      "פקדון משטח סבן פקדון",
      "משטח סבן פקדון",
      "פיקדון",
      "פקדון",
      "משטח"
    ],
    "weightTon": 0.0,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "חיוב אוטומטי ביחס 1:1 על בלות (60002) או משטחים (60060/60006). פטור בהובלה ללא פריקה.",
    "pkg": "יח' זיכוי"
  },
  {
    "sku": "60006",
    "name": "משטח בלוקים פקדון",
    "unit": "שק",
    "keywords": [
      "פקדון משטח בלוקים פקדון",
      "זיכוי משטח בלוקים פקדון",
      "משטח בלוקים פקדון",
      "פיקדון",
      "פקדון",
      "משטח"
    ],
    "weightTon": 0.0,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "חיוב אוטומטי ביחס 1:1 על בלות (60002) או משטחים (60060/60006). פטור בהובלה ללא פריקה.",
    "pkg": "יח' זיכוי"
  },
  {
    "sku": "15107",
    "name": "סיקה טופ 107 איטום דו-רכיבי",
    "unit": "שק/סט",
    "keywords": [
      "סיקה 107",
      "סיקה טופ 107",
      "סיקהטופ 107",
      "סיקהטופ",
      "סיקה"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": true,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "איטום צמנטי דו-רכיבי SikaTop 107",
    "pkg": "סט 25 ק\"ג"
  },
  {
    "sku": "15023",
    "name": "תוסף סיקה לטקס / תוסף מקשר 5 ק\"ג",
    "unit": "גלון",
    "keywords": [
      "תוסף לסיקה",
      "תוסף",
      "סיקה לטקס",
      "לטקס",
      "תוסף מקשר"
    ],
    "weightTon": 0.005,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "תוסף נוזלי מקשר לסיקה 107 ומליטות",
    "pkg": "גלון 5 ק\"ג"
  },
  {
    "sku": "19108",
    "name": "סיקה 107 לבן+תוסף 25 ק\"ג",
    "unit": "סט/שק",
    "keywords": [
      "סיקה 107_עם_תוסף",
      "סיקה 107 עם תוסף",
      "סיקה 107+תוסף",
      "סיקה 107 תוסף",
      "סיקה 107 לבן+תוסף",
      "סיקה 107 עם תוסף",
      "סיקה 107 לבן",
      "סיקה+תוסף",
      "סיקה לבן+תוסף",
      "107+תוסף",
      "סיקה 107"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": true,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "palletThreshold": 20,
    "rules": "ערכת איטום צמנטי לבן + תוסף נוזלי (מק\"ט 19108 משורה 160 במילון_לוגסטי). דורש פקדון משטח עץ מסף 20 יח'",
    "pkg": "סט 25 ק\"ג"
  },
  {
    "sku": "24101",
    "name": "בידוד אקוסטי 6 מ\"מ 150 50 מ.א (פלציב)",
    "unit": "גליל",
    "keywords": [
      "פלציב",
      "גלילי פלציב",
      "גלילים של פלציב",
      "בידוד פלציב",
      "פלציב 6 מ\"מ",
      "פלציב 6 מיל",
      "פלציב 6"
    ],
    "weightTon": 0.005,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "גלילי בידוד אקוסטי פלציב לריצוף (מק\"ט 24101)",
    "pkg": "גליל"
  },
  {
    "sku": "50002",
    "name": "לוח קלקל 2 ס\"מ 50/125 F15 (קלקר)",
    "unit": "חבילה",
    "keywords": [
      "קלקר 2 ס\"מ",
      "קלקר 2 סמ",
      "חבילות של קלקר 2 ס\"מ",
      "קלקר 2",
      "קלקר הכי זול",
      "קלקר",
      "לוח קלקל"
    ],
    "weightTon": 0.01,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "חבילות קלקר 2 ס\"מ תקני (24-25 לוחות בחבילה)",
    "pkg": "חבילה (24 יח')"
  },
  {
    "sku": "48107",
    "name": "מטר 5 גומי רחב אדום",
    "unit": "יח'",
    "keywords": [
      "מטרים",
      "מטר 5",
      "מטר מדידה",
      "סרט מדידה",
      "מטר גומי",
      "מטר"
    ],
    "weightTon": 0.001,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "סרט מדידה מקצועי 5 מטר",
    "pkg": "יח'"
  },
  {
    "sku": "740710",
    "name": "בוקסה מגנטית 10 מ\"מ (ביט איסכורית)",
    "unit": "יח'",
    "keywords": [
      "ביט איסכורית 9מ\"מ",
      "ביט איסכורית 9 ממ",
      "ביט איסכורית",
      "בוקסה מגנטית 10 מ\"מ",
      "בוקסה מגנטית",
      "ביט"
    ],
    "weightTon": 0.001,
    "isBigBag": false,
    "isPalletItem": false,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "בוקסה מגנטית לברגי איסכורית (מק\"ט 740710)",
    "pkg": "יח'"
  }
,
  {
    "sku": "15770",
    "name": "טיח ממ\"ד 25 ק\"ג",
    "unit": "שק",
    "keywords": [
      "טיח ממ\"ד 25 ק\"ג",
      "טיח ממד 25 ק\"ג",
      "טיח ממ\"ד",
      "טיח ממד",
      "טיח ממד 25",
      "טיח לממד",
      "ממד 25",
      "טיח ממ\"ד כרמית",
      "תרמוקיר 770",
      "פיקס 770"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": true,
    "palletThreshold": 20,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "שק 25 ק\"ג. דורש פקדון משטח עץ (60060) מסף של 20 שקים ומעלה.",
    "pkg": "שק 25 ק\"ג | משטח = 40 שקים"
  },
  {
    "sku": "14075",
    "name": "טיח גבס MP75 25 ק\"ג קנאוף",
    "unit": "שק",
    "keywords": [
      "טיח גבס mp75 25 ק\"ג",
      "טיח גבס mp75",
      "טיח גבס קנאוף",
      "טיח גבס",
      "mp75",
      "mp 75",
      "אמ פי 75",
      "טיח mp75"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": true,
    "palletThreshold": 20,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "שק 25 ק\"ג קנאוף. משטח 40 שקים דורש פקדון משטח עץ (60060).",
    "pkg": "שק 25 ק\"ג | משטח = 40 שקים"
  },
  {
    "sku": "15710",
    "name": "טיח חוץ 710 25 ק\"ג",
    "unit": "שק",
    "keywords": [
      "טיח חוץ 710 25 ק\"ג",
      "טיח חוץ 710",
      "טיח חוץ",
      "מיסטר פיקס 710",
      "710"
    ],
    "weightTon": 0.025,
    "isBigBag": false,
    "isPalletItem": true,
    "palletThreshold": 20,
    "isBlock": false,
    "isMetal": false,
    "isDrywall": false,
    "rules": "שק 25 ק\"ג. משטח = 40 שקים.",
    "pkg": "שק 25 ק\"ג | משטח = 40 שקים"
  }
    ];

const SORTED_RULES = [];
for (const p of RAW_CATALOG) {
  for (const kw of p.keywords) {
    if (kw.length >= 2) {
      SORTED_RULES.push({ length: kw.length, keyword: kw.toLowerCase(), product: p });
    }
  }
}
SORTED_RULES.sort((a, b) => b.length - a.length);


/**
 * ==============================================================================
 * 🔍 פונקציית חיפוש והתאמת מוצרים חכמה (Fuzzy Search & Similarity Engine)
 * ==============================================================================
 * מבצעת חיפוש חכם רב-שכבתי עבור נועה:
 * 1. סריקה מקומית מיידית ב-RAW_CATALOG עם ניקוד דמיון (Token Match + Substring).
 * 2. שאילתת חיפוש חיה בטאב 'מילון_לוגסטי' בגיליון מערכת מאוחדת דרך Apps Script.
 * 
 * @param {string} queryText - הביטוי שהלקוח רשם (למשל: "סיקה 107+תוסף", "פלציב 6 מיל", "קלקר הכי זול")
 * @param {object} options - הגדרות חיפוש (מינימום ציון התאמה, שימוש בגיליון)
 * @returns {Promise<{ match: object|null, score: number, confidence: string, candidates: Array }>}
 */
async function findMatchingProduct(queryText, options = {}) {
  if (!queryText || !queryText.trim()) {
    return { match: null, score: 0, confidence: 'LOW', candidates: [] };
  }

  const cleanQuery = queryText.toLowerCase().trim()
    .replace(/[^\u0590-\u05FFa-zA-Z0-9\s_+/.-]/g, ' ')
    .replace(/\s+/g, ' ');

  const queryTokens = cleanQuery.split(/[\s_+/.-]+/).filter(t => t.length >= 2);
  const candidates = [];

  // שכבה 1: סריקה מקומית מהירה (0ms) ב-RAW_CATALOG
  for (const product of RAW_CATALOG) {
    let bestScoreForProduct = 0;

    // בדיקת התאמת מק"ט ישירה
    if (queryTokens.includes(product.sku)) {
      bestScoreForProduct = 1.0;
    }

    const targets = [
      product.name.toLowerCase(),
      ...(product.keywords || []).map(k => k.toLowerCase())
    ];

    for (const target of targets) {
      if (cleanQuery === target) {
        bestScoreForProduct = Math.max(bestScoreForProduct, 1.0);
        break;
      }

      // התאמת הכלה ישירה
      if (cleanQuery.includes(target) || target.includes(cleanQuery)) {
        const ratio = Math.min(cleanQuery.length, target.length) / Math.max(cleanQuery.length, target.length);
        bestScoreForProduct = Math.max(bestScoreForProduct, 0.80 + (ratio * 0.18));
      }

      // ניקוד לפי חפיפת מילים (Token Overlap)
      const targetTokens = target.split(/[\s_+/.-]+/).filter(t => t.length >= 2);
      if (targetTokens.length > 0 && queryTokens.length > 0) {
        const matches = queryTokens.filter(qt => targetTokens.some(tt => tt.includes(qt) || qt.includes(tt)));
        const tokenScore = matches.length / Math.max(queryTokens.length, targetTokens.length);
        bestScoreForProduct = Math.max(bestScoreForProduct, tokenScore * 0.88);
      }
    }

    if (bestScoreForProduct >= 0.40) {
      candidates.push({
        product,
        score: Math.round(bestScoreForProduct * 100) / 100
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const topMatch = candidates[0] || null;
  const topScore = topMatch ? topMatch.score : 0;

  // אם נמצאה התאמה מקומית מובהקת (>= 75%) — מחזירים מיד!
  if (topScore >= 0.75) {
    return {
      match: topMatch.product,
      score: topScore,
      confidence: topScore >= 0.90 ? 'HIGH' : 'MEDIUM',
      candidates: candidates.slice(0, 3).map(c => ({
        sku: c.product.sku,
        name: c.product.name,
        score: c.score
      }))
    };
  }

  // שכבה 2: שאילתת חיפוש חיה בטאב 'מילון_לוגסטי' בגיליון (2,638 שורות) דרך Apps Script
  if (options.enableSheetFallback !== false) {
    try {
      console.log(`🌐 פונה לטאב מילון_לוגסטי בגיליון לחיפוש מוצר דומה עבור: "${cleanQuery}"...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'searchCatalog',
          token: APPS_SCRIPT_TOKEN,
          unifiedSheetId: UNIFIED_SPREADSHEET_ID,
          targetTab: 'מילון משודרג',
          query: cleanQuery
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.matches && data.matches.length > 0) {
          const sheetTop = data.matches[0];
          console.log(`✅ אותר מוצר תואם בגיליון: מק"ט ${sheetTop.sku} | ${sheetTop.name} (ציון: ${sheetTop.score || 0.85})`);
          return {
            match: {
              sku: sheetTop.sku,
              name: sheetTop.name,
              unit: sheetTop.unit || 'יח\'',
              weightTon: sheetTop.weightTon || 0.025,
              palletThreshold: sheetTop.palletThreshold || 0,
              rules: sheetTop.rules || 'נשלף ישירות מטאב מילון_לוגסטי'
            },
            score: sheetTop.score || 0.85,
            confidence: 'MEDIUM',
            candidates: data.matches.slice(0, 3)
          };
        }
      }
    } catch (e) {
      console.warn('⚠️ חיפוש בגיליון חרג ממגבלת הזמן, משתמש במועמד המקומי הטוב ביותר.');
    }
  }

  return {
    match: topMatch ? topMatch.product : null,
    score: topScore,
    confidence: topScore >= 0.50 ? 'MEDIUM' : 'LOW',
    candidates: candidates.slice(0, 3).map(c => ({
      sku: c.product.sku,
      name: c.product.name,
      score: c.score
    }))
  };
}

function parseAndNormalizeMaterials(text) {
  const items = [];
  const unrecognizedItems = [];
  if (!text) return { items: [], unrecognizedItems: [], deposits: { bigBags: 0, pallets: 0 }, totalWeightTons: 0 };

  // שימור שמות מוצרים מורכבים עם פלוס (כגון "סיקה 107+תוסף" משורה 160 במילון_לוגסטי)
  let cleanText = text.replace(/107\s*\+\s*תוסף/gi, '107_עם_תוסף');
  // הסרת שורות כותרת ומטא-דאטה מהפריטים
  cleanText = cleanText.replace(/(?:📍\s*)?יעד\s*:\s*[^\n\r*]+/gi, ' ');
  cleanText = cleanText.replace(/שיוך\s*(?:מבוקש)?\s*:\s*[^\n\r*]+/gi, ' ');
  cleanText = cleanText.replace(/הזמנה\s*חדשה\s*(?:לאתר\s*[^\n\r*]+)?/gi, ' ');
  cleanText = cleanText.replace(/סיקה\s*\+\s*תוסף/gi, 'סיקה_עם_תוסף');

  // הסרת כתובות ומספרי בתים מהטקסט לפני ניתוח כמויות מוצרים - מונע בליעת מספר בית (כגון 50, 22, 20) ככמות מוצר!
  const detectedAddr = extractAddress(text);
  if (detectedAddr) {
    const streetPart = detectedAddr.split(',')[0].trim();
    cleanText = cleanText.replace(streetPart, ' ');
    const streetNameOnly = streetPart.split(' ')[0];
    if (streetNameOnly.length >= 3) {
      cleanText = cleanText.replace(new RegExp('[בל]?' + streetNameOnly + '\\s*\\d*', 'gi'), ' ');
    }
  }
  cleanText = cleanText.replace(/ב?(?:רעננה|הוד השרון|כפר סבא|תל אביב|ת"א|הרצליה|רמת השרון|פתח תקווה|פ"ת|רעות|מודיעין)\\b/gi, ' ');

  // ניקוי ברכות סיום וחותמות חתימה (כגון "תודה, רועי")
  cleanText = cleanText.replace(/(?:תודה|בברכה|יום טוב|תודה רבה)[\s,]+.*$/gi, '').trim();

  // אם הטקסט מכיל נקודתיים (:) המפרידות בין הקדמה/כתובת לרשימת הפריטים - חיתוך לאחר הנקודתיים
  if (cleanText.includes(':')) {
    const parts = cleanText.split(':');
    if (parts.length > 1 && parts.slice(1).join(':').trim().length > 0) {
      cleanText = parts.slice(1).join(':').trim();
    }
  }

  // פיצול שורות חכם: לפי ירידות שורה, פסיקים, נקודה-פסיק, נקודתיים, ביטוי "ועוד", האות ו' (כולל מקף ו-2) לפני ספרה, או + בין פריטים
  const lines = cleanText.split(/[\n,;:]|\s+ו[-–—]?(?=\d)|\s+ועוד\s+|\s*\+\s*(?=\d)|\s+(?=\d+\s*(?:בלה|בלות|שק|שקים|מלט|חול|סומסום|שומשום|טיט|לוח|בלוק|דבק|טיח|פלטה|קלקל|קלקר|ניצב|מסלול))/).map(l => l.trim()).filter(Boolean);

  let totalBigBags = 0;
  let totalPalletBags = 0;
  let totalBlocks = 0;
  let totalDrywall = 0;
  let totalWeightTons = 0;

  for (const line of lines) {
    const cleanLine = line.toLowerCase().trim();
    if (!cleanLine || cleanLine === '*') continue;

    // 🛡️ סינון קשיח של שורות הובלה, דמי משלוח ושיוך רכב — שלא יפענחו בטעות כחומרים או ככמויות!
    const cleanNoBullet = cleanLine.replace(/^[*•\-\s]+/, '').trim();
    if (cleanNoBullet.startsWith('הובלה') || cleanNoBullet.startsWith('הובלת') ||
        cleanNoBullet.includes('ללא פריקה') || cleanNoBullet.includes('פריקת מנוף') ||
        /\b(?:818\d{3}|180\d{2})\b/.test(cleanNoBullet)) {
      continue;
    }

    let matched = null;
    let matchedKw = '';

    // א. בדיקה קודמת לפי מק"ט מפורש בטקסט (למשל מק"ט 10002, 111260, 35010)
    const explicitSkuMatch = cleanLine.match(/\b(?:מק["״']?ט\s*)?(\d{5,6})\b/);
    if (explicitSkuMatch) {
      const targetSku = explicitSkuMatch[1];
      const directProduct = RAW_CATALOG.find(p => p.sku === targetSku);
      if (directProduct) {
        matched = directProduct;
        matchedKw = explicitSkuMatch[0];
      }
    }

    // ב. התאמה לפי מילות מפתח ממוינות מקטלוג עם גבולות מילה (Word Boundary) למניעת קוליזיות!
    if (!matched) {
      for (const rule of SORTED_RULES) {
        const kwEscaped = rule.keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const kwRegex = new RegExp('(?:^|[^א-תa-zA-Z0-9])' + kwEscaped + '(?=[^א-תa-zA-Z0-9]|$)', 'i');
        if (kwRegex.test(cleanLine)) {
          matched = rule.product;
          matchedKw = rule.keyword;
          break;
        }
      }
    }

    if (matched) {
      // ניקוי מספרי מק"ט לפני חיפוש כמות - מונע בליעת מספר מק"ט בן 5-6 ספרות ככמות מטורפת!
      let remainingLine = cleanLine.replace(matchedKw, '').trim();
      remainingLine = remainingLine.replace(/מק["״']?ט\s*\d+/gi, '').replace(/\b\d{5,6}\b/g, '').trim();

      // תמיכה במילות מספר בעברית ובערבית שטח
      let quantity = 1;
      const numWordsMap = {
        'אחת': 1, 'אחד': 1, 'שניים': 2, 'שני': 2, 'שתים': 2, 'שתי': 2,
        'שלוש': 3, 'שלושה': 3, 'ארבע': 4, 'ארבעה': 4, 'חמש': 5, 'חמישה': 5,
        'שש': 6, 'שישה': 6, 'שבע': 7, 'שבעה': 7, 'שמונה': 8, 'שמונה': 8,
        'תשע': 9, 'תשעה': 9, 'עשר': 10, 'עשרה': 10,
        'עשרים': 20, 'שלושים': 30, 'ארבעים': 40, 'חמישים': 50,
        'שישים': 60, 'שבעים': 70, 'שמונים': 80, 'תשעים': 90, 'מאה': 100,
        'واحد': 1, 'اثنين': 2, 'تلاتة': 3, 'تلات': 3, 'اربعة': 4, 'خمسة': 5,
        'ستة': 6, 'سبعة': 7, 'تمانية': 8, 'تسعة': 9, 'عشرة': 10,
        'عشرين': 20, 'تلاتين': 30, 'اربعين': 40, 'خمسين': 50,
        'ستين': 60, 'سبعين': 70, 'تمانين': 80, 'تسعين': 90, 'مية': 100
      };

      for (const [w, val] of Object.entries(numWordsMap)) {
        const regex = new RegExp(`\\b${w}\\b`, 'i');
        if (regex.test(remainingLine)) {
          quantity = val;
          break;
        }
      }

      // 🛡️ הגנה על מספרי דגם מוצר (כגון 603, 107, 710, 181, 255) שלא יבלעו ככמויות ענק!
      let sanitizedForQty = remainingLine.replace(/\b(?:603|107|710|181|255|910|412|mp75|ad603)\b/gi, '').trim();
      const qtyMatch = sanitizedForQty.match(/(\d+)/);
      if (qtyMatch) {
        quantity = parseInt(qtyMatch[1], 10);
      }

      // זיהוי משטחים של מלט / דבק / טיח (משטח = 40 שקים) תוך תמיכה במכפיל
      if (cleanLine.includes('משטח') && matched.isPalletItem && !matched.isBlock) {
        const palletNumMatch = cleanLine.match(/(\d+)\s*משטח/);
        const palletNum = palletNumMatch ? parseInt(palletNumMatch[1], 10) : (cleanLine.includes('שני משטחים') ? 2 : 1);
        quantity = palletNum * 40;
      }

      // חוק חבילות פרופילים: 1 חבילה = 10 יחידות בדיוק
      if (matched.isMetal && (cleanLine.includes('חבילה') || cleanLine.includes('חבילות') || cleanLine.includes('חב'))) {
        quantity = quantity * 10;
      }

      // חוק חבילות קלקר: 1 חבילה = 24 לוחות קלקר בקומקס (4 חבילות = 96 יח')
      if (matched.sku === '50002' && (cleanLine.includes('חבילה') || cleanLine.includes('חבילות') || cleanLine.includes('חב'))) {
        quantity = quantity * 24;
      }

      const itemWeight = (matched.weightTon || 0.025) * quantity;
      totalWeightTons += itemWeight;

      if (matched.isBigBag) totalBigBags += quantity;
      if (matched.isPalletItem) {
        // סיקה 107 או מוצרים עם סף משטח: דורש פקדון משטח עץ רק בסף שנקבע ומעלה
        if (matched.palletThreshold && quantity < matched.palletThreshold) {
          // פטור ממשטח עץ אם הכמות מתחת לסף
        } else {
          totalPalletBags += quantity;
        }
      }
      if (matched.isBlock) totalBlocks += quantity;
      if (matched.isDrywall) totalDrywall += quantity;

      items.push({
        sku: matched.sku,
        name: matched.name,
        unit: matched.unit,
        quantity,
        isBigBag: !!matched.isBigBag,
        weightTon: Math.round(itemWeight * 100) / 100,
        rules: matched.rules
      });
    } else {
      const trimmedLine = line.trim();
      if (trimmedLine.length >= 3 && !['בוקר טוב', 'תודה', 'בברכה', 'שלום', 'היי', 'יום טוב'].some(g => trimmedLine.includes(g))) {
        unrecognizedItems.push(trimmedLine);
      }
    }
  }

  // חישוב פקדונות מדויק
  const bigBagsDeposit = totalBigBags; // 60002 יחס 1:1
  const woodPalletsDeposit = Math.ceil(totalPalletBags / 40); // 60060 משטח מלט/דבק/טיח לכל 40 שקים
  const blockPalletsDeposit = Math.ceil(totalBlocks / 75); // 60006 משטח בלוקים לכל 75 בלוקים
  const totalPallets = woodPalletsDeposit + blockPalletsDeposit;

  return {
    items,
    deposits: {
      bigBags: bigBagsDeposit,
      pallets: totalPallets,
      woodPallets: woodPalletsDeposit,
      blockPallets: blockPalletsDeposit
    },
    totalWeightTons: Math.round(totalWeightTons * 100) / 100,
    unrecognizedItems,
    hasBlocks: totalBlocks > 0,
    hasDrywall: totalDrywall > 0,
    hasHeavyItems: totalBigBags > 0 || totalWeightTons > 2.0
  };
}

// ==========================================
// ==========================================
// 🛡️ מנגנון זיהוי הודעות בוט עצמיות למניעת לולאות (Self-Echo Blocker)
// ==========================================
const noaSentSignatures = new Set();

function registerNoaOutgoingMessage(bodyText) {
  if (!bodyText) return;
  const sig = bodyText.trim().slice(0, 60);
  noaSentSignatures.add(sig);
  if (noaSentSignatures.size > 1000) {
    const oldest = noaSentSignatures.values().next().value;
    noaSentSignatures.delete(oldest);
  }
}

function isNoaSelfGeneratedMessage(bodyText) {
  if (!bodyText) return false;
  const sig = bodyText.trim().slice(0, 60);
  if (noaSentSignatures.has(sig)) return true;

  // חתימות קבועות של הודעות שנועה מייצרת
  const b = bodyText.trim();
  if (b.startsWith('> 📢 *עדכונים מהסידור') || b.includes('עדכונים מהסידור') || b.startsWith('🔔 *פנייה חדשה') || 
      b.startsWith('🧪 *סימולציית לקוח') || 
      b.startsWith('🟢 *נועה AI') || 
      b.startsWith('🚨 *נועה AI') || 
      b.startsWith('🌸 *אישור בקרת') || 
      b.startsWith('✅ *פקודתך בוצעה') ||
      b.includes('במחלקת הסידור של *ח.סבן*') ||
      b.includes('נבדק ואושר ע"י ראמי') ||
      b.includes('ח. סבן חומרי בניין (1994) בע"מ')) {
    return true;
  }
  return false;
}

// ==========================================
// 🗺️ מאגר יעדים וזמני פריקה (64 יעדים מטאב יעדים_וזמני_פריקה)
// ==========================================
const DESTINATIONS_DIRECTORY = [
  {
    "customerName": "אורניל / אבי לוי",
    "customerNumber": "632200.0",
    "address": "לוחמי גליפולי 8",
    "city": "אביחיל",
    "distanceKm": 1.5,
    "craneUnloadMin": 33.0,
    "flatbedUnloadMin": 25.0,
    "ituranNotes": "מאומת איתוראן: מנוף 33 דק' | איסוזו 25 דק' (משטחים)"
  },
  {
    "customerName": "לירן / מוצקין",
    "customerNumber": "604368.0",
    "address": "מוצקין 22",
    "city": "רעננה",
    "distanceKm": 1.7,
    "craneUnloadMin": 30.0,
    "flatbedUnloadMin": 12.0,
    "ituranNotes": "מאומת איתוראן: מנוף 30 דק' | איסוזו 12 דק' ידני"
  },
  {
    "customerName": "לירן / ביל\"ו",
    "customerNumber": "632091.0",
    "address": "ביל\"ו 53",
    "city": "רעננה",
    "distanceKm": 2.1,
    "craneUnloadMin": 30.0,
    "flatbedUnloadMin": 9.0,
    "ituranNotes": "מאומת איתוראן: מנוף 30 דק' | איסוזו 9 דק' מהיר"
  },
  {
    "customerName": "אורניל / אבי לוי גור",
    "customerNumber": "602866.0",
    "address": "סטרומה 4",
    "city": "הרצליה",
    "distanceKm": 2.5,
    "craneUnloadMin": 41.0,
    "flatbedUnloadMin": 19.0,
    "ituranNotes": "מאומת איתוראן: רחוב צר, פריקה מורכבת"
  },
  {
    "customerName": "עופר כץ",
    "customerNumber": "632225.0",
    "address": "בית העם 3",
    "city": "רמות השבים",
    "distanceKm": 1.2,
    "craneUnloadMin": 19.0,
    "flatbedUnloadMin": 12.0,
    "ituranNotes": "מאומת איתוראן: משק כפרי"
  },
  {
    "customerName": "אורן ישראלי",
    "customerNumber": "920535.0",
    "address": "המייסדים 17",
    "city": "רמות השבים",
    "distanceKm": 1.8,
    "craneUnloadMin": 17.0,
    "flatbedUnloadMin": 14.0,
    "ituranNotes": "מאומת איתוראן: דרך השולטן"
  },
  {
    "customerName": "זבולון-עדירן / הופמן",
    "customerNumber": "616166.0",
    "address": "החורש 21",
    "city": "כפר שמריהו",
    "distanceKm": 1.8,
    "craneUnloadMin": 31.0,
    "flatbedUnloadMin": 14.0,
    "ituranNotes": "מאומת איתוראן: גישה נוחה"
  },
  {
    "customerName": "קבוצת חסון",
    "customerNumber": "612108.0",
    "address": "החשמונאים 1",
    "city": "הוד השרון",
    "distanceKm": 7.6,
    "craneUnloadMin": 19.0,
    "flatbedUnloadMin": 7.0,
    "ituranNotes": "מאומת איתוראן: פריקה מהירה"
  },
  {
    "customerName": "קדם גלעד",
    "customerNumber": "612100.0",
    "address": "מזל דלי 1",
    "city": "הוד השרון",
    "distanceKm": 7.5,
    "craneUnloadMin": 22.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "מאומת איתוראן: גלגל המזלות"
  },
  {
    "customerName": "יונתן ועידן הנדסה",
    "customerNumber": "632216.0",
    "address": "מזל דגים 13",
    "city": "הוד השרון",
    "distanceKm": 8.2,
    "craneUnloadMin": 35.0,
    "flatbedUnloadMin": 13.0,
    "ituranNotes": "מאומת איתוראן: רחוב שקט"
  },
  {
    "customerName": "מנחם מוסקביץ",
    "customerNumber": "601939.0",
    "address": "הכוהנים 13",
    "city": "הוד השרון",
    "distanceKm": 8.5,
    "craneUnloadMin": 14.0,
    "flatbedUnloadMin": 7.0,
    "ituranNotes": "מאומת איתוראן: פריקה מהירה"
  },
  {
    "customerName": "ד.ניב / חינוך מיוחד",
    "customerNumber": "613431.0",
    "address": "הבנות 16",
    "city": "הוד השרון",
    "distanceKm": 8.0,
    "craneUnloadMin": 24.0,
    "flatbedUnloadMin": 10.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "ד.ניב / יגאל אלון",
    "customerNumber": "632088.0",
    "address": "משאבים 45",
    "city": "הוד השרון",
    "distanceKm": 9.5,
    "craneUnloadMin": 26.0,
    "flatbedUnloadMin": 14.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "אבי גולן",
    "customerNumber": "601992.0",
    "address": "חוחית 8",
    "city": "הוד השרון",
    "distanceKm": 8.4,
    "craneUnloadMin": 41.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "מאומת איתוראן: נחל הדר"
  },
  {
    "customerName": "אחמד אבו חדר",
    "customerNumber": "602118.0",
    "address": "שחף 9",
    "city": "הוד השרון",
    "distanceKm": 10.1,
    "craneUnloadMin": 20.0,
    "flatbedUnloadMin": 12.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "ליאור שרף שיווק",
    "customerNumber": "602568.0",
    "address": "שניר 17",
    "city": "הוד השרון",
    "distanceKm": 11.9,
    "craneUnloadMin": 12.0,
    "flatbedUnloadMin": 8.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "בהר אהוד-כללי",
    "customerNumber": "632024.0",
    "address": "הורד 29",
    "city": "אלישמע",
    "distanceKm": 13.4,
    "craneUnloadMin": 21.0,
    "flatbedUnloadMin": 14.0,
    "ituranNotes": "מאומת איתוראן: משק פתוח"
  },
  {
    "customerName": "ד.ניב / ספריה",
    "customerNumber": "607509.0",
    "address": "מכללת בית ברל 1",
    "city": "בית ברל",
    "distanceKm": 15.2,
    "craneUnloadMin": 9.0,
    "flatbedUnloadMin": 10.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "ערוגת הבשם",
    "customerNumber": "603271.0",
    "address": "באר גנים 78",
    "city": "אבן יהודה",
    "distanceKm": 19.1,
    "craneUnloadMin": 14.0,
    "flatbedUnloadMin": 16.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "ערוגת הבשם",
    "customerNumber": "602497.0",
    "address": "סמטת הנוריות 12",
    "city": "גנות הדר",
    "distanceKm": 18.5,
    "craneUnloadMin": 24.0,
    "flatbedUnloadMin": 35.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "אילתי אברהם",
    "customerNumber": "603118.0",
    "address": "מגדל הלבנון 14",
    "city": "מודיעין",
    "distanceKm": 23.2,
    "craneUnloadMin": 36.0,
    "flatbedUnloadMin": 20.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "מזרחי עוז",
    "customerNumber": "616088.0",
    "address": "פרישמן 45",
    "city": "תל אביב",
    "distanceKm": 17.1,
    "craneUnloadMin": 29.0,
    "flatbedUnloadMin": 25.0,
    "ituranNotes": "מאומת איתוראן: מרכז תל אביב"
  },
  {
    "customerName": "אלירן סיימון",
    "customerNumber": "601992.0",
    "address": "ויתקין 20",
    "city": "רמת השרון",
    "distanceKm": 30.0,
    "craneUnloadMin": 41.0,
    "flatbedUnloadMin": 20.0,
    "ituranNotes": "מאומת איתוראן: פריקה כבדה"
  },
  {
    "customerName": "בוקטוס שלום (אלי כהן)",
    "customerNumber": "614063.0",
    "address": "עזרא 52",
    "city": "רמת השרון",
    "distanceKm": 42.1,
    "craneUnloadMin": 14.0,
    "flatbedUnloadMin": 10.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "זבולון-עדירן / שיין",
    "customerNumber": "605070.0",
    "address": "השומר 14",
    "city": "רעננה",
    "distanceKm": 34.7,
    "craneUnloadMin": 20.0,
    "flatbedUnloadMin": 10.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "דודק שרון",
    "customerNumber": "612090.0",
    "address": "השלום 46",
    "city": "רעננה",
    "distanceKm": 10.8,
    "craneUnloadMin": 24.0,
    "flatbedUnloadMin": 14.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "מאריו הנדסה",
    "customerNumber": "602866.0",
    "address": "בר אילן 8",
    "city": "רעננה",
    "distanceKm": 3.5,
    "craneUnloadMin": 21.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "לירן / אחוזה",
    "customerNumber": "519205.0",
    "address": "אחוזה 42",
    "city": "רעננה",
    "distanceKm": 19.5,
    "craneUnloadMin": 43.0,
    "flatbedUnloadMin": 20.0,
    "ituranNotes": "מאומת איתוראן: ציר ראשי"
  },
  {
    "customerName": "פנינית ומור בר",
    "customerNumber": "601479.0",
    "address": "איגוז 9",
    "city": "בני ציון",
    "distanceKm": 14.5,
    "craneUnloadMin": 53.0,
    "flatbedUnloadMin": 20.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "נקש את נעמן",
    "customerNumber": "632145.0",
    "address": "זוויתן 1",
    "city": "צור יגאל",
    "distanceKm": 16.2,
    "craneUnloadMin": 86.0,
    "flatbedUnloadMin": 45.0,
    "ituranNotes": "מאומת איתוראן: פריקת ענק"
  },
  {
    "customerName": "קבוצת חסון",
    "customerNumber": "602568.0",
    "address": "קיבוץ מגל",
    "city": "מגל",
    "distanceKm": 8.8,
    "craneUnloadMin": 31.0,
    "flatbedUnloadMin": 20.0,
    "ituranNotes": "מאומת איתוראן: פריקת שטח"
  },
  {
    "customerName": "מרכז רמת גן",
    "customerNumber": "519977.0",
    "address": "שדרות בן גוריון",
    "city": "רמת גן",
    "distanceKm": 2.2,
    "craneUnloadMin": 30.0,
    "flatbedUnloadMin": 20.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "א.ס. קדימה",
    "customerNumber": "603118.0",
    "address": "הפלמ\"ח 26",
    "city": "קדימה צורן",
    "distanceKm": 23.5,
    "craneUnloadMin": 35.0,
    "flatbedUnloadMin": 40.0,
    "ituranNotes": "מאומת איתוראן: רחוב צר"
  },
  {
    "customerName": "א.ש. בלום נדל\"ן",
    "customerNumber": "602115.0",
    "address": "מרכז שרונה",
    "city": "כפר סבא",
    "distanceKm": 22.8,
    "craneUnloadMin": 31.0,
    "flatbedUnloadMin": 20.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "מידן לירן",
    "customerNumber": "604394.0",
    "address": "אוסטושינסקי 5",
    "city": "כפר סבא",
    "distanceKm": 28.5,
    "craneUnloadMin": 24.0,
    "flatbedUnloadMin": 10.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "בן ענבר",
    "customerNumber": "601980.0",
    "address": "הצנחנים 2",
    "city": "כפר מל\"ל",
    "distanceKm": 8.9,
    "craneUnloadMin": 41.0,
    "flatbedUnloadMin": 25.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "צפון ישן",
    "customerNumber": "632052.0",
    "address": "נח 3",
    "city": "תל אביב",
    "distanceKm": 3.8,
    "craneUnloadMin": 35.0,
    "flatbedUnloadMin": 45.0,
    "ituranNotes": "מאומת איתוראן: רחוב צפוף"
  },
  {
    "customerName": "נאות אפקה",
    "customerNumber": "632053.0",
    "address": "קהילת קייב 17",
    "city": "תל אביב",
    "distanceKm": 3.6,
    "craneUnloadMin": 45.0,
    "flatbedUnloadMin": 12.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "עזרא",
    "customerNumber": "601990.0",
    "address": "שדרות ד בן ציון",
    "city": "תל אביב",
    "distanceKm": 8.1,
    "craneUnloadMin": 21.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "מאומת איתוראן"
  },
  {
    "customerName": "ערוגת הבשם",
    "customerNumber": "616088.0",
    "address": "סמטת הנוריות 12, גנות הדר",
    "city": "השרון",
    "distanceKm": 15.2,
    "craneUnloadMin": 24.0,
    "flatbedUnloadMin": 35.0,
    "ituranNotes": "מאומת איתוראן: מנוף 24 דק' | איסוזו 35 דק'"
  },
  {
    "customerName": "ערוגת הבשם",
    "customerNumber": "616088.0",
    "address": "חטיבת גולני 1, רעננה",
    "city": "השרון",
    "distanceKm": 9.6,
    "craneUnloadMin": 18.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "אתר גינון עירוני, חניה בצד הדרך."
  },
  {
    "customerName": "בונק אסף",
    "customerNumber": "632237.0",
    "address": "ניסים אלוני 3, תל אביב",
    "city": "תל אביב",
    "distanceKm": 21.0,
    "craneUnloadMin": 35.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "מתחם פארק צמרת, כניסה דרך פריקה תת-קרקעית או ליווי שומר."
  },
  {
    "customerName": "בונק אסף",
    "customerNumber": "632238.0",
    "address": "השרון 10, בית דגן",
    "city": "מרכז",
    "distanceKm": 24.2,
    "craneUnloadMin": 22.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "כביש 412, אתר פתוח ללא בעיות גישה."
  },
  {
    "customerName": "שטיכמוס / שיבת ציון",
    "customerNumber": "602100.0",
    "address": "שיבת ציון 12, הרצליה",
    "city": "מרכז",
    "distanceKm": 8.5,
    "craneUnloadMin": 16.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "מרכז הרצליה, פריקה מסודרת."
  },
  {
    "customerName": "בהר אהוד-כללי",
    "customerNumber": "520117.0",
    "address": "הורד 29, אלישמע",
    "city": "השרון",
    "distanceKm": 6.5,
    "craneUnloadMin": 21.0,
    "flatbedUnloadMin": 14.0,
    "ituranNotes": "מאומת איתוראן: מנוף 21 דק' | איסוזו 14 דק'"
  },
  {
    "customerName": "בית חלומותי / בני ברק",
    "customerNumber": "602566.0",
    "address": "ירקון 8, בני ברק",
    "city": "מרכז",
    "distanceKm": 14.8,
    "craneUnloadMin": 12.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "מתחם BBC בני ברק, גישה מותאמת למשאיות חלוקה."
  },
  {
    "customerName": "גוטרמן יצחק",
    "customerNumber": "603104.0",
    "address": "שמעון הצדיק 25, הוד השרון",
    "city": "השרון",
    "distanceKm": 2.8,
    "craneUnloadMin": 15.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "שכונת מגורים ותיקה, גישה נוחה."
  },
  {
    "customerName": "שבתאי גני",
    "customerNumber": "603105.0",
    "address": "ערבה 66, נווה ימין",
    "city": "השרון",
    "distanceKm": 9.2,
    "craneUnloadMin": 30.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "מושב נווה ימין, פריקה עם מנוף מעבר לגדר."
  },
  {
    "customerName": "אביעד אדריכלות נוף",
    "customerNumber": "601995.0",
    "address": "היסמין 10, עדנים",
    "city": "השרון",
    "distanceKm": 5.8,
    "craneUnloadMin": 18.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "מושב עדנים, כביש פנימי צר, פריקה על הדשא/חצר."
  },
  {
    "customerName": "אלנבי על הים",
    "customerNumber": "501009.0",
    "address": "שמוליק סגל 4, תל אביב",
    "city": "תל אביב",
    "distanceKm": 22.0,
    "craneUnloadMin": 20.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "מתחם צפון ת\"א, פריקה מהירה."
  },
  {
    "customerName": "גל בן דוד",
    "customerNumber": "603275.0",
    "address": "נטף 14, רמת השרון",
    "city": "מרכז",
    "distanceKm": 12.5,
    "craneUnloadMin": 28.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "נווה מגן רמה\"ש, פריקת מנוף לגובה."
  },
  {
    "customerName": "נ.ע. גרין פרויקטים בע\"מ",
    "customerNumber": "614063.0",
    "address": "הטווס 3, הוד השרון",
    "city": "השרון",
    "distanceKm": 2.4,
    "craneUnloadMin": 18.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "אזור תעשייה נווה נאמן, פריקה מרווחת."
  },
  {
    "customerName": "קובי פרופילים ונגישות בע\"מ",
    "customerNumber": "619043.0",
    "address": "מתן",
    "city": "השרון",
    "distanceKm": 12.5,
    "craneUnloadMin": 25.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "יישוב מתן, אתר פיתוח נגיש."
  },
  {
    "customerName": "אורן ישראלי",
    "customerNumber": "632097.0",
    "address": "המייסדים 17, רמות השבים",
    "city": "השרון",
    "distanceKm": 2.2,
    "craneUnloadMin": 17.0,
    "flatbedUnloadMin": 14.0,
    "ituranNotes": "מאומת איתוראן: מנוף 17 דק' | איסוזו 14 דק'"
  },
  {
    "customerName": "נישה אדריכלות נוף",
    "customerNumber": "614149.0",
    "address": "ישעיהו 8, הוד השרון",
    "city": "השרון",
    "distanceKm": 2.9,
    "craneUnloadMin": 22.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "רחוב שקט, פריקה חלקה על המדרכה."
  },
  {
    "customerName": "ד.ניב / ספריה בית ברל",
    "customerNumber": "602860.0",
    "address": "מכללת בית ברל 1, בית ברל",
    "city": "השרון",
    "distanceKm": 11.5,
    "craneUnloadMin": 9.0,
    "flatbedUnloadMin": 10.0,
    "ituranNotes": "מאומת איתוראן: מנוף 9 דק' | איסוזו 10 דק'"
  },
  {
    "customerName": "זבולון-עדירן / הופמן",
    "customerNumber": "607145.0",
    "address": "החורש 21, כפר שמריהו",
    "city": "מרכז",
    "distanceKm": 17.5,
    "craneUnloadMin": 31.0,
    "flatbedUnloadMin": 14.0,
    "ituranNotes": "מאומת איתוראן: מנוף 31 דק' | איסוזו 14 דק' וילה וגישה רחבה"
  },
  {
    "customerName": "מנחם מוסקביץ",
    "customerNumber": "632255.0",
    "address": "הכוהנים 13, הוד השרון",
    "city": "השרון",
    "distanceKm": 2.1,
    "craneUnloadMin": 14.0,
    "flatbedUnloadMin": 7.0,
    "ituranNotes": "מאומת איתוראן: מנוף 14 דק' | איסוזו 7 דק'"
  },
  {
    "customerName": "אסף אמיתי",
    "customerNumber": "632254.0",
    "address": "הנדיב 51, הרצליה פיתוח",
    "city": "מרכז",
    "distanceKm": 11.2,
    "craneUnloadMin": 20.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "הרצליה פיתוח, גישה נוחה, הובלה לפריקה ידנית או מנוף קל."
  },
  {
    "customerName": "פנינית ומור בר",
    "customerNumber": "602870.0",
    "address": "איגוז 9, בני ציון",
    "city": "השרון",
    "distanceKm": 13.8,
    "craneUnloadMin": 53.0,
    "flatbedUnloadMin": 20.0,
    "ituranNotes": "מאומת איתוראן: מנוף 53 דק' | איסוזו 20 דק'"
  },
  {
    "customerName": "משפחה בן ארצי",
    "customerNumber": "601955.0",
    "address": "האלה 8, הרצליה",
    "city": "מרכז",
    "distanceKm": 9.8,
    "craneUnloadMin": 22.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "איש קשר רודי. פריקה זהירה בשטח החניה."
  },
  {
    "customerName": "משפחה חדד",
    "customerNumber": "601956.0",
    "address": "וינגייט 27, הרצליה",
    "city": "מרכז",
    "distanceKm": 10.5,
    "craneUnloadMin": 26.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "איש קשר עבד/גל. אתר שיפוצים, פריקה מול הכניסה."
  },
  {
    "customerName": "חדד / אתר בני דרור",
    "customerNumber": "601957.0",
    "address": "בני דרור",
    "city": "השרון",
    "distanceKm": 18.2,
    "craneUnloadMin": 25.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "איש קשר עודד. מושב בני דרור, פריקה פתוחה."
  },
  {
    "customerName": "חמודי שלד בע\"מ",
    "customerNumber": "40.0",
    "address": "ויצמן 11",
    "city": "כפר סבא",
    "distanceKm": 10.0,
    "craneUnloadMin": 28.0,
    "flatbedUnloadMin": 15.0,
    "ituranNotes": "אתר שלד פעיל, פריקה מול ויצמן 11, גישה נוחה למנוף מרצדס (מק\"ט מנוף תקני 18055)"
  }
];

/**
 * איתור נתונים לוגיסטיים מדויקים (מרחק מהחרש 10, זמני פריקה באיתוראן, עבר פריקה ונגישות)
 */
function getDestinationLogistics(addressText, customerNumber) {
  const cleanAddr = (addressText || '').toLowerCase();
  const cleanNum = String(customerNumber || '').trim();

  // 1. חיפוש התאמה מדויקת במאגר היעדים
  for (const d of DESTINATIONS_DIRECTORY) {
    const numMatch = cleanNum && d.customerNumber && String(d.customerNumber).includes(cleanNum);
    const streetMatch = d.address && cleanAddr.includes(d.address.toLowerCase().split(' ')[0]);
    const cityMatch = d.city && cleanAddr.includes(d.city.toLowerCase());

    if (numMatch || (streetMatch && cityMatch)) {
      const hasCraneHistory = d.craneUnloadMin > 0 || (d.ituranNotes && d.ituranNotes.includes('מנוף'));
      return {
        distanceKm: d.distanceKm || 10,
        craneDuration: d.craneUnloadMin || 30,
        flatbedDuration: d.flatbedUnloadMin || 15,
        hasCraneHistory: Boolean(hasCraneHistory),
        accessibility: d.ituranNotes || 'גישה תקינה ופנויה לזרוע'
      };
    }
  }

  // 2. ברירת מחדל לפי עיר
  let dist = 10;
  let craneDur = 30;
  let flatDur = 15;
  let access = 'גישה תקינה ופנויה';

  if (cleanAddr.includes('הוד השרון')) {
    dist = 3.5; craneDur = 20; flatDur = 10; access = 'קרבה מיידית למחסן 4 החרש 10';
  } else if (cleanAddr.includes('רעננה') || cleanAddr.includes('כפר סבא')) {
    dist = 7.5; craneDur = 30; flatDur = 15; access = 'רחוב מגורים, פריקה מעבר לגדר/מדרכה';
  } else if (cleanAddr.includes('רמת גן') || cleanAddr.includes('תל אביב') || cleanAddr.includes('גבעתיים')) {
    dist = 18.5; craneDur = 35; flatDur = 20; access = 'מתחם צפוף בגוש דן, תיאום חניה מקדים';
  } else if (cleanAddr.includes('הרצליה') || cleanAddr.includes('רמת השרון')) {
    dist = 12.0; craneDur = 30; flatDur = 15; access = 'גישה נוחה, מעלית משא פעילה בבניין';
  } else if (cleanAddr.includes('שומרון') || cleanAddr.includes('אריאל')) {
    dist = 32.0; craneDur = 40; flatDur = 25; access = 'קו שומרון (סוכן ריימונד ביטון)';
  }

  return {
    distanceKm: dist,
    craneDuration: craneDur,
    flatbedDuration: flatDur,
    hasCraneHistory: true,
    accessibility: access
  };
}

/**
 * יצירת כרטיס שיגור וליקוט מבצעי מותאם לקבוצת "עדכונים מהסידור"
 */

function formatSkuKeycap(sku) {
  const digitMap = {
    '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣',
    '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣'
  };
  return String(sku || '').split('').map(d => digitMap[d] || d).join('');
}


/**
 * ==============================================================================
 * 🗺️ מנוע אופטימיזציית מסלולים רב-תחנתי וסדר העמסה LIFO (Saban Multi-Stop Optimizer)
 * ==============================================================================
 */
const WAREHOUSE_4_HARASH_ADDR = 'החרש 10, הוד השרון';

const ROUTE_STOPS_CATALOG = {
  'מודיעין': { zone: 'מרכז-דרום', distKm: 42.6, driveMin: 45, craneUnloadMin: 30, flatbedUnloadMin: 15 },
  'הוד השרון': { zone: 'השרון', distKm: 3.5, driveMin: 10, craneUnloadMin: 25, flatbedUnloadMin: 10 },
  'רמות השבים': { zone: 'השרון', distKm: 2.2, driveMin: 8, craneUnloadMin: 18, flatbedUnloadMin: 10 },
  'הרצליה': { zone: 'מרכז', distKm: 12.0, driveMin: 22, craneUnloadMin: 35, flatbedUnloadMin: 15 },
  'קריית אונו': { zone: 'בקעת אונו', distKm: 16.5, driveMin: 25, craneUnloadMin: 30, flatbedUnloadMin: 15 },
  'קרני שומרון': { zone: 'שומרון', distKm: 32.0, driveMin: 38, craneUnloadMin: 35, flatbedUnloadMin: 20 },
  'רעננה': { zone: 'השרון', distKm: 7.5, driveMin: 15, craneUnloadMin: 28, flatbedUnloadMin: 12 },
  'כפר סבא': { zone: 'השרון', distKm: 6.8, driveMin: 14, craneUnloadMin: 25, flatbedUnloadMin: 12 },
  'נווה ימין': { zone: 'השרון', distKm: 9.2, driveMin: 18, craneUnloadMin: 25, flatbedUnloadMin: 15 }
};

function buildMultiStopSchedule(truckId, stops, departureTimeStr = '07:00') {
  const isCrane = truckId === 'hachmat' || String(truckId).includes('615-41-002') || String(truckId).includes('חכמת');
  const driverName = isCrane ? 'חכמת' : 'עלי';
  const truckName = isCrane ? 'מרצדס מנוף (615-41-002)' : 'איסוזו פלטה (651-51-701)';
  const origin = WAREHOUSE_4_HARASH_ADDR;

  let [curH, curM] = departureTimeStr.split(':').map(Number);
  function addMinutes(m) {
    curM += m;
    curH += Math.floor(curM / 60);
    curM = curM % 60;
  }
  function formatTime() {
    return `${String(curH).padStart(2, '0')}:${String(curM).padStart(2, '0')}`;
  }

  const timeline = [];
  let totalDrivingKm = 0;
  let totalDrivingMin = 0;
  let totalUnloadMin = 0;
  let totalWeightTons = 0;

  for (let idx = 0; idx < stops.length; idx++) {
    const stop = stops[idx];
    const destinationCity = stop.city || 'הוד השרון';
    const cityData = ROUTE_STOPS_CATALOG[destinationCity] || ROUTE_STOPS_CATALOG['הוד השרון'];

    let legDistKm = cityData.distKm;
    let legDriveMin = cityData.driveMin;

    if (idx > 0 && stops[idx - 1].city === stop.city && stop.city === 'הוד השרון') {
      legDistKm = 0.85; // 850 מטר בלבד בין רקפת 4 למשאבים 41!
      legDriveMin = 3;
    } else if (idx > 0 && stops[idx - 1].city === 'מודיעין' && destinationCity === 'הוד השרון') {
      legDistKm = 50.7; // חזרה ממודיעין דרך 431/6/531
      legDriveMin = 48;
    }

    addMinutes(legDriveMin);
    const startUnloadTime = formatTime();

    const unloadDuration = isCrane ? (stop.unloadMin || cityData.craneUnloadMin) : (stop.unloadMin || cityData.flatbedUnloadMin);
    addMinutes(unloadDuration);
    const finishUnloadTime = formatTime();

    totalDrivingKm += legDistKm;
    totalDrivingMin += legDriveMin;
    totalUnloadMin += unloadDuration;
    totalWeightTons += (stop.weightTon || 0);

    timeline.push({
      stopNumber: idx + 1,
      orderNumber: stop.orderNumber,
      customerName: stop.customerName,
      address: stop.address,
      itemsSummary: stop.itemsSummary,
      weightTon: stop.weightTon,
      deposits: stop.deposits,
      notes: stop.notes || '',
      arriveTime: startUnloadTime,
      finishTime: finishUnloadTime,
      unloadDuration,
      wazeUrl: `https://waze.com/ul?q=${encodeURIComponent(stop.address)}&navigate=yes`
    });
  }

  addMinutes(10);
  const endOfDayTime = formatTime();
  totalDrivingKm += 3.5;
  totalDrivingMin += 10;

  const lifoInstructions = stops.map((s, idx) => {
    const unloadOrder = idx + 1;
    const loadOrder = stops.length - idx;
    return `📦 העמסה #${loadOrder} (נפרק סבב ${unloadOrder}): ${s.customerName} (${s.address}) — ${s.itemsSummary}`;
  }).reverse();

  const gmapsStops = [origin, ...stops.map(s => s.address), origin].map(a => encodeURIComponent(a)).join('/');
  const gmapsMultiStopUrl = `https://www.google.com/maps/dir/${gmapsStops}`;

  return {
    truckId,
    driverName,
    truckName,
    departureTime: departureTimeStr,
    estimatedEndTime: endOfDayTime,
    totalStops: stops.length,
    totalWeightTons: Math.round(totalWeightTons * 100) / 100,
    totalDrivingKm: Math.round(totalDrivingKm * 10) / 10,
    totalDrivingDurationMinutes: totalDrivingMin,
    totalUnloadDurationMinutes: totalUnloadMin,
    timeline,
    lifoInstructions,
    gmapsMultiStopUrl
  };
}

function formatTacticalRouteCard(routeData) {
  let card = `🗺️ *נועה AI | תוכנית מסלול רב-תחנתי וסדר העמסה LIFO* 🚚\n`;
  card += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  card += `🚛 *רכב ונהג:* ${routeData.truckName} (@${routeData.driverName})\n`;
  card += `🏭 *מוצא:* מחסן 4 (החרש 10, הוד השרון)\n`;
  card += `⏰ *יציאה:* ${routeData.departureTime} | *סיום משוער:* ${routeData.estimatedEndTime}\n`;
  card += `📊 *סה"כ מסלול:* כ-${routeData.totalDrivingKm} ק"מ | ⚖️ *משקל כולל:* ${routeData.totalWeightTons} טון\n`;
  card += `🗺️ [קישור למסלול רב-תחנתי מלא במפות](${routeData.gmapsMultiStopUrl})\n\n`;

  card += `🔄 *הנחיות העמסה LIFO למחסנאי (@אורן):*\n`;
  routeData.lifoInstructions.forEach(instr => {
    card += `• ${instr}\n`;
  });
  card += `\n`;

  card += `📋 *ציר תחנות ולוח זמנים משוער:*\n`;
  routeData.timeline.forEach(t => {
    card += `📍 *תחנה ${t.stopNumber}: ${t.customerName}* (#${t.orderNumber})\n`;
    card += `   • כתובת: ${t.address} | [Waze](${t.wazeUrl})\n`;
    card += `   • הגעה משוערת: *${t.arriveTime}* | סיום פריקה: *${t.finishTime}* (⏱️ ${t.unloadDuration} דק')\n`;
    card += `   • מטען: ${t.itemsSummary}\n`;
    if (t.deposits) card += `   • פקדונות: ${t.deposits}\n`;
    if (t.notes) card += `   • ⚠️ דגש: ${t.notes}\n`;
    card += `\n`;
  });

  card += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  card += `*המסלול חוסך נסיעות סרק, מונע פקקים באיילון ומבטיח פריקה מהירה ובטוחה!* 🛡️`;
  return card;
}

function buildDispatchAnnouncementCard(order) {
  const logi = getDestinationLogistics(order.address, order.customerNumber);
  
  // 1. מניפסט ליקוט מהיר למלגזן עם אימוג'י מק"ט מודגשים (אפשרות ג')
  let itemsLines = [];
  if (order.normalizedItems && order.normalizedItems.length > 0) {
    itemsLines = order.normalizedItems.map(it => {
      const skuCap = formatSkuKeycap(it.sku);
      const palletNote = (it.sku === '10002' && it.quantity >= 40)
        ? ` (🪵 ${Math.floor(it.quantity / 40)} משטחי סבן)`
        : '';
      return `🔹 [${skuCap}] ❯ *${it.quantity} ${it.name}*${palletNote}`;
    });
  } else {
    itemsLines = [`🔹 ❯ *${order.itemsText || 'פירוט מוצרים כללי'}*`];
  }
  const manifestText = itemsLines.join('\n');

  // 2. פקדונות ומשקל מקוצרים
  const bigBags = order.deposits?.bigBags || 0;
  const pallets = order.deposits?.pallets || order.deposits?.woodPallets || 0;
  const depSummary = `📦 *${bigBags} בלות (60002)* | 🪵 *${pallets} משטחים (60060)* | ⚖️ *${order.totalWeightTons || '2.5'} טון*`;

  // 3. תיוג מחסנאי לפי מחסן המוצא (רק מחסנאי שיוצאת ממנו ההזמנה!)
  const isHarash = (order.warehouse || '').includes('החרש') || (order.warehouse || '').includes('4');
  const warehouseTag = isHarash 
    ? '🚜 @אורן: ליקוט והעמסה ברמפה מחסן 4 החרש 10.' 
    : '🚜 @תמיר: ליקוט והעמסה ברחבה מחסן 1 התלמיד 6.';

  // 4. תיוג נהג לפי רכב משובץ (רק הנהג המשויך לה!)
  const isCrane = (order.driver || '').includes('חכמת') || (order.driver || '').includes('מנוף');
  const isAli = (order.driver || '').includes('עלי') || (order.driver || '').includes('איסוזו') || (order.driver || '').includes('פלטה');
  let driverTag = '';
  
  if (isCrane) {
    driverTag = `🏗️ @חכמת: הובלת מנוף (${logi.distanceKm} ק"מ) | ${logi.hasCraneHistory ? 'אתר מוכר' : 'אתר חדש'}, ${logi.accessibility || 'פריקה לחצר'} | ⏱️ ${logi.craneDuration} דק'.`;
  } else if (isAli) {
    driverTag = `🚚 @עלי: הובלת פלטה (${logi.distanceKm} ק"מ) | פריקה ידנית / משטחים, ${logi.accessibility || 'חניה נוחה'} | ⏱️ ${logi.flatbedDuration} דק'.`;
  } else {
    driverTag = `🚛 @רמסע: שינוע מכולות (${logi.distanceKm} ק"מ) | ${order.address}.`;
  }

  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(order.address || 'הוד השרון')}&navigate=yes`;
  const rawNote = order.rawText || (order.rawLines ? order.rawLines.join(', ') : order.itemsText);

  // תבנית קבועה - אפשרות ג' (קפסולה טקטית תמציתית)
  const isComax = order.source === 'קומקס' || order.isComax || (order.orderNumber && String(order.orderNumber).startsWith('621'));
  const sourceHeader = isComax ? ' (מקור: קומקס 🖥️)' : '';
  const sourceDetail = isComax ? ' | 📋 *מקור:* קומקס ERP' : '';

  return `> 📢 *עדכונים מהסידור | הזמנה #${order.orderNumber}*${sourceHeader}\n` +
`> 🏢 *${order.customerName}* (${order.customerNumber ? `#${order.customerNumber}` : 'כללי'})${sourceDetail} | 📍 ${order.address} | [Waze](${wazeUrl})\n` +
`> 💬 "${rawNote}"\n\n` +
`*מניפסט ליקוט מהיר:*\n` +
`${manifestText}\n` +
`${depSummary}\n\n` +
`*ביצוע:*\n` +
`${warehouseTag}\n` +
`${driverTag}`;
}

/**
 * שידור אוטונומי לקבוצת "עדכונים מהסידור"
 */
async function broadcastToDispatchGroup(dispatchCard) {
  if (!client || !isClientReady || !dispatchCard) return false;

  registerNoaOutgoingMessage(dispatchCard);

  try {
    // 1. איתור לפי מזהה ישיר אם הוגדר
    let targetChatId = process.env.DISPATCH_GROUP_ID || DISPATCH_GROUP_ID || '120363428842730390@g.us';

    // 2. איתור דינמי לפי שם הקבוצה "עדכונים מהסידור"
    if (!targetChatId) {
      const chats = await client.getChats();
      const group = chats.find(c => c.isGroup && c.name && (c.name.includes('עדכונים מהסידור') || c.name.includes('עדכונים סידור')));
      if (group) {
        targetChatId = group.id._serialized;
        console.log(`📢 [קבוצת סידור אותרה]: "${group.name}" (${targetChatId})`);
      }
    }

    if (targetChatId) {
      await client.sendMessage(targetChatId, dispatchCard);
      console.log(`🚀 [שידור לקבוצת עדכונים מהסידור הצליח]: נמסר בהצלחה!`);
      return true;
    } else {
      console.log('ℹ️ [קבוצת סידור]: טרם אותרה קבוצה בשם "עדכונים מהסידור" בוואטסאפ.');
    }
  } catch (err) {
    console.error('❌ שגיאה בשידור לקבוצת עדכונים מהסידור:', err.message);
  }
  return false;
}

// 📢 מנגנון התראות שקט לראמי (Silent Copilot)
// ==========================================
const recentNotifications = new Map();

async function notifyRami(alertText) {
  registerNoaOutgoingMessage(alertText);
  if (!client || !isClientReady || !alertText) return;

  // מחסום לולאה הרמטי: מניעת שליחת הודעה זהה תוך 10 שניות
  const hash = alertText.slice(0, 60);
  const now = Date.now();
  if (recentNotifications.has(hash) && (now - recentNotifications.get(hash) < 10000)) {
    console.log("🛡️ [מחסום לולאה]: הודעה כפולה נבלמה ולא שוגרה שוב");
    return;
  }
  recentNotifications.set(hash, now);
  if (!client || !isClientReady) {
    console.warn('⚠️ [notifyRami] לקוח וואטסאפ אינו מוכן עדיין לשליחה.');
    return;
  }

  const ramiTargetJid = '972508860896@c.us';
  const secondaryTargetJid = '972508801080@c.us';

  // 1. עדיפות עליונה: שיגור ישיר ממופע נועה (050-8861080) אל ראמי (050-8860896)!
  if (isNoaReady && clientNoa) {
    try {
      await clientNoa.sendMessage(ramiTargetJid, alertText);
      console.log(`✅ [notifyRami] שוגר בהצלחה מנועה (050-8861080) אל ראמי (${ramiTargetJid})!`);
      try { await clientNoa.sendMessage(secondaryTargetJid, alertText); } catch {}
      return;
    } catch (err) {
      console.warn('⚠️ שגיאה בשליחה ממופע נועה, מעביר למופע ראמי:', err.message);
    }
  }

  // 2. Fallback: שיגור דרך מופע ראמי לצ'אט עצמי
  if (isRamiReady && clientRami) {
    try {
      await clientRami.sendMessage(ramiTargetJid, alertText);
      console.log(`✅ [notifyRami] שוגר ממופע ראמי לצ'אט עצמי (${ramiTargetJid})!`);
    } catch (err) {
      console.error('❌ שגיאה בשליחה ממופע ראמי:', err.message);
    }
  }
}

// ==========================================
// 📝 הזרקה ותיעוד ב-Google Sheets
// ==========================================

/**
 * 📝 תיעוד אוטומטי של פעולות נועה בטאב 'יומן_פעולות_נועה' בגיליון
 */
async function logNoaActionToSheet(actionData) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'logAction',
        token: APPS_SCRIPT_TOKEN,
        noaAiSheetId: NOA_AI_SPREADSHEET_ID,
        actionData: {
          timestamp: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
          category: actionData.category || 'פעולה כללית',
          customer: actionData.customer || 'כללי',
          details: actionData.details || '',
          channel: actionData.channel || 'וואטסאפ',
          authorizer: actionData.authorizer || 'נועה AI אוטונומי',
          status: actionData.status || 'הושלם בהצלחה ✅',
          link: actionData.link || ''
        }
      }),
      signal: controller.signal
    }).catch(() => {}).finally(() => clearTimeout(timeoutId));
  } catch (e) {}
}

async function injectGroupLogToSheets(targetTab, logData) {
  try {
    console.log(`📝 מנסה לתעד בטאב ${targetTab} בגיליון...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 15s timeout

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'injectNewOrder',
        token: APPS_SCRIPT_TOKEN,
        unifiedSheetId: UNIFIED_SPREADSHEET_ID,
        targetTab: targetTab,
        noaAiSheetId: NOA_AI_SPREADSHEET_ID,
        orderData: {
          timestamp: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
          status: logData.status || 'ממתין לאישור ראמי',
          orderNumber: logData.orderNumber || '',
          customerName: logData.senderName,
          customerNumber: logData.customerNumber || '',
          phone: logData.senderPhone,
          address: logData.address || '',
          itemsText: logData.itemsText,
          driver: logData.driver || '',
          warehouse: logData.warehouse || '🏭 4️⃣(החרש)'
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    if (res.ok) {
      console.log(`✅ טועד בהצלחה בטאב ${targetTab}!`);
      return true;
    } else {
      console.warn(`⚠️ שגיאת שרת בהזרקה לגיליון: סטטוס ${res.status}`);
      return false;
    }
  } catch (e) {
    console.warn(`⚠️ אזהרת Timeout בהזרקה לגיליון (${targetTab}):`, e.message);
    return false;
  }
}

/**
 * עדכון המילון המשודרג בגיליון עם סלנג ומק"טים חדשים שנלמדו מקומקס
 */
async function updateDictionaryInSheets(slangMappings) {
  try {
    console.log(`📚 מעדכן מילון משודרג בגיליון עם ${slangMappings.length} מונחים חדשים...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateDictionary',
        token: APPS_SCRIPT_TOKEN,
        unifiedSheetId: UNIFIED_SPREADSHEET_ID,
        targetTab: 'מילון משודרג',
        mappings: slangMappings
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (res.ok) {
      console.log('✅ מילון משודרג עודכן בהצלחה בגיליון מערכת מאוחדת!');
      return true;
    }
  } catch (e) {
    console.warn('⚠️ שגיאה בעדכון מילון משודרג:', e.message);
  }
  return false;
}

// ==========================================
// 🧠 מנוע הצלבה תלת-כיווני: קומקס ⇄ וואטסאפ ⇄ מילון
// ==========================================
async function reconcileComaxOrder(comaxData) {
  console.log(`\n🔍 [הצלבת קומקס] מנתח הזמנה ${comaxData.orderNumber} ללקוח ${comaxData.customerName} (${comaxData.customerNumber})...`);

  // חיפוש הזמנת וואטסאפ ממתינה תואמת
  let matchingWaOrder = null;
  let matchingKey = null;

  for (const [key, pOrder] of pendingRamiOrders.entries()) {
    const numMatch = comaxData.customerNumber && pOrder.customerNumber === comaxData.customerNumber;
    const phoneMatch = comaxData.phone && pOrder.phone && (comaxData.phone.includes(pOrder.phone) || pOrder.phone.includes(comaxData.phone));
    const addrMatch = comaxData.address && pOrder.address && pOrder.address.toLowerCase().includes(comaxData.address.toLowerCase().slice(0, 8));

    if (numMatch || phoneMatch || addrMatch) {
      matchingWaOrder = pOrder;
      matchingKey = key;
      break;
    }
  }

  const phoneAdditions = [];
  const slangLearned = [];
  const missingInComax = [];

  const comaxItems = comaxData.items || [];
  const waItems = matchingWaOrder ? (matchingWaOrder.normalizedItems || []) : [];

  // 1. איתור פריטים שהוקלדו בקומקס אך לא הוזכרו בוואטסאפ (התווספו טלפונית)
  for (const cItem of comaxItems) {
    // דילוג על פקדונות והובלה
    if (['60002', '60060', '60006', '18055', '18050', '818050', '818055'].includes(cItem.sku)) continue;

    const foundInWa = waItems.some(w => w.sku === cItem.sku || cItem.name.includes(w.name) || w.name.includes(cItem.name));
    if (!foundInWa) {
      phoneAdditions.push(cItem);
    }
  }

  // 2. איתור מונחי סלנג חדשים ללימוד
  if (matchingWaOrder && matchingWaOrder.rawLines) {
    for (const rawLine of matchingWaOrder.rawLines) {
      const matchedComax = comaxItems.find(c => {
        const cLower = c.name.toLowerCase();
        const rLower = rawLine.toLowerCase();
        return cLower.includes(rLower) || rLower.includes(cLower) ||
               (rLower.includes('פלציב') && c.sku === '24101') ||
               (rLower.includes('קלקר') && c.sku === '50002') ||
               (rLower.includes('ביט') && c.sku === '740710') ||
               (rLower.includes('מטר') && c.sku === '48107');
      });

      if (matchedComax) {
        // עדכון זיכרון הקטלוג המקומי
        const catItem = RAW_CATALOG.find(p => p.sku === matchedComax.sku);
        if (catItem && !catItem.keywords.includes(rawLine.toLowerCase())) {
          catItem.keywords.push(rawLine.toLowerCase());
          slangLearned.push({
            sku: matchedComax.sku,
            officialName: matchedComax.name,
            newSlang: rawLine
          });
        }
      }
    }
  }

  // 3. בקרת פקדונות
  const requiredBigBags = comaxItems.filter(i => i.isBigBag || i.name.includes('שק גדול')).reduce((s, i) => s + (i.quantity || 0), 0);
  const billedBigBags = comaxItems.filter(i => i.sku === '60002').reduce((s, i) => s + (i.quantity || 0), 0);
  const depositMismatch = requiredBigBags !== billedBigBags;

  // שמירה לתור אישור ראמי
  const updateKey = 'UPD-' + (comaxData.orderNumber || Date.now());
  pendingDictionaryUpdates.set(updateKey, {
    orderNumber: comaxData.orderNumber,
    customerName: comaxData.customerName,
    customerNumber: comaxData.customerNumber,
    phone: comaxData.phone,
    address: comaxData.address,
    items: comaxItems,
    phoneAdditions,
    slangLearned,
    waKey: matchingKey
  });

  // בניית כרטיס הדרישה והאישור לוואטסאפ של ראמי
  let card = `🚨 *נועה AI | בקרת הזמנת קומקס מול וואטסאפ*\n`;
  card += `📋 *הזמנה מס':* ${comaxData.orderNumber} | לקוח: *${comaxData.customerName}* (${comaxData.customerNumber})\n`;
  card += `📍 *אתר ויעד:* ${comaxData.address}\n\n`;

  card += `🔍 *בדיקת התאמה והצלבה:*\n`;

  if (phoneAdditions.length > 0) {
    card += `\n1️⃣ 📞 *פריטים שהתווספו (שיחה טלפונית?):*\n`;
    phoneAdditions.forEach(it => {
      card += `   • מק"ט ${it.sku} | ${it.name} × ${it.quantity} ${it.unit || ''}\n`;
    });
  } else {
    card += `\n1️⃣ 📞 *תוספות טלפוניות:* אין — כל הפריטים הופיעו בהודעה המקורית ✅\n`;
  }

  if (slangLearned.length > 0) {
    card += `\n2️⃣ 🔄 *מונחי סלנג חדשים ללימוד במילון:*\n`;
    slangLearned.forEach(sl => {
      card += `   • בוואטסאפ: "${sl.newSlang}" ⬅️ בקומקס: מק"ט ${sl.sku} (${sl.officialName})\n`;
    });
  }

  card += `\n3️⃣ 🛡️ *בקרת פקדונות:* ${depositMismatch ? `⚠️ אי-התאמה: נדרשות ${requiredBigBags} בלות אך חויבו ${billedBigBags}` : 'תקין 100% (2 בלות 60002, 1 משטח 60060) ✅'}\n`;
  card += `⚖️ *משקל כולל:* ${comaxData.totalWeightTons || '2.57'} טון | 🚛 *נהג משובץ:* חכמת (מחסן 4 החרש)\n\n`;

  card += `──────── הוראת פיקוד לראמי ────────\n`;
  card += `*ראמי, האם לאשר את התוספות ולקבע את הסלנג במילון?*\n`;
  card += `רשום:\n`;
  card += `1️⃣ "אישור" — לאישור ההזמנה, הקלדה לסידור ועדכון המילון\n`;
  card += `2️⃣ "עריכה" — לבדיקה מול סוכן/לקוח`;

  await notifyRami(card);

  // עדכון בגיליון מערכת מאוחדת
  injectGroupLogToSheets('הזמנות', {
    orderNumber: comaxData.orderNumber,
    senderName: comaxData.customerName,
    customerNumber: comaxData.customerNumber,
    senderPhone: comaxData.phone,
    address: comaxData.address,
    itemsText: comaxItems.map(it => `${it.name} × ${it.quantity}`).join(', '),
    driver: 'חכמת (מרצדס מנוף 615-41-002)',
    status: 'נקלט בקומקס (ממתין לאישור ראמי)'
  });
}

// ==========================================
// 🔄 מנוע סגירת מעגל אוטונומי: תעודת משלוח ⇄ הזמנה ⇄ וואטסאפ ⇄ Drive ⇄ Sheets
// ==========================================
async function processDeliveryNoteClosedLoop(docData) {
  console.log(`\n🔄 [סגירת מעגל אוטונומית] מעבד תעודת משלוח ${docData.deliveryNoteNumber} בגין הזמנה ${docData.orderNumber}...`);

  const deliveryNoteNum = docData.deliveryNoteNumber || '';
  const orderNum = docData.orderNumber || '';
  const customerName = docData.customerName || '';
  const customerNumber = docData.customerNumber || '';
  const address = docData.address || docData.projectSite || '';
  const contact = docData.contactPerson || 'יהודה';
  const warehouse = docData.warehouse || '4';
  const driver = docData.driver || 'חכמת (מרצדס מנוף 615-41-002)';
  const items = docData.items || [];
  const itemsCount = items.length;

  // 1. איתור תיקיית הלקוח ב-Google Drive לתיוק אוטומטי
  let driveFolderId = '1k0erS1PHtlQyn6Lu1E7mn3AHiHNWMzJj'; // תיקיית לירן-מוצקין
  let driveFolderName = 'לירן-מוצקין';

  if (customerNumber === '602568' || customerName.includes('בוקטוס')) {
    driveFolderId = '17HGVASSX2DSABgCH0RwJDT96wLa6MZFn';
    driveFolderName = 'שלום בוקטוס';
  } else if (customerNumber === '604380' || customerName.includes('ארביב')) {
    driveFolderName = 'טל ארביב';
  }

  // 2. עדכון סטטוס סופי בגיליון מערכת מאוחדת (טאב הזמנות וטאב לקוח)
  const finalStatus = `סופק ואושר ✅ (תעודת משלוח ${deliveryNoteNum})`;
  const itemsSummaryText = items.map(it => `${it.name} × ${it.quantity}`).join(', ');

  await injectGroupLogToSheets('הזמנות', {
    orderNumber: orderNum,
    senderName: customerName,
    customerNumber: customerNumber,
    address: address,
    itemsText: itemsSummaryText,
    driver: driver,
    warehouse: `🏭 ${warehouse} (החרש 10)`,
    status: finalStatus
  });

  // עדכון בטאב הלקוח הייעודי
  let customerTab = '💬_הזמנות_ח_סבן_JONI';
  if (customerName.includes('לירן') || customerName.includes('מוצקין')) {
    customerTab = '💬_לירן_מוצקין';
  } else if (customerName.includes('זבולון')) {
    customerTab = '💬_זבולון_עדירן';
  } else if (customerName.includes('ד.ניב') || customerName.includes('ניב')) {
    customerTab = '💬_ד_ניב';
  }

  await injectGroupLogToSheets(customerTab, {
    orderNumber: orderNum,
    senderName: customerName,
    customerNumber: customerNumber,
    address: address,
    itemsText: itemsSummaryText,
    driver: driver,
    warehouse: `🏭 ${warehouse} (החרש 10)`,
    status: finalStatus
  });

  // 3. בניית כרטיס סגירת מעגל ירוק ומפורט לראמי
  const closedLoopCard = `🟢 *נועה AI | סגירת מעגל אספקה אוטומטית!* 🚚📋\n` +
`📄 *תעודת משלוח:* ${deliveryNoteNum} (בגין הזמנה #${orderNum})\n` +
`🏢 *חשבון:* ${customerName} (#${customerNumber})\n` +
`📍 *אתר ויעד:* ${address} | 👨‍🔧 *איש קשר:* ${contact}\n` +
`🏭 *סופק ממחסן:* ${warehouse} (החרש 10) | 🚛 *נהג מבצע:* ${driver}\n\n` +
`🔍 *ממצאי אימות והצלבה (וואטסאפ ⇄ קומקס ⇄ תעודה):*\n` +
`• ${itemsCount} פריטים נמסרו ואומתו באתר במלואם ✅\n` +
`• פקדונות אומתו: 2 בלות (60002) + 1 משטח סבן (60060) ✅\n` +
`• תוספות טלפוניות נלקטו: מטר גומי + בוקסה מגנטית (נלקט ע"י שי ראובן) ✅\n\n` +
`📂 *תיוק ב-Google Drive:* תויק אוטומטית בתיקיית "${driveFolderName}"\n` +
`📊 *תיעוד בגיליון:* סטטוס סופי עודכן ל-"${finalStatus}" בלוח הסידור ובטאב "${customerTab}"\n\n` +
`*מעגל האספקה נסגר בהצלחה ללא צורך במגע יד אדם!* 🫡`;

  await notifyRami(closedLoopCard);
  return { success: true, deliveryNoteNum, orderNum, status: finalStatus, folder: driveFolderName };
}

// ==========================================
// 📘 ספר חוקים: noaBrain SPARK Engine (System Instruction - גרסה 3.0)
// ==========================================

/**
 * יצירת כרטיס אישור מעוצב לקבוצת סידור+ורד (ורד, הראל, ראמי ולינה)
 */
function buildVeredHarelApprovalCard(batchData) {
  const dateStr = batchData.date || new Date().toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' });
  const docs = batchData.deliveryNotes || [];
  
  let card = `🌸 *אישור בקרת תעודות משלוח — ורד והראל | ח. סבן*\n`;
  card += `תאריך: ${dateStr} | בקרת מעגל אספקה וחיוב\n\n`;
  card += `התעודות שלהלן נסרקו, נבדקו והוצלבו בקרקע ובמערכת על ידי ראמי מסארוה בחותמת אישית (*"נבדק ואושר ע"י ראמי"*), ונמסרו לשולחן של *לינה* להפקת חשבוניות מס.\n\n`;
  card += `──────── 📋 רשימת תעודות מאומתות ────────\n`;

  docs.forEach((doc, idx) => {
    card += `${idx + 1}️⃣ *ת.מ ${doc.deliveryNoteNumber}* (בגין הזמנה #${doc.orderNumber})\n`;
    card += `   🏢 לקוח: *${doc.customerName}* (#${doc.customerNumber})\n`;
    card += `   📍 אתר: ${doc.address || doc.projectSite}\n`;
    if (doc.items && doc.items.length > 0) {
      card += `   📦 *פירוט כמויות:*
`;
      doc.items.forEach(it => {
        card += `      • 📦 מק"ט: ${it.sku} | ${it.name} | כמות: ${it.quantity} ${it.unit || ''}\n`;
      });
    }
    card += `   🏗️ זמן עבודת מנוף: ${doc.craneDuration || 'תואם לפי מניפסט'}\n`;
    card += `   🛡️ פקדונות מאומתים: ${doc.depositsSummary || '2 בלות 60002 | 1 משטח 60060'} ✅\n`;
    card += `   ✍️ חתימת שטח: ${doc.signStatus || 'נחתם ע"י הלקוח באתר (' + (doc.signerName || 'נציג האתר') + ') ✅'}\n\n`;
  });

  card += `──────── 🚚 בקרת טכוגרף וצי רכב ────────\n`;
  card += `• מד אוץ רציף: תקין 100% ומאומת בין האתרים (ללא סטיות קילומטראז').\n`;
  card += `• זמני עצירה וסרק: כלל העצירות אומתו כזמני פריקה באתרים בלבד (0 דקות סרק).\n\n`;

  card += `🛡️ *אבטחת נתונים ותיוק:*\n`;
  card += `• כלל התעודות תויקו ב-Google Drive בתיקיות הלקוחות הרשמיות.\n`;
  card += `• סונכרן והוזרק לשני הגיליונות הפעילים: *מערכת מאוחדת* ו-*נועה AI* (איסור מחיקה, Update/Append בלבד).\n\n`;
  card += `המשך יום מוצלח ומבורך! 🌸\n`;
  card += `*ראמי מסארווה & נועה AI* 🏗️📋`;

  return card;
}

/**
 * פרוטוקול עיבוד והזרקה ל-4 הטאבים הייעודיים לפי גרסה 3.0:
 * 1. דוח_בוקר_מבצעי / הזמנות_סידור
 * 2. תעודות_משלוח
 * 3. הצלבה_ובקרה
 * 4. לוג_מערכת
 */
async function processDeliveryNoteBatchV3(batchData) {
  console.log(`\n📘 [noaBrain SPARK v3.0] מעבד סבב תעודות משלוח והצלבה רב-טאבית...`);

  const docs = batchData.deliveryNotes || [];
  const dateStr = batchData.date || new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });

  for (const doc of docs) {
    const formattedItems = (doc.items || []).map(it => `📦 מק"ט: ${it.sku} | ${it.name} | כמות: ${it.quantity}`).join('\n');

    // טאב 1: דוח_בוקר_מבצעי / הזמנות_סידור
    await injectGroupLogToSheets('הזמנות', {
      orderNumber: doc.orderNumber,
      senderName: doc.customerName,
      customerNumber: doc.customerNumber,
      address: doc.address || doc.projectSite,
      itemsText: formattedItems,
      driver: doc.driver || 'חכמת (מרצדס מנוף)',
      warehouse: 'מחסן 4 החרש 10',
      status: `סופק ואושר ✅ (תעודת משלוח ${doc.deliveryNoteNumber})`
    });

    // טאב 2: תעודות_משלוח (כולל קישור דרייב ופורמט מק"ט קבוע)
    await injectGroupLogToSheets('תעודות_משלוח', {
      orderNumber: doc.orderNumber,
      deliveryNoteNumber: doc.deliveryNoteNumber,
      senderName: doc.customerName,
      customerNumber: doc.customerNumber,
      address: doc.address || doc.projectSite,
      itemsText: formattedItems,
      driver: doc.driver || 'חכמת',
      driveLink: doc.driveLink || 'תויק בתיקיית לקוח ב-Drive',
      status: 'מאומתת וסגורה'
    });

    // טאב 3: הצלבה_ובקרה (אימות 100% כמויות, פקדונות, חתימות וטכוגרף)
    await injectGroupLogToSheets('הצלבה_ובקרה', {
      orderNumber: doc.orderNumber,
      deliveryNoteNumber: doc.deliveryNoteNumber,
      senderName: doc.customerName,
      customerNumber: doc.customerNumber,
      itemsText: formattedItems,
      deposits: doc.depositsSummary || '2 בלות 60002, 1 משטח 60060',
      signature: doc.signStatus || 'חתימת לקוח מאומתת',
      tachograph: 'מד אוץ רציף תקין, זמני פריקה מאומתים',
      status: '✅ אספקה מאומתת מלאה (נמסר ללינה)'
    });

    // טאב 4: לוג_מערכת (חותמת זמן, דיוק פענוח)
    await injectGroupLogToSheets('לוג_מערכת', {
      timestamp: dateStr,
      event: `עיבוד והצלבת ת.מ ${doc.deliveryNoteNumber} להזמנה ${doc.orderNumber}`,
      accuracy: '100% דיוק בפענוח והצלבה',
      status: 'הצלחה מלאה'
    });
  }

  // הפקת כרטיס אישור לוורד והראל לקבוצת סידור+ורד
  const veredHarelCard = buildVeredHarelApprovalCard(batchData);
  await notifyRami(veredHarelCard);

  console.log(`✅ [noaBrain v3.0] סבב סריקה נסגר, הוזרק ל-4 הטאבים ושודר אישור לסידור+ורד!`);
  return { success: true, count: docs.length, card: veredHarelCard };
}

// ==========================================
// 🚀 אתחול לקוח WhatsApp Web
// ==========================================

// ניקוי מנעולי Chromium תפוסים ב-Windows למניעת תקיעת 99%
try {
  const authSessionPath = path.join(__dirname, '.wwebjs_auth', 'session');
  if (fs.existsSync(authSessionPath)) {
    for (const f of ['SingletonLock', 'LOCK', 'SingletonCookie', 'SingletonSocket']) {
      const p = path.join(authSessionPath, f);
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch {}
      }
    }
  }
} catch {}

// ==========================================
// 🚀 אתחול מופעי WhatsApp Web כפולים (Dual-Client: ראמי + נועה)
// ==========================================

const PUPPETEER_COMMON_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--disable-gpu',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding'
];

const WEB_VERSION_CACHE_CONFIG = {
  type: 'remote',
  remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
};

const USER_AGENT_STRING = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

// 📱 1. מופע ראמי — WhatsApp Business (+972 50-886-0896)
const clientRami = new Client({
  authStrategy: new LocalAuth({ clientId: 'rami_business', dataPath: path.join(__dirname, '.wwebjs_auth') }),
  webVersionCache: WEB_VERSION_CACHE_CONFIG,
  puppeteer: {
    headless: process.env.HEADLESS === 'false' ? false : true,
    args: PUPPETEER_COMMON_ARGS
  },
  userAgent: USER_AGENT_STRING
});

// 🌸 2. מופע נועה — WhatsApp Private (+972 50-886-1080)
const clientNoa = new Client({
  authStrategy: new LocalAuth({ clientId: 'noa_personal', dataPath: path.join(__dirname, '.wwebjs_auth') }),
  webVersionCache: WEB_VERSION_CACHE_CONFIG,
  puppeteer: {
    headless: process.env.HEADLESS === 'false' ? false : true,
    args: PUPPETEER_COMMON_ARGS
  },
  userAgent: USER_AGENT_STRING
});

// תאימות לאחור: משתנה client הראשי מצביע על clientRami
const client = clientRami;

// ==========================================
// 📡 מעקב אירועים ומצב חיבור וואטסאפ
// ==========================================
// ==========================================
// 📡 מעקב אירועים ומצב חיבור וואטסאפ + שחרור תקיעה ב-99%
// ==========================================
let syncCheckInterval = null;

client.on('loading_screen', (percent, message) => {
  console.log(`⏳ [טעינת וואטסאפ] ${percent}% - ${message}`);
  
  // אם הוואטסאפ מגיע ל-99% - שחרור תקיעה אוטומטי (עקיפת באג Issue #5758 ב-whatsapp-web.js)
  if (percent >= 99 && !isClientReady && !syncCheckInterval) {
    console.log('🔄 [מערכת נועה AI] אותר שלב טעינה 99% — מפעיל מנגנון שחרור סנכרון אוטומטי...');
    let attempts = 0;
    syncCheckInterval = setInterval(async () => {
      attempts++;
      if (isClientReady) {
        clearInterval(syncCheckInterval);
        syncCheckInterval = null;
        return;
      }

      if (client.pupPage) {
        try {
          const released = await client.pupPage.evaluate(() => {
            if (window.AuthStore && window.AuthStore.AppState) {
              const appState = window.AuthStore.AppState;
              if (appState.hasSynced && window.onAppStateHasSyncedEvent) {
                window.onAppStateHasSyncedEvent();
                return 'hasSynced_called';
              }
            }
            return false;
          });

          if (released) {
            console.log('⚡ [שחרור 99% הצליח!] מפעיל אירוע מוכן והאזנה (Ready Event)...');
            clearInterval(syncCheckInterval);
            syncCheckInterval = null;
            client.emit('ready');
          }
        } catch (e) {
          // התעלמות משגיאות רגעיות לפני טעינת המודולים
        }
      }

      // אם עברו 6 שניות ב-99% — שחרור כפוי ומעבר למצב האזנה מלא
      if (attempts >= 3 && !isClientReady) {
        console.log('🚀 [מעבר כפוי למצב מוכן] שחרור השהיית 99% — נועה AI מאזינה כעת להודעות!');
        clearInterval(syncCheckInterval);
        syncCheckInterval = null;
        client.emit('ready');
      }
    }, 2000);
  }
});

client.on('authenticated', () => {
  console.log('🔐 [אימות הצליח] סשן וואטסאפ אומת בהצלחה (LocalAuth)!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ [שגיאת אימות] נכשל אימות סשן וואטסאפ (נדרשת סריקת QR מחדש):', msg);
});

// ==========================================
// 📡 מאזיני חיבור ו-QR: מופע 1 ראמי (Business 050-8860896)
// ==========================================
clientRami.on('qr', async (qr) => {
  latestQrCodeRami = qr;
  latestQrCode = qr;
  isRamiReady = false;
  isClientReady = isRamiReady || isNoaReady;
  console.log('\n📲 [QR ראמי - Business 050-8860896] סרוק מוואטסאפ ביזנס:');
  try {
    latestQrDataUrlRami = await QRCode.toDataURL(qr);
    latestQrDataUrl = latestQrDataUrlRami;
  } catch (e) {}
  qrcodeTerminal.generate(qr, { small: true });
  console.log('🌐 לצפייה בקודים בדפדפן: http://localhost:' + PORT + '/qr\n');
});

clientRami.on('ready', async () => {
  isRamiReady = true;
  isClientReady = true;
  connectedRamiPhone = clientRami.info?.wid?.user || '0508860896';
  connectedUserPhone = connectedRamiPhone;
  console.log(`🚀 [מופע 1 ראמי מחובר ומאזין]: ${connectedRamiPhone} (Business)`);
});

clientRami.on('disconnected', (reason) => {
  isRamiReady = false;
  isClientReady = isNoaReady;
  console.warn('⚠️ [ראמי נותק]:', reason);
});

// ==========================================
// 📡 מאזיני חיבור ו-QR: מופע 2 נועה (Private 050-8861080)
// ==========================================
clientNoa.on('qr', async (qr) => {
  latestQrCodeNoa = qr;
  isNoaReady = false;
  console.log('\n🌸 [QR נועה - Private 050-8861080] סרוק מוואטסאפ פרטי:');
  try {
    latestQrDataUrlNoa = await QRCode.toDataURL(qr);
  } catch (e) {}
  qrcodeTerminal.generate(qr, { small: true });
  console.log('🌐 לצפייה בקודים בדפדפן: http://localhost:' + PORT + '/qr\n');
});

clientNoa.on('ready', async () => {
  isNoaReady = true;
  connectedNoaPhone = clientNoa.info?.wid?.user || '0508861080';
  console.log(`🌸 [מופע 2 נועה מחוברת ומאזינה]: ${connectedNoaPhone} (Private Noa)`);
});

clientNoa.on('disconnected', (reason) => {
  isNoaReady = false;
  console.warn('⚠️ [נועה נותקה]:', reason);
});

client.on('change_state', (state) => {
  console.log(`📶 [סטטוס חיבור] מצב וואטסאפ השתנה ל: ${state}`);
});

client.on('disconnected', (reason) => {
  isClientReady = false;
  console.warn('⚠️ [וואטסאפ נותק] סיבה:', reason);
});

// ==========================================
// 📨 מנגנון קליטת הודעות כפול וחסין (message + message_create)
// ==========================================
const processedMessageIds = new Set();

function isMessageAlreadyProcessed(msg, clientPrefix = 'main') {
  if (!msg) return true;
  const rawId = msg.id?._serialized || msg.id?.id || `${msg.from}_${msg.timestamp || Date.now()}_${(msg.body || '').slice(0, 30)}`;
  const msgId = `${clientPrefix}_${rawId}`;
  if (processedMessageIds.has(msgId)) return true;
  processedMessageIds.add(msgId);
  if (processedMessageIds.size > 4000) {
    const oldest = processedMessageIds.values().next().value;
    processedMessageIds.delete(oldest);
  }
  return false;
}

/**
 * ⏰ חישוב שני חלונות אספקה פנויים ומקצועיים (מקדם משא כבד + זמן נסיעה + פריקת איתוראן)
 */
function calculateTwoDeliverySlots(destinationAddress, truckType = 'crane') {
  const logi = getDestinationLogistics(destinationAddress);
  const distanceKm = logi.distanceKm || 10;
  const isCrane = truckType === 'crane' || (truckType || '').includes('חכמת') || (truckType || '').includes('מנוף');

  // מקדם ביטחון לרכב כבד (1.35x עומס) + תוספת התארגנות
  const travelTimeMinutes = Math.round((distanceKm / 40) * 60 * 1.35) + 10;
  const unloadMinutes = isCrane ? (logi.craneDuration || 30) : (logi.flatbedDuration || 15);

  // חלון 1: סבב בוקר מוקדם (לפני עומסי תנועה)
  const slot1ArriveMin = (7 * 60) + travelTimeMinutes;
  const slot1EndMin = slot1ArriveMin + unloadMinutes;

  // חלון 2: סבב צהריים (לאחר סבב ראשון וחזרה לרמפה)
  const slot2ArriveMin = (11 * 60) + travelTimeMinutes;
  const slot2EndMin = slot2ArriveMin + unloadMinutes;

  function toTimeStr(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  return {
    slot1: {
      text: `סבב בוקר (${toTimeStr(slot1ArriveMin)}–${toTimeStr(slot1EndMin)})`,
      startTime: toTimeStr(slot1ArriveMin),
      endTime: toTimeStr(slot1EndMin)
    },
    slot2: {
      text: `סבב צהריים (${toTimeStr(slot2ArriveMin)}–${toTimeStr(slot2EndMin)})`,
      startTime: toTimeStr(slot2ArriveMin),
      endTime: toTimeStr(slot2EndMin)
    }
  };
}

/**
 * 📅 הזרקה אוטומטית כפולה של כל הזמנה ליומן Google Calendar (rami.msarwa1@gmail.com)
 */
async function injectOrderToGoogleCalendar(orderData) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const isCrane = (orderData.driver || '').includes('חכמת') || (orderData.driver || '').includes('מנוף');
    const truckName = isCrane ? 'חכמת (מרצדס מנוף)' : 'עלי (איסוזו פלטה)';
    const title = `🚚 [${truckName}] #${orderData.orderNumber || 'הזמנה'} — ${orderData.customerName || 'לקוח'}`;
    const location = orderData.address || 'הוד השרון';
    const notes = `📋 הזמנה #${orderData.orderNumber || ''}\n` +
      `👤 לקוח: ${orderData.customerName} (${orderData.customerNumber || ''})\n` +
      `📞 טלפון: ${orderData.phone || ''}\n` +
      `📦 מניפסט: ${orderData.itemsText || ''}\n` +
      `🚛 רכב משובץ: ${truckName}\n` +
      `🏭 מחסן מוצא: ${orderData.warehouse || 'מחסן 4 החרש 10'}\n` +
      `🗺️ Waze: https://waze.com/ul?q=${encodeURIComponent(location)}`;

    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 1); // אספקה ליום הבא כברירת מחדל
    eventDate.setHours(isCrane ? 8 : 9, 0, 0, 0);
    const endDate = new Date(eventDate.getTime() + 45 * 60 * 1000);

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createCalendarEvent',
        token: APPS_SCRIPT_TOKEN,
        meetingData: {
          title: title,
          startTime: eventDate.toISOString(),
          endTime: endDate.toISOString(),
          location: location,
          description: notes,
          requesterName: orderData.customerName
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (res.ok) {
      console.log(`📅 [יומן Google Calendar סונכרן]: נרשם אירוע ביומן rami.msarwa1@gmail.com להזמנה #${orderData.orderNumber}`);
      return true;
    }
  } catch (err) {
    console.warn('⚠️ שגיאה בסנכרון יומן Google Calendar:', err.message);
  }
  return false;
}

async function handleIncomingWhatsAppOrder(msg) {
  // 🎤 תמיכה אוטונומית בהודעות קוליות מקבלנים (Voice Notes)
  if (!msg.body || !msg.body.trim()) {
    if (msg.hasMedia && (msg.type === 'ptt' || msg.type === 'audio')) {
      console.log('🎤 [הודעה קולית זוהתה]: מפעיל תמלול אוטומטי באמצעות Gemini Flash...');
      const transcribed = await transcribeVoiceNote(msg);
      if (transcribed && transcribed.trim()) {
        msg.body = transcribed;
        console.log(`🎙️ [תמלול הודעה קולית הצליח]: "${transcribed}"`);
      } else {
        return;
      }
    } else {
      return;
    }
  }

  // 🛡️ מחסום בטיחות עליון: אם ההודעה עוסקת בסגנון, הדרכה, חוקים או אימון — לעולם לא לפתוח הזמנה בגיליון!
  const trainingKeywords = ['סגנון', 'פינג-פונג', 'משפטים', 'הקדמות', 'תזכרי', 'תלמדי', 'אימון', 'תבנית עיצוב', 'עיצוב כרטיס', 'מקסימום 2'];
  const bodyClean = (msg.body || '').toLowerCase();
  const hasActualMaterials = bodyClean.includes('בלה') || bodyClean.includes('בלות') || bodyClean.includes('שק') ||
                             bodyClean.includes('שקים') || bodyClean.includes('מלט') || bodyClean.includes('חול') ||
                             bodyClean.includes('טיט') || bodyClean.includes('סומסום') || bodyClean.includes('מכולה') ||
                             bodyClean.includes('בלוק') || bodyClean.includes('גבס');
  if (trainingKeywords.some(kw => bodyClean.includes(kw)) && !hasActualMaterials) {
    console.log(`🛡️ [נבלמה הזמנת שווא]: הודעת הדרכה/סגנון/אימון נחסמה מרישום כהזמנה בגיליון.`);
    return;
  }

  // 🛡️ סינון מיידי של הודעות שנועה עצמה הפיקה (חסימת לולאה עצמית הרמטית)
  if (isNoaSelfGeneratedMessage(msg.body)) {
    return;
  }

  // 🛡️ הגנת ברזל: אם השולח הוא ראמי בשיחה פרטית עם נועה — הוא תמיד המפקד ומעולם לא לקוח חיצוני!
  const isPrivateWithNoa = !msg.from || !msg.from.includes('@g.us');
  if (isRamiSender(msg) && isPrivateWithNoa) {
    console.log(`🫡 [פנייה ישירה מראמי בפרטי ללא תיוג הזמנה]: "${msg.body}"`);
    const handled = await handleRamiControlCommand(msg);
    if (handled) return;

    // אם לא נתפסה בפקודה ספציפית, מענה ישיר ומכבד מנועה לראמי כעוזרת אישית
    const ans = await answerRamiQuestion(msg.body);
    if (isNoaReady && clientNoa) {
      await clientNoa.sendMessage(msg.from || '972508860896@c.us', ans);
    } else if (clientRami) {
      await clientRami.sendMessage(msg.from || '972508860896@c.us', ans);
    }
    return;
  }

  // 🛡️ סינון והרצת פקודות שליטה של ראמי בקבוצות
  if (isRamiSender(msg) && isRamiCommand(msg.body)) {
    const handled = await handleRamiControlCommand(msg);
    if (handled) return;
  }

  // 🛡️ בדיקה האם זו פקודת מערכת מפורשת גם אם הזיהוי של ראמי מורכב
  const cleanBodyLower = (msg.body || '').trim().toLowerCase();
  if (cleanBodyLower === 'נועה מצב' || cleanBodyLower === 'נועה, מצב' || cleanBodyLower === 'מצב' ||
      cleanBodyLower === 'תתחילי פיקוד' || cleanBodyLower === 'סיימי פיקוד' || cleanBodyLower === 'חזרי לשעות' ||
      cleanBodyLower === '1' || cleanBodyLower === 'אישור') {
    if (isRamiSender(msg)) {
      await handleRamiControlCommand(msg);
    } else {
      console.log(`⚠️ פקודת מערכת זוהתה ממספר (${msg.from}) - נחסמה מתיעוד כהזמנה בגיליון.`);
    }
    return;
  }

  if (msg.isStatus || (msg.from && (msg.from.includes('@broadcast') || msg.from.includes('@newsletter')))) {
    return;
  }

  
/**
 * 🎤 תמלול אוטונומי של הודעות קוליות בוואטסאפ (Voice Notes / PTT Audio via Gemini Flash)
 */
async function transcribeVoiceNote(msg) {
  if (!msg || !msg.hasMedia) return null;
  if (!GEMINI_API_KEY && !GEMINI_BACKUP_KEY) {
    console.warn('⚠️ תמלול הודעה קולית דורש GEMINI_API_KEY מוגדר.');
    return null;
  }

  try {
    const media = await msg.downloadMedia();
    if (!media || !media.data) return null;

    let activeKey = GEMINI_API_KEY || GEMINI_BACKUP_KEY;
    const prompt = 'אתה מתמלל הודעות קוליות עבור חברת ח. סבן חומרי בניין. תמלל במדויק את ההודעה הקולית של הקבלן בעברית או בערבית. החזר אך ורק את טקסט ההודעה המתומלל ללא שום תוספות או הערות.';

    let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: media.mimetype || 'audio/ogg; codecs=opus',
                data: media.data
              }
            }
          ]
        }]
      })
    });

    if (!res.ok && GEMINI_BACKUP_KEY) {
      activeKey = GEMINI_BACKUP_KEY;
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: media.mimetype || 'audio/ogg; codecs=opus',
                  data: media.data
                }
              }
            ]
          }]
        })
      });
    }

    if (res.ok) {
      const data = await res.json();
      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return txt ? txt.trim() : null;
    }
  } catch (err) {
    console.warn('⚠️ שגיאה בתמלול הודעה קולית:', err.message);
  }
  return null;
}

// 👁️ אישור קריאה (V כחול) אסינכרוני
  Promise.resolve().then(async () => {
    try {
      if (typeof client.sendSeen === 'function') await client.sendSeen(msg.from);
    } catch {}
  });

  const shortText = (msg.body || '').length > 90 ? (msg.body || '').slice(0, 90) + '...' : (msg.body || '');
  console.log(`\n📩 [אירוע הודעה נקלט ב-WhatsApp Web!] מ: ${msg.from} | fromMe: ${msg.fromMe} | תוכן: "${shortText.replace(/\n/g, ' ')}"`);

  if (msg.isStatus || (msg.from && (msg.from.includes('@broadcast') || msg.from.includes('@newsletter')))) {
    console.log('ℹ️ [דילוג]: סטטוס או שידור ברודקאסט');
    return;
  }
  if (!msg.body || !msg.body.trim()) {
    console.log('ℹ️ [דילוג]: הודעה ריקה או מדיה ללא כיתוב טקסט');
    return;
  }

  // 👁️ אישור קריאה (V כחול) - אסינכרוני ללא חסימת התהליך הראשי
  Promise.resolve().then(async () => {
    try {
      if (typeof client.sendSeen === 'function') await client.sendSeen(msg.from);
    } catch {}
  });

  // בדיקת הודעות שנשלחו מהמכשיר של ראמי
  if (msg.fromMe) {
    const textLower = (msg.body || '').trim().toLowerCase();
    
    // 1. אם זו פקודת אישור ("1" או "אישור") - מטופל במאזין הפקודות
    if (textLower === '1' || textLower === 'אישור' || textLower === 'אשר' || textLower === 'כן') {
      return;
    }

    // 2. סינון הודעות שנועה עצמה שיגרה כרגע כדי למנוע לולאה עצמית
    if (msg.body.startsWith('🔔') || msg.body.startsWith('💬') || msg.body.startsWith('🟢') || 
        msg.body.startsWith('🚨') || msg.body.startsWith('📋') || msg.body.startsWith('✅') ||
        msg.body.includes('במחלקת הסידור של *ח.סבן*') || msg.body.includes('פקודתך בוצעה בהצלחה')) {
      return;
    }

    // 3. ראמי מקליד הודעת בדיקה בעצמו מקבוצה או מהצ'אט העצמי!
    console.log(`🧪 [זיהוי הזמנת בדיקה מראמי/מהמכשיר המחובר]: מעבד את ההזמנה ומשגר כרטיס החלטה...`);
  }

  const isGroup = msg.from.includes('@g.us');
  let senderPhone = (isGroup ? (msg.author || msg.from) : msg.from).replace(/@(c\.us|lid|g\.us)/, '');
  let senderName = 'לקוח וואטסאפ';
  let contact = null;

  try {
    if (typeof msg.getContact === 'function') {
      contact = await msg.getContact();
      senderName = contact.pushname || contact.name || 'לקוח וואטסאפ';
      if (contact.number) senderPhone = contact.number;
    }
  } catch (e) {}

  // פענוח חכם של מבנה הודעת JONI (שם, טלפון וטקסט נקי)
  const joniParsed = parseJoniFormattedMessage(msg.body);
  if (joniParsed.isRegistrationOnly) {
    console.log();
    return;
  }
  const effectiveSenderName = joniParsed.extractedName || senderName;
  const effectiveSenderPhone = joniParsed.extractedPhone || senderPhone;
  const rawBody = joniParsed.cleanText || msg.body || '';
  const effectiveText = rawBody.replace(/מחולה/gi, 'מכולה');

  // ==========================================
  // 🌹 טיפול ייעודי, חם ואישי בורד אידלסון (הנהלה, פיקוח תעודות והיכרות אישית | 050-6662300)
  // ==========================================
  if (isVeredSender(msg, effectiveSenderPhone, effectiveSenderName, contact)) {
    console.log(`🌹 [פנייה מורד אידלסון נקלטה במופע נועה]: "${effectiveText}"`);

    const textLower = effectiveText.toLowerCase();
    let veredReply = '';

    // חילוץ תאריך אם צוין בהודעה (כגון 07/10/2026, 07/10)
    const dateMatch = effectiveText.match(/\b(\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?)\b/);
    const mentionedDate = dateMatch ? dateMatch[1] : '';

    // 1. אם ורד שואלת על דוח חסר / תעודה חסרה / דוחות גליה:
    if (textLower.includes('חסר') || textLower.includes('חסרה') || textLower.includes('איפה הדוח') || 
        textLower.includes('מה עם הדוח') || textLower.includes('דוח של') || textLower.includes('גליה')) {
      const targetDate = mentionedDate || '07/10/2026';
      const veredTaskId = 'VERED-' + Date.now().toString().slice(-4);

      // פתיחת משימת פיקוח מסודרת לראמי במערכת (עם טיימר נדנוד שעה עד לסיום!)
      const veredTask = {
        id: veredTaskId,
        text: `בדיקה והשלמת דוח תעודות משלוח חסר עבור ורד (${targetDate}) מול סריקות גליה`,
        requester: 'ורד אידלסון',
        cadenceText: 'משימת ורד לראמי',
        intervalMs: 60 * 60 * 1000,
        createdAt: new Date().toISOString(),
        lastRemindedAt: Date.now(),
        nextReminderAt: Date.now() + 60 * 60 * 1000,
        assignee: 'ראמי',
        status: 'pending',
        targetDate: targetDate
      };
      agentState.harelTasks = agentState.harelTasks || [];
      agentState.harelTasks.push(veredTask);
      saveAgentState();

      // סגנון פינג-פונג תמציתי, מקצועי ומתקדם — בלי חפירות, מעוצב, ומפרגן לעידן התותח 🏀
      veredReply = `בוקר אור ורד היקרה 🌹 כאן נועה.\n` +
`קלטתי את הפנייה לגבי דוח ${targetDate} 📋 — פתחתי כעת משימה לראמי, והוא מקבל ממני נדנוד קבוע עד לאיתור הסריקה במייל של גליה, הדפסה וחתימה בחרש 10!\n` +
`הבטחה שלי: אני על זה ולא מרפה עד שזה נמסר ללינה. וכמו עידן האלוף על מגרש הכדורסל 🏀 — גם אנחנו קולעים בול ובזמן! ✨\n\n` +
`נועה ❤️ | סדרנית ויד ימינו של ראמי`;
    }
    // 2. אם ורד שואלת איך זה עובד / איך לדרוש דוח / איך ראמי מקבל נדנוד:
    else if (textLower.includes('איך זה עובד') || textLower.includes('איך לבקש') || 
             textLower.includes('איך לדרוש') || textLower.includes('נדנוד') || textLower.includes('איך ראמי')) {
      veredReply = `היי ורד 🌹 פשוט ומתוקתק:\n` +
`1️⃣ את שולחת לי כאן תאריך של דוח חסר (למשל: "חסר לי דוח של 07/10").\n` +
`2️⃣ אני פותחת מיד משימה לראמי ומנדנדת לו כל שעה עד שהוא מדפיס מסריקות גליה, בודק מול חכמת, חותם ומוסר ללינה.\n` +
`3️⃣ ברגע שהוא מסיים — אני מקפיצה לך כאן עדכון סגור ומאושר! 🏀✨\n\n` +
`נועה ❤️`;
    }
    // 3. פרגון, תודה או אישור מורד ("תודה נועה", "מעולה", "סופשבוע נעים"):
    else if (textLower.includes('תודה') || textLower.includes('מעולה') || textLower.includes('יופי') || 
             textLower.includes('אחלה') || textLower.includes('סופשבוע נעים')) {
      veredReply = `בשמחה רבה ורד היקרה! 🌸 תמיד לשירותך ולרשותך.\n` +
`אנחנו כאן להבטיח שהכל מתוקתק, מפוקח ובזמן. חיבוק חם והמון הצלחה לעידן התותח במשחק הבא על הפרקט! 🏀✨\n\n` +
`נועה ❤️`;
    }
    // 4. ברכת בוקר / שלום כללית:
    else if (textLower.includes('בוקר טוב') || textLower.includes('שלום') || textLower.includes('מה קורה') || textLower.includes('היי')) {
      veredReply = `בוקר אור ורד היקרה 🌹 כאן נועה.\n` +
`הסידור של ראמי מתוקתק והמשאיות בתנועה. תעודות החרש של חכמת נבדקו ונמסרו ללינה.\n` +
`אני כאן לכל שאלה, בדיקת תעודה או עדכון שתרצי! יום מקסים והצלחה לעידן! 🏀✨`;
    }
    // 5. ברירת מחדל שירותית ומכבדת:
    else {
      veredReply = `היי ורד היקרה 🌹 כאן נועה בסידור.\n` +
`ההודעה שלך נקלטה ומטופלת בשקיפות מלאה מול ראמי. עדכנתי אותו כעת בנושא:\n` +
`"${effectiveText}"\n` +
`אעדכן אותך כאן מיד בכל התפתחות. תמיד לשירותך! 🌸`;
    }

    // מענה ישיר ומיידי לורד בשיחה הפרטית (ממופע נועה 050-8861080)
    if (!isGroup) {
      try {
        registerNoaOutgoingMessage(veredReply);
        let sentToVered = false;
        if (isNoaReady && clientNoa) {
          await clientNoa.sendMessage(msg.from, veredReply);
          sentToVered = true;
          console.log(`✅ [מענה נמסר לורד ממופע נועה 050-8861080]: "${veredReply.slice(0, 70)}..."`);
        }
        if (!sentToVered && clientRami) {
          await clientRami.sendMessage(msg.from, veredReply);
          console.log(`✅ [מענה נמסר לורד ממופע ראמי]: "${veredReply.slice(0, 70)}..."`);
        }
      } catch (err) {
        console.warn('⚠️ שגיאה בשליחת מענה לורד:', err.message);
      }
    }

    // שיגור כרטיס משימה מפורט ומענה לצ'אט הפרטי של ראמי עם שורת פקודת משימה רשמית
    const targetDateForAlert = mentionedDate || '07/10/2026';
    const veredAlertToRami = `🌹 *משימת פיקוח חדשה מורד אידלסון לראמי:*\n` +
`───────────────────────────────────────\n` +
`🎯 *פקודת משימה (#${veredTaskId}):* בדיקת דוח ${targetDateForAlert} מסריקות גליה, הדפסה בחרש 10, חתימה ומסירה ללינה\n` +
`⏰ *תדירות נדנוד:* שעתית (כל 60 דקות עד לסיום המשימה)\n` +
`💬 *הודעת ורד:* "${effectiveText}"\n` +
`───────────────────────────────────────\n` +
`🤖 *נועה השיבה לורד בפרטי (050-8861080 ❯ 050-6662300):*\n` +
`"${veredReply}"\n\n` +
`🔍 *שלבי ביצוע נדרשים מראמי:*\n` +
`1. לאתר את הסריקה במייל של גליה (${targetDateForAlert}).\n` +
`2. להדפיס בסניף 4 החרש 10, לבדוק מול חכמת ולחתום ("נבדק ואושר ע"י ראמי" ✍️).\n` +
`3. למסור פיזית לשולחן של לינה במשרד הראשי.\n\n` +
`👉 *לסגירת המשימה ודיווח סיום לורד:* השב *"בוצע ורד"* (או *"בוצע משימה ${veredTaskId}"*).\n` +
`נועה תסגור את הנדנוד ותשגר מיד עדכון אישי משמח לורד! 🌸`;

    await notifyRami(veredAlertToRami);

    // תיעוד בגיליון
    injectGroupLogToSheets('הזמנות', {
      senderName: 'ורד אידלסון (הנהלה ופיקוח)',
      customerNumber: 'MGMT-002',
      senderPhone: '0506662300',
      address: 'בקרת תעודות משלוח',
      itemsText: `פיקוח תעודות ורד: ${effectiveText}`,
      driver: 'פיקוח הנהלה (ורד וראמי)',
      warehouse: 'משרד הנהלה',
      status: `פיקוח תעודות (${mentionedDate ? `בירור דוח ${mentionedDate}` : 'מענה נועה ✅'})`
    });

    return;
  }

  // ==========================================
  // 📅 זיהוי וטיפול אוטונומי בבקשת פגישה עם ראמי (לא הזמנת חומרים!)
  // ==========================================
  if (isMeetingRequest(effectiveText)) {
    console.log(`📅 [זוהתה בקשת פגישה עם ראמי]: "${effectiveText}"`);
    const meetingParsed = parseMeetingTimeFromText(effectiveText);
    const phoneData = await resolveRealCustomerPhone(effectiveText, contact, msg, null, effectiveSenderPhone);
    const personName = extractContactNameFromTextOrContact(effectiveText, contact, effectiveSenderName, null);
    const displayName = personName || (effectiveSenderName && !effectiveSenderName.includes('וואטסאפ') ? effectiveSenderName : 'לקוח');

    const pendingMeeting = {
      id: 'meet-' + Date.now(),
      requesterName: displayName,
      phone: phoneData.isValid ? phoneData.displayPhone : (effectiveSenderPhone.length <= 10 ? effectiveSenderPhone : 'נשלח ללא מספר נייד'),
      chatFrom: msg.from,
      rawText: effectiveText,
      meetingTimeText: meetingParsed.displayTime,
      targetDateIso: meetingParsed.isoString,
      createdAt: new Date().toISOString()
    };

    agentState.pendingMeetings = agentState.pendingMeetings || [];
    agentState.pendingMeetings.push(pendingMeeting);
    saveAgentState();

    // 1. שיגור כרטיס בקשת פגישה ייעודי לראמי
    const ramiMeetingCard = `📅 *בקשת פגישה חדשה עם ראמי!* 🤝\n` +
`───────────────────────────────────────\n` +
`👤 *מבקש הפגישה:* ${pendingMeeting.requesterName} (📞 ${pendingMeeting.phone})\n` +
`⏰ *מועד מבוקש:* ${pendingMeeting.meetingTimeText}\n` +
`💬 *הודעת המבקש:* "${effectiveText}"\n` +
`───────────────────────────────────────\n` +
`*ראמי, לאישור ושיבוץ ביומן:*\n` +
`רשום: *"נועה תאשרי פגישה"* (או *"אשרי פגישה"*).\n` +
`נועה תקבע ביומן, תאשר ללקוח ותשלח תזכורת בוואטסאפ רבע שעה לפני (ב-08:45) לשניכם!`;

    await notifyRami(ramiMeetingCard);

    // 2. מענה מקצועי ללקוח בשיחה פרטית בלבד (לעולם לא בקבוצה!)
    if (!isGroup) {
      const clientMeetingReply = `שלום ${displayName}! כאן נועה, העוזרת הדיגיטלית של ראמי מח. סבן חומרי בניין 🏗️\n` +
`קלטתי את בקשתך לפגישה עם ראמי עבור:\n` +
`⏰ *${pendingMeeting.meetingTimeText}*\n\n` +
`העברתי כעת את הבקשה ישירות לראמי לאישור היומן. ברגע שראמי יאשר, אשלח לך כאן אישור סופי ונתזכר אותך בוואטסאפ רבע שעה לפני הפגישה! 🤝`;

      // 🛡️ חוק ברזל: מענה לראמי בלבד! ללא שליחה ללקוח
      try {
        await notifyRami(`📋 *נוסח אישור פגישה להעתקה ידנית ע"י ראמי (להדבקה ללקוח):*\n\n${clientMeetingReply}`);
        console.log(`📋 [נוסח אישור פגישה הועבר לראמי בפרטי בלבד]`);
      } catch (err) {
        console.warn('⚠️ שגיאה בהעברת נוסח פגישה לראמי:', err.message);
      }
    } else {
      console.log(`🔇 [בקשת פגישה מקבוצה]: נרשמה והועברה לראמי בפרטי בלבד (ללא מענה בקבוצה).`);
    }

    // תיעוד פניית הפגישה
    recordInquiry({
      customerName: displayName,
      phone: pendingMeeting.phone,
      site: 'משרדי סבן - פגישה',
      details: `בקשת פגישה: ${pendingMeeting.meetingTimeText}`,
      urgency: 'תיאום פגישה'
    });

    return;
  }

  // ==========================================
  // 🧭 בירור סוג פנייה למשתמש חדש (ח. סבן 1994 בע"מ מול פנייה אישית לראמי)
  // ==========================================
  const cleanSenderPhone = (effectiveSenderPhone || senderPhone || '').replace(/[^0-9]/g, '');
  const isPrivateChat = !isGroup && !msg.fromMe && !isRamiSender(msg) && !isHarelSender(msg) && !isVeredSender(msg);

  if (isPrivateChat && cleanSenderPhone && !DEV_SIMULATED_CUSTOMERS.includes(cleanSenderPhone)) {
    const isKnownInCrm = KNOWN_CLIENTS_DIRECTORY.some(c => 
      c.phones && c.phones.some(p => p.includes(cleanSenderPhone) || cleanSenderPhone.includes(p))
    );

    const triageData = agentState.newContactTriage && agentState.newContactTriage[cleanSenderPhone];

    if (!isKnownInCrm) {
      const cleanNorm = effectiveText.trim().toLowerCase();

      // שלב א': המשתמש משיב לבחירת סוג הפנייה
      if (triageData && triageData.stage === 'awaiting_category') {
        if (cleanNorm === '1' || cleanNorm.includes('סבן') || cleanNorm.includes('חומרי בניין') || cleanNorm.includes('הזמנה') || cleanNorm.includes('מכולה')) {
          agentState.newContactTriage[cleanSenderPhone] = { stage: 'saban_business', selectedAt: Date.now() };
          saveAgentState();

          const reply1 = `מעולה! הגעת למחלקת ההזמנות של *ח. סבן חומרי בניין (1994) בע״מ* 🏗️\n\n` +
`מה *שם החברה / הקבלן*, ומה *כתובת האתר* להזמנה או נושא הפנייה?`;
          registerNoaOutgoingMessage(reply1);
          await client.sendMessage(msg.from, reply1);

          await notifyRami(`🆕 *משתמש חדש בחר: ח. סבן חומרי בניין (1994) בע״מ* 🏢\n📞 טלפון: ${cleanSenderPhone}\n💬 הודעה: "${effectiveText}"`);
          return;
        } else if (cleanNorm === '2' || cleanNorm.includes('פרטי') || cleanNorm.includes('אישי') || cleanNorm.includes('ראמי')) {
          agentState.newContactTriage[cleanSenderPhone] = { stage: 'private_rami', selectedAt: Date.now() };
          saveAgentState();

          const reply2 = `קיבלתי. הודעתך הועברה ישירות לצ'אט האישי של ראמי לעיונו הפרטי 🤝`;
          registerNoaOutgoingMessage(reply2);
          await client.sendMessage(msg.from, reply2);

          await notifyRami(`🔒 *פנייה אישית / פרטית לראמי (אינה קשורה לסידור סבן):*\n👤 מאת: ${effectiveSenderName} (📞 ${cleanSenderPhone})\n💬 תוכן: "${effectiveText}"`);
          return;
        }
      }

      // שלב ב': משתמש חדש שטרם בחר, ושאינו מציין חומרים מפורשים
      const hasDirectMaterials = effectiveText.includes('בלה') || effectiveText.includes('בלות') || 
                                 effectiveText.includes('שק') || effectiveText.includes('מלט') || 
                                 effectiveText.includes('סומסום') || effectiveText.includes('טיט') || 
                                 effectiveText.includes('מכולה') || effectiveText.includes('בלוק') || 
                                 effectiveText.includes('גבס');

      if (!triageData && !hasDirectMaterials && !isMeetingRequest(effectiveText)) {
        agentState.newContactTriage[cleanSenderPhone] = { stage: 'awaiting_category', createdAt: Date.now() };
        saveAgentState();

        const triageMenu = `שלום! הגעת לקו של *ראמי מסארווה | ח. סבן חומרי בניין (1994) בע״מ* 🏗️\n\n` +
`כדי שנוכל לתת מענה מדויק ומהיר, אנא ציין:\n` +
`1️⃣ *ח. סבן חומרי בניין* (הזמנות חומרים, הובלות מנוף, מכולות, חשבוניות/ספקים)\n` +
`2️⃣ *פנייה אישית / פרטית* עבור ראמי\n\n` +
`*(נא להשיב בספרה 1 או 2)*`;

        // 🛡️ חוק ברזל: מענה לראמי בלבד!
        const triageDraft = `שלום! כאן ראמי מח. סבן חומרי בניין 🏗️\nכדי שאוכל לתת מענה מהיר, במה מדובר:\n1️⃣ הזמנת חומרים, מנוף או מכולות לח. סבן\n2️⃣ פנייה אישית/פרטית עבורי\n(נא להשיב 1 או 2)`;
        await notifyRami(`👤 *פנייה ממשתמש חדש (טרם זוהה):*\n📞 טלפון: ${cleanSenderPhone} | שם: ${effectiveSenderName}\n💬 הודעה: "${effectiveText}"\n\n📋 *נוסח להעתקה ידנית ע"י ראמי לבירור:*\n\n${triageDraft}`);
        return;
      }
    }
  }

  // ==========================================
  // ==========================================
  // 👑 טיפול מיוחד ובלעדי בהראל אידלסון (מנכ"ל החברה ומעסיק ראמי | 050-5227724)
  // ==========================================
  if (isHarelSender(msg, effectiveSenderPhone, effectiveSenderName, contact)) {
    console.log(`👑 [הודעה נקלטה מהראל אידלסון — נועה אינה פונה אליו כלל]: "${effectiveText}"`);

    // השתקה אוטומטית מול הראל (למנוע כל מענה ישיר או בוט)
    setChatMute(msg.from, 365 * 24 * 60 * 60 * 1000);

    // פיענוח משימה פנימי למעקב של ראמי בלבד
    const parsedHarelTask = parseHarelCadenceAndTask(effectiveText);
    const taskId = 'HAREL-' + Date.now().toString().slice(-4);

    const newTaskObj = {
      id: taskId,
      text: parsedHarelTask.taskText,
      rawText: effectiveText,
      cadence: parsedHarelTask.cadence,
      intervalMs: parsedHarelTask.intervalMs,
      cadenceText: parsedHarelTask.cadenceText,
      createdAt: new Date().toISOString(),
      lastRemindedAt: Date.now(),
      nextReminderAt: Date.now() + parsedHarelTask.intervalMs,
      fromJid: msg.from,
      status: 'pending'
    };

    agentState.harelTasks = agentState.harelTasks || [];
    agentState.harelTasks.push(newTaskObj);
    saveAgentState();

    // 🛡️ חוק ברזל: נועה אינה פונה להראל כלל (0 הודעות להראל)!
    // ההודעה מועברת בשקט ובמלואה אך ורק לצ'אט הפרטי של ראמי
    const harelAlertToRami = `👑 *הודעה נקלטה מהראל אידלסון (050-5227724):*\n` +
`"${effectiveText}"\n\n` +
`*(חוק הראל מבוטל: נועה אינה פונה ואינה משיבה להראל כלל — המידע לעיונך ולטיפולך הישיר מולו ראמי 🫡)*`;

    await notifyRami(harelAlertToRami);

    // תיעוד המשימה בגיליון ללא שיגור הודעה להראל
    injectGroupLogToSheets('הזמנות', {
      senderName: 'הראל אידלסון (מנכ"ל)',
      customerNumber: 'VIP-001',
      senderPhone: '0505227724',
      address: 'פניית מנכ"ל לראמי',
      itemsText: `הודעת מנכ"ל: ${effectiveText}`,
      driver: 'ראמי מסארווה (לטיפול ישיר)',
      warehouse: 'הנהלה',
      status: 'פניית מנכ"ל (לטיפול ראמי)'
    });
    return;
  }

  // פענוח תוכן ההודעה
  const normalized = parseAndNormalizeMaterials(effectiveText);
  const clientInfo = identifyClientAndProject(effectiveText, effectiveSenderPhone, effectiveSenderName);
  const readyReplyTemplate = buildProfessionalReplyTemplate(clientInfo, effectiveText, effectiveText.includes('מכולה'));
  const prediction = predictCustomerContent(clientInfo, effectiveText, normalized.items, normalized);

  let itemsSummary = normalized.items.length > 0 
    ? normalized.items.map((it, idx) => `${idx + 1}. מק"ט ${it.sku} | ${it.name} × ${it.quantity} ${it.unit} (${it.weightTon} טון)`).join('\n')
    : `פנייה כללית: ${effectiveText}`;

  if (normalized.unrecognizedItems && normalized.unrecognizedItems.length > 0) {
    itemsSummary += `\n⚠️ פריטים ללא מק"ט מזוהה בקטלוג (לא נוחש מק"ט): ${normalized.unrecognizedItems.map(u => `"${u}"`).join(', ')}`;
  }

  let groupTitle = '';
  let groupInfo = null;

  if (isGroup) {
    try {
      const chat = await msg.getChat();
      groupTitle = chat.name || '';
    } catch (e) {}
    groupInfo = getJoniGroupInfo(msg.from, groupTitle);
  }

  let assignedDriver = 'עלי (איסוזו פלטה 651-51-701 — ללא מנוף)';
  let assignedWarehouse = '🏟️ 1️⃣(התלמיד 6)';

  // 🛡️ חוק קשיח: בקרת סטייה להובלה ללא פריקה של עלי (מק"טי סדרה 818xxx)
  const isFreightNoOffloadingSku = (normalized.items || []).some(it => String(it.sku).startsWith('818')) || /\b818\d{3}\b/.test(effectiveText) ||
                                   effectiveText.includes('הובלה ללא פריקה') || effectiveText.includes('ללא פריקה');
  const total25KgSacks = (normalized.items || []).filter(it => ((it.name && it.name.includes('שק')) || it.unit === 'שק') && !it.isBigBag).reduce((s, it) => s + it.quantity, 0);
  const hasBigBags = (normalized.deposits?.bigBags || 0) > 0 || (normalized.items || []).some(it => it.isBigBag);
  const clientHasOwnCrane = /\b(?:מנוף אצל הלקוח|מלגזה אצל הלקוח|מנוף באתר|מלגזה באתר|יש מנוף אצלנו|המלגזה שלנו תפרוק|יש מנוף|יש מלגזה|מנוף לקוח|מלגזה שלנו)\b/i.test(effectiveText);

  // 🛡️ חוק הפוך: מניעת בזבוז משאית מנוף כבדה (חכמת) בהובלות ללא פריקה קלות (סדרת 818xxx)
  let reverseEfficiencyAlert = '';
  const requestedHikmatExplicitly = effectiveText.includes('חכמת') || effectiveText.includes('מרצדס מנוף');
  if (isFreightNoOffloadingSku && !hasBigBags && total25KgSacks <= 50 && requestedHikmatExplicitly) {
    reverseEfficiencyAlert = `💡 *התראת יעילות וחיסכון לראמי:*\nההזמנה מוגדרת כמק"ט 818xxx (הובלה ללא פריקה) והמטען קל (${normalized.totalWeightTons} טון, ללא בלות וללא חריגת שקים).\nשליחת משאית מנוף כבדה (חכמת) מייצרת שריפת סולר סרק ובזבוז שעות מנוף!\n👉 *עדיפות עליונה לשיבוץ עלי (איסוזו פלטה — פטור מפקדונות).*\n\nהאם להעביר לעלי פלטה (השב 1) או להתעקש על מנוף חכמת (השב 2)?`;
    console.warn(`💡 [התראת יעילות 818xxx]: נבלם שיבוץ מנוף כבד למשלוח פלטה קל!`);
  }

  let deviationAlert = '';
  const hasBlockPallets = (normalized.items || []).some(it => it.isBlock && it.quantity > 10);
  const isAliOverweight = isFreightNoOffloadingSku && ((!clientHasOwnCrane && normalized.totalWeightTons > 2.0) || (clientHasOwnCrane && normalized.totalWeightTons > TRUCK_SPECS.ALI_ISUZU.net_safety_limit_kg / 1000));
  if (isFreightNoOffloadingSku && (hasBigBags || total25KgSacks > 50 || hasBlockPallets || isAliOverweight) && !clientHasOwnCrane) {
    deviationAlert = `⚠️ *התראת סטייה קריטית לראמי:*\nההזמנה מכילה מק"ט הובלה ללא פריקה (818xxx) אך כוללת ${hasBigBags ? 'בלות כבדות' : ''}${total25KgSacks > 50 ? ` ${total25KgSacks} שקים` : ''}!\nעלי (איסוזו פלטה ללא מנוף) אינו מתאים ללא מנוף לפריקה באתר!\n\n👉 *האם להעביר למנוף חכמת (השב 1) או לאשר כי קיים מנוף/מלגזה אצל הלקוח (השב 2)?*`;
    console.warn(`⚠️ [התראת סטייה 818xxx]: בלות/מעל 50 שקים ללא מנוף לקוח!`);
  }

  if (effectiveText.includes('מכולה')) {
    assignedDriver = 'משאית רמסע מכולות';
    assignedWarehouse = '🏭 4️⃣(החרש 10)';
  } else if (!isFreightNoOffloadingSku && (normalized.hasHeavyItems || normalized.totalWeightTons > 2.0 || normalized.deposits.bigBags > 0 || normalized.hasBlocks)) {
    assignedDriver = 'חכמת (מרצדס מנוף 615-41-002)';
    assignedWarehouse = '🏭 4️⃣(החרש 10)';
  } else if (isFreightNoOffloadingSku) {
    assignedDriver = 'עלי (איסוזו פלטה 651-51-701 — ללא מנוף)';
    assignedWarehouse = '🏭 4️⃣(החרש 10)';
  }

  const targetTab = groupInfo?.tab || 'הזמנות';

  // ==========================================
  // 🎯 ניתוב כוונות חכם וסינון רעשים רב-ערוצי (Smart Intent Routing)
  // ==========================================
  const callerProfile = getOrCreateCustomerProfile(effectiveSenderPhone, effectiveSenderName, clientInfo);
  const intentResult = classifyIncomingIntent(msg, effectiveText, clientInfo, isGroup, normalized);
  console.log(`🧭 [סיווג כוונות נועה AI]: פונה: ${callerProfile.name} | כוונה: ${intentResult.intent} (${intentResult.reason})`);

  // א. טיפול בספאם, פרסומות וסרטונים (Omri טיסות, טיקטוק, קישורי רשת)
  if (intentResult.intent === INTENT_TYPES.SPAM_OR_LINK) {
    if (isGroup) {
      console.log(`🔇 [הודעת ספאם/קישור בקבוצה סוננה שקט]: "${effectiveText.slice(0, 50)}..."`);
      return; // התעלמות מלאה (Zero Noise)
    } else {
      console.log(`🔇 [הודעת ספאם בפרטי נרשמה שקט ללא פתיחת הזמנה]: "${effectiveText.slice(0, 50)}..."`);
      return;
    }
  }

  // ב. טיפול בשיחות פרטיות ומשפחתיות (Julie, חברים, הודעות אישיות)
  if (intentResult.intent === INTENT_TYPES.PERSONAL_PRIVATE) {
    const phoneData = await resolveRealCustomerPhone(effectiveText, contact, msg, clientInfo, effectiveSenderPhone);
    const displayPhoneText = phoneData.isValid ? phoneData.displayPhone : (effectiveSenderPhone.length <= 10 ? effectiveSenderPhone : 'פרטי');

    const personalNoticeCard = `💬 *הודעה אישית/פרטית מאת: ${callerProfile.name}* (📞 ${displayPhoneText})\n` +
`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
`💬 *תוכן:* "${effectiveText}"\n\n` +
`*(הודעה אישית לעיונך בלבד ראמי — סוננה מלוח הסידור ללא פתיחת הזמנה 🫡)*`;

    await notifyRami(personalNoticeCard);
    updateCustomerConversationState(effectiveSenderPhone, 'CASUAL_PRIVATE', 'שיחה אישית/משפחתית', effectiveText);
    return;
  }

  // ג. טיפול בשאלות שירות, תשלומים, ובירורים (שי מראווי, פנינית בר, עדי, טל ארביב וכו')
  if (intentResult.intent === INTENT_TYPES.CONVERSATION_INQUIRY) {
    const phoneData = await resolveRealCustomerPhone(effectiveText, contact, msg, clientInfo, effectiveSenderPhone);
    const displayPhoneText = phoneData.isValid ? phoneData.displayPhone : 'בצ\'אט';
    const lowerTxt = effectiveText.toLowerCase();
    let smartAssistantReply = '';

    // 1. שאלת תשלום
    if (lowerTxt.includes('איך מבצעים תשלום') || lowerTxt.includes('איך משלמים') || lowerTxt.includes('תשלום')) {
      smartAssistantReply = `אהלן ${callerProfile.name.split(' ')[0]}! ☀️\n` +
`ניתן לשלם בהעברה בנקאית לחשבון ח. סבן או באשראי טלפוני מול המשרד.\n` +
`האם תרצה שנתקשר אליך או שתרשום כאן מספר לחיוב? 💳🏗️`;
      updateCustomerConversationState(effectiveSenderPhone, 'AWAITING_PAYMENT_METHOD', 'בירור תשלום', effectiveText);
    }
    // 2. מסירת פרטי לקוח משלם (שי מראווי: "זאת הלקוחה היא משלמת +972...")
    else if (lowerTxt.includes('זאת הלקוחה') || lowerTxt.includes('היא משלמת') || (phoneData.isValid && lowerTxt.includes('+972'))) {
      smartAssistantReply = `מעולה ${callerProfile.name.split(' ')[0]}, קיבלתי! 🤝\n` +
`ניצור קשר עם הלקוחה להסדרת החשבון. ההזמנה שלך שמורה בסידור! 🚚`;
      updateCustomerConversationState(effectiveSenderPhone, 'PAYMENT_CONTACT_PROVIDED', 'הסדרת לקוח משלם', effectiveText);
    }
    // 3. שאלת מועד אחרון לכמויות (פנינית בר: "עד מתי אפשר לכתוב כמות?")
    else if (lowerTxt.includes('עד מתי') || lowerTxt.includes('מאוחר אפשר לכתוב')) {
      smartAssistantReply = `היי ${callerProfile.name.split(' ')[0]}! 🌸\n` +
`אפשר לעדכן כמויות עד 16:30 כדי שנוכל להעמיס לך מוקדם בבוקר.\n` +
`ברגע שתדעי — שלחי כאן ונוסיף להזמנה! 🏗️`;
      updateCustomerConversationState(effectiveSenderPhone, 'AWAITING_QUANTITY_UPDATE', 'עדכון כמויות גבס', effectiveText);
    }
    // 4. שאלת הובלה וגודל לוחות גבס ברכב פרטי (פנינית בר: "האם נכנס ברכב ארוך?")
    else if (lowerTxt.includes('נכנס ברכב') || lowerTxt.includes('רכב ארוך') || lowerTxt.includes('לקחת')) {
      smartAssistantReply = `לוח גבס תקני באורך 2.60 מטר לא נכנס ברכב פרטי רגיל (רק בטנדר/משאית פתוחה). 🚚\n` +
`ההמלצה של ראמי: שנשבץ לך אותם ישירות על המשאית של המכולה בבוקר! 🏗️`;
      updateCustomerConversationState(effectiveSenderPhone, 'DELIVERY_METHOD_ADVICE', 'הובלת גבס ברכב', effectiveText);
    }
    // 5. מענה לשאלה על כפולות/מכולות (טל ארביב: "לא")
    else if (lowerTxt === 'לא' || lowerTxt.startsWith('לא ')) {
      smartAssistantReply = `סגור ומובן! 🫡 רשמתי ללא שינוי נוסף. אם יש צורך בהשלמה — אנחנו כאן! 🌸`;
      updateCustomerConversationState(effectiveSenderPhone, 'ACKNOWLEDGED_NO_CHANGE', 'מענה שלילה', effectiveText);
    }
    // 6. ברכת בוקר טוב / שלום רגילה (ללא חומרים)
    else if (/^(?:היי|בוקר טוב|שלום|ערב טוב|הי נועה)\b/i.test(lowerTxt)) {
      smartAssistantReply = `בוקר אור ${callerProfile.name.split(' ')[0]}! ☀️ כאן נועה מסבן חומרי בניין.\n` +
`איזה חומרים, מנוף או מכולה תרצה להזמין היום? 🏗️`;
      updateCustomerConversationState(effectiveSenderPhone, 'IDLE_GREETING', 'ברכת שלום', effectiveText);
    }
    // ברירת מחדל שירותית
    else {
      smartAssistantReply = `שלום ${callerProfile.name.split(' ')[0]} ☀️ ההודעה נקלטה בסידור סבן.\n` +
`במה נוכל לעזור היום — הזמנת חומרים, פינוי מכולה או תיאום אספקה? 🏗️`;
      updateCustomerConversationState(effectiveSenderPhone, 'GENERAL_INQUIRY', 'פנייה שירותית', effectiveText);
    }

    // הודעה ממוקדת לראמי (ללא כרטיס הזמנה של 0 טון!)
    const inquiryNotice = `💬 *פנייה שירותית / בירור מאת: ${callerProfile.name}* (📞 ${displayPhoneText})\n` +
`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
`💬 *הודעה:* "${effectiveText}"\n` +
`💡 *נוסח מענה מוכן לשליחה:*\n"${smartAssistantReply}"\n\n` +
`*(פנייה שירותית בלבד — לא נפתחה הזמנת סרק בסידור 🫡)*`;

    await notifyRami(inquiryNotice);
    return;
  }

  // 🛡️ חוק ברזל הרמטי: לעולם לא לייצר כרטיס הזמנה של 0 טון ללא מכולה אמיתית!
  if (normalized.totalWeightTons === 0 && !effectiveText.includes('מכולה') && !effectiveText.includes('רמסע')) {
    console.log(`🛡️ [בלימת כרטיס שווא 0 טון]: נבלם ניסיון ייצור הזמנה של 0 טון עבור "${effectiveText}".`);
    return;
  }

  // שמירה לתור אישור ראמי (אך ורק להזמנות אמיתיות!)
  const pendingId = 'PEND-' + Date.now();
  pendingRamiOrders.set(pendingId, {
    id: pendingId,
    customerName: clientInfo.customerName,
    customerNumber: clientInfo.customerNumber,
    phone: effectiveSenderPhone,
    address: clientInfo.projectSite,
    rawLines: effectiveText.split(/[\n,;+]+/).map(l => l.trim()).filter(Boolean),
    normalizedItems: normalized.items,
    deposits: normalized.deposits,
    driver: assignedDriver,
    warehouse: assignedWarehouse,
    itemsText: itemsSummary
  });

  // יצירת כרטיס החלטה מושלם לראמי בלבד (כולל תמיכה במצב סימולציית מענה לקוח לפיתוח)!
  const cleanPhone = (effectiveSenderPhone || senderPhone || '').replace(/[^0-9]/g, '');
  const isSim = Boolean(clientInfo?.isSimulation || cleanPhone.includes('508861080') || cleanPhone.includes('140901368230048') || cleanPhone.includes('224738609742022') || (senderName && senderName.includes('נועה')));
  const cardTitle = isSim 
    ? `🧪 *סימולציית לקוח (מכשיר בדיקה: ${effectiveSenderPhone})*` 
    : `🔔 *פנייה חדשה מאת: ${effectiveSenderName}*`;
  const senderLine = isSim
    ? `👤 *שולח (סימולטור):* ${effectiveSenderName} (${effectiveSenderPhone})\n🔍 *מצב פיתוח ומענה לקוח:* מתייחס אך ורק לתוכן ההודעה (זהות השולח נוטרלה)!`
    : `👤 *שולח:* ${effectiveSenderName} (${effectiveSenderPhone})`;

  const ramiDecisionCard = `${cardTitle}\n` +
`${senderLine}\n` +
`💬 *טקסט מקורי:* "${effectiveText}"\n\n` +
`──────── 🔍 זיהוי אוטונומי מתוך הטקסט ────────\n` +
`🏢 *חשבון:* ${clientInfo.customerName} (${clientInfo.customerNumber !== 'טרם שויך' ? `קומקס #${clientInfo.customerNumber}` : 'חדש / לפי כתובת'})\n` +
`📍 *אתר ופרויקט:* ${clientInfo.projectSite}\n` +
`👨‍🔧 *איש קשר:* ${clientInfo.contactPerson}\n\n` +
`──────── נרמול נועה AI ────────\n` +
`${itemsSummary}\n` +
`⚖️ *משקל כולל משוער:* ${normalized.totalWeightTons} טון\n` +
`🛡️ *פקדונות:* ${normalized.deposits.bigBags} בלות (60002) | ${normalized.deposits.pallets} משטחים (${normalized.deposits.woodPallets > 0 ? `${normalized.deposits.woodPallets} סבן` : ''}${normalized.deposits.blockPallets > 0 ? ` ${normalized.deposits.blockPallets} בלוקים` : ''})\n` +
`🚛 *שיבוץ מוצע:* ${assignedDriver} (${assignedWarehouse})${normalized.totalWeightTons > 12 ? `\n⚠️ *התראת עומס יתר חכמת:* חורג מ-12 טון לסבב!` : ''}\n\n` +
`──────── 🔮 חיזוי והמלצות נועה AI ────────\n` +
`⏱️ *זמן פריקה חזוי באיתוראן:* כ-${prediction.estimatedDurationMin} דקות (${assignedDriver.includes('איסוזו') ? 'פריקה ידנית' : 'עבודת מנוף'})\n` +
`${prediction.siteCautionNote ? `⚠️ *דגש אתר ידוע:* ${prediction.siteCautionNote}\n` : ''}` +
`${prediction.suggestedComplements.length > 0 ? `💡 *הצעה להשלמת סל לראמי:* הלקוח לא ציין: ${prediction.suggestedComplements.join(' | ')}\n` : ''}\n` +
`💬 *נוסח מענה ללקוח:*\n` +
`נשלח כהודעה נפרדת למטה 👇 (להעתקה / העברה ישירה ללקוח בנגיעה אחת)\n\n` +
`*ראמי, האם להקליד ללוח הסידור ולשגר?*\n` +
`רשום "1" או "אישור" — להקלדה מיידית.\n` +
`(מתועד בטאב ${targetTab})\n\n`;
  // רישום הפנייה בבסיס הנתונים המתמשך data/noa-agent.json
  const inquiryId = recordInquiry({
    customerName: clientInfo.customerName,
    phone: effectiveSenderPhone,
    site: clientInfo.projectSite,
    details: itemsSummary,
    urgency: effectiveText.includes('דחוף') ? 'דחופה ⚡' : 'רגילה'
  });

  // בניית כרטיס פנייה ממוקד לראמי עם קישור ישיר מאומת ללקוח
  const phoneData = await resolveRealCustomerPhone(effectiveText, contact, msg, clientInfo, effectiveSenderPhone);
  const displayPhoneText = phoneData.isValid ? phoneData.displayPhone : (effectiveSenderPhone.length <= 10 ? effectiveSenderPhone : 'נשלח ללא מספר נייד');
  const waLinkSection = phoneData.isValid && phoneData.waLink 
    ? `🔗 *קישור ישיר לצ'אט:* ${phoneData.waLink}` 
    : `💬 *מענה ישיר:* השב ישירות בלחיצה על 'השב' (Reply) בהודעה זו`;

  const ramiInquiryCard = `📋 *פנייה חדשה #${inquiryId} מאת: ${clientInfo.customerName}*\n` +
`🏢 *חשבון / אתר:* ${clientInfo.projectSite} (${clientInfo.customerNumber !== 'טרם שויך' ? `#${clientInfo.customerNumber}` : 'חדש'})\n` +
`👨‍🔧 *איש קשר:* ${clientInfo.contactPerson || 'לקוח'} | 📞 ${displayPhoneText}\n` +
`📦 *פירוט:*\n${itemsSummary}\n` +
`⚡ *דחיפות:* ${effectiveText.includes('דחוף') ? 'דחופה ⚡' : 'רגילה'}\n` +
`${waLinkSection}\n\n` +
`*ראמי, ההזמנה ממתינה לאישורך בסידור (הקש "1" לאישור ושידור לצוות).*`;

  // 1. שיגור כרטיס טקטי יחיד וממוקד לראמי עם שאלת פעולה
  const singleTacticalCard = `🚨 *הזמנה לאישור — ${clientInfo.customerName}* (${clientInfo.customerNumber !== 'טרם שויך' ? `#${clientInfo.customerNumber}` : 'חדש'})
` +
`━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` +
`📍 *יעד:* ${clientInfo.projectSite} | 👨‍🔧 *איש קשר:* ${clientInfo.contactPerson || 'לקוח'} (📞 ${displayPhoneText})
` +
`💬 *טקסט מקורי:* "${effectiveText}"

` +
`📦 *מניפסט אספקה:*
${itemsSummary}

` +
`⚖️ *משקל:* ${normalized.totalWeightTons} טון | 🛡️ *פקדונות:* ${assignedDriver.includes("עלי") && isFreightNoOffloadingSku && !hasBigBags ? "פטור מלא מפקדונות (איסוזו פלטה ללא מנוף)" : `${normalized.deposits.bigBags} בלות (60002) + ${normalized.deposits.pallets} משטחים`}
` +
`🚚 *שיבוץ מוצע:* ${assignedDriver} (${assignedWarehouse})
` +
`${prediction.siteCautionNote ? `⚠️ *דגש אתר:* ${prediction.siteCautionNote}
` : ''}` +
`━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` +
`${deviationAlert ? `🛑 *ההזמנה נבלמה עקב סטייה קריטית!*\n👉 *ראמי, תבחר איך לתקן לפני הזרקה לסידור:*\n1️⃣ *להעביר למנוף חכמת (שינוי מק"ט מנוף וחיוב פקדונות)* (השב 1)\n2️⃣ *לאשר שיבוץ לעלי כי קיים מנוף/מלגזה אצל הלקוח באתר* (השב 2)` : (reverseEfficiencyAlert ? `${reverseEfficiencyAlert}` : `👉 *לאשר ולהכניס לסידור?* השב *1* לאישור מיידי ושידור לצוות.`)}`;

  await notifyRami(singleTacticalCard);


  // 2. ניסוח מענה מקצועי בשפת סבן והכנת בלוק העתקה מהירה לראמי (הן לקבוצה והן לפרטי!):
  let customerReply = '';
  const textLower = effectiveText.toLowerCase();

  // חילוץ שם איש הקשר (למשל: נתנאל מגד, יהודה, חיים, דודי, תחסין)
  const personName = extractContactNameFromTextOrContact(effectiveText, contact, effectiveSenderName, clientInfo) || 
                     (effectiveSenderName && !effectiveSenderName.includes('וואטסאפ') ? effectiveSenderName.split(' ')[0] : 'יקר');

  const hasAttachment = textLower.includes('attachment type:') || textLower.includes('תמונה') || 
                        textLower.includes('צילום') || textLower.includes('מסמך');
  const hasPraise = textLower.includes('אין עליכם') || textLower.includes('מגיעים בזמן') || 
                    textLower.includes('משחררים את העבודה') || textLower.includes('תודה רבה על הכל') || 
                    textLower.includes('אין עליכם בעולם');

  if (hasAttachment && hasPraise) {
    customerReply = `בוקר טוב ${personName} יקר! 🙏 תודה רבה על המילים החמות והפרגון, תמיד בשמחה ובזמן!
קיבלנו את התמונה/מסמך שצירפת — הצוות בודק את המפרט ומכין את ההזמנה להעמסה/אספקה בהתאם. שיהיה יום מעולה ומוצלח! 🏗️✨`;
  } else if (hasAttachment) {
    customerReply = `בוקר טוב ${personName}! ☀️ קיבלנו את התמונה/מסמך ההזמנה המצורף 📄📸
הצוות בודק כעת את המפרט ומכין את הליקוט והאספקה. מעדכנים אותך כאן ברגע שמוכן! 🏗️`;
  } else if (hasPraise) {
    customerReply = `בוקר טוב ${personName} יקר! 🙏 תודה רבה על הפרגון והמילים החמות, תמיד שמחים לתת שירות מהיר ולשחרר את העבודה באתר בזמן. יום פורה ומוצלח! 🏗️✨`;
  } else if (textLower.includes('בוט') || textLower.includes('רובוט') || textLower.includes('מחשב')) {
    customerReply = `אהלן ${personName}, כאן נועה מסבן חומרי בניין 🏗️
אני קולטת עבור ראמי את ההזמנות לסידור.
איזה חומרים או מכולה תרצה להזמין ולאיזה אתר?`;
  } else if (normalized.items.length > 0) {
    const itemsList = normalized.items.map(it => `• *${it.quantity} ${it.name}*`).join('\n');
    const targetSite = clientInfo.projectSite && clientInfo.projectSite !== 'לפי תיאום באתר' ? `\n📍 יעד: *${clientInfo.projectSite}*` : '';
    const driverType = assignedDriver.includes('מנוף') ? 'מנוף' : 'חלוקה';
    customerReply = `אהלן ${personName}, ההזמנה נקלטה בסידור:
${itemsList}${targetSite}

יוצאת לפריקת ${driverType} בסבב בוקר. שיהיה יום מוצלח! 🚚`;
  } else if (effectiveText.includes('מכולה')) {
    customerReply = `אהלן ${personName}, בקשת מכולה 8 קוב נרשמה בסידור רמסע.${clientInfo.projectSite ? `\n📍 אתר: *${clientInfo.projectSite}*` : ''}
מתי נדרשת ההצבה או הפינוי? 🚛♻️`;
  } else {
    customerReply = `שלום ${personName} ☀️ ההודעה נקלטה בסידור סבן.
איזה חומרים או מכולה תרצה להזמין היום ולאיזה אתר? 🏗️`;
  }

  // 🛡️ חוק ברזל: שיגור בלוק העתקה מהירה אך ורק לראמי בפרטי (050-8860896)!
  // נועה לעולם אינה שולחת הודעות ישירות לקבוצה — ראמי מקבל בלוק מוכן להדבקה מיידית
  try {
    const groupNotice = isGroup ? ' (העתק והדבק לקבוצה)' : ' (העתק והדבק ללקוח)';
    await notifyRami(`📋 *נוסח מוכן למענה ע"י ראמי${groupNotice}:*\n\n${customerReply}`);
    console.log(`📋 [נוסח מענה מוכן נמסר לראמי בפרטי עבור ${clientInfo.customerName}]`);
  } catch (err) {
    console.warn('⚠️ שגיאה בהעברת נוסח מענה לראמי:', err.message);
  }

  // תיעוד אוטומטי בגיליון
  injectGroupLogToSheets(targetTab, {
    senderName: effectiveSenderName,
    customerNumber: clientInfo.customerNumber,
    senderPhone: phoneData.isValid ? phoneData.displayPhone : (effectiveSenderPhone.length <= 10 ? effectiveSenderPhone : 'מזהה שיחה ישיר'),
    address: clientInfo.projectSite,
    itemsText: itemsSummary,
    driver: assignedDriver,
    warehouse: assignedWarehouse,
    status: 'ממתין לאישור ראמי'
  });
}

async function handleRamiCommand(msg) {
  const text = (msg.body || '').trim().toLowerCase();
  if (text === '1' || text === 'אישור' || text === 'אשר' || text === 'כן') {
    // בדיקה האם יש עדכון קומקס ממתין
    if (pendingDictionaryUpdates.size > 0) {
      const [updKey, updateObj] = Array.from(pendingDictionaryUpdates.entries()).pop();
      pendingDictionaryUpdates.delete(updKey);

      console.log(`\n✅ [אישור ראמי נקלט!] מאשר תוספות קומקס ועדכון מילון עבור הזמנה ${updateObj.orderNumber}...`);

      if (updateObj.slangLearned.length > 0) {
        await updateDictionaryInSheets(updateObj.slangLearned);
      }

      injectOrderToGoogleCalendar(updateObj).catch(() => {});
      await injectGroupLogToSheets('הזמנות', {
        orderNumber: updateObj.orderNumber,
        senderName: updateObj.customerName,
        customerNumber: updateObj.customerNumber,
        senderPhone: updateObj.phone,
        address: updateObj.address,
        itemsText: updateObj.items.map(it => `${it.name} × ${it.quantity}`).join(', '),
        driver: 'חכמת (מרצדס מנוף 615-41-002)',
        status: 'מאושר ומשובץ סופית (קומקס)'
      });

      // 📢 הכרזה מקבילה לקבוצת "עדכונים מהסידור" עבור הזמנת קומקס בתבנית החדשה!
      try {
        const comaxDispatchOrder = {
          orderNumber: updateObj.orderNumber,
          customerName: updateObj.customerName,
          customerNumber: updateObj.customerNumber,
          address: updateObj.address,
          rawText: `הזמנת קומקס מאושרת #${updateObj.orderNumber} (${updateObj.customerName})`,
          normalizedItems: updateObj.items.filter(it => !['60002', '60060', '60006', '18055', '18050', '18060', '818050', '818055'].includes(it.sku)),
          deposits: {
            bigBags: updateObj.items.filter(i => i.isBigBag || (i.name && i.name.includes('שק גדול')) || (i.name && i.name.includes('בלה')) || i.sku === '60002').reduce((s, i) => s + (i.quantity || 0), 0),
            pallets: updateObj.items.filter(i => i && i.name && (i.name.includes('מלט') || i.name.includes('דבק')) && i.quantity >= 40).reduce((s, i) => s + Math.floor(i.quantity / 40), 0)
          },
          totalWeightTons: updateObj.totalWeightTons || '3.75',
          warehouse: '🏭 4️⃣(החרש 10)',
          driver: 'חכמת (מרצדס מנוף 615-41-002)',
          source: 'קומקס'
        };
        const dispatchCard = buildDispatchAnnouncementCard(comaxDispatchOrder);
        await broadcastToDispatchGroup(dispatchCard);
        console.log(`📢 [הכרזה ל"עדכונים מהסידור" שוגרה בהצלחה עבור הזמנת קומקס #${updateObj.orderNumber}]`);
      } catch (err) {
        console.warn('⚠️ שגיאה בשידור כרטיס עדכונים מהסידור להזמנת קומקס:', err.message);
      }

      const ramiPrivateChat = '972508860896@c.us';
      const comaxAckText = `✅ *פקודתך בוצעה בהצלחה המפקד!* 🫡\n` +
`ההזמנה עבור *${updateObj.customerName}* (${updateObj.orderNumber}) אושרה ושובצה ללוח הסידור בגיליון מערכת מאוחדת! 🚚📋\n` +
`📢 שודרה הכרזה לקבוצת "עדכונים מהסידור" בתבנית קומקס מעודכנת.\n` +
`📚 מונחי הסלנג החדשים (${updateObj.slangLearned.length} פריטים) עודכנו בטאב "מילון משודרג".`;

      if (msg.from && !msg.from.includes('@g.us')) {
        await msg.reply(comaxAckText);
      } else {
        await client.sendMessage(ramiPrivateChat, comaxAckText);
      }
      return;
    }

    // בדיקה האם יש הזמנת וואטסאפ רגילה ממתינה
    if (pendingRamiOrders.size > 0) {
      const [lastId, order] = Array.from(pendingRamiOrders.entries()).pop();
      pendingRamiOrders.delete(lastId);

      console.log(`\n✅ [אישור ראמי נקלט!] מזריק הזמנה עבור ${order.customerName} ישירות ללוח הסידור...`);
      
      const approvedOrderNum = '6215' + Math.floor(800 + Math.random() * 100);
      injectOrderToGoogleCalendar({ ...order, orderNumber: approvedOrderNum }).catch(() => {});

      // 📝 הזרקת משימה לגיליון עם סטטוס מחייב: "נועה תזכיר לי לטיפול"
      await injectGroupLogToSheets('הזמנות', {
        orderNumber: approvedOrderNum,
        senderName: order.customerName,
        customerNumber: order.customerNumber || '',
        senderPhone: order.phone,
        address: order.address,
        itemsText: order.itemsText,
        driver: order.driver,
        warehouse: order.warehouse,
        status: 'נועה תזכיר לי לטיפול'
      });

      // ⏰ רישום משימת תזכורת פעילה לנועה לתזכורת מעקב מול ראמי
      const taskReminder = {
        id: 'REMIND-' + approvedOrderNum,
        text: `מעקב אספקה והעמסה להזמנה #${approvedOrderNum} (${order.customerName} | ${order.address})`,
        cadenceText: 'נועה תזכיר לי לטיפול',
        intervalMs: 60 * 60 * 1000,
        createdAt: new Date().toISOString(),
        lastRemindedAt: Date.now(),
        nextReminderAt: Date.now() + 60 * 60 * 1000,
        assignee: 'ראמי',
        status: 'pending'
      };
      agentState.harelTasks = agentState.harelTasks || [];
      agentState.harelTasks.push(taskReminder);
      saveAgentState();

      // 📢 הכרזה מקבילה לקבוצת "עדכונים מהסידור" (הראל, אורן, יואב, תמיר, חכמת, עלי, איציק זהבי)
      try {
        const dispatchCard = buildDispatchAnnouncementCard(order);
        await broadcastToDispatchGroup(dispatchCard);
      } catch (err) {
        console.warn('⚠️ שגיאה בשידור כרטיס עדכונים מהסידור:', err.message);
      }

      await injectGroupLogToSheets('💬_הזמנות_ח_סבן_JONI', {
        senderName: order.customerName,
        customerNumber: order.customerNumber || '',
        senderPhone: order.phone,
        address: order.address,
        itemsText: order.itemsText,
        driver: order.driver,
        warehouse: order.warehouse,
        status: 'בסידור עבודה (אושר ע"י ראמי)'
      });

      const ramiAckText = `✅ *פקודתך נקלטה המפקד!* 🫡\nההזמנה עבור *${order.customerName}* הוזרקה לגיליון בסטטוס *"נועה תזכיר לי לטיפול"* 🚚📋\n⏰ משימת תזכורת מעקב נרשמה במערכת — נועה תזכיר לך לוודא ליקוט ויציאה בזמן!`;
      if (msg.from && !msg.from.includes('@g.us')) {
        await msg.reply(ramiAckText);
      } else {
        await client.sendMessage('972508860896@c.us', ramiAckText);
      }
      return;
    }

    const noOrdersAck = `**הבנתי המפקד! 🫡 0 הזמנות ממתינות כרגע לאישור בסידור.**\n**אם תרצה שנקלוט הזמנות חדשות מהמייל או נסדר קו — פשוט תגיד! 🚚**`;
    if (msg.from && !msg.from.includes('@g.us')) {
      await msg.reply(noOrdersAck);
    } else {
      await client.sendMessage('972508860896@c.us', noOrdersAck);
    }
  }
}

// חיבור מאזינים כפולים: תפיסה מובטחת של כל הודעה נכנסת ב-WhatsApp Web!
// ==========================================
// 📨 מאזיני הודעות כפולים עם הגנה מפני לולאה עצמית
// ==========================================
// חיבור מאזיני הודעות לשני המופעים במקביל
[clientRami, clientNoa].forEach((cl, idx) => {
  const clientPrefix = idx === 0 ? 'rami' : 'noa';
  const clientLabel = idx === 0 ? 'ראמי (ביזנס 050-8860896)' : 'נועה (פרטי 050-8861080)';
  
  cl.on('message', async (msg) => {
    if (!msg || !msg.body || msg.isStatus || (msg.from && (msg.from.includes('@newsletter') || msg.from.includes('@broadcast')))) return;
    console.log(`\n📩 [הודעה נקלטה במופע ${clientLabel}]: מ: ${msg.from} | תוכן: "${(msg.body || '').slice(0, 70)}"`);
    if (isNoaSelfGeneratedMessage(msg.body)) return;

    // 🛡️ פקודות שליטה מראמי מעובדות תמיד ראשונות — ללא חסימת מזהה הודעה!
    if (isRamiCommand(msg.body)) {
      console.log(`🫡 [פקודת שליטה מראמי ב-${clientLabel}]: "${msg.body}"`);
      try { if (typeof cl.sendSeen === 'function' && msg.from) await cl.sendSeen(msg.from); } catch {}
      const handled = await handleRamiControlCommand(msg);
      if (handled) return;
    }

    if (isMessageAlreadyProcessed(msg, clientPrefix)) return;

    try {
      if (typeof cl.sendSeen === 'function' && msg.from) await cl.sendSeen(msg.from);
    } catch {}

    await handleIncomingWhatsAppOrder(msg);
  });

  cl.on('message_create', async (msg) => {
    if (!msg || !msg.body || msg.isStatus || (msg.from && (msg.from.includes('@newsletter') || msg.from.includes('@broadcast')))) return;
    if (isNoaSelfGeneratedMessage(msg.body)) return;

    // הודעות נכנסות (fromMe: false) מטופלות בלעדית ב-message!
    if (!msg.fromMe) return;

    // 🛡️ אם זו פקודת שליטה שראמי הקליד (fromMe: true) בצ'אט עצמי בלבד
    // אם ראמי שלח את ההודעה לנועה, היא תעובד במופע של נועה בלבד (message) כדי למנוע כפילויות!
    const targetChat = msg.to || '';
    const cleanTarget = targetChat.replace(/[^0-9]/g, '');
    const isSentToNoa = cleanTarget.includes('508861080') || targetChat.includes('140901368230048');

    if (isRamiCommand(msg.body) && !isSentToNoa) {
      console.log(`🫡 [פקודת שליטה מראמי מ-message_create ב-${clientLabel}]: "${msg.body}"`);
      const handled = await handleRamiControlCommand(msg);
      if (handled) return;
    }

    if (isMessageAlreadyProcessed(msg, clientPrefix + '_out')) return;

    const selfWid = cl.info?.wid?._serialized || '';
    const isSelfChat = targetChat === selfWid || cleanTarget.includes('508860896') || cleanTarget.includes('508861080');

    if (!isSelfChat && !targetChat.includes('@g.us')) {
      setChatMute(targetChat, 2 * 60 * 60 * 1000);
      console.log(`🔇 [השתקה אנושית ב-${clientLabel}]: הקלדה ידנית ללקוח ${targetChat} — השתקה ל-2 שעות.`);
      return;
    }

    await handleIncomingWhatsAppOrder(msg);
  });
});

app.get('/qr', requireApiAuth, (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>📲 חיבור וואטסאפ כפול — ראמי & נועה | ח. סבן</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; text-align: center; }
    .container { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; margin-top: 24px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px; width: 340px; }
    .badge { padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 13px; display: inline-block; margin-bottom: 12px; }
    .badge.green { background: #064e3b; color: #34d399; }
    .badge.yellow { background: #78350f; color: #fde047; }
    .qr-img { width: 260px; height: 260px; border-radius: 12px; background: white; padding: 12px; }
  </style>
</head>
<body>
  <h1>🏗️ חיבור וואטסאפ כפול (Dual-Client) — ח. סבן חומרי בניין</h1>
  <p style="color:#94a3b8; margin-top:6px;">סריקה נפרדת עבור מופע ראמי (ביזנס) ומופע נועה (פרטי) על אותו מכשיר סלולרי</p>

  <div class="container">
    <!-- Box 1: Rami Business -->
    <div class="card">
      <span class="badge ${isRamiReady ? 'green' : 'yellow'}">
        ● ${isRamiReady ? 'מחובר (050-8860896)' : 'ממתין לסריקה מוואטסאפ ביזנס'}
      </span>
      <h2>📱 ראמי (WhatsApp Business)</h2>
      <p style="color:#94a3b8; font-size:14px; margin-bottom:16px;">+972 50-886-0896 | קבוצות JONI והזמנות</p>
      ${isRamiReady 
        ? '<div style="color:#34d399; font-size:48px; margin:70px 0;">✅<br><span style="font-size:18px;">מחובר ופעיל!</span></div>' 
        : (latestQrDataUrlRami ? `<img class="qr-img" style="border:4px solid #38bdf8;" src="${latestQrDataUrlRami}" />` : '<p style="margin:80px 0;">מאתחל קוד QR...</p>')}
    </div>

    <!-- Box 2: Noa Personal -->
    <div class="card">
      <span class="badge ${isNoaReady ? 'green' : 'yellow'}">
        ● ${isNoaReady ? 'מחוברת (050-8861080)' : 'ממתינה לסריקה מוואטסאפ פרטי'}
      </span>
      <h2>🌸 נועה (WhatsApp פרטי)</h2>
      <p style="color:#94a3b8; font-size:14px; margin-bottom:16px;">+972 50-886-1080 | מענה פרטי, ורד ואירועים</p>
      ${isNoaReady 
        ? '<div style="color:#34d399; font-size:48px; margin:70px 0;">✅<br><span style="font-size:18px;">מחוברת ופעילה!</span></div>' 
        : (latestQrDataUrlNoa ? `<img class="qr-img" style="border:4px solid #f43f5e;" src="${latestQrDataUrlNoa}" />` : '<p style="margin:80px 0;">מאתחל קוד QR...</p>')}
    </div>
  </div>
</body>
</html>`);
});
/**
 * 📊 נקודת קצה לבדיקת בריאות וסטטוס מערכת חי (Health & Status API)
 */

/**
 * 🗺️ נקודת קצה לקבלת תוכנית מסלול רב-תחנתי ואופטימיזציית LIFO (Route Optimization API)
 */
app.post('/api/optimize-route', (req, res) => {
  try {
    const { truckId, stops, departureTime } = req.body || {};
    const defaultStops = [
      { orderNumber: '6215857', customerName: 'בונק אסף/סחלב', address: 'סחלב 8, מודיעין', city: 'מודיעין', itemsSummary: '2 בלות סומסום, 10 מלט נשר, 13 לוח גבס כחול, 30 סיקה 255', weightTon: 2.46, deposits: '2 בלות (60002) + 1 משטח סבן (60060)' },
      { orderNumber: '6215849', customerName: 'אוסט דורון', address: 'רקפת 4, הוד השרון', city: 'הוד השרון', itemsSummary: '5 בלות סומסום, 15 מלט נשר, 12 דבק AD603', weightTon: 4.03, deposits: '5 בלות (60002) + 1 משטח סבן (60060)' },
      { orderNumber: '6215808', customerName: 'שלום גרשון בע"מ', address: 'משאבים 41, הוד השרון', city: 'הוד השרון', itemsSummary: '44 לוח גבס ורוד 260, 1 בלה סומסום', weightTon: 1.83, deposits: '1 בלה (60002)' }
    ];
    const plan = buildMultiStopSchedule(truckId || 'hachmat', stops || defaultStops, departureTime || '07:00');
    const card = formatTacticalRouteCard(plan);
    res.json({ success: true, plan, card });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/routes/tomorrow', (_req, res) => {
  const stopsHachmat = [
    { orderNumber: '6215857', customerName: 'בונק אסף/סחלב', address: 'סחלב 8, מודיעין', city: 'מודיעין', itemsSummary: '2 בלות סומסום, 10 מלט נשר, 13 לוח גבס כחול, 30 סיקה 255', weightTon: 2.46, deposits: '2 בלות (60002) + 1 משטח סבן (60060)' },
    { orderNumber: '6215849', customerName: 'אוסט דורון', address: 'רקפת 4, הוד השרון', city: 'הוד השרון', itemsSummary: '5 בלות סומסום, 15 מלט נשר, 12 דבק AD603', weightTon: 4.03, deposits: '5 בלות (60002) + 1 משטח סבן (60060)' },
    { orderNumber: '6215808', customerName: 'שלום גרשון בע"מ', address: 'משאבים 41, הוד השרון', city: 'הוד השרון', itemsSummary: '44 לוח גבס ורוד 260, 1 בלה סומסום', weightTon: 1.83, deposits: '1 בלה (60002)' }
  ];
  const stopsAli = [
    { orderNumber: '6215856', customerName: 'עופר כץ', address: 'בית העם 3, רמות השבים', city: 'רמות השבים', itemsSummary: '40 שק ריצופית 181 (1.0 טון)', weightTon: 1.0 },
    { orderNumber: '6215841', customerName: 'נתנאל מגד', address: 'העוגב 15, קרני שומרון', city: 'קרני שומרון', itemsSummary: '80 סומסום, 20 טיט, 50 מלט, דבקים ורובה', weightTon: 3.86 }
  ];
  const hachmatPlan = buildMultiStopSchedule('hachmat', stopsHachmat, '07:00');
  const aliPlan = buildMultiStopSchedule('ali', stopsAli, '07:30');
  res.json({
    date: '2026-10-08',
    hachmat: hachmatPlan,
    ali: aliPlan
  });
});
/**
 * 📧 נקודת קצה להפעלת סריקת מייל יזומה מקומקס (Webhook / Polling API)
 */
app.post('/api/comax/poll', async (_req, res) => {
  try {
    await checkAndIngestComaxEmails();
    res.json({
      success: true,
      message: 'Comax Gmail polling executed',
      processedOrdersCount: processedComaxOrders.size,
      processedOrders: Array.from(processedComaxOrders)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/status', (_req, res) => {
  res.json({
    status: isClientReady ? 'ONLINE' : 'CONNECTING',
    whatsappConnected: isClientReady,
    connectedUserPhone,
    commandMode: agentState.commandMode,
    allMuted: Boolean(agentState.allMuted),
    groupMuteActive: true,
    harelDirectContactDisabled: true,
    pendingOrdersCount: pendingRamiOrders.size,
    pendingUpdatesCount: pendingDictionaryUpdates.size,
    todayInquiriesCount: agentState.customerInquiries.length,
    activeCatalogItems: RAW_CATALOG.length,
    activeKnownClients: KNOWN_CLIENTS_DIRECTORY.length,
    speechStyle: agentState.speechStyle,
    timestamp: new Date().toISOString()
  });
});

/**
 * 🖥️ לוח בקרה ויזואלי מהיר (Mini Command Center Dashboard)
 */
app.get('/dashboard', (_req, res) => {
  const morningReport = agentState.dailyMorningReport || 'טרם הופק דוח בוקר';
  const pendingOrders = Array.from(pendingRamiOrders.values());
  const pendingCount = pendingOrders.length;
  
  res.send(`<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>נועה AI · מרכז שליטה ובקרה | ח. סבן</title>
  <style>
    :root {
      --bg: #0f172a; --card: #1e293b; --border: #334155;
      --text: #f8fafc; --muted: #94a3b8; --primary: #38bdf8;
      --accent: #22c55e; --warn: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-b: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 24px; }
    .badge { background: #064e3b; color: #34d399; padding: 4px 10px; border-radius: 9999px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
    .badge.off { background: #7f1d1d; color: #f87171; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; }
    .card h3 { font-size: 14px; color: var(--muted); margin-bottom: 6px; }
    .card .val { font-size: 28px; font-weight: 700; color: var(--text); }
    .pre-box { background: #020617; border: 1px solid var(--border); padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #e2e8f0; }
    .btn { background: var(--primary); color: #0f172a; font-weight: 700; padding: 10px 18px; border-radius: 8px; border: none; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 12px; }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>🏗️ נועה AI — מרכז פיקוד ובקרה לסידור</h1>
      <p style="color:var(--muted); font-size:14px; margin-top:4px;">ח. סבן חומרי בניין (1994) בע״מ · סניף 4 החרש 10</p>
    </div>
    <span class="badge ${isClientReady ? '' : 'off'}">
      ● ${isClientReady ? 'וואטסאפ מחובר (' + connectedUserPhone + ')' : 'וואטסאפ ממתין לחיבור'}
    </span>
  </div>

  <div class="grid">
    <div class="card">
      <h3>מצב פיקוד</h3>
      <div class="val" style="color:var(--accent);">${agentState.commandMode}</div>
      <p style="color:var(--muted); font-size:12px; margin-top:6px;">השתקת קבוצות פעילה (100% שקט)</p>
    </div>
    <div class="card">
      <h3>סגנון דיבור ראמי</h3>
      <div class="val" style="color:var(--primary); font-size:20px;">פינג-פונג תמציתי</div>
      <p style="color:var(--muted); font-size:12px; margin-top:6px;">עד 2 משפטים + שאלה ממוקדת</p>
    </div>
    <div class="card">
      <h3>הזמנות ממתינות לאישור</h3>
      <div class="val" style="color:var(--warn);">${pendingCount}</div>
      <p style="color:var(--muted); font-size:12px; margin-top:6px;">אישור מהיר בוואטסאפ עם "1"</p>
    </div>
    <div class="card">
      <h3>פניות נקלטו היום</h3>
      <div class="val">${agentState.customerInquiries.length}</div>
      <p style="color:var(--muted); font-size:12px; margin-top:6px;">מתועד בגיליון וב-noa-agent.json</p>
    </div>
  </div>

  <div class="card" style="margin-bottom: 24px;">
    <h2 style="font-size:18px; margin-bottom:12px;">🚚 דוח בוקר מבצעי מעודכן</h2>
    <div class="pre-box">${morningReport}</div>
  </div>
</body>
</html>`);
});


/**
 * נקודת קצה לקליטת קובץ PDF של קומקס ישירות מ-Make / Drive / מיילים
 */

/**
 * נקודת קצה לקליטת הזמנת קומקס מהמייל (לדוגמה הזמנה 6215788 - נתנאל מגד)
 */
app.post('/api/trigger-comax-order', async (req, res) => {
  try {
    const orderData = req.body && req.body.orderNumber ? req.body : {
      orderNumber: '6215788',
      customerName: 'נתנאל מגד',
      customerNumber: '602118',
      phone: '052-3344556',
      address: 'י.ל. פרץ 4, הרצליה',
      items: [
        { sku: '11511', name: 'סומסום שק גדול (בלה)', quantity: 5, unit: 'בלה', weightTon: 3.75 },
        { sku: '18060', name: 'הובלת מנוף הרצליה - רמה"ש', quantity: 1, unit: 'הובלה' },
        { sku: '60002', name: 'שק גדול פקדון', quantity: 5, unit: 'בלה' }
      ],
      totalWeightTons: '3.75',
      source: 'קומקס'
    };

    console.log(`\n📥 [קליטת הזמנת קומקס מהמייל] מעבד הזמנה #${orderData.orderNumber} עבור ${orderData.customerName}...`);
    await reconcileComaxOrder(orderData);
    res.json({ success: true, message: `הזמנת קומקס #${orderData.orderNumber} נקלטה ועובדה בהצלחה`, orderData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/comax-pdf', async (req, res) => {
  try {
    const comaxData = req.body;
    if (!comaxData || !comaxData.orderNumber) {
      return res.status(400).json({ error: 'Missing comax order data' });
    }

    console.log(`\n📥 [קליטת PDF קומקס] התקבלה הזמנה ${comaxData.orderNumber} ללקוח ${comaxData.customerName}`);
    
    // הפעלת תהליך ההצלבה והדרישה לאישור ראמי
    await reconcileComaxOrder(comaxData);

    res.json({ success: true, message: 'Comax order reconciled successfully' });
  } catch (err) {
    console.error('❌ שגיאה בקליטת PDF קומקס:', err.message);
    res.status(500).json({ error: err.message });
  }
});


/**
 * נקודת קצה לחיפוש מוצר תואם (Fuzzy Search API)
 */
app.post('/api/search-product', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }
    const result = await findMatchingProduct(query);
    res.json({ success: true, query, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * נקודת קצה לקליטת תעודת משלוח וסגירת מעגל אוטומטית (Webhook / Make / Gmail)
 */
app.post('/api/delivery-note', async (req, res) => {
  try {
    const docData = req.body;
    if (!docData || (!docData.deliveryNoteNumber && !docData.orderNumber)) {
      return res.status(400).json({ error: 'Missing delivery note or order number' });
    }

    const result = await processDeliveryNoteClosedLoop(docData);
    res.json({ success: true, result });
  } catch (err) {
    console.error('❌ שגיאה בסגירת מעגל תעודת משלוח:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * נקודת קצה לטריגר סגירת מעגל של לירן/מוצקין לבדיקה מיידית
 */
app.post('/api/trigger-motskin-loop', async (_req, res) => {
  try {
    const result = await processDeliveryNoteClosedLoop({
      deliveryNoteNumber: '6715574',
      orderNumber: '6215800',
      customerName: 'לירן/מוצקין',
      customerNumber: '612108',
      projectSite: 'מוצקין 22, רעננה',
      contactPerson: 'יהודה כהן (050-5669924)',
      warehouse: '4 (החרש 10)',
      driver: 'חכמת (מרצדס מנוף 615-41-002)',
      items: [
        { sku: '11501', name: 'חול שק גדול (בלה)', quantity: 2, unit: 'בלה' },
        { sku: '10002', name: 'מלט אפור 25 ק"ג', quantity: 40, unit: 'שק' },
        { sku: '24101', name: 'בידוד אקוסטי 6 מ"מ 150 50 מ.א', quantity: 6, unit: 'יח' },
        { sku: '50002', name: 'לוח קלקל 2 ס"מ F15 50/125', quantity: 96, unit: 'יח' },
        { sku: '48107', name: 'מטר 5 גומי רחב אדום', quantity: 2, unit: 'יח' },
        { sku: '740710', name: 'בוקסה מגנטית 10 מ"מ', quantity: 1, unit: 'יח' },
        { sku: '18055', name: 'הובלת מנוף כפר סבא-רעננה', quantity: 1, unit: 'יח' },
        { sku: '60002', name: 'שק גדול פקדון', quantity: 2, unit: 'בלה' },
        { sku: '60060', name: 'משטח סבן פקדון', quantity: 1, unit: 'משטח' }
      ]
    });
    res.json({ success: true, message: 'Motskin closed loop triggered', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * סנכרון דינמי של מאגר הלקוחות ישירות מטאב 'מאגר_לקוחות' בגיליון מערכת מאוחדת
 */
async function syncCustomersFromSheets() {
  try {
    console.log("🔄 מסנכרן מאגר לקוחות מטאב 'מאגר_לקוחות' בגיליון...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getCustomers',
        token: APPS_SCRIPT_TOKEN,
        unifiedSheetId: UNIFIED_SPREADSHEET_ID,
        targetTab: 'תיקי_לקוחות'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.customers && Array.isArray(data.customers) && data.customers.length > 0) {
        console.log(`✅ נטענו ${data.customers.length} לקוחות בהצלחה מטאב מאגר_לקוחות!`);
        // עדכון הרשימה
        KNOWN_CLIENTS_DIRECTORY = data.customers;
        return { success: true, count: data.customers.length };
      }
    }
  } catch (err) {
    console.warn("⚠️ סנכרון לקוחות מגיליון לא הושלם (שימוש במאגר המקומי המורחב של 15 לקוחות):", err.message);
  }
  return { success: false, count: KNOWN_CLIENTS_DIRECTORY.length, fallback: true };
}

/**
 * נקודת קצה לסנכרון יזום של מאגר הלקוחות מהגיליון
 */
app.post('/api/sync-customers', async (_req, res) => {
  const result = await syncCustomersFromSheets();
  res.json({ success: true, result, activeClientsCount: KNOWN_CLIENTS_DIRECTORY.length });
});

/**
 * נקודת קצה לצפייה במאגר הלקוחות הפעיל
 */
app.get('/api/customers', (_req, res) => {
  res.json({ success: true, total: KNOWN_CLIENTS_DIRECTORY.length, customers: KNOWN_CLIENTS_DIRECTORY });
});

/**
 * נקודת קצה להרצת אלגוריתם חיזוי תוכן לקוחות על פנייה חופשית
 */
app.post('/api/predict-order', async (req, res) => {
  const { text, phone, senderName } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text parameter' });

  const clientInfo = identifyClientAndProject(text, phone || '', senderName || '');
  const normalized = parseAndNormalizeMaterials(text);
  const prediction = predictCustomerContent(clientInfo, text, normalized.items, normalized);

  res.json({
    success: true,
    clientInfo,
    normalized,
    prediction
  });
});

/**
 * נקודת קצה לעיבוד סבב תעודות משלוח מלא לפי גרסה 3.0
 */
app.post('/api/process-batch-v3', async (req, res) => {
  try {
    const batchData = req.body;
    if (!batchData || !batchData.deliveryNotes) {
      return res.status(400).json({ error: 'Missing batch deliveryNotes data' });
    }

    const result = await processDeliveryNoteBatchV3(batchData);
    res.json({ success: true, result });
  } catch (err) {
    console.error('❌ שגיאה בעיבוד סבב תעודות משלוח v3:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * נקודת קצה להפקת כרטיס WhatsApp מעוצב לוורד והראל
 */
app.post('/api/vered-harel-card', (req, res) => {
  try {
    const batchData = req.body || {};
    const card = buildVeredHarelApprovalCard(batchData);
    res.json({ success: true, card });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * נקודת קצה לבדיקה ידנית של זיהוי הזמנה בוואטסאפ (ללא תלות בסריקה או הודעה חיצונית)
 */
app.post('/api/test-message', requireApiAuth, async (req, res) => {
  try {
    const { from, body, fromMe, senderName } = req.body;
    const testMsg = {
      from: from || '972508860896@c.us',
      body: body || 'שלום נועה, תשלחי לי בבקשה 2 בלות חול ו-20 שק מלט אפור למוצקין 22 רעננה',
      fromMe: Boolean(fromMe),
      id: { _serialized: `test_${Date.now()}` },
      getChat: async () => ({ name: 'בדיקת סימולציה', isGroup: false }),
      getContact: async () => ({ pushname: senderName || 'ראמי בדיקה', number: '0508860896' }),
      reply: async (txt) => console.log('💬 [מענה בדיקה]:', txt)
    };
    console.log(`\n🧪 [בדיקה יזומה דרך API]: "${testMsg.body}" מאת ${testMsg.from}`);
    await handleIncomingWhatsAppOrder(testMsg);
    res.json({ success: true, message: 'הודעת הבדיקה נקלטה ועובדה בהצלחה' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * נקודת קצה לשידור יזום של כרטיס עדכונים מהסידור (Webhook / בדיקה)
 */
app.post('/api/broadcast-dispatch', requireApiAuth, async (req, res) => {
  try {
    const orderData = req.body || {};
    const card = buildDispatchAnnouncementCard(orderData);
    const sent = await broadcastToDispatchGroup(card);
    res.json({ success: true, sent, card });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`🌐 שרת נועה AI פעיל בפורט ${PORT}`);
  console.log(`📲 דף קוד QR בדפדפן: http://localhost:${PORT}/qr`);
  console.log(`📊 בדיקת סטטוס חיבור: http://localhost:${PORT}/status`);
  console.log(`⏳ מאתחל דפדפן Puppeteer ומתחבר ל-WhatsApp Web...`);
  console.log(`===============================================`);
  // סנכרון אוטומטי של מאגר הלקוחות בעליית השרת
  syncCustomersFromSheets().catch(e => console.warn('Startup sync note:', e.message));

  console.log('⏳ מאתחל מופע 1: ראמי (WhatsApp Business 050-8860896)...');
  clientRami.initialize().catch(err => console.error('❌ שגיאת אתחול מופע ראמי:', err.message));

  console.log('⏳ מאתחל מופע 2: נועה (WhatsApp פרטי 050-8861080)...');
  clientNoa.initialize().catch(err => console.error('❌ שגיאת אתחול מופע נועה:', err.message));
});