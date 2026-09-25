"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  LogOut,
  Star,
  DollarSign,
  Boxes,
  RefreshCw,
} from "lucide-react";

import { getProducts } from "@/services/productService";
import { removeAuthToken, getAuthToken } from "@/lib/auth";
import type { Product } from "@/types/product";

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    loadProducts();
  }, [router]);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts(10, 0);

      setProducts(data.products);
    } catch (err) {
      console.error(err);
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    removeAuthToken();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen dashboard-grid relative overflow-hidden">
      {/* Background glow */}
      <div className="glow-purple fixed -top-40 -left-40" />
      <div className="glow-cyan fixed -bottom-40 -right-40" />

      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 shadow-lg shadow-purple-500/20">
              <Package size={21} />
            </div>

            <div>
              <h1 className="font-display text-xl font-bold">
                <span className="gradient-text">NEXORA</span>
              </h1>

              <p className="text-xs text-white/40">
                Product Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="mb-2 text-sm font-medium text-cyan-400">
            CONTROL CENTER
          </p>

          <h2 className="font-display text-4xl font-bold tracking-tight">
            Product{" "}
            <span className="gradient-text">Dashboard</span>
          </h2>

          <p className="mt-2 text-white/50">
            Manage, monitor and analyze your product catalog.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Products Loaded"
            value={products.length}
            icon={<Package size={20} />}
          />

          <StatCard
            title="Average Rating"
            value={
              products.length
                ? (
                    products.reduce((sum, product) => sum + product.rating, 0) /
                    products.length
                  ).toFixed(1)
                : "0"
            }
            icon={<Star size={20} />}
          />

          <StatCard
            title="Average Price"
            value={
              products.length
                ? `$${(
                    products.reduce(
                      (sum, product) => sum + product.price,
                      0
                    ) / products.length
                  ).toFixed(2)}`
                : "$0"
            }
            icon={<DollarSign size={20} />}
          />

          <StatCard
            title="Total Stock"
            value={products.reduce(
              (sum, product) => sum + product.stock,
              0
            )}
            icon={<Boxes size={20} />}
          />
        </div>

        {/* Search bar - visual for now */}
        <div className="glass mb-6 rounded-2xl p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />

              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-purple-500/50 focus:bg-white/10"
              />
            </div>

            <button
              onClick={loadProducts}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-3 text-sm font-semibold transition hover:scale-[1.02]"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <span>{error}</span>

            <button
              onClick={loadProducts}
              className="rounded-lg bg-red-500/20 px-3 py-2 hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl border border-white/5 bg-white/5"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Package
              size={40}
              className="mx-auto mb-4 text-white/30"
            />

            <h3 className="font-display text-lg font-semibold">
              No products found
            </h3>

            <p className="mt-2 text-sm text-white/40">
              Your product catalog is currently empty.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="glass hidden overflow-hidden rounded-2xl md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10 bg-white/[0.03]">
                    <tr className="text-left text-xs uppercase tracking-wider text-white/40">
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4">Stock</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-white/5 transition hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="h-12 w-12 rounded-xl object-cover"
                            />

                            <div>
                              <p className="font-medium">
                                {product.title}
                              </p>

                              <p className="mt-1 text-xs text-white/30">
                                #{product.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                            {product.category}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-medium">
                          ${product.price}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Star
                              size={15}
                              className="fill-yellow-400 text-yellow-400"
                            />
                            {product.rating.toFixed(1)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={
                              product.stock > 20
                                ? "text-emerald-400"
                                : product.stock > 0
                                ? "text-yellow-400"
                                : "text-red-400"
                            }
                          >
                            {product.stock}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-4 md:hidden">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-2xl p-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-20 w-20 rounded-xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">
                        {product.title}
                      </h3>

                      <p className="mt-1 text-xs text-white/40">
                        {product.category}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <span>${product.price}</span>

                        <span className="flex items-center gap-1 text-sm">
                          <Star
                            size={14}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass rounded-2xl p-5 transition"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-cyan-300">
        {icon}
      </div>

      <p className="text-xs uppercase tracking-wider text-white/40">
        {title}
      </p>

      <p className="mt-1 font-display text-2xl font-bold">
        {value}
      </p>
    </motion.div>
  );
}