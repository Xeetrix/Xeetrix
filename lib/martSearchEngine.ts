import {
  MartCategory,
  MartLabel,
  MartProduct,
  parseProductAttributes,
  parseProductColors,
  parseProductSizes,
  parseProductTags,
  parseProductVariants,
} from "./martApi";
import { MartLang, parseCsvSlugs, pickLocalized } from "./martI18n";

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function normalizeDigitsToAscii(input: string): string {
  let out = String(input || "");
  for (let i = 0; i < 10; i++) {
    out = out.replace(new RegExp(BENGALI_DIGITS[i], "g"), String(i));
  }
  return out;
}

export function normalizeSearchText(input: string): string {
  return normalizeDigitsToAscii(input)
    .toLowerCase()
    .normalize("NFC")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’‘“”[\]\\|<>+@]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generates a phonetic Latin skeleton so misspelled English or Banglish words
 * (e.g. "hedfon" vs "headphone", "earbd" vs "earbud", "blutoth" vs "bluetooth",
 * "chasma" vs "chashma", "smartwach" vs "smartwatch") map to similar skeletons.
 */
export function buildPhoneticSkeleton(word: string): string {
  const clean = normalizeSearchText(word).replace(/[^a-z0-9]/g, "");
  if (!clean) return "";
  return clean
    .replace(/ph/g, "f")
    .replace(/sh|ss|chh/g, "s")
    .replace(/ch/g, "c")
    .replace(/kh/g, "k")
    .replace(/gh/g, "g")
    .replace(/bh/g, "v")
    .replace(/th|dh/g, "t")
    .replace(/ck|q/g, "k")
    .replace(/x/g, "ks")
    .replace(/z/g, "j")
    .replace(/w/g, "v")
    .replace(/oo|uu/g, "u")
    .replace(/ee|ea|ii/g, "i")
    .replace(/aa|ah/g, "a")
    .replace(/(.)\1+/g, "$1");
}

/**
 * Comprehensive Trilingual Synonym & Banglish Phonetic Clusters for Bangladesh E-Commerce.
 * If a query token matches ANY term in a cluster (exact or fuzzy), all canonical
 * English & Bengali terms in that cluster are expanded into the search query!
 */
interface SynonymCluster {
  canonicalEn: string;
  canonicalBn: string;
  aliases: string[];
}

