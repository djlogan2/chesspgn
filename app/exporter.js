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

function allVariations(movelist, cmi, moveNumber, whiteToMove) {
  if (!movelist[cmi].variations) return '';

  let string = '';
  const variations = movelist[cmi].variations.slice(1);
  const nextMoveNumber = moveNumber + (whiteToMove ? 0 : 1);
  const nextToMove = !whiteToMove;

  variations.forEach((v) => {
    string += `(${thisMove(movelist[v], moveNumber, true, whiteToMove, v)}`;
    const nextmove = nextMove(movelist, v, nextMoveNumber, nextToMove);
    if (nextmove) string += ` ${nextmove}`;
    string += ')';
  });

  return string;
}

function nextMove(movelist, cmi, moveNumber, whiteToMove) {
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
  const variations = allVariations(movelist, cmi, moveNumber, whiteToMove);
  const nextmove = nextMove(movelist, movelist[cmi].variations[0],
    nextMoveNumber, nextToMove);

  if (variations) string += ` ${variations}`;

  if (nextmove) {
    if (!!variations && whiteToMove) string += ` ${nextMoveNumber}. ...`;
    string += ` ${nextmove}`;
  }

  return string;
}

function buildPgnFromMovelist(movelist) {
  let longString = nextMove(movelist, 0, 1, true);
  let reformatted = '';
  while (longString.length > 255) {
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

function exportPGN(tags, movelist, textresult) {
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

  pgn += buildPgnFromMovelist(movelist);
  if (pgn) pgn += '\n';
  if (textresult) pgn += `{${textresult}}\n`;
  if (tags && tags.Result) pgn += tags.Result;
  else pgn += '*';
  return pgn;
}

module.exports = exportPGN;
