import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

import {
  ShieldCheck,
  XCircle,
  Calendar,
  User,
  Award,
  ArrowLeft,
  Download,
  Share2,
  Crown,
} from "lucide-react";

import Confetti from "react-confetti";
import { toast } from "sonner";

export default function CertificateVerifyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [verified, setVerified] =
    useState(false);

  const [data, setData] =
    useState(null);

  const logoUrl =
    "https://res.cloudinary.com/dm9hpyepi/image/upload/v1776539367/android-chrome-512x512_stedh8.png";

  useEffect(() => {
    verifyCertificate();
  }, [id]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/api/certificates/verify/${id}`
      );

      const payload =
        res?.data?.data;

      if (
        payload?.success &&
        payload?.valid
      ) {
        setVerified(true);
        setData(
          payload.certificate
        );
      } else {
        setVerified(false);
      }
    } catch (error) {
      setVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const shareCredential =
    async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            title:
              "Verified PlaceMentor Certificate",
            text: `${data?.badgeName} - ${data?.fullName}`,
            url:
              window.location.href,
          });
        } else {
          toast.info(
            "Sharing not supported"
          );
        }
      } catch {}
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6 flex items-center justify-center">
        <div className="max-w-3xl w-full space-y-5">
          <Skeleton className="h-24 rounded-3xl bg-slate-800" />
          <Skeleton className="h-96 rounded-3xl bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white px-4 py-10">

      {verified && (
        <Confetti
          recycle={false}
          numberOfPieces={220}
          gravity={0.18}
          width={
            window.innerWidth
          }
          height={
            window.innerHeight
          }
        />
      )}

      <div className="max-w-4xl mx-auto">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6 gap-3">

          <Button
            variant="outline"
            onClick={() =>
              navigate(-1)
            }
            className="rounded-2xl border-slate-700 bg-slate-900 hover:bg-slate-800 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-700 font-bold text-sm">
            PlaceMentor Verify
          </div>
        </div>

        {/* HEADER */}
        <div className="text-center mb-8">

          <img
            src={logoUrl}
            alt="logo"
            className="w-20 h-20 mx-auto rounded-3xl shadow-2xl border border-white/10"
          />

          <h1 className="text-4xl md:text-5xl font-black mt-5">
            Certificate Verification
          </h1>

          <p className="text-slate-400 mt-2 text-lg">
            Official Credential Validation
          </p>
        </div>

        {/* VERIFIED */}
        {verified && data ? (
          <Card className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-white/5 backdrop-blur-xl shadow-2xl">

            {/* TOP */}
            <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-8 text-center">

              <ShieldCheck className="w-20 h-20 mx-auto text-white" />

              <h2 className="text-4xl font-black text-white mt-4">
                VERIFIED
              </h2>

              <p className="text-emerald-100 mt-2 font-medium">
                Genuine PlaceMentor Certificate
              </p>
            </div>

            <CardContent className="p-8 md:p-10">

              <div className="grid md:grid-cols-2 gap-8">

                {/* LEFT */}
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-400 font-bold text-sm mb-5">
                    <Crown className="w-4 h-4" />
                    {data.certificateId}
                  </div>

                  <h3 className="text-3xl font-black">
                    {data.badgeName}
                  </h3>

                  <div className="mt-5 space-y-4 text-slate-300">

                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-400" />
                      {data.fullName}
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-yellow-400" />
                      {new Date(
                        data.issuedAt
                      ).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-pink-400" />
                      Official Achievement Credential
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col justify-center items-center text-center rounded-3xl bg-slate-900 border border-slate-800 p-8">

                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl">
                    <ShieldCheck className="w-14 h-14 text-white" />
                  </div>

                  <h4 className="text-2xl font-black mt-5 text-emerald-400">
                    Authentic
                  </h4>

                  <p className="text-slate-400 mt-3 leading-relaxed">
                    This certificate has been successfully validated by PlaceMentor.
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="grid md:grid-cols-2 gap-4 mt-10">

                <Button
                  onClick={() =>
                    window.print()
                  }
                  className="h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>

                <Button
                  onClick={
                    shareCredential
                  }
                  variant="outline"
                  className="h-14 rounded-2xl border-slate-700 bg-slate-900 hover:bg-slate-800 text-white text-base font-bold"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* INVALID */
          <Card className="overflow-hidden rounded-3xl border border-rose-500/20 bg-white/5 backdrop-blur-xl shadow-2xl">

            <div className="bg-gradient-to-r from-rose-500 to-red-600 p-8 text-center">

              <XCircle className="w-20 h-20 mx-auto text-white" />

              <h2 className="text-4xl font-black text-white mt-4">
                INVALID
              </h2>

              <p className="text-rose-100 mt-2">
                Certificate Not Found
              </p>
            </div>

            <CardContent className="p-8 text-center">

              <img
                src={logoUrl}
                alt="logo"
                className="w-16 h-16 mx-auto rounded-2xl mb-5"
              />

              <p className="text-slate-300 text-lg">
                This credential ID does not exist or has been revoked.
              </p>

              <div className="mt-6 px-5 py-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-rose-400">
                {id}
              </div>

              <Button
                onClick={() =>
                  navigate("/")
                }
                className="mt-8 h-14 rounded-2xl w-full bg-slate-800 hover:bg-slate-700"
              >
                Go Home
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}