export const MART_SYNONYM_CLUSTERS: SynonymCluster[] = [
  {
    canonicalEn: "watch",
    canonicalBn: "ঘড়ি",
    aliases: [
      "watch",
      "watches",
      "smartwatch",
      "smart watch",
      "wrist watch",
      "wristwatch",
      "clock",
      "ghori",
      "gori",
      "ghari",
      "gorhi",
      "ঘড়ি",
      "ঘড়ি",
      "স্মার্টওয়াচ",
      "স্মার্ট ওয়াচ",
      "হাতঘড়ি",
    ],
  },
  {
    canonicalEn: "headphone",
    canonicalBn: "হেডফোন",
    aliases: [
      "headphone",
      "headphones",
      "headset",
      "earphone",
      "earphones",
      "earbud",
      "earbuds",
      "airpod",
      "airpods",
      "tws",
      "neckband",
      "hedfon",
      "headfon",
      "earfon",
      "irfon",
      "earbd",
      "erbud",
      "airbd",
      "হেডফোন",
      "ইয়ারফোন",
      "ইয়ারফোন",
      "ইয়ারবাড",
      "ইয়ারবাডস",
      "নেকব্যান্ড",
      "এয়ারপড",
    ],
  },
  {
    canonicalEn: "bluetooth",
    canonicalBn: "ব্লুটুথ",
    aliases: [
      "bluetooth",
      "wireless",
      "blutooth",
      "blutoth",
      "blututh",
      "bt",
      "warless",
      "wirless",
      "ব্লুটুথ",
      "ওয়ারলেস",
      "ওয়ারলেস",
      "তারবিহীন",
    ],
  },
  {
    canonicalEn: "sunglass",
    canonicalBn: "চশমা",
    aliases: [
      "sunglass",
      "sunglasses",
      "glasses",
      "eyeglass",
      "eyewear",
      "spectacles",
      "frame",
      "shades",
      "chashma",
      "chosma",
      "chasma",
      "cosma",
      "rod choshma",
      "চশমা",
      "সানগ্লাস",
      "রোদচশমা",
    ],
  },
  {
    canonicalEn: "bag",
    canonicalBn: "ব্যাগ",
    aliases: [
      "bag",
      "bags",
      "backpack",
      "handbag",
      "laptop bag",
      "travel bag",
      "school bag",
      "shoulder bag",
      "tote",
      "purse",
      "wallet",
      "moneybag",
      "money bag",
      "beg",
      "bagpack",
      "manibag",
      "mani bag",
      "ব্যাগ",
      "ব্যাকপ্যাক",
      "মানিব্যাগ",
      "ওয়ালেট",
      "হ্যান্ডব্যাগ",
    ],
  },
  {
    canonicalEn: "shoe",
    canonicalBn: "জুতা",
    aliases: [
      "shoe",
      "shoes",
      "sneaker",
      "sneakers",
      "footwear",
      "sandal",
      "sandals",
      "loafer",
      "loafers",
      "boot",
      "boots",
      "slipper",
      "juta",
      "juto",
      "zuta",
      "sendel",
      "sniker",
      "জুতা",
      "জুতো",
      "স্নিকার্স",
      "স্যান্ডেল",
      "লোফার",
    ],
  },
  {
    canonicalEn: "charger",
    canonicalBn: "চার্জার",
    aliases: [
      "charger",
      "charging",
      "adapter",
      "cable",
      "data cable",
      "type c",
      "usb",
      "powerbank",
      "power bank",
      "fast charger",
      "charjar",
      "carjar",
      "cabel",
      "kebl",
      "pawar bank",
      "চার্জার",
      "ক্যাবল",
      "কেবল",
      "পাওয়ার ব্যাংক",
      "পাওয়ার ব্যাংক",
      "অ্যাডাপ্টার",
    ],
  },
  {
    canonicalEn: "speaker",
    canonicalBn: "স্পিকার",
    aliases: [
      "speaker",
      "speakers",
      "soundbox",
      "sound box",
      "subwoofer",
      "mini speaker",
      "spikar",
      "ispikar",
      "box",
      "স্পিকার",
      "সাউন্ডবক্স",
      "সাউন্ড বক্স",
    ],
  },
  {
    canonicalEn: "mobile",
    canonicalBn: "মোবাইল",
    aliases: [
      "mobile",
      "phone",
      "smartphone",
      "cellphone",
      "android",
      "iphone",
      "mobail",
      "mobl",
      "fon",
      "phn",
      "মোবাইল",
      "ফোন",
      "স্মার্টফোন",
    ],
  },
  {
    canonicalEn: "shirt",
    canonicalBn: "শার্ট",
    aliases: [
      "shirt",
      "tshirt",
      "t-shirt",
      "tee",
      "polo",
      "jersey",
      "panjabi",
      "punjabi",
      "kurta",
      "hoodie",
      "jacket",
      "shart",
      "sart",
      "tshart",
      "genji",
      "ganji",
      "panjaby",
      "শার্ট",
      "টি-শার্ট",
      "টিশার্ট",
      "গেঞ্জি",
      "পাঞ্জাবি",
      "পোলো",
      "হুডি",
      "জ্যাকেট",
    ],
  },
  {
    canonicalEn: "saree",
    canonicalBn: "শাড়ি",
    aliases: [
      "saree",
      "sari",
      "shari",
      "sharee",
      "salwar",
      "kameez",
      "three piece",
      "3 piece",
      "kurti",
      "borka",
      "burkha",
      "abaya",
      "hijab",
      "orna",
      "শাড়ি",
      "শাড়ি",
      "সালোয়ার কামিজ",
      "থ্রি পিস",
      "কুর্তি",
      "বোরকা",
      "হিজাব",
      "আবায়া",
    ],
  },
  {
    canonicalEn: "perfume",
    canonicalBn: "পারফিউম",
    aliases: [
      "perfume",
      "fragrance",
      "attar",
      "atar",
      "body spray",
      "bodyspray",
      "deodorant",
      "scent",
      "parfume",
      "parfum",
      "sent",
      "পারফিউম",
      "আতর",
      "বডি স্প্রে",
      "সুগন্ধি",
    ],
  },
  {
    canonicalEn: "beauty",
    canonicalBn: "কসমেটিকস",
    aliases: [
      "beauty",
      "cosmetics",
      "skincare",
      "skin care",
      "cream",
      "serum",
      "lotion",
      "facewash",
      "face wash",
      "lipstick",
      "makeup",
      "krim",
      "cosmetic",
      "কসমেটিকস",
      "স্কিনকেয়ার",
      "ক্রিম",
      "সিরাম",
      "ফেসওয়াশ",
      "মেকআপ",
    ],
  },
  {
    canonicalEn: "electronics",
    canonicalBn: "ইলেকট্রনিক্স",
    aliases: [
      "electronics",
      "electronic",
      "gadget",
      "gadgets",
      "device",
      "accessories",
      "fan",
      "mini fan",
      "trimmer",
      "shaver",
      "torch",
      "light",
      "lamp",
      "gejet",
      "gajet",
      "trimar",
      "ইলেকট্রনিক্স",
      "গ্যাজেট",
      "এক্সেসরিজ",
      "ট্রিমার",
      "মিনি ফ্যান",
      "লাইট",
    ],
  },
  {
    canonicalEn: "home",
    canonicalBn: "ঘরোয়া পণ্য",
    aliases: [
      "home",
      "kitchen",
      "appliance",
      "blender",
      "kettle",
      "flask",
      "bottle",
      "water bottle",
      "decor",
      "organizer",
      "ghor",
      "ranna",
      "botol",
      "ফ্লাস্ক",
      "বোতল",
      "ব্লেন্ডার",
      "কেটলি",
      "কিচেন",
      "ঘরোয়া",
      "হোম",
    ],
  },
];

