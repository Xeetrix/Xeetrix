/**
 * Xeetrix Ecosystem & Xeetrix Mart — Google Apps Script Backend (backend/Code.gs)
 *
 * Zero-cost REST API backed by Google Sheets (9 tabs) & Google Drive.
 * Deploy as Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Optional Security:
 *   In Apps Script Project Settings -> Script Properties, you may set:
 *   - ADMIN_API_TOKEN : shared secret required for admin mutations & admin endpoints
 *   - DRIVE_ROOT_FOLDER_NAME : defaults to "Xeetrix_Assets"
 */

var SHEET_SCHEMA = {
  // === Xeetrix Mart (Standalone E-Commerce Module) ===
  Mart_Products: [
    "id",
    "sku",
    "slug",
    "name",
    "nameEn",
    "nameBn",
    "category",
    "categories",
    "labels",
    "tags",
    "attributesJson",
    "price",
    "comparePrice",
    "stock",
    "variants",
    "variantGroupsJson",
    "variantMatrixJson",
    "specsJson",
    "imageUrl",
    "galleryUrls",
    "description",
    "descEn",
    "descBn",
    "featured",
    "active",
    "sortOrder",
    "createdAt"
  ],
  Mart_Categories: [
    "id",
    "name",
    "nameEn",
    "nameBn",
    "slug",
    "parentSlug",
    "skuCode",
    "description",
    "descEn",
    "descBn",
    "imageUrl",
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
  Mart_Settings: ["key", "value", "updatedAt"],

  // === Xeetrix Holding & Travels ===
  Travel_Routes: [
    "id",
    "originCode",
    "originCity",
    "destinationCode",
    "destinationCity",
    "airline",
    "tripCategory",
    "baggageAllowance",
    "startingFareBDT",
    "duration",
    "active",
    "createdAt"
  ],
  Travel_Bookings: [
    "id",
    "tripType",
    "serviceCategory",
    "origin",
    "destination",
    "departureDate",
    "returnDate",
    "passengers",
    "cabinClass",
    "customerName",
    "phone",
    "email",
    "notes",
    "status",
    "createdAt"
  ],
  Investor_Leads: [
    "id",
    "investorName",
    "organization",
    "email",
    "phone",
    "capitalTier",
    "message",
    "status",
    "createdAt"
  ],
  Corporate_Inquiries: [
    "id",
    "fullName",
    "organization",
    "email",
    "phone",
    "subject",
    "message",
    "status",
    "createdAt"
  ],
  Site_Settings: ["key", "value", "updatedAt"]
};

var PUBLIC_CREATE_SHEETS = [
  "Mart_Orders",
  "Travel_Bookings",
  "Investor_Leads",
  "Corporate_Inquiries"
];

var DEFAULT_SITE_SETTINGS = {
  pitchDeckUrl: "",
  kpiVentures: "3",
  kpiClientsServed: "54,000+",
  kpiGlobalRoutes: "120+",
  kpiAnnualGrowth: "42%"
};

var DEFAULT_MART_SETTINGS = {
  heroTitle: "Everyday Essentials & Authentic Electronics",
  heroSubtitle:
    "Verified quality products delivered nationwide across Bangladesh with transparent BDT pricing and flexible Cash on Delivery.",
  heroCtaText: "Shop Collection",
  promoText: "Nationwide Delivery · Cash on Delivery & Mobile Banking Available",
  insideDhakaCharge: "70",
  outsideDhakaCharge: "130",
  mobileBankingNumber: ""
};

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getAdminTokenConfig() {
  try {
    return PropertiesService.getScriptProperties().getProperty("ADMIN_API_TOKEN") || "";
  } catch (err) {
    return "";
  }
}

function isAuthorizedAdmin(providedToken) {
  var configured = getAdminTokenConfig();
  if (!configured) {
    return true;
  }
  return String(providedToken || "") === String(configured);
}

function ensureSheetWithHeaders(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  var headers = SHEET_SCHEMA[sheetName];
  if (!headers) {
    throw new Error("Unknown sheet tab: " + sheetName);
  }
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sheet;
}

/**
 * Run this function once in the Apps Script Editor to initialize all 9 tabs,
 * Row 1 headers, and default Site_Settings & Mart_Settings rows.
 */
function setupXeetrixWorkbook() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabNames = Object.keys(SHEET_SCHEMA);
  for (var i = 0; i < tabNames.length; i++) {
    ensureSheetWithHeaders(ss, tabNames[i]);
  }

  var now = new Date().toISOString();

  var siteSettingsSheet = ss.getSheetByName("Site_Settings");
  var existingSite = readKeyValMap(siteSettingsSheet);
  var siteKeys = Object.keys(DEFAULT_SITE_SETTINGS);
  for (var j = 0; j < siteKeys.length; j++) {
    var sk = siteKeys[j];
    if (existingSite[sk] === undefined) {
      siteSettingsSheet.appendRow([sk, DEFAULT_SITE_SETTINGS[sk], now]);
    }
  }

  var martSettingsSheet = ss.getSheetByName("Mart_Settings");
  var existingMart = readKeyValMap(martSettingsSheet);
  var martKeys = Object.keys(DEFAULT_MART_SETTINGS);
  for (var m = 0; m < martKeys.length; m++) {
    var mk = martKeys[m];
    if (existingMart[mk] === undefined) {
      martSettingsSheet.appendRow([mk, DEFAULT_MART_SETTINGS[mk], now]);
    }
  }

  return "Xeetrix 9-tab workbook initialized successfully.";
}

