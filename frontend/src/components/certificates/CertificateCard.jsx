import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Calendar, Award, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function CertificateCard({ badge, onGenerate }) {
  const navigate = useNavigate();

  return (
    <Card className="group relative overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-emerald-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-emerald-500/5 transition-all duration-500" />

      <CardContent className="relative p-6">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </div>
        </div>

        {/* Premium Badge Preview */}
        <div className="relative mb-6">
          <div className="h-36 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-[1px] shadow-xl">
            <div className="h-full rounded-3xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center text-3xl shadow-lg mb-3 group-hover:scale-110 transition-transform duration-500">
                {badge.icon || '🏆'}
              </div>

              <p className="text-xs tracking-[0.25em] font-bold text-slate-500 uppercase">
                CERTIFICATE READY
              </p>
            </div>
          </div>

          {/* Floating Sparkle */}
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-500 animate-pulse" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {badge.name}
          </h3>

          <div className="mt-3 flex justify-center items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4" />
            {new Date(badge.earnedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Convert your achievement into a premium shareable certificate.
          </p>
        </div>

        {/* CTA */}
        <Button
          onClick={onGenerate}
          className="mt-7 w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <Award className="w-5 h-5 mr-2" />
          Generate Certificate
        </Button>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            PlaceMentor Verified Achievement
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
