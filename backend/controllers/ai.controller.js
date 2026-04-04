import { askAi } from "../services/openRouter.service.js";
import PDFDocument from "pdfkit";

export const generateResumePDF = async (req, res) => {
  try {
    const data = req.body;

   
    const messages = [
      {
        role: "system",
        content: `
Create a professional ATS-friendly resume.

Rules:
- Sections: Summary, Skills, Experience, Projects, Education, Achievements
- No markdown (** or *)
- No bullet points or symbols
- No dashed lines (---)
- Use clean paragraphs or line-separated text
- Section titles must be plain text (no formatting symbols)
- Enhance and improve content with relevant skills, tools, and impact
- Keep it concise and professional
- Return plain text only
        `,
      },
      {
        role: "user",
        content: JSON.stringify(data),
      },
    ];

    const aiText = await askAi(messages);

   
    const cleanText = aiText
      .replace(/\*\*/g, "")
      .replace(/^- /gm, "")
      .replace(/^\* /gm, "")
      .replace(/---+/g, "")
      .trim();

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");

    doc.pipe(res);

   
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .text(data.name.toUpperCase());

    doc.moveDown(0.3);

    //  CONTACT (INLINE CLICKABLE LINKS)
    doc.font("Helvetica").fontSize(10);

    doc.fillColor("blue");
    if (data.email) {
      doc.text(data.email, { link: `mailto:${data.email}` });
    }

    doc.fillColor("black");
    if (data.phone) {
      doc.text(data.phone);
    }

    if (data.linkedin) {
      doc.fillColor("blue").text(data.linkedin, {
        link: data.linkedin,
      });
    }

    if (data.github) {
      doc.fillColor("blue").text(data.github, {
        link: data.github,
      });
    }

    doc.fillColor("black");

    doc.moveDown();

    //  SPLIT INTO SECTIONS
    const sections = cleanText.split(/\n(?=[A-Z])/);

    sections.forEach((section) => {
      const lines = section.split("\n");

     
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(lines[0].trim(), {
          underline: true,
        });

      doc.moveDown(0.5);

      //  CONTENT (NO BULLETS)
      doc
        .font("Helvetica")
        .fontSize(10);

      lines.slice(1).forEach((line) => {
        if (line.trim()) {
          doc.text(line.trim());
        }
      });

      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};