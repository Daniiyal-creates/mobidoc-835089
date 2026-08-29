/**
 * Offline seed data for demos.
 *
 * Everything here is hand-written sample content. When demo mode is on, the
 * wrappers in `lib/api.ts` answer from this file instead of calling Gemini or
 * Google Places, so the whole flow runs with no internet, no GPS and no keys —
 * useful on stage, where conference wifi and denied location permissions are
 * the norm. It is never used unless the user turns demo mode on in Settings,
 * and every screen shows a "sample data" banner while it is.
 *
 * Each case carries copy in all three input languages, so the language the user
 * types in still decides the language they get back, exactly as the live model
 * behaves.
 */

import type {
  Coordinates,
  Device,
  Diagnosis,
  HistoryEntry,
  InputLanguage,
  LikelyCause,
  RepairShop,
  SafetyFlag,
  SafetyFlagKind,
  Severity,
  ShopDetails,
  ShopReview,
  UiLanguage,
} from '@/lib/types';
import { distanceMeters } from '@/lib/utils';

/** City the sample data is priced and located in. */
export const DEMO_CITY = { name: 'Lahore', latitude: 31.5204, longitude: 74.3587 } as const;

/** Stable object so hooks that fall back to it don't change identity per render. */
export const DEMO_COORDS: Coordinates = {
  latitude: DEMO_CITY.latitude,
  longitude: DEMO_CITY.longitude,
};

/** Radius the seeded shop search claims to have covered. */
const DEMO_RADIUS_METERS = 5000;

type DemoCaseKey = 'screen' | 'battery' | 'charging' | 'software';

interface DemoCaseCopy {
  issueTitle: string;
  summary: string;
  causes: readonly LikelyCause[];
  safetyFlags: readonly SafetyFlag[];
  repairTime: string;
  diyNote?: string;
  questions: readonly string[];
  /** Only used when the request carried a photo. */
  visualFindings: readonly string[];
}

interface DemoCase {
  key: DemoCaseKey;
  /** Lowercase fragments matched against the description, in every script. */
  keywords: readonly string[];
  severity: Severity;
  confidence: number;
  diyFeasible: boolean;
  cost: {
    min: number;
    max: number;
    partsMin: number;
    partsMax: number;
    labourMin: number;
    labourMax: number;
  };
  copy: Record<InputLanguage, DemoCaseCopy>;
}

function cause(title: string, explanation: string, likelihood: number): LikelyCause {
  return { title, explanation, likelihood };
}

function flag(kind: SafetyFlagKind, title: string, advice: string, severity: Severity): SafetyFlag {
  return { kind, title, advice, severity };
}

const SCREEN_CASE: DemoCase = {
  key: 'screen',
  keywords: [
    'screen',
    'display',
    'crack',
    'glass',
    'touch',
    'shatter',
    'panel',
    'tuta',
    'toota',
    'tut',
    'shesha',
    'shisha',
    'lakeer',
    'سکرین',
    'ٹوٹ',
    'شیشہ',
    'ڈسپلے',
    'ٹچ',
    'دراڑ',
  ],
  severity: 'medium',
  confidence: 0.86,
  diyFeasible: false,
  cost: {
    min: 9500,
    max: 16500,
    partsMin: 7500,
    partsMax: 13000,
    labourMin: 2000,
    labourMax: 3500,
  },
  copy: {
    en: {
      issueTitle: 'Cracked display with a dead touch area',
      summary:
        'The glass and the touch layer are damaged together, so the panel has to be replaced rather than repaired. The phone stays usable meanwhile, but the crack will spread and glass dust can work its way under the digitizer.',
      causes: [
        cause(
          'Broken digitizer under the outer glass',
          'A drop cracked the glass and split the touch layer bonded to it, which is why that area no longer responds.',
          0.72,
        ),
        cause(
          'Display connector knocked loose',
          'Less likely, but the same impact can unseat the display flex, which looks like dead patches with no visible crack.',
          0.18,
        ),
      ],
      safetyFlags: [
        flag(
          'screen_glass_shards',
          'Sharp glass along the crack',
          'Put clear tape over the crack until it is repaired, so glass slivers do not cut your finger.',
          'low',
        ),
      ],
      repairTime: '45 to 90 minutes',
      questions: [
        'Is the panel original, OEM, or a copy?',
        'What warranty comes with the panel?',
        'Will the fingerprint sensor still work after the swap?',
      ],
      visualFindings: [
        'Crack running from the top-left corner across roughly a third of the panel',
        'White lines beside the crack, which points at the touch layer and not just the glass',
        'No bent frame or lifted edge visible, so the body looks straight',
      ],
    },
    ur: {
      issueTitle: 'ڈسپلے ٹوٹا ہے اور ایک حصے میں ٹچ کام نہیں کر رہا',
      summary:
        'شیشہ اور ٹچ کی تہہ دونوں متاثر ہوئی ہیں، اس لیے پورا پینل بدلنا پڑے گا، صرف مرمت سے کام نہیں چلے گا۔ فون فی الحال چل رہا ہے مگر دراڑ پھیلتی جائے گی اور شیشے کے باریک ذرات اندر جا سکتے ہیں۔',
      causes: [
        cause(
          'باہر کے شیشے کے نیچے ٹچ پینل بھی ٹوٹا ہے',
          'گرنے سے شیشہ چٹخا اور اس کے ساتھ جڑی ٹچ کی تہہ بھی کٹ گئی، اسی لیے وہ حصہ جواب نہیں دیتا۔',
          0.72,
        ),
        cause(
          'ڈسپلے کا کنیکٹر ڈھیلا ہو گیا ہے',
          'امکان کم ہے، مگر اسی جھٹکے سے ڈسپلے کی تار ڈھیلی ہو سکتی ہے، جس سے بغیر دراڑ بھی حصے مردہ لگتے ہیں۔',
          0.18,
        ),
      ],
      safetyFlags: [
        flag(
          'screen_glass_shards',
          'دراڑ کے کنارے تیز ہیں',
          'مرمت تک دراڑ پر صاف ٹیپ لگا دیں تاکہ باریک شیشہ انگلی نہ کاٹے۔',
          'low',
        ),
      ],
      repairTime: '45 سے 90 منٹ',
      questions: [
        'پینل اوریجنل، OEM یا کاپی ہے؟',
        'پینل کی وارنٹی کتنی ہے؟',
        'پینل بدلنے کے بعد فنگر پرنٹ کام کرے گا؟',
      ],
      visualFindings: [
        'اوپر بائیں کونے سے دراڑ تقریباً ایک تہائی سکرین تک گئی ہے',
        'دراڑ کے قریب سفید لکیریں ہیں، یعنی صرف شیشہ نہیں ٹچ پینل بھی متاثر ہے',
        'فریم مڑا ہوا یا کنارے سے اٹھا ہوا نظر نہیں آ رہا',
      ],
    },
    'ur-roman': {
      issueTitle: 'Display tut gayi hai, aik hissay mein touch kaam nahi kar raha',
      summary:
        'Shesha aur touch layer dono kharab hain, is liye poora panel badalna paray ga, sirf marammat se kaam nahi chalay ga. Phone abhi chal raha hai lekin darar barhti jaye gi aur shishay ke bareek zarray andar ja sakte hain.',
      causes: [
        cause(
          'Bahar ke shishay ke neeche touch panel bhi tuta hai',
          'Girne se shesha chatakh gaya aur us se juri touch layer bhi kat gayi, isi liye woh hissa jawab nahi deta.',
          0.72,
        ),
        cause(
          'Display ka connector dheela ho gaya hai',
          'Imkaan kam hai, magar isi jhatkay se display ki taar dheeli ho sakti hai, jis se bina darar bhi hissay murda lagte hain.',
          0.18,
        ),
      ],
      safetyFlags: [
        flag(
          'screen_glass_shards',
          'Darar ke kinare tez hain',
          'Marammat tak darar par saaf tape laga dein, taake bareek shesha ungli na kaatay.',
          'low',
        ),
      ],
      repairTime: '45 se 90 minute',
      questions: [
        'Panel original, OEM ya copy hai?',
        'Panel ki warranty kitni hai?',
        'Panel badalne ke baad fingerprint kaam karay ga?',
      ],
      visualFindings: [
        'Ooper baaen kone se darar takreeban aik tihai screen tak gayi hai',
        'Darar ke qareeb safed lakeerain hain, matlab sirf shesha nahi touch panel bhi affected hai',
        'Frame mura hua ya kinare se utha hua nazar nahi aa raha',
      ],
    },
  },
};

