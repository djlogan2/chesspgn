const chai = require('chai');
const { Readable } = require('stream');
const Importer = require('../app/importer');

const pgn = '[Event "?"]\n'
    + '[Site "?"]\n'
    + '[Date "????.??.??"]\n'
    + '[Round "?"]\n'
    + '[White "?"]\n'
    + '[Black "?"]\n'
    + '[Result "*"]\n'
    + '\n'
    + '1. e4 e5 \n'
    + '    (1. ... d5 2. exd5)\n'
    + '    (1. ... c5 2. d4)\n'
    + '    (1. ... Nc6 2. Nc3)\n'
    + '2. Nf3 *'
    + '\n';

const pgn1 = '[Event "ICC 5 0 u"]\n'
    + '[Site "Internet Chess Club"]\n'
    + '[Date "2019.10.13"]\n'
    + '[Round "-"]\n'
    + '[White "uiuxtest1"]\n'
    + '[Black "uiuxtest2"]\n'
    + '[Result "*"]\n'
    + '[ICCResult "Game adjourned when White disconnected"]\n'
    + '[WhiteElo "1400"]\n'
    + '[BlackElo "1400"]\n'
    + '[Opening "Two knights defense"]\n'
    + '[ECO "C55"]\n'
    + '[NIC "IG.01"]\n'
    + '[Time "13:08:42"]\n'
    + '[TimeControl "300+0"]\n'
    + '\n'
    + '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. c3 d5 5. exd5 Nxd5 6. Qb3 Be6 7. O-O Be7\n'
    + '8. d3 O-O 9. Re1 {Game adjourned when White disconnected} *\n'
    + '\n'
    + '[Event "ICC 5 0 u"]\n'
    + '[Site "Internet Chess Club"]\n'
    + '[Date "2019.10.13"]\n'
    + '[Round "-"]\n'
    + '[White "uiuxtest1"]\n'
    + '[Black "uiuxtest2"]\n'
    + '[Result "*"]\n'
    + '[ICCResult "Game adjourned when White disconnected"]\n'
    + '[WhiteElo "1400"]\n'
    + '[BlackElo "1400"]\n'
    + '[Opening "Two knights defense"]\n'
    + '[ECO "C55"]\n'
    + '[NIC "IG.01"]\n'
    + '[Time "13:08:42"]\n'
    + '[TimeControl "300+0"]\n'
    + '\n'
    + '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. c3 d5 5. exd5 Nxd5 6. Qb3 Be6 7. O-O Be7\n'
    + '8. d3 O-O 9. Re1 {Game adjourned when White disconnected} *';

const pgn2 = '[Event "Waldshut Sen\\Nes"]\n'
    + '[Site "Waldshut Sen\\Nes"]\n'
    + '[Date "1991.??.??"]\n'
    + '[Round "1"]\n'
    + '[White "Nadenau, Oskar"]\n'
    + '[Black "Seiter, G"]\n'
    + '[Result "1-0"]\n'
    + '[ECO "A30d"]\n'
    + '[EventDate "1991.??.??"]\n'
    + '\n'
    + '1. c4 c5 2. Nf3 Nf6 3. g3 g6 4. Bg2 Bg7 5. O-O d6 6. d4 cxd4 7. Nxd4 O-O \n'
    + '8. Nc3 Qc7 9. b3 Bd7 10. Bb2 Nc6 11. Nc2 a6 12. e4 Rad8 13. Ne3 e6 14. Qd2\n'
    + 'Ne7 15. Rac1 Bc6 16. Rfd1 Rd7 17. Qc2 Rc8 18. Qe2 Qd8 19. h3 d5 20. cxd5 \n'
    + 'exd5 21. Ncxd5 Nfxd5 22. exd5 Bb5 23. Rxc8 Qxc8 24. Qd2 Bxb2 25. Qxb2 Rd6 \n'
    + '26. Ng4 Nf5 27. Nf6+ Kf8 28. Nxh7+ Kg8 29. Nf6+ Kf8 30. Ne4 Rd8 31. Qh8+ \n'
    + 'Ke7 32. Qf6+ Kd7 33. Qxf7+ 1-0';

