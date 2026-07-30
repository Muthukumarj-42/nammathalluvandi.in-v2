import { supabase, isDbConfigured } from "./supabase";
import { getTnRtoCodeForLocation } from "./rto";
import { calculateHaversineDistance } from "./routing";

export interface User {
  id: string;
  role: "cv" | "bv" | "admin";
  name: string;
  phone: string;
  created_at?: string;
}

export interface DbCart {
  id: string;
  owner_id: string;
  vendor_id?: string | null;
  type: string;
  condition: string;
  size?: string;
  weight?: string;
  stove_type?: string;
  price_per_day: number;
  min_rental_period?: string | null;
  available_from?: string | null;
  equipment?: string[];
  photos: string[];
  description?: string;
  latitude: number;
  longitude: number;
  area?: string | null;
  district?: string | null;
  status: "pending_review" | "live" | "rented" | "inactive";
  verified: boolean;
  unique_code?: string | null;
  created_at?: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  cart_id: string | null;
  bv_id: string;
  cv_id: string;
  bv_latitude: number;
  bv_longitude: number;
  status: "sent" | "cv_responded_yes" | "cv_responded_no" | "confirmed" | "completed" | "disputed";
  assigned_at: string;
  escalation_count: number;
  created_at?: string;
}

export interface WhatsappMessage {
  id: string;
  booking_id: string | null;
  direction: "outbound" | "inbound";
  recipient_phone: string;
  message_body: string;
  status: "sent" | "delivered" | "failed";
  created_at?: string;
}

export interface Dispute {
  id: string;
  booking_id: string;
  reported_by: string;
  description: string;
  status: "open" | "resolved";
  created_at?: string;
}

// In-Memory Database Fallback (populated with seed coordinates and details for local demo)
let mockUsers: User[] = [
  { id: "a1111111-1111-1111-1111-111111111111", role: "admin", name: "Muthu Admin", phone: "918838292849" },
  { id: "c2222222-2222-2222-2222-222222222222", role: "cv", name: "Nagaraj Thalluvandi", phone: "919876543210" },
  { id: "c3333333-3333-3333-3333-333333333333", role: "cv", name: "Karthik Carts", phone: "919876543211" },
  { id: "c4444444-4444-4444-4444-444444444444", role: "cv", name: "Senthil Carts Tiruppur", phone: "919876543212" },
  { id: "b5555555-5555-5555-5555-555555555555", role: "bv", name: "Ramesh Snacks", phone: "919876543213" },
  { id: "b6666666-6666-6666-6666-666666666666", role: "bv", name: "Suresh Coffee", phone: "919876543214" },
];

let mockCarts: DbCart[] = [
  {
    id: "e0000000-0000-0000-0000-000000000001",
    unique_code: "ntv-tn66001",
    owner_id: "c2222222-2222-2222-2222-222222222222",
    type: "With Store",
    condition: "New",
    size: "6ft x 4ft",
    weight: "120kg",
    stove_type: "Double Burner High-Pressure Stove",
    price_per_day: 80,
    photos: ["/carts/premium-fast-food-cart-with-stove/photo-1.webp", "/carts/premium-fast-food-cart-with-stove/photo-2.webp"],
    description: "Elite fast food cart with double stove and stainless storage shelves. Great for tiffin center or Chinese fast food.",
    latitude: 11.0028, // Ondipudur, Coimbatore
    longitude: 77.0347,
    status: "live",
    verified: true,
  },
  {
    id: "e0000000-0000-0000-0000-000000000002",
    unique_code: "ntv-tn38001",
    owner_id: "c2222222-2222-2222-2222-222222222222",
    type: "With Roof",
    condition: "Used - Very Good",
    size: "5ft x 3.5ft",
    weight: "95kg",
    stove_type: "None",
    price_per_day: 60,
    photos: ["/carts/covered-premium-cart/photo-1.webp"],
    description: "Aluminium frame food cart with heavy-duty metal roof. Side flaps can close completely and be locked.",
    latitude: 11.0183, // Gandhipuram, Coimbatore
    longitude: 76.9693,
    status: "live",
    verified: true,
  },
  {
    id: "e0000000-0000-0000-0000-000000000003",
    unique_code: "ntv-tn38002",
    owner_id: "c3333333-3333-3333-3333-333333333333",
    type: "Ice Cream",
    condition: "New",
    size: "4ft x 3ft",
    weight: "80kg",
    stove_type: "None",
    price_per_day: 70,
    photos: ["/carts/mobile-snack-cart/photo-1.webp"],
    description: "Insulated cold container box built-in. Eye-catching yellow dome roof. Suitable for ice cream or kulfi business.",
    latitude: 11.0267, // Peelamedu, Coimbatore
    longitude: 77.0089,
    status: "live",
    verified: true,
  },
  {
    id: "e0000000-0000-0000-0000-000000000004",
    unique_code: "ntv-tn39001",
    owner_id: "c4444444-4444-4444-4444-444444444444",
    type: "Tea Stall",
    condition: "Used - Good",
    size: "6ft x 4.5ft",
    weight: "150kg",
    stove_type: "Single Burner Commercial Stove",
    price_per_day: 100,
    photos: ["/carts/juice-cart/photo-1.webp"],
    description: "Full stainless steel tea and coffee station. Comes with gas connection slot, wash basin, and wide front counter.",
    latitude: 11.1085, // Tiruppur Junction
    longitude: 77.3411,
    status: "live",
    verified: true,
  },
  {
    id: "e0000000-0000-0000-0000-000000000005",
    unique_code: "ntv-tn37001",
    owner_id: "c3333333-3333-3333-3333-333333333333",
    type: "With Store",
    condition: "Used - Good",
    size: "5ft x 3ft",
    weight: "110kg",
    stove_type: "Double Stove",
    price_per_day: 80,
    photos: ["/carts/tea-coffee-cart/photo-1.webp"],
    description: "Compact fast food cart with double burner stove and side glass panels. Needs a minor shelf repair.",
    latitude: 11.0006, // Singanallur, Coimbatore
    longitude: 77.0222,
    status: "pending_review",
    verified: false,
  },
];

