"use server";

import { 
  createBooking, 
  saveCart as dbSaveCart, 
  saveUser, 
  updateCartStatus as dbUpdateCartStatus, 
  updateCart as dbUpdateCart,
  updateBookingStatus as dbUpdateBookingStatus,
  escalateBooking as dbEscalateBooking,
  createDispute as dbCreateDispute,
  updateDisputeStatus as dbUpdateDisputeStatus,
  getUserByPhone,
  getLiveCarts,
  getAllCarts,
  getCartById,
  getCartsByOwnerId,
  getBookings,
  getWhatsappMessages,
  getDisputes,
  getUsers,
  DbCart,
  Booking,
  Dispute
} from "@/lib/db";

export async function saveBooking(booking: {
  cartId: string | null;
  name: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  // Kept for backward compatibility
  date?: string;
  location?: string;
  duration?: string;
  details?: string;
}) {
  try {
    // Default coordinates in Coimbatore if not provided (11.0168, 76.9558)
    const lat = booking.latitude || 11.0168;
    const lng = booking.longitude || 76.9558;

    const data = await createBooking({
      cart_id: booking.cartId,
      bv_name: booking.name,
      bv_phone: booking.phone,
      bv_latitude: lat,
      bv_longitude: lng,
    });

    return { success: true, data };
  } catch (err: any) {
    console.error("saveBooking action failed:", err);
    return { success: false, error: err.message };
  }
}

export async function saveContactMessage(message: {
  name: string;
  phone: string;
  message: string;
}) {
  return { success: true, bypassed: true };
}

export async function saveCart(cartData: {
  nameEn: string;
  nameTa: string;
  type: string;
  pricePerDay: number;
  depositAmount: number;
  availableCount: number;
  descriptionEn: string;
  descriptionTa: string;
  vendorName: string;
  vendorPhone: string;
  vendorLocation: string;
  latitude?: number;
  longitude?: number;
  condition?: string;
  size?: string;
  weight?: string;
  stoveType?: string;
  ownerId?: string; // When provided, skip phone-based user lookup
}) {
  try {
    let ownerId = cartData.ownerId;

    if (!ownerId) {
      // Legacy flow: look up by phone
      let cvUser = await getUserByPhone(cartData.vendorPhone);
      if (!cvUser) {
        cvUser = await saveUser({
          role: "cv",
          name: cartData.vendorName,
          phone: cartData.vendorPhone,
        });
      }
      ownerId = cvUser.id;
    }

    const lat = cartData.latitude || 11.0267;
    const lng = cartData.longitude || 77.0089;

    const data = await dbSaveCart({
      owner_id: ownerId,
      type: cartData.type || cartData.nameEn || "With Store",
      condition: cartData.condition || "Used - Good",
      size: cartData.size || "5ft x 3.5ft",
      weight: cartData.weight || "100kg",
      stove_type: cartData.stoveType || "None",
      price_per_month: cartData.pricePerDay || 2000,
      photos: ["/carts/covered-premium-cart/photo-1.webp"],
      description: cartData.descriptionEn || "Self-listed cart",
      latitude: lat,
      longitude: lng,
      status: "pending_review",
      verified: false,
    });

    return { success: true, data };
  } catch (err: any) {
    console.error("saveCart action failed:", err);
    return { success: false, error: err.message };
  }
}


export async function updateCartStatusAction(id: string, status: DbCart["status"], verified?: boolean) {
  try {
    const data = await dbUpdateCartStatus(id, status, verified);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateBookingStatusAction(id: string, status: Booking["status"]) {
  try {
    const data = await dbUpdateBookingStatus(id, status);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function escalateBookingAction(bookingId: string) {
  try {
    const data = await dbEscalateBooking(bookingId);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createDisputeAction(bookingId: string, reportedByUserId: string, description: string) {
  try {
    const data = await dbCreateDispute(bookingId, reportedByUserId, description);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateDisputeStatusAction(id: string, status: Dispute["status"]) {
  try {
    const data = await dbUpdateDisputeStatus(id, status);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getLiveCartsAction() {
  try {
    const data = await getLiveCarts();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getAllCartsAction() {
  try {
    const data = await getAllCarts();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getCartByIdAction(id: string) {
  try {
    const data = await getCartById(id);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, data: null };
  }
}

export async function updateCartAction(id: string, data: {
  type?: string;
  condition?: string;
  size?: string;
  weight?: string;
  stove_type?: string;
  price_per_month?: number;
  description?: string;
  photos?: string[];
  latitude?: number;
  longitude?: number;
}) {
  try {
    const updated = await dbUpdateCart(id, data);
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getVendorCartsAction(ownerId: string) {
  try {
    const data = await getCartsByOwnerId(ownerId);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getBookingsAction() {
  try {
    const data = await getBookings();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getWhatsappMessagesAction() {
  try {
    const data = await getWhatsappMessages();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getDisputesAction() {
  try {
    const data = await getDisputes();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getUsersAction() {
  try {
    const data = await getUsers();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getNotifications(phone: string, isAdmin: boolean) {
  return { success: true, data: [] as any[], error: undefined as string | undefined };
}

export async function markNotificationAsRead(id: string) {
  return { success: true };
}
export async function getCart(id: string) {
  return getCartById(id);
}
export async function getCarts() {
  return getLiveCarts();
}
