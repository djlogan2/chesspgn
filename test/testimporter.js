const chai = require('chai');
const { Readable } = require('stream');
const Importer = require('../app/importer');

const ctyexample = '[Event "Internet Chess Club"]\n'
    + '[Site "Internet Chess Club"]\n'
    + '[Date "2022.06.06"]\n'
    + '[Round "?"]\n'
    + '[White "CHEY.22.7_PrestonY"]\n'
    + '[Black "IMCY.22.7_EthanW"]\n'
    + '[Result "1-0"]\n'
    + '[ECO "C55"]\n'
    + '[WhiteElo "1600"]\n'
    + '[BlackElo "1600"]\n'
    + '[Annotator "Park,Sangmin"]\n'
    + '[PlyCount "39"]\n'
    + '[EventDate "2022.??.??"]\n'
    + '[TimeControl "900"]\n'
    + '\n'
    + '1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6 4. Bc4 {This allows a typical equlizing trick\n'
    + 'from Black.} (4. Bb5 {pinning this knight is the main line, indirectly\n'
    + 'attacking the e5-pawn.} Nd4 5. Bc4) 4... Bb4 (4... Nxe4 $1 5. Nxe4 d5 6. Bd3\n'
    + 'dxe4 7. Bxe4 Bd6 {After these moves, Black has equal shares in the center and\n'
    + 'caught up the development, which we call in chess, Black equalized the game.})\n'
    + '5. a3 (5. Nd5 Nxe4 6. Qe2 Nd6 7. Nxb4 Nxb4 8. Qxe5+ Qe7 9. Qxe7+ Kxe7 {Without\n'
    + 'queens, Black\'s weak king position does not matter much. Also, Black is\n'
    + 'attacking the weak c2 pawn with no defenders. However, White can castle and\n'
    + 'develop rooks as well as White keeps two bishops which are very strong in the\n'
    + 'open position.}) 5... Bxc3 6. dxc3 Nxe4 7. Qd3 (7. Bxf7+ Kxf7 8. Qd5+ Kf8 9.\n'
    + 'Qxe4 {This small tactics takes the piece and the pawn back making Black\'s king\n'
    + 'impossible to castle.}) 7... Nf6 8. Ng5 O-O 9. Bxf7+ Rxf7 10. Nxf7 Kxf7 {\n'
    + 'This trade Bishop, Knight vs Pawn, Rook is often a bad idea, since two minor\n'
    + 'pieces are generally stronger than a rook and a pawn by experiments.} 11. f4 (\n'
    + '11. Bg5 {first and then open up the f-file was safer.}) 11... e4 12. Qc4+ d5\n'
    + '13. Qe2 Bg4 14. Qe3 Qd7 15. Rf1 Re8 16. f5 a6 17. Qc5 b6 18. Qf2 h6 19. Be3 a5\n'
    + '20. b4 {Black is still much better, did you lose on time?} (20. h3 Bh5 21. g4 {\n'
    + 'wins a bishop or a knight.}) 1-0\n';

