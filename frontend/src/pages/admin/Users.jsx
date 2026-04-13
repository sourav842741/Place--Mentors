import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { promoteUser } from "../../redux/adminUserSlice";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users as UsersIcon, UserPlus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminUsers } from '../../hooks/useAdminUsers';

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
    <div className="space-y-6 lg:ml-75">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-200">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all platform users
          </p>
        </div>

        <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
          {(users || []).length} Total Users
        </Badge>
      </div>

      {/* ACTIONS */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <CardContent className="p-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border">
            <Search className="w-5 h-5 text-gray-500" />
            <Input placeholder="Search users..." className="border-none bg-transparent shadow-none px-0 h-auto py-1" />
          </div>

          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>

          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="w-6 h-6" />
            All Users
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">

              {/* HEADER */}
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <tr>
                  <th className="p-6 text-left">User</th>
                  <th className="p-6 hidden md:table-cell">Role</th>
                  <th className="p-6 hidden lg:table-cell">Level</th>
                  <th className="p-6 hidden xl:table-cell">Credits</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Last Seen</th>
                  <th className="p-6">Actions</th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="p-6">
                        <Skeleton className="h-10 w-40" />
                      </td>
                    </tr>
                  ))
                ) : (
                  (users || []).map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">

                      {/* USER */}
                      <td className="p-6 flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                          {(user.fullName || user.name || '')
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </div>
                        <div>
                          <div className="font-semibold">{user.fullName || user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>

                      {/* ROLE */}
                      <td className="p-6 hidden md:table-cell">
                        <Badge>
                          {user.role?.toUpperCase()}
                        </Badge>
                      </td>

                      {/* LEVEL */}
                      <td className="p-6 hidden lg:table-cell">
                        Lvl {user.level || 1}
                      </td>

                      {/* CREDITS */}
                      <td className="p-6 hidden xl:table-cell">
                        {user.credits || 0}
                      </td>

                      {/* STATUS */}
                      <td className="p-6">
                        <Badge className="bg-green-100 text-green-800">
                          {user.status || "ACTIVE"}
                        </Badge>
                      </td>

                      {/* LAST SEEN */}
                      <td className="p-6 text-sm text-gray-500">
                        {user.lastSeen || "Recently"}
                      </td>

                      {/* 🔥 ACTION */}
                      <td className="p-6">
                        {currentUser?.role === "admin" && user.role !== "admin" ? (
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
                          <Badge className="bg-gray-200 text-gray-700">
                            {user.role === "admin" ? "Admin" : "-"}
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
  );
}