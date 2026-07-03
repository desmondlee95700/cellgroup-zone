/**
 * Cell Group Mixer — Google Apps Script (v2)
 *
 * Fixes over v1:
 *  1. Greedy-dealer mixing algorithm (replaces interleave + modulo, which could
 *     put an entire cell group into the same final group).
 *  2. Configurable group count via prompt (default 5).
 *  3. Name / Cell Group columns located by header text, not hardcoded B/C.
 *  4. Dedup collisions reported instead of silently dropped.
 *  5. Explicit error if the response sheet is missing; cell group names normalized.
 */

var RESPONSE_SHEET_NAME = 'Form Responses 1';
var OUTPUT_SHEET_NAME = 'Mixed Groups';
var DEFAULT_GROUP_COUNT = 5;

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Group Mixer')
    .addItem('Generate Balanced Groups 🎲', 'generateBalancedGroups')
    .addToUi();
}

function generateBalancedGroups() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- 1. Locate response sheet (no silent fallback) ---
  var responseSheet = ss.getSheetByName(RESPONSE_SHEET_NAME);
  if (!responseSheet) {
    ui.alert('Sheet "' + RESPONSE_SHEET_NAME + '" not found. Make sure the form is linked to this spreadsheet.');
    return;
  }

  var data = responseSheet.getDataRange().getValues();
  if (data.length <= 1) {
    ui.alert('No responses yet. Wait for members to submit the form first.');
    return;
  }

  // --- 2. Find columns by header text ---
  var headers = data[0].map(function (h) { return h.toString().trim().toLowerCase(); });
  var nameCol = findColumn(headers, ['name', 'full name']);
  var cgCol = findColumn(headers, ['cell group', 'cellgroup', 'cg']);
  if (nameCol === -1 || cgCol === -1) {
    ui.alert('Could not find the "Name" and/or "Cell Group" columns in row 1 of "' +
      RESPONSE_SHEET_NAME + '". Found headers: ' + data[0].join(', '));
    return;
  }

  // --- 3. Extract + dedup (latest submission wins), tracking collisions ---
  var seenMembers = {};
  var duplicates = {};
  for (var i = 1; i < data.length; i++) {
    var rawName = data[i][nameCol];
    var rawCG = data[i][cgCol];
    if (!rawName || !rawCG) continue;

    var name = rawName.toString().trim();
    var cg = normalizeCG(rawCG);
    var key = name.toLowerCase();

    if (seenMembers[key]) duplicates[name] = (duplicates[name] || 1) + 1;
    seenMembers[key] = { name: name, cg: cg }; // newest row overwrites
  }
  var members = Object.keys(seenMembers).map(function (k) { return seenMembers[k]; });

  if (members.length < 2) {
    ui.alert('Need at least 2 unique people to form groups. Currently: ' + members.length);
    return;
  }

  // --- 4. Ask for group count (default 5, validated) ---
  var resp = ui.prompt('Group Mixer',
    'How many groups? (2–' + members.length + ', default ' + DEFAULT_GROUP_COUNT + ')',
    ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;

  var groupCount = parseInt(resp.getResponseText(), 10);
  if (isNaN(groupCount)) groupCount = DEFAULT_GROUP_COUNT;
  if (groupCount < 2 || groupCount > members.length) {
    ui.alert('Group count must be between 2 and ' + members.length + '.');
    return;
  }

  // --- 5. Mixing: greedy dealer ---
  // Bucket by cell group, shuffle within each bucket, process buckets
  // largest-first, and deal each member into the currently smallest final
  // group (random tie-break). Guarantees sizes within ±1 and maximum
  // separation of same-cell-group members for any cell group count.
  var buckets = {};
  members.forEach(function (m) {
    if (!buckets[m.cg]) buckets[m.cg] = [];
    buckets[m.cg].push(m);
  });

  var bucketList = Object.keys(buckets).map(function (cg) {
    return shuffle(buckets[cg]);
  });
  bucketList.sort(function (a, b) { return b.length - a.length; });

  var finalGroups = [];
  for (var g = 0; g < groupCount; g++) finalGroups.push([]);

  bucketList.forEach(function (bucket) {
    bucket.forEach(function (member) {
      smallestGroup(finalGroups, member.cg).push(member);
    });
  });

  // --- 6. Write output ---
  writeOutput(ss, finalGroups, groupCount);

  // --- 7. Report ---
  var msg = 'Done! ' + members.length + ' people split into ' + groupCount +
    ' groups. See the "' + OUTPUT_SHEET_NAME + '" tab.';
  var dupNames = Object.keys(duplicates);
  if (dupNames.length > 0) {
    msg += '\n\nDuplicates resolved (latest submission kept):\n' +
      dupNames.map(function (n) { return '• ' + n + ' (' + duplicates[n] + ' submissions)'; }).join('\n') +
      '\n\nIf any of these are two DIFFERENT people sharing a name, add one manually.';
  }
  ui.alert(msg);
}

