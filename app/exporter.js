function thisMove(node, moveNumber, writeMovNumber, whiteToMove) {
  let string = '';
  let prefix = '';

  if (writeMovNumber || whiteToMove) {
    prefix = `${moveNumber}. `;
    if (!whiteToMove) prefix += '... ';
  }
  string = prefix + node.move;

  if (node.nag) string += ` ${node.nag}`;
  if (node.comment) string += ` {${node.comment}}`;

  return string;
}

function allVariations(movelist, cmi, moveNumber, whiteToMove, maxvariations) {
  if (!movelist[cmi].variations) return '';

  let string = '';
  const variations = movelist[cmi].variations.slice(1);
  const nextMoveNumber = moveNumber + (whiteToMove ? 0 : 1);
  const nextToMove = !whiteToMove;

  for (let vv = 0;
    (maxvariations === undefined || vv < maxvariations) && vv < variations.length;
    vv += 1) {
    const v = variations[vv];
    string += `(${thisMove(movelist[v], moveNumber, true, whiteToMove, v)}`;
    // eslint-disable-next-line no-use-before-define
    let mv;
    if (maxvariations !== undefined) mv = maxvariations - 1;
    const nextmove = nextMove(movelist, v, nextMoveNumber, nextToMove, mv);
    if (nextmove) string += ` ${nextmove}`;
    string += ')';
  }

  return string;
}

function nextMove(movelist, cmi, moveNumber, whiteToMove, maxvariations) {
  if (!movelist || !Array.isArray(movelist) || !movelist.length || !movelist[cmi].variations) return '';

  const nextMoveNumber = moveNumber + (whiteToMove ? 0 : 1);
  const nextToMove = !whiteToMove;

  let string = thisMove(
    movelist[movelist[cmi].variations[0]],
    moveNumber,
    false,
    whiteToMove,
    movelist[cmi].variations[0],
  );
  // let mv;
  // if (!Number.isNaN(maxvariations)) mv = maxvariations - 1;
  const variations = allVariations(movelist, cmi, moveNumber, whiteToMove, maxvariations);
  const nextmove = nextMove(movelist, movelist[cmi].variations[0],
    nextMoveNumber, nextToMove, maxvariations);

  if (variations) string += ` ${variations}`;

  if (nextmove) {
    if (!!variations && whiteToMove) string += ` ${nextMoveNumber}. ...`;
    string += ` ${nextmove}`;
  }

  return string;
}

function buildPgnFromMovelist(movelist, linelength, maxvariations) {
  const ll = linelength || 255;
  let longString = nextMove(movelist, 0, 1, true, maxvariations);
  let reformatted = '';
  while (ll > 0 && longString.length > ll) {
    longString = longString.trimStart();
    const idx1 = longString.lastIndexOf(' ', 255);
    const idx2 = longString.indexOf('\n'); // May be in a comment. Also we just want the first one!
    const idx3 = longString.lastIndexOf('\t', 255); // May be in a comment
    const idxmax = Math.max(idx1, idx2, idx3);
    const idx = Math.min(
      idx1 === -1 ? idxmax : idx1,
      idx2 === -1 ? idxmax : idx2,
      idx3 === -1 ? idxmax : idx3,
    );
    reformatted += `${longString.substr(0, idx).trim()}\n`;
    longString = longString.substring(idx).trim();
  }
  reformatted += longString;
  return reformatted;
}

function exportPGN(tags, movelist, _config) {
  const config = _config || {};
  let pgn = '';
  const sevenTags = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result'];
  sevenTags.forEach((tag) => {
    if (tags?.[tag]) pgn += `[${tag} "${tags[tag]}"]\n`;
    else if (tag === 'Date') {
      pgn += '[Date "????.??.??"]\n';
    } else if (tag === 'Result') {
      pgn += '[Result "*"]\n';
    } else {
      pgn += `[${tag} "?"]\n`;
    }
  });

  for (const tag in tags) {
    if (sevenTags.indexOf(tag) === -1) pgn += `[${tag} "${tags[tag]}"]\n`;
  }

  if (!!movelist && movelist.length > 1) pgn += '\n';

  pgn += buildPgnFromMovelist(movelist, config.linelength, config.maxvariations);
  if (pgn) pgn += '\n';
  if (config.textresult) pgn += `{${config.textresult}}\n`;
  if (tags && tags.Result) pgn += tags.Result;
  else pgn += '*';
  return pgn;
}

module.exports = exportPGN;
