/**
 * Xeetrix Mart — Standalone Bilingual, Hybrid ERP, Variations, Coupons & QR Payment Backend
 *
 * Designed to be attached directly inside a dedicated "Xeetrix Mart Database" Google Sheet.
 *
 * FIRST-TIME & UPGRADE ONE-CLICK SETUP:
 *   1. Open your Google Sheet -> Extensions -> Apps Script -> paste this file -> Save.
 *   2. Select "setupMartBackend" in the top function dropdown and click Run.
 *   3. Authorize Google Sheets & Google Drive access.
 *      This single run automatically creates OR non-destructively upgrades:
 *        - 10 Tabs with bold frozen Row 1 headers (ZERO dummy items):
 *          Mart_Products, Mart_Categories, Mart_Labels, Mart_Suppliers, Mart_Coupons,
 *          Mart_Orders, Mart_Transactions, Mart_CRM_Profiles, Mart_CRM_Logs, Mart_Settings
 *        - Google Drive folders:
 *          Xeetrix_Mart_Storage/Products, Categories & PaymentQR
 *        - Cached Drive Folder IDs in Script Properties + warmed CacheService
 *   4. Deploy -> New deployment -> Web app -> Execute as: Me -> Who has access: Anyone.
 *
 * OPTIONAL API TOKEN:
 *   Project Settings -> Script Properties -> Add:
 *     MART_API_TOKEN = your_secret_token (also checks ADMIN_API_TOKEN if set)
 */

var MART_SCHEMA = {
  Mart_Products: [
    "id",
    "sku",
    "nameEn",
    "nameBn",
    "categories",
    "labels",
    "tags",
    "attributesJson",
    "price",
    "comparePrice",
    "costPrice",
    "wholesaleMinQty",
    "wholesalePrice",
    "fulfillmentType",
    "supplierId",
    "sourceName",
    "collectionMode",
    "supplierAvailable",
    "lowStockThreshold",
    "stock",
    "variantsEn",
    "variantsBn",
    "colorsJson",
    "sizesList",
    "variationMatrixJson",
    "imageUrl",
    "galleryUrls",
    "descriptionEn",
    "descriptionBn",
    "featured",
    "active",
    "createdAt",
    "level1Cat",
    "level2Cat",
    "level3Cat",
    "relatableCats",
    "gender",
    "ageGroup",
    "material",
    "brand"
  ],
  Mart_Categories: [
    "id",
    "slug",
    "parentSlug",
    "skuCode",
    "nameEn",
    "nameBn",
    "descriptionEn",
    "descriptionBn",
    "imageUrl",
    "sortOrder",
    "active",
    "createdAt"
  ],
  Mart_Labels: [
    "id",
    "slug",
    "nameEn",
    "nameBn",
    "descriptionEn",
    "descriptionBn",
    "tone",
    "sortOrder",
    "active",
    "createdAt"
  ],
  Mart_Attributes: [
    "id",
    "slug",
    "nameEn",
    "nameBn",
    "optionsList",
    "sortOrder",
    "active",
    "createdAt"
  ],
  Mart_Suppliers: [
    "id",
    "name",
    "companyType",
    "contactPerson",
    "phone",
    "altPhone",
    "email",
    "address",
    "payoutMode",
    "leadTimeDays",
    "tags",
    "notes",
    "nextFollowUpDate",
    "lastContactedAt",
    "active",
    "createdAt"
  ],
  Mart_Coupons: [
    "id",
    "code",
    "discountType",
    "discountValue",
    "maxDiscount",
    "minOrderAmount",
    "expiryDate",
    "usageLimit",
    "usageCount",
    "active",
    "notes",
    "createdAt"
  ],
  Mart_Orders: [
    "id",
    "itemsJson",
    "itemsSummary",
    "totalItems",
    "subtotal",
    "discountCode",
    "discountAmount",
    "deliveryArea",
    "deliveryCharge",
    "totalAmount",
    "customerName",
    "phone",
    "address",
    "paymentMethod",
    "paymentProvider",
    "transactionId",
    "notes",
    "status",
    "createdAt"
  ],
  Mart_Transactions: [
    "id",
    "date",
    "type",
    "category",
    "amount",
    "supplierId",
    "orderId",
    "paymentAccount",
    "referenceNo",
    "note",
    "createdAt"
  ],
  Mart_CRM_Profiles: [
    "id",
    "entityType",
    "entityKey",
    "name",
    "phone",
    "altPhone",
    "email",
    "address",
    "tierOverride",
    "tags",
    "notes",
    "nextFollowUpDate",
    "followUpTask",
    "lastContactedAt",
    "createdAt",
    "updatedAt"
  ],
  Mart_CRM_Logs: [
    "id",
    "entityType",
    "entityKey",
    "entityName",
    "channel",
    "outcome",
    "summary",
    "nextFollowUpDate",
    "relatedOrderId",
    "createdAt"
  ],
  Mart_Settings: ["key", "value", "updatedAt"]
};

var MART_DEFAULT_SETTINGS = {
  heroTitleEn: "Everyday Essentials & Authentic Electronics",
  heroTitleBn: "প্রতিদিনের নিত্যপ্রয়োজনীয় ও আসল ইলেকট্রনিক্স",
  heroSubtitleEn:
    "Verified quality products delivered nationwide across Bangladesh with transparent BDT pricing and flexible Cash on Delivery.",
  heroSubtitleBn:
    "স্বচ্ছ টাকা (৳) মূল্যে ও ক্যাশ অন ডেলিভারি সুবিধাসহ সারাদেশে যাচাইকৃত মানসম্মত পণ্য দ্রুত পৌঁছে দেওয়া হয়।",
  heroCtaTextEn: "Shop Collection",
  heroCtaTextBn: "কালেকশন দেখুন",
  promoTextEn: "Nationwide Delivery · Cash on Delivery & Mobile Banking Available",
  promoTextBn: "সারাদেশে ডেলিভারি · ক্যাশ অন ডেলিভারি ও মোবাইল ব্যাংকিং সুবিধা",
  insideDhakaCharge: "70",
  outsideDhakaCharge: "130",
  hotlinePhone: "+880 965 803 6631",
  whatsappNumber: "",
  supportEmail: "mart@xeetrix.com",
  mobileBankingNumber: "",
  bkashMerchantNumber: "",
  bkashQrUrl: "",
  banglaQrUrl: "",
  banglaQrAccountInfo: "",
  attributes_catalog_json: ""
};

var DRIVE_ROOT_FOLDER_NAME = "Xeetrix_Mart_Storage";
var DRIVE_PRODUCTS_FOLDER_NAME = "Products";
var DRIVE_CATEGORIES_FOLDER_NAME = "Categories";
var DRIVE_PAYMENT_FOLDER_NAME = "PaymentQR";

var PROP_DRIVE_ROOT_ID = "MART_DRIVE_ROOT_ID";
var PROP_DRIVE_PRODUCTS_ID = "MART_DRIVE_PRODUCTS_ID";
var PROP_DRIVE_CATEGORIES_ID = "MART_DRIVE_CATEGORIES_ID";
var PROP_DRIVE_PAYMENT_ID = "MART_DRIVE_PAYMENT_ID";

var CACHE_PUBLIC_KEY = "xeetrix_mart_public_v7";
var CACHE_ADMIN_KEY = "xeetrix_mart_admin_v1";
var CACHE_TTL_SECONDS = 600; // 10 minutes; automatically busted on every mutation
var CACHE_CHUNK_SIZE = 85000; // Safe margin under CacheService 100KB per-key cap
var CACHE_MAX_CHUNKS = 12; // Supports payloads up to ~1MB safely

function jsonOut(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function rawJsonOut(serializedJson) {
  return ContentService.createTextOutput(serializedJson).setMimeType(
    ContentService.MimeType.JSON
  );
}

function putChunkedScriptCache(baseKey, serialized, ttlSeconds) {
  try {
    if (!serialized) return false;
    var cache = CacheService.getScriptCache();
    var ttl = ttlSeconds || CACHE_TTL_SECONDS;
    if (serialized.length <= CACHE_CHUNK_SIZE) {
      cache.put(baseKey, "S:" + serialized, ttl);
      return true;
    }
    var count = Math.ceil(serialized.length / CACHE_CHUNK_SIZE);
    if (count > CACHE_MAX_CHUNKS) {
      return false;
    }
    var batch = {};
    batch[baseKey] = "M:" + count;
    for (var i = 0; i < count; i++) {
      batch[baseKey + "_c" + i] = serialized.slice(
        i * CACHE_CHUNK_SIZE,
        (i + 1) * CACHE_CHUNK_SIZE
      );
    }
    cache.putAll(batch, ttl);
    return true;
  } catch (err) {
    return false;
  }
}

function getChunkedScriptCache(baseKey) {
  try {
    var cache = CacheService.getScriptCache();
    var head = cache.get(baseKey);
    if (!head) return null;
    if (head.indexOf("S:") === 0) {
      return head.slice(2);
    }
    if (head.indexOf("M:") === 0) {
      var count = Number(head.slice(2));
      if (!count || count < 1 || count > CACHE_MAX_CHUNKS) return null;
      var keys = [];
      for (var i = 0; i < count; i++) {
        keys.push(baseKey + "_c" + i);
      }
      var chunks = cache.getAll(keys);
      var out = "";
      for (var j = 0; j < keys.length; j++) {
        var part = chunks[keys[j]];
        if (typeof part !== "string") {
          return null;
        }
        out += part;
      }
      return out;
    }
    // Legacy unprefixed JSON string compatibility
    return head;
  } catch (err) {
    return null;
  }
}

function removeChunkedScriptCache(baseKey) {
  try {
    var cache = CacheService.getScriptCache();
    var keys = [baseKey];
    for (var i = 0; i < CACHE_MAX_CHUNKS; i++) {
      keys.push(baseKey + "_c" + i);
    }
    cache.removeAll(keys);
  } catch (err) {
    // Ignore cache eviction error
  }
}

function getMartSheetFast(ss, sheetName) {
  var existing = ss.getSheetByName(sheetName);
  if (existing && existing.getLastColumn() > 0) {
    return existing;
  }
  return ensureMartSheet(ss, sheetName);
}

function getBoundSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error(
      "This script must be attached inside a Google Sheet (Extensions -> Apps Script)."
    );
  }
  return ss;
}

function getConfiguredApiToken() {
  try {
    var props = PropertiesService.getScriptProperties();
    return props.getProperty("MART_API_TOKEN") || props.getProperty("ADMIN_API_TOKEN") || "";
  } catch (err) {
    return "";
  }
}

function isAuthorizedMartAdmin(providedToken) {
  var configured = getConfiguredApiToken();
  if (!configured) return true;
  return String(providedToken || "") === String(configured);
}

function slugifyText(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getOrCreateFolderByName(parent, name) {
  var iter = parent ? parent.getFoldersByName(name) : DriveApp.getFoldersByName(name);
  if (iter.hasNext()) {
    return iter.next();
  }
  return parent ? parent.createFolder(name) : DriveApp.createFolder(name);
}

function resolveCachedSubfolder(props, propKey, rootFolder, folderName) {
  var savedId = props.getProperty(propKey);
  if (savedId) {
    try {
      var candidate = DriveApp.getFolderById(savedId);
      if (!candidate.isTrashed()) {
        return candidate;
      }
    } catch (e) {
      // recreate below
    }
  }
  var folder = getOrCreateFolderByName(rootFolder, folderName);
  props.setProperty(propKey, folder.getId());
  return folder;
}

function ensureDriveFoldersReady() {
  var props = PropertiesService.getScriptProperties();
  var rootFolder = null;

  var savedRootId = props.getProperty(PROP_DRIVE_ROOT_ID);
  if (savedRootId) {
    try {
      var candidateRoot = DriveApp.getFolderById(savedRootId);
      if (!candidateRoot.isTrashed()) {
        rootFolder = candidateRoot;
      }
    } catch (e) {
      rootFolder = null;
    }
  }
  if (!rootFolder) {
    rootFolder = getOrCreateFolderByName(null, DRIVE_ROOT_FOLDER_NAME);
    props.setProperty(PROP_DRIVE_ROOT_ID, rootFolder.getId());
  }

  var productsFolder = resolveCachedSubfolder(
    props,
    PROP_DRIVE_PRODUCTS_ID,
    rootFolder,
    DRIVE_PRODUCTS_FOLDER_NAME
  );
  var categoriesFolder = resolveCachedSubfolder(
    props,
    PROP_DRIVE_CATEGORIES_ID,
    rootFolder,
    DRIVE_CATEGORIES_FOLDER_NAME
  );
  var paymentFolder = resolveCachedSubfolder(
    props,
    PROP_DRIVE_PAYMENT_ID,
    rootFolder,
    DRIVE_PAYMENT_FOLDER_NAME
  );

  return {
    rootFolder: rootFolder,
    productsFolder: productsFolder,
    categoriesFolder: categoriesFolder,
    paymentFolder: paymentFolder
  };
}

function extractDriveFileId(rawUrl) {
  var u = String(rawUrl || "").trim();
  if (!u) return "";
  var m1 = u.match(/googleusercontent\.com\/d\/([A-Za-z0-9_-]{15,})/);
  if (m1 && m1[1]) return m1[1];
  var m2 = u.match(/\/file\/d\/([A-Za-z0-9_-]{15,})/);
  if (m2 && m2[1]) return m2[1];
  var m3 = u.match(/[?&]id=([A-Za-z0-9_-]{15,})/);
  if (m3 && m3[1]) return m3[1];
  return "";
}

function sanitizeDriveFolderName(rawName, fallback) {
  var clean = String(rawName || "")
    .replace(/[\/\\:*?"<>|#%]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length > 50) clean = clean.substring(0, 50).trim();
  return clean || fallback || "Uncategorized";
}

function sanitizeDriveCodeSegment(rawCode, fallback) {
  var clean = String(rawCode || "")
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return clean || fallback || "ITEM";
}

function deriveColorCodeForDrive(colorName, fallbackIdx) {
  var raw = String(colorName || "").trim();
  var lower = raw.toLowerCase();
  var presets = {
    black: "BLK",
    white: "WHT",
    "off white": "OWH",
    "off-white": "OWH",
    red: "RED",
    blue: "BLU",
    "light blue": "LIB",
    "sky blue": "SKB",
    "royal blue": "RBL",
    "navy blue": "NVY",
    navy: "NVY",
    "cadet blue": "CAB",
    green: "GRN",
    "dark green": "DGR",
    olive: "OLV",
    maroon: "MRN",
    burgundy: "BRG",
    grey: "GRY",
    gray: "GRY",
    charcoal: "CHR",
    pink: "PNK",
    yellow: "YLW",
    mustard: "MST",
    orange: "ORG",
    purple: "PRP",
    violet: "VLT",
    brown: "BRN",
    coffee: "COF",
    chocolate: "CHC",
    camel: "CML",
    beige: "BGE",
    cream: "CRM",
    khaki: "KHK",
    gold: "GLD",
    silver: "SLV",
    teal: "TEL",
    cyan: "CYN"
  };
  if (presets[lower]) return presets[lower];
  var seg = sanitizeDriveCodeSegment(raw, "C" + (fallbackIdx || 1));
  return seg.length > 12 ? seg.substring(0, 12) : seg;
}

function resolveDriveFileExtension(mimeType, origFileName) {
  var mt = String(mimeType || "").toLowerCase();
  if (mt.indexOf("png") !== -1) return ".png";
  if (mt.indexOf("webp") !== -1) return ".webp";
  if (mt.indexOf("gif") !== -1) return ".gif";
  if (mt.indexOf("jpeg") !== -1 || mt.indexOf("jpg") !== -1) return ".jpg";
  var nameMatch = String(origFileName || "").toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/);
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1] === "jpeg" ? ".jpg" : "." + nameMatch[1];
  }
  return ".jpg";
}

function buildStandardProductImageName(skuCode, role, colorLabel, galleryIdx, mimeType, origFileName) {
  var cleanSku = sanitizeDriveCodeSegment(skuCode, "ITEM");
  var ext = resolveDriveFileExtension(mimeType, origFileName);
  var r = String(role || "MAIN").toUpperCase().trim();
  if (r === "MAIN") {
    return cleanSku + "-MAIN" + ext;
  }
  if (r === "COLOR") {
    var cCode = deriveColorCodeForDrive(colorLabel, galleryIdx || 1);
    return cleanSku + "-COLOR-" + cCode + ext;
  }
  if (r === "GALLERY") {
    var idxNum = Math.max(1, Number(galleryIdx) || 1);
    var pad = idxNum < 10 ? "0" + idxNum : String(idxNum);
    return cleanSku + "-GALLERY-" + pad + ext;
  }
  return cleanSku + "-ASSET" + ext;
}

function resolveCategoryFolderSegmentsFromCsv(categoriesCsv, catIndex) {
  var slugs = String(categoriesCsv || "")
    .split(",")
    .map(function (s) {
      return s.trim();
    })
    .filter(function (s) {
      return Boolean(s);
    });
  if (slugs.length === 0 || !catIndex || !catIndex.bySlug) {
    return ["Uncategorized"];
  }
  var primaryCat = catIndex.bySlug[slugs[0]];
  if (!primaryCat) {
    return [sanitizeDriveFolderName(slugs[0], "Uncategorized")];
  }
  var chain = [primaryCat];
  var visited = {};
  visited[primaryCat.slug] = true;
  var cursor = primaryCat;
  while (cursor.parentSlug && chain.length < 3) {
    var ps = String(cursor.parentSlug).trim();
    if (!ps || visited[ps] || !catIndex.bySlug[ps]) break;
    visited[ps] = true;
    chain.unshift(catIndex.bySlug[ps]);
    cursor = catIndex.bySlug[ps];
  }
  var out = [];
  for (var i = 0; i < chain.length; i++) {
    var seg = sanitizeDriveFolderName(chain[i].nameEn || chain[i].slug || chain[i].nameBn, "");
    if (seg) out.push(seg);
  }
  return out.length > 0 ? out : ["Uncategorized"];
}

function getOrCreateNestedSubfolder(rootFolder, segments) {
  var current = rootFolder;
  for (var i = 0; i < (segments || []).length; i++) {
    var seg = sanitizeDriveFolderName(segments[i], "");
    if (!seg || seg === "_Unused") continue;
    current = getOrCreateFolderByName(current, seg);
  }
  return current;
}

function resolveProductDriveFolder(folders, categorySegments, sku, productId) {
  var catSegs = [];
  if (Array.isArray(categorySegments)) {
    for (var i = 0; i < categorySegments.length; i++) {
      var clean = sanitizeDriveFolderName(categorySegments[i], "");
      if (clean && clean !== "_Unused") catSegs.push(clean);
    }
  }
  if (catSegs.length === 0) {
    catSegs = ["Uncategorized"];
  }
  var skuFolderName = sanitizeDriveCodeSegment(sku || productId, "UNASSIGNED");
  return getOrCreateNestedSubfolder(folders.productsFolder, catSegs.concat([skuFolderName]));
}