const BATTERY_CASE: DemoCase = {
  key: 'battery',
  keywords: [
    'battery',
    'swollen',
    'swelling',
    'bulge',
    'overheat',
    'heating',
    'heat',
    'drain',
    'phool',
    'phul',
    'sooj',
    'garam',
    'back cover',
    'بیٹری',
    'پھول',
    'گرم',
    'سوج',
  ],
  severity: 'critical',
  confidence: 0.83,
  diyFeasible: false,
  cost: { min: 3500, max: 7500, partsMin: 2500, partsMax: 5500, labourMin: 1000, labourMax: 2000 },
  copy: {
    en: {
      issueTitle: 'Swollen battery lifting the back cover',
      summary:
        'A battery that has expanded is a fire risk, not just a fault. Stop charging the phone and stop carrying it until the cell is replaced. Do not press on the bulge and do not keep it in a pocket against your body.',
      causes: [
        cause(
          'Failed lithium cell that has bloated',
          'The cell has vented gas inside its pouch, usually after years of heat and fast charging, and that swelling is what lifts the cover.',
          0.78,
        ),
        cause(
          'Faulty charging board overcharging the cell',
          'Less likely on its own, but a damaged charging IC keeps pushing current into a full cell and causes the same swelling.',
          0.14,
        ),
      ],
      safetyFlags: [
        flag(
          'swollen_battery',
          'Stop using this phone now',
          'A swollen battery can catch fire. Power it off, keep it away from anything flammable, and take it in today.',
          'critical',
        ),
        flag(
          'charging_hazard',
          'Do not charge it again',
          'Charging a bloated cell makes it worse. Leave it unplugged even if the phone still turns on.',
          'high',
        ),
      ],
      repairTime: 'Same day, about 30 minutes of work',
      questions: [
        'Is the replacement cell genuine or A-grade, and what is its mAh rating?',
        'Will you dispose of the swollen battery safely?',
        'Do you test the charging board after fitting the new cell?',
      ],
      visualFindings: [
        'A clear gap between the back cover and the frame along one edge',
        'The cover sits raised over the middle, which matches a bloated cell underneath',
        'No burn marks or leaked liquid visible yet',
      ],
    },
    ur: {
      issueTitle: 'بیٹری پھول گئی ہے اور بیک کور اٹھا رہی ہے',
      summary:
        'پھولی ہوئی بیٹری صرف خرابی نہیں، آگ لگنے کا خطرہ ہے۔ بیٹری بدلنے تک فون چارج کرنا اور ساتھ رکھنا بند کر دیں۔ ابھرے ہوئے حصے کو دبائیں نہ، اور فون جسم کے ساتھ جیب میں نہ رکھیں۔',
      causes: [
        cause(
          'لیتھیم سیل خراب ہو کر پھول گیا ہے',
          'سیل کے اندر گیس بن گئی ہے، عام طور پر سالوں کی گرمی اور فاسٹ چارجنگ کے بعد، اور یہی پھلاؤ کور کو اٹھاتا ہے۔',
          0.78,
        ),
        cause(
          'چارجنگ بورڈ خراب ہے اور اوور چارج کر رہا ہے',
          'امکان کم ہے، مگر خراب چارجنگ آئی سی بھری ہوئی بیٹری میں کرنٹ بھیجتا رہتا ہے، جس سے یہی پھلاؤ ہوتا ہے۔',
          0.14,
        ),
      ],
      safetyFlags: [
        flag(
          'swollen_battery',
          'یہ فون ابھی استعمال کرنا بند کریں',
          'پھولی ہوئی بیٹری آگ پکڑ سکتی ہے۔ فون بند کریں، آتش گیر چیزوں سے دور رکھیں اور آج ہی دکان پر لے جائیں۔',
          'critical',
        ),
        flag(
          'charging_hazard',
          'دوبارہ چارج نہ کریں',
          'پھولی بیٹری کو چارج کرنے سے مسئلہ بڑھتا ہے۔ فون آن ہو رہا ہو تو بھی چارجر نہ لگائیں۔',
          'high',
        ),
      ],
      repairTime: 'اسی دن، کام تقریباً 30 منٹ کا ہے',
      questions: [
        'نئی بیٹری اوریجنل یا اے گریڈ ہے، اور اس کی mAh کتنی ہے؟',
        'پرانی پھولی بیٹری محفوظ طریقے سے ٹھکانے لگائیں گے؟',
        'نئی بیٹری لگانے کے بعد چارجنگ بورڈ چیک کرتے ہیں؟',
      ],
      visualFindings: [
        'ایک کنارے پر بیک کور اور فریم کے درمیان واضح خلا ہے',
        'کور درمیان سے اٹھا ہوا ہے، جو نیچے پھولی بیٹری کی نشانی ہے',
        'ابھی جلنے کا نشان یا لیکیج نظر نہیں آ رہا',
      ],
    },
    'ur-roman': {
      issueTitle: 'Battery phool gayi hai aur back cover utha rahi hai',
      summary:
        'Phooli hui battery sirf kharabi nahi, aag lagne ka khatra hai. Battery badalne tak phone charge karna aur saath rakhna band kar dein. Ubhray hue hissay ko dabaen na, aur phone jism ke saath jeb mein na rakhein.',
      causes: [
        cause(
          'Lithium cell kharab ho kar phool gaya hai',
          'Cell ke andar gas ban gayi hai, aam tor par saalon ki garmi aur fast charging ke baad, aur yehi phulao cover ko uthata hai.',
          0.78,
        ),
        cause(
          'Charging board kharab hai aur over charge kar raha hai',
          'Imkaan kam hai, magar kharab charging IC bhari battery mein current bhejta rehta hai, jis se yehi phulao hota hai.',
          0.14,
        ),
      ],
      safetyFlags: [
        flag(
          'swollen_battery',
          'Yeh phone abhi istemaal karna band karein',
          'Phooli battery aag pakar sakti hai. Phone off karein, aag pakarne wali cheezon se door rakhein aur aaj hi dukan par le jaen.',
          'critical',
        ),
        flag(
          'charging_hazard',
          'Dobara charge na karein',
          'Phooli battery ko charge karne se masla barhta hai. Phone on ho raha ho to bhi charger na lagaen.',
          'high',
        ),
      ],
      repairTime: 'Usi din, kaam takreeban 30 minute ka hai',
      questions: [
        'Nayi battery original ya A-grade hai, aur us ki mAh kitni hai?',
        'Purani phooli battery mehfooz tareeqay se thikane lagaen ge?',
        'Nayi battery lagane ke baad charging board check karte hain?',
      ],
      visualFindings: [
        'Aik kinare par back cover aur frame ke darmiyan wazeh khala hai',
        'Cover darmiyan se utha hua hai, jo neeche phooli battery ki nishani hai',
        'Abhi jalne ka nishan ya leakage nazar nahi aa raha',
      ],
    },
  },
};

