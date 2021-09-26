const chai = require('chai');
const exporter = require('../app/exporter');

describe('PGN exports', () => {
  function makemoves() {
    const movelist = [{ variations: [] }];
    let cmi = 0;
    for (let x = 0; x < arguments.length; x++) {
      const move = arguments[x];
      // for(move in arguments) {
      // arguments.forEach((move) => {
      const num = parseInt(move, 10);
      const newcmi = movelist.length;
      if (Number.isNaN(num)) {
        if (!Array.isArray(movelist[cmi].variations)) {
          movelist[cmi].variations = [newcmi];
        } else {
          movelist[cmi].variations.push(newcmi);
        }
        movelist.push({ prev: cmi, move });
        cmi = newcmi;
      } else {
        for (let x = 0; cmi !== 0 && x < num; x++) {
          cmi = movelist[cmi].prev;
        }
      }
    }
    return movelist;
  }

  it('should write the seven tag roster correctly', () => {
    const pgn = exporter({
      Date: 'date',
      Site: 'site',
      Round: 'round',
      White: 'white',
      Random: 'tag',
      Result: 'result',
      Event: 'event',
      Black: 'black',
    }, []);
    // ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result']
    chai.assert.equal(pgn, '[Event "event"]\n[Site "site"]\n[Date "date"]\n[Round "round"]\n[White "white"]\n[Black "black"]\n[Result "result"]\n[Random "tag"]\n\nresult');
  });
  it('should write extra tags after seven tag roster', () => { /* done above */ });
  it('should have a new line and an asterisk when there is no result', () => {
    const pgn = exporter({
      Date: 'date',
      Site: 'site',
      Round: 'round',
      White: 'white',
      Random: 'tag',
      Event: 'event',
      Black: 'black',
    }, []);
    chai.assert.equal(pgn, '[Event "event"]\n[Site "site"]\n[Date "date"]\n[Round "round"]\n[White "white"]\n[Black "black"]\n[Result "*"]\n[Random "tag"]\n\n*');
  });
  it('should write the standard seven tag roster if there are no tags', () => {
    const movelist = makemoves('e4');
    const pgn = exporter({}, movelist);
    chai.assert.equal(pgn, '[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 *');
  });
  it('should write one branch correctly', () => {
    const movelist = makemoves('e4', 'e5', 'Nc3', 'Nc6');
    const pgn = exporter({}, movelist);
    chai.assert.equal(pgn, '[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 e5 2. Nc3 Nc6 *');
  });
  it('should write two branches correctly', () => {
    const movelist = makemoves('e4', 'e5', 'Nf3', 'Nc6', 2, 'd4', 'exd4');
    const pgn = exporter(null, movelist);
    chai.assert.equal(pgn, '[Event "?"]\n'
        + '[Site "?"]\n'
        + '[Date "????.??.??"]\n'
        + '[Round "?"]\n'
        + '[White "?"]\n'
        + '[Black "?"]\n'
        + '[Result "*"]\n'
        + '\n'
        + '1. e4 e5 2. Nf3 (2. d4 exd4) 2. ... Nc6 *');
  });
  it('should write three branches correctly', () => {
    const movelist = makemoves('e4', 'e5', 'Nf3', 'Nc6', 2, 'd4', 'exd4', 1, 'd5', 'Be2');
    const pgn = exporter(null, movelist);
    chai.assert.equal(pgn, '[Event "?"]\n'
        + '[Site "?"]\n'
        + '[Date "????.??.??"]\n'
        + '[Round "?"]\n'
        + '[White "?"]\n'
        + '[Black "?"]\n'
        + '[Result "*"]\n'
        + '\n'
        + '1. e4 e5 2. Nf3 (2. d4 exd4 (2. ... d5 3. Be2)) 2. ... Nc6 *');
  });
  it('should write four branches correctly', () => {
    const movelist = makemoves('e4', 'e5', 'Nf3', 'Nc6', 2, 'd4', 'exd4', 1, 'd5', 'Be2', 1, 'Nc3', 'Be7');
    const pgn = exporter(null, movelist);
    chai.assert.equal(pgn, '[Event "?"]\n'
        + '[Site "?"]\n'
        + '[Date "????.??.??"]\n'
        + '[Round "?"]\n'
        + '[White "?"]\n'
        + '[Black "?"]\n'
        + '[Result "*"]\n'
        + '\n'
        + '1. e4 e5 2. Nf3 (2. d4 exd4 (2. ... d5 3. Be2 (3. Nc3 Be7))) 2. ... Nc6 *');
  });
});
