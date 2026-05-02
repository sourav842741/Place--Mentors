import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  QrCode,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function AdminSecurity() {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { setup2FA, enable2FA, disable2FA, get2FAStatus } = useAuth();

  const [status, setStatus] = useState({ enabled: false, hasTempSecret: false });
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [showCodes, setShowCodes] = useState(false);

  const [disableMode, setDisableMode] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableToken, setDisableToken] = useState('');
  const [showDisablePassword, setShowDisablePassword] = useState(false);

  const isSuperAdmin = user?.isSuperAdmin;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchStatus();
  }, [isAdmin, navigate]);

  const fetchStatus = async () => {
    const res = await get2FAStatus();
    if (res.success) {
      setStatus(res.data);
    }
  };

  const handleSetup = async () => {
    setLoading(true);
    const res = await setup2FA();
    if (res.success) {
      setQrCode(res.data.qrCode);
      setManualKey(res.data.manualKey);
      setSetupMode(true);
      setVerifyToken('');
      setRecoveryCodes([]);
      toast.success('Scan the QR code with your authenticator app');
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  const handleEnable = async () => {
    if (!verifyToken) {
      return toast.warning('Enter the 6-digit code from your authenticator app');
    }
    setLoading(true);
    const res = await enable2FA(verifyToken);
    if (res.success) {
      setRecoveryCodes(res.data.recoveryCodes);
      setStatus({ enabled: true, hasTempSecret: false });
      setSetupMode(false);
      toast.success('2FA enabled successfully! Save your recovery codes.');
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  const handleDisable = async () => {
    if (!disablePassword || !disableToken) {
      return toast.warning('Password and OTP are required');
    }
    setLoading(true);
    const res = await disable2FA(disablePassword, disableToken);
    if (res.success) {
      setStatus({ enabled: false, hasTempSecret: false });
      setDisableMode(false);
      setDisablePassword('');
      setDisableToken('');
      toast.success('2FA disabled successfully');
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const title = isSuperAdmin ? 'Super Admin Security' : 'Admin Security';

  return (
    <div className="space-y-6 lg:ml-72 p-4">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">{title}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage two-factor authentication for your privileged account
            </p>
          </div>
        </div>

        <Badge
          className={`px-4 py-2 rounded-full text-sm ${
            status.enabled
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
          }`}
        >
          {status.enabled ? '2FA Enabled' : '2FA Disabled'}
        </Badge>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Trusted Devices</p>
            <h3 className="text-2xl font-bold dark:text-white">
              {status?.trustedDevicesCount || 0}
            </h3>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Role</p>
            <h3 className="text-2xl font-bold dark:text-white">
              {isSuperAdmin ? 'Superadmin' : 'Admin'}
            </h3>
          </CardContent>
        </Card>

        <Card className="rounded-2xl sm:col-span-2 xl:col-span-1">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Last Secure Login</p>
            <h3 className="text-sm font-semibold dark:text-white">
              {user?.lastPrivilegedLoginAt
                ? new Date(user.lastPrivilegedLoginAt).toLocaleString()
                : 'Never'}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* 2FA Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {status.enabled ? (
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            ) : (
              <ShieldOff className="w-5 h-5 text-gray-400" />
            )}
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            {status.enabled
              ? 'Your account is protected with 2FA'
              : 'Enable 2FA to add an extra layer of security'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge
                className={`px-3 py-1 ${
                  status.enabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {status.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
              {isSuperAdmin && !status.enabled && (
                <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Recommended for super admin
                </span>
              )}
            </div>

            {!status.enabled && !setupMode && (
              <Button
                onClick={handleSetup}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Enable 2FA
              </Button>
            )}

            {status.enabled && !disableMode && (
              <Button
                variant="outline"
                onClick={() => setDisableMode(true)}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <ShieldOff className="w-4 h-4 mr-2" />
                Disable 2FA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Mode */}
      {setupMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <QrCode className="w-5 h-5 text-indigo-500" />
              Scan QR Code
            </CardTitle>
            <CardDescription>
              Use Google Authenticator, Microsoft Authenticator, or Authy to scan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              {qrCode && (
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  className="w-48 h-48 rounded-2xl border border-gray-200 dark:border-gray-700"
                />
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Manual Key
              </label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 text-sm font-mono bg-white dark:bg-gray-900 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 break-all">
                  {manualKey}
                </code>
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(manualKey)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter 6-digit code from app to verify
              </label>
              <Input
                type="text"
                placeholder="123456"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="h-12 rounded-2xl text-center text-lg tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleEnable}
                disabled={loading}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Verify & Enable
              </Button>
              <Button
                variant="outline"
                onClick={() => setSetupMode(false)}
                className="h-12 rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recovery Codes */}
      {recoveryCodes.length > 0 && (
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
              <KeyRound className="w-5 h-5" />
              Recovery Codes
            </CardTitle>
            <CardDescription className="text-emerald-600 dark:text-emerald-500">
              Save these codes in a secure location. Each code can only be used once.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {recoveryCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2"
                >
                  <code className="text-sm font-mono">{showCodes ? code : '••••••••'}</code>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCodes(!showCodes)}
                className="rounded-2xl"
              >
                {showCodes ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showCodes ? 'Hide' : 'Show'}
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(recoveryCodes.join('\n'))}
                className="rounded-2xl"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disable Mode */}
      {disableMode && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <ShieldOff className="w-5 h-5" />
              Disable 2FA
            </CardTitle>
            <CardDescription>
              This will remove two-factor protection from your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showDisablePassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="h-12 rounded-2xl pr-10"
                />
                <span
                  onClick={() => setShowDisablePassword(!showDisablePassword)}
                  className="absolute right-3 top-3.5 cursor-pointer text-gray-500"
                >
                  {showDisablePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Authenticator Code
              </label>
              <Input
                type="text"
                placeholder="6-digit code"
                value={disableToken}
                onChange={(e) => setDisableToken(e.target.value)}
                className="h-12 rounded-2xl text-center text-lg tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDisable}
                disabled={loading}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white"
              >
                Confirm Disable
              </Button>
              <Button
                variant="outline"
                onClick={() => setDisableMode(false)}
                className="h-12 rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back to Settings */}
      <button
        onClick={() => navigate('/admin/settings')}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </button>
    </div>
  );
}
