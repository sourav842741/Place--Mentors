import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  const {
    settings,
    updateSettings,
    isUpdating,
    isLoading,
  } = useAdminSettings();

  /* =========================
     FORM STATE
  ========================= */
  const [formData, setFormData] =
    useState({
      maintenanceMode: false,
      maintenanceTitle:
        "Under Maintenance",
      maintenanceMessage:
        "We're working on improvements. Back soon! 🚀",
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
        announcementType:
          settings
            ?.announcementType ||
          "info",
      }));
    }
  }, [settings]);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = (e) => {
    e.preventDefault();
    // Strip MongoDB metadata before sending
    const {
      _id,
      __v,
      createdAt,
      updatedAt,
      ...cleanData
    } = formData;
    updateSettings(cleanData);
  };

  /* =========================
     TYPE PREVIEW (SAFE)
  ========================= */
  const getTypePreview = (
    type = "info"
  ) => {
    const safeType =
      String(type || "info");

    const colors = {
      info: "bg-blue-100 text-blue-800",
      warning:
        "bg-yellow-100 text-yellow-800",
      success:
        "bg-green-100 text-green-800",
      danger:
        "bg-red-100 text-red-800",
    };

    const icons = {
      info: Info,
      warning:
        AlertTriangle,
      success:
        CheckCircle2,
      danger: X,
    };

    const Icon =
      icons[safeType] ||
      Info;

    return (
      <Badge
        className={`border-0 font-semibold px-3 py-1.5 ${
          colors[safeType] ||
          colors.info
        }`}
      >
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
      <div className="p-10 text-center text-lg font-semibold">
        Loading Settings...
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-6 lg:ml-72 p-4">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>

        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:text-white">
            Site Settings
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Control maintenance mode
            and announcements
          </p>
        </div>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-8"
      >
        {/* =========================
            SECURITY
        ========================= */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/admin/security")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-500" />
                Account Security
              </CardTitle>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <CardDescription>
              Manage two-factor authentication for your privileged account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge
                className={`px-3 py-1 ${
                  user?.twoFactorEnabled
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                }`}
              >
                {user?.twoFactorEnabled ? "2FA Enabled" : "2FA Not Enabled"}
              </Badge>
              {user?.twoFactorWarning && (
                <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Enable 2FA recommended for privileged accounts
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* =========================
            MAINTENANCE
        ========================= */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Maintenance
              Mode
            </CardTitle>

            <CardDescription>
              Block user access
              temporarily
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <Label>
                Enable
                Maintenance
              </Label>

              <Switch
                checked={
                  formData.maintenanceMode
                }
                onCheckedChange={(
                  checked
                ) =>
                  setFormData({
                    ...formData,
                    maintenanceMode:
                      checked,
                  })
                }
              />
            </div>

            <div>
              <Label>
                Title
              </Label>

              <Input
                value={
                  formData.maintenanceTitle
                }
                onChange={(
                  e
                ) =>
                  setFormData({
                    ...formData,
                    maintenanceTitle:
                      e.target
                        .value,
                  })
                }
              />
            </div>

            <div>
              <Label>
                Message
              </Label>

              <Textarea
                rows={3}
                value={
                  formData.maintenanceMessage
                }
                onChange={(
                  e
                ) =>
                  setFormData({
                    ...formData,
                    maintenanceMessage:
                      e.target
                        .value,
                  })
                }
              />
            </div>

            <div>
              <Label>
                Image URL
              </Label>

              <Input
                value={
                  formData.maintenanceImage
                }
                onChange={(
                  e
                ) =>
                  setFormData({
                    ...formData,
                    maintenanceImage:
                      e.target
                        .value,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* =========================
            ANNOUNCEMENT
        ========================= */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-500" />
              Announcement
              Bar
            </CardTitle>

            <CardDescription>
              Top banner for
              users
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <Label>
                Enable
                Announcement
              </Label>

              <Switch
                checked={
                  formData.announcementEnabled
                }
                onCheckedChange={(
                  checked
                ) =>
                  setFormData({
                    ...formData,
                    announcementEnabled:
                      checked,
                  })
                }
              />
            </div>

            <div>
              <Label>
                Message
              </Label>

              <Textarea
                rows={2}
                value={
                  formData.announcementText
                }
                onChange={(
                  e
                ) =>
                  setFormData({
                    ...formData,
                    announcementText:
                      e.target
                        .value,
                  })
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>
                  Type
                </Label>

                <Select
                  value={
                    formData.announcementType ||
                    "info"
                  }
                  onValueChange={(
                    value
                  ) =>
                    setFormData({
                      ...formData,
                      announcementType:
                        value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="info">
                      Info
                    </SelectItem>

                    <SelectItem value="success">
                      Success
                    </SelectItem>

                    <SelectItem value="warning">
                      Warning
                    </SelectItem>

                    <SelectItem value="danger">
                      Danger
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="mt-2">
                  {getTypePreview(
                    formData.announcementType
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-7">
                <Label>
                  Closable
                </Label>

                <Switch
                  checked={
                    formData.announcementClosable
                  }
                  onCheckedChange={(
                    checked
                  ) =>
                    setFormData({
                      ...formData,
                      announcementClosable:
                        checked,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>
                Image URL
              </Label>

              <Input
                value={
                  formData.announcementImage
                }
                onChange={(
                  e
                ) =>
                  setFormData({
                    ...formData,
                    announcementImage:
                      e.target
                        .value,
                  })
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>
                  Button Text
                </Label>

                <Input
                  value={
                    formData.announcementButtonText
                  }
                  onChange={(
                    e
                  ) =>
                    setFormData({
                      ...formData,
                      announcementButtonText:
                        e.target
                          .value,
                    })
                  }
                />
              </div>

              <div>
                <Label>
                  Button Link
                </Label>

                <Input
                  value={
                    formData.announcementButtonLink
                  }
                  onChange={(
                    e
                  ) =>
                    setFormData({
                      ...formData,
                      announcementButtonLink:
                        e.target
                          .value,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SAVE BUTTON */}
        <Button
          type="submit"
          size="lg"
          disabled={
            isUpdating
          }
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-lg font-semibold h-14"
        >
          {isUpdating
            ? "Saving..."
            : "Save All Settings"}
        </Button>
      </form>
    </div>
  );
}

