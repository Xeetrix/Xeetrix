/**
 * Xeetrix Mart — Standalone E-Commerce Google Apps Script Backend (backend/mart/Code.gs)
 *
 * Designed to be attached directly inside a dedicated "Xeetrix Mart Database" Google Sheet.
 *
 * FIRST-TIME ONE-CLICK SETUP:
 *   1. Open your Google Sheet -> Extensions -> Apps Script -> paste this file -> Save.
 *   2. Select "setupMartBackend" in the top function dropdown and click Run.
 *   3. Authorize Google Sheets & Google Drive access.
 *      This single run automatically creates:
 *        - 4 Tabs with bold frozen Row 1 headers:
 *          Mart_Products, Mart_Categories, Mart_Orders, Mart_Settings (ZERO dummy items)
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
    "name",
    "category",
    "price",
    "comparePrice",
    "stock",
    "variants",
    "imageUrl",
    "description",
    "featured",
    "active",
    "createdAt"
  ],
  Mart_Categories: [
    "id",
    "name",
    "slug",
    "description",
    "imageUrl",
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
  Mart_Settings: ["key", "value", "updatedAt"]
};

var MART_DEFAULT_SETTINGS = {
  heroTitle: "Everyday Essentials & Authentic Electronics",
  heroSubtitle:
    "Verified quality products delivered nationwide across Bangladesh with transparent BDT pricing and flexible Cash on Delivery.",
  heroCtaText: "Shop Collection",
  promoText: "Nationwide Delivery · Cash on Delivery & Mobile Banking Available",
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

var CACHE_PUBLIC_KEY = "xeetrix_mart_public_v1";
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
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0B5336");
    headerRange.setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
    for (var c = 1; c <= headers.length; c++) {
      sheet.setColumnWidth(c, 150);
    }
  }
  return sheet;
}

/**
 * ONE-CLICK INITIALIZER:
 * Run this once inside your bound Google Sheet's Apps Script Editor.
 * Sets up all 4 Mart sheets + headers, baseline Mart_Settings, Drive folders,
 * and pre-warms CacheService (with ZERO dummy products, categories, or orders).
 */
function setupMartBackend() {
  var ss = getBoundSpreadsheet();
  var tabNames = Object.keys(MART_SCHEMA);
  for (var i = 0; i < tabNames.length; i++) {
    ensureMartSheet(ss, tabNames[i]);
  }

  // Seed ONLY store configuration keys (no dummy products, categories, or orders)
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
    "Xeetrix Mart backend ready! Sheet: " +
    ss.getName() +
    " | Drive Folder: " +
    folders.rootFolder.getName() +
    " (Products ID: " +
    folders.productsFolder.getId() +
    ", Categories ID: " +
    folders.categoriesFolder.getId() +
    ")"
  );
}

function invalidateMartCache() {
  try {
    CacheService.getScriptCache().remove(CACHE_PUBLIC_KEY);
  } catch (err) {
    // Ignore cache eviction error
  }
}

function normalizeMartCell(header, val) {
  if (header === "active" || header === "featured") {
    if (typeof val === "boolean") return val;
    var s = String(val).toLowerCase().trim();
    return s === "true" || s === "1" || s === "yes";
  }
  if (
    header === "price" ||
    header === "comparePrice" ||
    header === "stock" ||
    header === "totalItems" ||
    header === "subtotal" ||
    header === "deliveryCharge" ||
    header === "totalAmount"
  ) {
    var num = Number(val);
    return isNaN(num) ? 0 : num;
  }
  return val === null || val === undefined ? "" : val;
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
      var cellVal = idx !== undefined ? row[idx] : row[h];
      obj[header] = normalizeMartCell(header, cellVal);
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
  var actKeys = Object.keys(actual);
  for (var j = 0; j < actKeys.length; j++) {
    var ak = actKeys[j];
    if (actual[ak] !== undefined) {
      merged[ak] = actual[ak];
    }
  }
  return merged;
}

function buildAndCachePublicBundle(ss) {
  var prodSheet = ensureMartSheet(ss, "Mart_Products");
  var catSheet = ensureMartSheet(ss, "Mart_Categories");
  var setSheet = ensureMartSheet(ss, "Mart_Settings");

  var activeProducts = readMartRows(prodSheet, "Mart_Products").filter(function (p) {
    return p.active === true;
  });
  var activeCategories = readMartRows(catSheet, "Mart_Categories").filter(function (c) {
    return c.active === true;
  });
  var settings = mergeSettings(readSettingsMap(setSheet));

  var payload = {
    products: activeProducts,
    categories: activeCategories,
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
    Mart_Orders: "XM"
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
    if (idCol < 1 || stockCol < 1) return;

    var idVals = prodSheet.getRange(2, idCol, lastRow - 1, 1).getValues();
    var stockVals = prodSheet.getRange(2, stockCol, lastRow - 1, 1).getValues();

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var pid = String(item.productId || "");
      var qty = Math.max(0, Number(item.quantity) || 0);
      if (!pid || qty <= 0) continue;

      for (var r = 0; r < idVals.length; r++) {
        if (String(idVals[r][0]) === pid) {
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
        service: "Xeetrix Mart Standalone Backend",
        spreadsheetName: ss.getName(),
        driveRootFolder: folders.rootFolder.getName()
      });
    }

    // 1. Public Storefront Bundle (Hot CacheService path)
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

    // 3. Dedicated Mart Admin Bundle
    if (action === "martAdmin") {
      if (!isAuthorizedMartAdmin(token)) {
        return jsonOut({ ok: false, error: "Unauthorized Mart API token." });
      }
      var prodSheet = ensureMartSheet(ss, "Mart_Products");
      var catSheet = ensureMartSheet(ss, "Mart_Categories");
      var ordAdminSheet = ensureMartSheet(ss, "Mart_Orders");
      var setSheet = ensureMartSheet(ss, "Mart_Settings");

      return jsonOut({
        ok: true,
        data: {
          products: readMartRows(prodSheet, "Mart_Products"),
          categories: readMartRows(catSheet, "Mart_Categories"),
          orders: readMartRows(ordAdminSheet, "Mart_Orders"),
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
      var now = new Date().toISOString();
      var recordId = payload.id ? String(payload.id) : generateMartId(sheetName);

      var record = {};
      var rowValues = [];
      for (var i = 0; i < headers.length; i++) {
        var col = headers[i];
        var val;
        if (col === "id") {
          val = recordId;
        } else if (col === "createdAt") {
          val = payload.createdAt || now;
        } else if (col === "status" && (payload.status === undefined || payload.status === "")) {
          val = "Pending";
        } else if (col === "active" && payload.active === undefined) {
          val = true;
        } else if (col === "featured" && payload.featured === undefined) {
          val = false;
        } else {
          val = payload[col] !== undefined ? payload[col] : "";
        }
        val = normalizeMartCell(col, val);
        record[col] = val;
        rowValues.push(val);
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
      var ids = updSheet.getRange(2, 1, lastRow - 1, 1).getValues();
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

      var delIds = delSheet.getRange(2, 1, delLastRow - 1, 1).getValues();
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