const chesscom = '[Event "Live Chess"]\n'
    + '[Site "Chess.com"]\n'
    + '[Date "2022.01.24"]\n'
    + '[Round "-"]\n'
    + '[White "PABLOAK123"]\n'
    + '[Black "lisetttte"]\n'
    + '[Result "1-0"]\n'
    + '[CurrentPosition "r3k2Q/ppp3R1/3p4/4p3/3bP3/1R1B1N1P/P4P2/4K3 b - -"]\n'
    + '[Timezone "UTC"]\n'
    + '[ECO "C20"]\n'
    + '[ECOUrl "https://www.chess.com/openings/Kings-Pawn-Opening-Wayward-Queen-Attack"]\n'
    + '[UTCDate "2022.01.24"]\n'
    + '[UTCTime "18:38:23"]\n'
    + '[WhiteElo "422"]\n'
    + '[BlackElo "441"]\n'
    + '[TimeControl "180"]\n'
    + '[Termination "PABLOAK123 won by checkmate"]\n'
    + '[StartTime "18:38:23"]\n'
    + '[EndDate "2022.01.24"]\n'
    + '[EndTime "18:41:55"]\n'
    + '[Link "https://www.chess.com/game/live/36788469781"]\n'
    + '\n'
    + '1. e4 e5 2. Qh5 Qf6 3. Nf3 Nc6 4. d3 Bb4+ 5. c3 Ba5 6. Bg5 g6?? ± {BLUNDER\n'
    + '(+7.63)} ({(+0.44) The best move was} 6... Qe6 7. Nbd2 Nf6 8. Qh4 d6 9. Nc4 Bb6\n'
    + '10. a4 Ng4 11. Nxb6 axb6 12. Be2 b5 13. Bd1 h6 14. h3 Nf6 15. O-O) 7. Qh4?? = +- -+ ?? !\n'
    + '{BLUNDER (-0.12)} ({(+7.63) The best move was} 7. Bxf6 gxh5 8. Bxh8 d6 9. Nbd2\n'
    + 'Bb6 10. Be2 Nce7 11. Nh4 Bd7 12. d4 Nh6 13. Bg7 Ng4 14. O-O Ng6 15. Nxg6 hxg6\n'
    + '16. a4 exd4) 7... Qd6 {INACCURACY (+0.91)} ({(-0.12) The best move was} 7... Qg7\n'
    + '8. Nbd2 h6 9. Be3 Nf6 10. Qg3 d6 11. d4 Bb6 12. Bb5 O-O 13. Bxc6 exd4 14. Bxd4\n'
    + 'bxc6 15. O-O c5 16. Bxf6 Qxf6 17. e5 dxe5) 8. b4 Nxb4? ± {MISTAKE (+4.21)}\n'
    + '({(+0.85) The best move was} 8... Bb6 9. a4 f6 10. Bc1 a6 11. Ba3 Qe6 12. d4 Qf7\n'
    + '13. a5 Ba7 14. b5 axb5 15. Bxb5 g5 16. Qg3 d6) 9. cxb4 {Critical move.} 9...\n'
    + 'Bxb4+ 10. Nbd2 Qxd3?? {BLUNDER (+13.67)} ({(+3.99) The best move was} 10... f6\n'
    + '11. Be3 h5 12. Be2 g5 13. Nxg5 fxg5 14. Bxg5 Qg6 15. O-O Rh7 16. Nb3 d5 17. f4\n'
    + 'Bg4 18. f5 Qf7 19. Bxg4 hxg4) 11. Bxd3 f6 12. Bxf6 Nxf6 13. Qxf6 d6 14. Qxh8+\n'
    + 'Ke7 15. Qxh7+ Kf6 16. Rb1 Bc3 17. Rb3 Bd4 18. g4 Bxg4 19. h3 Bxf3? {MISTAKE\n'
    + '(+37.78)} ({(+25.63) The best move was} 19... Be6 20. Qh4+ Kf7 21. Ng5+ Kf6 22.\n'
    + 'Nxe6+ Kxe6 23. Bc4+ Kd7 24. Qh7+ Kd8 25. Qg8+ Ke7 26. Qf7+ Kd8 27. Qf8+ Kd7 28.\n'
    + 'Qxa8 a6 29. Kf1 Bxf2 30. Qxb7 Bh4 31. Rf3 Bg5 32. Rf7+ Be7 33. Qxa6 d5 34. Bxd5)\n'
    + '20. Nxf3 g5 21. Rg1 Ke6 22. Rxg5 {FASTER MATE (♔ Mate in 4)} ({(♔ Mate in 2)\n'
    + 'Checkmate after} 22. Nxg5+ Kf6 23. Qf7#) 22... Kf6 23. Qh6+ {FASTER MATE (♔ Mate\n'
    + 'in 2)} ({(♔ Mate in 1) Checkmate after} 23. Rg6#) 23... Kf7 24. Rg7+ Ke8 25.\n'
    + 'Qh8# 1-0';

