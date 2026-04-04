import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Eye, Sparkles, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '../services/api';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function PlannerHistory() {
  const navigate = useNavigate();
  const [planners, setPlanners] = useState([]);
const [loading, setLoading] = useState(true);
  const [calendarStatus, setCalendarStatus] = useState({ authorized: false, loading: true });
  const [syncing, setSyncing] = useState({});

  useEffect(() => {
    const loadData = async () => {
      await fetchPlanners();
      
      // Load calendar status
      try {
        const res = await api.get('/api/planner/calendar/status', { withCredentials: true });
        setCalendarStatus({ ...res.data, loading: false });
      } catch (err) {
        console.error('Calendar status error:', err);
        setCalendarStatus({ authorized: false, loading: false });
      }
    };
    loadData();
  }, []);

  const fetchPlanners = async () => {
    try {
      const res = await api.get('/api/planner/all', { withCredentials: true });
      if (Array.isArray(res.data)) {
        setPlanners(res.data);
      } else {
        setPlanners([]);
      }
    } catch (err) {
      console.error('Failed to fetch planners');
      setPlanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    try {
      const res = await api.get('/api/planner/calendar/auth', { withCredentials: true });
      window.location.href = res.data.authUrl;
    } catch (err) {
      alert('Failed to get auth URL');
    }
  };

  const syncPlannerToCalendar = async (plannerId) => {
    if (!planners.length) {
      alert('No planners available');
      return;
    }
    setSyncing(prev => ({ ...prev, [plannerId]: true }));
    try {
      const res = await api.post('/api/planner/calendar', { plannerId }, { withCredentials: true });
      alert(`Synced ${res.data.syncedCount} new events!`);
    } catch (err) {
      console.error('Sync error:', err.response?.data);
      alert(err.response?.data?.message || 'Sync failed. Check server logs.');
    } finally {
      setSyncing(prev => ({ ...prev, [plannerId]: false }));
    }
  };

  const viewPlanner = (plannerId) => {
    navigate(`/ai-planner/${plannerId}`);
  };

  if (loading) return <div className="pt-16 md:pl-64 p-4 md:p-6 bg-gray-100 min-h-screen flex items-center justify-center">
    <div className="text-center">
      <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
      <p className="text-lg">Loading planners...</p>
    </div>
  </div>;

  return (
    <>
      <Navbar />
      <div className="pt-16 md:pl-64 p-6 lg:p-8 bg-gray-50 min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 lg:gap-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Planner History</h1>
              <Button onClick={() => navigate('/ai-planner')} className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                New Plan
              </Button>
            </div>

            {/* Google Connect */}
            {calendarStatus.loading ? (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking Google Calendar status...</span>
                </div>
              </div>
            ) : !calendarStatus.authorized ? (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <Button onClick={handleGoogleOAuth} className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 px-6 rounded-xl shadow-lg transition-all hover:shadow-xl w-full md:w-auto">
                    <Calendar className="w-4 h-4" />
                    Connect Google Calendar
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">Required for calendar sync</p>
                </CardContent>
              </Card>
            ) : (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span>Google Calendar connected ✓</span>
                </div>
              </div>
            )}

            {planners.length === 0 ? (
              <Card className="text-center p-12 max-w-2xl mx-auto">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">No Planners Yet</h3>
                <p className="text-gray-500 mb-6">Create your first mentor roadmap</p>
                <Button onClick={() => navigate('/ai-planner')} size="lg">
                  Create First Plan
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full">
                {planners.map((planner) => (
                  <Card key={planner._id} className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-start justify-between">
                        <span className="font-bold text-base sm:text-lg line-clamp-1 pr-2">{planner.goal}</span>
                        <Badge variant="secondary" className="shrink-0 whitespace-nowrap">{planner.company || 'General'}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>{planner.daysLeft} days left</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">Created:</span>
                          <span>{new Date(planner.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{planner.progress}% complete</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 pt-3">
                        <Button 
                          size="sm" 
                          onClick={() => viewPlanner(planner._id)}
                          className="flex-1 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Plan
                        </Button>
                        {calendarStatus.authorized && (
                          <Button 
                            size="sm"
                            onClick={() => syncPlannerToCalendar(planner._id)}
                            disabled={syncing[planner._id]}
                            className="flex-1 bg-blue-500 hover:bg-blue-600"
                          >
                            {syncing[planner._id] ? (
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <>
                                <Calendar className="w-4 h-4 mr-1" />
                                Sync
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