const pgn3 = '[Event "Waldshut Sen\\Nes"]\n'
    + '[Site "Waldshut Sen\\Nes"]\n'
    + '[Date "1991.??.??"]\n'
    + '[Round "1"]\n'
    + '[White "Nadenau, Oskar"]\n'
    + '[Black "Seiter, G"]\n'
    + '[Result "1-0"]\n'
    + '[ECO "A30d"]\n'
    + '[EventDate "1991.??.??"]\n'
    + '\n'
    + '[Event "Waldshut Sen\\Nes"]\n'
    + '[Site "Waldshut Sen\\Nes"]\n'
    + '[Date "1991.??.??"]\n'
    + '[Round "1"]\n'
    + '[White "Nadenau, Oskar"]\n'
    + '[Black "Seiter, G"]\n'
    + '[Result "1-0"]\n'
    + '[ECO "A30d"]\n'
    + '[EventDate "1991.??.??"]\n'
    + '\n'
    + '[Event "Waldshut Sen\\Nes"]\n'
    + '[Site "Waldshut Sen\\Nes"]\n'
    + '[Date "1991.??.??"]\n'
    + '[Round "1"]\n'
    + '[White "Nadenau, Oskar"]\n'
    + '[Black "Seiter, G"]\n'
    + '[Result "1-0"]\n'
    + '[ECO "A30d"]\n'
    + '[EventDate "1991.??.??"]\n'
    + '\n';

const pgn4 = '[Event "Waldshut Sen\\Nes"]\n'
    + '[Site "Waldshut Sen\\Nes"]\n'
    + '[Date "1991.??.??"]\n'
    + '[Round "1"]\n'
    + '[White "Nadenau, Oskar"]\n'
    + '[Black "Seiter, G"]\n'
    + '[Result "1-0"]\n'
    + '[ECO "A30d"]\n'
    + '[EventDate "1991.??.??"]\n'
    + '\n*\n'
    + '[Event "Waldshut Sen\\Nes"]\n'
    + '[Site "Waldshut Sen\\Nes"]\n'
    + '[Date "1991.??.??"]\n'
    + '[Round "1"]\n'
    + '[White "Nadenau, Oskar"]\n'
    + '[Black "Seiter, G"]\n'
    + '[Result "1-0"]\n'
    + '[ECO "A30d"]\n'
    + '[EventDate "1991.??.??"]\n'
    + '\n*\n'
    + '[Event "Waldshut Sen\\Nes"]\n'
    + '[Site "Waldshut Sen\\Nes"]\n'
    + '[Date "1991.??.??"]\n'
    + '[Round "1"]\n'
    + '[White "Nadenau, Oskar"]\n'
    + '[Black "Seiter, G"]\n'
    + '[Result "1-0"]\n'
    + '[ECO "A30d"]\n'
    + '[EventDate "1991.??.??"]\n'
    + '\n*';
module.exports = [pgn, pgn1, pgn2, pgn3, pgn4];

