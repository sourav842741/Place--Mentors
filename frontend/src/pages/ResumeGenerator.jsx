import { useState, useCallback } from "react";
import api from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FaUser, FaGithub, FaPhone } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { BsStars } from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
import { FaLinkedin } from "react-icons/fa";
import { FaBriefcase } from "react-icons/fa";
import { FaFolderOpen } from "react-icons/fa";
import { FaGraduationCap } from "react-icons/fa";
import { FaTrophy } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FaCode } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trackEvent } from "../hooks/useAnalytics";

const ResumePreview = ({ data, template }) => {
  const renderLines = (text) => {
    if (!text) return [];
    return text
      .split("\\n")
      .filter((line) => line.trim())
      .map((line, idx) => (
        <div key={idx} className="mb-1 text-sm leading-relaxed">
          {line}
        </div>
      ));
  };

  const cleanSkills = data.skills
    ? data.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)
        .map((skill, idx) => (
          <span
            key={idx}
            className="inline-block bg-gray-200 text-gray-800 px-2.5 py-1 rounded text-xs mr-1 mb-1"
          >
            {skill}
          </span>
        ))
    : [];

  const commonSection = (icon, title, content) => (
    <section className="mb-6 last:mb-0 space-y-3">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mr-3 shrink-0">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="pl-11 border-l-4 border-gray-300 space-y-1">
        {content}
      </div>
    </section>
  );

  return (
    <div
      className="w-full lg:w-[794px] mx-auto bg-white text-black shadow-2xl border rounded-2xl overflow-auto "
      style={{ minHeight: "1122px" }}
    >
      {template === "modern" ? (
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Sidebar */}
          <div className="w-full lg:w-2/5 bg-linear-to-b from-gray-50 to-gray-100 p-8 lg:p-10 border-r border-gray-200">
            {/* Name */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <FaUser className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {data.name || "Your Name"}
                </h1>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3 mb-10">
              {data.email && (
                <div className="flex items-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                  <MdEmail className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium">{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                  <FaPhone className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium">{data.phone}</span>
                </div>
              )}
              {data.linkedin && (
                <div className="flex items-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                  <FaLinkedin className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium">{data.linkedin}</span>
                </div>
              )}
              {data.github && (
                <div className="flex items-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                  <FaGithub className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium">{data.github}</span>
                </div>
              )}
            </div>

            {/* Skills */}
            {data.skills && (
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                    <FaCode className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Skills
                  </h3>
                </div>
                <div className="space-y-2">{cleanSkills}</div>
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="w-full lg:w-3/5 p-10 space-y-8">
            {data.summary &&
              commonSection(
                <BsStars className="w-5 h-5" />,
                "Summary",
                renderLines(data.summary),
              )}
            {data.experience &&
              commonSection(
                <FaBriefcase className="w-5 h-5" />,
                "Experience",
                renderLines(data.experience),
              )}
            {data.projects &&
              commonSection(
                <FaFolderOpen className="w-5 h-5" />,
                "Projects",
                renderLines(data.projects),
              )}
            {data.education &&
              commonSection(
                <FaGraduationCap className="w-5 h-5" />,
                "Education",
                renderLines(data.education),
              )}
            {data.achievements &&
              commonSection(
                <FaTrophy className="w-5 h-5" />,
                "Achievements",
                renderLines(data.achievements),
              )}
          </div>
        </div>
      ) : (
        <div className="p-10 lg:p-14 text-center space-y-12 max-w-4xl mx-auto">
          {/* Header */}
          <div>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-8">
              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center p-3">
                <FaUser className="w-12 h-12 text-indigo-600" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {data.name || "Your Name"}
              </h1>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600 max-w-2xl mx-auto">
              {data.email && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <MdEmail className="w-4 h-4" />
                  {data.email}
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <FaPhone className="w-4 h-4" />
                  {data.phone}
                </div>
              )}
              {data.linkedin && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <FaLinkedin className="w-4 h-4" />
                  {data.linkedin}
                </div>
              )}
              {data.github && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <FaGithub className="w-4 h-4" />
                  {data.github}
                </div>
              )}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {data.summary &&
              commonSection(
                <BsStars className="w-6 h-6" />,
                "Summary",
                renderLines(data.summary),
              )}
            {data.skills &&
              commonSection(
                <FaCode className="w-6 h-6" />,
                "Skills",
                cleanSkills,
              )}
            {data.experience &&
              commonSection(
                <FaBriefcase className="w-6 h-6" />,
                "Experience",
                renderLines(data.experience),
              )}
            {data.projects &&
              commonSection(
                <FaFolderOpen className="w-6 h-6" />,
                "Projects",
                renderLines(data.projects),
              )}
            {data.education &&
              commonSection(
                <FaGraduationCap className="w-6 h-6" />,
                "Education",
                renderLines(data.education),
              )}
            {data.achievements &&
              commonSection(
                <FaTrophy className="w-6 h-6" />,
                "Achievements",
                renderLines(data.achievements),
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ResumeGenerator() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    summary: "",
    skills: "",
    experience: "",
    projects: "",
    education: "",
    achievements: "",
  });
  const [generateLoading, setGenerateLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

 const handleGenerateAI = async () => {
  setGenerateLoading(true);

  try {
    const res = await api.post("/api/ai/generate-content", {
      name: formData.name || "Software Developer",
      education: formData.education || "Computer Science",
    });

    setFormData((prev) => ({ ...prev, ...res.data }));

    trackEvent("resume_builder_used", {
      action: "ai_generate",
      template: selectedTemplate,
    });

  } catch (err) {
    console.error(err);
    alert("AI unavailable - use manual input");
  } finally {
    setGenerateLoading(false);
  }
};

  const handleDownload = async () => {
    if (!formData.name.trim()) {
      alert("Please enter name");
      return;
    }
    setDownloadLoading(true);
    try {
      const res = await api.post(
        "/api/ai/generate-resume-pdf",
        {
          ...formData,
          template: selectedTemplate,
        },
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "resume-" + selectedTemplate + ".pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen 
bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 
dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 
py-12 px-4 sm:px-6 lg:px-8 lg:ml-64 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto space-y-12 lg:mt-5">
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold bg-linear-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent mb-6 dark:text-white">
              Premium Resume Builder
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed dark:text-white">
              Real-time Canva-style preview • AI content generation • ATS
              optimized templates
            </p>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-5 xl:col-span-4">
              <Card className="shadow-2xl border-0 sticky top-8 h-fit">
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl flex items-center gap-3 mb-2">
                    <BsStars className="w-8 h-8" />
                    Resume Editor
                  </CardTitle>
                  <CardDescription>
                    Fill in details to see live preview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Contact */}
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900">
                      👤 Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <FaUser className="w-4 h-4" />
                          Full Name *
                        </Label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <MdEmail className="w-4 h-4" />
                          Email
                        </Label>
                        <Input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <FaPhone className="w-4 h-4" />
                          Phone
                        </Label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <FaLinkedin className="w-4 h-4" />
                          LinkedIn
                        </Label>
                        <Input
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-blue-800">
                      📋 Professional Experience
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-300">
                          Summary
                        </Label>
                        <Textarea
                          name="summary"
                          value={formData.summary}
                          onChange={handleChange}
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2">
                          Skills (comma separated)
                        </Label>
                        <Textarea
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <FaBriefcase className="w-4 h-4" />
                        Experience
                      </Label>
                      <Textarea
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <FaFolderOpen className="w-4 h-4" />
                        Projects
                      </Label>
                      <Textarea
                        name="projects"
                        value={formData.projects}
                        onChange={handleChange}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <FaGraduationCap className="w-4 h-4" />
                        Education
                      </Label>
                      <Textarea
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <FaTrophy className="w-4 h-4" />
                        Achievements
                      </Label>
                      <Textarea
                        name="achievements"
                        value={formData.achievements}
                        onChange={handleChange}
                        rows={3}
                        className="resize-none "
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="space-y-4 pt-8 border-t">
                    <Button
                      onClick={handleGenerateAI}
                      disabled={generateLoading}
                      className="w-full h-14 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-semibold flex items-center gap-3 bg-linear-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
                    >
                      {generateLoading ? (
                        <>
                          <ImSpinner2 className="w-5 h-5 animate-spin" />
                          Generating AI Content...
                        </>
                      ) : (
                        <>
                          <BsStars className="w-5 h-5" />
                          Generate with AI
                        </>
                      )}
                    </Button>

                    <div className="flex gap-4">
                      <Select
                        value={selectedTemplate}
                        onValueChange={setSelectedTemplate}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="modern">Modern Sidebar</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleDownload}
                        disabled={downloadLoading || !formData.name.trim()}
                        className="flex-1 h-14 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-semibold flex items-center gap-3 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      >
                        {downloadLoading ? (
                          <>
                            <ImSpinner2 className="w-5 h-5 animate-spin mr-2" />
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <FaDownload className="w-5 h-5 mr-2" />
                            Download PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            <div className="lg:col-span-7 xl:col-span-8">
              <Card className="shadow-2xl border-0">
                <CardHeader className="pb-8">
                  <div className="flex items-center gap-4">
                    <FaEye className="w-8 h-8 text-gray-600" />
                    <div>
                      <CardTitle className="text-2xl">Live Preview</CardTitle>
                      <CardDescription>
                        A4 sized professional preview
                      </CardDescription>
                    </div>
                    <div className="ml-auto text-xs bg-linear-to-r from-indigo-100 to-purple-100 text-indigo-800 px-4 py-2 rounded-full font-medium">
                      {selectedTemplate === "modern"
                        ? "Modern Sidebar"
                        : "Classic"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 pt-6">
                  <div className="pb-8">
                    <ResumePreview
                      data={formData}
                      template={selectedTemplate}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}