const CHARGING_CASE: DemoCase = {
  key: 'charging',
  keywords: [
    'charging',
    'charge',
    'charger',
    'port',
    'cable',
    'socket',
    'pin',
    'slow charge',
    'wire',
    'lint',
    'چارج',
    'چارجر',
    'پورٹ',
    'کیبل',
    'تار',
    'ساکٹ',
  ],
  severity: 'low',
  confidence: 0.71,
  diyFeasible: true,
  cost: { min: 500, max: 2500, partsMin: 0, partsMax: 1500, labourMin: 500, labourMax: 1000 },
  copy: {
    en: {
      issueTitle: 'Charging cuts in and out, most likely a dirty port',
      summary:
        'The connection dropping when the cable moves usually means lint packed at the bottom of the port or slightly worn pins, not a dead board. This is the cheapest class of repair, and often something you can fix yourself.',
      causes: [
        cause(
          'Lint compacted at the base of the port',
          'Pocket lint presses into a hard plug at the bottom of the port, so the cable can no longer seat all the way in.',
          0.62,
        ),
        cause(
          'Worn or bent port pins',
          'After a few thousand plug-ins the pins lose tension, which shows up as charging only when the cable is held at an angle.',
          0.26,
        ),
      ],
      safetyFlags: [],
      repairTime: '20 to 40 minutes',
      diyNote:
        'Power the phone off, then lift the lint out of the port with a wooden toothpick in good light. Never use a metal pin and do not blow compressed air into it. Try a second cable too. If charging is steady afterwards, you do not need a shop at all.',
      questions: [
        'Can you clean and test the port first, before replacing anything?',
        'If the port is replaced, is it a soldered board repair or a flex swap?',
        'What warranty comes with the repair?',
      ],
      visualFindings: [
        'Grey lint visible packed into the base of the charging port',
        'Pins look straight, with no green corrosion or water marks',
        'The cable end shows normal wear, so it is worth testing another cable first',
      ],
    },
    ur: {
      issueTitle: 'چارجنگ رک رک کر ہو رہی ہے، غالباً پورٹ گندا ہے',
      summary:
        'کیبل ہلنے پر رابطہ ٹوٹنے کا مطلب عام طور پر پورٹ کی تہہ میں جمع میل یا پن کا گھس جانا ہوتا ہے، بورڈ خراب ہونا نہیں۔ یہ سب سے سستی مرمت ہے، اور کئی بار آپ خود کر سکتے ہیں۔',
      causes: [
        cause(
          'پورٹ کی تہہ میں میل جم گیا ہے',
          'جیب کا روئی نما میل پورٹ کی تہہ میں سخت ہو کر جم جاتا ہے، اس لیے کیبل پوری اندر نہیں بیٹھتی۔',
          0.62,
        ),
        cause(
          'پورٹ کے پن گھس یا مڑ گئے ہیں',
          'کئی ہزار بار لگانے کے بعد پن کی گرفت کم ہو جاتی ہے، تب کیبل ایک خاص زاویے پر ہی چارج کرتی ہے۔',
          0.26,
        ),
      ],
      safetyFlags: [],
      repairTime: '20 سے 40 منٹ',
      diyNote:
        'فون بند کریں اور اچھی روشنی میں لکڑی کے ٹوتھ پک سے پورٹ کا میل نکالیں۔ دھات کی پن ہرگز استعمال نہ کریں اور اندر پریشر ہوا نہ ماریں۔ ایک دوسری کیبل بھی آزمائیں۔ اس کے بعد چارجنگ ٹھیک چلے تو دکان کی ضرورت نہیں۔',
      questions: [
        'پہلے پورٹ صاف کر کے چیک کر سکتے ہیں، کچھ بدلنے سے پہلے؟',
        'پورٹ بدلنا ہو تو یہ بورڈ پر سولڈرنگ ہے یا فلیکس تبدیل ہوگی؟',
        'مرمت کی وارنٹی کتنی ہے؟',
      ],
      visualFindings: [
        'چارجنگ پورٹ کی تہہ میں گرد اور روئی نما میل نظر آ رہا ہے',
        'پن سیدھے ہیں، سبز زنگ یا پانی کا نشان نہیں',
        'کیبل کا سرا عام گھساؤ دکھا رہا ہے، پہلے دوسری کیبل آزمانا مناسب ہے',
      ],
    },
    'ur-roman': {
      issueTitle: 'Charging ruk ruk kar ho rahi hai, ghaliban port ganda hai',
      summary:
        'Cable hilne par raabta tootne ka matlab aam tor par port ki teh mein jama mail ya pin ka ghis jana hota hai, board kharab hona nahi. Yeh sab se sasti marammat hai, aur kai baar aap khud kar sakte hain.',
      causes: [
        cause(
          'Port ki teh mein mail jam gaya hai',
          'Jeb ka rui jaisa mail port ki teh mein sakht ho kar jam jata hai, is liye cable poori andar nahi bethti.',
          0.62,
        ),
        cause(
          'Port ke pin ghis ya mur gaye hain',
          'Kai hazar baar lagane ke baad pin ki girift kam ho jati hai, tab cable aik khaas zaviye par hi charge karti hai.',
          0.26,
        ),
      ],
      safetyFlags: [],
      repairTime: '20 se 40 minute',
      diyNote:
        'Phone band karein aur achi roshni mein lakri ke toothpick se port ka mail nikalein. Dhaat ki pin hargiz istemaal na karein aur andar pressure hawa na maarein. Aik doosri cable bhi aazmaen. Is ke baad charging theek chalay to dukan ki zaroorat nahi.',
      questions: [
        'Pehle port saaf kar ke check kar sakte hain, kuch badalne se pehle?',
        'Port badalna ho to yeh board par soldering hai ya flex tabdeel hogi?',
        'Marammat ki warranty kitni hai?',
      ],
      visualFindings: [
        'Charging port ki teh mein gard aur rui jaisa mail nazar aa raha hai',
        'Pin seedhay hain, sabz zang ya pani ka nishan nahi',
        'Cable ka sira aam ghisao dikha raha hai, pehle doosri cable aazmana munasib hai',
      ],
    },
  },
};

