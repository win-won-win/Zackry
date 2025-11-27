export type TopCategoryId =
  | 'video'
  | 'music'
  | 'books_audio'
  | 'cloud'
  | 'household'
  | 'dev_ai'
  | 'productivity'
  | 'creative'
  | 'learning'
  | 'games'
  | 'fan'
  | 'other';

export type MobileCarrierId =
  | 'docomo'
  | 'ahamo'
  | 'softbank'
  | 'ymobile'
  | 'linemo'
  | 'au'
  | 'uq'
  | 'povo'
  | 'rakuten'
  | 'other';

export interface TopCategory {
  id: TopCategoryId;
  label: string;
  question: string;
  description: string;
  order: number;
}

export interface PlanPreset {
  id: string;
  name: string;
  approxMonthlyJPY: number;
  currency: 'JPY' | 'USD';
  billingCycle: 'monthly' | 'yearly';
  note?: string;
}

export interface ServicePreset {
  id: string;
  topCategoryId: TopCategoryId;
  name: string;
  aliases?: string[];
  isPopular?: boolean;
  plans: PlanPreset[];
}

export interface MobileCarrierPreset {
  id: MobileCarrierId;
  label: string;
  portalUrl?: string;
  group?: string;
}

export const TOP_CATEGORIES: TopCategory[] = [
  {
    id: 'video',
    label: '動画配信',
    question: 'Netflix / Prime Video などの動画配信サービスは使っていますか？',
    description: '動画ストリーミングサービス',
    order: 1,
  },
  {
    id: 'music',
    label: '音楽',
    question: 'Spotify / Apple Music などの音楽サブスクはありますか？',
    description: '音楽ストリーミングサービス',
    order: 2,
  },
  {
    id: 'books_audio',
    label: '本・雑誌・オーディオブック',
    question: 'Kindle Unlimited / Audible などの本・雑誌・オーディオブック系はありますか？',
    description: '電子書籍・雑誌・オーディオブック',
    order: 3,
  },
  {
    id: 'cloud',
    label: 'クラウド・オフィス',
    question: 'iCloud / Google One / Microsoft 365 などのクラウド・オフィス系の有料プランはありますか？',
    description: 'クラウドストレージ・オフィスソフト',
    order: 4,
  },
  {
    id: 'household',
    label: '家計簿・お金管理',
    question: 'Zaim / マネーフォワード ME など家計簿アプリの有料プランはありますか？',
    description: '家計簿・資産管理アプリ',
    order: 5,
  },
  {
    id: 'dev_ai',
    label: 'AI・開発ツール',
    question: 'ChatGPT / Claude / GitHub Copilot などAI・開発ツール系サブスクはありますか？',
    description: 'AI・プログラミング支援ツール',
    order: 6,
  },
  {
    id: 'productivity',
    label: '仕事ツール',
    question: 'Notion / Slack など仕事用ツールの有料プランはありますか？',
    description: 'タスク管理・コラボレーション',
    order: 7,
  },
  {
    id: 'creative',
    label: 'デザイン・制作',
    question: 'Canva / Adobe / Figma などデザイン・制作系のサブスクはありますか？',
    description: 'デザイン・クリエイティブツール',
    order: 8,
  },
  {
    id: 'learning',
    label: '学習',
    question: 'Duolingo / スタディサプリ ENGLISH など学習系のサブスクはありますか？',
    description: '語学・学習プラットフォーム',
    order: 9,
  },
  {
    id: 'games',
    label: 'ゲーム',
    question: 'Game Pass / PS Plus / Switch Online などゲーム系サブスクはありますか？',
    description: 'ゲームサブスクリプション',
    order: 10,
  },
  {
    id: 'fan',
    label: 'ファン会員・推し活',
    question: 'ファンクラブ / オンラインサロン / FANBOX など推し活のサブスクはありますか？',
    description: 'ファンクラブ・クリエイター支援',
    order: 11,
  },
  {
    id: 'other',
    label: 'その他',
    question: '上記以外で、毎月 or 毎年払っているサブスク・固定費はありますか？',
    description: 'その他のサブスクリプション',
    order: 12,
  },
];

