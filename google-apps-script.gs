/**
 * SoCal Strategy & OT Workshop — sign-up collector.
 *
 * Paste this into Extensions > Apps Script from the Google Sheet that should
 * receive sign-ups, then Deploy > New deployment > Web app:
 *   Execute as:      Me
 *   Who has access:  Anyone
 * Copy the /exec URL into ENDPOINT in signup.js.
 *
 * If you edit this file later, you must publish a NEW VERSION for the change to
 * take effect: Deploy > Manage deployments > (pencil) > Version: New version.
 */

var SHEET_NAME = 'Signups';

/**
 * Leave blank when this script lives inside the target Sheet (Extensions >
 * Apps Script). Set it to the Sheet's ID only if you created a standalone
 * script at script.google.com, which has no container to attach to.
 * The ID is the long string in the Sheet URL:
 *   docs.google.com/spreadsheets/d/<THIS PART>/edit
 */
var SPREADSHEET_ID = '';

/** Secret for the ?diag= health check below. Change it whenever you like. */
var DIAG_TOKEN = 'f7374cd2412512d2';

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
    // report where the row actually landed, so a silent mis-binding is visible
    return json_({
      ok: true,
      spreadsheet: sheet.getParent().getName(),
      tab: sheet.getName(),
      rows: sheet.getLastRow()
    });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Plain GET is a liveness check. GET with ?diag=<DIAG_TOKEN> reports which
 * spreadsheet and tab this deployment is actually writing to.
 *
 * Deliberately returns no row contents — this endpoint is public, and sign-up
 * emails must not be readable by anyone who finds the URL.
 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.diag !== DIAG_TOKEN) {
    return json_({ ok: true, message: 'SoCal Strategy & OT sign-up endpoint.' });
  }
  try {
    var ss = getSpreadsheet_();
    var sheet = getSheet_();
    var tabs = ss.getSheets().map(function (s) {
      return s.getName() + ' (' + s.getLastRow() + ' rows)';
    });
    return json_({
      ok: true,
      spreadsheetName: ss.getName(),
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      writingToTab: sheet.getName(),
      rowsInThatTab: sheet.getLastRow(),
      allTabs: tabs
    });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error(
      'No container spreadsheet. This script is standalone — set ' +
      'SPREADSHEET_ID to your Sheet ID, or re-create the script from the ' +
      'Sheet via Extensions > Apps Script.'
    );
  }
  return ss;
}

function getSheet_() {
  var ss = getSpreadsheet_();
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
