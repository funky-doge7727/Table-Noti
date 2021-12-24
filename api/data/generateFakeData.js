// Randomly generate a fake allTables JSON file

const fs = require("fs");
const numTables = Math.floor(Math.random() * 10) + 16; // 16 - 26 (exclusive)

let fakeTables = [];
for (i = 1; i < numTables; i++) {
  const chairs = Math.floor(Math.random() * 6) + 2; // 2-8 (exclusive)
  const name = `Table ${i}`;
  // const availability = [true, false][Math.round(Math.random())];
  fakeTables.push({
    name: name,
    capacity: chairs,
    // isAvailable: availability,
    isAvailable: true,
  });
}

let data = JSON.stringify({
  tables: fakeTables
});
fs.writeFileSync(__dirname + "/allTables.json", data);