let mockBookings: Booking[] = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    booking_code: "NTV-0001",
    cart_id: "e0000000-0000-0000-0000-000000000001",
    bv_id: "b5555555-5555-5555-5555-555555555555",
    cv_id: "c2222222-2222-2222-2222-222222222222",
    bv_latitude: 11.0030,
    bv_longitude: 77.0350,
    status: "confirmed",
    assigned_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    escalation_count: 0,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    booking_code: "NTV-0002",
    cart_id: "e0000000-0000-0000-0000-000000000002",
    bv_id: "b6666666-6666-6666-6666-666666666666",
    cv_id: "c2222222-2222-2222-2222-222222222222",
    bv_latitude: 11.0200,
    bv_longitude: 76.9700,
    status: "sent",
    assigned_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
    escalation_count: 0,
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

let mockMessages: WhatsappMessage[] = [
  {
    id: "w0000000-0000-0000-0000-000000000001",
    booking_id: "d0000000-0000-0000-0000-000000000002",
    direction: "outbound",
    recipient_phone: "919876543210",
    message_body: "Namma Thalluvandi V2: New Booking request NTV-0002. Price: ₹1800/month. Customer Ramesh needs it near Gandhipuram. Reply YES or NO.",
    status: "delivered",
    created_at: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
  },
];

