/**
 * Flag duplicates by email — writes status to column AA (27).
 * Assumes: column A = Timestamp, column C = Email, column P = Source, row 1 = header.
 *
 * Logic:
 * - If an email appears in both 'interest-form' and 'subscriber' rows:
 *     KEEP the interest-form row (most recent if multiple)
 *     Flag subscriber row(s) as DUPLICATE (subscriber - safe to delete)
 *     Flag older interest-form rows as DUPLICATE (older interest form)
 * - If an email appears only in one source type:
 *     KEEP most recent, flag older as DUPLICATE (older)
 */

const FLAG_COL = 27; // column AA
const SOURCE_COL_IDX = 15; // column P (0-indexed in row array)

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Tools')
    .addItem('Flag email duplicates', 'flagEmailDuplicates')
    .addItem('Clear duplicate flags', 'clearDuplicateFlags')
    .addToUi();
}

function flagEmailDuplicates() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    ui.alert('No data rows.');
    return;
  }

  // Read through column P (source) — 16 columns.
  const data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();

  // Group rows by email.
  const rowsByEmail = {};
  data.forEach((row, i) => {
    const sheetRow = i + 2;
    const email = String(row[2] || '').trim().toLowerCase();
    if (!email) return;

    const timestamp = row[0];
    const source = String(row[SOURCE_COL_IDX] || '').trim().toLowerCase();

    if (!rowsByEmail[email]) rowsByEmail[email] = [];
    rowsByEmail[email].push({ sheetRow, timestamp, source });
  });

  // Decide flag for each row.
  const flagByRow = {};
  Object.values(rowsByEmail).forEach(entries => {
    if (entries.length < 2) return; // no duplicates

    const interestRows = entries.filter(e => e.source === 'interest-form');
    const subscriberRows = entries.filter(e => e.source === 'subscriber');

    if (interestRows.length > 0 && subscriberRows.length > 0) {
      // Mixed: keep most recent interest-form, flag subscriber(s) + older interest-form(s).
      interestRows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      flagByRow[interestRows[0].sheetRow] = 'KEEP (interest form)';
      for (let i = 1; i < interestRows.length; i++) {
        flagByRow[interestRows[i].sheetRow] = 'DUPLICATE (older interest form)';
      }
      subscriberRows.forEach(r => {
        flagByRow[r.sheetRow] = 'DUPLICATE (subscriber - safe to delete)';
      });
    } else {
      // Same source type: keep most recent.
      entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      flagByRow[entries[0].sheetRow] = 'KEEP (most recent)';
      for (let i = 1; i < entries.length; i++) {
        flagByRow[entries[i].sheetRow] = 'DUPLICATE (older)';
      }
    }
  });

  // Build flag column array.
  const flags = data.map((row, i) => {
    const sheetRow = i + 2;
    return [flagByRow[sheetRow] || ''];
  });

  sheet.getRange(2, FLAG_COL, flags.length, 1).setValues(flags);

  const counts = {
    keep: 0,
    olderInterest: 0,
    subscriber: 0,
    older: 0,
  };
  Object.values(flagByRow).forEach(f => {
    if (f.startsWith('KEEP')) counts.keep++;
    else if (f === 'DUPLICATE (older interest form)') counts.olderInterest++;
    else if (f === 'DUPLICATE (subscriber - safe to delete)') counts.subscriber++;
    else if (f === 'DUPLICATE (older)') counts.older++;
  });

  ui.alert(
    'Dedup scan complete',
    `Flagged in column AA:\n` +
      `• ${counts.subscriber} subscriber row(s) to delete\n` +
      `• ${counts.olderInterest} older interest form row(s)\n` +
      `• ${counts.older} older same-source row(s)\n` +
      `• ${counts.keep} row(s) marked KEEP\n\n` +
      `Review and delete manually.`,
    ui.ButtonSet.OK
  );
}

function clearDuplicateFlags() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  sheet.getRange(2, FLAG_COL, lastRow - 1, 1).clearContent();
}