const SOFTWARE_CASE: DemoCase = {
  key: 'software',
  keywords: [
    'hang',
    'restart',
    'reboot',
    'slow',
    'freeze',
    'lag',
    'app',
    'crash',
    'update',
    'storage',
    'ہینگ',
    'سست',
    'ری سٹارٹ',
    'بند',
    'سلو',
    'اپڈیٹ',
  ],
  severity: 'medium',
  confidence: 0.64,
  diyFeasible: true,
  cost: { min: 1000, max: 3500, partsMin: 0, partsMax: 500, labourMin: 1000, labourMax: 3000 },
  copy: {
    en: {
      issueTitle: 'Phone freezes and restarts on its own',
      summary:
        'Repeated freezing with random restarts is usually storage or software, not a broken part. A backup, a storage clean-up and a fresh system install settle most of these. If it keeps happening after that, the storage chip itself is the suspect.',
      causes: [
        cause(
          'Storage almost full or wearing out',
          'With no free space the system keeps rewriting the same worn blocks, which shows up as freezes and reboots.',
          0.48,
        ),
        cause(
          'A bad app or a failed system update',
          'A background service that keeps crashing can restart the phone, which is why it happens at no particular time.',
          0.34,
        ),
        cause(
          'Failing storage chip',
          'If a clean install does not settle it, the storage chip is going, and that is a board-level repair.',
          0.18,
        ),
      ],
      safetyFlags: [
        flag(
          'data_loss_risk',
          'Back up before anything else',
          'A phone that reboots on its own can lose data without warning. Copy your photos and your WhatsApp backup off it today.',
          'medium',
        ),
      ],
      repairTime: '1 to 2 hours, plus backup time',
      diyNote:
        'Free up at least 10% of storage, uninstall whatever you installed just before this started, and restart the phone. If that settles it, no shop is needed.',
      questions: [
        'Will you back up my data before flashing the software?',
        'Is this a software flash or a board-level repair?',
        'What is the charge if the flash does not fix it?',
      ],
      visualFindings: [
        'Photo caught the phone mid-restart, showing the boot logo',
        'No physical damage, swelling or lifted cover visible',
        'Body and ports look clean, which supports a software cause',
      ],
    },
    ur: {
      issueTitle: 'فون ہینگ ہوتا ہے اور خود ری سٹارٹ ہو جاتا ہے',
      summary:
        'بار بار ہینگ ہونا اور اچانک ری سٹارٹ عام طور پر سٹوریج یا سافٹ ویئر کا مسئلہ ہے، کوئی پرزہ ٹوٹنے کا نہیں۔ بیک اپ، سٹوریج خالی کرنا اور نیا سسٹم ڈالنا زیادہ تر ایسے کیس ٹھیک کر دیتا ہے۔ اس کے بعد بھی چلتا رہے تو سٹوریج چپ پر شک جاتا ہے۔',
      causes: [
        cause(
          'سٹوریج تقریباً بھر گئی ہے یا خراب ہو رہی ہے',
          'جگہ نہ ہونے پر سسٹم انہی گھسے ہوئے حصوں پر لکھتا رہتا ہے، جس سے ہینگ اور ری سٹارٹ ہوتے ہیں۔',
          0.48,
        ),
        cause(
          'کوئی خراب ایپ یا ناکام سسٹم اپڈیٹ',
          'پیچھے چلنے والی کوئی سروس بار بار بند ہو کر فون ری سٹارٹ کروا دیتی ہے، اسی لیے وقت کا کوئی حساب نہیں ہوتا۔',
          0.34,
        ),
        cause(
          'سٹوریج چپ خراب ہو رہی ہے',
          'نیا سسٹم ڈالنے سے بھی مسئلہ نہ جائے تو سٹوریج چپ جا رہی ہے، جو بورڈ لیول مرمت ہے۔',
          0.18,
        ),
      ],
      safetyFlags: [
        flag(
          'data_loss_risk',
          'سب سے پہلے بیک اپ لیں',
          'خود ری سٹارٹ ہونے والا فون بغیر بتائے ڈیٹا ضائع کر سکتا ہے۔ تصویریں اور واٹس ایپ بیک اپ آج ہی نکال لیں۔',
          'medium',
        ),
      ],
      repairTime: '1 سے 2 گھنٹے، بیک اپ کا وقت الگ',
      diyNote:
        'کم از کم 10 فیصد سٹوریج خالی کریں، جو ایپ مسئلہ شروع ہونے سے پہلے لگائی تھی وہ ہٹا دیں، اور فون ری سٹارٹ کریں۔ اس سے مسئلہ ختم ہو جائے تو دکان کی ضرورت نہیں۔',
      questions: [
        'سافٹ ویئر ڈالنے سے پہلے میرا ڈیٹا بیک اپ کریں گے؟',
        'یہ سافٹ ویئر کا کام ہے یا بورڈ لیول مرمت؟',
        'سافٹ ویئر ڈالنے سے مسئلہ حل نہ ہو تو چارج کتنا ہوگا؟',
      ],
      visualFindings: [
        'تصویر میں فون ری سٹارٹ ہوتے ہوئے بوٹ لوگو دکھا رہا ہے',
        'کوئی ظاہری نقصان، پھلاؤ یا اٹھا ہوا کور نظر نہیں آ رہا',
        'باڈی اور پورٹ صاف ہیں، جو سافٹ ویئر کی وجہ کو تقویت دیتا ہے',
      ],
    },
    'ur-roman': {
      issueTitle: 'Phone hang hota hai aur khud restart ho jata hai',
      summary:
        'Baar baar hang hona aur achanak restart aam tor par storage ya software ka masla hai, koi purza tootne ka nahi. Backup, storage khali karna aur naya system daalna zyada tar aise case theek kar deta hai. Us ke baad bhi chalta rahay to storage chip par shak jata hai.',
      causes: [
        cause(
          'Storage takreeban bhar gayi hai ya kharab ho rahi hai',
          'Jagah na hone par system unhi ghisay hue hisson par likhta rehta hai, jis se hang aur restart hote hain.',
          0.48,
        ),
        cause(
          'Koi kharab app ya nakaam system update',
          'Peeche chalne wali koi service baar baar band ho kar phone restart karwa deti hai, isi liye waqt ka koi hisaab nahi hota.',
          0.34,
        ),
        cause(
          'Storage chip kharab ho rahi hai',
          'Naya system daalne se bhi masla na jaye to storage chip ja rahi hai, jo board level marammat hai.',
          0.18,
        ),
      ],
      safetyFlags: [
        flag(
          'data_loss_risk',
          'Sab se pehle backup lein',
          'Khud restart hone wala phone bina batae data zaya kar sakta hai. Tasveerain aur WhatsApp backup aaj hi nikaal lein.',
          'medium',
        ),
      ],
      repairTime: '1 se 2 ghantay, backup ka waqt alag',
      diyNote:
        'Kam az kam 10 percent storage khali karein, jo app masla shuru hone se pehle lagai thi woh hata dein, aur phone restart karein. Is se masla khatam ho jaye to dukan ki zaroorat nahi.',
      questions: [
        'Software daalne se pehle mera data backup karein ge?',
        'Yeh software ka kaam hai ya board level marammat?',
        'Software daalne se masla hal na ho to charge kitna hoga?',
      ],
      visualFindings: [
        'Tasveer mein phone restart hote hue boot logo dikha raha hai',
        'Koi zahiri nuksan, phulao ya utha hua cover nazar nahi aa raha',
        'Body aur port saaf hain, jo software ki wajah ko taqwiyat deta hai',
      ],
    },
  },
};