function isFileInsideFolder(file, targetFolderId) {
  try {
    var parents = file.getParents();
    while (parents.hasNext()) {
      if (parents.next().getId() === targetFolderId) {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

function moveAndRenameDriveFileSafe(fileId, targetFolder, targetName) {
  var res = { ok: false, moved: false, renamed: false };
  if (!fileId || !targetFolder) return res;
  try {
    var file = DriveApp.getFileById(fileId);
    if (!file || file.isTrashed()) return res;
    var targetFolderId = targetFolder.getId();
    if (!isFileInsideFolder(file, targetFolderId)) {
      file.moveTo(targetFolder);
      res.moved = true;
    }
    if (targetName && file.getName() !== targetName) {
      file.setName(targetName);
      res.renamed = true;
    }
    res.ok = true;
  } catch (err) {
    // Non-fatal guard for external or inaccessible Drive file IDs
  }
  return res;
}

function syncSingleProductDriveAssets(folders, productObj, catIndex, globalReferencedIds) {
  var stats = { organized: 0, moved: 0, renamed: 0 };
  if (!productObj) return stats;

  var skuCode = sanitizeDriveCodeSegment(productObj.sku || productObj.id, "ITEM");
  var assignments = [];
  var assignedInProd = {};
  var usedColorCodes = {};

  var mainId = extractDriveFileId(productObj.imageUrl);
  if (mainId) {
    assignedInProd[mainId] = true;
    assignments.push({ fileId: mainId, role: "MAIN", colorLabel: "", galleryIdx: 0 });
  }

  // Color variant photos (Priority 2)
  if (productObj.colorsJson) {
    try {
      var parsedColors = JSON.parse(String(productObj.colorsJson));
      if (Array.isArray(parsedColors)) {
        for (var ci = 0; ci < parsedColors.length; ci++) {
          var colObj = parsedColors[ci];
          if (!colObj || !colObj.imageUrl) continue;
          var cFileId = extractDriveFileId(colObj.imageUrl);
          if (!cFileId || assignedInProd[cFileId]) continue;
          assignedInProd[cFileId] = true;
          var baseColorCode = deriveColorCodeForDrive(colObj.nameEn || colObj.nameBn || "", ci + 1);
          var uniqueColorCode = baseColorCode;
          if (usedColorCodes[baseColorCode]) {
            usedColorCodes[baseColorCode] += 1;
            uniqueColorCode = baseColorCode + "-" + usedColorCodes[baseColorCode];
          } else {
            usedColorCodes[baseColorCode] = 1;
          }
          assignments.push({
            fileId: cFileId,
            role: "COLOR",
            colorLabel: uniqueColorCode,
            galleryIdx: ci + 1
          });
        }
      }
    } catch (e) {}
  }

  // Additional gallery photos (Priority 3)
  var rawGallery = String(productObj.galleryUrls || "");
  if (rawGallery.trim()) {
    var galleryParts = rawGallery.split(/[\n,]+/);
    var gCounter = 0;
    for (var gi = 0; gi < galleryParts.length; gi++) {
      var gId = extractDriveFileId(galleryParts[gi]);
      if (!gId || assignedInProd[gId]) continue;
      assignedInProd[gId] = true;
      gCounter += 1;
      assignments.push({ fileId: gId, role: "GALLERY", colorLabel: "", galleryIdx: gCounter });
    }
  }

  if (assignments.length === 0) return stats;

  var catSegs = resolveCategoryFolderSegmentsFromCsv(productObj.categories, catIndex);
  var targetFolder = resolveProductDriveFolder(folders, catSegs, productObj.sku, productObj.id);

  for (var a = 0; a < assignments.length; a++) {
    var item = assignments[a];
    if (globalReferencedIds) {
      globalReferencedIds[item.fileId] = true;
    }
    var origName = "";
    var mime = "image/jpeg";
    try {
      var fProbe = DriveApp.getFileById(item.fileId);
      if (fProbe && !fProbe.isTrashed()) {
        origName = fProbe.getName();
        mime = fProbe.getMimeType();
      }
    } catch (e) {}
    var targetName =
      item.role === "COLOR"
        ? skuCode + "-COLOR-" + item.colorLabel + resolveDriveFileExtension(mime, origName)
        : buildStandardProductImageName(skuCode, item.role, item.colorLabel, item.galleryIdx, mime, origName);
    var res = moveAndRenameDriveFileSafe(item.fileId, targetFolder, targetName);
    if (res.ok) stats.organized += 1;
    if (res.moved) stats.moved += 1;
    if (res.renamed) stats.renamed += 1;
  }

  return stats;
}

function quarantineUnusedDriveFilesRecursive(folder, productsRootId, unusedFolder, unusedFolderId, referencedIds, counter) {
  if (!folder || folder.getId() === unusedFolderId) return;

  var subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    var child = subFolders.next();
    if (!child || child.isTrashed() || child.getId() === unusedFolderId) continue;
    quarantineUnusedDriveFilesRecursive(
      child,
      productsRootId,
      unusedFolder,
      unusedFolderId,
      referencedIds,
      counter
    );
  }

  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    if (!file || file.isTrashed()) continue;
    var fid = file.getId();
    if (!referencedIds[fid]) {
      try {
        file.moveTo(unusedFolder);
        counter.movedToUnused += 1;
      } catch (e) {}
    }
  }

  // Trash empty leftover subfolders (never Products root or _Unused)
  if (folder.getId() !== productsRootId && folder.getId() !== unusedFolderId) {
    try {
      var hasFiles = folder.getFiles().hasNext();
      var hasSub = folder.getFolders().hasNext();
      if (!hasFiles && !hasSub) {
        folder.setTrashed(true);
        counter.emptyFoldersCleaned += 1;
      }
    } catch (e) {}
  }
}

/**
 * Organizes all existing product photos in Google Drive into:
 *   Xeetrix_Mart_Storage / Products / <CategoryPath> / <SKU> / <SKU>-MAIN|COLOR|GALLERY.jpg
 * Moves unreferenced/duplicate leftover files safely to Products/_Unused (never deletes).
 * File IDs remain unchanged so zero live website links break.
 */
function organizeProductDriveAssets(ss, silent) {
  var targetSs = ss || getBoundSpreadsheet();
  var prodSheet = ensureMartSheet(targetSs, "Mart_Products");
  var catSheet = ensureMartSheet(targetSs, "Mart_Categories");
  var allCats = readMartRows(catSheet, "Mart_Categories");
  var allProds = readMartRows(prodSheet, "Mart_Products", allCats);
  var catIndex = buildCategoryLookupIndex(allCats);
  var folders = ensureDriveFoldersReady();

  var referencedIds = {};
  var productsProcessed = 0;
  var organizedFiles = 0;
  var movedFiles = 0;
  var renamedFiles = 0;

  for (var i = 0; i < allProds.length; i++) {
    var prod = allProds[i];
    var pStats = syncSingleProductDriveAssets(folders, prod, catIndex, referencedIds);
    if (pStats.organized > 0) {
      productsProcessed += 1;
      organizedFiles += pStats.organized;
      movedFiles += pStats.moved;
      renamedFiles += pStats.renamed;
    }
  }

  var unusedFolder = getOrCreateFolderByName(folders.productsFolder, "_Unused");
  var quarantineCounter = { movedToUnused: 0, emptyFoldersCleaned: 0 };
  quarantineUnusedDriveFilesRecursive(
    folders.productsFolder,
    folders.productsFolder.getId(),
    unusedFolder,
    unusedFolder.getId(),
    referencedIds,
    quarantineCounter
  );

  var summary = {
    ok: true,
    productsProcessed: productsProcessed,
    organizedFiles: organizedFiles,
    movedFiles: movedFiles,
    renamedFiles: renamedFiles,
    movedToUnused: quarantineCounter.movedToUnused,
    emptyFoldersCleaned: quarantineCounter.emptyFoldersCleaned
  };

  if (!silent) {
    try {
      SpreadsheetApp.getUi().alert(
        "Google Drive Photos Organized!",
        "Products organized: " +
          summary.productsProcessed +
          "\nActive photos checked: " +
          summary.organizedFiles +
          " (Moved: " +
          summary.movedFiles +
          ", Renamed: " +
          summary.renamedFiles +
          ")\nUnused / duplicate files moved safely to _Unused: " +
          summary.movedToUnused +
          "\nEmpty folders cleaned: " +
          summary.emptyFoldersCleaned +
          "\n\nAll live website image links remain 100% intact.",
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } catch (e) {}
  }

  return summary;
}

function organizeProductDriveAssetsMenuAction() {
  return organizeProductDriveAssets(getBoundSpreadsheet(), false);
}

function safeFlushSpreadsheet() {
  try {
    SpreadsheetApp.flush();
    return true;
  } catch (e) {
    return false;
  }
}

function styleHeaderRange(range) {
  try {
    range.setFontWeight("bold");
    range.setBackground("#0B5336");
    range.setFontColor("#FFFFFF");
    SpreadsheetApp.flush();
  } catch (e) {
    // Ignore if range is inside a Google Sheets Table with locked header formatting
  }
}

/**
 * Ensures the sheet exists and non-destructively appends any missing schema columns
 * to Row 1 so existing spreadsheets upgrade safely without losing data.
 */
function ensureMartSheet(ss, sheetName) {
  var headers = MART_SCHEMA[sheetName];
  if (!headers) {
    throw new Error("Unknown Mart sheet tab: " + sheetName);
  }
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    try {
      headerRange.setValues([headers]);
      SpreadsheetApp.flush();
    } catch (e) {}
    styleHeaderRange(headerRange);
    try {
      sheet.setFrozenRows(1);
      SpreadsheetApp.flush();
    } catch (e) {}
    for (var c = 1; c <= headers.length; c++) {
      try {
        sheet.setColumnWidth(c, 150);
      } catch (e) {}
    }
    safeFlushSpreadsheet();
    return sheet;
  }

  // Non-destructive column upgrade for existing spreadsheets
  var lastCol = Math.max(1, sheet.getLastColumn());
  var rawHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var existingSet = {};
  for (var i = 0; i < rawHeaders.length; i++) {
    var h = String(rawHeaders[i] || "").trim();
    if (h) existingSet[h] = true;
  }

  var missingHeaders = [];
  for (var j = 0; j < headers.length; j++) {
    if (!existingSet[headers[j]]) {
      missingHeaders.push(headers[j]);
    }
  }

  if (missingHeaders.length > 0) {
    var startCol = lastCol + 1;
    var addRange = sheet.getRange(1, startCol, 1, missingHeaders.length);
    try {
      addRange.setValues([missingHeaders]);
      SpreadsheetApp.flush();
    } catch (e) {}
    styleHeaderRange(addRange);
    for (var m = 0; m < missingHeaders.length; m++) {
      try {
        sheet.setColumnWidth(startCol + m, 150);
      } catch (e) {}
    }
    try {
      sheet.setFrozenRows(1);
      SpreadsheetApp.flush();
    } catch (e) {}
  }

  return sheet;
}

/**
 * Protects Row 1 (Header Row) across all sheets/tables in the workbook.
 * mode = "strict"  -> Blocks all other editors except Owner (100% locked for staff/team).
 * mode = "warning" -> Shows an "Are you sure?" warning dialog even for the Owner & everyone else.
 */
function protectAllMartHeaderRows(ss, mode) {
  var targetSs = ss || getBoundSpreadsheet();
  var lockMode = mode === "warning" ? "warning" : "strict";
  var sheets = targetSs.getSheets();
  var protectedCount = 0;
  var me = null;
  try {
    me = Session.getEffectiveUser();
  } catch (e) {
    me = null;
  }

  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    try {
      var existing = sh.getProtections(SpreadsheetApp.ProtectionType.RANGE) || [];
      for (var p = 0; p < existing.length; p++) {
        var desc = String(existing[p].getDescription() || "");
        if (desc.indexOf("Xeetrix Mart Header Lock") === 0) {
          try {
            existing[p].remove();
          } catch (remErr) {}
        }
      }

      var maxCols = Math.max(1, sh.getMaxColumns());
      var headerRange = sh.getRange(1, 1, 1, maxCols);
      var protection = headerRange
        .protect()
        .setDescription("Xeetrix Mart Header Lock (Row 1 - " + lockMode + ")");

      if (lockMode === "warning") {
        protection.setWarningOnly(true);
      } else {
        protection.setWarningOnly(false);
        try {
          if (me && me.getEmail && me.getEmail()) {
            protection.addEditor(me);
          }
        } catch (addErr) {}
        try {
          var editors = protection.getEditors();
          if (editors && editors.length > 0) {
            var toRemove = [];
            var myEmail = me && me.getEmail ? String(me.getEmail()).toLowerCase() : "";
            for (var ed = 0; ed < editors.length; ed++) {
              var edEmail = editors[ed] && editors[ed].getEmail ? String(editors[ed].getEmail()).toLowerCase() : "";
              if (!myEmail || edEmail !== myEmail) {
                toRemove.push(editors[ed]);
              }
            }
            if (toRemove.length > 0) {
              protection.removeEditors(toRemove);
            }
          }
        } catch (remEdErr) {}
        try {
          if (protection.canDomainEdit()) {
            protection.setDomainEdit(false);
          }
        } catch (domErr) {}
      }
      SpreadsheetApp.flush();
      protectedCount += 1;
    } catch (sheetErr) {
      // Non-fatal per-sheet protection guard
    }
  }
  return protectedCount;
}

/**
 * ONE-CLICK INITIALIZER / UPGRADER:
 * Run inside your bound Google Sheet's Apps Script Editor.
 * Builds/upgrades all Mart tabs, Drive folders, Table-Safe Sheet Dropdowns, Auto-SKU, Header Row Lock & CacheService.
 */
function setupMartBackend() {
  var ss = getBoundSpreadsheet();
  var tabNames = Object.keys(MART_SCHEMA);
  for (var i = 0; i < tabNames.length; i++) {
    ensureMartSheet(ss, tabNames[i]);
  }

  // Seed ONLY bilingual store configuration keys (no dummy items)
  var settingsSheet = ss.getSheetByName("Mart_Settings");
  var existingSettings = readSettingsMap(settingsSheet);
  var now = new Date().toISOString();
  var keys = Object.keys(MART_DEFAULT_SETTINGS);
  for (var j = 0; j < keys.length; j++) {
    var k = keys[j];
    if (existingSettings[k] === undefined) {
      try {
        settingsSheet.appendRow([k, MART_DEFAULT_SETTINGS[k], now]);
        SpreadsheetApp.flush();
      } catch (setErr) {
        try {
          settingsSheet.appendRow([k, MART_DEFAULT_SETTINGS[k], new Date()]);
          SpreadsheetApp.flush();
        } catch (setErr2) {}
      }
    }
  }

  // Auto-create Drive folders: Xeetrix_Mart_Storage -> Products, Categories & PaymentQR
  var folders = ensureDriveFoldersReady();

  // Sync existing rows + apply Table-safe 3-level category & attribute dropdowns in Mart_Products
  var syncRes = syncMartProductsBulkSheet(true);
  var blockedCols = syncRes && Array.isArray(syncRes.blockedDropdownCols) ? syncRes.blockedDropdownCols : [];

  // Protect Row 1 header across all sheets/tables
  var lockedHeadersCount = protectAllMartHeaderRows(ss, "strict");

  // Warm public cache immediately
  invalidateMartCache();
  buildAndCachePublicBundle(ss);

  var msg =
    "Xeetrix Mart Enterprise Backend Ready! Sheet: " +
    ss.getName() +
    " | Tabs: " +
    tabNames.length +
    " | Header Rows Locked: " +
    lockedHeadersCount +
    " | Drive Root: " +
    folders.rootFolder.getName();

  if (blockedCols.length > 0) {
    msg +=
      " | Table Tip: Set Column Type = None on [" +
      blockedCols.join(", ") +
      "] in Mart_Products to enable Arrow dropdowns.";
  }

  try {
    Logger.log(msg);
  } catch (e) {}
  return msg;
}

var MART_SHEET_GENDER_OPTIONS = ["Unisex", "Boys", "Girls", "Men", "Women"];

function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("🛒 Xeetrix Mart")
      .addItem("🔄 Sync Bulk Rows (Dropdowns, Auto-SKU & Attributes)", "syncMartProductsBulkSheet")
      .addItem("⚙️ Setup / Refresh Columns & Dropdowns", "setupMartBackendMenuAction")
      .addItem("🗂️ Organize Product Drive Folders (Category/SKU)", "organizeProductDriveAssetsMenuAction")
      .addSeparator()
      .addItem("🔒 Lock Header Rows (Strict — Staff Blocked)", "lockAllHeaderRowsStrictMenuAction")
      .addItem("⚠️ Protect Header Rows (Warning for Owner & All)", "protectAllHeaderRowsWarningMenuAction")
      .addSeparator()
      .addItem("⚡ Refresh Website Cache Now", "refreshMartPublicCacheMenuAction")
      .addToUi();
  } catch (e) {
    // Non-UI context guard
  }
}