// --- Helpers ---

function findColumn(headers, candidates) {
  for (var c = 0; c < candidates.length; c++) {
    var idx = headers.indexOf(candidates[c]);
    if (idx !== -1) return idx;
  }
  // Fallback: partial match (e.g. "Your Name", "Current Cell Group")
  for (var h = 0; h < headers.length; h++) {
    for (var c2 = 0; c2 < candidates.length; c2++) {
      if (headers[h].indexOf(candidates[c2]) !== -1) return h;
    }
  }
  return -1;
}

function normalizeCG(value) {
  // Trim and collapse whitespace so "Youth " and "Youth" bucket together.
  return value.toString().trim().replace(/\s+/g, ' ');
}

function shuffle(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}

function smallestGroup(groups, cg) {
  // Primary: smallest group (guarantees ±1 sizing).
  // Tie-break: fewest members from the same cell group, then random.
  var minLen = Infinity;
  groups.forEach(function (g) { if (g.length < minLen) minLen = g.length; });
  var candidates = groups.filter(function (g) { return g.length === minLen; });

  var minSameCG = Infinity;
  var counts = candidates.map(function (g) {
    var n = 0;
    g.forEach(function (m) { if (m.cg === cg) n++; });
    if (n < minSameCG) minSameCG = n;
    return n;
  });
  candidates = candidates.filter(function (g, i) { return counts[i] === minSameCG; });
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function writeOutput(ss, finalGroups, groupCount) {
  var outputSheet = ss.getSheetByName(OUTPUT_SHEET_NAME);
  if (outputSheet) { outputSheet.clear(); } else { outputSheet = ss.insertSheet(OUTPUT_SHEET_NAME); }

  var headers = [];
  var subHeaders = [];
  for (var g = 0; g < groupCount; g++) {
    headers.push('Group ' + (g + 1) + ' (' + finalGroups[g].length + ')');
    subHeaders.push('Name (Cell Group)');
  }

  var maxRows = 0;
  finalGroups.forEach(function (grp) { if (grp.length > maxRows) maxRows = grp.length; });

  var rows = [headers, subHeaders];
  for (var r = 0; r < maxRows; r++) {
    var row = [];
    for (var c = 0; c < groupCount; c++) {
      row.push(finalGroups[c][r] ? finalGroups[c][r].name + ' (' + finalGroups[c][r].cg + ')' : '');
    }
    rows.push(row);
  }

  outputSheet.getRange(1, 1, rows.length, groupCount).setValues(rows);
  outputSheet.getRange(1, 1, 1, groupCount)
    .setBackground('#4f46e5').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
  outputSheet.getRange(2, 1, 1, groupCount)
    .setBackground('#f3f4f6').setFontColor('#6b7280').setFontStyle('italic').setHorizontalAlignment('center');
  outputSheet.autoResizeColumns(1, groupCount);
}
