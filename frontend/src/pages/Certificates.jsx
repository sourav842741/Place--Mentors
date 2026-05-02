import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { Trophy, Calendar, Award, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

import CertificateHistory from '../components/certificates/CertificateHistory';
import CertificateCard from '../components/certificates/CertificateCard';
import Footer from '@/components/Footer';

export default function Certificates() {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [loadingBadges, setLoadingBadges] = useState(true);

  const [loadingCerts, setLoadingCerts] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingBadges(true);
      setLoadingCerts(true);

      const [badgesRes, certsRes] = await Promise.all([
        api.get('/api/xp/badges'),
        api.get('/api/certificates'),
      ]);

      setBadges(Array.isArray(badgesRes?.data?.badges) ? badgesRes.data.badges : []);

      setCertificates(Array.isArray(certsRes?.data?.data) ? certsRes.data.data : []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoadingBadges(false);
      setLoadingCerts(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await fetchData();
      toast.success('Updated');
    } finally {
      setRefreshing(false);
    }
  };

  const availableBadges = useMemo(() => {
    return badges.filter((badge) => !certificates.some((cert) => cert.badgeName === badge.name));
  }, [badges, certificates]);

  if (loadingBadges || loadingCerts) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-white px-4 md:px-8 py-8">
        {/* TOP BAR */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="rounded-2xl border-slate-700 bg-slate-900 hover:bg-slate-800 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>

            <Button
              onClick={refreshData}
              disabled={refreshing}
              className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>

          {/* RIGHT SIDE */}
          <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-3xl shadow-xl">
            <h1 className="text-4xl font-black flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-400" />
              Certificates
            </h1>
          </div>
        </div>

        {/* Subtitle */}
        <div className="max-w-7xl mx-auto mb-8">
          <p className="text-slate-400 text-lg">
            Turn your achievements into verified and shareable certificates.
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 bg-slate-900 border border-slate-800 rounded-3xl h-14 mb-8">
              <TabsTrigger
                value="available"
                className="rounded-3xl data-[state=active]:bg-slate-800 data-[state=active]:text-white"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Available ({availableBadges.length})
              </TabsTrigger>

              <TabsTrigger
                value="history"
                className="rounded-3xl data-[state=active]:bg-slate-800 data-[state=active]:text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                History ({certificates.length})
              </TabsTrigger>
            </TabsList>

            {/* Available */}
            <TabsContent value="available">
              {availableBadges.length === 0 ? (
                <Card className="bg-slate-900 border-slate-800 rounded-3xl p-10 text-center text-white">
                  <Trophy className="w-14 h-14 mx-auto text-yellow-400 mb-4" />

                  <h3 className="text-2xl font-bold">No Certificates Available</h3>

                  <p className="text-slate-400 mt-2">Earn more badges to unlock certificates.</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {availableBadges.map((badge, index) => (
                    <CertificateCard
                      key={index}
                      badge={badge}
                      onGenerate={async () => {
                        try {
                          await api.post('/api/certificates/generate', {
                            badgeName: badge.name,
                          });

                          toast.success('Certificate created');

                          await fetchData();

                          setActiveTab('history');
                        } catch {
                          toast.error('Failed');
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* History */}
            <TabsContent value="history">
              <CertificateHistory
                certificates={certificates}
                user={user}
                onRefresh={refreshData}
                onDelete={fetchData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