function setupMartBackendMenuAction() {
  var msg = setupMartBackend();
  try {
    SpreadsheetApp.getUi().alert("Xeetrix Mart Setup Complete", msg, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    // Ignore outside UI
  }
}

function lockAllHeaderRowsStrictMenuAction() {
  var ss = getBoundSpreadsheet();
  var count = protectAllMartHeaderRows(ss, "strict");
  try {
    SpreadsheetApp.getUi().alert(
      "Header Rows Locked (Strict)",
      "Row 1 header locked on " +
        count +
        " sheet(s). Other editors cannot edit Row 1. (To also warn yourself before accidental edits, use 'Protect Header Rows (Warning for Owner & All)'.)",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {}
}

function protectAllHeaderRowsWarningMenuAction() {
  var ss = getBoundSpreadsheet();
  var count = protectAllMartHeaderRows(ss, "warning");
  try {
    SpreadsheetApp.getUi().alert(
      "Header Warning Protection Enabled",
      "Row 1 warning protection enabled on " +
        count +
        " sheet(s). Anyone (including the Owner) will see a confirmation popup before editing Row 1.",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {}
}

function refreshMartPublicCacheMenuAction() {
  var ss = getBoundSpreadsheet();
  invalidateMartCache();
  var bundle = buildAndCachePublicBundle(ss);
  try {
    ss.toast(
      "Website cache refreshed (" + (bundle.products ? bundle.products.length : 0) + " live products).",
      "Xeetrix Mart",
      4
    );
  } catch (e) {
    // Ignore outside UI
  }
}

function formatSheetCategoryOption(cat) {
  if (!cat) return "";
  var label = String(cat.nameEn || cat.nameBn || cat.slug || "").trim();
  var code = resolveCategorySkuCodeServer(cat);
  return label ? label + " [" + code + "]" : "";
}

function buildCategoryLookupIndex(allCategories) {
  var bySlug = {};
  var activeList = [];
  for (var i = 0; i < (allCategories || []).length; i++) {
    var c = allCategories[i];
    if (!c || !c.slug) continue;
    var slug = String(c.slug).trim();
    bySlug[slug] = c;
    if (c.active !== false) {
      activeList.push(c);
    }
  }
  activeList.sort(function (a, b) {
    return (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
  });

  var l1List = [];
  var childrenByParent = {};
  for (var j = 0; j < activeList.length; j++) {
    var item = activeList[j];
    var pSlug = String(item.parentSlug || "").trim();
    if (!pSlug || !bySlug[pSlug]) {
      l1List.push(item);
    } else {
      if (!childrenByParent[pSlug]) childrenByParent[pSlug] = [];
      childrenByParent[pSlug].push(item);
    }
  }
  return {
    bySlug: bySlug,
    activeList: activeList,
    l1List: l1List,
    childrenByParent: childrenByParent
  };
}

function matchSheetCategoryOption(rawValue, candidateList) {
  var raw = String(rawValue || "").trim();
  if (!raw || !candidateList || candidateList.length === 0) return null;
  var lowerRaw = raw.toLowerCase();

  var parsedLabel = "";
  var parsedCode = "";
  var bracketMatch = raw.match(/^(.+?)\s*\[([A-Za-z0-9]{2,4})\]$/);
  if (bracketMatch) {
    parsedLabel = String(bracketMatch[1] || "").trim().toLowerCase();
    parsedCode = String(bracketMatch[2] || "").trim().toUpperCase();
  }

  for (var i = 0; i < candidateList.length; i++) {
    var c = candidateList[i];
    if (!c) continue;
    if (formatSheetCategoryOption(c).toLowerCase() === lowerRaw) return c;
    if (String(c.slug || "").trim().toLowerCase() === lowerRaw) return c;
    if (String(c.nameEn || "").trim().toLowerCase() === lowerRaw) return c;
    if (String(c.nameBn || "").trim().toLowerCase() === lowerRaw) return c;
  }

  if (parsedLabel || parsedCode) {
    for (var j = 0; j < candidateList.length; j++) {
      var cand = candidateList[j];
      var candCode = resolveCategorySkuCodeServer(cand);
      var candName = String(cand.nameEn || cand.nameBn || "").trim().toLowerCase();
      if (candCode === parsedCode && (!parsedLabel || candName === parsedLabel)) {
        return cand;
      }
    }
    for (var k = 0; k < candidateList.length; k++) {
      if (resolveCategorySkuCodeServer(candidateList[k]) === parsedCode) {
        return candidateList[k];
      }
    }
  }

  for (var m = 0; m < candidateList.length; m++) {
    var token = lowerRaw.toUpperCase();
    if (token.length >= 2 && token.length <= 4 && resolveCategorySkuCodeServer(candidateList[m]) === token) {
      return candidateList[m];
    }
  }
  return null;
}

function resolveCategoriesToHelperFields(categoriesCsv, catIndex) {
  var slugs = String(categoriesCsv || "")
    .split(",")
    .map(function (s) {
      return s.trim();
    })
    .filter(function (s) {
      return Boolean(s);
    });
  if (slugs.length === 0) {
    return {
      level1Cat: "",
      level2Cat: "",
      level3Cat: "",
      relatableCats: ""
    };
  }
  var primarySlug = slugs[0];
  var primaryCat = catIndex.bySlug[primarySlug];
  var l1 = "";
  var l2 = "";
  var l3 = "";
  if (primaryCat) {
    var chain = [primaryCat];
    var visited = {};
    visited[primaryCat.slug] = true;
    var cursor = primaryCat;
    while (cursor.parentSlug && chain.length < 3) {
      var pSlug = String(cursor.parentSlug).trim();
      if (!pSlug || visited[pSlug] || !catIndex.bySlug[pSlug]) break;
      visited[pSlug] = true;
      chain.unshift(catIndex.bySlug[pSlug]);
      cursor = catIndex.bySlug[pSlug];
    }
    if (chain[0]) l1 = formatSheetCategoryOption(chain[0]);
    if (chain[1]) l2 = formatSheetCategoryOption(chain[1]);
    if (chain[2]) l3 = formatSheetCategoryOption(chain[2]);
  }
  var relatableLabels = [];
  for (var i = 1; i < slugs.length; i++) {
    var rel = catIndex.bySlug[slugs[i]];
    relatableLabels.push(rel ? formatSheetCategoryOption(rel) : slugs[i]);
  }
  return {
    level1Cat: l1,
    level2Cat: l2,
    level3Cat: l3,
    relatableCats: relatableLabels.join(", ")
  };
}

function resolveHelperFieldsToCategoriesCsv(rowObj, catIndex) {
  var allCats = catIndex.activeList;
  var l1 = matchSheetCategoryOption(rowObj.level1Cat, catIndex.l1List.length ? catIndex.l1List : allCats);
  var l2Candidates = l1 && catIndex.childrenByParent[l1.slug] ? catIndex.childrenByParent[l1.slug] : allCats;
  var l2 = matchSheetCategoryOption(rowObj.level2Cat, l2Candidates);
  var l3Candidates = l2 && catIndex.childrenByParent[l2.slug] ? catIndex.childrenByParent[l2.slug] : allCats;
  var l3 = matchSheetCategoryOption(rowObj.level3Cat, l3Candidates);

  var primaryCat = l3 || l2 || l1;
  if (!primaryCat) {
    return {
      primaryCat: null,
      l1Cat: l1,
      l2Cat: l2,
      l3Cat: l3,
      categoriesCsv: String(rowObj.categories || "").trim()
    };
  }

  // Reconstruct missing parent chain automatically if user pasted only L2 or L3
  if (!l1 || !l2) {
    var chain = [primaryCat];
    var visited = {};
    visited[primaryCat.slug] = true;
    var cursor = primaryCat;
    while (cursor.parentSlug && chain.length < 3) {
      var ps = String(cursor.parentSlug).trim();
      if (!ps || visited[ps] || !catIndex.bySlug[ps]) break;
      visited[ps] = true;
      chain.unshift(catIndex.bySlug[ps]);
      cursor = catIndex.bySlug[ps];
    }
    l1 = chain[0] || null;
    l2 = chain[1] || null;
    l3 = chain[2] || null;
  }

  var slugList = [primaryCat.slug];
  var seen = {};
  seen[primaryCat.slug] = true;

  var rawRel = String(rowObj.relatableCats || "");
  if (rawRel.trim()) {
    var parts = rawRel.split(",");
    for (var i = 0; i < parts.length; i++) {
      var token = String(parts[i] || "").trim();
      if (!token) continue;
      var matchedRel = matchSheetCategoryOption(token, allCats);
      var relSlug = matchedRel ? matchedRel.slug : slugifyText(token);
      if (relSlug && !seen[relSlug]) {
        seen[relSlug] = true;
        slugList.push(relSlug);
      }
    }
  }

  return {
    primaryCat: primaryCat,
    l1Cat: l1,
    l2Cat: l2,
    l3Cat: l3,
    categoriesCsv: slugList.join(",")
  };
}

function parseAttributesJsonSafe(rawJson) {
  var out = { gender: "", ageGroup: "", material: "", brand: "", custom: {} };
  if (!rawJson) return out;
  try {
    var parsed = JSON.parse(String(rawJson));
    if (parsed && typeof parsed === "object") {
      out.gender = String(parsed.gender || "").trim();
      out.ageGroup = String(parsed.ageGroup || "").trim();
      out.material = String(parsed.material || "").trim();
      out.brand = String(parsed.brand || "").trim();
      if (parsed.custom && typeof parsed.custom === "object") {
        out.custom = parsed.custom;
      }
    }
  } catch (e) {
    // Ignore invalid JSON
  }
  return out;
}

function buildAttributesJsonFromFields(baseJson, genderVal, ageGroupVal, materialVal, brandVal) {
  var cur = parseAttributesJsonSafe(baseJson);
  var g = String(genderVal !== undefined ? genderVal : cur.gender || "").trim();
  var a = String(ageGroupVal !== undefined ? ageGroupVal : cur.ageGroup || "").trim();
  var m = String(materialVal !== undefined ? materialVal : cur.material || "").trim();
  var b = String(brandVal !== undefined ? brandVal : cur.brand || "").trim();
  var customKeys = cur.custom ? Object.keys(cur.custom) : [];
  if (!g && !a && !m && !b && customKeys.length === 0) {
    return "";
  }
  var nextObj = {};
  if (g) nextObj.gender = g;
  if (a) nextObj.ageGroup = a;
  if (m) nextObj.material = m;
  if (b) nextObj.brand = b;
  if (customKeys.length > 0) nextObj.custom = cur.custom;
  return JSON.stringify(nextObj);
}

function buildAttributeDropdownMap(allAttrs) {
  var map = {
    gender: MART_SHEET_GENDER_OPTIONS.slice(),
    ageGroup: [],
    material: [],
    brand: []
  };
  for (var i = 0; i < (allAttrs || []).length; i++) {
    var attr = allAttrs[i];
    if (!attr || attr.active === false) continue;
    var s = String(attr.slug || "").toLowerCase().trim();
    var opts = String(attr.optionsList || "")
      .split(",")
      .map(function (v) {
        return v.trim();
      })
      .filter(function (v) {
        return Boolean(v);
      });
    if (opts.length === 0) continue;
    if (s === "gender") {
      for (var g = 0; g < opts.length; g++) {
        if (map.gender.indexOf(opts[g]) === -1) map.gender.push(opts[g]);
      }
    } else if (s === "age-group" || s === "agegroup") {
      map.ageGroup = opts;
    } else if (s === "material") {
      map.material = opts;
    } else if (s === "brand") {
      map.brand = opts;
    }
  }
  return map;
}

function buildListValidation(values, allowInvalid) {
  var clean = [];
  var seen = {};
  for (var i = 0; i < (values || []).length; i++) {
    var v = String(values[i] || "").trim();
    if (v && !seen[v]) {
      seen[v] = true;
      clean.push(v);
    }
  }
  if (clean.length === 0) return null;
  if (clean.length > 480) clean = clean.slice(0, 480);
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(clean, true)
    .setAllowInvalid(allowInvalid !== false)
    .build();
}

function safeSetDataValidation(range, rule, colName, blockedColsMap, skipFlush) {
  if (colName && blockedColsMap && blockedColsMap[colName]) {
    return false;
  }
  try {
    if (rule) {
      range.setDataValidation(rule);
    } else {
      range.clearDataValidations();
    }
    if (!skipFlush) {
      SpreadsheetApp.flush();
    }
    return true;
  } catch (err) {
    if (colName && blockedColsMap) {
      blockedColsMap[colName] = true;
    }
    return false;
  }
}

function safeSetCellValue(sheet, rowIndex, colIndex, val, skipFlush) {
  if (!sheet || !rowIndex || !colIndex || rowIndex < 1 || colIndex < 1) return false;
  try {
    sheet.getRange(rowIndex, colIndex).setValue(val);
    if (!skipFlush) {
      SpreadsheetApp.flush();
    }
    return true;
  } catch (err) {
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      try {
        var parsedDate = new Date(val);
        if (!isNaN(parsedDate.getTime())) {
          sheet.getRange(rowIndex, colIndex).setValue(parsedDate);
          if (!skipFlush) {
            SpreadsheetApp.flush();
          }
          return true;
        }
      } catch (dateErr) {}
    }
    return false;
  }
}

function applyRowCascadeValidation(sheet, rowIndex, colMap, l1Cat, l2Cat, catIndex, blockedColsMap, skipFlush) {
  var l2Col = colMap["level2Cat"];
  var l3Col = colMap["level3Cat"];
  if (l2Col && !(blockedColsMap && blockedColsMap["level2Cat"])) {
    var l2Cell = sheet.getRange(rowIndex, l2Col);
    if (l1Cat && catIndex.childrenByParent[l1Cat.slug] && catIndex.childrenByParent[l1Cat.slug].length > 0) {
      var l2Opts = catIndex.childrenByParent[l1Cat.slug].map(formatSheetCategoryOption);
      safeSetDataValidation(l2Cell, buildListValidation(l2Opts, false), "level2Cat", blockedColsMap, skipFlush);
    } else {
      safeSetDataValidation(l2Cell, null, "level2Cat", blockedColsMap, skipFlush);
    }
  }
  if (l3Col && !(blockedColsMap && blockedColsMap["level3Cat"])) {
    var l3Cell = sheet.getRange(rowIndex, l3Col);
    if (l2Cat && catIndex.childrenByParent[l2Cat.slug] && catIndex.childrenByParent[l2Cat.slug].length > 0) {
      var l3Opts = catIndex.childrenByParent[l2Cat.slug].map(formatSheetCategoryOption);
      safeSetDataValidation(l3Cell, buildListValidation(l3Opts, false), "level3Cat", blockedColsMap, skipFlush);
    } else {
      safeSetDataValidation(l3Cell, null, "level3Cat", blockedColsMap, skipFlush);
    }
  }
}

function refreshMartProductsColumnValidations(ss, prodSheet, catIndex, allAttrs, blockedColsMap) {
  var blockedMap = blockedColsMap || {};
  try {
    var sheet = prodSheet || ensureMartSheet(ss, "Mart_Products");
    var lastCol = Math.max(1, sheet.getLastColumn());
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var colMap = {};
    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c] || "").trim();
      if (h) colMap[h] = c + 1;
    }

    var targetRowCount = Math.max(50, sheet.getLastRow() + 50 - 1);
    var maxAvail = Math.max(1, sheet.getMaxRows() - 1);
    if (targetRowCount > maxAvail) targetRowCount = maxAvail;
    if (targetRowCount < 1) return Object.keys(blockedMap);

    var l1Options = catIndex.l1List.map(formatSheetCategoryOption);
    var allCatOptions = catIndex.activeList.map(formatSheetCategoryOption);
    var attrMap = buildAttributeDropdownMap(allAttrs);

    if (colMap["level1Cat"]) {
      var l1Rule = buildListValidation(l1Options, false);
      safeSetDataValidation(
        sheet.getRange(2, colMap["level1Cat"], targetRowCount, 1),
        l1Rule,
        "level1Cat",
        blockedMap
      );
    }
    if (colMap["relatableCats"]) {
      var relRule = buildListValidation(allCatOptions, true);
      safeSetDataValidation(
        sheet.getRange(2, colMap["relatableCats"], targetRowCount, 1),
        relRule,
        "relatableCats",
        blockedMap
      );
    }
    if (colMap["gender"]) {
      var gRule = buildListValidation(attrMap.gender, true);
      if (gRule) {
        safeSetDataValidation(
          sheet.getRange(2, colMap["gender"], targetRowCount, 1),
          gRule,
          "gender",
          blockedMap
        );
      }
    }
    if (colMap["ageGroup"]) {
      var ageRule = buildListValidation(attrMap.ageGroup, true);
      safeSetDataValidation(
        sheet.getRange(2, colMap["ageGroup"], targetRowCount, 1),
        ageRule,
        "ageGroup",
        blockedMap
      );
    }
    if (colMap["material"]) {
      var matRule = buildListValidation(attrMap.material, true);
      safeSetDataValidation(
        sheet.getRange(2, colMap["material"], targetRowCount, 1),
        matRule,
        "material",
        blockedMap
      );
    }
    if (colMap["brand"]) {
      var brandRule = buildListValidation(attrMap.brand, true);
      safeSetDataValidation(
        sheet.getRange(2, colMap["brand"], targetRowCount, 1),
        brandRule,
        "brand",
        blockedMap
      );
    }
    if (colMap["fulfillmentType"]) {
      var ftRule = buildListValidation(["own_stock", "dropship"], true);
      if (ftRule) {
        safeSetDataValidation(
          sheet.getRange(2, colMap["fulfillmentType"], targetRowCount, 1),
          ftRule,
          "fulfillmentType",
          blockedMap
        );
      }
    }
    if (colMap["collectionMode"]) {
      var cmRule = buildListValidation(["store_collects", "supplier_collects"], true);
      if (cmRule) {
        safeSetDataValidation(
          sheet.getRange(2, colMap["collectionMode"], targetRowCount, 1),
          cmRule,
          "collectionMode",
          blockedMap
        );
      }
    }
  } catch (e) {
    // Non-fatal validation refresh guard
  }
  return Object.keys(blockedMap);
}

function refreshMartProductsColumnValidationsSafe(ss) {
  try {
    var catSheet = ensureMartSheet(ss, "Mart_Categories");
    var setSheet = ensureMartSheet(ss, "Mart_Settings");
    var mergedSettings = mergeSettings(readSettingsMap(setSheet));
    var allCats = readMartRows(catSheet, "Mart_Categories");
    var allAttrs = readMartAttributesWithBackup(ss, mergedSettings);
    var catIndex = buildCategoryLookupIndex(allCats);
    return refreshMartProductsColumnValidations(ss, ensureMartSheet(ss, "Mart_Products"), catIndex, allAttrs);
  } catch (e) {
    return [];
  }
}

/**
 * Populates sheet helper columns (level1Cat..3, relatableCats, gender, ageGroup, material, brand)
 * when a product is created or edited from the Dashboard so 2-way sync stays accurate.
 */
function populateProductHelperColumnsForRecord(ss, targetObj, fallbackCategoriesCsv, fallbackAttrsJson) {
  try {
    var catSheet = ensureMartSheet(ss, "Mart_Categories");
    var allCats = readMartRows(catSheet, "Mart_Categories");
    var catIndex = buildCategoryLookupIndex(allCats);
    var effCatsCsv =
      targetObj.categories !== undefined ? String(targetObj.categories || "") : String(fallbackCategoriesCsv || "");
    if (targetObj.categories !== undefined || fallbackCategoriesCsv !== undefined) {
      var helperCats = resolveCategoriesToHelperFields(effCatsCsv, catIndex);
      if (targetObj.level1Cat === undefined) targetObj.level1Cat = helperCats.level1Cat;
      if (targetObj.level2Cat === undefined) targetObj.level2Cat = helperCats.level2Cat;
      if (targetObj.level3Cat === undefined) targetObj.level3Cat = helperCats.level3Cat;
      if (targetObj.relatableCats === undefined) targetObj.relatableCats = helperCats.relatableCats;
    }
    var effAttrsJson =
      targetObj.attributesJson !== undefined
        ? String(targetObj.attributesJson || "")
        : String(fallbackAttrsJson || "");
    if (targetObj.attributesJson !== undefined || fallbackAttrsJson !== undefined) {
      var parsedAttrs = parseAttributesJsonSafe(effAttrsJson);
      if (targetObj.gender === undefined) targetObj.gender = parsedAttrs.gender;
      if (targetObj.ageGroup === undefined) targetObj.ageGroup = parsedAttrs.ageGroup;
      if (targetObj.material === undefined) targetObj.material = parsedAttrs.material;
      if (targetObj.brand === undefined) targetObj.brand = parsedAttrs.brand;
    }
  } catch (e) {
    // Non-fatal helper column sync guard
  }
  return targetObj;
}

/**
 * Simple onEdit trigger for real-time 3-level cascading dropdowns, auto-SKU,
 * attributesJson sync, and draft-until-photo (active = FALSE) directly inside Mart_Products.
 */
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    var sheet = e.range.getSheet();
    if (!sheet || sheet.getName() !== "Mart_Products") return;
    var startRow = e.range.getRow();
    if (startRow < 2) return;
    handleMartProductsSheetEdit(e);
  } catch (err) {
    // Keep sheet editing responsive
  }
}

