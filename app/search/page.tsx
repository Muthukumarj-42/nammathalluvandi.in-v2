import Link from "next/link";
import { ArrowLeft, ArrowUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchCatalog() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm border-b border-gray-100 flex items-center gap-3">
        <Link href="/">
          <ArrowLeft className="text-gray-900" size={24} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Search Carts</h1>
      </div>

      {/* Filters (Horizontal Scroll) */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 overflow-x-auto hide-scrollbar flex gap-2">
        <button className="px-4 py-1.5 rounded-full border border-gray-900 bg-gray-900 text-white text-sm font-semibold whitespace-nowrap">
          All (48)
        </button>
        <button className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 text-sm font-semibold whitespace-nowrap">
          With Stove
        </button>
        <button className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 text-sm font-semibold whitespace-nowrap">
          With Roof
        </button>
        <button className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 text-sm font-semibold whitespace-nowrap">
          Ice Cream
        </button>
      </div>

      <div className="px-4 pt-4 pb-2 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 text-sm">48 Carts near Coimbatore</h2>
        <button className="flex items-center gap-1 border border-gray-300 rounded-md px-2 py-1 text-xs font-semibold text-gray-700 bg-white">
          <ArrowUpDown size={14} /> Price
        </button>
      </div>

      {/* Cart List */}
      <div className="px-4 flex flex-col gap-4 mt-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex">
            {/* Image Box */}
            <div className="w-1/3 bg-gray-200 relative flex items-center justify-center text-gray-400">
              <span className="text-xs font-bold">Image</span>
            </div>
            
            {/* Details */}
            <div className="w-2/3 p-3 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">USED</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-50 text-green-700 rounded">V. GOOD</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">Standard MS Food Cart (3ft)</h3>
                <p className="text-xs text-gray-500 mt-1">Ondipudur, Coimbatore</p>
              </div>
              
              <div className="flex justify-between items-end mt-2">
                <span className="font-bold text-green-700 text-sm">₹ 12,000</span>
                <Button asChild className="h-7 text-xs px-3">
                  <Link href="/book?cart=standard-ms-cart">Contact</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