/**
 * Damerau-Levenshtein Edit Distance (handles insertions, deletions, substitutions, and adjacent transpositions).
 */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;
  if (Math.abs(lenA - lenB) > 4) return Math.abs(lenA - lenB);

  const dp: number[][] = Array.from({ length: lenA + 1 }, () =>
    new Array<number>(lenB + 1).fill(0)
  );
  for (let i = 0; i <= lenA; i++) dp[i][0] = i;
  for (let j = 0; j <= lenB; j++) dp[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + cost);
      }
    }
  }
  return dp[lenA][lenB];
}

/**
 * Character Bigram Dice Similarity (0..1) for partial or transposed words across English & Bengali.
 */
export function bigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;

  const bigramsA = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const bg = a.slice(i, i + 2);
    bigramsA.set(bg, (bigramsA.get(bg) || 0) + 1);
  }

  let intersection = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bg = b.slice(i, i + 2);
    const count = bigramsA.get(bg) || 0;
    if (count > 0) {
      intersection++;
      bigramsA.set(bg, count - 1);
    }
  }

  return (2 * intersection) / (a.length - 1 + (b.length - 1));
}

export interface MartAutoCompleteItem {
  term: string;
  matchedCategorySlug?: string;
}

export interface MartDidYouMean {
  suggestedTerm: string;
  originalQuery: string;
  reason: "typo" | "banglish";
}

export interface MartSearchResultBundle {
  query: string;
  matchedProducts: MartProduct[];
  topSuggestions: MartProduct[];
  autoCompleteTerms: string[];
  matchedCategories: MartCategory[];
  didYouMean: MartDidYouMean | null;
  fallbackProducts: MartProduct[];
  trendingTerms: string[];
}

interface IndexedProductDoc {
  product: MartProduct;
  titleNorm: string;
  skuNorm: string;
  catNorm: string;
  labelNorm: string;
  variantNorm: string;
  descNorm: string;
  allTokens: string[];
  phoneticTokens: string[];
}

