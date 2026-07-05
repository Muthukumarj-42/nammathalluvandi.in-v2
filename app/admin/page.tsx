"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ShoppingBag,
  CalendarDays,
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Lock,
  Compass,
  FileText,
  LogOut,
  Download,
  Pencil,
  X,
  Image as ImageIcon,
  Filter,
} from "lucide-react";
import {
  getAllCartsAction,
  getBookingsAction,
  getWhatsappMessagesAction,
  getDisputesAction,
  getUsersAction,
  updateCartStatusAction,
  updateCartAction,
  updateBookingStatusAction,
  escalateBookingAction,
  updateDisputeStatusAction
} from "@/app/actions";
import { calculateHaversineDistance } from "@/lib/routing";
import { getLocalFallbackLocationName } from "@/lib/geocoding";

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  // Data States
  const [carts, setCarts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listed" | "live" | "bookings" | "disputes" | "vendors" | "messages" | "users">("listed");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Edit Modal state
  const [editModal, setEditModal] = useState<{ open: boolean; cart: any | null }>({ open: false, cart: null });
  const [editForm, setEditForm] = useState<any>({});
  const [editSaving, setEditSaving] = useState(false);

  // Cart status filter for listed tab
  const [cartStatusFilter, setCartStatusFilter] = useState<"all" | "pending_review" | "live" | "inactive">("all");

  // Custom Confirmation modal states
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    // Toast notifications disabled
  };

  // Authenticate Muthu
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "8838292849" || passcode === "muthuadmin") {
      setAuthorized(true);
      setPasscodeError("");
    } else {
      setPasscodeError("Invalid admin credentials. Access Denied.");
    }
  };

  // Fetch all admin data
  useEffect(() => {
    if (!authorized) return;
    setLoading(true);
    async function loadAdminData() {
      try {
        const [resCarts, resBookings, resMessages, resDisputes, resUsers] = await Promise.all([
          getAllCartsAction(),
          getBookingsAction(),
          getWhatsappMessagesAction(),
          getDisputesAction(),
          getUsersAction()
        ]);

        if (resCarts.success) setCarts(resCarts.data);
        if (resBookings.success) setBookings(resBookings.data);
        if (resMessages.success) setMessages(resMessages.data);
        if (resDisputes.success) setDisputes(resDisputes.data);
        if (resUsers.success) setUsers(resUsers.data);
      } catch (err) {
        console.error("Failed to load admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [authorized, refreshTrigger]);

  // Operations using custom toast & confirm Modal
  const handleApproveCart = (id: string) => {
    setConfirmModal({
      open: true,
      title: "Approve Listing",
      message: "Are you sure you want to approve this cart and make it live in the directory?",
      onConfirm: async () => {
        const res = await updateCartStatusAction(id, "live", true);
        if (res.success) {
          showToast("Cart approved & set to LIVE!", "success");
          setRefreshTrigger(p => p + 1);
        } else {
          showToast("Operation failed: " + res.error, "error");
        }
      }
    });
  };

  const handleRejectCart = (id: string) => {
    setConfirmModal({
      open: true,
      title: "Deactivate Listing",
      message: "Are you sure you want to deactivate/reject this listing?",
      onConfirm: async () => {
        const res = await updateCartStatusAction(id, "inactive", false);
        if (res.success) {
          showToast("Cart deactivated!", "success");
          setRefreshTrigger(p => p + 1);
        } else {
          showToast("Operation failed: " + res.error, "error");
        }
      }
    });
  };

  const handleForceEscalate = (id: string) => {
    setConfirmModal({
      open: true,
      title: "Escalate Booking",
      message: "Are you sure you want to manually escalate this booking to the next nearest Cart Vendor?",
      onConfirm: async () => {
        const res = await escalateBookingAction(id);
        if (res.success) {
          showToast("Booking escalated successfully!", "success");
          setRefreshTrigger(p => p + 1);
        } else {
          showToast("Escalation failed: " + res.error, "error");
        }
      }
    });
  };

  const handleResolveDispute = (id: string) => {
    setConfirmModal({
      open: true,
      title: "Resolve Dispute",
      message: "Are you sure you want to mark this complaint/query as resolved?",
      onConfirm: async () => {
        const res = await updateDisputeStatusAction(id, "resolved");
        if (res.success) {
          showToast("Complaint/Query marked as resolved.", "success");
          setRefreshTrigger(p => p + 1);
        } else {
          showToast("Operation failed: " + res.error, "error");
        }
      }
    });
  };

  const handleUpdateBookingStatus = async (id: string, status: any) => {
    const res = await updateBookingStatusAction(id, status);
    if (res.success) {
      showToast(`Booking status updated to ${status}`, "success");
      setRefreshTrigger(p => p + 1);
    } else {
      showToast("Operation failed: " + res.error, "error");
    }
  };

  // Export all carts as CSV
  const handleExportCarts = () => {
    const headers = ["ID", "Type", "Condition", "Size", "Weight", "Stove", "Price/Month", "Description", "Latitude", "Longitude", "Status", "Verified", "Owner ID", "Photo URL", "Created At"];
    const rows = carts.map(c => {
      const img = (Array.isArray(c.images) && c.images.length > 0) ? c.images[0] : 
                  ((Array.isArray(c.photos) && c.photos.length > 0) ? c.photos[0] : "");
      const photoUrl = img ? (img.startsWith("http") ? img : `https://nammathalluvandi.in${img}`) : "";
      return [
        c.id,
        c.type,
        c.condition,
        c.size || "",
        c.weight || "",
        c.stove_type || "",
        c.price_per_month || "",
        (c.description || "").replace(/,/g, ";"),
        c.latitude,
        c.longitude,
        c.status,
        c.verified ? "Yes" : "No",
        c.owner_id,
        photoUrl,
        c.created_at || ""
      ];
    });
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `thalluvandi-carts-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Open edit modal
  const handleOpenEditModal = (cart: any) => {
    setEditForm({
      type: cart.type || "",
      condition: cart.condition || "New",
      size: cart.size || "",
      weight: cart.weight || "",
      stove_type: cart.stove_type || "",
      price_per_month: cart.price_per_month || "",
      description: cart.description || "",
    });
    setEditModal({ open: true, cart });
  };

  // Download single cart image file
  const handleDownloadSingleCartImage = (c: any) => {
    const img = (Array.isArray(c.images) && c.images.length > 0) ? c.images[0] : 
                ((Array.isArray(c.photos) && c.photos.length > 0) ? c.photos[0] : "");

    if (img) {
      const imgLink = document.createElement("a");
      imgLink.href = img;
      const ext = img.split('.').pop()?.split('?')[0] || "webp";
      imgLink.download = `thalluvandi-cart-${c.id}-photo.${ext}`;
      document.body.appendChild(imgLink);
      imgLink.click();
      document.body.removeChild(imgLink);
      showToast(`Cart image for ID ${c.id} downloaded successfully!`, "success");
    } else {
      showToast("No image available for this cart.", "error");
    }
  };

  // Save edit from modal
  const handleSaveEdit = async () => {
    if (!editModal.cart) return;
    setEditSaving(true);
    const res = await updateCartAction(editModal.cart.id, {
      type: editForm.type,
      condition: editForm.condition,
      size: editForm.size,
      weight: editForm.weight,
      stove_type: editForm.stove_type,
      price_per_month: Number(editForm.price_per_month),
      description: editForm.description,
    });
    setEditSaving(false);
    if (res.success) {
      showToast("Cart details updated successfully!", "success");
      setEditModal({ open: false, cart: null });
      setRefreshTrigger(p => p + 1);
    } else {
      showToast("Save failed: " + res.error, "error");
    }
  };

  // Helper stats
  const pendingCarts = carts.filter(c => c.status === "pending_review");
  const liveCarts = carts.filter(c => c.status === "live");
  const openDisputes = disputes.filter(d => d.status === "open");
  const filteredListedCarts = cartStatusFilter === "all" ? carts : carts.filter(c => c.status === cartStatusFilter);


  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#0a0a08] flex items-center justify-center p-4 text-[#f6ded3]">
        <div className="w-full max-w-md bg-[#160c06] border border-[#ffb690]/15 rounded-2xl p-8 shadow-premium relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#f97316]/5 blur-2xl rounded-full"></div>

          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 bg-[#f97316]/10 border border-[#f97316]/30 text-[#f97316] rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="font-display text-3xl uppercase tracking-wider text-[#fffdf7]">Admin Portal</h1>
            <p className="text-xs text-[#f6ded3]/60 uppercase tracking-widest">Namma Thalluvandi Management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="passcode" className="text-xs font-bold uppercase tracking-wider text-[#ffb690] mb-2">
                Enter Admin Key / Phone
              </label>
              <input
                type="password"
                id="passcode"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Enter Admin Key"
                className="w-full h-12 bg-[#0a0a08] border border-[#ffb690]/25 rounded-xl px-4 text-center text-lg outline-none focus:border-[#f97316] text-[#116D03] placeholder:text-[#ffb690]/30 tracking-widest placeholder:tracking-normal placeholder:text-sm"
              />
            </div>
            {passcodeError && (
              <p className="text-xs text-red-500 text-center font-bold">{passcodeError}</p>
            )}
            <button
              type="submit"
              className="w-full h-12 bg-[#f97316] hover:bg-[#e2640e] text-[#0a0a08] font-bold uppercase tracking-wider text-sm rounded-xl flex items-center justify-center gap-1.5"
            >
              Authenticate <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a08] text-[#f6ded3] pt-24 pb-12">
      <div className="noise-overlay"></div>

      <div className="site-container max-w-7xl mx-auto px-4">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#ffb690]/10 pb-6 mb-8">
          <div>
            <span className="font-display text-xs tracking-widest text-[#116D03] uppercase">Control Panel</span>
            <h1 className="font-display text-2xl sm:text-4xl text-[#116D03] uppercase tracking-wider mt-1">ADMINISTRATOR DASHBOARD</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRefreshTrigger(p => p + 1)}
              disabled={loading}
              className="h-10 bg-[#160c06] hover:bg-[#251913] border border-[#ffb690]/15 text-[#ffb690] px-4 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={() => setAuthorized(false)}
              className="h-10 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 text-red-400 px-4 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#160c06] border border-[#ffb690]/15 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-lg flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] md:text-[10px] text-[#f6ded3]/40 uppercase tracking-wider block leading-tight">Pending Reviews</span>
              <span className="font-display text-xl md:text-2xl font-bold text-amber-400">{pendingCarts.length}</span>
            </div>
          </div>
          <div className="bg-[#160c06] border border-[#ffb690]/15 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] md:text-[10px] text-[#f6ded3]/40 uppercase tracking-wider block leading-tight">Live Directory</span>
              <span className="font-display text-xl md:text-2xl font-bold text-green-500">{liveCarts.length}</span>
            </div>
          </div>
          <div className="bg-[#160c06] border border-[#ffb690]/15 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 rounded-lg flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] md:text-[10px] text-[#f6ded3]/40 uppercase tracking-wider block leading-tight">Total Bookings</span>
              <span className="font-display text-xl md:text-2xl font-bold text-[#f97316]">{bookings.length}</span>
            </div>
          </div>
          <div className="bg-[#160c06] border border-[#ffb690]/15 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] md:text-[10px] text-[#f6ded3]/40 uppercase tracking-wider block leading-tight">Complaints / Queries</span>
              <span className="font-display text-xl md:text-2xl font-bold text-red-500">{openDisputes.length}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-[#ffb690]/10 pb-3 mb-8 hide-scrollbar">
          {[
            { id: "listed", label: "Listed Carts", count: carts.length, icon: ShoppingBag },
            { id: "live", label: "Live Carts", count: liveCarts.length, icon: CheckCircle },
            { id: "bookings", label: "Bookings Monitor", count: bookings.length, icon: CalendarDays },
            { id: "disputes", label: "Complaints/Queries", count: openDisputes.length, icon: AlertTriangle },
            { id: "vendors", label: "Cart Vendors", count: users.filter(u => u.role === "cv").length, icon: Users },
            { id: "messages", label: "WhatsApp Log", count: messages.length, icon: MessageSquare },
            { id: "users", label: "Users & Roles", count: users.length, icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`h-11 shrink-0 rounded-lg border px-5 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${isActive
                    ? "border-[#f97316] bg-[#f97316] text-[#0a0a08]"
                    : "border-[#ffb690]/15 bg-[#160c06] text-[#f6ded3] hover:border-[#ffb690]/30"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    isActive 
                      ? "admin-active-count bg-[#fffdf7] text-[#116D03] dark:bg-[#0a0a08] dark:text-white font-black" 
                      : "bg-[#f97316] text-[#0a0a08] dark:bg-[#f97316] dark:text-[#0a0a08] font-bold"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dashboard Panels */}
        <section className="bg-[#160c06] border border-[#ffb690]/15 rounded-2xl p-6 min-h-[400px]">
          {loading ? (
            <div className="py-24 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f97316] mx-auto mb-4"></div>
              <p className="text-sm text-[#f6ded3]/60">Querying platform database...</p>
            </div>
          ) : (
            <>
              {/* LISTED CARTS */}
              {activeTab === "listed" && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="font-display text-xl uppercase tracking-wider text-[#fffdf7]">Listed Carts ({carts.length} total)</h3>
                    <button
                      onClick={handleExportCarts}
                      className="h-9 bg-[#f97316] hover:bg-[#e2640e] text-[#0a0a08] font-bold uppercase tracking-wider text-xs px-4 rounded-lg flex items-center gap-2 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                  </div>

                  {/* Status filter chips */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { id: "all", label: `All (${carts.length})` },
                      { id: "pending_review", label: `⏳ Pending (${pendingCarts.length})` },
                      { id: "live", label: `✓ Live (${liveCarts.length})` },
                      { id: "inactive", label: `✗ Inactive (${carts.filter(c => c.status === "inactive").length})` },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setCartStatusFilter(f.id as any)}
                        className={`h-8 px-3 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition ${
                          cartStatusFilter === f.id
                            ? "border-[#f97316] bg-[#f97316] text-[#0a0a08]"
                            : "border-[#ffb690]/20 bg-[#0a0a08] text-[#f6ded3] hover:border-[#ffb690]/40"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {filteredListedCarts.length === 0 ? (
                    <div className="py-12 text-center text-[#f6ded3]/50 text-sm">No carts matching this filter.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredListedCarts.map(cart => {
                        const owner = users.find(u => u.id === cart.owner_id);
                        const photoUrl = Array.isArray(cart.photos) && cart.photos.length > 0 ? cart.photos[0] : null;
                        return (
                          <div key={cart.id} className="bg-[#0a0a08] border border-[#ffb690]/10 rounded-xl overflow-hidden">
                            {/* Image thumbnail */}
                            {photoUrl ? (
                              <div className="h-32 bg-[#160c06] overflow-hidden">
                                <img src={photoUrl} alt={cart.type} className="w-full h-full object-cover opacity-80" />
                              </div>
                            ) : (
                              <div className="h-20 bg-[#160c06] flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-[#ffb690]/20" />
                              </div>
                            )}

                            <div className="p-4 space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-base text-amber-400">{cart.type}</h4>
                                  <p className="text-xs text-[#f6ded3]/50 mt-0.5">
                                    {owner ? `${owner.name} · ${owner.phone}` : "Unknown Vendor"}
                                  </p>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                  cart.status === "live" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                  cart.status === "pending_review" ? "bg-amber-400/10 text-amber-400 border-amber-400/20" :
                                  "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}>
                                  {cart.status === "pending_review" ? "Pending Review" : cart.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5 text-xs border-y border-[#ffb690]/5 py-3">
                                <div><span className="text-[#f6ded3]/40">Size:</span> {cart.size || "—"}</div>
                                <div><span className="text-[#f6ded3]/40">Weight:</span> {cart.weight || "—"}</div>
                                <div><span className="text-[#f6ded3]/40">Stove:</span> {cart.stove_type || "None"}</div>
                                <div><span className="text-[#f6ded3]/40">Rent:</span> ₹{cart.price_per_month}/mo</div>
                                <div className="col-span-2"><span className="text-[#f6ded3]/40">Location:</span> {cart.latitude >= 11.08 ? "Tiruppur" : "Coimbatore"} ({Number(cart.latitude).toFixed(4)}, {Number(cart.longitude).toFixed(4)})</div>
                              </div>

                              {cart.description && (
                                <p className="text-xs text-[#f6ded3]/60 leading-relaxed line-clamp-2">{cart.description}</p>
                              )}

                              <div className="flex gap-2 pt-1 flex-wrap">
                                {cart.status !== "live" && (
                                  <button
                                    onClick={() => handleApproveCart(cart.id)}
                                    className="flex-1 h-9 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider text-[10px] rounded-lg flex items-center justify-center gap-1 transition"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                                  </button>
                                )}
                                {cart.status !== "inactive" && (
                                  <button
                                    onClick={() => handleRejectCart(cart.id)}
                                    className="h-9 bg-transparent hover:bg-red-500/10 border border-red-500/30 hover:border-red-500 text-red-400 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition"
                                  >
                                    {cart.status === "live" ? "Deactivate" : "Reject"}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenEditModal(cart)}
                                  className="h-9 bg-[#160c06] hover:bg-[#251913] border border-[#ffb690]/20 text-[#ffb690] px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1"
                                >
                                  <Pencil className="w-3 h-3" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDownloadSingleCartImage(cart)}
                                  className="h-9 bg-[#160c06] hover:bg-[#251913] border border-[#ffb690]/20 text-[#ffb690] px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1"
                                  title="Download cart photo"
                                >
                                  <Download className="w-3 h-3" /> Photo
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* LIVE CARTS */}
              {activeTab === "live" && (
                <div className="space-y-6">
                  <h3 className="font-display text-xl uppercase tracking-wider text-[#fffdf7]">Active Live Carts Directory</h3>
                  {liveCarts.length === 0 ? (
                    <div className="py-12 text-center text-[#f6ded3]/50 text-sm">No live carts available.</div>
                  ) : (
                    <div className="overflow-x-auto border border-[#ffb690]/10 rounded-xl bg-[#0a0a08]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#ffb690]/15 bg-[#160c06] uppercase tracking-wider text-[#ffb690] text-[10px] font-bold">
                            <th className="p-4">Type</th>
                            <th className="p-4">Condition</th>
                            <th className="p-4">Owner / Phone</th>
                            <th className="p-4">Monthly Price</th>
                            <th className="p-4">Location</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ffb690]/5">
                          {liveCarts.map(cart => {
                            const owner = users.find(u => u.id === cart.owner_id);
                            return (
                              <tr key={cart.id} className="hover:bg-[#ffb690]/5">
                                <td className="p-4">
                                  <div className="flex flex-wrap gap-1">
                                    {(Array.isArray(cart.type) ? cart.type : [cart.type]).map((t: string, i: number) => (
                                      <span key={i} className="bg-[#ffb690]/10 text-[#ffb690] border border-[#ffb690]/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide">{t}</span>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-4">{cart.condition}</td>
                                <td className="p-4">{owner ? owner.name : "Unknown"} <span className="block text-[10px] text-[#f6ded3]/50">{owner ? owner.phone : ""}</span></td>
                                <td className="p-4 font-bold text-[#ffca45]">₹{cart.price_per_month || "—"}</td>
                                <td className="p-4 text-[10px]">
                                  {cart.latitude >= 11.08 ? "Tiruppur" : "Coimbatore"}
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleDownloadSingleCartImage(cart)}
                                      className="bg-[#160c06] hover:bg-[#251913] border border-[#ffb690]/20 text-[#ffb690] px-3 py-1.5 rounded text-[10px] uppercase font-bold flex items-center gap-1"
                                      title="Download cart photo"
                                    >
                                      <Download className="w-3 h-3" strokeWidth={2.5} /> Photo
                                    </button>
                                    <button
                                      onClick={() => handleRejectCart(cart.id)}
                                      className="bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 text-red-400 px-3 py-1.5 rounded text-[10px] uppercase font-bold"
                                    >
                                      Deactivate
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* BOOKINGS MONITOR */}
              {activeTab === "bookings" && (
                <div className="space-y-6">
                  <h3 className="font-display text-xl uppercase tracking-wider text-[#fffdf7]">Real-Time Bookings monitor</h3>
                  {bookings.length === 0 ? (
                    <div className="py-12 text-center text-[#f6ded3]/50 text-sm">No bookings reported.</div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map(booking => {
                        const bv = users.find(u => u.id === booking.bv_id);
                        const cv = users.find(u => u.id === booking.cv_id);
                        const cart = carts.find(c => c.id === booking.cart_id);

                        // Calculate matching distance
                        const distance = cart
                          ? Number(calculateHaversineDistance(
                            { latitude: booking.bv_latitude, longitude: booking.bv_longitude },
                            { latitude: cart.latitude, longitude: cart.longitude }
                          ).toFixed(2))
                          : 0;

                        return (
                          <div key={booking.id} className="bg-[#0a0a08] border border-[#ffb690]/10 rounded-xl p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffb690] font-mono">{booking.booking_code || "NTV-Pending"}</span>
                                <h4 className="font-bold text-[#fffdf7] text-base">{cart ? cart.type : "Custom Cart Variant Enquiry"}</h4>
                              </div>
                              <div className="flex gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${booking.status === "confirmed"
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : booking.status === "sent"
                                      ? "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20"
                                      : "bg-red-500/10 text-red-500 border-red-500/20"
                                  }`}>
                                  {booking.status === "disputed" ? "complaint/query" : booking.status}
                                </span>
                                <span className="bg-[#160c06] text-[#ffca45] border border-[#ffca45]/20 px-2 py-0.5 rounded text-[9px] font-bold">
                                  Escalations: {booking.escalation_count}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border-y border-[#ffb690]/5 py-4">
                              <div>
                                <p className="text-[#f6ded3]/40 uppercase font-semibold text-[10px] mb-1">Business Vendor (Renter)</p>
                                <p className="font-bold text-[#fffdf7]">{bv ? bv.name : "Unknown Buyer"}</p>
                                <p>{bv ? bv.phone : ""}</p>
                                <p className="text-[10px] text-[#f6ded3]/50 font-mono mt-0.5">Loc: {getLocalFallbackLocationName(booking.bv_latitude, booking.bv_longitude)}</p>
                              </div>
                              <div>
                                <p className="text-[#f6ded3]/40 uppercase font-semibold text-[10px] mb-1">Assigned Cart Vendor (Owner)</p>
                                <p className="font-bold text-[#fffdf7]">{cv ? cv.name : "Not Assigned"}</p>
                                <p>{cv ? cv.phone : ""}</p>
                              </div>
                              <div>
                                <p className="text-[#f6ded3]/40 uppercase font-semibold text-[10px] mb-1">Matching & Routing Stats</p>
                                <p><span className="text-[#f6ded3]/40">Matching Distance:</span> {distance} km</p>
                                <p><span className="text-[#f6ded3]/40">Assigned At:</span> {new Date(booking.assigned_at).toLocaleString()}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                              <button
                                onClick={() => handleForceEscalate(booking.id)}
                                className="h-9 bg-amber-500 hover:bg-amber-600 text-[#0a0a08] font-bold uppercase tracking-wider text-[10px] px-4 rounded-lg flex items-center gap-1.5 transition"
                              >
                                <RefreshCw className="w-3.5 h-3.5" /> Force Next Nearest Escalate
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, "confirmed")}
                                className="h-9 bg-transparent hover:bg-green-500/10 border border-green-500/20 text-green-400 px-4 rounded-lg text-[10px] uppercase font-bold transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, "completed")}
                                className="h-9 bg-transparent hover:bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 rounded-lg text-[10px] uppercase font-bold transition"
                              >
                                Mark Completed
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, "disputed")}
                                className="h-9 bg-transparent hover:bg-red-500/10 border border-red-500/20 text-red-400 px-4 rounded-lg text-[10px] uppercase font-bold transition"
                              >
                                Complaint/Query
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* DISPUTES QUEUE */}
              {activeTab === "disputes" && (
                <div className="space-y-6">
                  <h3 className="font-display text-xl uppercase tracking-wider text-[#fffdf7]">Active Complaints/Queries & Flagged Bookings</h3>
                  {disputes.length === 0 ? (
                    <div className="py-12 text-center text-[#f6ded3]/50 text-sm">No complaints/queries reported. All running smoothly.</div>
                  ) : (
                    <div className="space-y-4">
                      {disputes.map(dispute => {
                        const reporter = users.find(u => u.id === dispute.reported_by);
                        const booking = bookings.find(b => b.id === dispute.booking_id);
                        return (
                          <div key={dispute.id} className="bg-[#0a0a08] border border-[#ffb690]/10 rounded-xl p-5 space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-bold text-[#fffdf7] text-sm">Booking Ref: {booking ? booking.booking_code : "Unknown Code"}</h4>
                                <p className="text-xs text-[#f6ded3]/50">Reported by: {reporter ? `${reporter.name} (${reporter.role.toUpperCase()})` : "Anonymous"}</p>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${dispute.status === "open" ? "bg-red-500/10 text-red-400 border-red-500/25" : "bg-green-500/10 text-green-400 border-green-500/25"
                                }`}>
                                {dispute.status}
                              </span>
                            </div>

                            <p className="text-xs text-[#f6ded3] bg-[#160c06] p-3 rounded border border-[#ffb690]/5 leading-relaxed">
                              {dispute.description}
                            </p>

                            {dispute.status === "open" && (
                              <button
                                onClick={() => handleResolveDispute(dispute.id)}
                                className="h-9 bg-green-600 hover:bg-green-700 text-[#0a0a08] font-bold uppercase tracking-wider text-[10px] px-4 rounded-lg flex items-center gap-1 transition"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* CART VENDORS DIRECTORY */}
              {activeTab === "vendors" && (
                <div className="space-y-6">
                  <h3 className="font-display text-xl uppercase tracking-wider text-[#fffdf7]">Cart Vendors (CV) Network</h3>
                  <div className="overflow-x-auto border border-[#ffb690]/10 rounded-xl bg-[#0a0a08]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#ffb690]/15 bg-[#160c06] uppercase tracking-wider text-[#ffb690] text-[10px] font-bold">
                          <th className="p-4">Vendor Name</th>
                          <th className="p-4">WhatsApp Phone</th>
                          <th className="p-4">Associated Carts</th>
                          <th className="p-4">Onboard Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ffb690]/5">
                        {users.filter(u => u.role === "cv").map(cv => {
                          const associatedCarts = carts.filter(c => c.owner_id === cv.id);
                          return (
                            <tr key={cv.id} className="hover:bg-[#ffb690]/5">
                              <td className="p-4 font-bold text-[#fffdf7]">{cv.name}</td>
                              <td className="p-4">{cv.phone}</td>
                              <td className="p-4 font-mono font-bold text-[#f97316]">{associatedCarts.length} carts listed</td>
                              <td className="p-4 text-[#f6ded3]/50">{cv.created_at ? new Date(cv.created_at).toLocaleDateString() : "Seed"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* WHATSAPP LOG VIEWER */}
              {activeTab === "messages" && (
                <div className="space-y-6">
                  <h3 className="font-display text-xl uppercase tracking-wider text-[#fffdf7]">WhatsApp logs</h3>
                  {messages.length === 0 ? (
                    <div className="py-12 text-center text-[#f6ded3]/50 text-sm">No WhatsApp logs generated yet.</div>
                  ) : (
                    <div className="overflow-x-auto border border-[#ffb690]/10 rounded-xl bg-[#0a0a08]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#ffb690]/15 bg-[#160c06] uppercase tracking-wider text-[#ffb690] text-[10px] font-bold">
                            <th className="p-4">Direction</th>
                            <th className="p-4">Recipient Phone</th>
                            <th className="p-4">Message Body</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ffb690]/5">
                          {messages.map(msg => (
                            <tr key={msg.id} className="hover:bg-[#ffb690]/5">
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${msg.direction === "outbound" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                                  }`}>
                                  {msg.direction}
                                </span>
                              </td>
                              <td className="p-4 font-mono">{msg.recipient_phone}</td>
                              <td className="p-4 max-w-sm truncate" title={msg.message_body}>{msg.message_body}</td>
                              <td className="p-4">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${msg.status === "delivered" ? "text-green-500" : "text-amber-500"
                                  }`}>
                                  {msg.status}
                                </span>
                              </td>
                              <td className="p-4 text-[#f6ded3]/50 font-mono text-[10px]">
                                {msg.created_at ? new Date(msg.created_at).toLocaleString() : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              {/* USERS & ROLES MODULE */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl uppercase tracking-wider text-[#fffdf7]">Users & Role Management</h3>
                    <span className="text-xs text-[#f6ded3]/50">{users.length} registered users</span>
                  </div>
                  {users.length === 0 ? (
                    <div className="py-12 text-center text-[#f6ded3]/50 text-sm">
                      No users found. Users appear here after they sign in via Google or Email Magic Link.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-[#ffb690]/10 rounded-xl bg-[#0a0a08]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#ffb690]/15 bg-[#160c06] uppercase tracking-wider text-[#ffb690] text-[10px] font-bold">
                            <th className="p-4">User</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Roles</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ffb690]/5">
                          {users.map((u: any) => (
                            <tr key={u.id} className="hover:bg-[#ffb690]/5">
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  {u.avatar ? (
                                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-[#f97316]/20 text-[#f97316] flex items-center justify-center text-[10px] font-bold">
                                      {(u.name ?? "U")[0].toUpperCase()}
                                    </div>
                                  )}
                                  <span className="font-semibold text-[#f6ded3]">{u.name ?? "Unknown"}</span>
                                </div>
                              </td>
                              <td className="p-4 text-[#f6ded3]/70 font-mono">{u.email}</td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {(u.roles ?? ["BUYER"]).map((r: string) => (
                                    <span key={r} className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                      r === "SUPER_ADMIN" ? "bg-red-900/40 text-red-300" :
                                      r === "ADMIN" ? "bg-purple-900/40 text-purple-300" :
                                      r === "VENDOR" ? "bg-amber-900/40 text-amber-300" :
                                      "bg-blue-900/40 text-blue-300"
                                    }`}>{r}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${u.status === "active" ? "text-green-400" : "text-red-400"}`}>
                                  {u.status ?? "active"}
                                </span>
                              </td>
                              <td className="p-4 text-[#f6ded3]/50 font-mono text-[10px]">
                                {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => showToast(`User ID: ${u.id.substring(0, 8)}... | Email: ${u.email || "N/A"} (Manage roles via Supabase Dashboard)`, "info")}
                                    className="px-2.5 py-1 rounded text-[9px] font-bold bg-[#ffb690]/10 text-[#ffb690] hover:bg-[#ffb690]/20 transition uppercase tracking-wider"
                                  >
                                    Manage
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Vendor Applications sub-section */}
                  <div className="mt-8">
                    <h4 className="font-display text-base uppercase tracking-wider text-[#ffb690] mb-4">Vendor Profiles</h4>
                    <p className="text-xs text-[#f6ded3]/50 bg-[#0a0a08] border border-[#ffb690]/10 rounded-xl px-4 py-3">
                      Vendor profiles are <span className="text-green-400 font-bold">auto-approved</span> when vendors register. No manual approval step is needed. Cart listings still require admin approval via the <span className="text-[#f97316] font-bold">Listed Carts</span> tab.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Edit Cart Modal */}
      {editModal.open && editModal.cart && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#160c06] border border-[#ffb690]/20 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#ffb690]/10">
              <h3 className="font-display text-lg uppercase tracking-wider text-[#fffdf7]">Edit Cart</h3>
              <button
                onClick={() => setEditModal({ open: false, cart: null })}
                className="w-8 h-8 rounded-lg bg-[#0a0a08] hover:bg-[#251913] text-[#f6ded3] flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#ffb690] mb-1 block">Cart Type</label>
                  <select
                    value={editForm.type}
                    onChange={e => setEditForm((f: any) => ({ ...f, type: e.target.value }))}
                    className="w-full h-10 bg-[#0a0a08] border border-[#ffb690]/20 rounded-lg px-3 text-sm text-[#f6ded3] outline-none focus:border-[#f97316]"
                  >
                    <option value="With Store">With Store / Stove Cart</option>
                    <option value="With Roof">With Roof / Covered</option>
                    <option value="Ice Cream">Ice Cream Cart</option>
                    <option value="Tea Stall">Tea Stall Station</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#ffb690] mb-1 block">Condition</label>
                  <select
                    value={editForm.condition}
                    onChange={e => setEditForm((f: any) => ({ ...f, condition: e.target.value }))}
                    className="w-full h-10 bg-[#0a0a08] border border-[#ffb690]/20 rounded-lg px-3 text-sm text-[#f6ded3] outline-none focus:border-[#f97316]"
                  >
                    <option value="New">Brand New</option>
                    <option value="Used - Very Good">Used - Very Good</option>
                    <option value="Used - Good">Used - Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "size", label: "Size", ph: "e.g. 6ft x 4ft" },
                  { key: "weight", label: "Weight", ph: "e.g. 100kg" },
                  { key: "stove_type", label: "Stove Type", ph: "e.g. None" },
                ].map(({ key, label, ph }) => (
                  <div key={key}>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#ffb690] mb-1 block">{label}</label>
                    <input
                      type="text"
                      value={editForm[key]}
                      onChange={e => setEditForm((f: any) => ({ ...f, [key]: e.target.value }))}
                      placeholder={ph}
                      className="w-full h-10 bg-[#0a0a08] border border-[#ffb690]/20 rounded-lg px-3 text-sm text-[#f6ded3] outline-none focus:border-[#f97316]"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#ffb690] mb-1 block">Monthly Price (₹)</label>
                <input
                  type="number"
                  value={editForm.price_per_month}
                  onChange={e => setEditForm((f: any) => ({ ...f, price_per_month: e.target.value }))}
                  className="w-full h-10 bg-[#0a0a08] border border-[#ffb690]/20 rounded-lg px-3 text-sm text-[#f6ded3] outline-none focus:border-[#f97316]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#ffb690] mb-1 block">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm((f: any) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-[#0a0a08] border border-[#ffb690]/20 rounded-lg px-3 py-2 text-sm text-[#f6ded3] outline-none focus:border-[#f97316] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-[#ffb690]/10">
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="flex-1 h-11 bg-[#f97316] hover:bg-[#e2640e] text-[#0a0a08] font-bold uppercase tracking-wider text-sm rounded-xl transition disabled:opacity-50"
              >
                {editSaving ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={() => setEditModal({ open: false, cart: null })}
                className="h-11 px-5 bg-[#0a0a08] hover:bg-[#251913] border border-[#ffb690]/20 text-[#f6ded3] font-bold text-sm rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Confirm Action Overlays (Modal) */}
      {confirmModal && confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#160c06] border border-[#ffb690]/25 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h4 className="font-display text-lg uppercase tracking-wider text-[#ffb690]">{confirmModal.title}</h4>
            <p className="text-xs text-[#f6ded3]/80 leading-relaxed font-sans">{confirmModal.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-[#ffb690]/15 text-[#f6ded3]/70 hover:text-[#fffdf7] rounded-lg text-xs font-bold uppercase tracking-wider transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-4 py-2 bg-[#f97316] hover:bg-[#e2640e] text-[#0a0a08] rounded-lg text-xs font-bold uppercase tracking-wider transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
