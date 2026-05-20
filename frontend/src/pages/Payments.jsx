import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock, Loader2, Plus, Shield, Ticket } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import api from "@/services/api";

const STATUS_META = {
  paid: {
    label: "Success",
    tone: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  processing: {
    label: "Processing",
    tone: "bg-yellow-50 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-500",
  },
  failed: { label: "Failed", tone: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  created: {
    label: "Processing",
    tone: "bg-yellow-50 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-500",
  },
};

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

export default function Payments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page] = useState(1);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/payment/me?page=${page}&limit=20`);
        // Expected: { success, data: { payments: [], pagination: {} } }
        if (!mounted) return;
        const payments = res?.data?.data?.payments;
        setPayments(Array.isArray(payments) ? payments : []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || "Failed to load payments");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [page]);

  const hasPayments = payments.length > 0;

  const handleReportIssue = (payment) => {
    // Open existing support system. Technical IDs must NOT be shown to user.
    // We embed trace into navigation state for SupportPage to consume.
    navigate("/support", {
      state: {
        ticketPrefill: {
          category: "Payment",
          subject: "Payment issue",
          priority: "Medium",
          description:
            `Describe your issue here...\n\n` +
            `--- Internal Trace (do not share) ---\n` +
            `Payment status: ${payment?.status || "unknown"}\n` +
            `Plan: ${payment?.planId || "unknown"}\n` +
            `Credits added: ${payment?.creditsAdded ? "Yes" : "No"}\n` +
            `Payment note: Razorpay IDs are intentionally not shown to the user.\n`,
          // Silently include if admin can trace (only available if backend returns IDs; user endpoint omits them)
          // so this will gracefully degrade.
          internal: {
            status: payment?.status,
            planId: payment?.planId,
            credits: payment?.credits,
          },
        },
      },
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 lg:pl-64 pt-16 transition-colors duration-300">
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Payments / Transactions
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Track payment status and your added credits.
              </p>
            </div>
          </motion.div>

          <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardContent className="p-4 md:p-6 space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))}
                </div>
              ) : !hasPayments ? (
                <div className="flex flex-col items-center justify-center text-center py-14">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Ticket className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    No transactions yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                    When you complete a purchase, you’ll see its status and credits here.
                  </p>
                  <Button
                    onClick={() => navigate("/pricing")}
                    className="mt-5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                  >
                    View Plans
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((p, idx) => {
                    const meta = STATUS_META[p.status] || STATUS_META.created;
                    const statusDot = meta?.dot || "bg-gray-400";

                    return (
                      <div
                        key={p.id || idx}
                        className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                      >
                        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-3.5 h-3.5 mt-2 rounded-full ${statusDot}`} />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className={`border ${meta.tone} rounded-full px-3 py-1`}
                                >
                                  {meta.label}
                                </Badge>
                                {p.creditsAdded && (
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50 border-blue-200 text-blue-700 rounded-full px-3 py-1"
                                  >
                                    Credits added
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Purchased plan
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {p.planId || "—"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                            <div className="min-w-[120px]">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Credits</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {p.credits ?? 0}
                              </p>
                            </div>
                            <div className="min-w-[120px]">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                ₹{p.amount ?? 0}
                              </p>
                            </div>
                            <div className="col-span-2 sm:col-span-2 min-w-[180px]">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Payment date
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {formatDateTime(p.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />

                        <div className="p-4 md:p-5 flex items-center justify-between gap-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {p.status === "processing" || p.status === "created"
                              ? "We’re confirming your payment. Credits will appear once complete."
                              : p.status === "paid"
                                ? "Credits added successfully."
                                : "Payment failed. You can report the issue for help."}
                          </div>
                          <Button
                            onClick={() => handleReportIssue(p)}
                            variant="outline"
                            className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Report Issue
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />

      {/* SupportPage will read state and open modal with prefills */}
    </>
  );
}
