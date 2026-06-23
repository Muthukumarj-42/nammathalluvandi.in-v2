import { redirect } from "next/navigation";

export default function SellPage() {
  // Legacy route redirecting to the fully featured and interactive publish form
  redirect("/publish");
}