/** Order matters: on a tie the earlier case wins, and the last one is the fallback. */
const DEMO_CASES: readonly DemoCase[] = [SCREEN_CASE, BATTERY_CASE, CHARGING_CASE, SOFTWARE_CASE];

const URDU_SCRIPT = /[\u0600-\u06FF]/;

/**
 * Words that are distinctly Roman Urdu. Two or more of them in one sentence is
 * a reliable signal; single common words are left out so an English sentence
 * never trips it.
 */
const ROMAN_URDU_WORDS =
  /\b(nahi|nhi|hai|hy|raha|rahi|rha|rhi|karta|karti|karna|mera|meri|kharab|garam|tuta|toota|phool|phooli|gaya|gayi|band|pani|jaldi|thora|bohat|zyada|acha|wala|dikkat|masla|kuch|abhi|baar)\b/g;

/** Same job the model does server-side: work out which language was typed. */
export function detectDemoLanguage(description: string): InputLanguage {
  if (URDU_SCRIPT.test(description)) return 'ur';
  const hits = description.toLowerCase().match(ROMAN_URDU_WORDS);
  return hits && hits.length >= 2 ? 'ur-roman' : 'en';
}

/** Picks the case whose keywords the description matches most often. */
function matchDemoCase(description: string): DemoCase {
  const haystack = description.toLowerCase();
  let best = DEMO_CASES[DEMO_CASES.length - 1];
  let bestHits = 0;

  for (const demoCase of DEMO_CASES) {
    let hits = 0;
    for (const keyword of demoCase.keywords) {
      if (haystack.includes(keyword)) hits += 1;
    }
    if (hits > bestHits) {
      best = demoCase;
      bestHits = hits;
    }
  }

  return best;
}

