import React, { useState } from "react";
import { Search, X, Brain } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import useCompany from "../hooks/useCompany";
import { toast } from "sonner";

const CompanySearch = ({ onSearch, showAIBtn, onAIGenerate }) => {
  const [companyName, setCompanyName] = useState("");
  const { getCompany, loading, company } = useCompany();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    await getCompany(companyName);
    if (onSearch) onSearch(companyName);
    setCompanyName("");
  };

  const clearInput = () => {
    setCompanyName("");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search company (e.g. Amazon, Google)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="pl-10"
          />
          {companyName && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearInput}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button type="submit" disabled={loading || !companyName.trim()}>
          {loading ? (
            <span>Searching...</span>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search
            </>
          )}
        </Button>
      </form>
      {showAIBtn && !company && (
        <Button
          onClick={onAIGenerate}
          className="w-full mt-2 bg-black text-white hover:bg-gray-800 rounded-xl px-6 py-3 font-semibold shadow-sm hover:shadow-md transition-all"
        >
          <Brain className="h-4 w-4 mr-2" />
          Generate with AI
        </Button>
      )}
    </>
  );
};

export default CompanySearch;
