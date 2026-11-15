/**
 * Xeetrix Mart — Standalone Bilingual & Multi-Taxonomy Google Apps Script Backend
 *
 * Designed to be attached directly inside a dedicated "Xeetrix Mart Database" Google Sheet.
 *
 * FIRST-TIME & UPGRADE ONE-CLICK SETUP:
 *   1. Open your Google Sheet -> Extensions -> Apps Script -> paste this file -> Save.
 *   2. Select "setupMartBackend" in the top function dropdown and click Run.
 *   3. Authorize Google Sheets & Google Drive access.
 *      This single run automatically creates OR non-destructively upgrades:
 *        - 5 Tabs with bold frozen Row 1 headers (ZERO dummy items):
 *          Mart_Products, Mart_Categories, Mart_Labels, Mart_Orders, Mart_Settings
 *        - Google Drive folders:
 *          Xeetrix_Mart_Storage/Products  &  Xeetrix_Mart_Storage/Categories
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
    "price",
    "comparePrice",
    "costPrice",
    "fulfillmentType",
    "supplierId",
    "sourceName",
    "collectionMode",
    "supplierAvailable",
    "lowStockThreshold",
    "stock",
    "variantsEn",
    "variantsBn",
    "imageUrl",
    "descriptionEn",
    "descriptionBn",
    "featured",
    "active",
    "createdAt"
  ],
  Mart_Categories: [
    "id",
    "slug",
    "parentSlug",
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
  Mart_Orders: [
    "id",
    "itemsJson",
    "itemsSummary",
    "totalItems",
    "subtotal",
    "deliveryArea",
    "deliveryCharge",
    "totalAmount",
    "customerName",
    "phone",
    "address",
    "paymentMethod",
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
  mobileBankingNumber: ""
};

var DRIVE_ROOT_FOLDER_NAME = "Xeetrix_Mart_Storage";
var DRIVE_PRODUCTS_FOLDER_NAME = "Products";
var DRIVE_CATEGORIES_FOLDER_NAME = "Categories";

var PROP_DRIVE_ROOT_ID = "MART_DRIVE_ROOT_ID";
var PROP_DRIVE_PRODUCTS_ID = "MART_DRIVE_PRODUCTS_ID";
var PROP_DRIVE_CATEGORIES_ID = "MART_DRIVE_CATEGORIES_ID";

var CACHE_PUBLIC_KEY = "xeetrix_mart_public_v3";
var CACHE_TTL_SECONDS = 600; // 10 minutes; automatically busted on every mutation

function jsonOut(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
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

function ensureDriveFoldersReady() {
  var props = PropertiesService.getScriptProperties();
  var rootFolder = null;
  var productsFolder = null;
  var categoriesFolder = null;

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

  var savedProdId = props.getProperty(PROP_DRIVE_PRODUCTS_ID);
  if (savedProdId) {
    try {
      var candidateProd = DriveApp.getFolderById(savedProdId);
      if (!candidateProd.isTrashed()) {
        productsFolder = candidateProd;
      }
    } catch (e) {
      productsFolder = null;
    }
  }
  if (!productsFolder) {
    productsFolder = getOrCreateFolderByName(rootFolder, DRIVE_PRODUCTS_FOLDER_NAME);
    props.setProperty(PROP_DRIVE_PRODUCTS_ID, productsFolder.getId());
  }

  var savedCatId = props.getProperty(PROP_DRIVE_CATEGORIES_ID);
  if (savedCatId) {
    try {
      var candidateCat = DriveApp.getFolderById(savedCatId);
      if (!candidateCat.isTrashed()) {
        categoriesFolder = candidateCat;
      }
    } catch (e) {
      categoriesFolder = null;
    }
  }
  if (!categoriesFolder) {
    categoriesFolder = getOrCreateFolderByName(rootFolder, DRIVE_CATEGORIES_FOLDER_NAME);
    props.setProperty(PROP_DRIVE_CATEGORIES_ID, categoriesFolder.getId());
  }

  return {
    rootFolder: rootFolder,
    productsFolder: productsFolder,
    categoriesFolder: categoriesFolder
  };
}

function styleHeaderRange(range) {
  range.setFontWeight("bold");
  range.setBackground("#0B5336");
  range.setFontColor("#FFFFFF");
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
    headerRange.setValues([headers]);
    styleHeaderRange(headerRange);
    sheet.setFrozenRows(1);
    for (var c = 1; c <= headers.length; c++) {
      sheet.setColumnWidth(c, 150);
    }
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
    addRange.setValues([missingHeaders]);
    styleHeaderRange(addRange);
    for (var m = 0; m < missingHeaders.length; m++) {
      sheet.setColumnWidth(startCol + m, 150);
    }
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * ONE-CLICK INITIALIZER / UPGRADER:
 * Run inside your bound Google Sheet's Apps Script Editor.
 * Builds/upgrades all Mart tabs (Products, Categories, Labels, Suppliers, Orders,
 * Transactions, CRM Profiles, CRM Logs, Settings), Drive folders, and CacheService.
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
      settingsSheet.appendRow([k, MART_DEFAULT_SETTINGS[k], now]);
    }
  }

  // Auto-create Drive folders: Xeetrix_Mart_Storage -> Products & Categories
  var folders = ensureDriveFoldersReady();

  // Warm public cache immediately
  invalidateMartCache();
  buildAndCachePublicBundle(ss);

  return (
    "Xeetrix Mart Enterprise Backend Ready! Sheet: " +
    ss.getName() +
    " | Tabs: " +
    tabNames.length +
    " | Drive Root: " +
    folders.rootFolder.getName()
  );
}

function invalidateMartCache() {
  try {
    var cache = CacheService.getScriptCache();
    cache.remove(CACHE_PUBLIC_KEY);
    cache.remove("xeetrix_mart_public_v2");
    cache.remove("xeetrix_mart_public_v1");
  } catch (err) {
    // Ignore cache eviction error
  }
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
    header === "lowStockThreshold" ||
    header === "stock" ||
    header === "leadTimeDays" ||
    header === "amount" ||
    header === "totalItems" ||
    header === "subtotal" ||
    header === "deliveryCharge" ||
    header === "totalAmount" ||
    header === "sortOrder"
  ) {
    var num = Number(val);
    return isNaN(num) ? 0 : num;
  }
  return val === null || val === undefined ? "" : String(val);
}

function readMartRows(sheet, sheetName) {
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

    // Legacy compatibility & sensible defaults
    if (sheetName === "Mart_Products") {
      if (!obj.nameEn && colMap["name"] !== undefined) {
        obj.nameEn = String(row[colMap["name"]] || "");
      }
      if (!obj.categories && colMap["category"] !== undefined) {
        var legacyCat = String(row[colMap["category"]] || "").trim();
        if (legacyCat) {
          obj.categories = slugifyText(legacyCat) || legacyCat;
        }
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
    }

    if (sheetName === "Mart_Labels") {
      if (!obj.tone) {
        obj.tone = "emerald";
      }
      if (!obj.slug) {
        obj.slug = slugifyText(obj.nameEn || obj.nameBn || obj.id);
      }
    }

    if (sheetName === "Mart_Suppliers") {
      if (!obj.companyType) obj.companyType = "dropship";
      if (!obj.payoutMode) obj.payoutMode = "we_pay_supplier";
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

function buildAndCachePublicBundle(ss) {
  var prodSheet = ensureMartSheet(ss, "Mart_Products");
  var catSheet = ensureMartSheet(ss, "Mart_Categories");
  var labelSheet = ensureMartSheet(ss, "Mart_Labels");
  var supSheet = ensureMartSheet(ss, "Mart_Suppliers");
  var setSheet = ensureMartSheet(ss, "Mart_Settings");

  var suppliers = readMartRows(supSheet, "Mart_Suppliers");
  var supplierActiveMap = {};
  for (var s = 0; s < suppliers.length; s++) {
    supplierActiveMap[suppliers[s].id] = suppliers[s].active === true;
  }

  // Strip internal costPrice / supplierId / sourceName from public storefront payload
  var activeProducts = readMartRows(prodSheet, "Mart_Products")
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
        nameEn: p.nameEn,
        nameBn: p.nameBn,
        categories: p.categories,
        labels: p.labels,
        price: p.price,
        comparePrice: p.comparePrice,
        fulfillmentType: p.fulfillmentType || "own_stock",
        supplierAvailable: effectiveSupplierAvailable,
        lowStockThreshold: p.lowStockThreshold || 5,
        stock: p.stock,
        variantsEn: p.variantsEn,
        variantsBn: p.variantsBn,
        imageUrl: p.imageUrl,
        descriptionEn: p.descriptionEn,
        descriptionBn: p.descriptionBn,
        featured: p.featured,
        active: p.active,
        createdAt: p.createdAt
      };
    });

  var activeCategories = sortTaxonomyByOrder(
    readMartRows(catSheet, "Mart_Categories").filter(function (c) {
      return c.active === true;
    })
  );
  var activeLabels = sortTaxonomyByOrder(
    readMartRows(labelSheet, "Mart_Labels").filter(function (l) {
      return l.active === true;
    })
  );
  var settings = mergeSettings(readSettingsMap(setSheet));

  var payload = {
    products: activeProducts,
    categories: activeCategories,
    labels: activeLabels,
    settings: settings
  };

  try {
    var serialized = JSON.stringify(payload);
    if (serialized.length < 95000) {
      CacheService.getScriptCache().put(CACHE_PUBLIC_KEY, serialized, CACHE_TTL_SECONDS);
    }
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
    Mart_Suppliers: "SUP",
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

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var catProd = prodMap[String(item.productId || "")];
      var fulfillmentType = item.fulfillmentType || (catProd ? catProd.fulfillmentType : "own_stock") || "own_stock";
      var supplierId = item.supplierId !== undefined && item.supplierId !== "" ? item.supplierId : (catProd ? catProd.supplierId : "");
      var supObj = supplierId ? supMap[supplierId] : null;
      var supplierName = item.supplierName || (supObj ? supObj.name : "") || (catProd ? catProd.sourceName : "") || "";
      var collectionMode = item.collectionMode || (catProd ? catProd.collectionMode : "") || (supObj ? supObj.payoutMode === "supplier_pays_us" ? "supplier_collects" : "store_collects" : "store_collects");
      var unitCost = item.unitCost !== undefined ? Number(item.unitCost) : (catProd ? Number(catProd.costPrice) || 0 : 0);
      var qty = Math.max(1, Number(item.quantity) || 1);
      var unitPrice = Number(item.unitPrice) || (catProd ? Number(catProd.price) || 0 : 0);
      var lineTotal = Number(item.lineTotal) || unitPrice * qty;
      var lineCost = unitCost * qty;

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
  } catch (err) {
    // Keep original payload if enrichment fails
  }
  return payload;
}

function decrementStockForOrder(ss, itemsJsonStr) {
  try {
    var items = JSON.parse(itemsJsonStr || "[]");
    if (!Array.isArray(items) || items.length === 0) return;

    var prodSheet = ensureMartSheet(ss, "Mart_Products");
    var lastRow = prodSheet.getLastRow();
    if (lastRow <= 1) return;

    var headers = prodSheet.getRange(1, 1, 1, prodSheet.getLastColumn()).getValues()[0];
    var idCol = headers.indexOf("id") + 1;
    var stockCol = headers.indexOf("stock") + 1;
    var ftCol = headers.indexOf("fulfillmentType") + 1;
    if (idCol < 1 || stockCol < 1) return;

    var idVals = prodSheet.getRange(2, idCol, lastRow - 1, 1).getValues();
    var stockVals = prodSheet.getRange(2, stockCol, lastRow - 1, 1).getValues();
    var ftVals = ftCol > 0 ? prodSheet.getRange(2, ftCol, lastRow - 1, 1).getValues() : null;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var pid = String(item.productId || "");
      var qty = Math.max(0, Number(item.quantity) || 0);
      if (!pid || qty <= 0) continue;

      for (var r = 0; r < idVals.length; r++) {
        if (String(idVals[r][0]) === pid) {
          var rowFt = ftVals ? String(ftVals[r][0] || "own_stock").trim() : (item.fulfillmentType || "own_stock");
          // Strictly skip physical stock decrement for dropshipped items
          if (rowFt === "dropship" || item.fulfillmentType === "dropship") {
            break;
          }
          var nextStock = Math.max(0, (Number(stockVals[r][0]) || 0) - qty);
          prodSheet.getRange(r + 2, stockCol).setValue(nextStock);
          stockVals[r][0] = nextStock;
          break;
        }
      }
    }
  } catch (err) {
    // Non-fatal stock sync guard
  }
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = String(params.action || "martPublic");
    var token = params.token || "";
    var ss = getBoundSpreadsheet();

    // Health check endpoint
    if (action === "health") {
      var folders = ensureDriveFoldersReady();
      return jsonOut({
        ok: true,
        service: "Xeetrix Mart Enterprise Sourcing, Accounting & CRM Backend",
        spreadsheetName: ss.getName(),
        driveRootFolder: folders.rootFolder.getName()
      });
    }

    // 1. Public Storefront Bundle (Hot CacheService path — sanitized)
    if (action === "martPublic") {
      if (String(params.fresh || "") !== "1") {
        try {
          var cached = CacheService.getScriptCache().get(CACHE_PUBLIC_KEY);
          if (cached) {
            return jsonOut({
              ok: true,
              cached: true,
              data: JSON.parse(cached)
            });
          }
        } catch (err) {
          // Proceed to sheet read
        }
      }

      var bundle = buildAndCachePublicBundle(ss);
      return jsonOut({
        ok: true,
        cached: false,
        data: bundle
      });
    }

    // 2. Privacy-Verified Order Tracking (Order ID + Phone required)
    if (action === "trackMartOrder") {
      var orderIdQuery = String(params.orderId || "").trim().toUpperCase();
      var phoneQuery = String(params.phone || "").trim();
      if (!orderIdQuery || !phoneQuery) {
        return jsonOut({
          ok: false,
          error: "Order ID and phone number are required to track an order."
        });
      }

      var ordSheet = ensureMartSheet(ss, "Mart_Orders");
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

    // 3. Dedicated Mart Enterprise Admin Bundle
    if (action === "martAdmin") {
      if (!isAuthorizedMartAdmin(token)) {
        return jsonOut({ ok: false, error: "Unauthorized Mart API token." });
      }
      var prodSheet = ensureMartSheet(ss, "Mart_Products");
      var catSheet = ensureMartSheet(ss, "Mart_Categories");
      var labelSheet = ensureMartSheet(ss, "Mart_Labels");
      var supSheet = ensureMartSheet(ss, "Mart_Suppliers");
      var ordAdminSheet = ensureMartSheet(ss, "Mart_Orders");
      var txnSheet = ensureMartSheet(ss, "Mart_Transactions");
      var crmProfSheet = ensureMartSheet(ss, "Mart_CRM_Profiles");
      var crmLogSheet = ensureMartSheet(ss, "Mart_CRM_Logs");
      var setSheet = ensureMartSheet(ss, "Mart_Settings");

      return jsonOut({
        ok: true,
        data: {
          products: readMartRows(prodSheet, "Mart_Products"),
          categories: sortTaxonomyByOrder(readMartRows(catSheet, "Mart_Categories")),
          labels: sortTaxonomyByOrder(readMartRows(labelSheet, "Mart_Labels")),
          suppliers: readMartRows(supSheet, "Mart_Suppliers"),
          orders: readMartRows(ordAdminSheet, "Mart_Orders"),
          transactions: readMartRows(txnSheet, "Mart_Transactions"),
          crmProfiles: readMartRows(crmProfSheet, "Mart_CRM_Profiles"),
          crmLogs: readMartRows(crmLogSheet, "Mart_CRM_Logs"),
          settings: mergeSettings(readSettingsMap(setSheet))
        }
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

    // Upload image straight into cached Xeetrix_Mart_Storage/(Products|Categories)
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
      var targetFolder =
        folderType === "categories" ? folders.categoriesFolder : folders.productsFolder;

      var bytes = Utilities.base64Decode(base64Data);
      var blob = Utilities.newBlob(bytes, mimeType, fileName);
      var driveFile = targetFolder.createFile(blob);
      driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var fileId = driveFile.getId();
      return jsonOut({
        ok: true,
        fileId: fileId,
        fileName: driveFile.getName(),
        url: "https://lh3.googleusercontent.com/d/" + fileId,
        driveViewUrl: "https://drive.google.com/uc?export=view&id=" + fileId,
        viewUrl: "https://drive.google.com/file/d/" + fileId + "/view"
      });
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
        payload = enrichOrderPayloadServerSide(ss, payload);
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
        } else if (col === "fulfillmentType" && !payload.fulfillmentType) {
          val = "own_stock";
        } else if (col === "collectionMode" && !payload.collectionMode) {
          val = "store_collects";
        } else if (col === "tierOverride" && !payload.tierOverride) {
          val = "auto";
        } else if (col === "lowStockThreshold" && (payload.lowStockThreshold === undefined || payload.lowStockThreshold === "")) {
          val = 5;
        } else if (col === "sortOrder" && payload.sortOrder === undefined) {
          val = 0;
        } else {
          val = payload[col] !== undefined ? payload[col] : "";
        }
        record[col] = normalizeMartCell(col, val);
      }

      // Align values dynamically to actual Row 1 headers (supports legacy + upgraded sheets cleanly)
      var actualHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
      var rowValues = [];
      for (var ah = 0; ah < actualHeaders.length; ah++) {
        var headerName = String(actualHeaders[ah] || "").trim();
        rowValues.push(record[headerName] !== undefined ? record[headerName] : "");
      }

      sheet.appendRow(rowValues);

      if (sheetName === "Mart_Orders" && payload.itemsJson) {
        decrementStockForOrder(ss, String(payload.itemsJson));
      }

      invalidateMartCache();
      return jsonOut({ ok: true, id: recordId, record: record });
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
        return jsonOut({ ok: false, error: "Record id not found: " + targetId });
      }

      var updates = body.updates || {};
      if (body.status !== undefined) updates.status = body.status;
      if (body.active !== undefined) updates.active = body.active;
      if (body.featured !== undefined) updates.featured = body.featured;

      var updateKeys = Object.keys(updates);
      for (var k = 0; k < updateKeys.length; k++) {
        var key = updateKeys[k];
        if (key === "id" || key === "createdAt") continue;
        var colIndex = rawHeaders.indexOf(key);
        if (colIndex === -1) colIndex = updHeaders.indexOf(key);
        if (colIndex !== -1) {
          updSheet
            .getRange(foundRowIndex, colIndex + 1)
            .setValue(normalizeMartCell(key, updates[key]));
        }
      }

      invalidateMartCache();
      return jsonOut({ ok: true, id: targetId, updated: true });
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
      for (var d = 0; d < delIds.length; d++) {
        if (String(delIds[d][0]) === delId) {
          delSheet.deleteRow(d + 2);
          invalidateMartCache();
          return jsonOut({ ok: true, id: delId, deleted: true });
        }
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
              settingsSheet.getRange(rowIdx + 2, 2, 1, 2).setValues([[sVal, nowIso]]);
              updatedExisting = true;
              break;
            }
          }
        }
        if (!updatedExisting) {
          settingsSheet.appendRow([sKey, sVal, nowIso]);
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
