import { useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Download, Share2, Award, Loader2, ShieldCheck, Crown, BadgeCheck } from "lucide-react";

import { toast } from "sonner";

export default function CertificatePreview({ certificate, badge, triggerButton, user }) {
  const [loading, setLoading] = useState(false);

  const logoUrl =
    "https://res.cloudinary.com/dm9hpyepi/image/upload/v1776539367/android-chrome-512x512_stedh8.png";

  const verifyUrl = `https://placementor.online/verify/${certificate?.certificateId}`;
  // const verifyUrl = `http://localhost:5173/verify/${certificate?.certificateId}`;

  const cleanBadgeName =
    badge?.name
      ?.replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ")
      .trim() || "Achievement";

  const generatePDF = async () => {
    try {
      setLoading(true);

      const pdf = new jsPDF("landscape", "mm", "a4");

      const width = 297;
      const height = 210;

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, width, height, "F");

      pdf.setDrawColor(20, 50, 120);
      pdf.setLineWidth(2);
      pdf.rect(6, 6, width - 12, height - 12);

      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(0.8);
      pdf.rect(10, 10, width - 20, height - 20);

      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.rect(13, 13, width - 26, height - 26);

      const logoData = await fetch(logoUrl)
        .then((r) => r.blob())
        .then(
          (blob) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            })
        );

      pdf.addImage(logoData, "PNG", 20, 15, 22, 22);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(20, 40, 90);
      pdf.text("PlaceMentor Certifications", width / 2, 24, {
        align: "center",
      });

      pdf.setFontSize(10);
      pdf.setTextColor(110);
      pdf.text("Official Verified Achievement Credential", width / 2, 31, {
        align: "center",
      });

      pdf.setFont("times", "bold");
      pdf.setFontSize(28);
      pdf.setTextColor(20);
      pdf.text("CERTIFICATE OF ACHIEVEMENT", width / 2, 54, {
        align: "center",
      });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(110);
      pdf.text("This certificate is proudly presented to", width / 2, 69, {
        align: "center",
      });

      pdf.setFont("times", "bolditalic");
      pdf.setFontSize(30);
      pdf.setTextColor(0);
      pdf.text(user?.fullName || "User", width / 2, 90, {
        align: "center",
      });

      pdf.setDrawColor(180);
      pdf.line(85, 95, 212, 95);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(90);
      pdf.text("for successfully earning the certified achievement", width / 2, 106, {
        align: "center",
      });

      pdf.setFont("times", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(212, 175, 55);
      pdf.text(cleanBadgeName, width / 2, 121, {
        align: "center",
      });

      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(0.4);
      pdf.line(105, 124, 192, 124);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(70);

      pdf.text(
        `Issued On: ${new Date(certificate?.issuedAt).toLocaleDateString("en-GB")}`,
        24,
        157
      );

      pdf.text(`Certificate ID: ${certificate?.certificateId}`, 24, 165);

      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(1);
      pdf.circle(148, 154, 14);

      pdf.setFillColor(255, 248, 220);
      pdf.circle(148, 154, 11, "F");

      pdf.setDrawColor(34, 197, 94);
      pdf.setLineWidth(1.4);
      pdf.line(144, 154, 147, 157);
      pdf.line(147, 157, 152, 149);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.setTextColor(160, 120, 20);
      pdf.text("VERIFIED", 148, 163, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      pdf.setTextColor(120);
      pdf.text("Official Credential", 148, 167, {
        align: "center",
      });

      const qrData = await QRCode.toDataURL(verifyUrl);

      pdf.addImage(qrData, "PNG", 228, 138, 28, 28);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(90);
      pdf.text("SCAN TO VERIFY", 242, 171, {
        align: "center",
      });

      pdf.setFont("times", "italic");
      pdf.setFontSize(19);
      pdf.setTextColor(40);
      pdf.text("PlaceMentor Team", 222, 184);

      pdf.setLineWidth(0.3);
      pdf.line(216, 186, 276, 186);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text("Authorized Signature", 236, 191);

      pdf.setFontSize(8);
      pdf.setTextColor(130);
      pdf.text(verifyUrl, width / 2, 198, {
        align: "center",
      });

      pdf.save(`PlaceMentor-${certificate?.certificateId}.pdf`);

      toast.success("Premium certificate downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Download failed");
    } finally {
      setLoading(false);
    }
  };

  const shareCertificate = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "PlaceMentor Certificate",
          text: `${cleanBadgeName} | ${verifyUrl}`,
        });
      } else {
        toast.info("Sharing not supported");
      }
    } catch (error) {}
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>

      {/* ONLY FIXED SCROLL ISSUE */}
      <DialogContent className="max-w-3xl w-full rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-3 border-b shrink-0">
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
            <Award className="w-7 h-7 text-yellow-500" />
            Premium Certificate Preview
          </DialogTitle>
        </DialogHeader>

        {/* SCROLLABLE BODY */}
        <div className="overflow-y-auto px-6 pb-6">
          <div className="rounded-3xl border bg-gradient-to-br from-white to-slate-50 p-8 shadow-2xl text-center mt-4">
            <img src={logoUrl} alt="logo" className="w-16 h-16 mx-auto mb-4" />

            <h2 className="text-3xl font-black text-blue-800">PlaceMentor Certifications</h2>

            <p className="text-gray-500 mt-1">Official Verified Achievement Credential</p>

            <div className="mt-6 flex justify-center gap-2">
              <BadgeCheck className="w-5 h-5 text-emerald-500" />
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>

            <h3 className="text-3xl font-bold mt-6 text-gray-900">{user?.fullName}</h3>

            <p className="text-sm text-gray-500 mt-2">has earned the achievement</p>

            <p className="text-2xl font-bold text-yellow-600 mt-4">{cleanBadgeName}</p>

            <div className="grid grid-cols-2 gap-4 mt-8 text-sm">
              <div className="rounded-2xl border bg-white p-4">
                <p className="text-gray-500">Certificate ID</p>
                <p className="font-bold mt-1">{certificate?.certificateId}</p>
              </div>

              <div className="rounded-2xl border bg-white p-4">
                <p className="text-gray-500">Issued On</p>
                <p className="font-bold mt-1">
                  {new Date(certificate?.issuedAt).toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>

            <div className="mt-7 flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                  verifyUrl
                )}`}
                alt="qr"
                className="rounded-xl border p-1 bg-white"
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">Scan to Verify</p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 justify-end pt-5 sticky bottom-0 bg-white pb-1 mt-2">
            <Button onClick={generatePDF} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download PDF
            </Button>

            <Button variant="outline" onClick={shareCertificate}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
