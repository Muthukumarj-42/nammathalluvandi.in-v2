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
  LogOut
} from "lucide-react";
import {
  getAllCartsAction,
  getBookingsAction,
  getWhatsappMessagesAction,
  getDisputesAction,
  getUsersAction,
  updateCartStatusAction,
  updateBookingStatusAction,
  escalateBookingAction,
  updateDisputeStatusAction
} from "@/app/actions";
import { calculateHaversineDistance } from "@/lib/routing";

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
  const [activeTab, setActiveTab] = useState<"pending" | "live" | "bookings" | "disputes" | "vendors" | "messages">("pending");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Authenticate Muthu
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple passcode authorization tied to Muthu's mock phone number or secret key
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

  // Operations
  const handleApproveCart = async (id: string) => {
    const confirm = window.confirm("Approve this cart and make it live in the directory?");
    if (!confirm) return;
    const res = await updateCartStatusAction(id, "live", true);
    if (res.success) {
      alert("Cart approved & set to LIVE!");
      setRefreshTrigger(p => p + 1);
    } else {
      alert("Operation failed: " + res.error);
    }
  };

  const handleRejectCart = async (id: string) => {
    const confirm = window.confirm("Deactivate/Reject this listing?");
    if (!confirm) return;
    const res = await updateCartStatusAction(id, "inactive", false);
    if (res.success) {
      alert("Cart deactivated!");
      setRefreshTrigger(p => p + 1);
    } else {
      alert("Operation failed: " + res.error);
    }
  };

  const handleForceEscalate = async (id: string) => {
    const confirm = window.confirm("Manually escalate this booking to the next nearest Cart Vendor?");
    if (!confirm) return;
    const res = await escalateBookingAction(id);
    if (res.success) {
      alert("Booking escalated successfully!");
      setRefreshTrigger(p => p + 1);
    } else {
      alert("Escalation failed: " + res.error);
    }
  };

  const handleResolveDispute = async (id: string) => {
    const confirm = window.confirm("Mark this complaint/query as resolved?");
    if (!confirm) return;
    const res = await updateDisputeStatusAction(id, "resolved");
    if (res.success) {
      alert("Complaint/Query marked as resolved.");
      setRefreshTrigger(p => p + 1);
    } else {
      alert("Operation failed: " + res.error);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: any) => {
    const res = await updateBookingStatusAction(id, status);
    if (res.success) {
      alert(`Booking status updated to ${status}`);
      setRefreshTrigger(p => p + 1);
    } else {
      alert("Operation failed: " + res.error);
    }
  };

  // Helper stats
  const pendingCarts = carts.filter(c => c.status === "pending_review");
  const liveCarts = carts.filter(c => c.status === "live");
  const openDisputes = disputes.filter(d => d.status === "open");

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
            <p className="text-xs text-[#f6ded3]/60 uppercase tracking-widest">Namma Thalluvandi V2 Management</p>
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
                placeholder="••••••••••••"
                className="w-full h-12 bg-[#0a0a08] border border-[#ffb690]/25 rounded-xl px-4 text-center text-lg outline-none focus:border-[#f97316] text-[#116D03] placeholder:text-[#116D03] tracking-widest"
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
            <h1 className="font-display text-4xl text-[#116D03] uppercase tracking-wider mt-1">ADMINISTRATOR DASHBOARD</h1>
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
          <div className="bg-[#160c06] border border-[#ffb690]/15 p-5 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-lg flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-[#f6ded3]/40 uppercase tracking-widest block">Pending Reviews</span>
              <span className="font-display text-2xl font-bold text-amber-400">{pendingCarts.length}</span>
            </div>
          </div>
          <div className="bg-[#160c06] border border-[#ffb690]/15 p-5 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-[#f6ded3]/40 uppercase tracking-widest block">Live Directory</span>
              <span className="font-display text-2xl font-bold text-green-500">{liveCarts.length}</span>
            </div>
          </div>
          <div className="bg-[#160c06] border border-[#ffb690]/15 p-5 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 rounded-lg flex items-center justify-center shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-[#f6ded3]/40 uppercase tracking-widest block">Total Bookings</span>
              <span className="font-display text-2xl font-bold text-[#f97316]">{bookings.length}</span>
            </div>
          </div>
          <div className="bg-[#160c06] border border-[#ffb690]/15 p-5 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-[#f6ded3]/40 uppercase tracking-widest block">Complaints/Queries</span>
              <span className="font-display text-2xl font-bold text-red-500">{openDisputes.length}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-[#ffb690]/10 pb-3 mb-8 hide-scrollbar">
          {[
            { id: "pending", label: "Pending Approvals", count: pendingCarts.length, icon: AlertTriangle },
            { id: "live", label: "Live Carts", count: liveCarts.length, icon: ShoppingBag },
            { id: "bookings", label: "Bookings Monitor", count: bookings.length, icon: CalendarDays },
            { id: "disputes", label: "Complaints/Queries", count: openDisputes.length, icon: AlertTriangle },
            { id: "vendors", label: "Cart Vendors", count: users.filter(u => u.role === "cv").length, icon: Users },
            { id: "messages", label: "WhatsApp Log", count: messages.length, icon: MessageSquare }
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
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isActive ? "bg-[#0a0a08] text-white" : "bg-[#f97316] text-[#0a0a08]"}`}>
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
              {/* PENDING APPROVALS */}
              {activeTab === "pending" && (
                <div className="space-y-6">
                  <h3 className="font-display text-xl uppercase tracking-wider text-[#fffdf7]">Listed Carts Pending Approval</h3>
                  {pendingCarts.length === 0 ? (
                    <div className="py-12 text-center text-[#f6ded3]/50 text-sm">No listed carts pending review.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingCarts.map(cart => {
                        const owner = users.find(u => u.id === cart.owner_id);
                        return (
                          <div key={cart.id} className="bg-[#0a0a08] border border-[#ffb690]/10 rounded-xl p-5 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-lg text-amber-400">{cart.type}</h4>
                                <p className="text-xs text-[#f6ded3]/50">Listed by: {owner ? owner.name : "Unknown Vendor"} ({owner ? owner.phone : ""})</p>
                              </div>
                              <span className="bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                {cart.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs border-y border-[#ffb690]/5 py-3">
                              <div><span className="text-[#f6ded3]/40">Size:</span> {cart.size || "Standard"}</div>
                              <div><span className="text-[#f6ded3]/40">Weight:</span> {cart.weight || "Standard"}</div>
                              <div><span className="text-[#f6ded3]/40">Stove:</span> {cart.stove_type || "None"}</div>
                              <div><span className="text-[#f6ded3]/40">Expected Rent:</span> ₹{cart.price_per_month}/month</div>
                              <div className="col-span-2 mt-1">
                                <span className="text-[#f6ded3]/40">GPS Coordinates:</span> Lat {cart.latitude}, Lng {cart.longitude}
                              </div>
                            </div>

                            {cart.description && (
                              <p className="text-xs text-[#f6ded3]/75 leading-relaxed">{cart.description}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={() => handleApproveCart(cart.id)}
                                className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-[#0a0a08] font-bold uppercase tracking-wider text-xs rounded-lg flex items-center justify-center gap-1 transition"
                              >
                                <CheckCircle className="w-4 h-4" /> Approve & Go Live
                              </button>
                              <button
                                onClick={() => handleRejectCart(cart.id)}
                                className="h-10 bg-transparent hover:bg-red-500/10 border border-red-500/30 hover:border-red-500 text-red-400 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition"
                              >
                                Reject
                              </button>
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
                            <th className="p-4">GPS Coordinates</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ffb690]/5">
                          {liveCarts.map(cart => {
                            const owner = users.find(u => u.id === cart.owner_id);
                            return (
                              <tr key={cart.id} className="hover:bg-[#ffb690]/5">
                                <td className="p-4 font-bold text-[#fffdf7]">{cart.type}</td>
                                <td className="p-4">{cart.condition}</td>
                                <td className="p-4">{owner ? owner.name : "Unknown"} <span className="block text-[10px] text-[#f6ded3]/50">{owner ? owner.phone : ""}</span></td>
                                <td className="p-4 font-bold text-[#ffca45]">₹{cart.price_per_month}</td>
                                <td className="p-4 text-[10px] font-mono">{cart.latitude}, {cart.longitude}</td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => handleRejectCart(cart.id)}
                                    className="bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 text-red-400 px-3 py-1.5 rounded text-[10px] uppercase font-bold"
                                  >
                                    Deactivate
                                  </button>
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
                                <p className="text-[10px] text-[#f6ded3]/50 font-mono mt-0.5">Loc: {booking.bv_latitude}, {booking.bv_longitude}</p>
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
            </>
          )}
        </section>
      </div>
    </main>
  );
}
