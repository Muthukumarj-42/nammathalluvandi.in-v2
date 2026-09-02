"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowRight } from "lucide-react";
import {
  getAllCartsAction,
  getBookingsAction,
  getWhatsappMessagesAction,
  getDisputesAction,
  getUsersAction,
  getVendorProfilesAction,
  blockVendorAction,
  updateCartStatusAction,
  updateBookingStatusAction,
  escalateBookingAction,
  updateDisputeStatusAction,
  updateCartAction,
  getAllSubscriptionsAdminAction,
  reconcileSubscriptionAdminAction,
} from "@/app/actions";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-browser";
import { getPlan, formatCurrency } from "@/lib/plans";

const FALLBACK_PHOTO = "/carts/covered-premium-cart/photo-1.webp";

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Normalizes any phone format (+91 xxxxx xxxxx, 91xxxxxxxxxx, xxxxxxxxxx) to a wa.me link.
function waLink(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const last10 = digits.slice(-10);
  if (last10.length !== 10) return null;
  return `https://wa.me/91${last10}`;
}

function getCartVendorInfo(cart: any, vendors: any[], users: any[]) {
  const vendor = vendors.find((v) => v.id === cart.vendor_id);
  if (vendor) {
    return { name: vendor.full_name || vendor.shop_name || "Unknown Vendor", whatsapp: vendor.whatsapp_number || vendor.phone || null };
  }
  const owner = users.find((u) => u.id === cart.owner_id);
  if (owner) return { name: owner.name || "Unknown Vendor", whatsapp: owner.phone || null };
  return { name: "Unknown Vendor", whatsapp: null };
}

type Tab = "pending" | "carts" | "vendors" | "subscriptions" | "bookings" | "disputes" | "whatsapp";