export const SERVICE_PRESETS: ServicePreset[] = [
  {
    id: 'netflix-jp',
    topCategoryId: 'video',
    name: 'Netflix',
    isPopular: true,
    plans: [
      { id: 'netflix-ad', name: '広告つき', approxMonthlyJPY: 890, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'netflix-standard', name: 'スタンダード', approxMonthlyJPY: 1590, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'amazon-prime-jp',
    topCategoryId: 'video',
    name: 'Amazonプライム',
    isPopular: true,
    plans: [
      { id: 'prime-monthly', name: '月額プラン', approxMonthlyJPY: 600, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'prime-yearly', name: '年額プラン', approxMonthlyJPY: 492, currency: 'JPY', billingCycle: 'yearly', note: '¥5,900/年' },
    ],
  },
  {
    id: 'disney-plus-jp',
    topCategoryId: 'video',
    name: 'Disney+',
    isPopular: true,
    plans: [
      { id: 'disney-standard', name: 'スタンダード', approxMonthlyJPY: 1140, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'disney-premium', name: 'プレミアム', approxMonthlyJPY: 1520, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'hulu-jp',
    topCategoryId: 'video',
    name: 'Hulu',
    plans: [
      { id: 'hulu-monthly', name: '月額プラン', approxMonthlyJPY: 1026, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'unext-jp',
    topCategoryId: 'video',
    name: 'U-NEXT',
    plans: [
      { id: 'unext-monthly', name: '月額プラン', approxMonthlyJPY: 2189, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'abema-jp',
    topCategoryId: 'video',
    name: 'ABEMAプレミアム',
    plans: [
      { id: 'abema-premium', name: 'プレミアム', approxMonthlyJPY: 960, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'danime-jp',
    topCategoryId: 'video',
    name: 'dアニメストア',
    plans: [
      { id: 'danime-browser', name: 'ブラウザ登録', approxMonthlyJPY: 550, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'danime-app', name: 'アプリ登録', approxMonthlyJPY: 650, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'appletv-jp',
    topCategoryId: 'video',
    name: 'Apple TV+',
    plans: [
      { id: 'appletv-monthly', name: '月額プラン', approxMonthlyJPY: 900, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'spotify-jp',
    topCategoryId: 'music',
    name: 'Spotify',
    isPopular: true,
    plans: [
      { id: 'spotify-premium', name: 'Premium 個人', approxMonthlyJPY: 1080, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'apple-music-jp',
    topCategoryId: 'music',
    name: 'Apple Music',
    isPopular: true,
    plans: [
      { id: 'applemusic-individual', name: '個人', approxMonthlyJPY: 1080, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'applemusic-family', name: 'ファミリー', approxMonthlyJPY: 1680, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'applemusic-student', name: '学生', approxMonthlyJPY: 580, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'youtube-premium-jp',
    topCategoryId: 'music',
    name: 'YouTube Premium',
    isPopular: true,
    plans: [
      { id: 'ytpremium-individual', name: '個人', approxMonthlyJPY: 1280, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'ytpremium-family', name: 'ファミリー', approxMonthlyJPY: 2280, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'amazon-music-jp',
    topCategoryId: 'music',
    name: 'Amazon Music Unlimited',
    plans: [
      { id: 'amazonmusic-individual', name: '個人', approxMonthlyJPY: 1080, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'amazonmusic-student', name: '学生', approxMonthlyJPY: 580, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'amazonmusic-family', name: 'ファミリー', approxMonthlyJPY: 1680, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'linemusic-jp',
    topCategoryId: 'music',
    name: 'LINE MUSIC',
    plans: [
      { id: 'linemusic-general', name: '一般', approxMonthlyJPY: 980, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'linemusic-student', name: '学生', approxMonthlyJPY: 480, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'kindle-unlimited-jp',
    topCategoryId: 'books_audio',
    name: 'Kindle Unlimited',
    isPopular: true,
    plans: [
      { id: 'kindle-unlimited', name: '読み放題', approxMonthlyJPY: 980, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'audible-jp',
    topCategoryId: 'books_audio',
    name: 'Audible',
    isPopular: true,
    plans: [
      { id: 'audible-member', name: '会員', approxMonthlyJPY: 1500, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'dmagazine-jp',
    topCategoryId: 'books_audio',
    name: 'dマガジン',
    plans: [
      { id: 'dmagazine-plan', name: '読み放題', approxMonthlyJPY: 580, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'rakuten-magazine-jp',
    topCategoryId: 'books_audio',
    name: '楽天マガジン',
    plans: [
      { id: 'rakuten-mag-monthly', name: '月額', approxMonthlyJPY: 572, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'rakuten-mag-yearly', name: '年額', approxMonthlyJPY: 458, currency: 'JPY', billingCycle: 'yearly', note: '¥5,500/年' },
    ],
  },
  {
    id: 'icloud-jp',
    topCategoryId: 'cloud',
    name: 'iCloud+',
    isPopular: true,
    plans: [
      { id: 'icloud-50gb', name: '50GB', approxMonthlyJPY: 150, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'icloud-200gb', name: '200GB', approxMonthlyJPY: 450, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'icloud-2tb', name: '2TB', approxMonthlyJPY: 1500, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'google-one-jp',
    topCategoryId: 'cloud',
    name: 'Google One',
    isPopular: true,
    plans: [
      { id: 'googleone-100gb', name: '100GB', approxMonthlyJPY: 290, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'googleone-200gb', name: '200GB', approxMonthlyJPY: 380, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'googleone-2tb', name: '2TB', approxMonthlyJPY: 1450, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'googleone-ai', name: 'AIプレミアム（2TB+Gemini）', approxMonthlyJPY: 2900, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'microsoft365-jp',
    topCategoryId: 'cloud',
    name: 'Microsoft 365 Personal',
    plans: [
      { id: 'ms365-yearly', name: '年額プラン', approxMonthlyJPY: 1775, currency: 'JPY', billingCycle: 'yearly', note: '¥21,300/年' },
    ],
  },
  {
    id: 'dropbox-jp',
    topCategoryId: 'cloud',
    name: 'Dropbox Plus',
    plans: [
      { id: 'dropbox-plus', name: 'Plus 2TB', approxMonthlyJPY: 2000, currency: 'JPY', billingCycle: 'monthly', note: 'セール時は安くなる' },
    ],
  },
  {
    id: 'zaim-jp',
    topCategoryId: 'household',
    name: 'Zaim プレミアム',
    plans: [
      { id: 'zaim-monthly', name: '月額', approxMonthlyJPY: 480, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'zaim-yearly', name: '年額', approxMonthlyJPY: 400, currency: 'JPY', billingCycle: 'yearly', note: '¥4,800/年' },
    ],
  },
  {
    id: 'moneyforward-jp',
    topCategoryId: 'household',
    name: 'マネーフォワード ME',
    plans: [
      { id: 'mf-standard-monthly', name: 'スタンダード（月額）', approxMonthlyJPY: 565, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'mf-standard-yearly', name: 'スタンダード（年額）', approxMonthlyJPY: 518, currency: 'JPY', billingCycle: 'yearly', note: '¥6,216/年' },
      { id: 'mf-advance-monthly', name: '資産形成（月額）', approxMonthlyJPY: 980, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'mf-advance-yearly', name: '資産形成（年額）', approxMonthlyJPY: 890, currency: 'JPY', billingCycle: 'yearly', note: '¥10,700/年' },
    ],
  },
  {
    id: 'chatgpt',
    topCategoryId: 'dev_ai',
    name: 'ChatGPT',
    isPopular: true,
    plans: [
      { id: 'chatgpt-plus', name: 'Plus', approxMonthlyJPY: 3000, currency: 'USD', billingCycle: 'monthly', note: '$20/月' },
      { id: 'chatgpt-pro', name: 'Pro', approxMonthlyJPY: 30000, currency: 'USD', billingCycle: 'monthly', note: '$200/月' },
    ],
  },
  {
    id: 'claude',
    topCategoryId: 'dev_ai',
    name: 'Claude',
    isPopular: true,
    plans: [
      { id: 'claude-pro', name: 'Pro', approxMonthlyJPY: 3000, currency: 'USD', billingCycle: 'monthly', note: '$20/月' },
    ],
  },
  {
    id: 'gemini',
    topCategoryId: 'dev_ai',
    name: 'Gemini Advanced',
    plans: [
      { id: 'gemini-advanced', name: 'Advanced', approxMonthlyJPY: 2900, currency: 'JPY', billingCycle: 'monthly', note: 'Google One 2TB込み' },
    ],
  },
  {
    id: 'github-copilot',
    topCategoryId: 'dev_ai',
    name: 'GitHub Copilot',
    isPopular: true,
    plans: [
      { id: 'copilot-monthly', name: '月額', approxMonthlyJPY: 1500, currency: 'USD', billingCycle: 'monthly', note: '$10/月' },
      { id: 'copilot-yearly', name: '年額', approxMonthlyJPY: 1250, currency: 'USD', billingCycle: 'yearly', note: '$100/年' },
    ],
  },
  {
    id: 'cursor',
    topCategoryId: 'dev_ai',
    name: 'Cursor',
    plans: [
      { id: 'cursor-pro', name: 'Pro', approxMonthlyJPY: 3000, currency: 'USD', billingCycle: 'monthly', note: '$20/月' },
    ],
  },
  {
    id: 'replit',
    topCategoryId: 'dev_ai',
    name: 'Replit',
    plans: [
      { id: 'replit-core', name: 'Core', approxMonthlyJPY: 3000, currency: 'USD', billingCycle: 'monthly', note: '$20/月' },
    ],
  },
  {
    id: 'notion',
    topCategoryId: 'productivity',
    name: 'Notion',
    isPopular: true,
    plans: [
      { id: 'notion-plus-monthly', name: 'Plus（月払い）', approxMonthlyJPY: 1800, currency: 'USD', billingCycle: 'monthly', note: '$12/月' },
      { id: 'notion-plus-yearly', name: 'Plus（年払い）', approxMonthlyJPY: 1500, currency: 'USD', billingCycle: 'yearly', note: '$10/月相当' },
    ],
  },
  {
    id: 'slack',
    topCategoryId: 'productivity',
    name: 'Slack Pro',
    plans: [
      { id: 'slack-pro-monthly', name: '月払い', approxMonthlyJPY: 1300, currency: 'USD', billingCycle: 'monthly', note: '$8.75/月' },
      { id: 'slack-pro-yearly', name: '年払い', approxMonthlyJPY: 1100, currency: 'USD', billingCycle: 'yearly', note: '$7.25/月相当' },
    ],
  },
  {
    id: 'adobe-cc',
    topCategoryId: 'creative',
    name: 'Adobe Creative Cloud',
    isPopular: true,
    plans: [
      { id: 'adobe-all-apps', name: 'Creative Cloud Pro 個人', approxMonthlyJPY: 9000, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'canva',
    topCategoryId: 'creative',
    name: 'Canva',
    isPopular: true,
    plans: [
      { id: 'canva-pro-monthly', name: 'Pro（月額）', approxMonthlyJPY: 1180, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'canva-pro-yearly', name: 'Pro（年額）', approxMonthlyJPY: 691, currency: 'JPY', billingCycle: 'yearly', note: '¥8,300/年' },
    ],
  },
  {
    id: 'figma',
    topCategoryId: 'creative',
    name: 'Figma',
    plans: [
      { id: 'figma-pro-monthly', name: 'Professional（月払い）', approxMonthlyJPY: 2400, currency: 'USD', billingCycle: 'monthly', note: '$15/月' },
      { id: 'figma-pro-yearly', name: 'Professional（年払い）', approxMonthlyJPY: 1800, currency: 'USD', billingCycle: 'yearly', note: '$12/月相当' },
    ],
  },
  {
    id: 'duolingo',
    topCategoryId: 'learning',
    name: 'Duolingo',
    isPopular: true,
    plans: [
      { id: 'duolingo-super-monthly', name: 'Super（月払い）', approxMonthlyJPY: 2000, currency: 'USD', billingCycle: 'monthly', note: '$12.99/月' },
      { id: 'duolingo-super-yearly', name: 'Super（年払い）', approxMonthlyJPY: 1000, currency: 'USD', billingCycle: 'yearly', note: '$84/年' },
    ],
  },
  {
    id: 'studysapuri-english',
    topCategoryId: 'learning',
    name: 'スタディサプリ ENGLISH',
    plans: [
      { id: 'studysapuri-daily', name: '新日常英会話', approxMonthlyJPY: 2178, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'studysapuri-toeic', name: 'TOEIC対策', approxMonthlyJPY: 3278, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'studysapuri-business', name: 'ビジネス英語', approxMonthlyJPY: 3278, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'xbox-gamepass',
    topCategoryId: 'games',
    name: 'Xbox Game Pass',
    isPopular: true,
    plans: [
      { id: 'gamepass-essential', name: 'Essential', approxMonthlyJPY: 850, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'gamepass-premium', name: 'Premium', approxMonthlyJPY: 1300, currency: 'JPY', billingCycle: 'monthly' },
      { id: 'gamepass-ultimate', name: 'Ultimate', approxMonthlyJPY: 2750, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'ps-plus',
    topCategoryId: 'games',
    name: 'PlayStation Plus',
    isPopular: true,
    plans: [
      { id: 'psplus-essential', name: 'Essential', approxMonthlyJPY: 850, currency: 'JPY', billingCycle: 'monthly' },
    ],
  },
  {
    id: 'nintendo-switch-online',
    topCategoryId: 'games',
    name: 'Nintendo Switch Online',
    isPopular: true,
    plans: [
      { id: 'nso-individual', name: '個人（12ヶ月）', approxMonthlyJPY: 200, currency: 'JPY', billingCycle: 'yearly', note: '¥2,400/年' },
      { id: 'nso-family', name: 'ファミリー（12ヶ月）', approxMonthlyJPY: 375, currency: 'JPY', billingCycle: 'yearly', note: '¥4,500/年' },
      { id: 'nso-expansion', name: '+追加パック（12ヶ月）', approxMonthlyJPY: 408, currency: 'JPY', billingCycle: 'yearly', note: '¥4,900/年' },
    ],
  },
];

export const MOBILE_CARRIERS: MobileCarrierPreset[] = [
  { id: 'docomo', label: 'docomo', portalUrl: 'https://www.docomo.ne.jp/mydocomo/', group: 'docomo系' },
  { id: 'ahamo', label: 'ahamo', portalUrl: 'https://ahamo.com/', group: 'docomo系' },
  { id: 'softbank', label: 'SoftBank', portalUrl: 'https://www.softbank.jp/mysoftbank/', group: 'SoftBank系' },
  { id: 'ymobile', label: 'Y!mobile', portalUrl: 'https://www.ymobile.jp/portal/', group: 'SoftBank系' },
  { id: 'linemo', label: 'LINEMO', portalUrl: 'https://care.linemo.jp/', group: 'SoftBank系' },
  { id: 'au', label: 'au', portalUrl: 'https://www.au.com/my-au/', group: 'au系' },
  { id: 'uq', label: 'UQ mobile', portalUrl: 'https://www.uqwimax.jp/mobile/support/member/', group: 'au系' },
  { id: 'povo', label: 'povo', portalUrl: 'https://shop.povo.jp/web/login', group: 'au系' },
  { id: 'rakuten', label: 'Rakuten Mobile', portalUrl: 'https://portal.mobile.rakuten.co.jp/my-rakuten-mobile/' },
  { id: 'other', label: 'その他の格安SIM・家族回線' },
];

export const MOBILE_AMOUNT_OPTIONS = [
  { label: '1,000円前後', value: 1000 },
  { label: '2,000円前後', value: 2000 },
  { label: '3,000円前後', value: 3000 },
  { label: '5,000円前後', value: 5000 },
  { label: '8,000円前後', value: 8000 },
  { label: '10,000円以上', value: 10000 },
];

export const FAN_AMOUNT_OPTIONS = [
  { label: '300円', value: 300 },
  { label: '500円', value: 500 },
  { label: '1,000円', value: 1000 },
  { label: '3,000円', value: 3000 },
  { label: '5,000円', value: 5000 },
  { label: '10,000円以上', value: 10000 },
];

export const FAN_TYPES = [
  { id: 'fan-club', label: '公式ファンクラブ' },
  { id: 'online-salon', label: 'オンラインサロン' },
  { id: 'creator-support', label: 'クリエイター支援（FANBOX / Patreon など）' },
];

export const OTHER_AMOUNT_OPTIONS = [
  { label: '500円', value: 500 },
  { label: '1,000円', value: 1000 },
  { label: '3,000円', value: 3000 },
  { label: '5,000円', value: 5000 },
];
