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
    return <div className="lg:ml-72 p-8 text-center text-lg font-semibold">Loading...</div>;
  }

  return (
    <div className="lg:ml-72 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Brain className="w-7 h-7 text-white" />
        </div>

        <div>
          <h1 className="text-3xl font-black">Maintenance Content Manager</h1>
          <p className="text-muted-foreground">Manage all maintenance hub questions</p>
        </div>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="list">Content Library ({questions.length})</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        {/* ================= LIST TAB ================= */}
        <TabsContent value="list" className="space-y-5">
          {/* SEARCH FILTER */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />

              <Input
                placeholder="Search questions..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="border rounded-md px-3 py-2 bg-background"
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
          <Card>
            <CardHeader>
              <CardTitle>Questions ({questions.length})</CardTitle>

              <CardDescription>Search and manage maintenance content</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {questions.length > 0 ? (
                questions.map((q) => (
                  <div
                    key={q._id}
                    className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{q.type?.toUpperCase()}</Badge>

                        <Badge>{q.active ? "ACTIVE" : "INACTIVE"}</Badge>
                      </div>

                      <p className="font-semibold">{q.question}</p>

                      <p className="text-sm text-muted-foreground">Answer: {q.answer}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="icon" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button size="icon" variant="destructive" onClick={() => handleDelete(q._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">No questions found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= STATS TAB ================= */}
        <TabsContent value="stats">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(typesStats) && typesStats.length > 0 ? (
              typesStats.map((stat) => (
                <Card key={stat._id}>
                  <CardHeader className="text-center">
                    <CardTitle className="text-4xl font-black text-indigo-600">
                      {stat.count}
                    </CardTitle>

                    <CardDescription className="text-lg font-semibold">
                      {stat._id?.toUpperCase()}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">Active Questions</p>

                    {stat.sample && (
                      <p className="text-xs mt-2 text-slate-500 line-clamp-2">{stat.sample}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No stats available
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