export default function AdminDashboard() {
  const supabase = createClient();
  const [authorized, setAuthorized] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("pending");

  const [carts, setCarts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsAvailable, setBookingsAvailable] = useState(true);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [disputesAvailable, setDisputesAvailable] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesAvailable, setMessagesAvailable] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("all");
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [viewingPhotos, setViewingPhotos] = useState<string[] | null>(null);

  const [editingCart, setEditingCart] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    cart_type: "",
    condition: "",
    daily_rent: "",
    area: "",
    description: "",
    verified: false,
    photos: [] as string[],
  });
  const [editSaving, setEditSaving] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "8838292849" || passcode === "muthuadmin") {
      setAuthorized(true);
      setPasscodeError("");
    } else {
      setPasscodeError("Invalid admin credentials. Access Denied.");
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resCarts, resVendors, resBookings, resDisputes, resMessages, resUsers, resSubs] = await Promise.all([
        getAllCartsAction(),
        getVendorProfilesAction(),
        getBookingsAction(),
        getDisputesAction(),
        getWhatsappMessagesAction(),
        getUsersAction(),
        getAllSubscriptionsAdminAction(),
      ]);

      if (resCarts.success) setCarts(resCarts.data);
      if (resVendors.success) setVendors(resVendors.data);

      setBookingsAvailable(resBookings.success);
      if (resBookings.success) setBookings(resBookings.data);

      setDisputesAvailable(resDisputes.success);
      if (resDisputes.success) setDisputes(resDisputes.data);

      setMessagesAvailable(resMessages.success);
      if (resMessages.success) setMessages(resMessages.data);

      if (resUsers.success && resUsers.data) setUsers(resUsers.data);
      if (resSubs.success && resSubs.data) setSubscriptions(resSubs.data);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async (id: string) => {
    setReconcilingId(id);
    try {
      const res = await reconcileSubscriptionAdminAction(id);
      if (res.success) {
        showToast(res.message || "Reconciled with Razorpay ✅");
        fetchAllData();
      } else {
        showToast("Reconciliation failed: " + res.message);
      }
    } catch (e: any) {
      showToast("Error: " + e.message);
    } finally {
      setReconcilingId(null);
    }
  };

  useEffect(() => {
    if (!authorized) return;
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((p) => p + 1);
    showToast("Dashboard refreshed");
  };

  // ── Actions ──
  const handleApprove = (id: string) => {
    setConfirmModal({
      open: true,
      title: "Approve Listing",
      message: "Approve this cart and make it live in the directory?",
      onConfirm: async () => {
        const res = await updateCartStatusAction(id, "live", true);
        if (res.success) {
          setCarts((prev) => prev.map((c) => (c.id === id ? { ...c, status: "live", verified: true } : c)));
          showToast("Cart approved and live ✅");
        } else {
          showToast("Operation failed: " + res.error);
        }
      },
    });
  };

  const handleReject = (id: string) => {
    setConfirmModal({
      open: true,
      title: "Reject Listing",
      message: "Reject this cart listing?",
      onConfirm: async () => {
        const res = await updateCartStatusAction(id, "inactive", false);
        if (res.success) {
          setCarts((prev) => prev.map((c) => (c.id === id ? { ...c, status: "inactive" } : c)));
          showToast("Cart rejected");
        } else {
          showToast("Operation failed: " + res.error);
        }
      },
    });
  };

  const handleDeactivate = (id: string) => {
    setConfirmModal({
      open: true,
      title: "Pause Listing",
      message: "Take this cart off the live directory?",
      onConfirm: async () => {
        const res = await updateCartStatusAction(id, "inactive", false);
        if (res.success) {
          setCarts((prev) => prev.map((c) => (c.id === id ? { ...c, status: "inactive" } : c)));
          showToast("Cart paused");
        } else {
          showToast("Operation failed: " + res.error);
        }
      },
    });
  };

  const handleBlockVendor = (id: string) => {
    setConfirmModal({
      open: true,
      title: "Block Vendor",
      message: "Block this vendor? This flags their profile for follow-up.",
      onConfirm: async () => {
        const res = await blockVendorAction(id);
        if (res.success) {
          setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status: "rejected" } : v)));
          showToast("Vendor blocked");
        } else {
          showToast("Operation failed: " + res.error);
        }
      },
    });
  };

  const handleReassign = (id: string) => {
    setConfirmModal({
      open: true,
      title: "Re-assign Booking",
      message: "Escalate this booking to the next nearest Cart Vendor?",
      onConfirm: async () => {
        const res = await escalateBookingAction(id);
        if (res.success) {
          showToast("Booking re-assigned");
          setRefreshTrigger((p) => p + 1);
        } else {
          showToast("Operation failed: " + res.error);
        }
      },
    });
  };

  const handleResolveDispute = (id: string) => {
    setConfirmModal({
      open: true,
      title: "Resolve Dispute",
      message: "Mark this dispute as resolved?",
      onConfirm: async () => {
        const res = await updateDisputeStatusAction(id, "resolved");
        if (res.success) {
          setDisputes((prev) => prev.filter((d) => d.id !== id));
          showToast("Dispute resolved");
        } else {
          showToast("Operation failed: " + res.error);
        }
      },
    });
  };

  // ── Edit cart modal ──
  const openEditModal = (cart: any) => {
    setEditingCart(cart);
    setEditForm({
      cart_type: cart.cart_type || cart.type || "",
      condition: cart.condition || "",
      daily_rent: String(cart.daily_rent || cart.price_per_day || ""),
      area: cart.area || "",
      description: cart.description || "",
      verified: cart.verified || false,
      photos: cart.photos || [],
    });
  };

  const closeEditModal = () => {
    setEditingCart(null);
    setEditSaving(false);
  };

  const handleRemovePhoto = (index: number) => {
    setEditForm((f) => ({
      ...f,
      photos: f.photos.filter((_, i) => i !== index),
    }));
  };

  const handleAddPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    let currentPhotos = [...editForm.photos];
    for (const file of files) {
      if (currentPhotos.length >= 5) break;

      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const path = `${editingCart?.id}/${filename}`;

      const { data, error } = await supabase.storage.from("carts").upload(path, file);

      if (!error && data) {
        const { data: urlData } = supabase.storage.from("carts").getPublicUrl(data.path);
        currentPhotos.push(urlData.publicUrl);
      }
    }
    setEditForm((f) => ({
      ...f,
      photos: currentPhotos,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingCart) return;
    setEditSaving(true);

    const res = await updateCartAction(editingCart.id, {
      type: editForm.cart_type,
      condition: editForm.condition,
      price_per_day: Number(editForm.daily_rent),
      area: editForm.area,
      description: editForm.description,
      verified: editForm.verified,
      photos: editForm.photos,
    });

    if (!res.success) {
      showToast("Error saving changes: " + res.error);
    } else {
      showToast("Cart updated ✅");
      closeEditModal();
      fetchAllData();
    }
    setEditSaving(false);
  };

  // ── CSV export ──
  const handleExport = () => {
    let rows: string[][] = [];
    let filename = "";

    if (activeTab === "carts" || activeTab === "pending") {
      const data = activeTab === "pending" ? pendingCarts : liveCarts;
      filename = `ntv-carts-${Date.now()}.csv`;
      rows = [
        ["ID", "Type", "Condition", "Daily Rent", "Area", "District", "Verified", "Status", "Created"],
        ...data.map((c) => [
          c.id,
          c.cart_type || c.type || "",
          c.condition || "",
          String(c.daily_rent || c.price_per_day || ""),
          c.area || "",
          c.district || "",
          String(c.verified || false),
          c.status || "",
          c.created_at || "",
        ]),
      ];
    } else if (activeTab === "vendors") {
      filename = `ntv-vendors-${Date.now()}.csv`;
      rows = [
        ["ID", "Name", "WhatsApp", "Area", "District", "Cart Count", "Status", "Joined"],
        ...vendors.map((v) => [
          v.id,
          v.full_name || v.shop_name || "",
          v.whatsapp_number || v.phone || "",
          v.area || "",
          v.district || "",
          String(v.cart_count || ""),
          v.status || "",
          v.created_at || "",
        ]),
      ];
    } else if (activeTab === "bookings") {
      filename = `ntv-bookings-${Date.now()}.csv`;
      rows = [
        ["Booking Code", "Status", "Cart ID", "Created", "Escalation Count"],
        ...bookings.map((b) => [
          b.booking_code || "",
          b.status || "",
          b.cart_id || "",
          b.created_at || "",
          String(b.escalation_count || 0),
        ]),
      ];
    } else {
      showToast("Nothing to export on this tab");
      return;
    }

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`Exported ${rows.length - 1} rows`);
  };

  // ── Derived data ──
  const pendingCarts = carts.filter((c) => c.status === "pending_review");
  const liveCarts = carts.filter((c) => c.status === "live");
  const openDisputes = disputes.filter((d) => d.status === "open");
  const activeBookings = bookings.filter((b) => b.status !== "completed" && b.status !== "disputed");
  const stuckBookings = activeBookings.filter(
    (b) => b.status === "sent" && new Date(b.assigned_at).getTime() < Date.now() - 30 * 60 * 1000
  );

  const searchLower = search.trim().toLowerCase();
  const filteredLiveCarts = searchLower
    ? liveCarts.filter((c) =>
        [c.area, c.cart_type || c.type, c.description].some((f) => (f || "").toLowerCase().includes(searchLower))
      )
    : liveCarts;
  const filteredVendors = searchLower
    ? vendors.filter((v) =>
        [v.full_name, v.area, v.district].some((f) => (f || "").toLowerCase().includes(searchLower))
      )
    : vendors;

  // Sort bookings: stuck ones first (oldest assigned_at), then newest created first.
  const sortedBookings = [...activeBookings].sort((a, b) => {
    const aStuck = a.status === "sent" && new Date(a.assigned_at).getTime() < Date.now() - 30 * 60 * 1000;
    const bStuck = b.status === "sent" && new Date(b.assigned_at).getTime() < Date.now() - 30 * 60 * 1000;
    if (aStuck !== bStuck) return aStuck ? -1 : 1;
    if (aStuck && bStuck) return new Date(a.assigned_at).getTime() - new Date(b.assigned_at).getTime();
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // ── Login gate ──
  if (!authorized) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface border border-outline-variant/20 rounded-2xl p-8">
          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-on-surface">Admin Portal</h1>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest">Namma Thalluvandi Control Panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="passcode" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Enter Admin Key / Phone
              </label>
              <input
                type="password"
                id="passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Admin Key"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm text-center placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>
            {passcodeError && <p className="text-xs text-error text-center font-bold">{passcodeError}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-1.5 hover:bg-primary-container transition"
            >
              Authenticate <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-on-surface-variant">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "carts", label: "Live Carts" },
    { id: "vendors", label: "Vendors" },
    { id: "subscriptions", label: "💳 Subscriptions" },
    { id: "bookings", label: "Bookings" },
    { id: "disputes", label: "Disputes" },
    { id: "whatsapp", label: "WhatsApp Log" },
  ];

  const activeSubscriptionsCount = subscriptions.filter((s) => s.status === "active").length;

  return (
    <main className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-on-surface">NTV Admin</h1>
            <p className="text-xs text-on-surface-variant">Namma Thalluvandi Control Panel</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm font-medium hover:bg-surface-container transition"
            >
              ↓ Export
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm font-medium hover:bg-surface-container transition"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "rounded-2xl p-4 text-left transition w-full border",
              pendingCarts.length > 0
                ? "bg-yellow-50/50 border-yellow-200"
                : "bg-surface border-outline-variant/20 hover:border-primary/30 hover:bg-primary/5"
            )}
          >
            <p className="text-xs font-medium text-on-surface-variant mb-1">Pending Review</p>
            <p className={cn("font-display text-3xl font-bold", pendingCarts.length > 0 ? "text-yellow-800" : "text-on-surface")}>
              {pendingCarts.length}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">carts awaiting approval</p>
          </button>

          <button
            onClick={() => setActiveTab("carts")}
            className="bg-surface rounded-2xl p-4 border border-outline-variant/20 text-left hover:border-primary/30 hover:bg-primary/5 transition w-full"
          >
            <p className="text-xs font-medium text-on-surface-variant mb-1">Live Carts</p>
            <p className="font-display text-3xl font-bold text-on-surface">{liveCarts.length}</p>
            <p className="text-xs text-on-surface-variant mt-1">active listings</p>
          </button>

          <button
            onClick={() => setActiveTab("subscriptions")}
            className={cn(
              "rounded-2xl p-4 text-left transition w-full border",
              activeSubscriptionsCount > 0
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-surface border-outline-variant/20 hover:border-primary/30 hover:bg-primary/5"
            )}
          >
            <p className="text-xs font-medium text-on-surface-variant mb-1">Subscriptions</p>
            <p className={cn("font-display text-3xl font-bold", activeSubscriptionsCount > 0 ? "text-emerald-700" : "text-on-surface")}>
              {activeSubscriptionsCount}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">{subscriptions.length} total purchased</p>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={cn(
              "rounded-2xl p-4 text-left transition w-full border",
              stuckBookings.length > 0
                ? "bg-error/5 border-error/30"
                : "bg-surface border-outline-variant/20 hover:border-primary/30 hover:bg-primary/5"
            )}
          >
            <p className="text-xs font-medium text-on-surface-variant mb-1">Bookings</p>
            <p className="font-display text-3xl font-bold text-on-surface">{activeBookings.length}</p>
            <p className="text-xs text-on-surface-variant mt-1">{stuckBookings.length} need attention</p>
          </button>

          <button
            onClick={() => setActiveTab("disputes")}
            className={cn(
              "rounded-2xl p-4 text-left transition w-full border",
              openDisputes.length > 0
                ? "bg-error/5 border-error/30"
                : "bg-surface border-outline-variant/20 hover:border-primary/30 hover:bg-primary/5"
            )}
          >
            <p className="text-xs font-medium text-on-surface-variant mb-1">Disputes</p>
            <p className="font-display text-3xl font-bold text-on-surface">{openDisputes.length}</p>
            <p className="text-xs text-on-surface-variant mt-1">open reports</p>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap transition",
                  isActive
                    ? "bg-primary text-on-primary font-semibold"
                    : "bg-surface border border-outline-variant/30 text-on-surface-variant font-medium hover:border-primary/40"
                )}
              >
                {tab.label}
                {tab.id === "pending" && pendingCarts.length > 0 && (
                  <span className="ml-1.5 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                    {pendingCarts.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {/* PENDING */}
          {activeTab === "pending" && (
            <div>
              {pendingCarts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="font-semibold text-on-surface">All caught up!</p>
                  <p className="text-sm text-on-surface-variant">No pending cart approvals</p>
                </div>
              ) : (
                pendingCarts.map((cart) => {
                  const { name: vendorName, whatsapp: vendorWhatsapp } = getCartVendorInfo(cart, vendors, users);
                  const photos: string[] = Array.isArray(cart.photos) ? cart.photos : [];
                  const wa = waLink(vendorWhatsapp);
                  return (
                    <div key={cart.id} className="bg-surface rounded-2xl border border-yellow-200 overflow-hidden mb-4">
                      <div className="relative">
                        <img src={photos[0] || FALLBACK_PHOTO} className="w-full h-48 object-cover" alt={cart.type} />
                        <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          PENDING REVIEW
                        </span>
                        <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {photos.length} photos
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs px-2 py-1 rounded-full border border-outline-variant/40 text-on-surface-variant font-medium">
                            {cart.cart_type || cart.type}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full border border-outline-variant/40 text-on-surface-variant">
                            {cart.condition}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <p className="text-xs text-on-surface-variant">Size</p>
                            <p className="font-medium text-on-surface">{cart.size || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-on-surface-variant">Stove</p>
                            <p className="font-medium text-on-surface">{cart.stove_type || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-on-surface-variant">Daily Rent</p>
                            <p className="font-medium text-primary">₹{cart.daily_rent || cart.price_per_day}/day</p>
                          </div>
                          <div>
                            <p className="text-xs text-on-surface-variant">Location</p>
                            <p className="font-medium text-on-surface text-sm">{cart.area || "—"}</p>
                          </div>
                        </div>

                        {cart.description && (
                          <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">{cart.description}</p>
                        )}

                        <div className="bg-surface-container rounded-xl p-3 mb-4">
                          <p className="text-xs text-on-surface-variant mb-1">Listed by</p>
                          <p className="font-semibold text-on-surface text-sm">{vendorName}</p>
                          {wa && (
                            <a href={wa} target="_blank" rel="noreferrer" className="text-xs text-primary font-medium mt-0.5 block">
                              📱 {vendorWhatsapp}
                            </a>
                          )}
                          <p className="text-xs text-on-surface-variant mt-1">Submitted {timeAgo(cart.created_at)}</p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(cart.id)}
                            className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:bg-primary-container transition"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleReject(cart.id)}
                            className="flex-1 py-3 rounded-xl bg-error/10 text-error font-bold text-sm uppercase tracking-wider hover:bg-error/20 transition"
                          >
                            ✕ Reject
                          </button>
                        </div>

                        {photos.length > 1 && (
                          <button
                            onClick={() => setViewingPhotos(photos)}
                            className="w-full mt-2 py-2 text-xs text-primary font-medium text-center hover:underline"
                          >
                            View all {photos.length} photos →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* LIVE CARTS */}
          {activeTab === "carts" && (
            <div>
              <input
                placeholder="Search by area, type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition mb-4"
              />
              {filteredLiveCarts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sm text-on-surface-variant">No live carts match your search.</p>
                </div>
              ) : (
                filteredLiveCarts.map((cart) => {
                  const photos: string[] = Array.isArray(cart.photos) ? cart.photos : [];
                  return (
                    <div key={cart.id} className="bg-surface rounded-2xl border border-outline-variant/20 p-3 flex gap-3 items-center mb-3">
                      <img src={photos[0] || FALLBACK_PHOTO} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" alt={cart.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs px-2 py-0.5 rounded-full border border-outline-variant/30 text-on-surface-variant">
                            {cart.cart_type || cart.type}
                          </span>
                          {cart.verified && <span className="text-xs text-primary font-medium">✓ Verified</span>}
                        </div>
                        <p className="font-semibold text-on-surface text-sm truncate">{cart.area || "No location"}</p>
                        <p className="text-xs text-on-surface-variant">
                          ₹{cart.daily_rent || cart.price_per_day}/day · {cart.condition}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleDeactivate(cart.id)}
                          className="px-3 py-1.5 rounded-lg bg-error/10 text-error text-xs font-medium hover:bg-error/20 transition"
                        >
                          Pause
                        </button>
                        <button
                          onClick={() => openEditModal(cart)}
                          className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-medium hover:bg-surface-container/80 transition"
                        >
                          Edit
                        </button>
                        <a
                          href={`/carts/${cart.uniqueCode || cart.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-medium text-center hover:bg-surface-container/80 transition"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VENDORS */}
          {activeTab === "vendors" && (
            <div>
              <input
                placeholder="Search by name, area, district..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition mb-4"
              />
              {filteredVendors.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sm text-on-surface-variant">No vendors match your search.</p>
                </div>
              ) : (
                filteredVendors.map((vendor) => {
                  const vendorActiveCartCount = carts.filter(
                    (c) => c.status === "live" && (c.vendor_id === vendor.id || c.owner_id === vendor.id)
                  ).length;
                  const wa = waLink(vendor.whatsapp_number || vendor.phone);
                  return (
                    <div key={vendor.id} className="bg-surface rounded-2xl border border-outline-variant/20 p-4 mb-3">
                      <div className="flex items-center gap-3 mb-3">
                        {vendor.profile_photo_url ? (
                          <img src={vendor.profile_photo_url} className="w-12 h-12 rounded-full object-cover" alt={vendor.full_name} />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                            {(vendor.full_name || vendor.shop_name || "V")[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-on-surface">{vendor.full_name || vendor.shop_name || "Unknown"}</p>
                          <p className="text-xs text-on-surface-variant">
                            📍 {vendor.area || "—"}, {vendor.district || "—"}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            vendor.status === "approved" ? "bg-primary/10 text-primary" : "bg-yellow-100 text-yellow-800"
                          )}
                        >
                          {vendor.status === "approved" ? "✅ Active" : vendor.status === "rejected" ? "🚫 Blocked" : "⏳ Pending"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        <div className="bg-surface-container rounded-xl p-2">
                          <p className="text-xs text-on-surface-variant">Carts</p>
                          <p className="font-bold text-on-surface">{vendor.cart_count || "—"}</p>
                        </div>
                        <div className="bg-surface-container rounded-xl p-2">
                          <p className="text-xs text-on-surface-variant">Listed</p>
                          <p className="font-bold text-on-surface">{vendorActiveCartCount}</p>
                        </div>
                        <div className="bg-surface-container rounded-xl p-2">
                          <p className="text-xs text-on-surface-variant">Joined</p>
                          <p className="font-bold text-on-surface text-xs">{vendor.created_at ? formatDate(vendor.created_at) : "—"}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {wa ? (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold text-center hover:bg-primary/20 transition"
                          >
                            📱 WhatsApp
                          </a>
                        ) : (
                          <span className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface-variant text-sm font-medium text-center">
                            No WhatsApp on file
                          </span>
                        )}
                        <button
                          onClick={() => handleBlockVendor(vendor.id)}
                          className="px-4 py-2.5 rounded-xl bg-error/10 text-error text-sm font-medium hover:bg-error/20 transition"
                        >
                          Block
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* BOOKINGS */}
          {activeTab === "bookings" && (
            <div>
              {!bookingsAvailable ? (
                <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/20">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="font-semibold text-on-surface mb-1">Bookings Coming Soon</p>
                  <p className="text-sm text-on-surface-variant">
                    WhatsApp automation not yet active. Bookings will appear here once the system is live.
                  </p>
                </div>
              ) : sortedBookings.length === 0 ? (
                <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/20">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="font-semibold text-on-surface mb-1">No active bookings</p>
                  <p className="text-sm text-on-surface-variant">New booking enquiries will appear here.</p>
                </div>
              ) : (
                sortedBookings.map((booking) => {
                  const isStuck =
                    booking.status === "sent" && new Date(booking.assigned_at).getTime() < Date.now() - 30 * 60 * 1000;
                  const cv = users.find((u) => u.id === booking.cv_id);
                  const cvWa = waLink(cv?.phone);
                  const minutesAgo = Math.floor((Date.now() - new Date(booking.assigned_at).getTime()) / 60000);

                  if (isStuck) {
                    return (
                      <div key={booking.id} className="bg-error/5 rounded-2xl border border-error/30 p-4 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-error text-white text-xs font-bold px-2 py-0.5 rounded-full">⚠️ STUCK</span>
                          <span className="text-xs text-on-surface-variant">{booking.booking_code}</span>
                          <span className="text-xs text-error ml-auto">{minutesAgo} min no response</span>
                        </div>
                        <p className="text-sm font-medium text-on-surface mb-3">CV hasn't responded to enquiry</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReassign(booking.id)}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary-container transition"
                          >
                            Re-assign to Next CV
                          </button>
                          {cvWa && (
                            <a
                              href={cvWa}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2.5 rounded-xl bg-surface border border-outline-variant/30 text-sm font-medium hover:bg-surface-container transition"
                            >
                              Call CV
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={booking.id} className="bg-surface rounded-2xl border border-outline-variant/20 p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-bold text-on-surface">{booking.booking_code}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{booking.status}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">Created {timeAgo(booking.created_at)}</p>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* DISPUTES */}
          {activeTab === "disputes" && (
            <div>
              {!disputesAvailable ? (
                <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/20">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="font-semibold text-on-surface mb-1">No disputes reported yet.</p>
                  <p className="text-sm text-on-surface-variant">Dispute reports from CVs and BVs will appear here.</p>
                </div>
              ) : openDisputes.length === 0 ? (
                <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/20">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="font-semibold text-on-surface mb-1">No open disputes</p>
                  <p className="text-sm text-on-surface-variant">All running smoothly.</p>
                </div>
              ) : (
                openDisputes.map((dispute) => (
                  <div key={dispute.id} className="bg-surface rounded-2xl border border-error/20 p-4 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-error">{dispute.booking_id || "No booking ref"}</span>
                      <span className="text-xs text-on-surface-variant">{timeAgo(dispute.created_at)}</span>
                    </div>
                    <p className="text-sm text-on-surface mb-3">{dispute.description}</p>
                    <button
                      onClick={() => handleResolveDispute(dispute.id)}
                      className="w-full py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary-container transition"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* WHATSAPP LOG */}
          {activeTab === "whatsapp" && (
            <div>
              {!messagesAvailable ? (
                <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/20">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="font-semibold text-on-surface mb-1">WhatsApp Log</p>
                  <p className="text-sm text-on-surface-variant px-8">
                    Automated WhatsApp messages will appear here once the WhatsApp Cloud API is connected.
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/20">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="font-semibold text-on-surface mb-1">No messages yet</p>
                  <p className="text-sm text-on-surface-variant px-8">
                    Automated WhatsApp messages will appear here once the WhatsApp Cloud API is connected.
                  </p>
                </div>
              ) : (
                messages.slice(0, 50).map((msg) => (
                  <div key={msg.id} className="bg-surface rounded-2xl border border-outline-variant/20 p-3 mb-2 flex gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0",
                        msg.direction === "outbound" ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface"
                      )}
                    >
                      {msg.direction === "outbound" ? "↑" : "↓"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-on-surface-variant">{msg.recipient_phone}</span>
                        <span
                          className={cn(
                            "text-xs ml-auto",
                            msg.status === "delivered" ? "text-primary" : msg.status === "failed" ? "text-error" : "text-on-surface-variant"
                          )}
                        >
                          {msg.status === "delivered" ? "✓ Delivered" : msg.status === "failed" ? "✗ Failed" : "Sent"}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface line-clamp-2">{msg.message_body}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{timeAgo(msg.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SUBSCRIPTIONS & PURCHASES */}
          {activeTab === "subscriptions" && (
            <div className="space-y-4">
              {/* Filter pills */}
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {["all", "active", "pending", "failed", "cancelled", "expired"].map((f) => {
                  const count =
                    f === "all"
                      ? subscriptions.length
                      : subscriptions.filter((s) => s.status === f || (f === "pending" && s.status === "initiated")).length;
                  return (
                    <button
                      key={f}
                      onClick={() => setSubscriptionFilter(f)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition",
                        subscriptionFilter === f
                          ? "bg-primary text-on-primary"
                          : "bg-surface border border-outline-variant/30 text-on-surface-variant hover:border-primary/40"
                      )}
                    >
                      {f} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Subscriptions List */}
              {(() => {
                const filtered = subscriptions.filter((s) => {
                  if (subscriptionFilter === "all") return true;
                  if (subscriptionFilter === "pending") return s.status === "pending" || s.status === "initiated";
                  return s.status === subscriptionFilter;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/20">
                      <p className="text-4xl mb-3">💳</p>
                      <p className="font-semibold text-on-surface mb-1">No Subscriptions Found</p>
                      <p className="text-xs text-on-surface-variant">
                        No purchases match the "{subscriptionFilter}" filter.
                      </p>
                    </div>
                  );
                }

                return filtered.map((sub) => {
                  const plan = getPlan(sub.plan_id);
                  const cycleLabel = sub.billing_cycle === "3_months" ? "3 Months" : "1 Month";
                  const wa = waLink(sub.userPhone);
                  const isReconciling = reconcilingId === (sub.razorpay_subscription_id || sub.payment_id || sub.id);

                  return (
                    <div
                      key={sub.id}
                      className="bg-surface rounded-2xl border border-outline-variant/20 p-5 shadow-xs space-y-4 hover:border-primary/30 transition"
                    >
                      {/* Card Header: User, Plan Badge, Amount, Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/10 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                            {sub.userName?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-on-surface">{sub.userName}</h4>
                              {wa && (
                                <a
                                  href={wa}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full hover:bg-emerald-500/20 transition flex items-center gap-1"
                                >
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                              {sub.userPhone || sub.userEmail || sub.user_id}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                            style={{ background: plan.bgHex, color: plan.accentHex }}
                          >
                            {plan.badgeEn}
                          </span>
                          <span className="text-base font-black font-display text-primary">
                            {formatCurrency(sub.amount)}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-bold px-2.5 py-1 rounded-full capitalize",
                              sub.status === "active"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : sub.status === "failed"
                                ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                : "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                            )}
                          >
                            {sub.status}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-surface-container p-3 rounded-xl">
                        <div>
                          <p className="text-on-surface-variant/70">Cycle</p>
                          <p className="font-semibold text-on-surface">{cycleLabel}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant/70">Listings Quota</p>
                          <p className="font-semibold text-on-surface">
                            {sub.cartsCount} / {sub.max_carts} used
                          </p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant/70">Starts At</p>
                          <p className="font-semibold text-on-surface">{formatDate(sub.starts_at)}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant/70">Expires At</p>
                          <p className="font-semibold text-on-surface">{formatDate(sub.expires_at)}</p>
                        </div>
                      </div>

                      {/* IDs and Reconcile action */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-on-surface-variant">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono">
                          {sub.payment_id && <span>Pay ID: {sub.payment_id}</span>}
                          {sub.razorpay_order_id && <span>Order: {sub.razorpay_order_id}</span>}
                          {sub.razorpay_subscription_id && <span>Sub ID: {sub.razorpay_subscription_id}</span>}
                        </div>

                        <button
                          onClick={() =>
                            handleReconcile(
                              sub.razorpay_subscription_id || sub.payment_id || sub.razorpay_order_id || sub.id
                            )
                          }
                          disabled={isReconciling}
                          className="px-3 py-1.5 rounded-lg bg-surface border border-outline-variant/30 text-on-surface hover:bg-surface-container font-semibold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <span className={isReconciling ? "animate-spin" : ""}>↻</span>
                          <span>{isReconciling ? "Checking Razorpay…" : "Reconcile with Razorpay"}</span>
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Photo viewer modal */}
      {viewingPhotos && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          <button onClick={() => setViewingPhotos(null)} className="absolute top-4 right-4 text-white text-2xl">
            ✕
          </button>
          <div className="flex overflow-x-auto h-full items-center gap-4 px-4">
            {viewingPhotos.map((url) => (
              <img key={url} src={url} className="h-3/4 object-contain rounded-xl flex-shrink-0" alt="Cart" />
            ))}
          </div>
        </div>
      )}

      {/* Edit cart modal */}
      {editingCart && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
          onClick={closeEditModal}
        >
          <div
            className="bg-surface w-full md:max-w-lg rounded-t-3xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-on-surface">Edit Cart</h2>
              <button onClick={closeEditModal} className="text-on-surface-variant text-2xl leading-none">
                ✕
              </button>
            </div>

            {/* Photo management */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-on-surface mb-3">Cart Photos</p>

              <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                {editForm.photos.map((url, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <img src={url} className="w-20 h-20 rounded-xl object-cover" alt="Cart" />
                    <button
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white rounded-full text-xs flex items-center justify-center font-bold leading-none"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {editForm.photos.length < 5 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface-container flex flex-col items-center justify-center cursor-pointer flex-shrink-0 hover:border-primary/40 transition">
                    <span className="text-2xl text-on-surface-variant">+</span>
                    <span className="text-xs text-on-surface-variant mt-1">Add</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddPhotos} />
                  </label>
                )}
              </div>

              <p className="text-xs text-on-surface-variant">Tap ✕ to remove a photo. Tap + to add new ones. Max 5 photos.</p>
            </div>

            {/* Cart details */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Cart Type</label>
                <select
                  value={editForm.cart_type}
                  onChange={(e) => setEditForm((f) => ({ ...f, cart_type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                >
                  <option value="With Store">With Store / Stove Cart</option>
                  <option value="With Roof">With Roof / Covered Cart</option>
                  <option value="Ice Cream">Ice Cream Cart</option>
                  <option value="Tea Stall">Tea &amp; Coffee Cart</option>
                  <option value="E-Rickshaw">E-Rickshaw Food Cart</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Condition</label>
                <select
                  value={editForm.condition}
                  onChange={(e) => setEditForm((f) => ({ ...f, condition: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                >
                  <option value="New">Brand New</option>
                  <option value="Used - Very Good">Used — Very Good</option>
                  <option value="Used - Good">Used — Good</option>
                  <option value="Used - Fair">Used — Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Daily Rent (₹)</label>
                <input
                  type="number"
                  value={editForm.daily_rent}
                  onChange={(e) => setEditForm((f) => ({ ...f, daily_rent: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Area / Location</label>
                <input
                  type="text"
                  value={editForm.area}
                  placeholder="e.g. Ondipudur, Coimbatore"
                  onChange={(e) => setEditForm((f) => ({ ...f, area: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container">
                <div>
                  <p className="text-sm font-semibold text-on-surface">Verified Status</p>
                  <p className="text-xs text-on-surface-variant">Show verified badge on listing</p>
                </div>
                <button
                  onClick={() => setEditForm((f) => ({ ...f, verified: !f.verified }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    editForm.verified ? "bg-primary" : "bg-outline-variant/40"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${
                      editForm.verified ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveEdit}
              disabled={editSaving}
              className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:bg-primary-container transition disabled:opacity-50"
            >
              {editSaving ? "Saving..." : "SAVE CHANGES"}
            </button>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmModal && confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface border border-outline-variant/20 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h4 className="font-display text-lg font-bold text-on-surface">{confirmModal.title}</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">{confirmModal.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary-container transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-on-surface text-surface px-5 py-3 rounded-full text-sm font-medium z-50 shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}