function handleMartProductsSheetEdit(e) {
  var ss = e.source || getBoundSpreadsheet();
  var sheet = e.range.getSheet();
  var lastCol = Math.max(1, sheet.getLastColumn());
  var rawHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var colMap = {};
  for (var c = 0; c < rawHeaders.length; c++) {
    var h = String(rawHeaders[c] || "").trim();
    if (h) colMap[h] = c + 1;
  }

  var startCol = e.range.getColumn();
  var numCols = e.range.getNumColumns();
  var endCol = startCol + numCols - 1;
  var startRow = e.range.getRow();
  var numRows = Math.min(25, e.range.getNumRows()); // Cap large pastes to menu sync

  var isColEdited = function (name) {
    var colIdx = colMap[name];
    return Boolean(colIdx && colIdx >= startCol && colIdx <= endCol);
  };

  var l1Edited = isColEdited("level1Cat");
  var l2Edited = isColEdited("level2Cat");
  var l3Edited = isColEdited("level3Cat");
  var relEdited = isColEdited("relatableCats");
  var catsCsvEdited = isColEdited("categories");
  var attrColEdited =
    isColEdited("gender") || isColEdited("ageGroup") || isColEdited("material") || isColEdited("brand");
  var nameEdited = isColEdited("nameEn") || isColEdited("nameBn");
  var imgEdited = isColEdited("imageUrl");
  var skuEdited = isColEdited("sku");

  if (
    !l1Edited &&
    !l2Edited &&
    !l3Edited &&
    !relEdited &&
    !catsCsvEdited &&
    !attrColEdited &&
    !nameEdited &&
    !imgEdited &&
    !skuEdited
  ) {
    return;
  }

  var catSheet = ensureMartSheet(ss, "Mart_Categories");
  var allCats = readMartRows(catSheet, "Mart_Categories");
  var catIndex = buildCategoryLookupIndex(allCats);

  // Read existing SKUs across sheet to ensure sequential uniqueness
  var allLastRow = sheet.getLastRow();
  var existingSkuTracker = [];
  if (allLastRow > 1 && colMap["sku"]) {
    var allSkus = sheet.getRange(2, colMap["sku"], allLastRow - 1, 1).getValues();
    var allIds = colMap["id"] ? sheet.getRange(2, colMap["id"], allLastRow - 1, 1).getValues() : null;
    for (var s = 0; s < allSkus.length; s++) {
      existingSkuTracker.push({
        rowNumber: s + 2,
        id: allIds ? String(allIds[s][0] || "") : "ROW-" + (s + 2),
        sku: String(allSkus[s][0] || "").trim().toUpperCase()
      });
    }
  }

  var nowIso = new Date().toISOString();
  var autoSkuPattern = /^XM-[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}-\d{4,}$/;

  for (var offset = 0; offset < numRows; offset++) {
    var r = startRow + offset;
    var rowVals = sheet.getRange(r, 1, 1, lastCol).getValues()[0];
    var rowObj = {};
    for (var hc = 0; hc < rawHeaders.length; hc++) {
      var hName = String(rawHeaders[hc] || "").trim();
      if (hName) rowObj[hName] = rowVals[hc];
    }

    // Check if row has meaningful content
    var hasContent =
      String(rowObj.nameEn || "").trim() ||
      String(rowObj.nameBn || "").trim() ||
      String(rowObj.level1Cat || "").trim() ||
      String(rowObj.level2Cat || "").trim() ||
      String(rowObj.level3Cat || "").trim() ||
      String(rowObj.categories || "").trim() ||
      String(rowObj.sku || "").trim();
    if (!hasContent) continue;

    // Clear dependent child selections on single-column parent edit
    if (l1Edited && numCols === 1) {
      rowObj.level2Cat = "";
      rowObj.level3Cat = "";
      if (colMap["level2Cat"]) safeSetCellValue(sheet, r, colMap["level2Cat"], "");
      if (colMap["level3Cat"]) safeSetCellValue(sheet, r, colMap["level3Cat"], "");
    } else if (l2Edited && numCols === 1) {
      rowObj.level3Cat = "";
      if (colMap["level3Cat"]) safeSetCellValue(sheet, r, colMap["level3Cat"], "");
    }

    // 1. Sync Categories <-> Helper columns & Cascading Validations
    var resolved = resolveHelperFieldsToCategoriesCsv(rowObj, catIndex);
    if (catsCsvEdited && !l1Edited && !l2Edited && !l3Edited) {
      var rev = resolveCategoriesToHelperFields(rowObj.categories, catIndex);
      if (colMap["level1Cat"]) safeSetCellValue(sheet, r, colMap["level1Cat"], rev.level1Cat);
      if (colMap["level2Cat"]) safeSetCellValue(sheet, r, colMap["level2Cat"], rev.level2Cat);
      if (colMap["level3Cat"]) safeSetCellValue(sheet, r, colMap["level3Cat"], rev.level3Cat);
      if (colMap["relatableCats"]) safeSetCellValue(sheet, r, colMap["relatableCats"], rev.relatableCats);
      rowObj.level1Cat = rev.level1Cat;
      rowObj.level2Cat = rev.level2Cat;
      rowObj.level3Cat = rev.level3Cat;
      resolved = resolveHelperFieldsToCategoriesCsv(rowObj, catIndex);
    } else {
      if (resolved.l1Cat && colMap["level1Cat"]) {
        var fmtL1 = formatSheetCategoryOption(resolved.l1Cat);
        if (String(rowObj.level1Cat || "").trim() !== fmtL1) {
          safeSetCellValue(sheet, r, colMap["level1Cat"], fmtL1);
        }
      }
      if (resolved.l2Cat && colMap["level2Cat"]) {
        var fmtL2 = formatSheetCategoryOption(resolved.l2Cat);
        if (String(rowObj.level2Cat || "").trim() !== fmtL2) {
          safeSetCellValue(sheet, r, colMap["level2Cat"], fmtL2);
        }
      }
      if (resolved.l3Cat && colMap["level3Cat"]) {
        var fmtL3 = formatSheetCategoryOption(resolved.l3Cat);
        if (String(rowObj.level3Cat || "").trim() !== fmtL3) {
          safeSetCellValue(sheet, r, colMap["level3Cat"], fmtL3);
        }
      }
      if (colMap["categories"] && resolved.categoriesCsv !== String(rowObj.categories || "").trim()) {
        safeSetCellValue(sheet, r, colMap["categories"], resolved.categoriesCsv);
      }
      rowObj.categories = resolved.categoriesCsv;
    }

    applyRowCascadeValidation(sheet, r, colMap, resolved.l1Cat, resolved.l2Cat, catIndex);

    // 2. Auto ID & Timestamp & Sourcing Defaults
    var rowId = String(rowObj.id || "").trim();
    if (!rowId && colMap["id"]) {
      rowId = generateMartId("Mart_Products") + (numRows > 1 ? "-" + offset : "");
      safeSetCellValue(sheet, r, colMap["id"], rowId);
    }
    if (!String(rowObj.createdAt || "").trim() && colMap["createdAt"]) {
      safeSetCellValue(sheet, r, colMap["createdAt"], nowIso);
    }
    if (!String(rowObj.fulfillmentType || "").trim() && colMap["fulfillmentType"]) {
      safeSetCellValue(sheet, r, colMap["fulfillmentType"], "own_stock");
    }
    if (!String(rowObj.collectionMode || "").trim() && colMap["collectionMode"]) {
      safeSetCellValue(sheet, r, colMap["collectionMode"], "store_collects");
    }
    if (String(rowObj.supplierAvailable) === "" && colMap["supplierAvailable"]) {
      safeSetCellValue(sheet, r, colMap["supplierAvailable"], true);
    }
    if ((rowObj.lowStockThreshold === "" || rowObj.lowStockThreshold === null) && colMap["lowStockThreshold"]) {
      safeSetCellValue(sheet, r, colMap["lowStockThreshold"], 5);
    }
    if ((rowObj.featured === "" || rowObj.featured === null) && colMap["featured"]) {
      safeSetCellValue(sheet, r, colMap["featured"], false);
    }

    // 3. Draft-Until-Photo Protection (active = FALSE when imageUrl is empty and active was blank)
    if (colMap["active"]) {
      var hasImg = Boolean(String(rowObj.imageUrl || "").trim());
      if (rowObj.active === "" || rowObj.active === null || rowObj.active === undefined) {
        safeSetCellValue(sheet, r, colMap["active"], hasImg);
      }
    }

    // 4. Auto SKU generation (when empty OR category changed and SKU follows XM-... auto format)
    if (colMap["sku"]) {
      var currentSku = String(rowObj.sku || "").trim().toUpperCase();
      var shouldAutoSku =
        !currentSku ||
        ((l1Edited || l2Edited || l3Edited || catsCsvEdited) && !skuEdited && autoSkuPattern.test(currentSku));
      if (shouldAutoSku) {
        var trackerFiltered = existingSkuTracker.filter(function (item) {
          return item.rowNumber !== r;
        });
        var nextSku = computeNextSequentialSkuServer(
          rowObj.categories || "",
          trackerFiltered,
          allCats,
          ""
        );
        safeSetCellValue(sheet, r, colMap["sku"], nextSku);
        var updatedFound = false;
        for (var tf = 0; tf < existingSkuTracker.length; tf++) {
          if (existingSkuTracker[tf].rowNumber === r) {
            existingSkuTracker[tf].sku = nextSku;
            updatedFound = true;
            break;
          }
        }
        if (!updatedFound) {
          existingSkuTracker.push({ rowNumber: r, id: rowId || "ROW-" + r, sku: nextSku });
        }
      }
    }

    // 5. Sync Attribute Helper Columns -> attributesJson
    if (attrColEdited) {
      var nextAttrJson = buildAttributesJsonFromFields(
        rowObj.attributesJson,
        rowObj.gender,
        rowObj.ageGroup,
        rowObj.material,
        rowObj.brand
      );
      if (colMap["attributesJson"]) {
        safeSetCellValue(sheet, r, colMap["attributesJson"], nextAttrJson);
      }
    }
  }

  invalidateMartCache();
}

/**
 * Menu / Setup Action: Repairs & syncs ALL rows in Mart_Products safely (Table & Typed-Column compatible)
 * (3-level cascading dropdowns, Auto-SKU, IDs, categories CSV, attributesJson, active=FALSE when no image).
 */
function syncMartProductsBulkSheet(silent) {
  var ss = getBoundSpreadsheet();
  var prodSheet = ensureMartSheet(ss, "Mart_Products");
  var catSheet = ensureMartSheet(ss, "Mart_Categories");
  var setSheet = ensureMartSheet(ss, "Mart_Settings");
  var mergedSettings = mergeSettings(readSettingsMap(setSheet));
  var allCats = readMartRows(catSheet, "Mart_Categories");
  var allAttrs = readMartAttributesWithBackup(ss, mergedSettings);
  var catIndex = buildCategoryLookupIndex(allCats);

  var blockedColsMap = {};

  // Refresh column-level dropdowns safely (per column, never throws on typed columns)
  refreshMartProductsColumnValidations(ss, prodSheet, catIndex, allAttrs, blockedColsMap);

  var lastRow = prodSheet.getLastRow();
  if (lastRow <= 1) {
    invalidateMartCache();
    var emptyBlocked = Object.keys(blockedColsMap);
    if (!silent) {
      try {
        if (emptyBlocked.length > 0) {
          SpreadsheetApp.getUi().alert(
            "Table Column Type Notice",
            "Dropdown columns [" +
              emptyBlocked.join(", ") +
              "] are locked by Google Sheets Table column types.\n\nFix: Click the ▼ arrow next to those column headers in Mart_Products -> Edit column type -> None, then click 'Sync Bulk Rows' again for Arrow dropdowns.",
            SpreadsheetApp.getUi().ButtonSet.OK
          );
        } else {
          ss.toast("Arrow Dropdowns ready in Mart_Products!", "Xeetrix Mart", 4);
        }
      } catch (e) {}
    }
    return { syncedCount: 0, blockedDropdownCols: emptyBlocked };
  }

  var lastCol = Math.max(1, prodSheet.getLastColumn());
  var data = prodSheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = data[0];
  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || "").trim();
    if (h) colMap[h] = c + 1;
  }

  // First collect already assigned SKUs to prevent duplicates across pasted batch
  var skuTracker = [];
  for (var i = 1; i < data.length; i++) {
    var existingSku = colMap["sku"] ? String(data[i][colMap["sku"] - 1] || "").trim().toUpperCase() : "";
    if (existingSku) {
      skuTracker.push({ rowNumber: i + 1, id: "ROW-" + (i + 1), sku: existingSku });
    }
  }

  var nowIso = new Date().toISOString();
  var syncedCount = 0;
  var dirtyUpdates = [];

  var queueCellChange = function (rIndex, colName, nextVal) {
    var cNum = colMap[colName];
    if (!cNum) return;
    var prevVal = data[rIndex][cNum - 1];
    if (prevVal === nextVal) return;
    if (typeof prevVal === "string" && typeof nextVal === "string" && prevVal === nextVal) return;
    data[rIndex][cNum - 1] = nextVal;
    dirtyUpdates.push({ row: rIndex + 1, col: cNum, val: nextVal });
  };

  for (var rIdx = 1; rIdx < data.length; rIdx++) {
    var rowNum = rIdx + 1;
    var rowArr = data[rIdx];
    var rowObj = {};
    var hasAnyVal = false;
    for (var hc = 0; hc < headers.length; hc++) {
      var hKey = String(headers[hc] || "").trim();
      if (hKey) {
        rowObj[hKey] = rowArr[hc];
        if (rowArr[hc] !== "" && rowArr[hc] !== null && rowArr[hc] !== undefined) {
          hasAnyVal = true;
        }
      }
    }
    if (!hasAnyVal) continue;

    // 1. Two-way Category sync
    var hasHelperCats = Boolean(
      String(rowObj.level1Cat || "").trim() ||
        String(rowObj.level2Cat || "").trim() ||
        String(rowObj.level3Cat || "").trim()
    );
    var l1CatObj = null;
    var l2CatObj = null;
    if (hasHelperCats) {
      var resFwd = resolveHelperFieldsToCategoriesCsv(rowObj, catIndex);
      l1CatObj = resFwd.l1Cat;
      l2CatObj = resFwd.l2Cat;
      if (resFwd.l1Cat) queueCellChange(rIdx, "level1Cat", formatSheetCategoryOption(resFwd.l1Cat));
      if (resFwd.l2Cat) queueCellChange(rIdx, "level2Cat", formatSheetCategoryOption(resFwd.l2Cat));
      if (resFwd.l3Cat) queueCellChange(rIdx, "level3Cat", formatSheetCategoryOption(resFwd.l3Cat));
      if (resFwd.categoriesCsv) {
        queueCellChange(rIdx, "categories", resFwd.categoriesCsv);
        rowObj.categories = resFwd.categoriesCsv;
      }
    } else if (String(rowObj.categories || "").trim()) {
      var resRev = resolveCategoriesToHelperFields(rowObj.categories, catIndex);
      queueCellChange(rIdx, "level1Cat", resRev.level1Cat);
      queueCellChange(rIdx, "level2Cat", resRev.level2Cat);
      queueCellChange(rIdx, "level3Cat", resRev.level3Cat);
      queueCellChange(rIdx, "relatableCats", resRev.relatableCats);
      var parsedChain = resolveHelperFieldsToCategoriesCsv(
        {
          level1Cat: resRev.level1Cat,
          level2Cat: resRev.level2Cat,
          level3Cat: resRev.level3Cat,
          categories: rowObj.categories
        },
        catIndex
      );
      l1CatObj = parsedChain.l1Cat;
      l2CatObj = parsedChain.l2Cat;
    }

    // Apply row-level cascading dropdown for L2/L3 safely (probe early rows with flush so typed columns never leak errors)
    var skipCascadeFlush = rowNum > 8;
    applyRowCascadeValidation(prodSheet, rowNum, colMap, l1CatObj, l2CatObj, catIndex, blockedColsMap, skipCascadeFlush);

    // 2. Two-way Attribute sync
    var hasHelperAttrs = Boolean(
      String(rowObj.gender || "").trim() ||
        String(rowObj.ageGroup || "").trim() ||
        String(rowObj.material || "").trim() ||
        String(rowObj.brand || "").trim()
    );
    if (hasHelperAttrs && colMap["attributesJson"]) {
      var nextAttrVal = buildAttributesJsonFromFields(
        rowObj.attributesJson,
        rowObj.gender,
        rowObj.ageGroup,
        rowObj.material,
        rowObj.brand
      );
      queueCellChange(rIdx, "attributesJson", nextAttrVal);
    } else if (String(rowObj.attributesJson || "").trim()) {
      var pAttrs = parseAttributesJsonSafe(rowObj.attributesJson);
      if (pAttrs.gender) queueCellChange(rIdx, "gender", pAttrs.gender);
      if (pAttrs.ageGroup) queueCellChange(rIdx, "ageGroup", pAttrs.ageGroup);
      if (pAttrs.material) queueCellChange(rIdx, "material", pAttrs.material);
      if (pAttrs.brand) queueCellChange(rIdx, "brand", pAttrs.brand);
    }

    // 3. Auto ID, SKU, Defaults & Draft-Until-Photo
    if (!String(rowObj.id || "").trim()) {
      queueCellChange(rIdx, "id", generateMartId("Mart_Products") + "-" + rIdx);
    }
    if (!String(rowObj.sku || "").trim()) {
      var genSku = computeNextSequentialSkuServer(rowObj.categories || "", skuTracker, allCats, "");
      queueCellChange(rIdx, "sku", genSku);
      skuTracker.push({ rowNumber: rowNum, id: "ROW-" + rowNum, sku: genSku });
    }
    if (!String(rowObj.createdAt || "").trim()) {
      queueCellChange(rIdx, "createdAt", nowIso);
    }
    if (!String(rowObj.fulfillmentType || "").trim()) {
      queueCellChange(rIdx, "fulfillmentType", "own_stock");
    }
    if (!String(rowObj.collectionMode || "").trim()) {
      queueCellChange(rIdx, "collectionMode", "store_collects");
    }
    if (String(rowObj.supplierAvailable) === "") {
      queueCellChange(rIdx, "supplierAvailable", true);
    }
    if (rowObj.lowStockThreshold === "" || rowObj.lowStockThreshold === null) {
      queueCellChange(rIdx, "lowStockThreshold", 5);
    }
    if (rowObj.featured === "" || rowObj.featured === null) {
      queueCellChange(rIdx, "featured", false);
    }
    if (rowObj.active === "" || rowObj.active === null || rowObj.active === undefined) {
      queueCellChange(rIdx, "active", Boolean(String(rowObj.imageUrl || "").trim()));
    }
    syncedCount += 1;
  }

  safeFlushSpreadsheet();

  // Write ONLY changed cells safely (flush-safe so Table typed columns never crash subsequent reads)
  if (dirtyUpdates.length <= 25) {
    for (var u = 0; u < dirtyUpdates.length; u++) {
      var upd = dirtyUpdates[u];
      safeSetCellValue(prodSheet, upd.row, upd.col, upd.val, false);
    }
  } else {
    var batchSucceeded = true;
    try {
      for (var bu = 0; bu < dirtyUpdates.length; bu++) {
        var bUpd = dirtyUpdates[bu];
        prodSheet.getRange(bUpd.row, bUpd.col).setValue(bUpd.val);
      }
      SpreadsheetApp.flush();
    } catch (batchErr) {
      batchSucceeded = false;
    }
    if (!batchSucceeded) {
      for (var fu = 0; fu < dirtyUpdates.length; fu++) {
        var fUpd = dirtyUpdates[fu];
        safeSetCellValue(prodSheet, fUpd.row, fUpd.col, fUpd.val, false);
      }
    }
  }

  invalidateMartCache();
  buildAndCachePublicBundle(ss);

  var blockedList = Object.keys(blockedColsMap);
  if (!silent) {
    try {
      if (blockedList.length > 0) {
        SpreadsheetApp.getUi().alert(
          "Synced " + syncedCount + " Rows (Table Tip)",
          "Auto-SKU, IDs & Attributes synced for " +
            syncedCount +
            " row(s).\n\nHowever, these dropdown columns are still locked as Google Sheets Table Typed Columns:\n• " +
            blockedList.join("\n• ") +
            "\n\nFix: Click the ▼ arrow next to each listed column header -> Edit column type -> None, then run Sync Bulk Rows again for Arrow dropdowns.",
          SpreadsheetApp.getUi().ButtonSet.OK
        );
      } else {
        ss.toast(
          "Synced " + syncedCount + " rows (Arrow Dropdowns, Auto-SKU, Attributes & Cache updated).",
          "Xeetrix Mart",
          5
        );
      }
    } catch (e) {
      // Ignore outside UI
    }
  }
  return { syncedCount: syncedCount, blockedDropdownCols: blockedList };
}

