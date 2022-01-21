const moo = require('moo');
const EventEmitter = require('events');

class Importer {
  constructor() {
    this.nonstandardnags = {
      '!': '$1',
      '?': '$2',
      '!!': '$3',
      '??': '$4',
      '!?': '$5',
      '?!': '$6',
      '=': '$10',
      '+-': '$18',
      '-+': '$19',
    };
    this.events = new EventEmitter();
    this.debug = [];
    this.lexer = moo.states({
      notcomment: {
        WS: /[ \t]+/,
        STRING: /"(?:\\["\\]|[^\n"])*"/,
        NAG: /\$[0-9]+/,
        RESULT: ['0-1', '1-0', '1/2-1/2', '*'],
        INTEGER: /[0-9]+/,
        DOTDOTDOT: /\.\.\./,
        PERIOD: /\./,
        LBRACKET: /\[/,
        RBRACKET: /]/,
        LPAREN: /\(/,
        RPAREN: /\)/,
        LBRACE: { match: /{/, push: 'comment1' },
        SEMICOLON: { match: /;/, push: 'comment2' },
        SAN: /(?:[RQKBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[RQBN])?|O-O(?:-O)?)(?:#|\?[?!]?|![!?]?|=|\+-?|-\+)?/,
        SYMBOL: /[a-zA-Z0-9_]+/,
        NL: { match: /\r?\n/, lineBreaks: true },
      },
      comment1: {
        C1: { match: /.*?}/, pop: 1 },
        C1NL: { match: /.*?\r?\n/, lineBreaks: true },
      },
      comment2: {
        C2: { match: /.*?\r?\n/, lineBreaks: true, pop: 1 },
      },
    });
    this.info = null;
    this.line = 1;
    this.nl = 0;
    this.state = this.game;
  }

  pushdebug(name, type, value) {
    if (this.debug.length >= 100) this.debug.shift();
    this.debug.push([name, type, value]);
  }

  importStream(stream) {
    let saveBuffer;
    stream
      .on('readable', () => {
        // debug("on.readable");
        let chunk = stream.read();
        while (chunk !== null) {
          // debug("on.readable.read");
          let chunk2;

          if (!!saveBuffer && saveBuffer.length) {
            chunk2 = Buffer.concat([saveBuffer, Buffer.from(chunk)]);
          } else chunk2 = Buffer.from(chunk);
          let end = chunk2.lastIndexOf('\n');
          if (end === -1) end = chunk2.lastIndexOf(' ');

          if (end === -1) {
            saveBuffer = chunk2;
          } else {
            end += 1;
            try {
              this.feed(chunk2.toString('utf8', 0, end));
            } catch (e) {
              this.events.emit('error', e);
              return;
            }
          }
          saveBuffer = chunk2.slice(end);
          //
          // Because in a stream, there could be millions of games,
          // the caller needs to be able to handle games as we get them,
          // delete "this.gamelist", and continue.
          //
          if (this.gamelist) {
            if (this.events.listeners('gamesready')) {
              this.events.emit('gamesready', this.gamelist);
              this.gamelist = [];
            }
          }
          chunk = stream.read();
        }
      })
      .on('error', (err) => {
        console.log('here');
      })
      .on('end', () => {
        if (!!saveBuffer && saveBuffer.length) {
          this.feed(saveBuffer.toString('utf8'));
          if (this.gameobject) this.gamelist.push(this.gameobject);
          if (this.gamelist) {
            this.events.emit('gamesready', this.gamelist);
          }
        }
        this.events.emit('end');
      });
  }

  import(data) {
    if (typeof data === 'string') {
      this.feed(data);
    } else if (Buffer.isBuffer(data)) {
      throw new Error('Do me');
    } else if (typeof data.read === 'function') {
      this.importStream(data);
    } else {
      throw new Error('Unable to determine how to read data to import');
    }
    return this;
  }

  feed(chunk) {
    // eslint-disable-next-line no-control-regex
    this.lexer.reset(chunk.replace(/[^\x00-\x7F]/g, ' '), this.info);
    this.info = this.lexer.save();
    let token = this.lexer.next();
    while (token !== undefined) {
      if (token.type === 'NL') {
        this.line += 1;
        this.nl += 1;
      } else if (token.type !== 'WS') {
        this.state.call(this, token);
        this.nl = 0;
      }
      token = this.lexer.next();
    }
  }

  error(msg, token) {
    const m = `${msg
    } on line ${
      this.line
    } offset ${
      token.offset
    }, token=${
      token.type
    }, value='${
      token.value
    }'`;
    const e = new Error(m);
    e.token = token;
    throw e;
  }

  game(token) {
    this.pushdebug('game', token.type, token.text);
    if (token.type === 'LBRACKET') {
      this.state = this.tagname;
      this.gameobject = { tags: {}, movelist: [{}] };
      this.cmi = 0;
    } else this.error("Expecting start of game (that is, a left bracket '[')", token);
  }

  tagname(token) {
    this.pushdebug('tagname', token.type, token.text);
    if (token.type === 'SYMBOL') {
      this.tagname2 = token.value;
      this.state = this.tagvalue;
    } else this.error('Expecting a tagname', token);
  }

  tagvalue(token) {
    this.pushdebug('tagvalue', token.type, token.text);
    if (token.type === 'STRING') {
      this.gameobject.tags[this.tagname2] = token.value.slice(1, token.value.length - 1);
      this.state = this.endtag;
    } else this.error('Expecting tag value', token);
  }

  endtag(token) {
    this.pushdebug('endtag', token.type, token.text);
    if (token.type === 'RBRACKET') {
      this.state = this.nexttag;
    } else this.error('Expecting a right bracket', token);
  }

  nexttag(token) {
    this.pushdebug('nexttag', token.type, token.text);

    switch (token.type) {
      case 'LBRACKET':
        // Special code to handle a game with  no moves, and no result
        if (this.nl === 2) {
          this.savegame('*');
          this.game(token);
        }
        this.state = this.tagname;
        break;
      case 'INTEGER':
        this.state = this.movenumber;
        break;
      case 'RESULT':
        this.savegame(token.value);
        break;
      default:
        this.error("Expecting a '[', a move number, or game result", token);
    }
  }

  variationstart(token) {
    this.pushdebug('variationstart', token.type, token.text);
    switch (token.type) {
      case 'INTEGER':
        this.state = this.movenumber;
        return;
      case 'PERIOD':
      case 'DOTDOTDOT':
        this.state = this.san;
        return;
      default:
        this.error('Expected a move number or periods', token);
    }
  }

  movenumber(token) {
    this.pushdebug('movenumber', token.type, token.text);
    if (token.type === 'PERIOD' || token.type === 'DOTDOTDOT') {
      this.state = this.san;
    } else this.error('Expecting a PERIOD (.)', token);
  }

  san(token) {
    this.pushdebug('san', token.type, token.text);
    if (token.type === 'PERIOD' || token.type === 'DOTDOTDOT') return; // Skip "1." "1..." "1. ..." "..." etc.
    if (token.type !== 'SAN') this.error('Expecting periods or a SAN move', token);

    const re = /^(.*?)(!!?|\?\??|!\?|\?!|=|\+-?|-\+|#)?$/;
    let [_, move, nag] = re.exec(token.value);

    if (nag === '+' || nag === '#') {
      move += nag;
      nag = undefined;
    }

    if (!this.gameobject.movelist[this.cmi].variations) {
      this.gameobject.movelist[this.cmi].variations = [];
    }

    this.gameobject.movelist[this.cmi].variations.push(
      this.gameobject.movelist.length,
    );

    const node = { move, prev: this.cmi };
    if (nag && this.nonstandardnags[nag]) node.nag = this.nonstandardnags[nag];
    this.gameobject.movelist.push(node);

    this.cmi = this.gameobject.movelist.length - 1;
    this.state = this.nag;
  }

  nag(token) {
    this.pushdebug('nag', token.type, token.text);
    if (token.type === 'NAG') {
      this.gameobject.movelist[this.cmi].nag = token.value;
    } else this.comment(token);
  }

  comment(token) {
    this.pushdebug('comment', token.type, token.text);
    if (token.type === 'LBRACE' || token.type === 'SEMICOLON') {
      this.state = this.commenttext;
      this.gameobject.movelist[this.cmi].comment = '';
    } else this.recursive(token);
  }

  commenttext(token) {
    this.pushdebug('commenttext', token.type, token.text);
    switch (token.type) {
      case 'C1NL':
        this.gameobject.movelist[this.cmi].comment += token.value;
        return;
      case 'C1':
        this.gameobject.movelist[this.cmi].comment += token.value.substring(
          0,
          token.value.length - 1,
        );
        this.state = this.nag;
        return;
      case 'C2':
        this.gameobject.movelist[this.cmi].comment += token.value.replace(/\r?\n/, '');
        this.state = this.nag;
        return;
      default:
        throw new Error('What is the correct thing to do here?');
    }
  }

  recursive(token) {
    this.pushdebug('recursive', token.type, token.text);
    switch (token.type) {
      case 'LPAREN':
        this.state = this.variationstart;
        if (this.nested_variations === undefined) this.nested_variations = [];
        this.nested_variations.push(this.cmi);
        this.cmi = this.gameobject.movelist[this.cmi].prev;
        break;
      case 'RPAREN':
        this.cmi = this.nested_variations.pop();
        this.state = this.nag;
        break;
      case 'INTEGER':
        this.state = this.movenumber;
        break;
      case 'RESULT':
        this.savegame(token.value);
        break;
      case 'SAN':
        this.san(token);
        break;
      default:
        this.error('Expected a variation, move number, result, or san', token);
    }
  }

  savegame(result) {
    this.pushdebug('savegame', null, result);
    if (!this.gamelist) this.gamelist = [];
    this.gamelist.push(this.gameobject);
    delete this.gameobject;
    this.state = this.game;
  }
}

module.exports = Importer;
