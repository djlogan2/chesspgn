#PGN exporter and importer

##Usage

###You can only export one game at a time. Writing multiple games to a PGN is simply a matter of writing each of these one after another to a file.
```javascript
const exporter = require("exporter");

const tags = {
    Event: "An event",
    White: "Guy, White",
    Black: "Guy, Black"
};

const movelist = [
    {variations: [0]},
    {move: "e4", prev: 0, variations[1]},
    {move: "e5", prev: 1}
];
// The third parameter is optional. If it exists, it writes this as a
// comment as a newline before the result
const pgnstring = exporter.exportToPgn(tags, movelist, "White resigns");
```

###You can import a string or a buffer. In general, the number of games in a string or a buffer will be small, and as such `importer.gamelist` will be managable.
```javascript
importer.import('[Event "someevent"] *');
console.log(importer.gamelist);
```

###You can also import a Readable stream. In this case, you probably do not want to risk gamelist being hundreds of thousands of games. Using the event listener will inform you when games are ready, delete those from the internal array after processing, and inform you when the stream has ended:
```javascript
importer.import(stream)
    .events.on('gamesready', (gamelist) => {
        // There will be one or more game objects here:
        console.log("tags=" + gamelist[0].tags + ", movelist=" + gamelist[0].movelist);
    })
    .on('end', () => {
        console.log("There are no more games in stream");
    });
// Because "gamesready" was listened to, this variable is unreliable. Do not use it.
console.log(importer.gamelist);
```

###The movelist
The movelist is the most important part of the importer and exporter. It is an array of node objects, and each node has a specific set of keys:
```javascript
const node = {
  move: "e4", // The move being made in this node of the tree
  prev: 23,   // The index of this nodes parent. movelist[23] is this nodes parent
  variations: [40, 52, 63] // Our children. movelist[40], movelist[52], and movelist[63] are all variations of moves made in response to e4, with movelist[40], or the first variation in the list, being main line.
  comment: "This comment will show up in exported PGNs as the text in the {curly braces}. Imported {curly braces} will be here",
  nag: "$3" // This will be imported if valid nag syntax is found. On export though, it will export anything in this field, making PGNs invalid if it's not a true NAG.
};
```
`movelist[0]` NEVER has a move, nor does it have a `prev`. `movelist[0]` is the root of the tree, which would be position at the starting FEN. It's `variation`s are all of the first players various responses to the initial position.