function normalizeCellValue(header, val) {
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
    header === "totalAmount" ||
    header === "startingFareBDT" ||
    header === "passengers"
  ) {
    var num = Number(val);
    return isNaN(num) ? 0 : num;
  }
  return val === null || val === undefined ? "" : val;
}

function readSheetRows(sheet, sheetName) {
  var lastRow = sheet.getLastRow();
  var headers = SHEET_SCHEMA[sheetName];
  if (!sheet || lastRow <= 1) {
    return [];
  }
  var numCols = Math.max(headers.length, sheet.getLastColumn());
  var rawHeaders = sheet.getRange(1, 1, 1, numCols).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();

  // Map header positions dynamically so minor column reordering never breaks reads
  var headerIndexMap = {};
  for (var colIdx = 0; colIdx < rawHeaders.length; colIdx++) {
    var colName = String(rawHeaders[colIdx] || "").trim();
    if (colName) {
      headerIndexMap[colName] = colIdx;
    }
  }

  var rows = [];
  for (var r = 0; r < values.length; r++) {
    var row = values[r];
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
      var mappedIdx = headerIndexMap[header];
      var cellVal = mappedIdx !== undefined ? row[mappedIdx] : row[h];
      obj[header] = normalizeCellValue(header, cellVal);
    }
    rows.push(obj);
  }
  return rows.reverse();
}

function readKeyValMap(sheet) {
  var map = {};
  if (!sheet || sheet.getLastRow() <= 1) {
    return map;
  }
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  for (var i = 0; i < values.length; i++) {
    var k = String(values[i][0] || "").trim();
    if (k) {
      map[k] = String(values[i][1] !== undefined && values[i][1] !== null ? values[i][1] : "");
    }
  }
  return map;
}

