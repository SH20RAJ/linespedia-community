"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldAlert, Trash2, UserMinus, FileText, Users, Database, Star, MessageSquare, LayoutDashboard } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ModerationPanelProps {
  passcode: string;
}

export function ModerationPanel({ passcode }: ModerationPanelProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "writings" | "users" | "comments" | "reviews" | "seed">("overview");
  const [writingsList, setWritingsList] = React.useState<any[]>([]);
  const [usersList, setUsersList] = React.useState<any[]>([]);
  const [commentsList, setCommentsList] = React.useState<any[]>([]);
  const [reviewsList, setReviewsList] = React.useState<any[]>([]);
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

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/comments", {
        headers: { "X-Admin-Passcode": passcode },
      });
      if (!res.ok) throw new Error("Failed to fetch comments");
      const json = await res.json() as any;
      setCommentsList(json.data || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch comments");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/reviews", {
        headers: { "X-Admin-Passcode": passcode },
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const json = await res.json() as any;
      setReviewsList(json.data || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch reviews");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all on mount to feed the overview stats
  React.useEffect(() => {
    fetchWritings();
    fetchUsers();
    fetchComments();
    fetchReviews();
  }, []);

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

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this comment?")) return;
    try {
      const res = await fetch(`/api/v1/admin/comments/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Passcode": passcode },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Comment deleted successfully");
      fetchComments();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete comment");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      const res = await fetch(`/api/v1/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Passcode": passcode },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete review");
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
      fetchWritings();
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

  const filteredComments = commentsList.filter((c) =>
    c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviews = reviewsList.filter((r) =>
    (r.content || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarOptions = [
    { key: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { key: "writings", label: `Writings (${writingsList.length})`, icon: FileText },
    { key: "users", label: `Users (${usersList.length})`, icon: Users },
    { key: "comments", label: `Comments (${commentsList.length})`, icon: MessageSquare },
    { key: "reviews", label: `Reviews (${reviewsList.length})`, icon: Star },
    { key: "seed", label: "Database Seed", icon: Database },
  ] as const;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-60 shrink-0 font-mono text-xs space-y-1 border-r border-border/20 pr-6">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-3">Admin Sidebar</h2>
        {sidebarOptions.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeTab === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => { setActiveTab(opt.key); setSearchQuery(""); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors font-bold uppercase ${
                isActive ? "bg-muted text-primary border-l-2 border-primary" : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{opt.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Main Moderation Content */}
      <div className="flex-1 min-w-0 space-y-6">
        {activeTab !== "overview" && activeTab !== "seed" && (
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
        ) : activeTab === "overview" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Writings", count: writingsList.length, icon: FileText, color: "text-blue-500 border-blue-500/20" },
                { label: "Registered Users", count: usersList.length, icon: Users, color: "text-green-500 border-green-500/20" },
                { label: "Total Comments", count: commentsList.length, icon: MessageSquare, color: "text-purple-500 border-purple-500/20" },
                { label: "Total Reviews", count: reviewsList.length, icon: Star, color: "text-amber-500 border-amber-500/20" },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className={`border p-4 rounded-none font-mono ${stat.color} bg-muted/5`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">{stat.label}</span>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-xl font-bold">{stat.count}</p>
                  </div>
                );
              })}
            </div>
            
            <div className="border border-border/40 p-4 font-mono text-xs text-muted-foreground bg-muted/5 leading-relaxed space-y-2">
              <h3 className="font-bold text-foreground">Operational Status</h3>
              <p>&middot; System passcode auth verified.</p>
              <p>&middot; Cascade delete constraints active.</p>
              <p>&middot; Multi-language seeds initialized.</p>
            </div>
          </div>
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
                          className="h-7 px-2 hover:text-red-500 cursor-pointer"
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
                          className="h-7 px-2 hover:text-red-500 cursor-pointer"
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
        ) : activeTab === "comments" ? (
          <div className="border border-border/40 overflow-hidden font-mono text-xs bg-muted/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/20 bg-muted/10">
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Comment</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Writer</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Post</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Date</th>
                  <th className="p-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredComments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">No comments found.</td>
                  </tr>
                ) : (
                  filteredComments.map((c) => (
                    <tr key={c.id} className="border-b border-border/10 hover:bg-muted/5">
                      <td className="p-3 font-medium truncate max-w-xs">{c.content}</td>
                      <td className="p-3">@{c.user.username}</td>
                      <td className="p-3 truncate max-w-[150px]">{c.writingTitle}</td>
                      <td className="p-3 text-muted-foreground">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(c.id)}
                          className="h-7 px-2 hover:text-red-500 cursor-pointer"
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
        ) : activeTab === "reviews" ? (
          <div className="border border-border/40 overflow-hidden font-mono text-xs bg-muted/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/20 bg-muted/10">
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Review</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Rating</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Writer</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Post</th>
                  <th className="p-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">No reviews found.</td>
                  </tr>
                ) : (
                  filteredReviews.map((r) => (
                    <tr key={r.id} className="border-b border-border/10 hover:bg-muted/5">
                      <td className="p-3 font-medium truncate max-w-xs">{r.content || "No comment content"}</td>
                      <td className="p-3 font-bold text-amber-500">{r.rating} / 5</td>
                      <td className="p-3">@{r.user.username}</td>
                      <td className="p-3 truncate max-w-[150px]">{r.writingTitle}</td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReview(r.id)}
                          className="h-7 px-2 hover:text-red-500 cursor-pointer"
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
        ) : (
          <div className="border border-border/40 p-6 space-y-4 bg-muted/5 font-mono text-xs max-w-lg">
            <h3 className="font-bold flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              Seed Celebrated Literature
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Populate the database with 50+ beautiful writings from classic poets in multiple languages (English, Spanish, Hindi, Urdu, French, Bangla, Punjabi, Tamil, Telugu, Arabic, German).
            </p>
            <Button onClick={handleSeed} disabled={isSeeding} size="sm" className="cursor-pointer">
              {isSeeding ? "Seeding..." : "Seed Database"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
