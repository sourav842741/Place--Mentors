import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CompanySearch from "../components/CompanySearch";
import useCompany from "../hooks/useCompany";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import {
  Building2,
  Users,
  DollarSign,
  BookOpen,
  Play,
  Code,
  Brain,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "../components/ui/button";

const CompanyPage = () => {
  const { name: paramName } = useParams();
  const navigate = useNavigate();
  const { company, loading, error, credits, getCompany } = useCompany();

  // Auto fetch if param name
  useEffect(() => {
    if (paramName) {
      getCompany(paramName.toLowerCase());
    }
  }, [paramName]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-16 md:pl-64 p-6 bg-gray-50 min-h-screen ">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-12 w-96" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill()
                .map((_, i) => (
                  <Skeleton key={i} className="h-48" />
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
      <div className="pt-16 md:pl-64 p-4 md:p-6 mt-6 bg-gray-50 min-h-screen lg:mt-16 ml-5 sm:mt-5">
        <div className="max-w-7xl mx-auto">
          {/* Header + Search */}
 <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border flex flex-col md:flex-row md:items-center md:justify-between gap-4">

  <div className="flex items-center gap-4">
    <Button
      variant="outline"
      onClick={() => navigate("/companies")}
      className="rounded-xl shadow-sm hover:shadow-md transition"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>

    <div>
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
        {company?.overview?.name || "Company Details"}
      </h1>
      <p className="text-sm text-gray-500">
        {company?.overview?.tagline || "Preparation guide"}
      </p>
    </div>
  </div>


</div>

         

          {company && (
            <>
             

              {/* Sections Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {/* 1. Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-bold text-xl">
                        {company?.overview?.name || "N/A"}
                      </h3>
                      {company?.overview?.tagline && (
                        <p className="text-2xl font-light italic text-gray-600 mt-2">
                          {company?.overview?.tagline}
                        </p>
                      )}
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {company?.overview?.description ||
                        "No description available"}
                    </p>

                    <p className="text-gray-600 leading-relaxed">
                      {company?.overview?.industry ||
                        "No description available"}
                    </p>

                    <p className="text-gray-600 leading-relaxed">
                      {company?.overview?.headquarters ||
                        "No description available"}
                    </p>
                  </CardContent>
                </Card>

                {/* 2. Hiring Process */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Hiring Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {company?.hiring?.pattern?.length ? (
                      <div className="space-y-2">
                        {company.hiring.pattern.map((round, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <Badge
                              variant="secondary"
                              className="mt-0.5 flex-shrink-0"
                            >
                              Round {i + 1}
                            </Badge>
                            <div>
                              <h4 className="font-semibold">{round?.round}</h4>
                              <p className="text-sm text-gray-600">
                                {round?.details}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No hiring info</p>
                    )}
                  </CardContent>
                </Card>

                {/* 3. Salary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Salary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {company.salary ? (
                      <>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-700">
                            {company.salary.average || "N/A"}
                          </p>
                          <p className="text-sm text-green-600">Average CTC</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-semibold">Intern:</span>{" "}
                            {company.salary.intern || "N/A"}
                          </div>
                          <div>
                            <span className="font-semibold">Bonus:</span>{" "}
                            {company.salary.bonus || "N/A"}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 italic">
                        Salary info not available
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* 3. Exam Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Exam Timeline
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* ✅ Exam Timeline */}
                    {company?.examTimeline ? (
                      <>
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                          <p className="text-lg font-bold text-blue-700">
                            {company.examTimeline.expected || "N/A"}
                          </p>
                          <p className="text-sm text-blue-600">Expected</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div>
                            <span className="font-semibold">Last Year:</span>{" "}
                            {company.examTimeline.lastYear || "N/A"}
                          </div>

                          <div>
                            <span className="font-semibold">Note:</span>{" "}
                            {company.examTimeline.note || "N/A"}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 italic">
                        Exam timeline not available
                      </p>
                    )}

                    {/* 🔥 Roadmap + Daily Plan (YAHIN ADD KARNA HAI) */}
                    {(company?.preparation?.roadmap ||
                      company?.preparation?.dailyPlanGuide) && (
                      <div className="p-4 bg-purple-50 rounded-lg space-y-3">
                        {company?.preparation?.roadmap && (
                          <div>
                            <h4 className="font-semibold text-purple-700">
                              Roadmap
                            </h4>
                            <p className="text-sm text-gray-700 mt-1">
                              {company.preparation.roadmap}
                            </p>
                          </div>
                        )}

                        {company?.preparation?.dailyPlanGuide && (
                          <div>
                            <h4 className="font-semibold text-purple-700">
                              Daily Plan
                            </h4>
                            <p className="text-sm text-gray-700 mt-1">
                              {company.preparation.dailyPlanGuide}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 🔥 Cutoff Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Cutoff Criteria
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {company?.cutoff ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-green-50 rounded-lg text-center">
                            <p className="text-sm text-gray-500">Aptitude</p>
                            <p className="font-bold text-green-700">
                              {company.cutoff.aptitude || "N/A"}
                            </p>
                          </div>

                          <div className="p-3 bg-yellow-50 rounded-lg text-center">
                            <p className="text-sm text-gray-500">Coding</p>
                            <p className="font-bold text-yellow-700">
                              {company.cutoff.coding || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg text-sm">
                          <span className="font-semibold">Note: </span>
                          {company.cutoff.note || "N/A"}
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 italic">
                        Cutoff info not available
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* 4. Preparation */}
                <Card className="lg:col-span-2 2xl:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Preparation Roadmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {company?.preparation ? (
                      <>
                        {company?.preparation?.topics && (
                          <>
                            {/* Must Do */}
                            {company?.preparation?.topics?.mustDo?.length >
                              0 && (
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Must Do Topics
                                </h4>
                                <div className="flex flex-wrap gap-1 mb-4">
                                  {company?.preparation?.topics?.mustDo?.map(
                                    (topic, i) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {topic}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Aptitude */}
                            {Object.values(
                              company?.preparation?.topics?.aptitude || {},
                            ).some((arr) => arr?.length > 0) && (
                              <div>
                                <h4 className="font-semibold mb-2">Aptitude</h4>
                                <div className="space-y-2">
                                  {[
                                    {
                                      title: "Quantitative",
                                      topics:
                                        company?.preparation?.topics?.aptitude
                                          ?.quantitative,
                                    },
                                    {
                                      title: "Logical",
                                      topics:
                                        company?.preparation?.topics?.aptitude
                                          ?.logical,
                                    },
                                    {
                                      title: "Verbal",
                                      topics:
                                        company?.preparation?.topics?.aptitude
                                          ?.verbal,
                                    },
                                  ].map(
                                    ({ title, topics }) =>
                                      topics?.length > 0 && (
                                        <div
                                          key={title}
                                          className="flex flex-wrap gap-1"
                                        >
                                          <span className="text-xs font-medium text-gray-500 mr-2">
                                            {title}:
                                          </span>
                                          {topics.map((topic, i) => (
                                            <Badge
                                              key={i}
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              {topic}
                                            </Badge>
                                          ))}
                                        </div>
                                      ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Core Subjects */}
                            {Object.values(
                              company.preparation.topics.coreSubjects || {},
                            ).some((arr) => arr?.length > 0) && (
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Core Subjects
                                </h4>
                                <div className="space-y-2">
                                  {[
                                    {
                                      title: "OS",
                                      topics:
                                        company?.preparation?.topics
                                          ?.coreSubjects?.os,
                                    },
                                    {
                                      title: "DBMS",
                                      topics:
                                        company?.preparation?.topics
                                          ?.coreSubjects?.dbms,
                                    },
                                    {
                                      title: "OOPS",
                                      topics:
                                        company?.preparation?.topics
                                          ?.coreSubjects?.oops,
                                    },
                                  ].map(
                                    ({ title, topics }) =>
                                      topics?.length > 0 && (
                                        <div
                                          key={title}
                                          className="flex flex-wrap gap-1"
                                        >
                                          <span className="text-xs font-medium text-gray-500 mr-2">
                                            {title}:
                                          </span>
                                          {topics.map((topic, i) => (
                                            <Badge
                                              key={i}
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {topic}
                                            </Badge>
                                          ))}
                                        </div>
                                      ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Advanced */}
                            {Object.values(
                              company.preparation.topics.advanced || {},
                            ).some((arr) => arr?.length > 0) && (
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Advanced Topics
                                </h4>
                                <div className="space-y-2">
                                  {[
                                    {
                                      title: "System Design",
                                      topics:
                                        company?.preparation?.topics?.advanced
                                          ?.systemDesign,
                                    },
                                    {
                                      title: "CS Concepts",
                                      topics:
                                        company?.preparation?.topics?.advanced
                                          ?.csConcepts,
                                    },
                                  ].map(
                                    ({ title, topics }) =>
                                      topics?.length > 0 && (
                                        <div
                                          key={title}
                                          className="flex flex-wrap gap-1"
                                        >
                                          <span className="text-xs font-medium text-gray-500 mr-2">
                                            {title}:
                                          </span>
                                          {topics.map((topic, i) => (
                                            <Badge
                                              key={i}
                                              variant="destructive"
                                              className="text-xs"
                                            >
                                              {topic}
                                            </Badge>
                                          ))}
                                        </div>
                                      ),
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 italic">
                        No preparation info
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* 5. Resources */}
                <Card className="lg:col-span-2 2xl:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {company.resources ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {company.resources.youtube && (
                          <div>
                            <h4 className="font-semibold mb-2">YouTube</h4>
                            <div className="space-y-1">
                              {company?.resources?.youtube
                                ?.filter((item) => {
                                  const url =
                                    typeof item === "string"
                                      ? item
                                      : item?.link;
                                  return url && typeof url === "string";
                                })
                                .map((item, i) => {
                                  const url =
                                    typeof item === "string" ? item : item.link;
                                  const displayText =
                                    (typeof item === "object" && item.title
                                      ? item.title
                                      : url.replace(
                                          "https://www.youtube.com/watch?v=",
                                          "",
                                        )
                                    ).slice(0, 50) +
                                    (url.length > 50 ? "..." : "");
                                  return (
                                    <a
                                      key={i}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block text-blue-600 hover:underline text-sm"
                                    >
                                      • {displayText}
                                    </a>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                        {company?.resources?.coding && (
                          <div>
                            <h4 className="font-semibold mb-2">Coding</h4>
                            <div className="space-y-1">
                              {company?.resources?.coding?.map((item, i) => (
                                <a
                                  key={i}
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-blue-600 hover:underline text-sm"
                                >
                                  • {item.platform}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 🔥 NEW: Aptitude section */}
                        {company?.resources?.aptitude && (
                          <div>
                            <h4 className="font-semibold mb-2">Aptitude</h4>
                            <div className="space-y-1">
                              {company?.resources?.aptitude?.map((item, i) => (
                                <a
                                  key={i}
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-green-600 hover:underline text-sm"
                                >
                                  • {item.platform}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        No resources available
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* 6. Strategy */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Strategy & Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {company?.strategy?.finalTips?.length ? (
                      <>
                        <div>
                          <h4 className="font-semibold mb-2">Tips</h4>
                          <ul className="space-y-1 list-disc list-inside text-sm">
                            {company?.strategy?.finalTips?.map((tip, i) => (
                              <li key={i}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                        {company.strategy.mistakesToAvoid?.length && (
                          <div>
                            <h4 className="font-semibold mb-2">
                              Mistakes to Avoid
                            </h4>
                            <ul className="space-y-1 list-disc list-inside text-sm text-orange-700">
                              {company?.strategy?.mistakesToAvoid?.map(
                                (mistake, i) => (
                                  <li key={i}>{mistake}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 italic">No strategy info</p>
                    )}
                  </CardContent>
                </Card>

                {/* 7. AI Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {company.aiFeatures ? (
                      <div className="space-y-3">
                        {company?.aiFeatures?.resumeTips && (
                          <div>
                            <h4 className="font-semibold mb-1">Resume Tips</h4>
                            <p className="text-sm">
                              {company.aiFeatures.resumeTips}
                            </p>
                          </div>
                        )}

                        {Array.isArray(
                          company.aiFeatures?.interviewQuestions,
                        ) &&
                          company.aiFeatures.interviewQuestions.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-1">
                                Sample Interview Questions
                              </h4>
                              <div className="space-y-2 mt-2">
                                {company?.aiFeatures?.interviewQuestions
                                  ?.slice(0, 3)
                                  .map((q, i) => (
                                    <div
                                      key={i}
                                      className="p-3 bg-gray-50 rounded-lg text-sm"
                                    >
                                      Q{i + 1}: {q}
                                    </div>
                                  ))}
                                {company.aiFeatures.interviewQuestions.length >
                                  3 && (
                                  <p className="text-xs text-gray-500">
                                    ... and{" "}
                                    {company.aiFeatures.interviewQuestions
                                      .length - 3}{" "}
                                    more
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        AI features coming soon
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CompanyPage;