function invalidateMartCache() {
  try {
    removeChunkedScriptCache(CACHE_PUBLIC_KEY);
    removeChunkedScriptCache(CACHE_ADMIN_KEY);
    var cache = CacheService.getScriptCache();
    cache.removeAll([
      "xeetrix_mart_public_v6",
      "xeetrix_mart_public_v5",
      "xeetrix_mart_public_v4",
      "xeetrix_mart_public_v3",
      "xeetrix_mart_public_v2",
      "xeetrix_mart_public_v1"
    ]);
  } catch (err) {
    // Ignore cache eviction error
  }
}

function sanitizeSkuCodeServer(raw) {
  return String(raw || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 3);
}

function resolveCategorySkuCodeServer(catObj) {
  if (!catObj) return "GEN";
  var explicit = sanitizeSkuCodeServer(catObj.skuCode);
  if (explicit.length === 3) return explicit;
  var source = String(catObj.nameEn || catObj.slug || "").toUpperCase();
  var words = source
    .replace(/&/g, " ")
    .replace(/[^A-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(function (w) {
      return Boolean(w) && w !== "AND" && w !== "THE" && w !== "FOR";
    });
  var candidate = "";
  if (words.length >= 3) {
    candidate = words[0].charAt(0) + words[1].charAt(0) + words[2].charAt(0);
  } else if (words.length === 2) {
    candidate = words[0].slice(0, 2) + words[1].slice(0, 1);
  } else if (words.length === 1) {
    var w = words[0];
    var consonants = w.charAt(0) + w.slice(1).replace(/[AEIOU]/g, "");
    candidate = (consonants.length >= 3 ? consonants : w).slice(0, 3);
  }
  candidate = sanitizeSkuCodeServer(candidate);
  while (candidate.length < 3) {
    candidate += "X";
  }
  return candidate || "GEN";
}

function resolveThreeLevelSkuPrefixServer(categoriesCsv, allCategories) {
  var slugs = String(categoriesCsv || "")
    .split(",")
    .map(function (s) {
      return s.trim();
    })
    .filter(function (s) {
      return Boolean(s);
    });
  if (slugs.length === 0) {
    return {
      l1Code: "GEN",
      l2Code: "GEN",
      l3Code: "GEN",
      prefix: "XM-GEN-GEN-GEN"
    };
  }
  var bySlug = {};
  for (var i = 0; i < allCategories.length; i++) {
    var c = allCategories[i];
    if (c && c.slug) {
      bySlug[String(c.slug).trim()] = c;
    }
  }
  var primarySlug = slugs[0];
  var target = bySlug[primarySlug];
  if (!target) {
    var fb = resolveCategorySkuCodeServer({ nameEn: primarySlug, slug: primarySlug });
    return {
      l1Code: fb,
      l2Code: "GEN",
      l3Code: "GEN",
      prefix: "XM-" + fb + "-GEN-GEN"
    };
  }
  var chain = [target];
  var visited = {};
  visited[target.slug] = true;
  var cursor = target;
  while (cursor.parentSlug && chain.length < 3) {
    var pSlug = String(cursor.parentSlug).trim();
    if (!pSlug || visited[pSlug]) break;
    var parentCat = bySlug[pSlug];
    if (!parentCat) break;
    visited[pSlug] = true;
    chain.unshift(parentCat);
    cursor = parentCat;
  }
  var l1Code = chain[0] ? resolveCategorySkuCodeServer(chain[0]) : "GEN";
  var l2Code = chain[1] ? resolveCategorySkuCodeServer(chain[1]) : "GEN";
  var l3Code = chain[2] ? resolveCategorySkuCodeServer(chain[2]) : "GEN";
  return {
    l1Code: l1Code,
    l2Code: l2Code,
    l3Code: l3Code,
    prefix: "XM-" + l1Code + "-" + l2Code + "-" + l3Code
  };
}

function computeNextSequentialSkuServer(
  categoriesCsv,
  existingProducts,
  allCategories,
  excludeProductId
) {
  var resolved = resolveThreeLevelSkuPrefixServer(categoriesCsv, allCategories);
  var prefixWithDash = resolved.prefix + "-";
  var maxSerial = 0;
  for (var i = 0; i < existingProducts.length; i++) {
    var prod = existingProducts[i];
    if (!prod) continue;
    if (excludeProductId && String(prod.id) === String(excludeProductId)) continue;
    var rawSku = String(prod.sku || "").trim().toUpperCase();
    if (rawSku.indexOf(prefixWithDash) !== 0) continue;
    var remainder = rawSku.slice(prefixWithDash.length);
    var match = remainder.match(/^(\d{1,6})/);
    if (match && match[1]) {
      var parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > maxSerial) {
        maxSerial = parsed;
      }
    }
  }
  var nextSerial = maxSerial + 1;
  var serialStr = String(nextSerial);
  while (serialStr.length < 4) {
    serialStr = "0" + serialStr;
  }
  return resolved.prefix + "-" + serialStr;
}

function normalizeMartCell(header, val) {
  if (header === "active" || header === "featured" || header === "supplierAvailable") {
    if (typeof val === "boolean") return val;
    var s = String(val).toLowerCase().trim();
    if (header === "supplierAvailable" && s === "") return true;
    return s === "true" || s === "1" || s === "yes";
  }
  if (
    header === "price" ||
    header === "comparePrice" ||
    header === "costPrice" ||
    header === "wholesaleMinQty" ||
    header === "wholesalePrice" ||
    header === "lowStockThreshold" ||
    header === "stock" ||
    header === "leadTimeDays" ||
    header === "amount" ||
    header === "totalItems" ||
    header === "subtotal" ||
    header === "discountAmount" ||
    header === "deliveryCharge" ||
    header === "totalAmount" ||
    header === "discountValue" ||
    header === "maxDiscount" ||
    header === "minOrderAmount" ||
    header === "usageLimit" ||
    header === "usageCount" ||
    header === "sortOrder"
  ) {
    var num = Number(val);
    if (isNaN(num)) return 0;
    if (header !== "sortOrder") {
      return Math.max(0, num);
    }
    return num;
  }
  if (header === "code" || header === "discountCode" || header === "sku" || header === "skuCode") {
    return String(val || "").trim().toUpperCase();
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString();
  }
  return val === null || val === undefined ? "" : String(val);
}

function readMartRows(sheet, sheetName, optionalCategories) {
  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }
  var headers = MART_SCHEMA[sheetName];
  var data = sheet.getDataRange().getValues();
  if (!data || data.length <= 1) {
    return [];
  }

  var rawHeaders = data[0];
  var colMap = {};
  for (var col = 0; col < rawHeaders.length; col++) {
    var name = String(rawHeaders[col] || "").trim();
    if (name) colMap[name] = col;
  }

  var catIndex =
    sheetName === "Mart_Products" && Array.isArray(optionalCategories) && optionalCategories.length > 0
      ? buildCategoryLookupIndex(optionalCategories)
      : null;

  var rows = [];
  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var hasAny = false;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== "" && row[c] !== null && row[c] !== undefined) {
        hasAny = true;
        break;
      }
    }
    if (!hasAny) continue;

    var obj = {};
    for (var h = 0; h < headers.length; h++) {
      var header = headers[h];
      var idx = colMap[header];
      var cellVal = idx !== undefined ? row[idx] : "";
      obj[header] = normalizeMartCell(header, cellVal);
    }

    // Legacy compatibility, direct sheet helper fallback & sensible defaults
    if (sheetName === "Mart_Products") {
      if (!obj.id) {
        obj.id = "ROW-" + (r + 1);
      }
      if (!obj.nameEn && colMap["name"] !== undefined) {
        obj.nameEn = String(row[colMap["name"]] || "");
      }
      if (!obj.categories && colMap["category"] !== undefined) {
        var legacyCat = String(row[colMap["category"]] || "").trim();
        if (legacyCat) {
          obj.categories = slugifyText(legacyCat) || legacyCat;
        }
      }
      if (!obj.categories && catIndex && (obj.level1Cat || obj.level2Cat || obj.level3Cat)) {
        obj.categories = resolveHelperFieldsToCategoriesCsv(obj, catIndex).categoriesCsv;
      }
      if (!obj.attributesJson && (obj.gender || obj.ageGroup || obj.material || obj.brand)) {
        obj.attributesJson = buildAttributesJsonFromFields("", obj.gender, obj.ageGroup, obj.material, obj.brand);
      }
      if (!obj.imageUrl && (colMap["active"] === undefined || row[colMap["active"]] === "")) {
        obj.active = false;
      }
      if (!obj.variantsEn && colMap["variants"] !== undefined) {
        obj.variantsEn = String(row[colMap["variants"]] || "");
      }
      if (!obj.descriptionEn && colMap["description"] !== undefined) {
        obj.descriptionEn = String(row[colMap["description"]] || "");
      }
      if (!obj.fulfillmentType) {
        obj.fulfillmentType = "own_stock";
      }
      if (!obj.collectionMode) {
        obj.collectionMode = "store_collects";
      }
      if (colMap["supplierAvailable"] === undefined || row[colMap["supplierAvailable"]] === "") {
        obj.supplierAvailable = true;
      }
      if (!obj.lowStockThreshold || obj.lowStockThreshold <= 0) {
        obj.lowStockThreshold = 5;
      }
    }

    if (sheetName === "Mart_Categories") {
      if (!obj.nameEn && colMap["name"] !== undefined) {
        obj.nameEn = String(row[colMap["name"]] || "");
      }
      if (!obj.descriptionEn && colMap["description"] !== undefined) {
        obj.descriptionEn = String(row[colMap["description"]] || "");
      }
      if (!obj.slug) {
        obj.slug = slugifyText(obj.nameEn || obj.nameBn || obj.id);
      }
      if (!obj.skuCode) {
        obj.skuCode = resolveCategorySkuCodeServer(obj);
      }
    }

    if (sheetName === "Mart_Labels") {
      if (!obj.tone) {
        obj.tone = "emerald";
      }
      if (!obj.slug) {
        obj.slug = slugifyText(obj.nameEn || obj.nameBn || obj.id);
      }
    }

    if (sheetName === "Mart_Attributes") {
      if (!obj.slug) {
        obj.slug = slugifyText(obj.nameEn || obj.nameBn || obj.id);
      }
      if (colMap["active"] === undefined || row[colMap["active"]] === "") {
        obj.active = true;
      }
    }

    if (sheetName === "Mart_Suppliers") {
      if (!obj.companyType) obj.companyType = "dropship";
      if (!obj.payoutMode) obj.payoutMode = "we_pay_supplier";
      if (colMap["active"] === undefined || row[colMap["active"]] === "") obj.active = true;
    }

    if (sheetName === "Mart_Coupons") {
      if (!obj.discountType) obj.discountType = "percent";
      if (colMap["active"] === undefined || row[colMap["active"]] === "") obj.active = true;
    }

    if (sheetName === "Mart_CRM_Profiles") {
      if (!obj.tierOverride) obj.tierOverride = "auto";
      if (!obj.entityType) obj.entityType = "customer";
    }

    rows.push(obj);
  }
  return rows.reverse();
}

function readSettingsMap(sheet) {
  var map = {};
  if (!sheet || sheet.getLastRow() <= 1) {
    return map;
  }
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var k = String(data[i][0] || "").trim();
    if (k) {
      map[k] = String(data[i][1] !== undefined && data[i][1] !== null ? data[i][1] : "");
    }
  }
  return map;
}

function mergeSettings(actual) {
  var merged = {};
  var defKeys = Object.keys(MART_DEFAULT_SETTINGS);
  for (var i = 0; i < defKeys.length; i++) {
    var dk = defKeys[i];
    merged[dk] =
      actual[dk] !== undefined && actual[dk] !== "" ? actual[dk] : MART_DEFAULT_SETTINGS[dk];
  }
  // Legacy settings key fallback
  if (!actual.heroTitleEn && actual.heroTitle) merged.heroTitleEn = actual.heroTitle;
  if (!actual.heroSubtitleEn && actual.heroSubtitle) merged.heroSubtitleEn = actual.heroSubtitle;
  if (!actual.heroCtaTextEn && actual.heroCtaText) merged.heroCtaTextEn = actual.heroCtaText;
  if (!actual.promoTextEn && actual.promoText) merged.promoTextEn = actual.promoText;

  var actKeys = Object.keys(actual);
  for (var j = 0; j < actKeys.length; j++) {
    var ak = actKeys[j];
    if (actual[ak] !== undefined) {
      merged[ak] = actual[ak];
    }
  }
  return merged;
}

function sortTaxonomyByOrder(list) {
  return list.sort(function (a, b) {
    return (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
  });
}

function sanitizeVariationMatrixForPublic(matrixJsonStr) {
  if (!matrixJsonStr) return "";
  try {
    var parsed = JSON.parse(String(matrixJsonStr));
    if (!Array.isArray(parsed)) return "";
    var clean = [];
    for (var i = 0; i < parsed.length; i++) {
      var row = parsed[i];
      if (!row || typeof row !== "object") continue;
      clean.push({
        key: String(row.key || ""),
        colorNameEn: String(row.colorNameEn || ""),
        size: String(row.size || ""),
        sku: String(row.sku || ""),
        priceOverride: Number(row.priceOverride) || 0,
        stock: Math.max(0, Number(row.stock) || 0),
        active: row.active !== false
      });
    }
    return JSON.stringify(clean);
  } catch (e) {
    return "";
  }
}

function syncAttributesBackupToSettings(ss) {
  try {
    var attrSheet = ensureMartSheet(ss, "Mart_Attributes");
    var attrs = sortTaxonomyByOrder(readMartRows(attrSheet, "Mart_Attributes"));
    var settingsSheet = ensureMartSheet(ss, "Mart_Settings");
    var jsonVal = JSON.stringify(attrs);
    var nowIso = new Date().toISOString();
    var sLastRow = settingsSheet.getLastRow();
    var updated = false;
    if (sLastRow > 1) {
      var existingKeys = settingsSheet.getRange(2, 1, sLastRow - 1, 1).getValues();
      for (var rowIdx = 0; rowIdx < existingKeys.length; rowIdx++) {
        if (String(existingKeys[rowIdx][0]) === "attributes_catalog_json") {
          settingsSheet.getRange(rowIdx + 2, 2, 1, 2).setValues([[jsonVal, nowIso]]);
          updated = true;
          break;
        }
      }
    }
    if (!updated) {
      settingsSheet.appendRow(["attributes_catalog_json", jsonVal, nowIso]);
    }
  } catch (e) {
    // Non-fatal backup sync guard
  }
}

function readMartAttributesWithBackup(ss, settingsObj) {
  var attrSheet = ensureMartSheet(ss, "Mart_Attributes");
  var fromSheet = sortTaxonomyByOrder(readMartRows(attrSheet, "Mart_Attributes"));
  if (fromSheet.length > 0) {
    return fromSheet;
  }
  if (settingsObj && settingsObj.attributes_catalog_json) {
    try {
      var parsed = JSON.parse(String(settingsObj.attributes_catalog_json));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sortTaxonomyByOrder(parsed);
      }
    } catch (e) {
      // Ignore parse error
    }
  }
  return [];
}

function buildAndCachePublicBundle(ss) {
  var prodSheet = getMartSheetFast(ss, "Mart_Products");
  var catSheet = getMartSheetFast(ss, "Mart_Categories");
  var labelSheet = getMartSheetFast(ss, "Mart_Labels");
  var supSheet = getMartSheetFast(ss, "Mart_Suppliers");
  var setSheet = getMartSheetFast(ss, "Mart_Settings");

  var suppliers = readMartRows(supSheet, "Mart_Suppliers");
  var supplierActiveMap = {};
  for (var s = 0; s < suppliers.length; s++) {
    supplierActiveMap[suppliers[s].id] = suppliers[s].active === true;
  }

  var activeCategories = sortTaxonomyByOrder(
    readMartRows(catSheet, "Mart_Categories").filter(function (c) {
      return c.active === true;
    })
  );

  // Strip internal costPrice / costOverride / supplierId / sourceName from public storefront payload
  var activeProducts = readMartRows(prodSheet, "Mart_Products", activeCategories)
    .filter(function (p) {
      return p.active === true;
    })
    .map(function (p) {
      var isDropship = p.fulfillmentType === "dropship";
      var supplierIsActive =
        !p.supplierId || supplierActiveMap[p.supplierId] === undefined
          ? true
          : supplierActiveMap[p.supplierId];
      var effectiveSupplierAvailable = isDropship
        ? p.supplierAvailable !== false && supplierIsActive
        : true;
      return {
        id: p.id,
        sku: p.sku,
        slug: p.slug || "",
        nameEn: p.nameEn,
        nameBn: p.nameBn,
        categories: p.categories,
        labels: p.labels,
        tags: p.tags || "",
        attributesJson: p.attributesJson || "",
        price: p.price,
        comparePrice: p.comparePrice,
        wholesaleMinQty: Number(p.wholesaleMinQty) || 0,
        wholesalePrice: Number(p.wholesalePrice) || 0,
        fulfillmentType: p.fulfillmentType || "own_stock",
        supplierAvailable: effectiveSupplierAvailable,
        lowStockThreshold: p.lowStockThreshold || 5,
        stock: p.stock,
        variantsEn: p.variantsEn,
        variantsBn: p.variantsBn,
        colorsJson: p.colorsJson || "",
        sizesList: p.sizesList || "",
        variationMatrixJson: sanitizeVariationMatrixForPublic(p.variationMatrixJson),
        imageUrl: p.imageUrl,
        galleryUrls: p.galleryUrls || "",
        descriptionEn: p.descriptionEn,
        descriptionBn: p.descriptionBn,
        featured: p.featured,
        active: p.active,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt || p.createdAt || ""
      };
    });

  var activeLabels = sortTaxonomyByOrder(
    readMartRows(labelSheet, "Mart_Labels").filter(function (l) {
      return l.active === true;
    })
  );
  var settings = mergeSettings(readSettingsMap(setSheet));
  var activeAttributes = readMartAttributesWithBackup(ss, settings).filter(function (a) {
    return a.active !== false;
  });

  var payload = {
    products: activeProducts,
    categories: activeCategories,
    labels: activeLabels,
    attributes: activeAttributes,
    settings: settings
  };

  try {
    var serialized = JSON.stringify(payload);
    putChunkedScriptCache(CACHE_PUBLIC_KEY, serialized, CACHE_TTL_SECONDS);
  } catch (e) {
    // Cache limit exceeded or unavailable; skip gracefully
  }

  return payload;
}

