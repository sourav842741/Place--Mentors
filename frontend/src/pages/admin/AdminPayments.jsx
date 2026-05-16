import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Shield,
  CreditCard,
  IndianRupee,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import api from "@/services/api";

const STATUS_OPTIONS = ["All", "created", "processing", "paid", "failed"];

const STATUS_META = {
  paid: {
    bg: "bg-green-500/10 border-green-500/20 text-green-500",
    dot: "bg-green-500",
    icon: CheckCircle2,
  },

  processing: {
    bg: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
    dot: "bg-yellow-500",
    icon: Clock,
  },

  created: {
    bg: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    dot: "bg-blue-500",
    icon: Clock,
  },

  failed: {
    bg: "bg-red-500/10 border-red-500/20 text-red-500",
    dot: "bg-red-500",
    icon: XCircle,
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

export default function AdminPayments() {
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [payments, setPayments] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("All");

  const [page, setPage] = useState(1);

  const [limit] = useState(20);

  const loadPayments = useCallback(async () => {
    setLoading(true);

    setError("");

    try {
      const params = new URLSearchParams();

      params.set("page", String(page));

      params.set("limit", String(limit));

      if (status !== "All") {
        params.set("status", status);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const res = await api.get(`/api/payment/admin/all?${params.toString()}`);

      setPayments(res.data?.data?.payments || []);

      setPagination(
        res.data?.data?.pagination || {
          page,
          limit,
          total: 0,
          pages: 0,
        }
      );
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load admin payments");
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const stats = useMemo(() => {
    return {
      total: payments.length,

      revenue: payments.reduce((acc, p) => acc + (p.amount || 0), 0),

      credits: payments.reduce((acc, p) => acc + (p.credits || 0), 0),

      success: payments.filter((p) => p.status === "paid").length,
    };
  }, [payments]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020817] lg:ml-72 p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* HEADER */}

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              Admin Payments
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Monitor transactions, credits and payment activity.
            </p>
          </div>
        </motion.div>

        {/* STATS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              title: "Total Payments",
              value: stats.total,
              icon: CreditCard,
            },

            {
              title: "Revenue",
              value: `₹${stats.revenue}`,
              icon: IndianRupee,
            },

            {
              title: "Credits Sold",
              value: stats.credits,
              icon: Wallet,
            },

            {
              title: "Successful",
              value: stats.success,
              icon: CheckCircle2,
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.title}</p>

                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                      {item.value}
                    </h2>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FILTERS */}

        <Card className="border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user id or razorpay ids..."
                  className="pl-10 h-12 rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-2xl border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>

                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s === "All" ? "All Statuses" : s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => setPage(1)}
                  className="h-12 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PAYMENTS */}

        <div className="grid gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-3xl" />
            ))
          ) : payments.length === 0 ? (
            <Card className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
              <CardContent className="p-10 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  No payments found
                </h3>

                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  No payment records available right now.
                </p>
              </CardContent>
            </Card>
          ) : (
            payments.map((p, idx) => {
              const meta = STATUS_META[p.status] || STATUS_META.created;

              const StatusIcon = meta.icon;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-xl hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                        {/* LEFT */}

                        <div className="space-y-4 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge
                              variant="outline"
                              className={`${meta.bg} rounded-full px-4 py-1.5 border`}
                            >
                              <span className={`w-2 h-2 rounded-full mr-2 ${meta.dot}`} />

                              <StatusIcon className="w-4 h-4 mr-1" />

                              {p.status}
                            </Badge>

                            <Badge variant="outline" className="rounded-full px-4 py-1.5">
                              {p.credits_added ? "Credits Added" : "Pending Credits"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">User ID</p>

                              <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                                {p.user_id}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Plan</p>

                              <p className="font-semibold text-gray-900 dark:text-white">
                                {p.plan_id}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>

                              <p className="font-semibold text-gray-900 dark:text-white">
                                ₹{p.amount}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Credits</p>

                              <p className="font-semibold text-gray-900 dark:text-white">
                                {p.credits}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:min-w-[450px]">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Razorpay Order ID
                            </p>

                            <p className="font-mono text-xs text-gray-900 dark:text-white break-all">
                              {p.razorpay_order_id}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Razorpay Payment ID
                            </p>

                            <p className="font-mono text-xs text-gray-900 dark:text-white break-all">
                              {p.razorpay_payment_id || "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>

                            <p className="text-sm text-gray-900 dark:text-white">
                              {formatDateTime(p.created_at)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Updated</p>

                            <p className="text-sm text-gray-900 dark:text-white">
                              {formatDateTime(p.updated_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />

              <p>{error}</p>
            </div>
          </div>
        )}

        {/* PAGINATION */}

        {!loading && pagination?.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              className="rounded-2xl"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              Page <span className="font-bold">{pagination.page}</span> of {pagination.pages}
            </div>

            <Button
              variant="outline"
              className="rounded-2xl"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
