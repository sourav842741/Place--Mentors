import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useCompanies from '../hooks/useCompanies';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Building2,
  Search,
  Users,
  MapPin,
  ArrowRight,
  RefreshCw,
  Filter,
  AlertCircle,
  Brain,
} from 'lucide-react';
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription
} from '../components/ui/glass-card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { cn } from '../lib/utils';
import Footer from '@/components/Footer';
import SuccessStories from '@/components/SuccessStories';

const AllCompanies = () => {
  const navigate = useNavigate();
  const { companies, loading, error, refetch } = useCompanies();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.overview?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || company.hiring?.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-16 md:pl-64 p-6 bg-gray-50 min-h-screen ">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <Skeleton className="h-12 w-96" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array(12).fill().map((_, i) => (
                <div key={i} className="group bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-6 space-y-4 animate-pulse hover:shadow-2xl transition-all">
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-4/5"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/5"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-full"></div>
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

    <div className="pt-16 md:pl-64 p-6 md:p-10 bg-gradient-to-br mt-8 from-gray-50 to-gray-100 min-h-screen lg:mt-8 ml-5 sm:mt-8 ">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Explore Companies
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Interview patterns, salary & preparation roadmap
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={refetch}
              variant="outline"
              className="rounded-xl"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button
              onClick={() => navigate("/ai-search")}
              className="rounded-xl bg-black text-white cursor-pointer"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Search for more compines
            </Button>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 flex flex-col md:flex-row gap-3 items-center">

          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search companies..."
              className="pl-10 rounded-xl h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {['All', 'Easy', 'Medium', 'Hard'].map((level) => (
              <Button
                key={level}
                size="sm"
                variant={filterDifficulty === level.toLowerCase() ? "default" : "outline"}
                onClick={() => setFilterDifficulty(level.toLowerCase())}
                className="rounded-full text-xs px-3"
              >
                {level}
              </Button>
            ))}
          </div>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {filteredCompanies.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border shadow-sm">
              <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800">
                No companies found
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Try changing search or filters
              </p>

              <div className="flex justify-center gap-3 mt-6">
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear
                </Button>
                <Button onClick={refetch}>
                  Refresh
                </Button>
              </div>
            </div>
          ) : (
            filteredCompanies.map((company) => {
              const difficulty = company.hiring?.difficulty || 'Medium';

              const badgeColors = {
                Easy: 'bg-green-100 text-green-700',
                Medium: 'bg-yellow-100 text-yellow-700',
                Hard: 'bg-red-100 text-red-700'
              };

              return (
                <Card
                  key={company._id || company.name}
                  onClick={() => navigate(`/company/${company.name}`)}
                  className="cursor-pointer rounded-2xl shadow-sm border hover:shadow-md transition"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {company.overview?.name || company.name}
                      </CardTitle>

                      <Badge className={`text-xs ${badgeColors[difficulty]}`}>
                        {difficulty}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">

                    {company.overview?.industry && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4" />
                        {company.overview.industry}
                      </div>
                    )}

                    {company.overview?.headquarters && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {company.overview.headquarters}
                      </div>
                    )}

                    {company.overview?.tagline && (
                      <p className="text-xs text-gray-500 italic line-clamp-2">
                        "{company.overview.tagline}"
                      </p>
                    )}

                    <Button
                      className="w-full mt-4 rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/company/${company.name}`);
                      }}
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>

                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

      </div>
    </div>
    <SuccessStories/>
    <Footer/>
  </>
);
};

export default AllCompanies;

