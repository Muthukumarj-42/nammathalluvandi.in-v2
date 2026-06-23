import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MoreHorizontal, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrowseCartsPage() {
  return (
    <main className="min-h-screen bg-white pb-20 md:pb-10">
      {/* Header */}
      <header className="sticky top-0 bg-white z-20 flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Browse Carts</h1>
        </div>
        <button className="text-gray-900">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </header>

      {/* Filter Chips */}
      <div className="bg-white px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar border-b border-gray-100">
        <button className="whitespace-nowrap px-4 py-1.5 bg-[#16a34a] text-white rounded-full text-[11px] font-bold">
          All (40)
        </button>
        <button className="whitespace-nowrap px-4 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-[11px] font-bold">
          With Stove
        </button>
        <button className="whitespace-nowrap px-4 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-[11px] font-bold">
          With Roof
        </button>
        <button className="whitespace-nowrap px-4 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-[11px] font-bold">
          Ice Cream
        </button>
      </div>

      {/* Subheader */}
      <div className="px-4 py-3 flex justify-between items-center bg-white">
        <h2 className="text-[11px] font-bold text-gray-700">40 carts near Coimbatore</h2>
        <button className="flex items-center gap-1 text-[11px] font-bold text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
          <Filter className="w-3 h-3" /> Filters
        </button>
      </div>

      {/* List */}
      <div className="px-4 flex flex-col gap-4 mt-2">
        {/* Item 1 */}
        <div className="flex gap-3 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm p-3">
          <div className="w-[100px] h-[100px] bg-gray-50 rounded-lg relative flex items-center justify-center shrink-0">
            {/* Mock Image */}
            <Image src="/brand/full-logo-with-background.webp" alt="Cart" fill className="object-cover opacity-20 rounded-lg" />
            <svg viewBox="0 0 100 80" className="w-16 h-16 text-gray-400 z-10" fill="currentColor">
              <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
            </svg>
          </div>
          <div className="flex flex-col flex-grow">
            <div className="flex gap-1 mb-1">
              <span className="text-[8px] font-bold bg-[#fef08a] text-[#854d0e] px-1.5 py-0.5 rounded">USED</span>
              <span className="text-[8px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">WITH STOVE</span>
            </div>
            <h3 className="font-bold text-xs text-gray-900 leading-tight mb-1">Standard MS Food Cart (3ft)</h3>
            <div className="flex items-center gap-1 text-[9px] text-gray-500 mb-2">
              <span className="text-red-500">★</span>
              <span className="font-bold text-gray-700">4.3</span>
              <span>(21 reviews)</span>
            </div>
            <div className="mt-auto flex justify-between items-end">
              <div>
                <span className="font-bold text-[#16a34a] block text-sm">₹12,000</span>
                <span className="text-[8px] text-gray-500">Ex-Showroom</span>
              </div>
              <Button asChild className="bg-[#dc2626] hover:bg-red-700 text-white rounded-lg h-7 px-4 text-[10px] font-bold">
                <Link href="/cart/1">Contact</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex gap-3 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm p-3">
          <div className="w-[100px] h-[100px] bg-gray-50 rounded-lg relative flex items-center justify-center shrink-0">
            {/* Mock Image */}
            <Image src="/brand/full-logo-with-background.webp" alt="Cart" fill className="object-cover opacity-20 rounded-lg" />
            <svg viewBox="0 0 100 80" className="w-16 h-16 text-gray-400 z-10" fill="currentColor">
              <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
            </svg>
          </div>
          <div className="flex flex-col flex-grow">
            <div className="flex gap-1 mb-1">
              <span className="text-[8px] font-bold bg-[#fef08a] text-[#854d0e] px-1.5 py-0.5 rounded">USED</span>
            </div>
            <h3 className="font-bold text-xs text-gray-900 leading-tight mb-1">Minimalist Tea Station</h3>
            <div className="flex items-center gap-1 text-[9px] text-gray-500 mb-2">
              <span className="text-gray-300">★</span>
              <span className="text-gray-400">No reviews</span>
            </div>
            <div className="mt-auto flex justify-between items-end">
              <div>
                <span className="font-bold text-[#16a34a] block text-sm">₹15,000</span>
              </div>
              <Button asChild className="bg-[#dc2626] hover:bg-red-700 text-white rounded-lg h-7 px-4 text-[10px] font-bold">
                <Link href="/cart/2">Contact</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
