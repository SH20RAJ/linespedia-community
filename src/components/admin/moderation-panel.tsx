"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldAlert, Trash2, UserMinus, FileText, Users, Database } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ModerationPanelProps {
  passcode: string;
}

export function ModerationPanel({ passcode }: ModerationPanelProps) {
  const [activeTab, setActiveTab] = React.useState<"writings" | "users" | "seed">("writings");
  const [writingsList, setWritingsList] = React.useState<any[]>([]);
  const [usersList, setUsersList] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchWritings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/writings", {
        headers: { "X-Admin-Passcode": passcode },
      });
      if (!res.ok) throw new Error("Unauthorized or database error");
      const json = await res.json() as any;
      setWritingsList(json.data || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch writings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/users", {
        headers: { "X-Admin-Passcode": passcode },
      });
      if (!res.ok) throw new Error("Unauthorized or database error");
      const json = await res.json() as any;
      setUsersList(json.data || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "writings") fetchWritings();
    if (activeTab === "users") fetchUsers();
  }, [activeTab]);

  const handleDeleteWriting = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this writing?")) return;
    try {
      const res = await fetch(`/api/v1/admin/writings/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Passcode": passcode },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Writing deleted successfully");
      fetchWritings();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete writing");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This will cascade delete all comments/replies/likes.")) return;
    try {
      const res = await fetch(`/api/v1/admin/users/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Passcode": passcode },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/v1/admin/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const json = await res.json() as any;
      if (!res.ok) throw new Error(json.error || "Failed to seed");
      toast.success("50+ Multilingual writings seeded successfully!");
    } catch (e: any) {
      toast.error(e.message || "Error seeding database");
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredWritings = writingsList.filter((w) =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.primaryEmotion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = usersList.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.displayName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Tabs Selector */}
      <div className="flex border-b border-border/20 font-mono text-xs">
        <button
          onClick={() => { setActiveTab("writings"); setSearchQuery(""); }}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 transition-all ${
            activeTab === "writings" ? "border-primary text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Writings ({writingsList.length})
        </button>
        <button
          onClick={() => { setActiveTab("users"); setSearchQuery(""); }}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 transition-all ${
            activeTab === "users" ? "border-primary text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Users ({usersList.length})
        </button>
        <button
          onClick={() => { setActiveTab("seed"); setSearchQuery(""); }}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 transition-all ${
            activeTab === "seed" ? "border-primary text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          Database Seed
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab !== "seed" && (
        <div className="flex items-center gap-2">
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-mono text-xs max-w-sm"
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-xs font-mono text-muted-foreground animate-pulse">Fetching records...</p>
      ) : activeTab === "writings" ? (
        <div className="border border-border/40 overflow-hidden font-mono text-xs bg-muted/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/20 bg-muted/10">
                <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Title</th>
                <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Emotion</th>
                <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Lang</th>
                <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Date</th>
                <th className="p-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {filteredWritings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">No writings found.</td>
                </tr>
              ) : (
                filteredWritings.map((w) => (
                  <tr key={w.id} className="border-b border-border/10 hover:bg-muted/5">
                    <td className="p-3 font-bold truncate max-w-xs">{w.title}</td>
                    <td className="p-3 capitalize text-muted-foreground">{w.primaryEmotion}</td>
                    <td className="p-3 uppercase text-muted-foreground">{w.language}</td>
                    <td className="p-3 text-muted-foreground">
                      {formatDistanceToNow(new Date(w.createdAt), { addSuffix: true })}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWriting(w.id)}
                        className="h-7 px-2 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === "users" ? (
        <div className="border border-border/40 overflow-hidden font-mono text-xs bg-muted/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/20 bg-muted/10">
                <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">User</th>
                <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Followers</th>
                <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Following</th>
                <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Bio</th>
                <th className="p-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/10 hover:bg-muted/5">
                    <td className="p-3">
                      <div className="font-bold">{u.displayName || u.username}</div>
                      <div className="text-[10px] text-muted-foreground">@{u.username}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{u.followersCount}</td>
                    <td className="p-3 text-muted-foreground">{u.followingCount}</td>
                    <td className="p-3 text-muted-foreground max-w-xs truncate">{u.bio || "No biography"}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(u.id)}
                        className="h-7 px-2 hover:text-red-500"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-border/40 p-6 space-y-4 bg-muted/5 font-mono text-xs max-w-lg">
          <h3 className="font-bold flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-500" />
            Seed Celebrated Literature
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Populate the database with 50+ beautiful writings from classic poets in multiple languages (English, Spanish, Hindi, Urdu, French, Bangla, Punjabi, Tamil, Telugu, Arabic, German).
          </p>
          <Button onClick={handleSeed} disabled={isSeeding} size="sm">
            {isSeeding ? "Seeding..." : "Seed Database"}
          </Button>
        </div>
      )}
    </div>
  );
}
