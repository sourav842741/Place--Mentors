import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Shield, Users, Database, Lock, Mail, 
  Fingerprint, Key, Server, CheckCircle2 
} from "lucide-react";

const PrivacyPolicy = () => {
  // Pure React mein Page Title set karne ke liye
  useEffect(() => {
    document.title = "Privacy Policy - Place Mentor";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-20 px-4 md:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-5xl mx-auto">

        {/* 🔥 HERO SECTION */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Badge className="mb-6 px-4 py-1.5 text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-none rounded-full shadow-sm">
            Last Updated: October 2024
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent pb-2">
            Privacy Policy
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Your privacy matters to us. We ensure your data is secure, transparent, and always under your control.
          </p>
        </div>

        {/* 🔥 CONTENT GRID */}
        <div className="space-y-8">

          {/* SECTION 1: INFORMATION WE COLLECT */}
          <Card className="group shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-xl dark:bg-gray-900/60 dark:border dark:border-gray-800">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Information We Collect</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-600 dark:text-gray-300">
                {/* Item 1 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2 text-gray-900 dark:text-white">
                    <Fingerprint className="h-5 w-5 text-indigo-500" />
                    Personal Info
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Name & Email Address</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Profile Images</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Skills & Preferences</li>
                  </ul>
                </div>

                {/* Item 2 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2 text-gray-900 dark:text-white">
                    <Database className="h-5 w-5 text-indigo-500" />
                    Usage Data
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Quiz stats & streaks</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Earned XP & levels</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Time spent & progress</li>
                  </ul>
                </div>

                {/* Item 3 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2 text-gray-900 dark:text-white">
                    <Server className="h-5 w-5 text-indigo-500" />
                    System Data
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Encrypted passwords</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Authentication logs</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Device identifiers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: AUTH & COOKIES */}
          <Card className="group shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-xl dark:bg-gray-900/60 dark:border dark:border-gray-800">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                  <Key className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Cookies & Authentication</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="pt-6 grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-base mb-2 text-gray-900 dark:text-white">Secure Cookies</h3>
                <p className="leading-relaxed">We use JWT tokens and secure device IDs strictly for user authentication and session management.</p>
              </div>
              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-base mb-2 text-gray-900 dark:text-white">Local Storage</h3>
                <p className="leading-relaxed">Anonymous device tracking is utilized locally on your device solely for security and fraud prevention.</p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: SECURITY */}
          <Card className="group shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-xl dark:bg-gray-900/60 dark:border dark:border-gray-800">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Security & Storage</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="pt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-medium">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 transition-transform border border-emerald-100 dark:border-emerald-800/50">
                <Shield className="h-6 w-6" />
                <span>Encrypted Passwords</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 transition-transform border border-emerald-100 dark:border-emerald-800/50">
                <Lock className="h-6 w-6" />
                <span>HTTPS & Secure APIs</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 transition-transform border border-emerald-100 dark:border-emerald-800/50">
                <Database className="h-6 w-6" />
                <span>Encrypted Databases</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 transition-transform border border-emerald-100 dark:border-emerald-800/50">
                <Calendar className="h-6 w-6" />
                <span>Strict Data Retention</span>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4: CONTACT */}
          <Card className="shadow-2xl border-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 animate-gradient text-white overflow-hidden relative">
            {/* Decorative Background Blob */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-md">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold mt-2">Have Data Questions?</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="text-center relative z-10 pb-8">
              <p className="mb-8 text-white/90 text-lg max-w-md mx-auto">
                Our team is always here to help you understand how your information is handled.
              </p>
              <a
                href="mailto:souravkumar85055@gmail.com"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gray-50 transition-all active:scale-95"
              >
                <Mail className="h-5 w-5" />
                Contact Support
              </a>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;