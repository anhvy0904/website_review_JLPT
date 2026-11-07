import fs from "fs";
import path from "path";

// Read lib/hanviet.ts
const hanvietCode = fs.readFileSync("lib/hanviet.ts", "utf8");
const existingMap = {};
for (const match of hanvietCode.matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
  existingMap[match[1]] = match[2];
}
console.log("Current dictionary size:", Object.keys(existingMap).length);

// Scan all exam JSON files
const examFiles = fs.readdirSync("public/data/exams").filter(f => f.endsWith(".json") && f !== "manifest.json");
const missingKanji = new Set();
const isKanji = (c) => /[\u4e00-\u9faf\u3400-\u4dbf]/.test(c);

for (const file of examFiles) {
  const content = fs.readFileSync(path.join("public/data/exams", file), "utf8");
  for (const char of content) {
    if (isKanji(char) && !existingMap[char]) {
      missingKanji.add(char);
    }
  }
}

console.log("Missing kanji count:", missingKanji.size);
console.log("Missing kanji:", Array.from(missingKanji).join(" "));
