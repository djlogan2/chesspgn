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
    chai.assert.equal(pgn, '[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4\n*');
  });
  it('should write one branch correctly', () => {
    const movelist = makemoves('e4', 'e5', 'Nc3', 'Nc6');
    const pgn = exporter({}, movelist);
    chai.assert.equal(pgn, '[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 e5 2. Nc3 Nc6\n*');
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
        + '1. e4 e5 2. Nf3 (2. d4 exd4) 2. ... Nc6\n*');
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
        + '1. e4 e5 2. Nf3 (2. d4 exd4 (2. ... d5 3. Be2)) 2. ... Nc6\n*');
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
        + '1. e4 e5 2. Nf3 (2. d4 exd4 (2. ... d5 3. Be2 (3. Nc3 Be7))) 2. ... Nc6\n*');
  });
  it('should write the {result}, an extra new line, and no leading spaces (basically some not really bug fixes per se, but improvements)', () => {
    const shouldequal = '[Event "ICC tourney 1876 (15 10)"]\n'
        + '[Site "Internet Chess Club"]\n'
        + '[Date "2020.06.14"]\n'
        + '[Round "1"]\n'
        + '[White "costikchess123"]\n'
        + '[Black "Jeffchess"]\n'
        + '[Result "0-1"]\n'
        + '[WhiteElo "1336"]\n'
        + '[BlackElo "1564"]\n'
        + '[Opening "Caro-Kann defense"]\n'
        + '[ECO "B12"]\n'
        + '[NIC "CK.01"]\n'
        + '[Time "12:21:50"]\n'
        + '[TimeControl "900+10"]\n'
        + '\n'
        + '1. e4 c6 2. d4 e6 3. Nc3 a6 4. Bd3 Be7 5. Nf3 h6 6. O-O d5 7. e5 Bd7 8. h3 b5 9. a3 a5 10. Bd2 a4 11. b3 c5 12. Bxb5 cxd4 13. Nxd4 axb3 14. cxb3 Rxa3 15. Rxa3 Bxa3 16. Bxd7+ Qxd7 17. Ncb5 Bc5 18. b4 Bxd4 19. Nxd4 Ne7 20. Re1 Nec6 21. Bc3 O-O 22. Re3 Qc7\n'
        + '23. Nxc6 Nxc6 24. b5 Ne7 25. Rg3 Rd8 26. Bd2 Nf5 27. Rc3 Qxe5 28. b6 d4 29. Rb3 Ne7 30. g3 Nc6 31. Bf4 Qd5 32. b7 Nb8 33. Qc2 e5 34. Bxe5 Qxe5 35. Qd2 Qd5 36. Qc2 d3 37. Qd1 d2 38. Rc3 Qxb7\n'
        + '{White resigns}\n'
        + '0-1';
    const tags = {
      Event: 'ICC tourney 1876 (15 10)',
      Site: 'Internet Chess Club',
      Date: '2020.06.14',
      Round: 1,
      White: 'costikchess123',
      Black: 'Jeffchess',
      Result: '0-1',
      WhiteElo: 1336,
      BlackElo: 1564,
      Opening: 'Caro-Kann defense',
      ECO: 'B12',
      NIC: 'CK.01',
      Time: '12:21:50',
      TimeControl: '900+10',
    };
    const movelist = [
      { variations: [1] },
      { move: 'e4', prev: 0, variations: [2] },
      { move: 'c6', prev: 0, variations: [3] },
      { move: 'd4', prev: 0, variations: [4] },
      { move: 'e6', prev: 0, variations: [5] },
      { move: 'Nc3', prev: 0, variations: [6] },
      { move: 'a6', prev: 0, variations: [7] },
      { move: 'Bd3', prev: 0, variations: [8] },
      { move: 'Be7', prev: 0, variations: [9] },
      { move: 'Nf3', prev: 0, variations: [10] },
      { move: 'h6', prev: 0, variations: [11] },
      { move: 'O-O', prev: 0, variations: [12] },
      { move: 'd5', prev: 0, variations: [13] },
      { move: 'e5', prev: 0, variations: [14] },
      { move: 'Bd7', prev: 0, variations: [15] },
      { move: 'h3', prev: 0, variations: [16] },
      { move: 'b5', prev: 0, variations: [17] },
      { move: 'a3', prev: 0, variations: [18] },
      { move: 'a5', prev: 0, variations: [19] },
      { move: 'Bd2', prev: 0, variations: [20] },
      { move: 'a4', prev: 0, variations: [21] },
      { move: 'b3', prev: 0, variations: [22] },
      { move: 'c5', prev: 0, variations: [23] },
      { move: 'Bxb5', prev: 0, variations: [24] },
      { move: 'cxd4', prev: 0, variations: [25] },
      { move: 'Nxd4', prev: 0, variations: [26] },
      { move: 'axb3', prev: 0, variations: [27] },
      { move: 'cxb3', prev: 0, variations: [28] },
      { move: 'Rxa3', prev: 0, variations: [29] },
      { move: 'Rxa3', prev: 0, variations: [30] },
      { move: 'Bxa3', prev: 0, variations: [31] },
      { move: 'Bxd7+', prev: 0, variations: [32] },
      { move: 'Qxd7', prev: 0, variations: [33] },
      { move: 'Ncb5', prev: 0, variations: [34] },
      { move: 'Bc5', prev: 0, variations: [35] },
      { move: 'b4', prev: 0, variations: [36] },
      { move: 'Bxd4', prev: 0, variations: [37] },
      { move: 'Nxd4', prev: 0, variations: [38] },
      { move: 'Ne7', prev: 0, variations: [39] },
      { move: 'Re1', prev: 0, variations: [40] },
      { move: 'Nec6', prev: 0, variations: [41] },
      { move: 'Bc3', prev: 0, variations: [42] },
      { move: 'O-O', prev: 0, variations: [43] },
      { move: 'Re3', prev: 0, variations: [44] },
      { move: 'Qc7', prev: 0, variations: [45] },
      { move: 'Nxc6', prev: 0, variations: [46] },
      { move: 'Nxc6', prev: 0, variations: [47] },
      { move: 'b5', prev: 0, variations: [48] },
      { move: 'Ne7', prev: 0, variations: [49] },
      { move: 'Rg3', prev: 0, variations: [50] },
      { move: 'Rd8', prev: 0, variations: [51] },
      { move: 'Bd2', prev: 0, variations: [52] },
      { move: 'Nf5', prev: 0, variations: [53] },
      { move: 'Rc3', prev: 0, variations: [54] },
      { move: 'Qxe5', prev: 0, variations: [55] },
      { move: 'b6', prev: 0, variations: [56] },
      { move: 'd4', prev: 0, variations: [57] },
      { move: 'Rb3', prev: 0, variations: [58] },
      { move: 'Ne7', prev: 0, variations: [59] },
      { move: 'g3', prev: 0, variations: [60] },
      { move: 'Nc6', prev: 0, variations: [61] },
      { move: 'Bf4', prev: 0, variations: [62] },
      { move: 'Qd5', prev: 0, variations: [63] },
      { move: 'b7', prev: 0, variations: [64] },
      { move: 'Nb8', prev: 0, variations: [65] },
      { move: 'Qc2', prev: 0, variations: [66] },
      { move: 'e5', prev: 0, variations: [67] },
      { move: 'Bxe5', prev: 0, variations: [68] },
      { move: 'Qxe5', prev: 0, variations: [69] },
      { move: 'Qd2', prev: 0, variations: [70] },
      { move: 'Qd5', prev: 0, variations: [71] },
      { move: 'Qc2', prev: 0, variations: [72] },
      { move: 'd3', prev: 0, variations: [73] },
      { move: 'Qd1', prev: 0, variations: [74] },
      { move: 'd2', prev: 0, variations: [75] },
      { move: 'Rc3', prev: 0, variations: [76] },
      { move: 'Qxb7', prev: 0 },
    ];
    const pgn = exporter(tags, movelist, { textresult: 'White resigns' });
    chai.assert.equal(pgn, shouldequal);
  });

  it('should honor maxvariations 0 on output pgn', () => {
    const movelist = makemoves('e4', 'e5', 'Nf3', 'Nc6', 2, 'd4', 'exd4', 1, 'd5', 'Be2', 1, 'Nc3', 'Be7');
    const pgn = exporter(null, movelist, { maxvariations: 0 });
    chai.assert.equal(pgn, '[Event "?"]\n'
          + '[Site "?"]\n'
          + '[Date "????.??.??"]\n'
          + '[Round "?"]\n'
          + '[White "?"]\n'
          + '[Black "?"]\n'
          + '[Result "*"]\n'
          + '\n'
          + '1. e4 e5 2. Nf3 Nc6\n*');
  });
  it('should honor maxvariations 1 correctly', () => {
    const movelist = makemoves('e4', 'e5', 'Nf3', 'Nc6', 2, 'd4', 'exd4', 1, 'd5', 'Be2', 1, 'Nc3', 'Be7');
    const pgn = exporter(null, movelist, { maxvariations: 1 });
    chai.assert.equal(pgn, '[Event "?"]\n'
        + '[Site "?"]\n'
        + '[Date "????.??.??"]\n'
        + '[Round "?"]\n'
        + '[White "?"]\n'
        + '[Black "?"]\n'
        + '[Result "*"]\n'
        + '\n'
        + '1. e4 e5 2. Nf3 (2. d4 exd4) 2. ... Nc6\n*');
  });
  it('should honor maxvariations 2 correctly', () => {
    const movelist = makemoves('e4', 'e5', 'Nf3', 'Nc6', 2, 'd4', 'exd4', 1, 'd5', 'Be2', 1, 'Nc3', 'Be7');
    const pgn = exporter(null, movelist, { maxvariations: 2 });
    chai.assert.equal(pgn, '[Event "?"]\n'
        + '[Site "?"]\n'
        + '[Date "????.??.??"]\n'
        + '[Round "?"]\n'
        + '[White "?"]\n'
        + '[Black "?"]\n'
        + '[Result "*"]\n'
        + '\n'
        + '1. e4 e5 2. Nf3 (2. d4 exd4 (2. ... d5 3. Be2)) 2. ... Nc6\n*');
  });
  it('should write move only when told to write moves only', () => {
    const movelist = makemoves('e4', 'e5', 'Nf3', 'Nc6', 2, 'd4', 'exd4', 1, 'd5', 'Be2', 1, 'Nc3', 'Be7');
    const pgn = exporter(null, movelist, { movesonly: true, maxvariations: 2 });
    chai.assert.equal(pgn, '1. e4 e5 2. Nf3 (2. d4 exd4 (2. ... d5 3. Be2)) 2. ... Nc6');
  });
  it('should not write tags when told to not write tags', () => {
    const movelist = makemoves('e4', 'e5', 'Nf3', 'Nc6', 2, 'd4', 'exd4', 1, 'd5', 'Be2', 1, 'Nc3', 'Be7');
    const pgn = exporter(null, movelist, { writetags: false, maxvariations: 2, textresult: 'Black Rocks' });
    chai.assert.equal(pgn, '1. e4 e5 2. Nf3 (2. d4 exd4 (2. ... d5 3. Be2)) 2. ... Nc6\n{Black Rocks}\n*');
  });
  it('should honor the linelength config key', () => {
    const movelist = makemoves('e4', 'e5', 'Nf3', 'Nc6', 2, 'd4', 'exd4', 1, 'd5', 'Be2', 1, 'Nc3', 'Be7');
    const pgn = exporter(null, movelist, { movesonly: true, maxvariations: 2, linelength: 20 });
    chai.assert.equal(pgn, '1. e4 e5 2. Nf3 (2.\nd4 exd4 (2. ... d5\n3. Be2)) 2. ... Nc6');
  });
});
