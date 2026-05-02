import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import {
  Calendar,
  Download,
  Share2,
  Trash2,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Award,
} from 'lucide-react';

import { useState } from 'react';
import { toast } from 'sonner';
import api from '../../services/api';
import CertificatePreview from './CertificatePreview';

export default function CertificateHistory({ certificates, onRefresh, user }) {
  const [deletingId, setDeletingId] = useState(null);

  const [refreshing, setRefreshing] = useState(false);

  const handleDelete = async (certId) => {
    const ok = confirm('Delete this certificate?');

    if (!ok) return;

    try {
      setDeletingId(certId);

      await api.delete(`/api/certificates/${certId}`);

      toast.success('Certificate deleted');

      onRefresh();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const refreshNow = async () => {
    try {
      setRefreshing(true);
      await onRefresh();
      toast.success('Updated');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-400" />
            Certificate History
          </h2>

          <p className="text-slate-400 mt-2">
            {certificates.length} verified certificates generated
          </p>
        </div>

        <Button
          onClick={refreshNow}
          disabled={refreshing}
          className="rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Empty State */}
      {certificates.length === 0 ? (
        <Card className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <CardContent className="p-14 text-center">
            <Calendar className="w-16 h-16 mx-auto text-slate-500 mb-5" />

            <h3 className="text-2xl font-bold text-white">No Certificates Yet</h3>

            <p className="text-slate-400 mt-3 max-w-md mx-auto">
              Generate certificates from your achievements and they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card
              key={cert._id}
              className="group rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <CardContent className="p-6">
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">
                      Certificate ID
                    </p>

                    <p className="text-sm font-bold text-blue-400 mt-1">{cert.certificateId}</p>
                  </div>

                  <Badge className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>

                {/* Preview */}
                <div className="mt-6 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center text-3xl shadow-xl">
                    {cert.metadata?.badgeIcon || '🏆'}
                  </div>

                  <h3 className="text-xl font-black text-white mt-5 leading-tight">
                    {cert.badgeName}
                  </h3>

                  <div className="mt-3 flex justify-center items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(cert.issuedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <CertificatePreview
                    certificate={cert}
                    badge={{
                      name: cert.badgeName,
                      icon: cert.metadata?.badgeIcon,
                    }}
                    user={user}
                    triggerButton={
                      <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white">
                        <Download className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    }
                  />

                  <Button
                    variant="outline"
                    className="rounded-2xl border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
                    onClick={() =>
                      navigator.share?.({
                        title: 'PlaceMentor Certificate',
                        text: `${cert.badgeName} | ${cert.certificateId}`,
                      }) || toast.info('Sharing not supported')
                    }
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>

                  <Button
                    variant="destructive"
                    className="rounded-2xl"
                    disabled={deletingId === cert._id}
                    onClick={() => handleDelete(cert._id)}
                  >
                    {deletingId === cert._id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-1" />
                    )}
                    Delete
                  </Button>
                </div>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                  <p className="text-xs text-slate-500">PlaceMentor Verified Credential</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