interface ComposeOptions {
  id: string;
  createdAt: string;
  device: Device;
  description: string;
  language: InputLanguage;
  demoCase: DemoCase;
  city: string;
  withPhoto: boolean;
  photoUri?: string;
}

function composeDiagnosis({
  id,
  createdAt,
  device,
  description,
  language,
  demoCase,
  city,
  withPhoto,
  photoUri,
}: ComposeOptions): Diagnosis {
  const copy = demoCase.copy[language];

  return {
    id,
    createdAt,
    device,
    description,
    detectedLanguage: language,
    issueTitle: copy.issueTitle,
    summary: copy.summary,
    confidence: demoCase.confidence,
    severity: demoCase.severity,
    likelyCauses: [...copy.causes],
    safetyFlags: [...copy.safetyFlags],
    cost: { currency: 'PKR', ...demoCase.cost, city },
    repairTime: copy.repairTime,
    diyFeasible: demoCase.diyFeasible,
    ...(copy.diyNote ? { diyNote: copy.diyNote } : {}),
    questionsForShop: [...copy.questions],
    ...(withPhoto ? { visualFindings: [...copy.visualFindings] } : {}),
    ...(photoUri ? { photoUri } : {}),
  };
}

export interface DemoDiagnosisInput {
  brand: string;
  model: string;
  description: string;
  city?: string;
  languageOverride?: InputLanguage;
  hasPhoto: boolean;
  photoUri?: string;
}

