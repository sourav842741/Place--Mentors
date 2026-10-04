import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Trophy, Calendar, Award, Loader2, ArrowLeft, RefreshCw } from "lucide-react";

import CertificateHistory from "../components/certificates/CertificateHistory";
import CertificateCard from "../components/certificates/CertificateCard";
import Navbar from "@/components/Navbar";

export default function Certificates() {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [loadingBadges, setLoadingBadges] = useState(true);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingBadges(true);
      setLoadingCerts(true);

      const [badgesRes, certsRes] = await Promise.all([
        api.get("/api/xp/badges"),
        api.get("/api/certificates"),
      ]);

      setBadges(Array.isArray(badgesRes?.data?.badges) ? badgesRes.data.badges : []);
      setCertificates(Array.isArray(certsRes?.data?.data) ? certsRes.data.data : []);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoadingBadges(false);
      setLoadingCerts(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await fetchData();
      toast.success("Updated");
    } finally {
      setRefreshing(false);
    }
  };

  const availableBadges = useMemo(() => {
    return badges.filter((badge) => !certificates.some((cert) => cert.badgeName === badge.name));
  }, [badges, certificates]);

  if (loadingBadges || loadingCerts) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg text-text pt-24 lg:pl-64 px-4 md:px-8 pb-12 transition-colors duration-200">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* TOP BAR */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/profile")}
                className="rounded-xl border-border bg-surface hover:bg-surface-2 text-text transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>

              <Button
                onClick={refreshData}
                disabled={refreshing}
                className="rounded-xl bg-primary hover:bg-primary-hover text-on-primary shadow-soft transition-colors"
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>

            {/* RIGHT — Page title */}
            <div className="bg-surface border border-border px-5 py-3 rounded-2xl shadow-subtle flex items-center gap-3">
              <Award className="w-6 h-6 text-accent" />
              <h1 className="text-xl font-bold text-text">Certificates</h1>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-text-muted text-sm">
            Turn your achievements into verified and shareable certificates.
          </p>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 bg-surface-2 border border-border rounded-xl h-12 mb-6">
              <TabsTrigger
                value="available"
                className="rounded-lg text-text-muted data-[state=active]:bg-surface data-[state=active]:text-text data-[state=active]:shadow-subtle font-medium text-sm transition-all"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Available ({availableBadges.length})
              </TabsTrigger>

              <TabsTrigger
                value="history"
                className="rounded-lg text-text-muted data-[state=active]:bg-surface data-[state=active]:text-text data-[state=active]:shadow-subtle font-medium text-sm transition-all"
              >
                <Calendar className="w-4 h-4 mr-2" />
                History ({certificates.length})
              </TabsTrigger>
            </TabsList>

            {/* Available */}
            <TabsContent value="available">
              {availableBadges.length === 0 ? (
                <Card className="bg-surface border border-border rounded-2xl p-10 text-center shadow-subtle">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-soft border border-accent/20 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-text">No Certificates Available</h3>
                  <p className="text-text-muted mt-2 text-sm">Earn more badges to unlock certificates.</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {availableBadges.map((badge, index) => (
                    <CertificateCard
                      key={index}
                      badge={badge}
                      onGenerate={async () => {
                        try {
                          await api.post("/api/certificates/generate", {
                            badgeName: badge.name,
                          });

                          toast.success("Certificate created");
                          await fetchData();
                          setActiveTab("history");
                        } catch {
                          toast.error("Failed");
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* History */}
            <TabsContent value="history">
              <CertificateHistory
                certificates={certificates}
                user={user}
                onRefresh={refreshData}
                onDelete={fetchData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
