import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Award, Sparkles, ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CertificateCard({ badge, onGenerate }) {
  const navigate = useNavigate();

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300">
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-500 pointer-events-none rounded-2xl" />

      <CardContent className="relative p-6">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="px-3 py-1 rounded-full bg-success-soft text-success text-xs font-bold flex items-center gap-1 border border-success/20">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </div>
        </div>

        {/* Badge Preview Area */}
        <div className="relative mb-6">
          <div className="h-36 rounded-xl bg-gradient-to-br from-primary to-accent/70 p-[1.5px] shadow-md">
            <div className="h-full rounded-xl bg-surface flex flex-col items-center justify-center gap-2">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent via-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-500">
                {badge.icon || "🏆"}
              </div>

              <p className="text-[10px] tracking-[0.3em] font-bold text-text-subtle uppercase">
                Certificate Ready
              </p>
            </div>
          </div>

          {/* Sparkle */}
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-accent animate-pulse" />
        </div>

        {/* Badge Info */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-text leading-tight">
            {badge.name}
          </h3>

          <div className="flex justify-center items-center gap-1.5 text-sm text-text-muted">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(badge.earnedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          <p className="text-xs text-text-subtle max-w-xs mx-auto leading-relaxed">
            Convert your achievement into a premium shareable certificate.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onGenerate}
          className="mt-6 w-full h-12 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-hover text-on-primary shadow-soft transition-all duration-200"
        >
          <Award className="w-4 h-4 mr-2" />
          Generate Certificate
        </Button>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-[11px] text-text-subtle font-medium">
            PlaceMentor Verified Achievement
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
