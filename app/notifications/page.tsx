"use client";

import { useState } from "react";
import { Bell, CheckCircle, Info } from "lucide-react";
import { getNotifications, markNotificationAsRead } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const [phone, setPhone] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setLoading(true);
    setError("");
    
    // Check if the input is the admin phone or explicitly 'admin'
    const isAdmin = phone === "8838292849" || phone.toLowerCase() === "admin";
    
    const { success, data, error: fetchError } = await getNotifications(phone, isAdmin);
    
    if (success && data) {
      setNotifications(data);
    } else {
      setError(fetchError || "Failed to fetch notifications");
    }
    
    setFetched(true);
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    const { success } = await markNotificationAsRead(id);
    if (success) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  return (
    <main className="bg-[#F8F6F2] min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8 border-b border-black/10 pb-4">
          <Bell size={32} className="text-primary" />
          <h1 className="font-display text-4xl uppercase text-ink">Notifications</h1>
        </div>

        {!fetched ? (
          <div className="bg-white p-8 rounded-2xl border border-black/10 shadow-sm max-w-md">
            <h2 className="text-lg font-bold mb-4 text-ink">View Your Notifications</h2>
            <p className="text-sm text-muted mb-6">Enter your registered phone number to view alerts related to your carts and bookings.</p>
            <form onSubmit={handleFetch} className="space-y-4">
              <input
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full h-12 border border-[#e5e0d8] focus:border-primary focus:ring-2 focus:ring-primary/40 rounded-xl px-4 text-base outline-none transition"
              />
              <Button 
                type="submit" 
                disabled={!phone || loading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-on-primary font-bold rounded-xl"
              >
                {loading ? "Loading..." : "Check Notifications"}
              </Button>
            </form>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-black/10">
              <p className="font-semibold text-ink">Logged in as: <span className="text-primary">{phone}</span></p>
              <Button variant="outline" onClick={() => setFetched(false)} className="text-xs h-8">Change Phone</Button>
            </div>

            {notifications.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-black/10">
                <Info size={48} className="mx-auto text-muted/50 mb-4" />
                <h3 className="text-xl font-bold text-ink mb-2">No notifications yet</h3>
                <p className="text-muted">You don't have any new alerts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map(n => (
                  <div key={n.id} className={`p-5 rounded-2xl border flex gap-4 items-start transition ${n.is_read ? 'bg-[#F8F6F2] border-black/5 opacity-70' : 'bg-white border-primary/30 shadow-sm'}`}>
                    <div className="shrink-0 mt-1">
                      {n.is_read ? (
                        <CheckCircle size={24} className="text-green-500/50" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-error/20 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-error"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-ink text-base leading-relaxed">{n.message}</p>
                      <p className="text-xs text-muted mt-2">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!n.is_read && (
                      <Button 
                        variant="ghost"
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-xs hover:bg-black/5 h-8 px-3"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
