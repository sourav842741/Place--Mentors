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
  Filter,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill().map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
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
      <div className="pt-16 md:pl-64 p-4 md:p-6 bg-gray-50 min-h-screen mt-17">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  All Companies
                </h1>
                <p className="text-xl text-gray-600">
                  {companies.length} companies in database
                </p>
              </div>
              <Button onClick={refetch} variant="outline" className="self-start md:self-auto">
                <span className="sr-only md:not-sr-only">Refresh</span>
                ↻
              </Button>
            </div>

            {error && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Search & Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search companies by name..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterDifficulty === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterDifficulty('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filterDifficulty === 'Easy' ? 'default' : 'outline'}
                  onClick={() => setFilterDifficulty('Easy')}
                  size="sm"
                >
                  Easy
                </Button>
                <Button
                  variant={filterDifficulty === 'Medium' ? 'default' : 'outline'}
                  onClick={() => setFilterDifficulty('Medium')}
                  size="sm"
                >
                  Medium
                </Button>
                <Button
                  variant={filterDifficulty === 'Hard' ? 'default' : 'outline'}
                  onClick={() => setFilterDifficulty('Hard')}
                  size="sm"
                >
                  Hard
                </Button>
              </div>
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCompanies.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <Building2 className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-gray-900">
                  {searchTerm || filterDifficulty !== 'all' 
                    ? 'No companies match your search' 
                    : 'No companies in database yet'
                  }
                </h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  {searchTerm || filterDifficulty !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Companies will appear here once added to the database'
                  }
                </p>
                <Button onClick={refetch} variant="outline">
                  Try Refreshing
                </Button>
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <Card
                  key={company._id || company.name}
                  className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/company/${company.name}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold group-hover:text-blue-600 transition-colors line-clamp-2">
                        {company.overview?.name || company.name}
                      </CardTitle>
                      {company.hiring?.difficulty && (
                        <Badge 
                          variant={
                            company.hiring.difficulty === 'Easy' ? 'default' :
                            company.hiring.difficulty === 'Medium' ? 'secondary' : 'destructive'
                          }
                          className="text-xs px-2 py-1 ml-2 flex-shrink-0"
                        >
                          {company.hiring.difficulty}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    {company.overview?.industry && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span>{company.overview.industry}</span>
                      </div>
                    )}
                    {company.overview?.headquarters && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{company.overview.headquarters}</span>
                      </div>
                    )}
                    {company.overview?.tagline && (
                      <CardDescription className="text-sm line-clamp-2">
                        "{company.overview.tagline}"
                      </CardDescription>
                    )}
                    <Button 
                      className="w-full mt-2"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/company/${company.name}`);
                      }}
                    >
                      View Preparation Guide
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AllCompanies;