const lichesspgn = '[Event "Hourly SuperBlitz Arena"]\n'
    + '[Site "https://lichess.org/gMiOIeXv"]\n'
    + '[Date "2021.08.15"]\n'
    + '[White "zstudent"]\n'
    + '[Black "Seneca11"]\n'
    + '[Result "1-0"]\n'
    + '[UTCDate "2021.08.15"]\n'
    + '[UTCTime "14:47:55"]\n'
    + '[WhiteElo "2181"]\n'
    + '[BlackElo "1774"]\n'
    + '[WhiteRatingDiff "+4"]\n'
    + '[BlackRatingDiff "-1"]\n'
    + '[Variant "Standard"]\n'
    + '[TimeControl "180+0"]\n'
    + '[ECO "B41"]\n'
    + '[Opening "Sicilian Defense: Kan Variation, Maróczy Bind, Réti Variation"]\n'
    + '[Termination "Normal"]\n'
    + '[Annotator "lichess.org"]\n'
    + '\n'
    + '1. e4 { [%eval 0.24] [%clk 0:03:00] } 1... c5 { [%eval 0.32] [%clk 0:03:00] } 2. Nf3 { [%eval 0.0] [%clk 0:02:59] } 2... e6?! { (0.00 → 0.54) Inaccuracy. d6 was best. } { [%eval 0.54] [%clk 0:02:58] } (2... d6 3. c3 Nf6 4. h3 Nc6 5. Bd3 e5 6. O-O Be7 7. Bc2) 3. d4 { [%eval 0.42] [%clk 0:02:58] } 3... cxd4 { [%eval 0.15] [%clk 0:02:57] } 4. Nxd4 { [%eval 0.23] [%clk 0:02:58] } 4... a6 { [%eval 0.19] [%clk 0:02:56] } 5. c4 { [%eval 0.27] [%clk 0:02:57] } { B41 Sicilian Defense: Kan Variation, Maróczy Bind, Réti Variation } 5... Qc7 { [%eval 0.36] [%clk 0:02:55] } 6. Nc3 { [%eval 0.6] [%clk 0:02:56] } 6... Nc6 { [%eval 0.43] [%clk 0:02:49] } 7. Nc2 { [%eval 0.52] [%clk 0:02:54] } 7... Bb4?? { (0.52 → 3.62) Blunder. b6 was best. } { [%eval 3.62] [%clk 0:02:45] } (7... b6 8. Be3 Be7 9. Be2 Nf6 10. f4 d6 11. O-O Bb7 12. Rc1) 8. Nxb4 { [%eval 3.23] [%clk 0:02:53] } 8... Nxb4 { [%eval 3.43] [%clk 0:02:43] } 9. Be3 { [%eval 3.62] [%clk 0:02:50] } 9... d6 { [%eval 3.9] [%clk 0:02:32] } 10. Be2 { [%eval 4.12] [%clk 0:02:49] } 10... Nf6 { [%eval 3.88] [%clk 0:02:28] } 11. O-O { [%eval 3.84] [%clk 0:02:46] } 11... O-O { [%eval 3.98] [%clk 0:02:27] } 12. Rc1 { [%eval 3.75] [%clk 0:02:42] } 12... Qb8?! { (3.75 → 4.75) Inaccuracy. Bd7 was best. } { [%eval 4.75] [%clk 0:02:11] } (12... Bd7 13. Qd2) 13. Bb6?! { (4.75 → 3.71) Inaccuracy. Qd2 was best. } { [%eval 3.71] [%clk 0:02:35] } (13. Qd2) 13... Nc6 { [%eval 3.77] [%clk 0:02:04] } 14. f4 { [%eval 3.35] [%clk 0:02:27] } 14... Nd7 { [%eval 3.04] [%clk 0:01:52] } 15. Be3 { [%eval 3.35] [%clk 0:02:25] } 15... e5?! { (3.35 → 4.23) Inaccuracy. Nf6 was best. } { [%eval 4.23] [%clk 0:01:48] } (15... Nf6 16. Bf3 Bd7 17. Rf2 e5 18. f5 Nd4 19. Bxd4 exd4 20. Qxd4 Re8 21. Rd2 Bc6 22. Re1) 16. Nd5 { [%eval 4.02] [%clk 0:02:19] } 16... Re8? { (4.02 → 6.68) Mistake. exf4 was best. } { [%eval 6.68] [%clk 0:01:27] } (16... exf4 17. Bxf4) 17. f5? { (6.68 → 4.00) Mistake. Bh5 was best. } { [%eval 4.0] [%clk 0:02:12] } (17. Bh5) 17... f6? { (4.00 → 8.76) Mistake. Ne7 was best. } { [%eval 8.76] [%clk 0:01:21] } (17... Ne7) 18. g4?! { (8.76 → 4.93) Inaccuracy. Bh5 was best. } { [%eval 4.93] [%clk 0:02:10] } (18. Bh5 Rf8) 18... Ne7?! { (4.93 → 8.55) Inaccuracy. Rf8 was best. } { [%eval 8.55] [%clk 0:01:17] } (18... Rf8 19. g5) 19. g5?! { (8.55 → 4.92) Inaccuracy. Nxe7+ was best. } { [%eval 4.92] [%clk 0:02:06] } (19. Nxe7+ Rxe7 20. c5 b5 21. cxd6 Rf7 22. Rc7 Nb6 23. Qb3 Bd7 24. Rfc1 Be8 25. R1c6 Nc4) 19... Nxd5 { [%eval 6.09] [%clk 0:01:16] } 20. Qxd5+ { [%eval 5.38] [%clk 0:02:06] } 20... Kh8 { [%eval 5.75] [%clk 0:01:14] } 21. Rcd1 { [%eval 4.61] [%clk 0:02:00] } 21... Nb6? { (4.61 → 9.84) Mistake. fxg5 was best. } { [%eval 9.84] [%clk 0:01:06] } (21... fxg5 22. Qf7 Nf6 23. Bxg5 Qa7+ 24. c5 b6 25. Qxa7 Rxa7 26. cxb6 Rd7 27. Bxf6 gxf6 28. a4) 22. Bxb6 { [%eval 9.62] [%clk 0:01:57] } 22... Bd7 { [%eval 9.04] [%clk 0:01:00] } 23. gxf6 { [%eval 9.61] [%clk 0:01:46] } 23... Bc6 { [%eval 9.73] [%clk 0:00:53] } 24. Qxd6 { [%eval 9.69] [%clk 0:01:39] } 24... Qxd6 { [%eval 9.67] [%clk 0:00:48] } 25. Rxd6 { [%eval 9.4] [%clk 0:01:39] } 25... gxf6 { [%eval 9.59] [%clk 0:00:46] } 26. Bf3 { [%eval 9.29] [%clk 0:01:32] } 26... Rg8+ { [%eval 9.53] [%clk 0:00:45] } 27. Kf2 { [%eval 9.75] [%clk 0:01:29] } 27... a5 { [%eval 9.75] [%clk 0:00:28] } 28. Rxf6 { [%eval 10.0] [%clk 0:01:27] } 28... Ra6 { [%eval 15.54] [%clk 0:00:25] } 29. Bc7 { [%eval 15.85] [%clk 0:01:24] } 29... Re8?! { (15.85 → Mate in 4) Checkmate is now unavoidable. Rg5 was best. } { [%eval #4] [%clk 0:00:18] } (29... Rg5 30. h4) 30. Rg1 { [%eval #3] [%clk 0:01:16] } 30... Bxe4 { [%eval #3] [%clk 0:00:08] } 31. Rxa6 { [%eval #7] [%clk 0:01:13] } 31... Bxf3 { [%eval #3] [%clk 0:00:07] } 32. Re6 { [%eval #7] [%clk 0:01:07] } 32... e4 { [%eval #1] [%clk 0:00:06] } 33. Rxe8# { [%clk 0:01:05] } { White wins by checkmate. } 1-0\n'
    + '\n'
    + '\n';

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

