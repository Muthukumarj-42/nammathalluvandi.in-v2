import { notFound } from "next/navigation";
import { getCart } from "@/lib/carts";
import CartDetailClient from "@/app/cart/[id]/CartDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const cart = await getCart(resolvedParams.id);

  if (!cart) {
    notFound();
  }

  return <CartDetailClient cart={cart} />;
}
