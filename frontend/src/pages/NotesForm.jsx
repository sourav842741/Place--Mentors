import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateNotes } from "../redux/notesSlice";
import { generatePDFAPI } from "../services/notes.api";
import { updateCredits } from "../redux/userSlice";
import { toast } from "sonner";
import useAuth from "../hooks/useAuth";


function NotesForm() {
  const dispatch = useDispatch();

  const { getCurrentUser } = useAuth();

  const { singleNote, loading } = useSelector((state) => state.notes);

  const [form, setForm] = useState({
    topic: "",
    classLevel: "",
    examType: "",
    revisionMode: false,
    includeDiagram: false,
    includeChart: false,
  });

const handleSubmit = async (e) => {
  e.preventDefault();

  const res = await dispatch(generateNotes(form));

  console.log("API RESPONSE 👉", res.payload);

  // ❌ ERROR HANDLE
  if (res?.error) {
    let message = "Something went wrong";

    if (typeof res.payload === "string") {
      message = res.payload;
    } else if (res.payload?.message) {
      message = res.payload.message;
    } else if (res.payload?.error) {
      message = res.payload.error;
    }

    toast.error(message);
    return;
  }

  // 🔥 FINAL FIX (IMPORTANT LINE)
  const credits =
    res?.payload?.creditsLeft ||   // ✅ THIS IS YOUR REAL FIELD
    res?.payload?.credits ||
    res?.payload?.data?.credits;

  if (credits !== undefined) {
    dispatch(updateCredits(credits)); // 💥 INSTANT NAVBAR UPDATE
  } else {
    await getCurrentUser(); // fallback
  }
};

  // ✅ PDF Download Function
  const handleDownload = async () => {
    try {
      const res = await generatePDFAPI({ result: singleNote });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "ExamNotesAI.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("PDF download error:", err);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-3 ">
        <input
          className="border p-2 w-full rounded"
          placeholder="Enter Topic (e.g. DBMS, OS)"
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
        />

        <button
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Generating..." : "Generate Notes"}
        </button>
      </form>

      {/* ✅ SHOW RESULT */}
      {singleNote && (
        <div className="p-4 border rounded bg-gray-50">
          <h2 className="font-bold mb-2">Generated Notes</h2>

          <pre className="whitespace-pre-wrap text-sm">
            {singleNote.notes}
          </pre>

          {/* ✅ PDF BUTTON */}
          <button
            onClick={handleDownload}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:scale-105 transition"
          >
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default NotesForm;