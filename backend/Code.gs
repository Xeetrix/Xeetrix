/**
 * Xeetrix Holding Group — Google Apps Script Backend (backend/Code.gs)
 *
 * Zero-cost REST API backed by Google Sheets (7 tabs) & Google Drive.
 * Deploy as Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Optional Security:
 *   In Apps Script Project Settings -> Script Properties, you may set:
 *   - ADMIN_API_TOKEN : shared secret required for admin mutations & adminData
 *   - DRIVE_ROOT_FOLDER_NAME : defaults to "Xeetrix_Assets"
 */

var SHEET_SCHEMA = {
  Mart_Products: [
    "id",
    "name",
    "category",
    "price",
    "comparePrice",
    "stock",
    "imageUrl",
    "description",
    "active",
    "createdAt"
  ],
  Mart_Orders: [
    "id",
    "productId",
    "productName",
    "quantity",
    "unitPrice",
    "totalAmount",
    "customerName",
    "phone",
    "address",
    "notes",
    "status",
    "createdAt"
  ],
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

var DEFAULT_SETTINGS = {
  pitchDeckUrl: "",
  kpiVentures: "3",
  kpiClientsServed: "54,000+",
  kpiGlobalRoutes: "120+",
  kpiAnnualGrowth: "42%"
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
 * Run this function once in the Apps Script Editor to initialize all 7 tabs,
 * headers, and baseline Site_Settings rows.
 */
function setupXeetrixWorkbook() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabNames = Object.keys(SHEET_SCHEMA);
  for (var i = 0; i < tabNames.length; i++) {
    ensureSheetWithHeaders(ss, tabNames[i]);
  }
  var settingsSheet = ss.getSheetByName("Site_Settings");
  var existing = readSettingsMap(settingsSheet);
  var now = new Date().toISOString();
  var keys = Object.keys(DEFAULT_SETTINGS);
  for (var j = 0; j < keys.length; j++) {
    var k = keys[j];
    if (existing[k] === undefined) {
      settingsSheet.appendRow([k, DEFAULT_SETTINGS[k], now]);
    }
  }
  return "Xeetrix 7-tab workbook initialized.";
}

function normalizeCellValue(header, val) {
  if (header === "active") {
    if (typeof val === "boolean") return val;
    var s = String(val).toLowerCase().trim();
    return s === "true" || s === "1" || s === "yes";
  }
  if (
    header === "price" ||
    header === "comparePrice" ||
    header === "stock" ||
    header === "quantity" ||
    header === "unitPrice" ||
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
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var rows = [];
  for (var r = 0; r < values.length; r++) {
    var row = values[r];
    // Skip completely empty rows
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
      obj[header] = normalizeCellValue(header, row[h]);
    }
    rows.push(obj);
  }
  // Return newest first
  return rows.reverse();
}

function readSettingsMap(sheet) {
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

function generateRecordId(sheetName) {
  var prefixMap = {
    Mart_Products: "PRD",
    Mart_Orders: "ORD",
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

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = String(params.action || "all");
    var token = params.token || "";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "adminData") {
      if (!isAuthorizedAdmin(token)) {
        return jsonResponse({ ok: false, error: "Unauthorized admin API token." });
      }
      var productsSheet = ensureSheetWithHeaders(ss, "Mart_Products");
      var ordersSheet = ensureSheetWithHeaders(ss, "Mart_Orders");
      var routesSheet = ensureSheetWithHeaders(ss, "Travel_Routes");
      var bookingsSheet = ensureSheetWithHeaders(ss, "Travel_Bookings");
      var leadsSheet = ensureSheetWithHeaders(ss, "Investor_Leads");
      var corpSheet = ensureSheetWithHeaders(ss, "Corporate_Inquiries");
      var settingsSheet = ensureSheetWithHeaders(ss, "Site_Settings");

      var settings = readSettingsMap(settingsSheet);
      var mergedSettings = {};
      var defKeys = Object.keys(DEFAULT_SETTINGS);
      for (var i = 0; i < defKeys.length; i++) {
        mergedSettings[defKeys[i]] =
          settings[defKeys[i]] !== undefined ? settings[defKeys[i]] : DEFAULT_SETTINGS[defKeys[i]];
      }
      var customKeys = Object.keys(settings);
      for (var j = 0; j < customKeys.length; j++) {
        mergedSettings[customKeys[j]] = settings[customKeys[j]];
      }

      return jsonResponse({
        ok: true,
        data: {
          martProducts: readSheetRows(productsSheet, "Mart_Products"),
          martOrders: readSheetRows(ordersSheet, "Mart_Orders"),
          travelRoutes: readSheetRows(routesSheet, "Travel_Routes"),
          travelBookings: readSheetRows(bookingsSheet, "Travel_Bookings"),
          investorLeads: readSheetRows(leadsSheet, "Investor_Leads"),
          corporateInquiries: readSheetRows(corpSheet, "Corporate_Inquiries"),
          siteSettings: mergedSettings
        }
      });
    }

    // Default public bundle: action === "all"
    var pubProductsSheet = ensureSheetWithHeaders(ss, "Mart_Products");
    var pubRoutesSheet = ensureSheetWithHeaders(ss, "Travel_Routes");
    var pubSettingsSheet = ensureSheetWithHeaders(ss, "Site_Settings");

    var allProducts = readSheetRows(pubProductsSheet, "Mart_Products");
    var activeProducts = [];
    for (var p = 0; p < allProducts.length; p++) {
      if (allProducts[p].active === true) {
        activeProducts.push(allProducts[p]);
      }
    }

    var allRoutes = readSheetRows(pubRoutesSheet, "Travel_Routes");
    var activeRoutes = [];
    for (var r = 0; r < allRoutes.length; r++) {
      if (allRoutes[r].active === true) {
        activeRoutes.push(allRoutes[r]);
      }
    }

    var pubSettings = readSettingsMap(pubSettingsSheet);
    var mergedPubSettings = {};
    var pubDefKeys = Object.keys(DEFAULT_SETTINGS);
    for (var k = 0; k < pubDefKeys.length; k++) {
      mergedPubSettings[pubDefKeys[k]] =
        pubSettings[pubDefKeys[k]] !== undefined
          ? pubSettings[pubDefKeys[k]]
          : DEFAULT_SETTINGS[pubDefKeys[k]];
    }

    return jsonResponse({
      ok: true,
      data: {
        martProducts: activeProducts,
        travelRoutes: activeRoutes,
        siteSettings: mergedPubSettings
      }
    });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
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
      if (!headers || sheetName === "Site_Settings") {
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
        } else {
          val = payload[col] !== undefined ? payload[col] : "";
        }
        val = normalizeCellValue(col, val);
        record[col] = val;
        rowValues.push(val);
      }

      sheet.appendRow(rowValues);
      return jsonResponse({ ok: true, id: recordId, record: record });
    }

    if (action === "updateStatus") {
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

      var updateKeys = Object.keys(updates);
      for (var k = 0; k < updateKeys.length; k++) {
        var key = updateKeys[k];
        var colIndex = updHeaders.indexOf(key);
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

      // Strip data URL prefix if present
      var commaIdx = base64Data.indexOf(",");
      if (commaIdx !== -1) {
        base64Data = base64Data.substring(commaIdx + 1);
      }

      var rootName =
        PropertiesService.getScriptProperties().getProperty("DRIVE_ROOT_FOLDER_NAME") ||
        "Xeetrix_Assets";
      var rootIter = DriveApp.getFoldersByName(rootName);
      var rootFolder = rootIter.hasNext() ? rootIter.next() : DriveApp.createFolder(rootName);

      var subName = folderType === "pitch_decks" ? "Investor_Pitch_Decks" : "Mart_Products";
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

      var nowIso = new Date().toISOString();
      var keysToUpdate = Object.keys(incomingMap);
      for (var u = 0; u < keysToUpdate.length; u++) {
        var settingKey = keysToUpdate[u];
        var settingVal = String(incomingMap[settingKey] !== undefined ? incomingMap[settingKey] : "");
        var sLastRow = settingsSheet.getLastRow();
        var updatedExisting = false;

        if (sLastRow > 1) {
          var existingKeys = settingsSheet.getRange(2, 1, sLastRow - 1, 1).getValues();
          for (var rowIdx = 0; rowIdx < existingKeys.length; rowIdx++) {
            if (String(existingKeys[rowIdx][0]) === settingKey) {
              settingsSheet.getRange(rowIdx + 2, 2, 1, 2).setValues([[settingVal, nowIso]]);
              updatedExisting = true;
              break;
            }
          }
        }
        if (!updatedExisting) {
          settingsSheet.appendRow([settingKey, settingVal, nowIso]);
        }
      }

      return jsonResponse({
        ok: true,
        settings: readSettingsMap(settingsSheet)
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
