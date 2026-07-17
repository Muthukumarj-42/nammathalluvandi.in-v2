"use server";

import { promises as fs } from "fs";
import path from "path";
import { isDbConfigured } from "@/lib/supabase";
import { createClient as createServerSupabase } from "@/lib/supabase-server";

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

export async function uploadImagesAction(formData: FormData) {
  try {
    const files = formData.getAll("images") as File[];
    if (!files || files.length === 0) {
      return { success: true, urls: [] };
    }

    const uploadedUrls: string[] = [];

    // Attempt to upload to Supabase Storage first if database is configured
    if (isDbConfigured) {
      try {
        const supabaseServer = await createServerSupabase();
        for (const file of files) {
          if (!file || !file.name || file.size === 0) continue;
          const bytes = await file.arrayBuffer();
          let fileBuffer = Buffer.from(bytes);
          let finalExt = (path.extname(file.name) || ".jpg").toLowerCase();
          let mimeType = file.type || "image/jpeg";

          // Skip HEIC conversion on serverless to avoid WASM boot crashes

          const filename = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${finalExt}`;
          
          const { data, error } = await supabaseServer.storage
            .from("carts")
            .upload(filename, fileBuffer, {
              contentType: mimeType,
              cacheControl: "3600",
              upsert: true
            });

          if (error) throw error;

          const { data: { publicUrl } } = supabaseServer.storage
            .from("carts")
            .getPublicUrl(filename);

          uploadedUrls.push(publicUrl);
        }

        return { success: true, urls: uploadedUrls };
      } catch (storageErr: any) {
        console.warn("Supabase storage upload failed, attempting local fallback:", storageErr.message);
        // Clear array to try local fallback
        uploadedUrls.length = 0;
      }
    }

    // Local filesystem fallback (works on localhost)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      if (!file || !file.name || file.size === 0) continue;
      const bytes = await file.arrayBuffer();
      let fileBuffer = Buffer.from(bytes);
      let finalExt = (path.extname(file.name) || ".jpg").toLowerCase();

      // Skip HEIC conversion on serverless to avoid WASM boot crashes

      const filename = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${finalExt}`;
      const filePath = path.join(uploadDir, filename);

      await fs.writeFile(filePath, fileBuffer);
      uploadedUrls.push(`/uploads/${filename}`);
    }

    return { success: true, urls: uploadedUrls };
  } catch (err: any) {
    console.error("Image upload server action failed:", err);
    return { success: false, error: err.message, urls: [] };
  }
}

export async function uploadVendorPhotoAction(formData: FormData) {
  try {
    const file = formData.get("photo") as File | null;
    if (!file || !file.name || file.size === 0) {
      return { success: true, url: null };
    }

    if (!isDbConfigured) {
      return { success: true, url: null };
    }

    const supabaseServer = await createServerSupabase();
    const bytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(bytes);
    const ext = (path.extname(file.name) || ".jpg").toLowerCase();
    const filename = `vendor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;

    const { error } = await supabaseServer.storage
      .from("vendor-profiles")
      .upload(filename, fileBuffer, {
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseServer.storage
      .from("vendor-profiles")
      .getPublicUrl(filename);

    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error("uploadVendorPhotoAction failed:", err);
    // Non-fatal — profile photo is optional, save the rest of the profile anyway.
    return { success: true, url: null, error: err.message };
  }
}

export async function getVendorProfilesAction() {
  try {
    if (!isDbConfigured) return { success: true, data: [] };
    const supabaseServer = await createServerSupabase();
    const { data, error } = await supabaseServer
      .from("vendor_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("getVendorProfilesAction failed:", err);
    return { success: false, error: err.message, data: [] };
  }
}

// Marks a vendor profile as blocked (reuses the existing "rejected" status
// value — no schema change needed). NOTE: this only flags the row; it does
// not currently stop the vendor from listing carts, since the isVendor
// check in context/auth-context.tsx no longer looks at vendor_profiles.status.
export async function blockVendorAction(id: string) {
  try {
    if (!isDbConfigured) return { success: false, error: "Database not configured" };
    const supabaseServer = await createServerSupabase();
    const { data, error } = await supabaseServer
      .from("vendor_profiles")
      .update({ status: "rejected" })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("blockVendorAction failed:", err);
    return { success: false, error: err.message };
  }
}

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
  minRentalPeriod?: string;
  availableFrom?: string;
  equipment?: string[];
  area?: string;
  district?: string;
  vendorId?: string;
  ownerId?: string; // When provided, skip phone-based user lookup
  photos?: string[];
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
      vendor_id: cartData.vendorId,
      type: cartData.type || cartData.nameEn || "With Store",
      condition: cartData.condition || "Used - Good",
      size: cartData.size || "5ft x 3.5ft",
      weight: cartData.weight || "100kg",
      stove_type: cartData.stoveType || "None",
      price_per_day: cartData.pricePerDay || 80,
      min_rental_period: cartData.minRentalPeriod,
      available_from: cartData.availableFrom,
      equipment: cartData.equipment,
      photos: cartData.photos && cartData.photos.length > 0 ? cartData.photos : ["/carts/covered-premium-cart/photo-1.webp"],
      description: cartData.descriptionEn || "Self-listed cart",
      latitude: lat,
      longitude: lng,
      area: cartData.area,
      district: cartData.district,
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
  price_per_day?: number;
  min_rental_period?: string;
  available_from?: string;
  equipment?: string[];
  description?: string;
  photos?: string[];
  latitude?: number;
  longitude?: number;
  area?: string;
  district?: string;
  vendor_id?: string;
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
