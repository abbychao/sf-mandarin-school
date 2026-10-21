/**
 * Permanent Location Survey handler (reference copy; live version is in the Apps Script project).
 * Lives in its own file in the project, like the other helper scripts. Functions are shared across files.
 *
 * SETUP
 * 1. In Apps Script, click + next to Files -> Script, name it "Location survey", and paste this whole file.
 * 2. In the main file (the one with doPost), make two small edits:
 *
 *    a) Pin the main tab by name (first line of doPost) so adding tabs can never change where
 *       interest-form rows land:
 *
 *         var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
 *
 *    b) Right after the honeypot check and before the "Follow-up skills submission" block, add:
 *
 *         // Permanent location survey
 *         if (data.type === 'location_survey') return handleLocationSurvey(data);
 *
 * 3. Redeploy: Deploy -> Manage deployments -> Edit -> New version -> Deploy.
 *
 * The "Permanent Location Survey" tab is created on first submission. One row per response.
 * Join to the interest list by email (column B here = column C on the main sheet).
 */
function handleLocationSurvey(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Permanent Location Survey');
  if (!sheet) {
    sheet = ss.insertSheet('Permanent Location Survey');
    var headers = ['Timestamp', 'Email', 'Name', 'Address', 'Phone',
      'Child 1 Name', 'Child 1 DOB', 'Child 2 Name', 'Child 2 DOB', 'Child 3 Name', 'Child 3 DOB', 'Child 4 Name', 'Child 4 DOB',
      'Family Type', 'Travel Mode', 'Max One-Way Trip'];
    for (var d = 1; d <= 11; d++) headers.push('D' + d);
    headers.push('Comment', 'UTM Source', 'Already on Interest List?');
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  // Is this email already on the interest list (main sheet, column C)?
  var onList = '';
  var main = ss.getSheetByName('Sheet1');
  var emails = main.getRange(2, 3, Math.max(main.getLastRow() - 1, 1), 1).getValues();
  var target = String(data.email || '').trim().toLowerCase();
  for (var i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).trim().toLowerCase() === target) { onList = 'Yes'; break; }
  }
  if (!onList) onList = 'No';

  var row = [new Date(), data.email, data.name, data.address, data.phone,
    data.child1_name, data.child1_dob, data.child2_name, data.child2_dob, data.child3_name, data.child3_dob, data.child4_name, data.child4_dob,
    data.family_type, data.travel_mode, data.max_trip];
  for (var n = 1; n <= 11; n++) row.push(data['d' + n]);
  row.push(data.comment, data.utm_source, onList);
  sheet.appendRow(row);

  return ContentService.createTextOutput(JSON.stringify({ result: 'success' })).setMimeType(ContentService.MimeType.JSON);
}