const alexsinvalidpgn = '[Event "Global"]\n'
    + '[Site "Internet Chess Club"]\n'
    + '[Date "2021.11.04"]\n'
    + '[Round "1"]\n'
    + '[White "Max Levchenko"]\n'
    + '[Black "max_premove_2"]\n'
    + '[Result "0-1"]\n'
    + '[Time "13:25:19"]\n'
    + '[ICCRated "0"]\n'
    + '[ICCGameId "iYpecwk9gJHvysifL"]\n'
    + '[ICCTimeControl "60/0 none -- 60/0 none"]\n'
    + '[TimeControl "60"]\n'
    + '0-1\n'
    + 'Browse for PGN window has only files with .pgn format in it\n'
    + 'Browse for PGN window has only files with .pgn format in it\n'
    + 'Browse for PGN window has only files with .pgn format in it\n'
    + 'Browse for PGN window has only files with .pgn format in it\n'
    + 'Browse for PGN window has only files with .pgn format in it';

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

  it('should parse lichess pgn correctly', () => {
    const importer = new Importer();
    importer.debugonerror = true;
    chai.assert.doesNotThrow(() => importer.import(lichesspgn));
    chai.assert.equal(importer.gamelist.length, 1);
  });

  it('should parse chess.com pgn correctly', () => {
    const importer = new Importer();
    importer.debugonerror = true;
    chai.assert.doesNotThrow(() => importer.import(chesscom));
    chai.assert.equal(importer.gamelist.length, 1);
  });

  it("should parse cty's example from ICC's web site pgn correctly", () => {
    const importer = new Importer();
    importer.debugonerror = true;
    chai.assert.doesNotThrow(() => importer.import(chesscom));
    chai.assert.equal(importer.gamelist.length, 1);
  });

  it('should parse pgn1 correctly as a stream', (done) => {
    const importer = new Importer();
    const pgnstream = new Readable();
    pgnstream.push(pgn1);
    pgnstream.push(null);
    let count = 0;
    importer.import(pgnstream)
      .events.on('gamesready', (gamelist) => {
        count += gamelist.length;
      }).on('end', () => {
        chai.assert.equal(count, 2);
        done();
      });
  });

  it('should do what with this invalid file', (done) => {
    const importer = new Importer();
    const pgnstream = new Readable();
    pgnstream.push(alexsinvalidpgn);
    pgnstream.push(null);
    let count = 0;
    importer.import(pgnstream)
      .events.on('gamesready', (gamelist) => {
        count += gamelist.length;
      }).on('error', (err) => {
        done();
      // }).on('end', () => {
      //   chai.fail('We should not get here on error');
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