function generateMartId(sheetName) {
  var prefixMap = {
    Mart_Products: "PRD",
    Mart_Categories: "CAT",
    Mart_Labels: "LBL",
    Mart_Attributes: "ATR",
    Mart_Suppliers: "SUP",
    Mart_Coupons: "CPN",
    Mart_Orders: "XM",
    Mart_Transactions: "TXN",
    Mart_CRM_Profiles: "CRM",
    Mart_CRM_Logs: "LOG"
  };
  var prefix = prefixMap[sheetName] || "XM";
  var stamp = new Date().getTime().toString().slice(-6);
  var rand = Math.floor(100 + Math.random() * 900);
  return prefix + "-" + stamp + "-" + rand;
}

function normalizeDigits(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function phonesMatch(a, b) {
  var da = normalizeDigits(a);
  var db = normalizeDigits(b);
  if (!da || !db) return false;
  if (da === db) return true;
  if (da.length >= 8 && db.length >= 8) {
    return da.slice(-8) === db.slice(-8);
  }
  return false;
}

function evaluateMartCoupon(ss, rawCode, rawSubtotal) {
  var code = String(rawCode || "").trim().toUpperCase();
  var subtotal = Math.max(0, Number(rawSubtotal) || 0);
  if (!code) {
    return { valid: false, reasonCode: "MISSING_COUPON_CODE", discountAmount: 0 };
  }

  var couponSheet = ensureMartSheet(ss, "Mart_Coupons");
  var coupons = readMartRows(couponSheet, "Mart_Coupons");
  var match = null;
  for (var i = 0; i < coupons.length; i++) {
    if (String(coupons[i].code || "").trim().toUpperCase() === code) {
      match = coupons[i];
      break;
    }
  }

  if (!match) {
    return { valid: false, reasonCode: "COUPON_NOT_FOUND", discountAmount: 0 };
  }
  if (match.active !== true) {
    return { valid: false, reasonCode: "COUPON_INACTIVE", discountAmount: 0 };
  }

  var todayIso = new Date().toISOString().slice(0, 10);
  if (match.expiryDate && String(match.expiryDate).trim() !== "" && todayIso > String(match.expiryDate).trim()) {
    return { valid: false, reasonCode: "COUPON_EXPIRED", discountAmount: 0 };
  }

  var usageLimit = Number(match.usageLimit) || 0;
  var usageCount = Number(match.usageCount) || 0;
  if (usageLimit > 0 && usageCount >= usageLimit) {
    return { valid: false, reasonCode: "COUPON_LIMIT_REACHED", discountAmount: 0 };
  }

  var minOrder = Number(match.minOrderAmount) || 0;
  if (minOrder > 0 && subtotal < minOrder) {
    return {
      valid: false,
      reasonCode: "COUPON_MIN_ORDER_NOT_MET",
      minOrderAmount: minOrder,
      discountAmount: 0
    };
  }

  var discountVal = Math.max(0, Number(match.discountValue) || 0);
  var rawDiscount = 0;
  if (match.discountType === "fixed") {
    rawDiscount = discountVal;
  } else {
    rawDiscount = Math.round((subtotal * discountVal) / 100);
    var maxDiscount = Number(match.maxDiscount) || 0;
    if (maxDiscount > 0) {
      rawDiscount = Math.min(rawDiscount, maxDiscount);
    }
  }

  var discountAmount = Math.min(subtotal, Math.max(0, rawDiscount));
  return {
    valid: true,
    discountAmount: discountAmount,
    coupon: {
      code: match.code,
      discountType: match.discountType,
      discountValue: match.discountValue,
      maxDiscount: match.maxDiscount,
      minOrderAmount: match.minOrderAmount,
      expiryDate: match.expiryDate
    }
  };
}

function incrementCouponUsage(ss, rawCode) {
  var code = String(rawCode || "").trim().toUpperCase();
  if (!code) return;
  try {
    var sheet = ensureMartSheet(ss, "Mart_Coupons");
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var codeCol = headers.indexOf("code") + 1;
    var countCol = headers.indexOf("usageCount") + 1;
    if (codeCol < 1 || countCol < 1) return;

    var codeVals = sheet.getRange(2, codeCol, lastRow - 1, 1).getValues();
    var countVals = sheet.getRange(2, countCol, lastRow - 1, 1).getValues();
    for (var r = 0; r < codeVals.length; r++) {
      if (String(codeVals[r][0] || "").trim().toUpperCase() === code) {
        var nextCount = Math.max(0, Number(countVals[r][0]) || 0) + 1;
        sheet.getRange(r + 2, countCol).setValue(nextCount);
        break;
      }
    }
  } catch (e) {
    // Non-fatal coupon usage counter guard
  }
}

function findVariantCellForProduct(prod, colorName, sizeName, variantSku) {
  if (!prod || !prod.variationMatrixJson) return null;
  try {
    var matrix = JSON.parse(String(prod.variationMatrixJson));
    if (!Array.isArray(matrix) || matrix.length === 0) return null;
    var cNorm = String(colorName || "").trim().toLowerCase();
    var sNorm = String(sizeName || "").trim().toLowerCase();
    var skuNorm = String(variantSku || "").trim().toLowerCase();

    for (var i = 0; i < matrix.length; i++) {
      var v = matrix[i];
      if (!v) continue;
      if (skuNorm && v.sku && String(v.sku).trim().toLowerCase() === skuNorm) {
        return v;
      }
      var vc = String(v.colorNameEn || "").trim().toLowerCase();
      var vs = String(v.size || "").trim().toLowerCase();
      if (vc === cNorm && vs === sNorm) {
        return v;
      }
    }
  } catch (e) {
    // ignore invalid matrix json
  }
  return null;
}

function buildVariantSubSkuServer(parentSku, colorNameEn, sizeName) {
  var base = String(parentSku || "").trim().toUpperCase();
  if (!base) return "";
  var cCode = String(colorNameEn || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 3);
  var sCode = String(sizeName || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
  var parts = [base];
  if (cCode) parts.push(cCode);
  if (sCode) parts.push(sCode);
  return parts.join("-");
}

function sanitizeProductFieldsAndSyncStock(obj, fallbackMatrixJson, fallbackParentSku) {
  if (!obj || typeof obj !== "object") return obj;
  var numericCols = [
    "price",
    "comparePrice",
    "costPrice",
    "wholesaleMinQty",
    "wholesalePrice",
    "stock",
    "lowStockThreshold"
  ];
  for (var n = 0; n < numericCols.length; n++) {
    var k = numericCols[n];
    if (obj[k] !== undefined && obj[k] !== "") {
      var parsedNum = Number(obj[k]);
      obj[k] = isNaN(parsedNum) ? 0 : Math.max(0, parsedNum);
    }
  }

  var effectiveParentSku = String(
    obj.sku !== undefined ? obj.sku : fallbackParentSku || ""
  )
    .trim()
    .toUpperCase();

  var effectiveMatrixStr =
    obj.variationMatrixJson !== undefined
      ? String(obj.variationMatrixJson || "")
      : String(fallbackMatrixJson || "");

  if (effectiveMatrixStr) {
    try {
      var parsedMatrix = JSON.parse(effectiveMatrixStr);
      if (Array.isArray(parsedMatrix) && parsedMatrix.length > 0) {
        var totalMatrixStock = 0;
        var cleanedMatrix = [];
        for (var i = 0; i < parsedMatrix.length; i++) {
          var cell = parsedMatrix[i];
          if (!cell || typeof cell !== "object") continue;
          var colorNameEn = String(cell.colorNameEn || "");
          var sizeVal = String(cell.size || "");
          var rawCellSku = String(cell.sku || "").trim().toUpperCase();
          if (effectiveParentSku && !rawCellSku) {
            rawCellSku = buildVariantSubSkuServer(effectiveParentSku, colorNameEn, sizeVal);
          }
          var cleanCell = {
            key: String(cell.key || (colorNameEn + "::" + sizeVal)),
            colorNameEn: colorNameEn,
            size: sizeVal,
            sku: rawCellSku,
            priceOverride: Math.max(0, Number(cell.priceOverride) || 0),
            costOverride: Math.max(0, Number(cell.costOverride) || 0),
            stock: Math.max(0, Number(cell.stock) || 0),
            active: cell.active !== false
          };
          if (cleanCell.active) {
            totalMatrixStock += cleanCell.stock;
          }
          cleanedMatrix.push(cleanCell);
        }
        if (cleanedMatrix.length > 0) {
          if (obj.variationMatrixJson !== undefined || effectiveParentSku) {
            obj.variationMatrixJson = JSON.stringify(cleanedMatrix);
          }
          if (obj.fulfillmentType !== "dropship") {
            obj.stock = totalMatrixStock;
          }
        }
      }
    } catch (e) {
      // Keep original if matrix JSON is malformed
    }
  }
  return obj;
}

function validateOrderItemsAvailability(ss, itemsJsonStr) {
  try {
    var items = JSON.parse(String(itemsJsonStr || "[]"));
    if (!Array.isArray(items) || items.length === 0) {
      return { ok: false, code: "MISSING_FIELDS", error: "Order items are required." };
    }

    var prodSheet = ensureMartSheet(ss, "Mart_Products");
    var allProducts = readMartRows(prodSheet, "Mart_Products");
    var prodMap = {};
    for (var p = 0; p < allProducts.length; p++) {
      prodMap[String(allProducts[p].id || "")] = allProducts[p];
    }

    var scalarRequested = {};
    var cellRequested = {};

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item || !item.productId) {
        return { ok: false, code: "VARIANT_UNAVAILABLE", error: "Ordered item is unavailable." };
      }
      var pid = String(item.productId);
      var prod = prodMap[pid];
      if (!prod || prod.active !== true) {
        return {
          ok: false,
          code: "OUT_OF_STOCK",
          error: (item.name || "Product") + " is no longer available."
        };
      }

      var qty = Math.max(1, Number(item.quantity) || 1);
      if (prod.fulfillmentType === "dropship") {
        if (prod.supplierAvailable === false) {
          return {
            ok: false,
            code: "OUT_OF_STOCK",
            error: (prod.nameEn || item.name || "Product") + " supply is currently paused."
          };
        }
        continue;
      }

      var matrix = [];
      if (prod.variationMatrixJson) {
        try {
          var parsedM = JSON.parse(String(prod.variationMatrixJson));
          if (Array.isArray(parsedM)) matrix = parsedM;
        } catch (e) {
          matrix = [];
        }
      }

      if (matrix.length > 0 && (item.colorName || item.sizeName || item.variantSku)) {
        var matchedCell = findVariantCellForProduct(
          prod,
          item.colorName,
          item.sizeName,
          item.variantSku
        );
        if (!matchedCell || matchedCell.active === false) {
          return {
            ok: false,
            code: "VARIANT_UNAVAILABLE",
            error: "Selected variant for " + (prod.nameEn || item.name || "product") + " is unavailable."
          };
        }
        var cellId =
          pid +
          "::" +
          String(
            matchedCell.key ||
              matchedCell.sku ||
              (String(matchedCell.colorNameEn || "") + "::" + String(matchedCell.size || ""))
          );
        cellRequested[cellId] = (cellRequested[cellId] || 0) + qty;
        if (cellRequested[cellId] > Math.max(0, Number(matchedCell.stock) || 0)) {
          return {
            ok: false,
            code: "OUT_OF_STOCK",
            error: "Insufficient stock for " + (prod.nameEn || item.name || "selected variant") + "."
          };
        }
      } else {
        scalarRequested[pid] = (scalarRequested[pid] || 0) + qty;
        if (scalarRequested[pid] > Math.max(0, Number(prod.stock) || 0)) {
          return {
            ok: false,
            code: "OUT_OF_STOCK",
            error: "Insufficient stock for " + (prod.nameEn || item.name || "product") + "."
          };
        }
      }
    }

    return { ok: true };
  } catch (err) {
    return { ok: true };
  }
}

function enrichOrderPayloadServerSide(ss, payload) {
  if (!payload || !payload.itemsJson) return payload;
  try {
    var items = JSON.parse(String(payload.itemsJson));
    if (!Array.isArray(items) || items.length === 0) return payload;

    var prodSheet = ensureMartSheet(ss, "Mart_Products");
    var supSheet = ensureMartSheet(ss, "Mart_Suppliers");
    var allProducts = readMartRows(prodSheet, "Mart_Products");
    var allSuppliers = readMartRows(supSheet, "Mart_Suppliers");

    var prodMap = {};
    for (var p = 0; p < allProducts.length; p++) {
      prodMap[allProducts[p].id] = allProducts[p];
    }
    var supMap = {};
    for (var s = 0; s < allSuppliers.length; s++) {
      supMap[allSuppliers[s].id] = allSuppliers[s];
    }

    var authoritativeSubtotal = 0;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var catProd = prodMap[String(item.productId || "")];
      var fulfillmentType =
        item.fulfillmentType || (catProd ? catProd.fulfillmentType : "own_stock") || "own_stock";
      var supplierId =
        item.supplierId !== undefined && item.supplierId !== ""
          ? item.supplierId
          : catProd
          ? catProd.supplierId
          : "";
      var supObj = supplierId ? supMap[supplierId] : null;
      var supplierName =
        item.supplierName || (supObj ? supObj.name : "") || (catProd ? catProd.sourceName : "") || "";
      var collectionMode =
        item.collectionMode ||
        (catProd ? catProd.collectionMode : "") ||
        (supObj
          ? supObj.payoutMode === "supplier_pays_us"
            ? "supplier_collects"
            : "store_collects"
          : "store_collects");

      var qty = Math.max(1, Number(item.quantity) || 1);
      var matchedCell = catProd
        ? findVariantCellForProduct(catProd, item.colorName, item.sizeName, item.variantSku)
        : null;

      var baseUnitPrice = catProd ? Number(catProd.price) || 0 : Number(item.unitPrice) || 0;
      if (matchedCell && Number(matchedCell.priceOverride) > 0) {
        baseUnitPrice = Number(matchedCell.priceOverride);
      }

      var isWholesale = false;
      if (
        catProd &&
        Number(catProd.wholesaleMinQty) > 0 &&
        Number(catProd.wholesalePrice) > 0 &&
        qty >= Number(catProd.wholesaleMinQty)
      ) {
        baseUnitPrice = Number(catProd.wholesalePrice);
        isWholesale = true;
      }

      var unitPrice = baseUnitPrice > 0 ? baseUnitPrice : Number(item.unitPrice) || 0;
      var unitCost = catProd ? Number(catProd.costPrice) || 0 : Number(item.unitCost) || 0;
      if (matchedCell && Number(matchedCell.costOverride) > 0) {
        unitCost = Number(matchedCell.costOverride);
      }

      var lineTotal = unitPrice * qty;
      var lineCost = unitCost * qty;
      authoritativeSubtotal += lineTotal;

      item.sku = matchedCell && matchedCell.sku ? String(matchedCell.sku) : item.sku || (catProd ? catProd.sku : "");
      item.variantSku = matchedCell && matchedCell.sku ? String(matchedCell.sku) : item.variantSku || "";
      item.unitPrice = unitPrice;
      item.lineTotal = lineTotal;
      item.isWholesale = isWholesale;
      item.fulfillmentType = fulfillmentType;
      item.supplierId = supplierId;
      item.supplierName = supplierName;
      item.collectionMode = collectionMode;
      item.unitCost = unitCost;
      item.lineCost = lineCost;
      item.lineProfit = lineTotal - lineCost;
      if (!item.itemStatus) {
        item.itemStatus = "Pending";
      }
    }

    payload.itemsJson = JSON.stringify(items);
    payload.subtotal = authoritativeSubtotal;

    var rawDiscountCode = String(payload.discountCode || "").trim().toUpperCase();
    var discountAmount = 0;
    if (rawDiscountCode) {
      var couponEval = evaluateMartCoupon(ss, rawDiscountCode, authoritativeSubtotal);
      if (couponEval.valid) {
        discountAmount = couponEval.discountAmount;
        payload.discountCode = rawDiscountCode;
      } else {
        payload.discountCode = "";
      }
    } else {
      payload.discountCode = "";
    }
    payload.discountAmount = discountAmount;

    var deliveryCharge = Math.max(0, Number(payload.deliveryCharge) || 0);
    payload.totalAmount = Math.max(0, authoritativeSubtotal - discountAmount + deliveryCharge);
  } catch (err) {
    // Keep original payload if enrichment fails
  }
  return payload;
}

function readSingleRowObject(sheet, rawHeaders, rowIndex) {
  var rowVals = sheet.getRange(rowIndex, 1, 1, rawHeaders.length).getValues()[0];
  var obj = {};
  for (var i = 0; i < rawHeaders.length; i++) {
    var h = String(rawHeaders[i] || "").trim();
    if (h) obj[h] = rowVals[i];
  }
  return obj;
}

function replaceSlugTokenInCsv(csvVal, oldSlug, newSlug) {
  var parts = String(csvVal || "")
    .split(",")
    .map(function (s) { return s.trim(); })
    .filter(function (s) { return Boolean(s); });
  var changed = false;
  var dedup = {};
  var nextParts = [];
  for (var i = 0; i < parts.length; i++) {
    var token = parts[i];
    if (token === oldSlug) {
      token = newSlug;
      changed = true;
    }
    if (token && !dedup[token]) {
      dedup[token] = true;
      nextParts.push(token);
    }
  }
  return { changed: changed, value: nextParts.join(",") };
}

