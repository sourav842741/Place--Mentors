import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Download,
  Share2,
  Trash2,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Award,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import api from "../../services/api";
import CertificatePreview from "./CertificatePreview";

export default function CertificateHistory({ certificates, onRefresh, user }) {
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleDelete = async (certId) => {
    const ok = confirm("Delete this certificate?");
    if (!ok) return;

    try {
      setDeletingId(certId);
      await api.delete(`/api/certificates/${certId}`);
      toast.success("Certificate deleted");
      onRefresh();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const refreshNow = async () => {
    try {
      setRefreshing(true);
      await onRefresh();
      toast.success("Updated");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            Certificate History
          </h2>
          <p className="text-text-muted text-sm mt-1">
            {certificates.length} verified certificate{certificates.length !== 1 ? "s" : ""} generated
          </p>
        </div>

        <Button
          onClick={refreshNow}
          disabled={refreshing}
          variant="outline"
          className="rounded-xl border-border bg-surface hover:bg-surface-2 text-text transition-colors"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Empty State */}
      {certificates.length === 0 ? (
        <Card className="rounded-2xl bg-surface border border-border shadow-subtle">
          <CardContent className="p-14 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
              <Calendar className="w-8 h-8 text-text-muted/40" />
            </div>
            <h3 className="text-lg font-bold text-text">No Certificates Yet</h3>
            <p className="text-text-muted mt-2 text-sm max-w-md mx-auto">
              Generate certificates from your achievements and they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card
              key={cert._id}
              className="group rounded-2xl overflow-hidden bg-surface border border-border shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <CardContent className="p-6">
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-text-subtle uppercase tracking-widest">
                      Certificate ID
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">{cert.certificateId}</p>
                  </div>

                  <Badge className="rounded-full bg-success-soft text-success border border-success/20 px-3 py-1 text-xs font-semibold">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>

                {/* Preview */}
                <div className="mt-5 rounded-xl bg-surface-2 border border-border p-5 text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto bg-gradient-to-br from-accent via-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-md">
                    {cert.metadata?.badgeIcon || "🏆"}
                  </div>

                  <h3 className="text-base font-bold text-text mt-4 leading-tight">
                    {cert.badgeName}
                  </h3>

                  <div className="mt-2 flex justify-center items-center gap-1.5 text-xs text-text-muted">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(cert.issuedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 mt-5">
                  <CertificatePreview
                    certificate={cert}
                    badge={{
                      name: cert.badgeName,
                      icon: cert.metadata?.badgeIcon,
                    }}
                    user={user}
                    triggerButton={
                      <Button className="rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium shadow-soft transition-colors">
                        <Download className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                    }
                  />

                  <Button
                    variant="outline"
                    className="rounded-xl border-border bg-surface hover:bg-surface-2 text-text text-xs font-medium transition-colors"
                    onClick={() =>
                      navigator.share?.({
                        title: "PlaceMentor Certificate",
                        text: `${cert.badgeName} | ${cert.certificateId}`,
                      }) || toast.info("Sharing not supported")
                    }
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1" />
                    Share
                  </Button>

                  <Button
                    variant="outline"
                    className="rounded-xl border-danger/30 bg-danger-soft hover:bg-danger/20 text-danger text-xs font-medium transition-colors"
                    disabled={deletingId === cert._id}
                    onClick={() => handleDelete(cert._id)}
                  >
                    {deletingId === cert._id ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                    )}
                    Delete
                  </Button>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-border text-center">
                  <p className="text-[11px] text-text-subtle">PlaceMentor Verified Credential</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
