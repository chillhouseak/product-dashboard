import { Suspense } from "react";
import ProductsDashboard from "./ProductsDashboard";

function ProductsLoading() {
  return (
    <main className="min-h-screen bg-[#08090d] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />

        <p className="font-display text-lg text-white">
          Loading NEXORA...
        </p>

        <p className="mt-1 text-sm text-white/40">
          Preparing your product intelligence dashboard
        </p>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsDashboard />
    </Suspense>
  );
}