function cascadeTaxonomySlugChange(ss, sheetName, oldSlug, newSlug) {
  var prevSlug = String(oldSlug || "").trim();
  var nextSlug = String(newSlug || "").trim();
  if (!prevSlug || !nextSlug || prevSlug === nextSlug) return;

  try {
    if (sheetName === "Mart_Categories") {
      // 1. Update parentSlug references inside Mart_Categories
      var catSheet = ensureMartSheet(ss, "Mart_Categories");
      var catLast = catSheet.getLastRow();
      if (catLast > 1) {
        var catHeaders = catSheet.getRange(1, 1, 1, catSheet.getLastColumn()).getValues()[0];
        var parentCol = catHeaders.indexOf("parentSlug") + 1;
        if (parentCol > 0) {
          var parentVals = catSheet.getRange(2, parentCol, catLast - 1, 1).getValues();
          for (var c = 0; c < parentVals.length; c++) {
            if (String(parentVals[c][0] || "").trim() === prevSlug) {
              catSheet.getRange(c + 2, parentCol).setValue(nextSlug);
            }
          }
        }
      }
    }

    // 2. Update categories or labels CSV column in Mart_Products
    var targetProdCol = sheetName === "Mart_Categories" ? "categories" : sheetName === "Mart_Labels" ? "labels" : "";
    if (!targetProdCol) return;

    var prodSheet = ensureMartSheet(ss, "Mart_Products");
    var prodLast = prodSheet.getLastRow();
    if (prodLast <= 1) return;

    var prodHeaders = prodSheet.getRange(1, 1, 1, prodSheet.getLastColumn()).getValues()[0];
    var colIdx = prodHeaders.indexOf(targetProdCol) + 1;
    if (colIdx < 1) return;

    var prodVals = prodSheet.getRange(2, colIdx, prodLast - 1, 1).getValues();
    for (var r = 0; r < prodVals.length; r++) {
      var res = replaceSlugTokenInCsv(prodVals[r][0], prevSlug, nextSlug);
      if (res.changed) {
        prodSheet.getRange(r + 2, colIdx).setValue(res.value);
      }
    }
  } catch (err) {
    // Non-fatal cascade guard
  }
}

function isOrderItemStockDeducted(orderStatus, itemStatus) {
  var os = String(orderStatus || "").trim();
  var ist = String(itemStatus || "").trim();
  return os !== "Cancelled" && ist !== "Cancelled" && ist !== "Returned";
}

function adjustStockForItems(ss, items, defaultMultiplier) {
  try {
    if (!Array.isArray(items) || items.length === 0) return false;

    var prodSheet = ensureMartSheet(ss, "Mart_Products");
    var lastRow = prodSheet.getLastRow();
    if (lastRow <= 1) return false;

    var headers = prodSheet.getRange(1, 1, 1, prodSheet.getLastColumn()).getValues()[0];
    var idCol = headers.indexOf("id") + 1;
    var stockCol = headers.indexOf("stock") + 1;
    var ftCol = headers.indexOf("fulfillmentType") + 1;
    var matrixCol = headers.indexOf("variationMatrixJson") + 1;
    if (idCol < 1 || stockCol < 1) return false;

    var idVals = prodSheet.getRange(2, idCol, lastRow - 1, 1).getValues();
    var stockVals = prodSheet.getRange(2, stockCol, lastRow - 1, 1).getValues();
    var ftVals = ftCol > 0 ? prodSheet.getRange(2, ftCol, lastRow - 1, 1).getValues() : null;
    var matrixVals = matrixCol > 0 ? prodSheet.getRange(2, matrixCol, lastRow - 1, 1).getValues() : null;
    var anyAdjusted = false;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item) continue;
      var pid = String(item.productId || "");
      var rawDelta =
        item.stockDelta !== undefined
          ? Number(item.stockDelta) || 0
          : (Math.max(0, Number(item.quantity) || 0)) * (Number(defaultMultiplier) || -1);
      if (!pid || rawDelta === 0) continue;

      for (var r = 0; r < idVals.length; r++) {
        if (String(idVals[r][0]) === pid) {
          var rowFt = ftVals
            ? String(ftVals[r][0] || "own_stock").trim()
            : item.fulfillmentType || "own_stock";
          // Strictly skip physical stock mutation for dropshipped items
          if (rowFt === "dropship" || item.fulfillmentType === "dropship") {
            break;
          }

          var matrixUpdated = false;
          if (matrixCol > 0 && matrixVals && matrixVals[r][0]) {
            try {
              var matrixArr = JSON.parse(String(matrixVals[r][0]));
              if (Array.isArray(matrixArr) && matrixArr.length > 0) {
                var cNorm = String(item.colorName || "").trim().toLowerCase();
                var sNorm = String(item.sizeName || "").trim().toLowerCase();
                var skuNorm = String(item.variantSku || "").trim().toLowerCase();
                var cellMatched = false;
                var totalMatrixStock = 0;

                for (var m = 0; m < matrixArr.length; m++) {
                  var cell = matrixArr[m];
                  if (!cell) continue;
                  var isHit =
                    (skuNorm && cell.sku && String(cell.sku).trim().toLowerCase() === skuNorm) ||
                    (String(cell.colorNameEn || "").trim().toLowerCase() === cNorm &&
                      String(cell.size || "").trim().toLowerCase() === sNorm);
                  if (!cellMatched && isHit) {
                    cell.stock = Math.max(0, (Number(cell.stock) || 0) + rawDelta);
                    cellMatched = true;
                  }
                  if (cell.active !== false) {
                    totalMatrixStock += Math.max(0, Number(cell.stock) || 0);
                  }
                }

                if (cellMatched) {
                  var updatedJson = JSON.stringify(matrixArr);
                  prodSheet.getRange(r + 2, matrixCol).setValue(updatedJson);
                  matrixVals[r][0] = updatedJson;
                  prodSheet.getRange(r + 2, stockCol).setValue(totalMatrixStock);
                  stockVals[r][0] = totalMatrixStock;
                  matrixUpdated = true;
                  anyAdjusted = true;
                }
              }
            } catch (e) {
              // Fallback to scalar stock
            }
          }

          if (!matrixUpdated) {
            var nextStock = Math.max(0, (Number(stockVals[r][0]) || 0) + rawDelta);
            prodSheet.getRange(r + 2, stockCol).setValue(nextStock);
            stockVals[r][0] = nextStock;
            anyAdjusted = true;
          }
          break;
        }
      }
    }
    return anyAdjusted;
  } catch (err) {
    return false;
  }
}

function decrementStockForOrder(ss, itemsJsonStr) {
  try {
    var items = JSON.parse(itemsJsonStr || "[]");
    adjustStockForItems(ss, items, -1);
  } catch (err) {
    // Non-fatal stock sync guard
  }
}

