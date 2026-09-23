/**
 * Appends landing-page leads to this spreadsheet.
 *
 * Paste into Extensions -> Apps Script on the leads sheet, set SECRET below to the
 * same value as GOOGLE_SHEETS_WEBAPP_TOKEN in the site's environment, then
 * Deploy -> New deployment -> Web app, "Execute as: Me", "Who has access: Anyone".
 * Copy the /exec URL into GOOGLE_SHEETS_WEBAPP_URL.
 *
 * The spreadsheet stays private: the script runs as its owner, and only this script
 * is reachable from the web.
 */
var SECRET = 'CHANGE_ME';
var TAB = 'Leads';

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (SECRET && body.token !== SECRET) return json({ ok: false, error: 'bad token' });
    if (!body.row || !body.row.length) return json({ ok: false, error: 'empty row' });

    var book = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = book.getSheetByName(TAB) || book.insertSheet(TAB);

    // Write the header row once, so a fresh sheet is readable without any setup.
    if (sheet.getLastRow() === 0 && body.headers) {
      sheet.appendRow(body.headers);
      sheet.getRange(1, 1, 1, body.headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(body.row);
    return json({ ok: true, row: sheet.getLastRow() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
