"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MoreHorizontal,
  User,
  Mail,
  Shield,
  Ban,
  KeyRound,
  Trash2,
  ExternalLink,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

// Mock users data
const users = [
  {
    id: "U-00001",
    name: "Rajesh Kumar",
    email: "rajesh@apexacademy.com",
    emailVerified: true,
    role: "Teacher",
    uniqueId: "GK-TCH-00892",
    organization: "Apex Academy",
    orgId: "GK-ORG-00142",
    appAccess: "BOTH",
    lastActive: "5 min ago",
    testsTaken: null,
    status: "Active",
  },
  {
    id: "U-00002",
    name: "Priya Singh",
    email: "priya@brilliantcoaching.in",
    emailVerified: true,
    role: "Org Admin",
    uniqueId: null,
    organization: "Brilliant Coaching",
    orgId: "GK-ORG-00141",
    appAccess: "BOTH",
    lastActive: "1 hour ago",
    testsTaken: null,
    status: "Active",
  },
  {
    id: "U-00003",
    name: "Amit Verma",
    email: "amit@excelinstitute.edu",
    emailVerified: true,
    role: "Teacher",
    uniqueId: "GK-TCH-00765",
    organization: "Excel Institute",
    orgId: "GK-ORG-00140",
    appAccess: "BOTH",
    lastActive: "2 hours ago",
    testsTaken: null,
    status: "Active",
  },
  {
    id: "U-00004",
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    emailVerified: true,
    role: "Student",
    uniqueId: null,
    organization: "Apex Academy",
    orgId: "GK-ORG-00142",
    appAccess: "STUDENT",
    lastActive: "30 min ago",
    testsTaken: 24,
    status: "Active",
  },
  {
    id: "U-00005",
    name: "Neha Gupta",
    email: "neha@successclasses.com",
    emailVerified: false,
    role: "Teacher",
    uniqueId: "GK-TCH-00543",
    organization: "Success Classes",
    orgId: "GK-ORG-00139",
    appAccess: "MOCKBOOK",
    lastActive: "3 days ago",
    testsTaken: null,
    status: "Active",
  },
  {
    id: "U-00006",
    name: "Suresh Patel",
    email: "suresh@knowledgepark.edu",
    emailVerified: true,
    role: "Teacher",
    uniqueId: "GK-TCH-00421",
    organization: "Knowledge Park",
    orgId: "GK-ORG-00136",
    appAccess: "BOTH",
    lastActive: "1 week ago",
    testsTaken: null,
    status: "Suspended",
  },
  {
    id: "U-00007",
    name: "Ananya Reddy",
    email: "ananya.reddy@yahoo.com",
    emailVerified: true,
    role: "Student",
    uniqueId: null,
    organization: "Excel Institute",
    orgId: "GK-ORG-00140",
    appAccess: "BOTH",
    lastActive: "2 hours ago",
    testsTaken: 18,
    status: "Active",
  },
  {
    id: "U-00008",
    name: "Vikram Joshi",
    email: "vikram@primeutorials.com",
    emailVerified: true,
    role: "Org Admin",
    uniqueId: null,
    organization: "Prime Tutorials",
    orgId: "GK-ORG-00137",
    appAccess: "BOTH",
    lastActive: "4 hours ago",
    testsTaken: null,
    status: "Active",
  },
];

// Role Badge Component
function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    Student: "bg-blue-50 text-blue-700",
    Teacher: "bg-purple-50 text-purple-700",
    "Org Admin": "bg-green-50 text-green-700",
    "Super Admin": "bg-orange-50 text-orange-700",
  };
  return <span className={`badge ${styles[role] || ""}`}>{role}</span>;
}

// App Access Badge Component
function AppAccessBadge({ access }: { access: string }) {
  const styles: Record<string, string> = {
    STUDENT: "badge-student",
    MOCKBOOK: "badge-mockbook",
    BOTH: "badge-both",
  };
  return <span className={`badge ${styles[access] || ""}`}>{access}</span>;
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "badge-active",
    Suspended: "badge-suspended",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [orgFilter, setOrgFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setOrgFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchQuery || roleFilter !== "all" || orgFilter !== "all" || statusFilter !== "all";

  // Get unique organizations for filter
  const organizations = [...new Set(users.map(u => u.organization))];

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesOrg = orgFilter === "all" || user.organization === orgFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesOrg && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-500 text-sm mt-1">
                  All users across all organizations
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {users.length.toLocaleString()} total users
              </div>
            </div>

            {/* Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 input-field"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[130px] input-field">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                      <SelectItem value="Org Admin">Org Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={orgFilter} onValueChange={setOrgFilter}>
                    <SelectTrigger className="w-[180px] input-field">
                      <SelectValue placeholder="Organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Organizations</SelectItem>
                      {organizations.map(org => (
                        <SelectItem key={org} value={org}>{org}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px] input-field">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="btn-ghost">
                      <X className="w-4 h-4 mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">User</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Role</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Unique ID</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Organization</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">App Access</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Last Active</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Tests</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-brand-primary-tint">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
                                {user.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                {user.email}
                                {user.emailVerified && (
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          {user.uniqueId ? (
                            <span className="mono text-xs">{user.uniqueId}</span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link 
                            href={`/organizations/${user.orgId}`}
                            className="text-sm text-gray-700 hover:text-brand-primary"
                          >
                            {user.organization}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <AppAccessBadge access={user.appAccess} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {user.lastActive}
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-600">
                          {user.testsTaken ?? "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={user.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <User className="w-4 h-4 mr-2" /> View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="w-4 h-4 mr-2" /> View in Org
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                              </DropdownMenuItem>
                              {user.status === "Active" ? (
                                <DropdownMenuItem className="text-orange-600">
                                  <Ban className="w-4 h-4 mr-2" /> Suspend
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-green-600">
                                  <Shield className="w-4 h-4 mr-2" /> Reactivate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing 1–{filteredUsers.length} of {users.length}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0 bg-brand-primary text-white hover:bg-brand-primary-hover">
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                    2
                  </Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                    3
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
