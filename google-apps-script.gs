/**
 * SoCal Strategy & OT Workshop — sign-up collector.
 *
 * Paste this into Extensions > Apps Script from the Google Sheet that should
 * receive sign-ups, then Deploy > New deployment > Web app:
 *   Execute as:      Me
 *   Who has access:  Anyone
 * Copy the /exec URL into ENDPOINT in signup.js.
 */

var SHEET_NAME = 'Signups';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet_();
    var p = (e && e.parameter) || {};
    sheet.appendRow([
      new Date(),
      (p.name || '').toString().slice(0, 200),
      (p.email || '').toString().slice(0, 200),
      (p.affiliation || '').toString().slice(0, 200),
      (p.source || '').toString().slice(0, 300)
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, message: 'SoCal Strategy & OT sign-up endpoint.' });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Affiliation', 'Source']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
