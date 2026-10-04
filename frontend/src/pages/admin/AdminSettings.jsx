import React, { useState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useAdminSettings from "../../hooks/useAdminSettings";

import {
  Settings,
  Image,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Shield,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { settings, updateSettings, isUpdating, isLoading } = useAdminSettings();

  /* =========================
     FORM STATE
  ========================= */
  const [formData, setFormData] = useState({
    maintenanceMode: false,
    maintenanceTitle: "Under Maintenance",
    maintenanceMessage: "We're working on improvements. Back soon! 🚀",
    maintenanceImage: "",
    maintenanceAllowAdminAccess: true,

    announcementEnabled: false,
    announcementText: "",
    announcementImage: "",
    announcementType: "info",
    announcementClosable: true,
    announcementButtonText: "",
    announcementButtonLink: "",
  });

  /* =========================
     LOAD SETTINGS INTO FORM
     (one-time only)
  ========================= */
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (settings && !hasInitialized.current) {
      hasInitialized.current = true;
      setFormData((prev) => ({
        ...prev,
        ...settings,
        announcementType: settings?.announcementType || "info",
      }));
    }
  }, [settings]);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = (e) => {
    e.preventDefault();
    // Strip MongoDB metadata before sending
    const { _id, __v, createdAt, updatedAt, ...cleanData } = formData;
    updateSettings(cleanData);
  };

  /* =========================
     TYPE PREVIEW (SAFE)
  ========================= */
  const getTypePreview = (type = "info") => {
    const safeType = String(type || "info");

    const colors = {
      info: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
      warning: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
      success: "bg-green-500/10 text-green-500 border border-green-500/20",
      danger: "bg-red-500/10 text-red-500 border border-red-500/20",
    };

    const icons = {
      info: Info,
      warning: AlertTriangle,
      success: CheckCircle2,
      danger: X,
    };

    const Icon = icons[safeType] || Info;

    return (
      <Badge className={`font-semibold px-3 py-1.5 rounded-full ${colors[safeType] || colors.info}`}>
        <Icon className="w-3 h-3 mr-1" />
        {safeType.toUpperCase()}
      </Badge>
    );
  };

  /* =========================
     LOADING
  ========================= */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text lg:ml-72 p-10 flex items-center justify-center text-lg font-semibold">
        Loading Settings...
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-bg text-text lg:ml-72 p-4 md:p-6 space-y-6 transition-colors duration-200">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Settings className="w-6 h-6 text-white" />
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-black text-text">
            Site Settings
          </h1>

          <p className="text-text-muted mt-1">
            Control maintenance mode and announcements
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* =========================
            SECURITY
        ========================= */}
        <Card
          className="border border-border bg-surface text-text hover:border-primary/40 rounded-2xl shadow-sm transition-all cursor-pointer"
          onClick={() => navigate("/admin/security")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-text">
                <Shield className="w-5 h-5 text-emerald-500" />
                Account Security
              </CardTitle>
              <ChevronRight className="w-5 h-5 text-text-muted" />
            </div>
            <CardDescription className="text-text-muted">
              Manage two-factor authentication for your privileged account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge
                className={`px-3 py-1 rounded-full ${
                  user?.twoFactorEnabled
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                }`}
              >
                {user?.twoFactorEnabled ? "2FA Enabled" : "2FA Not Enabled"}
              </Badge>
              {user?.twoFactorWarning && (
                <span className="text-xs text-amber-500 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Enable 2FA recommended for privileged accounts
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* =========================
            MAINTENANCE
        ========================= */}
        <Card className="border border-border bg-surface text-text rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-text">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Maintenance Mode
            </CardTitle>

            <CardDescription className="text-text-muted">Block user access temporarily</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <Label className="text-text font-medium">Enable Maintenance</Label>

              <Switch
                checked={formData.maintenanceMode}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    maintenanceMode: checked,
                  })
                }
              />
            </div>

            <div>
              <Label className="text-text font-medium">Title</Label>

              <Input
                value={formData.maintenanceTitle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maintenanceTitle: e.target.value,
                  })
                }
                className="mt-1.5 rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary"
              />
            </div>

            <div>
              <Label className="text-text font-medium">Message</Label>

              <Textarea
                rows={3}
                value={formData.maintenanceMessage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maintenanceMessage: e.target.value,
                  })
                }
                className="mt-1.5 rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary"
              />
            </div>

            <div>
              <Label className="text-text font-medium">Image URL</Label>

              <Input
                value={formData.maintenanceImage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maintenanceImage: e.target.value,
                  })
                }
                className="mt-1.5 rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* =========================
            ANNOUNCEMENT
        ========================= */}
        <Card className="border border-border bg-surface text-text rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-text">
              <Info className="w-5 h-5 text-blue-500" />
              Announcement Bar
            </CardTitle>

            <CardDescription className="text-text-muted">Top banner for users</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <Label className="text-text font-medium">Enable Announcement</Label>

              <Switch
                checked={formData.announcementEnabled}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    announcementEnabled: checked,
                  })
                }
              />
            </div>

            <div>
              <Label className="text-text font-medium">Message</Label>

              <Textarea
                rows={2}
                value={formData.announcementText}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    announcementText: e.target.value,
                  })
                }
                className="mt-1.5 rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-text font-medium">Type</Label>

                <Select
                  value={formData.announcementType || "info"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      announcementType: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-1.5 rounded-xl border-border bg-surface-2 text-text">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="bg-surface border-border text-text">
                    <SelectItem value="info" className="text-text hover:bg-surface-2">Info</SelectItem>
                    <SelectItem value="success" className="text-text hover:bg-surface-2">Success</SelectItem>
                    <SelectItem value="warning" className="text-text hover:bg-surface-2">Warning</SelectItem>
                    <SelectItem value="danger" className="text-text hover:bg-surface-2">Danger</SelectItem>
                  </SelectContent>
                </Select>

                <div className="mt-2">{getTypePreview(formData.announcementType)}</div>
              </div>

              <div className="flex items-center justify-between mt-7">
                <Label className="text-text font-medium">Closable</Label>

                <Switch
                  checked={formData.announcementClosable}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      announcementClosable: checked,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label className="text-text font-medium">Image URL</Label>

              <Input
                value={formData.announcementImage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    announcementImage: e.target.value,
                  })
                }
                className="mt-1.5 rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-text font-medium">Button Text</Label>

                <Input
                  value={formData.announcementButtonText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      announcementButtonText: e.target.value,
                    })
                  }
                  className="mt-1.5 rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary"
                />
              </div>

              <div>
                <Label className="text-text font-medium">Button Link</Label>

                <Input
                  value={formData.announcementButtonLink}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      announcementButtonLink: e.target.value,
                    })
                  }
                  className="mt-1.5 rounded-xl border-border bg-surface-2 text-text placeholder:text-text-subtle focus:border-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SAVE BUTTON */}
        <Button
          type="submit"
          size="lg"
          disabled={isUpdating}
          className="w-full bg-primary hover:bg-primary-hover text-white text-lg font-semibold h-12 rounded-xl shadow-md shadow-primary/20"
        >
          {isUpdating ? "Saving..." : "Save All Settings"}
        </Button>
      </form>
    </div>
  );
}
