import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import useCompanies from "../hooks/useCompanies";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Building2,
  Search,
  MapPin,
  ArrowRight,
  RefreshCw,
  Brain,
} from "lucide-react";
import Footer from "@/components/Footer";

const AllCompanies = () => {
  const navigate = useNavigate();
  const { companies, loading, refetch } = useCompanies();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.overview?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === "all" || company.hiring?.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-20 lg:pl-64 p-6 bg-bg min-h-screen text-text transition-colors duration-200">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <Skeleton className="h-10 w-80 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28 rounded-lg" />
                <Skeleton className="h-10 w-28 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(12)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-surface border border-border shadow-soft rounded-xl p-5 space-y-4"
                  >
                    <Skeleton className="h-6 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-2/3 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 bg-bg min-h-screen text-text transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* HEADER */}
          <div className="bg-surface rounded-xl shadow-soft border border-border p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transition-colors duration-200">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text">
                Explore Companies
              </h1>
              <p className="text-text-muted text-sm mt-1">
                Interview patterns, salary benchmarks & preparation roadmaps
              </p>
            </div>

            {/* RIGHT BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
              <Button onClick={refetch} variant="outline" className="rounded-lg w-full sm:w-auto text-sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Button
                onClick={() => navigate("/ai-search")}
                className="rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm w-full sm:w-auto shadow-soft"
              >
                <Brain className="h-4 w-4 mr-2 shrink-0" />
                AI Search Companies
              </Button>
            </div>
          </div>

          {/* SEARCH + FILTER */}
          <div className="bg-surface rounded-xl shadow-soft border border-border p-4 flex flex-col md:flex-row gap-3 items-center transition-colors duration-200">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle h-4 w-4" />
              <Input
                placeholder="Search companies by name or industry..."
                className="pl-9 rounded-lg h-9 bg-surface text-text border-border text-sm placeholder:text-text-subtle"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {["all", "Easy", "Medium", "Hard"].map((level) => (
                <Button
                  key={level}
                  size="sm"
                  variant={filterDifficulty === level ? "default" : "outline"}
                  onClick={() => setFilterDifficulty(level)}
                  className={`rounded-lg text-xs px-3 h-8 ${
                    filterDifficulty === level
                      ? "bg-primary text-on-primary font-medium"
                      : "border-border text-text-muted hover:text-text hover:bg-surface-2"
                  }`}
                >
                  {level === "all" ? "All Levels" : level}
                </Button>
              ))}
            </div>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCompanies.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-surface rounded-xl border border-border shadow-soft">
                <Building2 className="h-12 w-12 mx-auto text-text-subtle mb-3" />
                <h2 className="text-lg font-semibold text-text">
                  No companies found
                </h2>
                <p className="text-text-muted text-sm mt-1">
                  Try adjusting your search query or difficulty filter.
                </p>

                <div className="flex justify-center gap-2.5 mt-5">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterDifficulty("all");
                    }}
                    className="rounded-lg text-sm"
                  >
                    Clear Filters
                  </Button>
                  <Button onClick={refetch} className="rounded-lg text-sm bg-primary text-on-primary">
                    Refresh
                  </Button>
                </div>
              </div>
            ) : (
              filteredCompanies.map((company) => {
                const difficulty = company.hiring?.difficulty || "Medium";

                const badgeStyles = {
                  Easy: "bg-success-soft text-success",
                  Medium: "bg-accent-soft text-accent",
                  Hard: "bg-danger-soft text-danger",
                };

                return (
                  <Card
                    key={company._id || company.name}
                    onClick={() => navigate(`/company/${company.name}`)}
                    className="cursor-pointer rounded-xl shadow-soft border border-border bg-surface hover:border-primary/40 hover:shadow-subtle transition-all duration-200 card-hover"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-base font-semibold text-text line-clamp-1">
                          {company.overview?.name || company.name}
                        </CardTitle>

                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            badgeStyles[difficulty] || "bg-surface-2 text-text-muted"
                          }`}
                        >
                          {difficulty}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2.5 pt-1">
                      {company.overview?.industry && (
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Building2 className="h-3.5 w-3.5 text-text-subtle shrink-0" />
                          <span className="truncate">{company.overview.industry}</span>
                        </div>
                      )}

                      {company.overview?.headquarters && (
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <MapPin className="h-3.5 w-3.5 text-text-subtle shrink-0" />
                          <span className="truncate">{company.overview.headquarters}</span>
                        </div>
                      )}

                      {company.overview?.tagline && (
                        <p className="text-xs text-text-subtle italic line-clamp-2 pt-1">
                          "{company.overview.tagline}"
                        </p>
                      )}

                      <Button
                        className="w-full mt-3 rounded-lg text-xs h-9 bg-primary hover:bg-primary-hover text-on-primary font-medium transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/company/${company.name}`);
                        }}
                      >
                        View Details
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AllCompanies;
