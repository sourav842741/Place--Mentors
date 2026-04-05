import { useState } from "react";
import api from "../services/api";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Loader2, Download } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ResumeGenerator() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    education: "",
    projects: "",
    experience: "",
    achievements: "",
    linkedin: "",
    github: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const downloadResume = async () => {
    try {
      setLoading(true);

      const res = await api.post(
        "/api/ai/generate-resume-pdf",
        formData,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "resume.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.log(err);
      alert("Error generating resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl shadow-2xl rounded-2xl">
        <CardContent className="p-8">
          
          {/* HEADER */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              AI Resume Generator
            </h1>
            <p className="text-gray-500 mt-2">
              Create ATS-friendly resume in seconds 
            </p>
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.keys(formData).map((field) => (
              <div key={field} className="space-y-1">
                <Label className="capitalize">{field}</Label>
                <Input
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={`Enter ${field}`}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          {/* BUTTON */}
          <Button
            onClick={downloadResume}
            disabled={loading}
            className="mt-8 w-full h-12 text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Generating Resume...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Generate & Download Resume
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
    </>
  );
}