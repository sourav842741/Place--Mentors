import PDFDocument from "pdfkit"

export const pdfDownload = async (req,res) => {
        const {result} = req.body;

    if (!result) {
    return res.status(400).json({ error: "No content provided" });
  }

  const doc = new PDFDocument({margin:50})

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition",
    'attachment; filename="ExamNotesAI.pdf"')

    doc.pipe(res)

      // Title
  doc.fontSize(20).text("ExamNotes AI", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Importance: ${result.importance}`);
  doc.moveDown();

  // Sub Topics
  doc.fontSize(16).text("Sub Topics");
  doc.moveDown(0.5);
  Object.entries(result.subTopics).forEach(([star, topics]) => {
  doc.moveDown(0.5);
  doc.fontSize(13).text(`${star} Topics:`);

  topics.forEach((t) => {
    doc.fontSize(12).text(`• ${t}`);
  });
});


  doc.moveDown();

  // Notes
  doc.fontSize(16).text("Notes");
  doc.moveDown(0.5);
  doc.fontSize(12).text(result.notes.replace(/[#*]/g, ""));

  doc.moveDown();
  


  // Revision Points
  doc.fontSize(16).text("Revision Points");
  doc.moveDown(0.5);
  result.revisionPoints.forEach((p) => {
    doc.fontSize(12).text(`• ${p}`);
  });

  doc.moveDown();

  // Questions
  doc.fontSize(16).text("Important Questions");
  doc.moveDown(0.5);

  doc.fontSize(13).text("Short Questions:");
  result.questions.short.forEach((q) => {
    doc.fontSize(12).text(`• ${q}`);
  });

  doc.moveDown(0.5);
  doc.fontSize(13).text("Long Questions:");
  result.questions.long.forEach((q) => {
    doc.fontSize(12).text(`• ${q}`);
  });

  doc.moveDown(0.5);
  doc.fontSize(13).text("Diagram Question:");
  doc.fontSize(12).text(result.questions.diagram);

  doc.end();




   
}