export function runMartSmartSearch(params: {
  query: string;
  products: MartProduct[];
  categories: MartCategory[];
  labels: MartLabel[];
  lang: MartLang;
}): MartSearchResultBundle {
  const { query, products, categories, labels, lang } = params;
  const cleanQuery = normalizeSearchText(query);

  const catMap = new Map<string, MartCategory>();
  categories.forEach((c) => catMap.set(c.slug, c));
  const lblMap = new Map<string, MartLabel>();
  labels.forEach((l) => lblMap.set(l.slug, l));

  // Build dynamic trending terms from active categories + top featured products
  const trendingSet = new Set<string>();
  categories.slice(0, 5).forEach((cat) => {
    const name = pickLocalized(cat.nameEn, cat.nameBn, lang, cat.slug).trim();
    if (name) trendingSet.add(name);
  });
  products
    .filter((p) => p.featured)
    .slice(0, 4)
    .forEach((p) => {
      const name = pickLocalized(p.nameEn, p.nameBn, lang, p.sku).trim();
      const shortName = name.split(/\s+/).slice(0, 2).join(" ");
      if (shortName) trendingSet.add(shortName);
    });
  if (trendingSet.size < 4) {
    const defaults =
      lang === "bn"
        ? ["স্মার্ট ওয়াচ", "ইয়ারবাড", "ব্যাগ", "সানগ্লাস", "চার্জার"]
        : ["Smart Watch", "Wireless Earbuds", "Backpack", "Sunglasses", "Fast Charger"];
    defaults.forEach((d) => trendingSet.add(d));
  }
  const trendingTerms = Array.from(trendingSet).slice(0, 6);

  if (!cleanQuery) {
    return {
      query: "",
      matchedProducts: products,
      topSuggestions: products.slice(0, 5),
      autoCompleteTerms: [],
      matchedCategories: categories.slice(0, 4),
      didYouMean: null,
      fallbackProducts: [],
      trendingTerms,
    };
  }

  // Build product documents & vocabulary
  const vocabularyMap = new Map<string, string>(); // normalizedTerm -> displayTerm
  const docs: IndexedProductDoc[] = products.map((product) => {
    const catTexts = parseCsvSlugs(product.categories)
      .map((slug) => {
        const c = catMap.get(slug);
        return c ? `${c.nameEn} ${c.nameBn} ${c.slug}` : slug;
      })
      .join(" ");
    const labelTexts = parseCsvSlugs(product.labels)
      .map((slug) => {
        const l = lblMap.get(slug);
        return l ? `${l.nameEn} ${l.nameBn} ${l.slug}` : slug;
      })
      .join(" ");
    const colorTexts = parseProductColors(product.colorsJson)
      .map((c) => `${c.nameEn} ${c.nameBn}`)
      .join(" ");
    const sizeTexts = parseProductSizes(product.sizesList).join(" ");
    const varTexts = `${product.variantsEn || ""} ${product.variantsBn || ""}`;
    const tagTexts = parseProductTags(product.tags).join(" ");
    const parsedAttrs = parseProductAttributes(product.attributesJson);
    const attrTexts = [
      parsedAttrs.gender,
      parsedAttrs.ageGroup,
      parsedAttrs.material,
      parsedAttrs.brand,
    ]
      .filter(Boolean)
      .join(" ");

    const titleNorm = normalizeSearchText(`${product.nameEn} ${product.nameBn}`);
    const skuNorm = normalizeSearchText(product.sku);
    const catNorm = normalizeSearchText(`${catTexts} ${tagTexts}`);
    const labelNorm = normalizeSearchText(`${labelTexts} ${attrTexts}`);
    const variantNorm = normalizeSearchText(`${colorTexts} ${sizeTexts} ${varTexts}`);
    const descNorm = normalizeSearchText(`${product.descriptionEn} ${product.descriptionBn}`);

    const rawCombined = `${titleNorm} ${skuNorm} ${catNorm} ${labelNorm} ${variantNorm}`;
    const tokens = Array.from(
      new Set(rawCombined.split(" ").filter((t) => t.length >= 2))
    );
    const phoneticTokens = tokens
      .map((t) => buildPhoneticSkeleton(t))
      .filter((t) => t.length >= 2);

    // Populate vocabulary for auto-complete & typo recovery
    const localizedName = pickLocalized(product.nameEn, product.nameBn, lang, product.sku);
    if (localizedName) {
      vocabularyMap.set(normalizeSearchText(localizedName), localizedName);
    }
    parseProductTags(product.tags).forEach((tag) => {
      const normTag = normalizeSearchText(tag);
      if (normTag.length >= 2 && !vocabularyMap.has(normTag)) {
        vocabularyMap.set(normTag, tag);
      }
    });
    tokens.forEach((tok) => {
      if (tok.length >= 3 && !vocabularyMap.has(tok)) {
        vocabularyMap.set(tok, tok);
      }
    });

    return {
      product,
      titleNorm,
      skuNorm,
      catNorm,
      labelNorm,
      variantNorm,
      descNorm,
      allTokens: tokens,
      phoneticTokens,
    };
  });

  categories.forEach((cat) => {
    const title = pickLocalized(cat.nameEn, cat.nameBn, lang, cat.slug);
    if (title) {
      vocabularyMap.set(normalizeSearchText(title), title);
    }
  });

  // 1. Query Tokenization & Banglish / Synonym Expansion
  const queryTokens = cleanQuery.split(" ").filter(Boolean);
  const expandedTermGroups: string[][] = [];
  let detectedCorrection: MartDidYouMean | null = null;

  for (const qTok of queryTokens) {
    const qPhonetic = buildPhoneticSkeleton(qTok);
    const group = new Set<string>([qTok]);

    // Check synonym & Banglish clusters
    let matchedCluster: SynonymCluster | null = null;
    let isBanglishAlias = false;

    for (const cluster of MART_SYNONYM_CLUSTERS) {
      for (const alias of cluster.aliases) {
        const aliasNorm = normalizeSearchText(alias);
        const aliasPhonetic = buildPhoneticSkeleton(aliasNorm);
        const exactAliasMatch = aliasNorm === qTok;
        const phoneticMatch =
          qPhonetic.length >= 3 &&
          aliasPhonetic.length >= 3 &&
          (aliasPhonetic === qPhonetic ||
            (qPhonetic.length >= 4 && editDistance(aliasPhonetic, qPhonetic) <= 1));
        const editMatch =
          qTok.length >= 4 &&
          aliasNorm.length >= 4 &&
          editDistance(aliasNorm, qTok) <= (qTok.length >= 6 ? 2 : 1);

        if (exactAliasMatch || phoneticMatch || editMatch) {
          matchedCluster = cluster;
          if (
            aliasNorm !== cluster.canonicalEn &&
            aliasNorm !== cluster.canonicalBn
          ) {
            isBanglishAlias = true;
          }
          break;
        }
      }
      if (matchedCluster) break;
    }

    if (matchedCluster) {
      matchedCluster.aliases.forEach((a) => group.add(normalizeSearchText(a)));
      group.add(normalizeSearchText(matchedCluster.canonicalEn));
      group.add(normalizeSearchText(matchedCluster.canonicalBn));

      if (!detectedCorrection && isBanglishAlias) {
        const preferred =
          lang === "bn"
            ? `${matchedCluster.canonicalBn} (${matchedCluster.canonicalEn})`
            : `${matchedCluster.canonicalEn} (${matchedCluster.canonicalBn})`;
        if (normalizeSearchText(preferred) !== cleanQuery) {
          detectedCorrection = {
            suggestedTerm:
              lang === "bn" ? matchedCluster.canonicalBn : matchedCluster.canonicalEn,
            originalQuery: query,
            reason: "banglish",
          };
        }
      }
    }

    expandedTermGroups.push(Array.from(group));
  }

  // 2. Score Every Product across Multiple Signals
  const scoredProducts: { product: MartProduct; score: number }[] = [];

  for (const doc of docs) {
    let totalScore = 0;

    // Full-phrase bonus
    if (doc.skuNorm === cleanQuery) {
      totalScore += 220;
    } else if (doc.skuNorm.includes(cleanQuery)) {
      totalScore += 140;
    }
    if (doc.titleNorm.includes(cleanQuery)) {
      totalScore += 150;
    } else if (doc.catNorm.includes(cleanQuery) || doc.labelNorm.includes(cleanQuery)) {
      totalScore += 95;
    }

    // Score each token group
    let matchedTokenGroups = 0;

    for (let gIdx = 0; gIdx < expandedTermGroups.length; gIdx++) {
      const candidates = expandedTermGroups[gIdx];
      const rawToken = queryTokens[gIdx];
      const rawPhonetic = buildPhoneticSkeleton(rawToken);
      let bestGroupScore = 0;

      for (const term of candidates) {
        if (!term) continue;
        // Exact or substring in title
        if (doc.titleNorm.includes(term)) {
          const isPrefix = doc.allTokens.some((t) => t.startsWith(term));
          bestGroupScore = Math.max(bestGroupScore, isPrefix ? 90 : 75);
        }
        // Category or Label match
        if (doc.catNorm.includes(term) || doc.labelNorm.includes(term)) {
          bestGroupScore = Math.max(bestGroupScore, 65);
        }
        // Variant (color/size) or SKU match
        if (doc.variantNorm.includes(term) || doc.skuNorm.includes(term)) {
          bestGroupScore = Math.max(bestGroupScore, 60);
        }
        // Description match
        if (doc.descNorm.includes(term)) {
          bestGroupScore = Math.max(bestGroupScore, 35);
        }
      }

      // If no direct/synonym substring match, try Fuzzy Edit Distance & Phonetic Skeleton & N-Gram
      if (bestGroupScore === 0 && rawToken.length >= 2) {
        for (const docTok of doc.allTokens) {
          if (docTok.startsWith(rawToken) || rawToken.startsWith(docTok)) {
            bestGroupScore = Math.max(bestGroupScore, 55);
            continue;
          }

          // Phonetic match (handles Banglish & English spelling variations)
          if (rawPhonetic.length >= 3) {
            const docPhon = buildPhoneticSkeleton(docTok);
            if (docPhon && docPhon === rawPhonetic) {
              bestGroupScore = Math.max(bestGroupScore, 58);
              continue;
            }
            if (
              docPhon.length >= 4 &&
              rawPhonetic.length >= 4 &&
              editDistance(docPhon, rawPhonetic) <= 1
            ) {
              bestGroupScore = Math.max(bestGroupScore, 44);
            }
          }

          // Fuzzy Edit Distance (Typo-tolerance: 1 typo for 4-5 chars, 2 typos for 6+ chars)
          const maxAllowedDist = rawToken.length >= 6 ? 2 : rawToken.length >= 4 ? 1 : 0;
          if (maxAllowedDist > 0 && Math.abs(docTok.length - rawToken.length) <= maxAllowedDist) {
            const dist = editDistance(docTok, rawToken);
            if (dist <= maxAllowedDist) {
              bestGroupScore = Math.max(bestGroupScore, dist === 1 ? 52 : 38);
            }
          }

          // Character Bigram Similarity (handles partial / jumbled characters)
          if (rawToken.length >= 3 && docTok.length >= 3) {
            const sim = bigramSimilarity(rawToken, docTok);
            if (sim >= 0.55) {
              bestGroupScore = Math.max(bestGroupScore, Math.round(sim * 55));
            }
          }
        }
      }

      if (bestGroupScore > 0) {
        matchedTokenGroups++;
        totalScore += bestGroupScore;
      }
    }

    // Require at least 1 token group match; give multi-token coordination bonus
    if (matchedTokenGroups > 0) {
      if (matchedTokenGroups === queryTokens.length && queryTokens.length > 1) {
        totalScore += 45;
      }
      if (doc.product.featured) {
        totalScore += 5;
      }
      scoredProducts.push({ product: doc.product, score: totalScore });
    }
  }

  scoredProducts.sort((a, b) => b.score - a.score);
  const matchedProducts = scoredProducts
    .filter((item) => item.score >= 30)
    .map((item) => item.product);

  // 3. Auto-Complete Predictive Terms
  const autoCompleteCandidates: { display: string; score: number }[] = [];
  vocabularyMap.forEach((display, norm) => {
    if (norm === cleanQuery) return;
    if (norm.startsWith(cleanQuery)) {
      autoCompleteCandidates.push({ display, score: 100 - norm.length });
    } else if (norm.includes(cleanQuery)) {
      autoCompleteCandidates.push({ display, score: 70 - norm.length });
    } else if (cleanQuery.length >= 3) {
      const dist = editDistance(norm.slice(0, cleanQuery.length), cleanQuery);
      if (dist <= 1) {
        autoCompleteCandidates.push({ display, score: 50 - dist * 10 });
      }
    }
  });

  // Also add synonym canonical suggestions if query is a prefix of a Banglish/synonym alias
  for (const cluster of MART_SYNONYM_CLUSTERS) {
    if (
      cluster.aliases.some(
        (a) =>
          normalizeSearchText(a).startsWith(cleanQuery) ||
          normalizeSearchText(a) === cleanQuery
      )
    ) {
      const label = lang === "bn" ? cluster.canonicalBn : cluster.canonicalEn;
      autoCompleteCandidates.push({ display: label, score: 95 });
    }
  }

  autoCompleteCandidates.sort((a, b) => b.score - a.score);
  const seenAuto = new Set<string>();
  const autoCompleteTerms: string[] = [];
  for (const cand of autoCompleteCandidates) {
    const key = normalizeSearchText(cand.display);
    if (!key || key === cleanQuery || seenAuto.has(key)) continue;
    seenAuto.add(key);
    autoCompleteTerms.push(cand.display);
    if (autoCompleteTerms.length >= 5) break;
  }

  // 4. Typo "Did You Mean?" Detection when user typed a misspelled word
  if (!detectedCorrection && cleanQuery.length >= 3) {
    let bestTerm = "";
    let bestScore = 0;

    vocabularyMap.forEach((display, norm) => {
      if (norm === cleanQuery) return;
      const dist = editDistance(norm, cleanQuery);
      const sim = bigramSimilarity(norm, cleanQuery);
      if (dist >= 1 && dist <= 2 && sim >= 0.45) {
        const candidateScore = (3 - dist) * 30 + sim * 40;
        if (candidateScore > bestScore) {
          bestScore = candidateScore;
          bestTerm = display;
        }
      }
    });

    if (bestTerm && (matchedProducts.length === 0 || bestScore >= 65)) {
      detectedCorrection = {
        suggestedTerm: bestTerm,
        originalQuery: query,
        reason: "typo",
      };
    }
  }

  // 5. Matching Categories
  const matchedCategories = categories.filter((cat) => {
    const hay = normalizeSearchText(`${cat.nameEn} ${cat.nameBn} ${cat.slug}`);
    if (hay.includes(cleanQuery)) return true;
    return expandedTermGroups.some((group) => group.some((t) => t.length >= 2 && hay.includes(t)));
  });

  // 6. Fallback Products (when 0 direct matches, return closest scored or featured products so user never hits a dead end)
  const fallbackProducts =
    matchedProducts.length > 0
      ? []
      : scoredProducts.length > 0
      ? scoredProducts.slice(0, 6).map((s) => s.product)
      : products.slice(0, 6);

  return {
    query: cleanQuery,
    matchedProducts,
    topSuggestions: (matchedProducts.length > 0 ? matchedProducts : fallbackProducts).slice(0, 5),
    autoCompleteTerms,
    matchedCategories: matchedCategories.slice(0, 4),
    didYouMean: detectedCorrection,
    fallbackProducts,
    trendingTerms,
  };
}
