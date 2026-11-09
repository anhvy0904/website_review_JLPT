import fs from "fs";
import path from "path";

const files = ["n3-best-moshi-01.json", "n3-best-moshi-02.json", "n3-best-moshi-03.json"];

for (const file of files) {
  const filePath = path.join(process.cwd(), "public/data/exams", file);
  const exam = JSON.parse(fs.readFileSync(filePath, "utf8"));
  console.log(`\n================ ${file} (${exam.title}) ================`);
  console.log(`Total questions: ${exam.questions.length}, Total passages: ${exam.passages.length}`);

  let totalQuestionsWithPassage = 0;
  for (const passage of exam.passages) {
    const linkedQs = exam.questions.filter((q) => q.passageId === passage.id);
    totalQuestionsWithPassage += linkedQs.length;
    const hasText = Boolean(passage.text && passage.text.trim().length > 0);
    const imgExists = passage.imagePath
      ? fs.existsSync(path.join(process.cwd(), "public", passage.imagePath))
      : false;

    console.log(
      `Passage [${passage.id}]: "${passage.title}" | Text: ${
        hasText ? `${passage.text.length} chars` : "EMPTY"
      } | Image: ${passage.imagePath} (${imgExists ? "EXISTS" : "MISSING"}) | Linked Qs: ${
        linkedQs.length
      } [${linkedQs.map((q) => q.number).join(", ")}]`
    );
  }
  console.log(`Total questions linked to passages: ${totalQuestionsWithPassage}/21 expected (5 cloze + 16 reading)`);
}