describe('PGN Import', () => {
  const valid = [
    '',
    '[a "b"] *',
    '[a "b"]\n*',
    '[a\n"b"]\n*',
    '[a\r\n"b"]\n*',
    '[a\r\n"b"]\r\n*',
    '[a\r\n"b"]\r\n*\n',
    '[a\r\n"b"]\r\n*\r\n',
    '[a\t"b"]\r\n*\r\n',
    '[a\t"b"]\t*\r\n',
    '[a\t"b"]\t*\t',
    '[a\t\n"b"]\r\n*\r\n',
    '[a\t\r\n"b"]\t*\r\n',
    '[a "b"] 1-0',
    '[a "b"] 0-1',
    '[a "b"] 1/2-1/2',
    '[a "b"] 1. e4 1-0',
    '[a "b"] 1. e4 0-1',
    '[a "b"] 1. e4 1/2-1/2',
    '[a "b"] 1.\ne4 1-0',
    '[a "b"] 1.\ne4\n0-1',
    '[a "b"] 1. e4 e5 1-0',
    '[a "b"] 1. e4 e5 2. d4 1-0',
    '[a "b"] 1. e4 e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4) (1. c4) e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4) (1. c4) {Other opening moves} e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4) (1. c4) {Other opening moves} e5 (1. ... c5) (1... f5) 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 d5 (... c5) (1... f5)(1. ... c5 2. Nc3) (1. c4) {Other opening moves} e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4) (1. c4) e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 $1 (1. d4) (1. c4) {Other opening moves} e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 $2) (1. c4) {Other opening moves} e5 (1. ... c5) (1... f5) 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 d5 $7 (... c5 $3) (1... f5 $4)(1. ... c5 $5 2. Nc3 $6) (1. c4) {Other opening moves} e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 d5 $7 (... c5 $3) (1... f5 $4)(1. ... c5 $5 2. Nc3 $6) (1. c4) {Other\nopening\nmoves} e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 d5 $7 (... c5 $3) (1... f5 $4)(1. ... c5 $5 2. Nc3 $6) (1. c4) {Other\r\nopening\r\nmoves} e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 d5 $7 (... c5 $3) (1... f5 $4)(1. ... c5 $5 2. Nc3 $6) (1. c4) ;Other opening moves\n e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 d5 $7 (... c5 $3) (1... f5 $4)(1. ... c5 $5 2. Nc3 $6) (1. c4) ;Other opening moves\r\n e5 2. d4 d5 1-0',
  ];

  valid.forEach((v) => it(`${v.replace(/[\r\n]/g, '^')} is valid`, () => {
    const importer = new Importer();
    chai.assert.doesNotThrow(() => importer.feed(v));
    if (v.length === 0) chai.assert.isUndefined(importer.gamelist);
    else chai.assert.equal(importer.gamelist.length, 1);
  }));

  it('should parse pgn correctly', () => {
    const importer = new Importer();
    chai.assert.doesNotThrow(() => importer.import(pgn));
    chai.assert.equal(importer.gamelist.length, 1);
  });

  it('should parse pgn1 correctly', () => {
    const importer = new Importer();
    chai.assert.doesNotThrow(() => importer.import(pgn1));
    chai.assert.equal(importer.gamelist.length, 2);
  });

  it('should parse pgn1 correctly as a stream', (done) => {
    const importer = new Importer();
    const pgnstream = new Readable();
    pgnstream.push(pgn1);
    pgnstream.push(null);
    importer.import(pgnstream)
      .events.on('end', () => {
        chai.assert.equal(importer.gamelist.length, 2);
        done();
      });
  });

  it('should parse pgn2 correctly', () => {
    const importer = new Importer();
    chai.assert.doesNotThrow(() => importer.import(pgn2));
    chai.assert.equal(importer.gamelist.length, 1);
  });

  it('should parse pgn3 correctly', () => {
    const importer = new Importer();
    chai.assert.doesNotThrow(() => importer.import(pgn3));
    //
    // OK, so basically if you have an invalid PGN, and the last game has no
    // result token, it is going to be left in the gameobject variable.
    // It is your responsibility to handle "end of file", since the parser
    // knows nothing about EOF. If it's EOF, and there is a gameobject,
    // add it to the gamelist array.
    //
    chai.assert.equal(importer.gamelist.length, 2);
    chai.assert.isDefined(importer.gameobject);
  });

  it('should parse pgn4 correctly', () => {
    const importer = new Importer();
    chai.assert.doesNotThrow(() => importer.import(pgn4));
    chai.assert.equal(importer.gamelist.length, 3);
  });
});