/** Screen-ready diagnosis built entirely from seed data. */
export function demoDiagnosis(input: DemoDiagnosisInput): Diagnosis {
  const language = input.languageOverride ?? detectDemoLanguage(input.description);

  return composeDiagnosis({
    id: `demo-dx-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    device: { brand: input.brand, model: input.model },
    description: input.description,
    language,
    demoCase: matchDemoCase(input.description),
    city: input.city ?? DEMO_CITY.name,
    withPhoto: input.hasPhoto,
    ...(input.photoUri ? { photoUri: input.photoUri } : {}),
  });
}

/* ------------------------------------------------------------------ shops -- */

interface DemoShopSeed {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  reviewCount: number;
  openNow: boolean | null;
  phone: string | null;
  website: string | null;
  /** Degrees away from the search centre, so distances stay plausible anywhere. */
  latOffset: number;
  lngOffset: number;
  hours: readonly string[];
  reviews: readonly ShopReview[];
}

const STANDARD_HOURS: readonly string[] = [
  'Monday: 11:00 AM – 9:00 PM',
  'Tuesday: 11:00 AM – 9:00 PM',
  'Wednesday: 11:00 AM – 9:00 PM',
  'Thursday: 11:00 AM – 9:00 PM',
  'Friday: 2:30 PM – 9:00 PM',
  'Saturday: 11:00 AM – 9:00 PM',
  'Sunday: Closed',
];

const MARKET_HOURS: readonly string[] = [
  'Monday: 10:30 AM – 10:00 PM',
  'Tuesday: 10:30 AM – 10:00 PM',
  'Wednesday: 10:30 AM – 10:00 PM',
  'Thursday: 10:30 AM – 10:00 PM',
  'Friday: 10:30 AM – 10:00 PM',
  'Saturday: 10:30 AM – 10:00 PM',
  'Sunday: 12:00 PM – 8:00 PM',
];

const DEMO_SHOPS: readonly DemoShopSeed[] = [
  {
    id: 'demo-shop-hafeez',
    name: 'Hafeez Centre Mobile Care',
    address: 'Shop 214, Hafeez Centre, Gulberg III',
    rating: 4.7,
    reviewCount: 1284,
    openNow: true,
    phone: '+92 300 0000101',
    website: null,
    latOffset: 0.004,
    lngOffset: 0.006,
    hours: MARKET_HOURS,
    reviews: [
      {
        author: 'Bilal Ahmed',
        rating: 5,
        text: 'Screen changed the same day, price was very reasonable and the panel is original.',
        relativeTime: '2 weeks ago',
      },
      {
        author: 'Hina Raza',
        rating: 5,
        text: 'Master sahib is an expert, explained the fault before touching the phone.',
        relativeTime: 'a month ago',
      },
      {
        author: 'Usman Tariq',
        rating: 4,
        text: 'Crowded on weekends but the repair was quick.',
        relativeTime: '3 months ago',
      },
    ],
  },
  {
    id: 'demo-shop-hall-road',
    name: 'Al-Madina Mobile Repair',
    address: 'Hall Road, near Lakshmi Chowk',
    rating: 4.5,
    reviewCount: 612,
    openNow: true,
    phone: '+92 321 0000202',
    website: null,
    latOffset: -0.006,
    lngOffset: 0.004,
    hours: MARKET_HOURS,
    reviews: [
      {
        author: 'Kamran Sheikh',
        rating: 5,
        text: 'Munasib rate liya aur asli panel lagaya. Jaldi kaam kar diya.',
        relativeTime: '5 days ago',
      },
      {
        author: 'Ayesha Noor',
        rating: 4,
        text: 'Charging port cleaned in 20 minutes, charged only for labour.',
        relativeTime: 'a month ago',
      },
      {
        author: 'Faizan Ali',
        rating: 2,
        text: 'Battery ka rate mehnga laga, overcharged compared to other shops.',
        relativeTime: '2 months ago',
      },
    ],
  },
  {
    id: 'demo-shop-ifix-dha',
    name: 'iFix Lahore',
    address: 'Y Block Commercial, DHA Phase 4',
    rating: 4.8,
    reviewCount: 214,
    openNow: true,
    phone: '+92 333 0000303',
    website: 'https://example.com/ifix-lahore',
    latOffset: 0.012,
    lngOffset: -0.018,
    hours: STANDARD_HOURS,
    reviews: [
      {
        author: 'Zara Khan',
        rating: 5,
        text: 'Professional and honest, gave a written warranty with the invoice.',
        relativeTime: 'a week ago',
      },
      {
        author: 'Hamza Iqbal',
        rating: 5,
        text: 'Genuine parts and a quick repair, no complaints at all.',
        relativeTime: '3 weeks ago',
      },
      {
        author: 'Sana Mir',
        rating: 4,
        text: 'A bit expensive compared to Hall Road, but the part is quality.',
        relativeTime: '2 months ago',
      },
    ],
  },
  {
    id: 'demo-shop-ichhra',
    name: 'Mobile Doctor Ichhra',
    address: 'Ferozepur Road, Ichhra',
    rating: 4.1,
    reviewCount: 96,
    openNow: false,
    phone: '+92 302 0000404',
    website: null,
    latOffset: -0.014,
    lngOffset: -0.008,
    hours: STANDARD_HOURS,
    reviews: [
      {
        author: 'Adnan Butt',
        rating: 2,
        text: 'Duplicate part lagaya, screen do hafte mein kharab ho gayi.',
        relativeTime: 'a month ago',
      },
      {
        author: 'Rida Farooq',
        rating: 5,
        text: 'Cheap rates and fixed my charging port while I waited.',
        relativeTime: '2 months ago',
      },
      {
        author: 'Shahid Mehmood',
        rating: 4,
        text: 'Small shop but the technician knows old models well.',
        relativeTime: '4 months ago',
      },
    ],
  },
  {
    id: 'demo-shop-township',
    name: 'Galaxy Mobile Solutions',
    address: 'College Road, Township',
    rating: 3.8,
    reviewCount: 340,
    openNow: true,
    phone: '+92 345 0000505',
    website: null,
    latOffset: -0.03,
    lngOffset: -0.02,
    hours: MARKET_HOURS,
    reviews: [
      {
        author: 'Noman Aslam',
        rating: 1,
        text: 'Rude staff and a waste of time, would not recommend.',
        relativeTime: '3 weeks ago',
      },
      {
        author: 'Maryam Javed',
        rating: 3,
        text: 'Fixed the phone but tried to overcharge for a simple battery.',
        relativeTime: 'a month ago',
      },
      {
        author: 'Talha Rauf',
        rating: 4,
        text: 'Fast service on a battery replacement, done in half an hour.',
        relativeTime: '2 months ago',
      },
    ],
  },
  {
    id: 'demo-shop-model-town',
    name: 'Techno Care Mobile Clinic',
    address: 'Model Town Link Road',
    rating: 4.6,
    reviewCount: 58,
    openNow: null,
    phone: '+92 311 0000606',
    website: null,
    latOffset: 0.02,
    lngOffset: 0.014,
    hours: STANDARD_HOURS,
    reviews: [
      {
        author: 'Ahsan Raza',
        rating: 5,
        text: 'Best technician in Model Town and a fair price for a display.',
        relativeTime: '10 days ago',
      },
      {
        author: 'Iqra Shahid',
        rating: 5,
        text: 'Same day repair, affordable, and they showed me the old part.',
        relativeTime: 'a month ago',
      },
    ],
  },
  {
    id: 'demo-shop-shadman',
    name: 'Sharif Communication',
    address: 'Shadman Market, Main Boulevard',
    rating: null,
    reviewCount: 0,
    openNow: true,
    phone: null,
    website: null,
    latOffset: -0.002,
    lngOffset: -0.01,
    hours: [],
    reviews: [],
  },
];

function toRepairShop(seed: DemoShopSeed, center: Coordinates): RepairShop {
  const latitude = center.latitude + seed.latOffset;
  const longitude = center.longitude + seed.lngOffset;

  return {
    id: seed.id,
    name: seed.name,
    address: seed.address,
    rating: seed.rating,
    reviewCount: seed.reviewCount,
    distanceMeters: distanceMeters(center, { latitude, longitude }),
    openNow: seed.openNow,
    phone: seed.phone,
    latitude,
    longitude,
    mapsUri: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    reviewSnippets: seed.reviews
      .slice(0, 3)
      .map((review) => ({ rating: review.rating, text: review.text })),
  };
}

/**
 * Seeded shops laid out around whatever centre is passed in, so the list, the
 * distances and the map all behave the same as a live search.
 */
export function demoNearbyShops(
  center: Coordinates,
  query?: string,
): { shops: RepairShop[]; radiusMeters: number } {
  const needle = query?.trim().toLowerCase();
  const matching =
    needle && needle.length > 0
      ? DEMO_SHOPS.filter((shop) => shop.name.toLowerCase().includes(needle))
      : DEMO_SHOPS;
  const seeds = matching.length > 0 ? matching : DEMO_SHOPS;

  return {
    shops: seeds.map((seed) => toRepairShop(seed, center)),
    radiusMeters: DEMO_RADIUS_METERS,
  };
}

/** Full seeded profile for one shop, or null when the id is not seeded. */
export function demoShopDetails(placeId: string, center: Coordinates): ShopDetails | null {
  const seed = DEMO_SHOPS.find((shop) => shop.id === placeId);
  if (!seed) return null;

  return {
    ...toRepairShop(seed, center),
    weekdayHours: [...seed.hours],
    website: seed.website,
    // No remote photos: demo mode has to work with the network switched off.
    photos: [],
    reviews: [...seed.reviews],
  };
}

/* ---------------------------------------------------------- demo shortcuts -- */

export interface DemoSample {
  key: DemoCaseKey;
  brand: string;
  model: string;
  /** Deliberately mixed scripts, to show language detection during a demo. */
  description: string;
  language: InputLanguage;
}

export const DEMO_SAMPLES: readonly DemoSample[] = [
  {
    key: 'screen',
    brand: 'Apple',
    model: 'iPhone 13',
    description:
      'The screen is cracked from the top corner and the touch does not work in that area.',
    language: 'en',
  },
  {
    key: 'battery',
    brand: 'Samsung',
    model: 'Galaxy A34',
    description:
      'Battery phool gayi hai aur back cover peeche se uth raha hai, phone garam bhi hota hai.',
    language: 'ur-roman',
  },
  {
    key: 'charging',
    brand: 'Infinix',
    model: 'Hot 40i',
    description: 'چارج نہیں ہو رہا، کیبل ہلانے پر کبھی چل جاتا ہے اور پھر رک جاتا ہے۔',
    language: 'ur',
  },
  {
    key: 'software',
    brand: 'Xiaomi',
    model: 'Redmi Note 12',
    description: 'Phone hangs and restarts on its own several times a day since last week.',
    language: 'en',
  },
];

/* ------------------------------------------------------------- seed history -- */

interface HistorySeed {
  key: DemoCaseKey;
  demoCase: DemoCase;
  brand: string;
  model: string;
  hoursAgo: number;
  description: Record<UiLanguage, string>;
}

const HISTORY_SEEDS: readonly HistorySeed[] = [
  {
    key: 'screen',
    demoCase: SCREEN_CASE,
    brand: 'Apple',
    model: 'iPhone 13',
    hoursAgo: 3,
    description: {
      en: 'Dropped it on the road, the screen cracked and the top part does not respond to touch.',
      ur: 'سڑک پر گر گیا، سکرین ٹوٹ گئی اور اوپر والا حصہ ٹچ پر جواب نہیں دے رہا۔',
    },
  },
  {
    key: 'battery',
    demoCase: BATTERY_CASE,
    brand: 'Samsung',
    model: 'Galaxy A34',
    hoursAgo: 27,
    description: {
      en: 'The back cover is lifting up and the phone gets hot while charging.',
      ur: 'بیک کور اوپر اٹھ رہا ہے اور چارجنگ کے دوران فون گرم ہو جاتا ہے۔',
    },
  },
  {
    key: 'charging',
    demoCase: CHARGING_CASE,
    brand: 'Infinix',
    model: 'Hot 40i',
    hoursAgo: 74,
    description: {
      en: 'Charging stops as soon as the cable moves, and it charges very slowly.',
      ur: 'کیبل ہلتے ہی چارجنگ رک جاتی ہے، اور چارج بہت آہستہ ہوتا ہے۔',
    },
  },
];

/** Prefix that marks a history entry as seeded, so it can be removed cleanly. */
export const DEMO_ENTRY_PREFIX = 'demo:';

/**
 * Sample past diagnoses for the History tab. Ids are deterministic so turning
 * demo mode off removes exactly these and leaves real entries untouched.
 */
export function demoHistoryEntries(language: UiLanguage): HistoryEntry[] {
  const now = Date.now();

  return HISTORY_SEEDS.map((seed) => {
    const createdAt = new Date(now - seed.hoursAgo * 60 * 60 * 1000).toISOString();

    return {
      id: `${DEMO_ENTRY_PREFIX}${seed.key}`,
      savedAt: createdAt,
      diagnosis: composeDiagnosis({
        id: `${DEMO_ENTRY_PREFIX}dx-${seed.key}`,
        createdAt,
        device: { brand: seed.brand, model: seed.model },
        description: seed.description[language],
        language,
        demoCase: seed.demoCase,
        city: DEMO_CITY.name,
        withPhoto: false,
      }),
    };
  });
}
