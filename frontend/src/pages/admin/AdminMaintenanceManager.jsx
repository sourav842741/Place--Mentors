import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Search, Plus, Edit, Trash2, Brain } from "lucide-react";

const TYPES = ["hr", "aptitude", "coding", "vocab", "myth", "shortcut", "quote"];

export default function AdminMaintenanceManager() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  // ================= FETCH QUESTIONS =================
  const { data: questionsData, isLoading } = useQuery({
    queryKey: ["maintenance-questions", search, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (typeFilter) params.append("type", typeFilter);

      const res = await api.get(`/api/maintenance/list?${params}`);
      return res.data.data || { questions: [], pagination: {} };
    },
    staleTime: 1000 * 60 * 5,
  });

  // ================= FETCH STATS =================
  const { data: typesStats = [] } = useQuery({
    queryKey: ["maintenance-types"],
    queryFn: async () => {
      const res = await api.get("/api/maintenance/all-types");
      return res.data.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // ================= DELETE =================
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/maintenance/${id}`),
    onSuccess: () => {
      toast.success("Question deleted");
      queryClient.invalidateQueries({
        queryKey: ["maintenance-questions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["maintenance-types"],
      });
    },
    onError: () => toast.error("Delete failed"),
  });

  const handleDelete = (id) => {
    const ok = window.confirm("Delete this question?");
    if (ok) deleteMutation.mutate(id);
  };

  const questions = questionsData?.questions || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text lg:ml-72 p-10 flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text lg:ml-72 p-4 md:p-6 space-y-6 transition-colors duration-200">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Brain className="w-6 h-6 text-white" />
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-black text-text">Maintenance Content Manager</h1>
          <p className="text-text-muted mt-1">Manage all maintenance hub questions</p>
        </div>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md border border-border bg-surface-2 p-1 rounded-xl">
          <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-surface data-[state=active]:text-text text-text-muted">
            Content Library ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-lg data-[state=active]:bg-surface data-[state=active]:text-text text-text-muted">
            Stats
          </TabsTrigger>
        </TabsList>

        {/* ================= LIST TAB ================= */}
        <TabsContent value="list" className="space-y-5 mt-6">
          {/* SEARCH FILTER */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-text-subtle" />

              <Input
                placeholder="Search questions..."
                className="pl-10 h-11 rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="border border-border rounded-xl px-3 py-2 bg-surface-2 text-text h-11 focus:border-primary focus:outline-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>

              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* TABLE */}
          <Card className="border border-border bg-surface text-text shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-text font-bold">Questions ({questions.length})</CardTitle>

              <CardDescription className="text-text-muted">Search and manage maintenance content</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {questions.length > 0 ? (
                questions.map((q) => (
                  <div
                    key={q._id}
                    className="border border-border bg-surface-2/40 hover:bg-surface-2/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-primary-soft text-primary border border-primary/20 rounded-full px-3 py-1 font-medium">{q.type?.toUpperCase()}</Badge>

                        <Badge className={`rounded-full px-3 py-1 font-medium ${q.active ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-surface-2 text-text-muted border border-border"}`}>
                          {q.active ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </div>

                      <p className="font-semibold text-text">{q.question}</p>

                      <p className="text-sm text-text-muted">Answer: {q.answer}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="rounded-xl border-border bg-surface text-text hover:bg-surface-2">
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button size="icon" variant="destructive" onClick={() => handleDelete(q._id)} className="rounded-xl bg-red-600 hover:bg-red-700 text-white">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-text-muted">No questions found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= STATS TAB ================= */}
        <TabsContent value="stats" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(typesStats) && typesStats.length > 0 ? (
              typesStats.map((stat) => (
                <Card key={stat._id} className="border border-border bg-surface text-text shadow-sm rounded-2xl">
                  <CardHeader className="text-center">
                    <CardTitle className="text-4xl font-black text-primary">
                      {stat.count}
                    </CardTitle>

                    <CardDescription className="text-lg font-semibold text-text mt-1">
                      {stat._id?.toUpperCase()}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-center">
                    <p className="text-sm text-text-muted">Active Questions</p>

                    {stat.sample && (
                      <p className="text-xs mt-2 text-text-subtle line-clamp-2">{stat.sample}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-text-muted">
                No stats available
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