let mockDisputes: Dispute[] = [
  {
    id: "f0000000-0000-0000-0000-000000000001",
    booking_id: "d0000000-0000-0000-0000-000000000001",
    reported_by: "b5555555-5555-5555-5555-555555555555",
    description: "Stove burner knob is missing. Renter requested a replacement or discount.",
    status: "open",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to auto-generate unique booking code in NTV-00XX format
let mockBookingSequence = 3;
function getNextMockBookingCode(): string {
  const code = `NTV-${String(mockBookingSequence).padStart(4, "0")}`;
  mockBookingSequence++;
  return code;
}

// --------------------------------------------------
// USER DATABASE FUNCTIONS
// --------------------------------------------------
export async function getUsers(): Promise<User[]> {
  if (isDbConfigured) {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(`
        id,
        name,
        email,
        created_at,
        user_roles (
          role_id,
          roles (
            name
          )
        ),
        vendor_profiles (
          phone
        )
      `);
    
    if (error) {
      console.error("Failed to fetch V2 users:", error);
      return [];
    }

    return (profiles || []).map((p: any) => {
      const roleNames = (p.user_roles || []).map((ur: any) => ur.roles?.name).filter(Boolean);
      let mappedRole: "cv" | "bv" | "admin" = "bv";
      if (roleNames.includes("ADMIN") || roleNames.includes("SUPER_ADMIN")) {
        mappedRole = "admin";
      } else if (roleNames.includes("VENDOR")) {
        mappedRole = "cv";
      }

      let phone = "";
      if (p.vendor_profiles) {
        if (Array.isArray(p.vendor_profiles)) {
          phone = p.vendor_profiles[0]?.phone || "";
        } else {
          phone = (p.vendor_profiles as any).phone || "";
        }
      }
      if (!phone) {
        phone = p.email || "";
      }

      return {
        id: p.id,
        role: mappedRole,
        name: p.name || p.email?.split("@")[0] || "User",
        phone: phone,
        created_at: p.created_at
      };
    });
  }
  return mockUsers;
}

export async function getUser(id: string): Promise<User | null> {
  if (isDbConfigured) {
    const { data: p, error } = await supabase
      .from("profiles")
      .select(`
        id,
        name,
        email,
        created_at,
        user_roles (
          role_id,
          roles (
            name
          )
        ),
        vendor_profiles (
          phone
        )
      `)
      .eq("id", id)
      .single();

    if (error || !p) return null;

    const roleNames = (p.user_roles || []).map((ur: any) => ur.roles?.name).filter(Boolean);
    let mappedRole: "cv" | "bv" | "admin" = "bv";
    if (roleNames.includes("ADMIN") || roleNames.includes("SUPER_ADMIN")) {
      mappedRole = "admin";
    } else if (roleNames.includes("VENDOR")) {
      mappedRole = "cv";
    }

    let phone = "";
    if (p.vendor_profiles) {
      if (Array.isArray(p.vendor_profiles)) {
        phone = p.vendor_profiles[0]?.phone || "";
      } else {
        phone = (p.vendor_profiles as any).phone || "";
      }
    }
    if (!phone) {
      phone = p.email || "";
    }

    return {
      id: p.id,
      role: mappedRole,
      name: p.name || p.email?.split("@")[0] || "User",
      phone: phone,
      created_at: p.created_at
    };
  }
  return mockUsers.find((u) => u.id === id) || null;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  if (isDbConfigured) {
    const { data: vProf, error } = await supabase
      .from("vendor_profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (error || !vProf) return null;
    return getUser(vProf.id);
  }
  return mockUsers.find((u) => u.phone === phone) || null;
}

export async function saveUser(user: Omit<User, "id"> & { id?: string }): Promise<User> {
  if (isDbConfigured) {
    const { data, error } = await supabase
      .from("users")
      .upsert([user])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const existingIndex = mockUsers.findIndex((u) => u.phone === user.phone || (user.id && u.id === user.id));
  if (existingIndex > -1) {
    const updated = { ...mockUsers[existingIndex], ...user };
    mockUsers[existingIndex] = updated;
    return updated;
  } else {
    const created = {
      id: user.id || `u-${Math.random().toString(36).substr(2, 9)}`,
      ...user,
      created_at: new Date().toISOString(),
    };
    mockUsers.push(created);
    return created;
  }
}

// --------------------------------------------------
// CARTS DATABASE FUNCTIONS
// --------------------------------------------------
export async function getLiveCarts(): Promise<DbCart[]> {
  if (isDbConfigured) {
    const { data } = await supabase.from("carts").select("*").eq("status", "live");
    return data || [];
  }
  return mockCarts.filter((c) => c.status === "live");
}

export async function getAllCarts(): Promise<DbCart[]> {
  if (isDbConfigured) {
    const { data } = await supabase.from("carts").select("*").order("created_at", { ascending: false });
    return data || [];
  }
  return mockCarts;
}

export async function getCartById(id: string): Promise<DbCart | null> {
  const cleanId = id.trim();
  if (isDbConfigured) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
    if (isUuid) {
      const { data } = await supabase.from("carts").select("*").eq("id", cleanId).maybeSingle();
      if (data) return data;
    }
    const { data: dataByCode } = await supabase.from("carts").select("*").ilike("unique_code", cleanId).maybeSingle();
    if (dataByCode) return dataByCode;

    const { data: dataById } = await supabase.from("carts").select("*").eq("id", cleanId).maybeSingle();
    return dataById || null;
  }
  const lower = cleanId.toLowerCase();
  return mockCarts.find((c) => c.id === cleanId || (c.unique_code && c.unique_code.toLowerCase() === lower)) || null;
}

export async function saveCart(cart: Omit<DbCart, "id" | "verified" | "status"> & { id?: string; status?: DbCart["status"]; verified?: boolean }): Promise<DbCart> {
  if (isDbConfigured) {
    if (!cart.unique_code) {
      const rto = getTnRtoCodeForLocation(cart.area, cart.district, (cart as any).location, (cart as any).vendorLocation);
      const { count } = await supabase.from("carts").select("id", { count: "exact", head: true }).ilike("unique_code", `ntv-${rto}%`);
      cart.unique_code = `ntv-${rto}${String((count || 0) + 1).padStart(3, "0")}`;
    }
    const { data, error } = await supabase
      .from("carts")
      .upsert([cart])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const existingIndex = mockCarts.findIndex((c) => cart.id && c.id === cart.id);
  if (existingIndex > -1) {
    const updated = { ...mockCarts[existingIndex], ...cart };
    mockCarts[existingIndex] = updated;
    return updated;
  } else {
    let uniqueCode = cart.unique_code;
    if (!uniqueCode) {
      const rto = getTnRtoCodeForLocation(cart.area, cart.district, (cart as any).location, (cart as any).vendorLocation);
      const count = mockCarts.filter((c) => c.unique_code && c.unique_code.toLowerCase().startsWith(`ntv-${rto}`)).length;
      uniqueCode = `ntv-${rto}${String(count + 1).padStart(3, "0")}`;
    }

    const created: DbCart = {
      id: cart.id || `e-${Math.random().toString(36).substr(2, 9)}`,
      verified: cart.verified || false,
      status: cart.status || "pending_review",
      unique_code: uniqueCode,
      ...cart,
      created_at: new Date().toISOString(),
    };
    mockCarts.push(created);
    return created;
  }
}

export async function updateCartStatus(id: string, status: DbCart["status"], verified?: boolean): Promise<DbCart | null> {
  if (isDbConfigured) {
    const payload: any = { status };
    if (verified !== undefined) payload.verified = verified;
    const { data, error } = await supabase
      .from("carts")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const cart = mockCarts.find((c) => c.id === id);
  if (cart) {
    cart.status = status;
    if (verified !== undefined) cart.verified = verified;
    return cart;
  }
  return null;
}

export async function updateCart(id: string, data: Partial<Pick<DbCart, "type" | "condition" | "size" | "weight" | "stove_type" | "price_per_day" | "min_rental_period" | "available_from" | "equipment" | "description" | "photos" | "latitude" | "longitude" | "area" | "district" | "vendor_id" | "verified">>): Promise<DbCart | null> {
  if (isDbConfigured) {
    const { data: updated, error } = await supabase
      .from("carts")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated;
  }

  const cart = mockCarts.find((c) => c.id === id);
  if (cart) {
    Object.assign(cart, data);
    return cart;
  }
  return null;
}

export async function getCartsByOwnerId(ownerId: string): Promise<DbCart[]> {
  if (isDbConfigured) {
    const { data } = await supabase
      .from("carts")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });
    return data || [];
  }
  return mockCarts.filter((c) => c.owner_id === ownerId);
}

// --------------------------------------------------
// BOOKINGS & ROUTING DATABASE FUNCTIONS
// --------------------------------------------------
export async function getBookings(): Promise<Booking[]> {
  if (isDbConfigured) {
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    return data || [];
  }
  return mockBookings;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (isDbConfigured) {
    const { data } = await supabase.from("bookings").select("*").eq("id", id).single();
    return data || null;
  }
  return mockBookings.find((b) => b.id === id) || null;
}

/**
 * Creates a new booking enquiry and runs distance-based routing matching.
 * The booking is assigned to the nearest Cart Vendor with a live cart.
 */
export async function createBooking(payload: {
  cart_id: string | null;
  bv_name: string;
  bv_phone: string;
  bv_latitude: number;
  bv_longitude: number;
}): Promise<Booking> {
  // 1. Ensure/Register User as Business Vendor
  const bvUser = await saveUser({
    role: "bv",
    name: payload.bv_name,
    phone: payload.bv_phone,
  });

  // 2. Routing Logic: Find the closest live Cart Vendor
  let assignedCvId = "";
  const allLiveCarts = await getLiveCarts();
  const allUsers = await getUsers();
  const cvVendors = allUsers.filter((u) => u.role === "cv");

  if (payload.cart_id) {
    // If a specific cart was requested, attempt to assign its owner first
    const specificCart = allLiveCarts.find((c) => c.id === payload.cart_id);
    if (specificCart) {
      assignedCvId = specificCart.owner_id;
    }
  }

  // Fallback or general match: rank all live vendors by distance
  if (!assignedCvId && allLiveCarts.length > 0) {
    const ranked = allLiveCarts
      .map((cart) => {
        const dist = calculateHaversineDistance(
          { latitude: payload.bv_latitude, longitude: payload.bv_longitude },
          { latitude: cart.latitude, longitude: cart.longitude }
        );
        return { owner_id: cart.owner_id, distance: dist };
      })
      .sort((a, b) => a.distance - b.distance);

    if (ranked.length > 0) {
      assignedCvId = ranked[0].owner_id;
    }
  }

  // If no vendors available, fall back to admin or default
  if (!assignedCvId) {
    assignedCvId = "c2222222-2222-2222-2222-222222222222"; // Seed vendor fallback
  }

  const bookingData = {
    cart_id: payload.cart_id,
    bv_id: bvUser.id,
    cv_id: assignedCvId,
    bv_latitude: payload.bv_latitude,
    bv_longitude: payload.bv_longitude,
    status: "sent" as const,
    assigned_at: new Date().toISOString(),
    escalation_count: 0,
  };

  if (isDbConfigured) {
    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()
      .single();
    if (error) throw new Error(error.message);
    
    // Log outbound WhatsApp message template trigger
    await logOutboundMessage(
      data.id,
      assignedCvId,
      `Hello! You have a new booking request ${data.booking_code}. Price: ${
        payload.cart_id ? "Rent matched." : "Enquiry"
      }. Reply YES to accept or NO to reject.`
    );

    return data;
  }

  const created: Booking = {
    id: `d-${Math.random().toString(36).substr(2, 9)}`,
    booking_code: getNextMockBookingCode(),
    ...bookingData,
    created_at: new Date().toISOString(),
  };
  mockBookings.push(created);

  await logOutboundMessage(
    created.id,
    assignedCvId,
    `Hello! You have a new booking request ${created.booking_code}. Reply YES to accept or NO to reject.`
  );

  return created;
}

export async function updateBookingStatus(
  id: string,
  status: Booking["status"],
  escalationCount?: number
): Promise<Booking | null> {
  const updatePayload: any = { status };
  if (escalationCount !== undefined) updatePayload.escalation_count = escalationCount;
  if (status === "cv_responded_no") {
    // Re-route on rejection triggers immediate next nearest assignment
    return escalateBooking(id);
  }

  if (isDbConfigured) {
    const { data, error } = await supabase
      .from("bookings")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const booking = mockBookings.find((b) => b.id === id);
  if (booking) {
    booking.status = status;
    if (escalationCount !== undefined) booking.escalation_count = escalationCount;
    return booking;
  }
  return null;
}

/**
 * Distance-based Escalation Logic (Part 3 of the main dev plan)
 * Re-assigns the booking to the next nearest Cart Vendor.
 * Triggered by: 30-minute escalation cron job or when a CV replies NO.
 */
export async function escalateBooking(bookingId: string): Promise<Booking | null> {
  const booking = await getBookingById(bookingId);
  if (!booking) return null;

  const allLiveCarts = await getLiveCarts();
  const allUsers = await getUsers();

  // Find all CV vendors
  const cvVendors = allUsers.filter((u) => u.role === "cv");

  // Calculate distance from BV to all available live carts
  // Filter out the currently assigned Cart Vendor (cv_id) to find the next nearest
  const ranked = allLiveCarts
    .filter((cart) => cart.owner_id !== booking.cv_id) // Exclude current vendor
    .map((cart) => {
      const dist = calculateHaversineDistance(
        { latitude: booking.bv_latitude, longitude: booking.bv_longitude },
        { latitude: cart.latitude, longitude: cart.longitude }
      );
      return { owner_id: cart.owner_id, distance: dist };
    })
    .sort((a, b) => a.distance - b.distance);

  let nextCvId = "";
  if (ranked.length > 0) {
    nextCvId = ranked[0].owner_id;
  }

  if (!nextCvId) {
    // List exhausted - mark booking status and notify admin manually
    console.warn(`[Escalation] No more nearby vendors found for booking ${booking.booking_code}. Notifying admin.`);
    if (isDbConfigured) {
      await supabase
        .from("bookings")
        .update({ status: "disputed" }) // or mark flag for admin attention
        .eq("id", bookingId);
    } else {
      booking.status = "disputed";
    }
    return booking;
  }

  // Escalate and assign to next closest vendor
  const newEscalationCount = booking.escalation_count + 1;
  const nextAssignedAt = new Date().toISOString();

  if (isDbConfigured) {
    const { data, error } = await supabase
      .from("bookings")
      .update({
        cv_id: nextCvId,
        escalation_count: newEscalationCount,
        assigned_at: nextAssignedAt,
        status: "sent",
      })
      .eq("id", bookingId)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await logOutboundMessage(
      bookingId,
      nextCvId,
      `[ESCALATION ${newEscalationCount}] New request ${booking.booking_code} near you. Reply YES or NO.`
    );
    return data;
  }

  booking.cv_id = nextCvId;
  booking.escalation_count = newEscalationCount;
  booking.assigned_at = nextAssignedAt;
  booking.status = "sent";

  await logOutboundMessage(
    bookingId,
    nextCvId,
    `[ESCALATION ${newEscalationCount}] New request ${booking.booking_code} near you. Reply YES or NO.`
  );

  return booking;
}

// --------------------------------------------------
// WHATSAPP MESSAGES LOGS FUNCTIONS
// --------------------------------------------------
export async function getWhatsappMessages(): Promise<WhatsappMessage[]> {
  if (isDbConfigured) {
    const { data } = await supabase.from("whatsapp_messages").select("*").order("created_at", { ascending: false });
    return (data || []).map((row: any) => ({
      id: row.id,
      booking_id: row.booking_id || null,
      direction: row.direction === "out" ? "outbound" : row.direction === "in" ? "inbound" : row.direction,
      recipient_phone: row.phone || row.recipient_phone || "",
      message_body: row.message_body || (row.payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body) || (row.payload?.body) || `Type: ${row.message_type}`,
      status: row.status === "delivered" ? "delivered" : row.status === "failed" ? "failed" : "sent",
      created_at: row.created_at,
    }));
  }
  return mockMessages;
}

export async function logOutboundMessage(bookingId: string | null, recipientUserId: string, body: string): Promise<void> {
  const recipient = await getUser(recipientUserId);
  const phone = recipient ? recipient.phone : "unknown";

  const dbMsg = {
    direction: "out",
    phone,
    message_type: "text",
    payload: { body, booking_id: bookingId },
    status: "sent",
  };

  if (isDbConfigured) {
    await supabase.from("whatsapp_messages").insert([dbMsg]);
    return;
  }

  mockMessages.push({
    id: `w-${Math.random().toString(36).substr(2, 9)}`,
    booking_id: bookingId,
    direction: "outbound",
    recipient_phone: phone,
    message_body: body,
    status: "sent",
    created_at: new Date().toISOString(),
  });
}

export async function logInboundMessage(bookingId: string | null, senderPhone: string, body: string): Promise<void> {
  const dbMsg = {
    direction: "in",
    phone: senderPhone,
    message_type: "text",
    payload: { body, booking_id: bookingId },
    status: "received",
  };

  if (isDbConfigured) {
    await supabase.from("whatsapp_messages").insert([dbMsg]);
    return;
  }

  mockMessages.push({
    id: `w-${Math.random().toString(36).substr(2, 9)}`,
    booking_id: bookingId,
    direction: "inbound",
    recipient_phone: senderPhone,
    message_body: body,
    status: "delivered",
    created_at: new Date().toISOString(),
  });
}

// --------------------------------------------------
// DISPUTES DATABASE FUNCTIONS
// --------------------------------------------------
export async function getDisputes(): Promise<Dispute[]> {
  if (isDbConfigured) {
    const { data } = await supabase.from("disputes").select("*").order("created_at", { ascending: false });
    return data || [];
  }
  return mockDisputes;
}

export async function createDispute(bookingId: string, reportedByUserId: string, description: string): Promise<Dispute> {
  const dispute = {
    booking_id: bookingId,
    reported_by: reportedByUserId,
    description,
    status: "open" as const,
  };

  if (isDbConfigured) {
    const { data, error } = await supabase
      .from("disputes")
      .insert([dispute])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const created: Dispute = {
    id: `f-${Math.random().toString(36).substr(2, 9)}`,
    ...dispute,
    created_at: new Date().toISOString(),
  };
  mockDisputes.push(created);
  return created;
}

export async function updateDisputeStatus(id: string, status: Dispute["status"]): Promise<Dispute | null> {
  if (isDbConfigured) {
    const { data, error } = await supabase
      .from("disputes")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const dispute = mockDisputes.find((d) => d.id === id);
  if (dispute) {
    dispute.status = status;
    return dispute;
  }
  return null;
}
