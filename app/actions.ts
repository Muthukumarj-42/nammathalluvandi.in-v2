"use server";

import { supabase, isDbConfigured } from "@/lib/supabase";

export async function saveBooking(booking: {
  cartId: string | null;
  name: string;
  phone: string;
  date: string;
  location: string;
  duration: string;
  details?: string;
}) {
  if (!isDbConfigured) {
    console.warn("Database is not configured. Bypassing saveBooking.");
    return { success: true, bypassed: true };
  }
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          cart_id: booking.cartId,
          name: booking.name,
          phone: booking.phone,
          date: booking.date,
          location: booking.location,
          duration: booking.duration,
          details: booking.details || "",
          status: "pending",
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting booking:", error);
      return { success: false, error: error.message };
    }

    // Fetch vendor details from the cart
    let vendorPhone = "";
    let cartName = "";
    if (booking.cartId) {
      const { data: cartData } = await supabase
        .from("carts")
        .select("vendor_phone, name_en")
        .eq("id", booking.cartId)
        .single();
        
      if (cartData) {
        vendorPhone = cartData.vendor_phone || "";
        cartName = cartData.name_en || booking.cartId;
      } else {
        cartName = booking.cartId;
      }
    }

    // Insert admin notification
    await supabase.from("notifications").insert([{
      recipient_type: "admin",
      recipient_phone: "admin",
      message: `Buyer ${booking.name} (${booking.phone}) confirmed an order for cart ${cartName}${vendorPhone ? ` of vendor ${vendorPhone}` : ""}.`
    }]);

    // Insert vendor notification
    if (vendorPhone) {
      await supabase.from("notifications").insert([{
        recipient_type: "vendor",
        recipient_phone: vendorPhone,
        message: `A booking is confirmed for your cart ${cartName}.`
      }]);
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Server Action saveBooking failed:", err);
    return { success: false, error: err.message };
  }
}

export async function saveContactMessage(message: {
  name: string;
  phone: string;
  message: string;
}) {
  if (!isDbConfigured) {
    console.warn("Database is not configured. Bypassing saveContactMessage.");
    return { success: true, bypassed: true };
  }
  try {
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name: message.name,
          phone: message.phone,
          message: message.message,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting contact message:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Server Action saveContactMessage failed:", err);
    return { success: false, error: err.message };
  }
}

export async function saveCart(cartData: any) {
  if (!isDbConfigured) {
    console.warn("Database is not configured. Bypassing saveCart.");
    return { success: true, bypassed: true };
  }
  try {
    const { data, error } = await supabase
      .from("carts")
      .insert([
        {
          name_en: cartData.nameEn,
          name_ta: cartData.nameTa,
          type: cartData.type,
          price_per_day: cartData.pricePerDay,
          deposit_amount: cartData.depositAmount,
          available_count: cartData.availableCount,
          description_en: cartData.descriptionEn,
          description_ta: cartData.descriptionTa,
          images: cartData.images || [],
          status: "pending", // require admin review before showing on explore
          vendor_name: cartData.vendorName,
          vendor_phone: cartData.vendorPhone,
          vendor_location: cartData.vendorLocation,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting cart:", error);
      return { success: false, error: error.message };
    }

    // Insert admin notification
    if (cartData.vendorName) {
      await supabase.from("notifications").insert([{
        recipient_type: "admin",
        recipient_phone: "admin",
        message: `New cart (${cartData.nameEn}) added by vendor ${cartData.vendorName} (${cartData.vendorPhone}).`
      }]);
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Server Action saveCart failed:", err);
    return { success: false, error: err.message };
  }
}

export async function getNotifications(phone: string, isAdmin: boolean) {
  if (!isDbConfigured) {
    return { success: false, error: "Database not configured", data: [] };
  }
  try {
    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (isAdmin) {
      query = query.eq("recipient_type", "admin");
    } else {
      query = query.eq("recipient_type", "vendor").eq("recipient_phone", phone);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching notifications:", error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Server Action getNotifications failed:", err);
    return { success: false, error: err.message, data: [] };
  }
}

export async function markNotificationAsRead(id: string) {
  if (!isDbConfigured) return { success: false };
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .select();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