function syncOrderStockOnUpdate(ss, prevOrder, nextStatus, nextItemsJson) {
  try {
    var prevItems = JSON.parse(String(prevOrder.itemsJson || "[]"));
    var nextItems = JSON.parse(String(nextItemsJson || prevOrder.itemsJson || "[]"));
    if (!Array.isArray(prevItems)) prevItems = [];
    if (!Array.isArray(nextItems)) nextItems = [];

    var bucketMap = {};
    var addBucket = function (item, signedQty) {
      if (!item || !item.productId || !signedQty) return;
      var k = [
        String(item.productId || ""),
        String(item.variantSku || ""),
        String(item.colorName || ""),
        String(item.sizeName || "")
      ].join("::");
      if (!bucketMap[k]) {
        bucketMap[k] = {
          productId: item.productId,
          variantSku: item.variantSku || "",
          colorName: item.colorName || "",
          sizeName: item.sizeName || "",
          fulfillmentType: item.fulfillmentType || "own_stock",
          stockDelta: 0
        };
      }
      bucketMap[k].stockDelta += signedQty;
    };

    var prevOrderStatus = String(prevOrder.status || "Pending");
    for (var i = 0; i < prevItems.length; i++) {
      var pi = prevItems[i];
      if (isOrderItemStockDeducted(prevOrderStatus, pi.itemStatus)) {
        addBucket(pi, Math.max(0, Number(pi.quantity) || 0));
      }
    }

    var effectiveNextStatus = String(nextStatus || prevOrderStatus || "Pending");
    for (var j = 0; j < nextItems.length; j++) {
      var ni = nextItems[j];
      if (isOrderItemStockDeducted(effectiveNextStatus, ni.itemStatus)) {
        addBucket(ni, -Math.max(0, Number(ni.quantity) || 0));
      }
    }

    var deltas = [];
    var keys = Object.keys(bucketMap);
    for (var k = 0; k < keys.length; k++) {
      if (bucketMap[keys[k]].stockDelta !== 0) {
        deltas.push(bucketMap[keys[k]]);
      }
    }
    if (deltas.length === 0) return false;
    return adjustStockForItems(ss, deltas, 1);
  } catch (err) {
    return false;
  }
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = String(params.action || "martPublic");
    var token = params.token || "";
    var forceFresh = String(params.fresh || "") === "1";

    // 1. Public Storefront Bundle (Zero-Sheet Hot CacheService Path — returns pre-serialized JSON)
    if (action === "martPublic") {
      if (!forceFresh) {
        var cachedPublic = getChunkedScriptCache(CACHE_PUBLIC_KEY);
        if (cachedPublic) {
          return rawJsonOut('{"ok":true,"cached":true,"data":' + cachedPublic + "}");
        }
      }

      var ssPublic = getBoundSpreadsheet();
      var bundle = buildAndCachePublicBundle(ssPublic);
      return jsonOut({
        ok: true,
        cached: false,
        data: bundle
      });
    }

    // 2. Dedicated Mart Enterprise Admin Bundle (Auth + Zero-Sheet Hot CacheService Path)
    if (action === "martAdmin") {
      if (!isAuthorizedMartAdmin(token)) {
        return jsonOut({ ok: false, error: "Unauthorized Mart API token." });
      }
      if (!forceFresh) {
        var cachedAdmin = getChunkedScriptCache(CACHE_ADMIN_KEY);
        if (cachedAdmin) {
          return rawJsonOut('{"ok":true,"cached":true,"data":' + cachedAdmin + "}");
        }
      }

      var ssAdmin = getBoundSpreadsheet();
      var prodSheet = getMartSheetFast(ssAdmin, "Mart_Products");
      var catSheet = getMartSheetFast(ssAdmin, "Mart_Categories");
      var labelSheet = getMartSheetFast(ssAdmin, "Mart_Labels");
      var supSheet = getMartSheetFast(ssAdmin, "Mart_Suppliers");
      var couponSheet = getMartSheetFast(ssAdmin, "Mart_Coupons");
      var ordAdminSheet = getMartSheetFast(ssAdmin, "Mart_Orders");
      var txnSheet = getMartSheetFast(ssAdmin, "Mart_Transactions");
      var crmProfSheet = getMartSheetFast(ssAdmin, "Mart_CRM_Profiles");
      var crmLogSheet = getMartSheetFast(ssAdmin, "Mart_CRM_Logs");
      var setSheet = getMartSheetFast(ssAdmin, "Mart_Settings");
      var mergedSettings = mergeSettings(readSettingsMap(setSheet));

      var catRows = sortTaxonomyByOrder(readMartRows(catSheet, "Mart_Categories"));
      var adminPayload = {
        products: readMartRows(prodSheet, "Mart_Products", catRows),
        categories: catRows,
        labels: sortTaxonomyByOrder(readMartRows(labelSheet, "Mart_Labels")),
        attributes: readMartAttributesWithBackup(ssAdmin, mergedSettings),
        suppliers: readMartRows(supSheet, "Mart_Suppliers"),
        coupons: readMartRows(couponSheet, "Mart_Coupons"),
        orders: readMartRows(ordAdminSheet, "Mart_Orders"),
        transactions: readMartRows(txnSheet, "Mart_Transactions"),
        crmProfiles: readMartRows(crmProfSheet, "Mart_CRM_Profiles"),
        crmLogs: readMartRows(crmLogSheet, "Mart_CRM_Logs"),
        settings: mergedSettings
      };

      var serializedAdmin = JSON.stringify(adminPayload);
      putChunkedScriptCache(CACHE_ADMIN_KEY, serializedAdmin, CACHE_TTL_SECONDS);
      return rawJsonOut('{"ok":true,"cached":false,"data":' + serializedAdmin + "}");
    }

    var ss = getBoundSpreadsheet();

    // 3. Health check endpoint
    if (action === "health") {
      var folders = ensureDriveFoldersReady();
      return jsonOut({
        ok: true,
        service: "Xeetrix Mart Enterprise Commerce Backend",
        spreadsheetName: ss.getName(),
        driveRootFolder: folders.rootFolder.getName()
      });
    }

    // 4. Public Coupon Validation Endpoint
    if (action === "checkMartCoupon") {
      var evalRes = evaluateMartCoupon(ss, params.code, params.subtotal);
      return jsonOut({
        ok: true,
        valid: evalRes.valid,
        reasonCode: evalRes.reasonCode || "",
        minOrderAmount: evalRes.minOrderAmount || 0,
        discountAmount: evalRes.discountAmount || 0,
        coupon: evalRes.coupon || null
      });
    }

    // 5. Privacy-Verified Order Tracking (Order ID + Phone required)
    if (action === "trackMartOrder") {
      var orderIdQuery = String(params.orderId || "").trim().toUpperCase();
      var phoneQuery = String(params.phone || "").trim();
      if (!orderIdQuery || !phoneQuery) {
        return jsonOut({
          ok: false,
          error: "Order ID and phone number are required to track an order."
        });
      }

      var ordSheet = getMartSheetFast(ss, "Mart_Orders");
      var allOrders = readMartRows(ordSheet, "Mart_Orders");
      for (var o = 0; o < allOrders.length; o++) {
        var ord = allOrders[o];
        if (
          String(ord.id || "").trim().toUpperCase() === orderIdQuery &&
          phonesMatch(ord.phone, phoneQuery)
        ) {
          return jsonOut({
            ok: true,
            order: ord
          });
        }
      }

      return jsonOut({
        ok: false,
        error: "No matching order found. Please verify your Order ID and phone number."
      });
    }

    return jsonOut({ ok: false, error: "Unsupported Mart GET action: " + action });
  } catch (err) {
    return jsonOut({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ ok: false, error: "Empty POST payload." });
    }

    var body = JSON.parse(e.postData.contents);
    var action = String(body.action || "");
    var token = body.token || "";
    var ss = getBoundSpreadsheet();

    // Upload image straight into structured Xeetrix_Mart_Storage/(Products/<Cat>/<SKU>|Categories|PaymentQR)
    if (action === "uploadFile") {
      if (!isAuthorizedMartAdmin(token)) {
        return jsonOut({ ok: false, error: "Unauthorized Mart API token." });
      }
      var fileName = String(body.fileName || "mart_asset_" + new Date().getTime());
      var mimeType = String(body.mimeType || "image/jpeg");
      var base64Data = String(body.base64Data || "");
      var folderType = String(body.folderType || "products");

      if (!base64Data) {
        return jsonOut({ ok: false, error: "Missing base64Data for image upload." });
      }

      var commaIdx = base64Data.indexOf(",");
      if (commaIdx !== -1) {
        base64Data = base64Data.substring(commaIdx + 1);
      }

      var folders = ensureDriveFoldersReady();
      var targetFolder = folders.productsFolder;
      var finalFileName = fileName;

      if (folderType === "categories") {
        targetFolder = folders.categoriesFolder;
      } else if (folderType === "payment") {
        targetFolder = folders.paymentFolder;
      } else {
        var uploadSku = String(body.sku || "").trim();
        var uploadProductId = String(body.productId || "").trim();
        var uploadCatPath = Array.isArray(body.categoryPath) ? body.categoryPath : [];
        var uploadRole = String(body.imageRole || "").trim();
        var uploadColorLabel = String(body.colorLabel || "").trim();
        var uploadGalleryIdx = Number(body.galleryIndex) || 1;

        if (uploadSku || uploadProductId || uploadCatPath.length > 0) {
          targetFolder = resolveProductDriveFolder(
            folders,
            uploadCatPath,
            uploadSku,
            uploadProductId || "DRAFT"
          );
          if (uploadSku || uploadProductId) {
            finalFileName = buildStandardProductImageName(
              uploadSku || uploadProductId,
              uploadRole || "MAIN",
              uploadColorLabel,
              uploadGalleryIdx,
              mimeType,
              fileName
            );
          }
        }
      }

      var bytes = Utilities.base64Decode(base64Data);
      var blob = Utilities.newBlob(bytes, mimeType, finalFileName);
      var driveFile = targetFolder.createFile(blob);
      driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var fileId = driveFile.getId();
      return jsonOut({
        ok: true,
        fileId: fileId,
        fileName: driveFile.getName(),
        folderName: targetFolder.getName(),
        url: "https://lh3.googleusercontent.com/d/" + fileId,
        driveViewUrl: "https://drive.google.com/uc?export=view&id=" + fileId,
        viewUrl: "https://drive.google.com/file/d/" + fileId + "/view"
      });
    }

    if (action === "organizeDriveAssets") {
      if (!isAuthorizedMartAdmin(token)) {
        return jsonOut({ ok: false, error: "Unauthorized Mart API token." });
      }
      var orgSummary = organizeProductDriveAssets(ss, true);
      return jsonOut(orgSummary);
    }

    // Acquire script lock for concurrent Sheet writes
    locked = lock.tryLock(10000);

    if (action === "createRecord") {
      var sheetName = String(body.sheet || "");
      var headers = MART_SCHEMA[sheetName];
      if (!headers || sheetName === "Mart_Settings") {
        return jsonOut({ ok: false, error: "Invalid target sheet for createRecord." });
      }
      var isPublicOrder = sheetName === "Mart_Orders";
      if (!isPublicOrder && !isAuthorizedMartAdmin(token)) {
        return jsonOut({ ok: false, error: "Unauthorized Mart API token." });
      }

      var sheet = ensureMartSheet(ss, sheetName);
      var payload = body.data || {};
      if (isPublicOrder) {
        var availCheck = validateOrderItemsAvailability(ss, payload.itemsJson);
        if (!availCheck.ok) {
          return jsonOut(availCheck);
        }
        payload = enrichOrderPayloadServerSide(ss, payload);
      } else if (sheetName === "Mart_Categories") {
        if (!payload.slug) {
          payload.slug = slugifyText(payload.nameEn || payload.nameBn || "category");
        }
        payload.skuCode = resolveCategorySkuCodeServer(payload);
      } else if (sheetName === "Mart_Products") {
        var existingProds = readMartRows(sheet, "Mart_Products");
        var rawRequestedSku = String(payload.sku || "").trim().toUpperCase();
        if (!rawRequestedSku || rawRequestedSku === "AUTO") {
          var catSheetForSku = ensureMartSheet(ss, "Mart_Categories");
          var allCatsForSku = readMartRows(catSheetForSku, "Mart_Categories");
          payload.sku = computeNextSequentialSkuServer(
            payload.categories || "",
            existingProds,
            allCatsForSku,
            ""
          );
        } else {
          payload.sku = rawRequestedSku;
        }
        if (!payload.slug) {
          payload.slug = slugifyText(payload.nameEn || payload.nameBn || payload.sku);
        }
        payload = sanitizeProductFieldsAndSyncStock(payload, "", payload.sku);
        payload = populateProductHelperColumnsForRecord(ss, payload, payload.categories, payload.attributesJson);
        var newSku = String(payload.sku || "").trim().toUpperCase();
        if (newSku) {
          for (var ep = 0; ep < existingProds.length; ep++) {
            if (String(existingProds[ep].sku || "").trim().toUpperCase() === newSku) {
              return jsonOut({
                ok: false,
                code: "DUPLICATE_SKU",
                conflictProductId: existingProds[ep].id,
                error:
                  "Duplicate SKU conflict: " +
                  newSku +
                  " is already assigned to " +
                  (existingProds[ep].nameEn || existingProds[ep].id)
              });
            }
          }
        }
      }

      var now = new Date().toISOString();
      var recordId = payload.id ? String(payload.id) : generateMartId(sheetName);

      var record = {};
      for (var i = 0; i < headers.length; i++) {
        var col = headers[i];
        var val;
        if (col === "id") {
          val = recordId;
        } else if (col === "createdAt" || col === "updatedAt") {
          val = payload[col] || now;
        } else if (col === "status" && (payload.status === undefined || payload.status === "")) {
          val = "Pending";
        } else if ((col === "active" || col === "supplierAvailable") && payload[col] === undefined) {
          val = true;
        } else if (col === "featured" && payload.featured === undefined) {
          val = false;
        } else if (col === "tone" && (payload.tone === undefined || payload.tone === "")) {
          val = "emerald";
        } else if (col === "discountType" && !payload.discountType) {
          val = "percent";
        } else if (col === "fulfillmentType" && !payload.fulfillmentType) {
          val = "own_stock";
        } else if (col === "collectionMode" && !payload.collectionMode) {
          val = "store_collects";
        } else if (col === "tierOverride" && !payload.tierOverride) {
          val = "auto";
        } else if (
          col === "lowStockThreshold" &&
          (payload.lowStockThreshold === undefined || payload.lowStockThreshold === "")
        ) {
          val = 5;
        } else if (col === "sortOrder" && payload.sortOrder === undefined) {
          val = 0;
        } else {
          val = payload[col] !== undefined ? payload[col] : "";
        }
        record[col] = normalizeMartCell(col, val);
      }

      var actualHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
      var rowValues = [];
      for (var ah = 0; ah < actualHeaders.length; ah++) {
        var headerName = String(actualHeaders[ah] || "").trim();
        rowValues.push(record[headerName] !== undefined ? record[headerName] : "");
      }

      try {
        sheet.appendRow(rowValues);
        SpreadsheetApp.flush();
      } catch (appendErr) {
        var nextEmptyRow = sheet.getLastRow() + 1;
        for (var colW = 0; colW < rowValues.length; colW++) {
          safeSetCellValue(sheet, nextEmptyRow, colW + 1, rowValues[colW], false);
        }
      }

      if (sheetName === "Mart_Products") {
        try {
          var newRowIdx = sheet.getLastRow();
          var appendCatSheet = ensureMartSheet(ss, "Mart_Categories");
          var appendCatIndex = buildCategoryLookupIndex(readMartRows(appendCatSheet, "Mart_Categories"));
          var appendColMap = {};
          for (var ach = 0; ach < actualHeaders.length; ach++) {
            var achName = String(actualHeaders[ach] || "").trim();
            if (achName) appendColMap[achName] = ach + 1;
          }
          var appendChain = resolveHelperFieldsToCategoriesCsv(record, appendCatIndex);
          applyRowCascadeValidation(sheet, newRowIdx, appendColMap, appendChain.l1Cat, appendChain.l2Cat, appendCatIndex, null, false);
          syncSingleProductDriveAssets(ensureDriveFoldersReady(), record, appendCatIndex, null);
        } catch (e) {}
      } else if (sheetName === "Mart_Orders") {
        if (payload.itemsJson) {
          decrementStockForOrder(ss, String(payload.itemsJson));
        }
        if (record.discountCode) {
          incrementCouponUsage(ss, String(record.discountCode));
        }
      } else if (sheetName === "Mart_Attributes") {
        syncAttributesBackupToSettings(ss);
        refreshMartProductsColumnValidationsSafe(ss);
      } else if (sheetName === "Mart_Categories") {
        refreshMartProductsColumnValidationsSafe(ss);
      }

      invalidateMartCache();
      return jsonOut({ ok: true, id: recordId, record: record });
    }

    if (action === "batchCreateRecords") {
      if (!isAuthorizedMartAdmin(token)) {
        return jsonOut({ ok: false, error: "Unauthorized Mart API token." });
      }
      var batchSheetName = String(body.sheet || "");
      var batchHeaders = MART_SCHEMA[batchSheetName];
      if (!batchHeaders || batchSheetName === "Mart_Settings") {
        return jsonOut({ ok: false, error: "Invalid target sheet for batchCreateRecords." });
      }
      var itemsList = Array.isArray(body.records) ? body.records : [];
      if (itemsList.length === 0) {
        return jsonOut({ ok: true, count: 0 });
      }
      var batchSheet = ensureMartSheet(ss, batchSheetName);
      var bActualHeaders = batchSheet
        .getRange(1, 1, 1, Math.max(1, batchSheet.getLastColumn()))
        .getValues()[0];
      var bNow = new Date().toISOString();
      var rowsMatrix = [];

      for (var bi = 0; bi < itemsList.length; bi++) {
        var itemData = itemsList[bi] || {};
        if (batchSheetName === "Mart_Categories") {
          if (!itemData.slug) {
            itemData.slug = slugifyText(itemData.nameEn || itemData.nameBn || "cat-" + bi);
          }
          itemData.skuCode = resolveCategorySkuCodeServer(itemData);
        } else if (batchSheetName === "Mart_Attributes") {
          if (!itemData.slug) {
            itemData.slug = slugifyText(itemData.nameEn || itemData.nameBn || "attr-" + bi);
          }
        }
        var bId = itemData.id ? String(itemData.id) : generateMartId(batchSheetName) + "-" + bi;
        var bRec = {};
        for (var bh = 0; bh < batchHeaders.length; bh++) {
          var bCol = batchHeaders[bh];
          var bVal;
          if (bCol === "id") {
            bVal = bId;
          } else if (bCol === "createdAt" || bCol === "updatedAt") {
            bVal = itemData[bCol] || bNow;
          } else if ((bCol === "active" || bCol === "supplierAvailable") && itemData[bCol] === undefined) {
            bVal = true;
          } else if (bCol === "featured" && itemData.featured === undefined) {
            bVal = false;
          } else if (bCol === "sortOrder" && itemData.sortOrder === undefined) {
            bVal = (bi + 1) * 10;
          } else {
            bVal = itemData[bCol] !== undefined ? itemData[bCol] : "";
          }
          bRec[bCol] = normalizeMartCell(bCol, bVal);
        }
        var bRow = [];
        for (var bah = 0; bah < bActualHeaders.length; bah++) {
          var bHeaderName = String(bActualHeaders[bah] || "").trim();
          bRow.push(bRec[bHeaderName] !== undefined ? bRec[bHeaderName] : "");
        }
        rowsMatrix.push(bRow);
      }

      if (rowsMatrix.length > 0) {
        var appendStartRow = batchSheet.getLastRow() + 1;
        batchSheet
          .getRange(appendStartRow, 1, rowsMatrix.length, bActualHeaders.length)
          .setValues(rowsMatrix);
      }

      if (batchSheetName === "Mart_Attributes") {
        syncAttributesBackupToSettings(ss);
        refreshMartProductsColumnValidationsSafe(ss);
      } else if (batchSheetName === "Mart_Categories") {
        refreshMartProductsColumnValidationsSafe(ss);
      }

      invalidateMartCache();
      return jsonOut({ ok: true, count: rowsMatrix.length });
    }

    if (action === "updateStatus" || action === "updateRecord") {
      if (!isAuthorizedMartAdmin(token)) {
        return jsonOut({ ok: false, error: "Unauthorized Mart API token." });
      }
      var updSheetName = String(body.sheet || "");
      var updHeaders = MART_SCHEMA[updSheetName];
      if (!updHeaders || updSheetName === "Mart_Settings") {
        return jsonOut({ ok: false, error: "Invalid Mart sheet tab." });
      }
      var targetId = String(body.id || "");
      if (!targetId) {
        return jsonOut({ ok: false, error: "Record id is required." });
      }

      var updSheet = ensureMartSheet(ss, updSheetName);
      var lastRow = updSheet.getLastRow();
      if (lastRow <= 1) {
        return jsonOut({ ok: false, error: "Record not found." });
      }

      var rawHeaders = updSheet.getRange(1, 1, 1, updSheet.getLastColumn()).getValues()[0];
      var idColIdx = rawHeaders.indexOf("id");
      if (idColIdx === -1) idColIdx = 0;
      var ids = updSheet.getRange(2, idColIdx + 1, lastRow - 1, 1).getValues();
      var foundRowIndex = -1;
      for (var r = 0; r < ids.length; r++) {
        if (String(ids[r][0]) === targetId) {
          foundRowIndex = r + 2;
          break;
        }
      }
      if (foundRowIndex === -1) {
        var rowFallbackMatch = targetId.match(/^ROW-(\d+)$/);
        if (rowFallbackMatch) {
          var parsedRowIdx = parseInt(rowFallbackMatch[1], 10);
          if (parsedRowIdx >= 2 && parsedRowIdx <= lastRow) {
            foundRowIndex = parsedRowIdx;
            var permanentId = generateMartId(updSheetName);
            updSheet.getRange(foundRowIndex, idColIdx + 1).setValue(permanentId);
            targetId = permanentId;
          }
        }
      }
      if (foundRowIndex === -1) {
        return jsonOut({ ok: false, error: "Record id not found: " + targetId });
      }

      var prevRowObj = readSingleRowObject(updSheet, rawHeaders, foundRowIndex);

      var updates = body.updates || {};
      if (body.status !== undefined) updates.status = body.status;
      if (body.active !== undefined) updates.active = body.active;
      if (body.featured !== undefined) updates.featured = body.featured;
      if (updSheetName === "Mart_Categories" && updates.skuCode !== undefined) {
        updates.skuCode = resolveCategorySkuCodeServer({
          skuCode: updates.skuCode,
          nameEn: updates.nameEn !== undefined ? updates.nameEn : prevRowObj.nameEn,
          slug: updates.slug !== undefined ? updates.slug : prevRowObj.slug
        });
      }
      if (updSheetName === "Mart_Products") {
        var prodSyncObj = {
          fulfillmentType:
            updates.fulfillmentType !== undefined
              ? updates.fulfillmentType
              : prevRowObj.fulfillmentType
        };
        var uKeys = Object.keys(updates);
        for (var uk = 0; uk < uKeys.length; uk++) {
          prodSyncObj[uKeys[uk]] = updates[uKeys[uk]];
        }
        sanitizeProductFieldsAndSyncStock(
          prodSyncObj,
          prevRowObj.variationMatrixJson,
          prodSyncObj.sku !== undefined ? prodSyncObj.sku : prevRowObj.sku
        );
        var updatedSku =
          prodSyncObj.sku !== undefined ? String(prodSyncObj.sku || "").trim().toUpperCase() : "";
        if (updatedSku) {
          var allProdsForCheck = readMartRows(updSheet, "Mart_Products");
          for (var pc = 0; pc < allProdsForCheck.length; pc++) {
            var candidateProd = allProdsForCheck[pc];
            if (
              String(candidateProd.id) !== targetId &&
              String(candidateProd.sku || "").trim().toUpperCase() === updatedSku
            ) {
              return jsonOut({
                ok: false,
                code: "DUPLICATE_SKU",
                conflictProductId: candidateProd.id,
                error:
                  "Duplicate SKU conflict: " +
                  updatedSku +
                  " is already assigned to " +
                  (candidateProd.nameEn || candidateProd.id)
              });
            }
          }
        }
        updates = prodSyncObj;
        populateProductHelperColumnsForRecord(
          ss,
          updates,
          updates.categories !== undefined ? updates.categories : prevRowObj.categories,
          updates.attributesJson !== undefined ? updates.attributesJson : prevRowObj.attributesJson
        );
      }

      var updateKeys = Object.keys(updates);
      for (var k = 0; k < updateKeys.length; k++) {
        var key = updateKeys[k];
        if (key === "id" || key === "createdAt") continue;
        var colIndex = rawHeaders.indexOf(key);
        if (colIndex === -1) colIndex = updHeaders.indexOf(key);
        if (colIndex !== -1) {
          safeSetCellValue(updSheet, foundRowIndex, colIndex + 1, normalizeMartCell(key, updates[key]), true);
        }
      }
      safeFlushSpreadsheet();

      if (
        (updSheetName === "Mart_Categories" || updSheetName === "Mart_Labels") &&
        updates.slug !== undefined &&
        String(prevRowObj.slug || "").trim() !== String(updates.slug || "").trim()
      ) {
        cascadeTaxonomySlugChange(ss, updSheetName, prevRowObj.slug, updates.slug);
      }

      var stockAdjusted = false;
      if (
        updSheetName === "Mart_Orders" &&
        (updates.status !== undefined || updates.itemsJson !== undefined)
      ) {
        stockAdjusted = syncOrderStockOnUpdate(
          ss,
          prevRowObj,
          updates.status !== undefined ? updates.status : prevRowObj.status,
          updates.itemsJson !== undefined ? updates.itemsJson : prevRowObj.itemsJson
        );
      }

      if (updSheetName === "Mart_Products") {
        try {
          var updCatSheet = ensureMartSheet(ss, "Mart_Categories");
          var updCatIndex = buildCategoryLookupIndex(readMartRows(updCatSheet, "Mart_Categories"));
          var mergedForDrive = {
            id: targetId,
            sku: updates.sku !== undefined ? updates.sku : prevRowObj.sku,
            categories: updates.categories !== undefined ? updates.categories : prevRowObj.categories,
            imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : prevRowObj.imageUrl,
            galleryUrls: updates.galleryUrls !== undefined ? updates.galleryUrls : prevRowObj.galleryUrls,
            colorsJson: updates.colorsJson !== undefined ? updates.colorsJson : prevRowObj.colorsJson
          };
          syncSingleProductDriveAssets(ensureDriveFoldersReady(), mergedForDrive, updCatIndex, null);
        } catch (driveSyncErr) {}
      } else if (updSheetName === "Mart_Attributes") {
        syncAttributesBackupToSettings(ss);
        refreshMartProductsColumnValidationsSafe(ss);
      } else if (updSheetName === "Mart_Categories") {
        refreshMartProductsColumnValidationsSafe(ss);
      }

      invalidateMartCache();
      return jsonOut({ ok: true, id: targetId, updated: true, stockAdjusted: stockAdjusted });
    }

    if (action === "deleteRecord") {
      if (!isAuthorizedMartAdmin(token)) {
        return jsonOut({ ok: false, error: "Unauthorized Mart API token." });
      }
      var delSheetName = String(body.sheet || "");
      if (!MART_SCHEMA[delSheetName] || delSheetName === "Mart_Settings") {
        return jsonOut({ ok: false, error: "Invalid Mart sheet tab." });
      }
      var delId = String(body.id || "");
      if (!delId) {
        return jsonOut({ ok: false, error: "Record id is required." });
      }

      var delSheet = ensureMartSheet(ss, delSheetName);
      var delLastRow = delSheet.getLastRow();
      if (delLastRow <= 1) {
        return jsonOut({ ok: false, error: "Record not found." });
      }

      var delHeaders = delSheet.getRange(1, 1, 1, delSheet.getLastColumn()).getValues()[0];
      var delIdCol = delHeaders.indexOf("id");
      if (delIdCol === -1) delIdCol = 0;
      var delIds = delSheet.getRange(2, delIdCol + 1, delLastRow - 1, 1).getValues();
      var delFoundRow = -1;
      for (var d = 0; d < delIds.length; d++) {
        if (String(delIds[d][0]) === delId) {
          delFoundRow = d + 2;
          break;
        }
      }
      if (delFoundRow === -1) {
        var delRowFallback = delId.match(/^ROW-(\d+)$/);
        if (delRowFallback) {
          var delParsedIdx = parseInt(delRowFallback[1], 10);
          if (delParsedIdx >= 2 && delParsedIdx <= delLastRow && !String(delIds[delParsedIdx - 2][0] || "").trim()) {
            delFoundRow = delParsedIdx;
          }
        }
      }
      if (delFoundRow !== -1) {
        var rowToDelete = delFoundRow;
          var delStockRestored = false;
          var deletedRowObj = readSingleRowObject(delSheet, delHeaders, rowToDelete);
          if (delSheetName === "Mart_Orders") {
            delStockRestored = syncOrderStockOnUpdate(
              ss,
              deletedRowObj,
              "Cancelled",
              deletedRowObj.itemsJson
            );
          }
          delSheet.deleteRow(rowToDelete);
          if (delSheetName === "Mart_Categories" && deletedRowObj.slug) {
            cascadeTaxonomySlugChange(
              ss,
              "Mart_Categories",
              deletedRowObj.slug,
              deletedRowObj.parentSlug || ""
            );
            refreshMartProductsColumnValidationsSafe(ss);
          } else if (delSheetName === "Mart_Labels" && deletedRowObj.slug) {
            cascadeTaxonomySlugChange(ss, "Mart_Labels", deletedRowObj.slug, "");
          } else if (delSheetName === "Mart_Attributes") {
            syncAttributesBackupToSettings(ss);
            refreshMartProductsColumnValidationsSafe(ss);
          }
          invalidateMartCache();
          return jsonOut({ ok: true, id: delId, deleted: true, stockRestored: delStockRestored });
      }
      return jsonOut({ ok: false, error: "Record id not found: " + delId });
    }

    if (action === "updateMartSettings") {
      if (!isAuthorizedMartAdmin(token)) {
        return jsonOut({ ok: false, error: "Unauthorized Mart API token." });
      }
      var settingsSheet = ensureMartSheet(ss, "Mart_Settings");
      var incomingMap = body.settings || {};
      if (body.key) {
        incomingMap[String(body.key)] = body.value !== undefined ? String(body.value) : "";
      }

      var nowIso = new Date().toISOString();
      var keysToUpdate = Object.keys(incomingMap);
      for (var u = 0; u < keysToUpdate.length; u++) {
        var sKey = keysToUpdate[u];
        var sVal = String(incomingMap[sKey] !== undefined ? incomingMap[sKey] : "");
        var sLastRow = settingsSheet.getLastRow();
        var updatedExisting = false;

        if (sLastRow > 1) {
          var existingKeys = settingsSheet.getRange(2, 1, sLastRow - 1, 1).getValues();
          for (var rowIdx = 0; rowIdx < existingKeys.length; rowIdx++) {
            if (String(existingKeys[rowIdx][0]) === sKey) {
              try {
                settingsSheet.getRange(rowIdx + 2, 2, 1, 2).setValues([[sVal, nowIso]]);
                SpreadsheetApp.flush();
              } catch (svErr) {
                safeSetCellValue(settingsSheet, rowIdx + 2, 2, sVal, false);
                safeSetCellValue(settingsSheet, rowIdx + 2, 3, nowIso, false);
              }
              updatedExisting = true;
              break;
            }
          }
        }
        if (!updatedExisting) {
          try {
            settingsSheet.appendRow([sKey, sVal, nowIso]);
            SpreadsheetApp.flush();
          } catch (saErr) {
            try {
              settingsSheet.appendRow([sKey, sVal, new Date()]);
              SpreadsheetApp.flush();
            } catch (saErr2) {}
          }
        }
      }

      invalidateMartCache();
      return jsonOut({
        ok: true,
        settings: mergeSettings(readSettingsMap(settingsSheet))
      });
    }

    return jsonOut({ ok: false, error: "Unsupported Mart POST action: " + action });
  } catch (err) {
    return jsonOut({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  } finally {
    if (locked) {
      try {
        lock.releaseLock();
      } catch (e) {
        // Ignore release error
      }
    }
  }
}
