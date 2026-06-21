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
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting cart:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Server Action saveCart failed:", err);
    return { success: false, error: err.message };
  }
}
