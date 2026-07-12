import Footer from "@/components/Footer";
import { Brain } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import CompanySearch from "../components/CompanySearch";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import useCompany from "../hooks/useCompany";
import { updateCredits } from "../redux/userSlice";

const AISearchPage = () => {
  const [query, setQuery] = useState("");
  const { getCompany, loading } = useCompany();

  // Prevent duplicate requests
  const [requestInFlight, setRequestInFlight] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAISearch = async (overrideName) => {
    const name = (overrideName ?? query)?.trim();

    if (!name) return;
    if (requestInFlight) return;

    setRequestInFlight(true);

    try {
      const data = await getCompany(name);

      // Update credits
      const credits = data?.credits ?? data?.data?.credits;

      if (credits !== undefined) {
        dispatch(updateCredits(credits));
      }

      // Navigate
      const companyName =
        data?.company?.name ??
        data?.name ??
        data?.data?.name;

      if (companyName) {
        navigate(`/company/${companyName.toLowerCase()}`);
      }
    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setRequestInFlight(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="pt-20 min-h-screen bg-gradient-to-br from-background via-background to-primary/5 transition-colors duration-300 flex items-center justify-center px-4">
        <div className="relative w-full max-w-lg">
          {/* Glow */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600/30 via-fuchsia-500/20 to-blue-500/30 blur-2xl dark:opacity-100 opacity-70"></div>

          {/* Card */}
          <div className="relative rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center space-y-4 mb-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>

              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-500 to-blue-600 bg-clip-text text-transparent">
                  AI Company Search
                </h1>

                <p className="mt-2 text-muted-foreground">
                  Get interview preparation, hiring roadmap, salary insights &
                  company analysis powered by AI.
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="space-y-5">
              <CompanySearch
                onSearch={(name) => {
                  setQuery(name);
                  handleAISearch(name);
                }}
              />

              <Button
                onClick={() => handleAISearch()}
                disabled={loading || requestInFlight}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 hover:opacity-90 text-white font-semibold shadow-lg transition-all duration-300"
              >
                {loading || requestInFlight ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        opacity="0.25"
                      />
                      <path
                        fill="currentColor"
                        d="M22 12a10 10 0 00-10-10v4a6 6 0 016 6h4z"
                      />
                    </svg>
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Brain className="h-5 w-5" />
                    Search Company
                  </span>
                )}
              </Button>
            </div>

            {/* Bottom */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/50 bg-muted/40 p-3 text-center">
                <p className="text-lg font-bold text-violet-600">AI</p>
                <p className="text-xs text-muted-foreground">Analysis</p>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/40 p-3 text-center">
                <p className="text-lg font-bold text-fuchsia-600">ATS</p>
                <p className="text-xs text-muted-foreground">Hiring</p>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/40 p-3 text-center">
                <p className="text-lg font-bold text-blue-600">24/7</p>
                <p className="text-xs text-muted-foreground">Insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AISearchPage;