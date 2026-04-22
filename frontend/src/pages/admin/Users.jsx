import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { promoteUser, demoteUser } from "../../redux/adminUserSlice";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users as UsersIcon,
  UserPlus,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUsers } from "../../hooks/useAdminUsers";

export default function Users() {
  const { data: users, loading, error } = useAdminUsers();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.user);

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <UsersIcon className="w-20 h-20 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Failed to load users
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>

        <Button onClick={() => window.location.reload()} className="w-48">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6" >
      {/* lg screen navbar hidden issue fix */}
      <div className="max-w-[1600px] mx-auto space-y-6 lg:ml-64">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-200">
              User Management
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all platform users
            </p>
          </div>

          <Badge className="text-sm sm:text-base px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full">
            {(users || []).length} Total Users
          </Badge>
        </div>

        {/* ACTION BAR */}
        <Card className="border border-white/10 shadow-xl rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="p-4 flex flex-col lg:flex-row gap-3 lg:items-center">

            <div className="flex items-center gap-2 px-4 h-11 rounded-xl bg-white dark:bg-gray-900 border w-full lg:max-w-sm">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                className="border-none shadow-none focus-visible:ring-0 px-0"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite User
              </Button>

              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* USERS TABLE */}
        <Card className="border border-white/10 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UsersIcon className="w-5 h-5" />
              All Users
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <tr className="text-left text-sm font-semibold">
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Level</th>
                    <th className="p-4">Credits</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Last Seen</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4">
                            <Skeleton className="h-10 w-52" />
                          </td>
                        </tr>
                      ))
                  ) : (
                    (users || []).map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                              {(user.fullName || user.name || "U")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>

                            <div>
                              <p className="font-semibold text-sm">
                                {user.fullName || user.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          {user.isSuperAdmin ? (
                            <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                              OWNER
                            </Badge>
                          ) : user.role === "admin" ? (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                              LIMITED ADMIN
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {user.role?.toUpperCase()}
                            </Badge>
                          )}
                        </td>

                        <td className="p-4 font-medium">
                          Lv {user.level || 1}
                        </td>

                        <td className="p-4">{user.credits || 0}</td>

                        <td className="p-4">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {user.status || "ACTIVE"}
                          </Badge>
                        </td>

                        <td className="p-4 text-sm text-gray-500">
                          {user.lastSeen || "Recently"}
                        </td>

                        <td className="p-4 text-center">
                          {currentUser?.isSuperAdmin ? (
                            user.isSuperAdmin ? (
                              <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                Owner
                              </Badge>
                            ) : user.role !== "admin" ? (
                              <Button
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await dispatch(promoteUser(user._id)).unwrap();
                                    toast.success("Promoted to Admin 🚀");
                                  } catch (err) {
                                    toast.error(err);
                                  }
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                              >
                                Make Admin
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await dispatch(demoteUser(user._id)).unwrap();
                                    toast.success("Demoted to User ✅");
                                  } catch (err) {
                                    toast.error(err);
                                  }
                                }}
                              >
                                Back to User
                              </Button>
                            )
                          ) : currentUser?.role === "admin" ? (
                            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                              Limited Admin
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              -
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}