function mergeWithDefaults(defaults, actual) {
  var merged = {};
  var defKeys = Object.keys(defaults);
  for (var i = 0; i < defKeys.length; i++) {
    var dk = defKeys[i];
    merged[dk] = actual[dk] !== undefined && actual[dk] !== "" ? actual[dk] : defaults[dk];
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

function generateRecordId(sheetName) {
  var prefixMap = {
    Mart_Products: "PRD",
    Mart_Categories: "CAT",
    Mart_Orders: "XM",
    Travel_Routes: "RTE",
    Travel_Bookings: "TRV",
    Investor_Leads: "INV",
    Corporate_Inquiries: "CRP"
  };
  var prefix = prefixMap[sheetName] || "XTX";
  var stamp = new Date().getTime().toString().slice(-6);
  var rand = Math.floor(100 + Math.random() * 900);
  return prefix + "-" + stamp + "-" + rand;
}

function normalizePhoneDigits(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function phonesMatch(phoneA, phoneB) {
  var a = normalizePhoneDigits(phoneA);
  var b = normalizePhoneDigits(phoneB);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 8 && b.length >= 8) {
    return a.slice(-8) === b.slice(-8);
  }
  return false;
}

function decrementMartProductStock(ss, itemsJsonStr) {
  try {
    var items = JSON.parse(itemsJsonStr || "[]");
    if (!Array.isArray(items) || items.length === 0) return;

    var prodSheet = ensureSheetWithHeaders(ss, "Mart_Products");
    var lastRow = prodSheet.getLastRow();
    if (lastRow <= 1) return;

    var headers = prodSheet.getRange(1, 1, 1, prodSheet.getLastColumn()).getValues()[0];
    var idCol = headers.indexOf("id") + 1;
    var stockCol = headers.indexOf("stock") + 1;
    if (idCol < 1 || stockCol < 1) return;

    var idValues = prodSheet.getRange(2, idCol, lastRow - 1, 1).getValues();
    var stockValues = prodSheet.getRange(2, stockCol, lastRow - 1, 1).getValues();

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var pid = String(item.productId || "");
      var qty = Math.max(0, Number(item.quantity) || 0);
      if (!pid || qty <= 0) continue;

      for (var r = 0; r < idValues.length; r++) {
        if (String(idValues[r][0]) === pid) {
          var currentStock = Number(stockValues[r][0]) || 0;
          var nextStock = Math.max(0, currentStock - qty);
          prodSheet.getRange(r + 2, stockCol).setValue(nextStock);
          stockValues[r][0] = nextStock;
          break;
        }
      }
    }
  } catch (err) {
    // Non-fatal: never block order creation if stock sync encounters legacy formatting
  }
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = String(params.action || "all");
    var token = params.token || "";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Public Mart Storefront Data
    if (action === "martPublic") {
      var mProdSheet = ensureSheetWithHeaders(ss, "Mart_Products");
      var mCatSheet = ensureSheetWithHeaders(ss, "Mart_Categories");
      var mSetSheet = ensureSheetWithHeaders(ss, "Mart_Settings");

      var allMartProds = readSheetRows(mProdSheet, "Mart_Products");
      var activeMartProds = allMartProds.filter(function (p) {
        return p.active === true;
      });

      var allMartCats = readSheetRows(mCatSheet, "Mart_Categories");
      var activeMartCats = allMartCats.filter(function (c) {
        return c.active === true;
      });

      var martSettings = mergeWithDefaults(DEFAULT_MART_SETTINGS, readKeyValMap(mSetSheet));

      return jsonResponse({
        ok: true,
        data: {
          products: activeMartProds,
          categories: activeMartCats,
          settings: martSettings
        }
      });
    }

    // 2. Public Mart Order Tracking (Requires Order ID + Phone)
    if (action === "trackMartOrder") {
      var orderIdQuery = String(params.orderId || "").trim().toUpperCase();
      var phoneQuery = String(params.phone || "").trim();
      if (!orderIdQuery || !phoneQuery) {
        return jsonResponse({
          ok: false,
          error: "Order ID and phone number are required to track an order."
        });
      }

      var ordSheet = ensureSheetWithHeaders(ss, "Mart_Orders");
      var allOrders = readSheetRows(ordSheet, "Mart_Orders");
      for (var o = 0; o < allOrders.length; o++) {
        var ord = allOrders[o];
        if (
          String(ord.id || "").trim().toUpperCase() === orderIdQuery &&
          phonesMatch(ord.phone, phoneQuery)
        ) {
          return jsonResponse({
            ok: true,
            order: {
              id: ord.id,
              itemsJson: ord.itemsJson,
              itemsSummary: ord.itemsSummary,
              totalItems: ord.totalItems,
              subtotal: ord.subtotal,
              deliveryArea: ord.deliveryArea,
              deliveryCharge: ord.deliveryCharge,
              totalAmount: ord.totalAmount,
              customerName: ord.customerName,
              phone: ord.phone,
              address: ord.address,
              paymentMethod: ord.paymentMethod,
              transactionId: ord.transactionId,
              notes: ord.notes,
              status: ord.status,
              createdAt: ord.createdAt
            }
          });
        }
      }

      return jsonResponse({
        ok: false,
        error: "No matching order found. Please verify your Order ID and phone number."
      });
    }

    // 3. Dedicated Mart Admin Data
    if (action === "martAdmin") {
      if (!isAuthorizedAdmin(token)) {
        return jsonResponse({ ok: false, error: "Unauthorized admin API token." });
      }
      var admProdSheet = ensureSheetWithHeaders(ss, "Mart_Products");
      var admCatSheet = ensureSheetWithHeaders(ss, "Mart_Categories");
      var admOrdSheet = ensureSheetWithHeaders(ss, "Mart_Orders");
      var admSetSheet = ensureSheetWithHeaders(ss, "Mart_Settings");

      return jsonResponse({
        ok: true,
        data: {
          products: readSheetRows(admProdSheet, "Mart_Products"),
          categories: readSheetRows(admCatSheet, "Mart_Categories"),
          orders: readSheetRows(admOrdSheet, "Mart_Orders"),
          settings: mergeWithDefaults(DEFAULT_MART_SETTINGS, readKeyValMap(admSetSheet))
        }
      });
    }

    // 4. Holding & Travels Admin Data
    if (action === "adminData") {
      if (!isAuthorizedAdmin(token)) {
        return jsonResponse({ ok: false, error: "Unauthorized admin API token." });
      }
      var routesSheet = ensureSheetWithHeaders(ss, "Travel_Routes");
      var bookingsSheet = ensureSheetWithHeaders(ss, "Travel_Bookings");
      var leadsSheet = ensureSheetWithHeaders(ss, "Investor_Leads");
      var corpSheet = ensureSheetWithHeaders(ss, "Corporate_Inquiries");
      var settingsSheet = ensureSheetWithHeaders(ss, "Site_Settings");

      return jsonResponse({
        ok: true,
        data: {
          travelRoutes: readSheetRows(routesSheet, "Travel_Routes"),
          travelBookings: readSheetRows(bookingsSheet, "Travel_Bookings"),
          investorLeads: readSheetRows(leadsSheet, "Investor_Leads"),
          corporateInquiries: readSheetRows(corpSheet, "Corporate_Inquiries"),
          siteSettings: mergeWithDefaults(DEFAULT_SITE_SETTINGS, readKeyValMap(settingsSheet))
        }
      });
    }

    // 5. Default Holding Public Bundle: action === "all"
    var pubRoutesSheet = ensureSheetWithHeaders(ss, "Travel_Routes");
    var pubSettingsSheet = ensureSheetWithHeaders(ss, "Site_Settings");

    var allRoutes = readSheetRows(pubRoutesSheet, "Travel_Routes");
    var activeRoutes = allRoutes.filter(function (r) {
      return r.active === true;
    });

    return jsonResponse({
      ok: true,
      data: {
        travelRoutes: activeRoutes,
        siteSettings: mergeWithDefaults(DEFAULT_SITE_SETTINGS, readKeyValMap(pubSettingsSheet))
      }
    });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function upsertKeyValueSheet(sheet, incomingMap) {
  var nowIso = new Date().toISOString();
  var keysToUpdate = Object.keys(incomingMap);
  for (var u = 0; u < keysToUpdate.length; u++) {
    var settingKey = keysToUpdate[u];
    var settingVal = String(incomingMap[settingKey] !== undefined ? incomingMap[settingKey] : "");
    var sLastRow = sheet.getLastRow();
    var updatedExisting = false;

    if (sLastRow > 1) {
      var existingKeys = sheet.getRange(2, 1, sLastRow - 1, 1).getValues();
      for (var rowIdx = 0; rowIdx < existingKeys.length; rowIdx++) {
        if (String(existingKeys[rowIdx][0]) === settingKey) {
          sheet.getRange(rowIdx + 2, 2, 1, 2).setValues([[settingVal, nowIso]]);
          updatedExisting = true;
          break;
        }
      }
    }
    if (!updatedExisting) {
      sheet.appendRow([settingKey, settingVal, nowIso]);
    }
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "Empty POST payload." });
    }

    var body = JSON.parse(e.postData.contents);
    var action = String(body.action || "");
    var token = body.token || "";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "createRecord") {
      var sheetName = String(body.sheet || "");
      var headers = SHEET_SCHEMA[sheetName];
      if (!headers || sheetName === "Site_Settings" || sheetName === "Mart_Settings") {
        return jsonResponse({ ok: false, error: "Invalid target sheet for createRecord." });
      }
      var isPublicSheet = PUBLIC_CREATE_SHEETS.indexOf(sheetName) !== -1;
      if (!isPublicSheet && !isAuthorizedAdmin(token)) {
        return jsonResponse({ ok: false, error: "Unauthorized admin API token." });
      }

      var sheet = ensureSheetWithHeaders(ss, sheetName);
      var payload = body.data || {};
      var now = new Date().toISOString();
      var recordId = payload.id ? String(payload.id) : generateRecordId(sheetName);

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
        val = normalizeCellValue(col, val);
        record[col] = val;
        rowValues.push(val);
      }

      sheet.appendRow(rowValues);

      if (sheetName === "Mart_Orders" && payload.itemsJson) {
        decrementMartProductStock(ss, String(payload.itemsJson));
      }

      return jsonResponse({ ok: true, id: recordId, record: record });
    }

    if (action === "updateStatus" || action === "updateRecord") {
      if (!isAuthorizedAdmin(token)) {
        return jsonResponse({ ok: false, error: "Unauthorized admin API token." });
      }
      var updSheetName = String(body.sheet || "");
      var updHeaders = SHEET_SCHEMA[updSheetName];
      if (!updHeaders) {
        return jsonResponse({ ok: false, error: "Invalid sheet tab." });
      }
      var targetId = String(body.id || "");
      if (!targetId) {
        return jsonResponse({ ok: false, error: "Record id is required." });
      }

      var updSheet = ensureSheetWithHeaders(ss, updSheetName);
      var lastRow = updSheet.getLastRow();
      if (lastRow <= 1) {
        return jsonResponse({ ok: false, error: "Record not found." });
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
        return jsonResponse({ ok: false, error: "Record id not found: " + targetId });
      }

      var updates = body.updates || {};
      if (body.status !== undefined) {
        updates.status = body.status;
      }
      if (body.active !== undefined) {
        updates.active = body.active;
      }
      if (body.featured !== undefined) {
        updates.featured = body.featured;
      }

      var updateKeys = Object.keys(updates);
      for (var k = 0; k < updateKeys.length; k++) {
        var key = updateKeys[k];
        if (key === "id" || key === "createdAt") continue;
        var colIndex = rawHeaders.indexOf(key);
        if (colIndex === -1) {
          colIndex = updHeaders.indexOf(key);
        }
        if (colIndex !== -1) {
          updSheet
            .getRange(foundRowIndex, colIndex + 1)
            .setValue(normalizeCellValue(key, updates[key]));
        }
      }

      return jsonResponse({ ok: true, id: targetId, updated: true });
    }

    if (action === "deleteRecord") {
      if (!isAuthorizedAdmin(token)) {
        return jsonResponse({ ok: false, error: "Unauthorized admin API token." });
      }
      var delSheetName = String(body.sheet || "");
      if (!SHEET_SCHEMA[delSheetName]) {
        return jsonResponse({ ok: false, error: "Invalid sheet tab." });
      }
      var delId = String(body.id || "");
      if (!delId) {
        return jsonResponse({ ok: false, error: "Record id is required." });
      }

      var delSheet = ensureSheetWithHeaders(ss, delSheetName);
      var delLastRow = delSheet.getLastRow();
      if (delLastRow <= 1) {
        return jsonResponse({ ok: false, error: "Record not found." });
      }

      var delIds = delSheet.getRange(2, 1, delLastRow - 1, 1).getValues();
      for (var d = 0; d < delIds.length; d++) {
        if (String(delIds[d][0]) === delId) {
          delSheet.deleteRow(d + 2);
          return jsonResponse({ ok: true, id: delId, deleted: true });
        }
      }
      return jsonResponse({ ok: false, error: "Record id not found: " + delId });
    }

    if (action === "uploadFile") {
      if (!isAuthorizedAdmin(token)) {
        return jsonResponse({ ok: false, error: "Unauthorized admin API token." });
      }
      var fileName = String(body.fileName || "asset_" + new Date().getTime());
      var mimeType = String(body.mimeType || "application/octet-stream");
      var base64Data = String(body.base64Data || "");
      var folderType = String(body.folderType || "products");

      if (!base64Data) {
        return jsonResponse({ ok: false, error: "Missing base64Data for upload." });
      }

      var commaIdx = base64Data.indexOf(",");
      if (commaIdx !== -1) {
        base64Data = base64Data.substring(commaIdx + 1);
      }

      var rootName =
        PropertiesService.getScriptProperties().getProperty("DRIVE_ROOT_FOLDER_NAME") ||
        "Xeetrix_Assets";
      var rootIter = DriveApp.getFoldersByName(rootName);
      var rootFolder = rootIter.hasNext() ? rootIter.next() : DriveApp.createFolder(rootName);

      var subName =
        folderType === "pitch_decks"
          ? "Investor_Pitch_Decks"
          : folderType === "categories"
          ? "Mart_Categories"
          : "Mart_Products";
      var subIter = rootFolder.getFoldersByName(subName);
      var targetFolder = subIter.hasNext() ? subIter.next() : rootFolder.createFolder(subName);

      var bytes = Utilities.base64Decode(base64Data);
      var blob = Utilities.newBlob(bytes, mimeType, fileName);
      var driveFile = targetFolder.createFile(blob);
      driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var fileId = driveFile.getId();
      var isImage = mimeType.indexOf("image/") === 0;
      var directUrl = isImage
        ? "https://lh3.googleusercontent.com/d/" + fileId
        : "https://drive.google.com/uc?export=download&id=" + fileId;

      return jsonResponse({
        ok: true,
        fileId: fileId,
        fileName: driveFile.getName(),
        url: directUrl,
        driveViewUrl: "https://drive.google.com/uc?export=view&id=" + fileId,
        viewUrl: "https://drive.google.com/file/d/" + fileId + "/view"
      });
    }

    if (action === "updateSetting") {
      if (!isAuthorizedAdmin(token)) {
        return jsonResponse({ ok: false, error: "Unauthorized admin API token." });
      }
      var settingsSheet = ensureSheetWithHeaders(ss, "Site_Settings");
      var incomingMap = body.settings || {};
      if (body.key) {
        incomingMap[String(body.key)] = body.value !== undefined ? String(body.value) : "";
      }
      upsertKeyValueSheet(settingsSheet, incomingMap);
      return jsonResponse({
        ok: true,
        settings: mergeWithDefaults(DEFAULT_SITE_SETTINGS, readKeyValMap(settingsSheet))
      });
    }

    if (action === "updateMartSettings") {
      if (!isAuthorizedAdmin(token)) {
        return jsonResponse({ ok: false, error: "Unauthorized admin API token." });
      }
      var martSettingsSheet = ensureSheetWithHeaders(ss, "Mart_Settings");
      var incomingMartMap = body.settings || {};
      if (body.key) {
        incomingMartMap[String(body.key)] = body.value !== undefined ? String(body.value) : "";
      }
      upsertKeyValueSheet(martSettingsSheet, incomingMartMap);
      return jsonResponse({
        ok: true,
        settings: mergeWithDefaults(DEFAULT_MART_SETTINGS, readKeyValMap(martSettingsSheet))
      });
    }

    return jsonResponse({ ok: false, error: "Unsupported POST action: " + action });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}
