
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import CompanySearch from "../components/CompanySearch";
import useCompany from "../hooks/useCompany";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateCredits } from "../redux/userSlice";
import { Brain } from "lucide-react";
import { Button } from "../components/ui/button";
import Footer from "@/components/Footer";

const AISearchPage = () => {
  const [query, setQuery] = useState("");
  const { getCompany, loading } = useCompany();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAISearch = async () => {
    if (!query) return;

    const data = await getCompany(query);

    // 🔥 CREDIT UPDATE FIX (IMPORTANT)
    const credits = data?.credits ?? data?.data?.credits;

    if (credits !== undefined) {
      dispatch(updateCredits(credits));
    }

    // 🔥 NAVIGATE
    if (data?.name || data?.data?.name) {
      const companyName = data?.name || data?.data?.name;
      navigate(`/company/${companyName.toLowerCase()}`);
    }
  };

  return (
    <>
      <Navbar />

      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">

        {/* Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-6 md:p-8 text-center space-y-6">

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Brain className="h-5 w-5" />
              <span className="text-sm font-medium">AI Search</span>
            </div>

            <h1 className="text-2xl font-semibold text-gray-900">
              Find Company Insights
            </h1>

            <p className="text-sm text-gray-500">
              Get interview prep, roadmap & insights instantly
            </p>
          </div>

          {/* Search */}
          <div className="space-y-3">
            <CompanySearch onSearch={(name) => setQuery(name)} />

            <Button
              onClick={handleAISearch}
              disabled={loading}
              className="w-full h-11 rounded-xl bg-black text-white hover:bg-gray-900"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Searching...
                </span>
              ) : (
                "Search"
              )}
            </Button>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default AISearchPage;

