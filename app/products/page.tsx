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
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import {
  getProducts,
  searchProducts,
} from "@/services/productService";

import {
  getAuthToken,
  removeAuthToken,
} from "@/lib/auth";

import type { Product } from "@/types/product";

export default function ProductsPage() {
  const router = useRouter();

  // -----------------------------
  // PRODUCT STATE
  // -----------------------------

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  // -----------------------------
  // PAGINATION STATE
  // -----------------------------

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // -----------------------------
  // SEARCH STATE
  // -----------------------------

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // -----------------------------
  // UI STATE
  // -----------------------------

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------
  // DEBOUNCE SEARCH
  // -----------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());

      // Whenever search changes,
      // go back to page 1.
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // -----------------------------
  // LOAD PRODUCTS
  // -----------------------------

  async function loadProducts(
    currentPage: number,
    currentPageSize: number,
    currentSearch: string,
    signal?: AbortSignal
  ) {
    try {
      setLoading(true);
      setError("");

      const skip =
        (currentPage - 1) * currentPageSize;

      let data;

      if (currentSearch.trim()) {
        // Search API
        data = await searchProducts(
          currentSearch.trim(),
          currentPageSize,
          skip,
          signal
        );
      } else {
        // Normal products API
        data = await getProducts(
          currentPageSize,
          skip,
          signal
        );
      }

      // Only update the UI if the request
      // was not cancelled.
      if (!signal?.aborted) {
        setProducts(data.products);
        setTotal(data.total);
      }
    } catch (error: any) {
      // Ignore cancelled requests.
      if (
        error?.name === "CanceledError" ||
        error?.code === "ERR_CANCELED" ||
        signal?.aborted
      ) {
        return;
      }

      console.error(error);

      setError(
        "Unable to load products. Please try again."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  // -----------------------------
  // AUTH + FETCH
  // -----------------------------

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    // Create controller for this request.
    const controller = new AbortController();

    loadProducts(
      page,
      pageSize,
      debouncedSearch,
      controller.signal
    );

    // Cancel old request when:
    // page/search/pageSize changes.
    return () => {
      controller.abort();
    };
  }, [
    router,
    page,
    pageSize,
    debouncedSearch,
  ]);

  // -----------------------------
  // LOGOUT
  // -----------------------------

  function handleLogout() {
    removeAuthToken();
    router.replace("/login");
  }

  // -----------------------------
  // REFRESH
  // -----------------------------

  function handleRefresh() {
    const controller = new AbortController();

    loadProducts(
      page,
      pageSize,
      debouncedSearch,
      controller.signal
    );
  }

  // -----------------------------
  // CLEAR SEARCH
  // -----------------------------

  function handleClearSearch() {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  }

  // -----------------------------
  // PAGINATION
  // -----------------------------

  const totalPages = Math.ceil(
    total / pageSize
  );

  const startItem =
    total === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const endItem = Math.min(
    page * pageSize,
    total
  );

  // -----------------------------
  // PAGE NUMBERS
  // -----------------------------

  const pageNumbers = [];

  const maxVisiblePages = 5;

  let startPage = Math.max(
    1,
    page - 2
  );

  let endPage = Math.min(
    totalPages,
    startPage + maxVisiblePages - 1
  );

  if (
    endPage - startPage <
    maxVisiblePages - 1
  ) {
    startPage = Math.max(
      1,
      endPage - maxVisiblePages + 1
    );
  }

  for (
    let i = startPage;
    i <= endPage;
    i++
  ) {
    pageNumbers.push(i);
  }

  // -----------------------------
  // STATISTICS
  // -----------------------------

  const averageRating =
    products.length > 0
      ? (
          products.reduce(
            (sum, product) =>
              sum + product.rating,
            0
          ) / products.length
        ).toFixed(1)
      : "0.0";

  const totalStock = products.reduce(
    (sum, product) =>
      sum + product.stock,
    0
  );

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08090d] text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="glow-purple left-[-100px] top-[-100px]" />
        <div className="glow-cyan right-[-100px] top-[300px]" />
      </div>

      {/* Grid background */}
      <div className="dashboard-grid pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative z-10">
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 shadow-lg shadow-purple-500/20">
                <Package size={22} />
              </div>

              <div>
                <h1 className="font-display text-xl font-bold tracking-tight">
                  NEXORA
                </h1>

                <p className="text-xs text-white/40">
                  Product Intelligence
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition-all duration-300 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut
                size={17}
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </header>

        {/* ================================= */}
        {/* MAIN CONTENT */}
        {/* ================================= */}

        <section className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
          {/* Heading */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="mb-8"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

              <span className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300/70">
                Live Inventory
              </span>
            </div>

            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Product{" "}
              <span className="gradient-text">
                Intelligence
              </span>
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-white/45 sm:text-base">
              Monitor your product catalog,
              inventory, pricing and performance
              from one dashboard.
            </p>
          </motion.div>

          {/* ================================= */}
          {/* STATS */}
          {/* ================================= */}

          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={<Package size={19} />}
              label="Total Products"
              value={total.toString()}
            />

            <StatCard
              icon={<Boxes size={19} />}
              label="Current Stock"
              value={totalStock.toLocaleString()}
            />

            <StatCard
              icon={<Star size={19} />}
              label="Avg. Rating"
              value={averageRating}
            />

            <StatCard
              icon={<DollarSign size={19} />}
              label="Page Products"
              value={products.length.toString()}
            />
          </div>

          {/* ================================= */}
          {/* SEARCH / ACTION BAR */}
          {/* ================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="glass mb-6 rounded-2xl p-3 sm:p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative w-full lg:max-w-xl">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search products..."
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-11 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-purple-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-purple-500/10"
                />

                {search && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                {/* Search status */}
                {debouncedSearch && (
                  <div className="hidden rounded-xl border border-purple-400/20 bg-purple-500/10 px-3 py-2 text-xs text-purple-200 sm:block">
                    Searching:{" "}
                    <span className="font-medium">
                      "{debouncedSearch}"
                    </span>
                  </div>
                )}

                {/* Refresh */}
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="group flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/65 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={
                      loading
                        ? "animate-spin"
                        : "transition-transform duration-500 group-hover:rotate-180"
                    }
                  />

                  <span className="hidden sm:inline">
                    Refresh
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* ================================= */}
          {/* ERROR */}
          {/* ================================= */}

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-400/20 bg-red-500/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-red-200">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-200/60">
                  {error}
                </p>
              </div>

              <button
                onClick={handleRefresh}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-200 transition hover:bg-red-500/20"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </motion.div>
          )}

          {/* ================================= */}
          {/* TABLE */}
          {/* ================================= */}

          <div className="glass overflow-hidden rounded-2xl">
            {loading ? (
              <LoadingState />
            ) : products.length === 0 ? (
              <EmptyState
                search={debouncedSearch}
                onClear={handleClearSearch}
              />
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.025] text-left">
                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-white/35">
                          Product
                        </th>

                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-white/35">
                          Category
                        </th>

                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-white/35">
                          Price
                        </th>

                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-white/35">
                          Rating
                        </th>

                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-white/35">
                          Stock
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {products.map(
                        (product, index) => (
                          <motion.tr
                            key={product.id}
                            initial={{
                              opacity: 0,
                              y: 8,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              delay:
                                index * 0.025,
                            }}
                            className="group border-b border-white/[0.06] transition-colors duration-200 hover:bg-white/[0.035]"
                          >
                            {/* PRODUCT */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                                  <img
                                    src={
                                      product.thumbnail
                                    }
                                    alt={
                                      product.title
                                    }
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-[280px] truncate font-medium text-white/90">
                                    {product.title}
                                  </p>

                                  <p className="mt-1 text-xs text-white/30">
                                    ID #
                                    {product.id}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* CATEGORY */}
                            <td className="px-6 py-4">
                              <span className="rounded-lg border border-purple-400/15 bg-purple-500/10 px-3 py-1.5 text-xs font-medium capitalize text-purple-200">
                                {product.category}
                              </span>
                            </td>

                            {/* PRICE */}
                            <td className="px-6 py-4">
                              <span className="font-display text-sm font-semibold text-white/85">
                                $
                                {product.price.toFixed(
                                  2
                                )}
                              </span>
                            </td>

                            {/* RATING */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Star
                                  size={15}
                                  className="fill-yellow-400 text-yellow-400"
                                />

                                <span className="text-sm text-white/70">
                                  {product.rating.toFixed(
                                    1
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* STOCK */}
                            <td className="px-6 py-4">
                              <StockBadge
                                stock={
                                  product.stock
                                }
                              />
                            </td>
                          </motion.tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="divide-y divide-white/[0.06] md:hidden">
                  {products.map(
                    (product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{
                          delay:
                            index * 0.03,
                        }}
                        className="p-4"
                      >
                        <div className="flex gap-4">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/10">
                            <img
                              src={
                                product.thumbnail
                              }
                              alt={
                                product.title
                              }
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-medium text-white/90">
                              {product.title}
                            </h3>

                            <p className="mt-1 text-xs capitalize text-white/35">
                              {product.category}
                            </p>

                            <div className="mt-3 flex items-center justify-between">
                              <span className="font-display font-semibold">
                                $
                                {product.price.toFixed(
                                  2
                                )}
                              </span>

                              <div className="flex items-center gap-1">
                                <Star
                                  size={14}
                                  className="fill-yellow-400 text-yellow-400"
                                />

                                <span className="text-xs text-white/60">
                                  {product.rating.toFixed(
                                    1
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-white/35">
                            Stock
                          </span>

                          <StockBadge
                            stock={
                              product.stock
                            }
                          />
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </>
            )}
          </div>

          {/* ================================= */}
          {/* PAGINATION */}
          {/* ================================= */}

          {!loading &&
            products.length > 0 && (
              <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Showing */}
                <div className="text-sm text-white/40">
                  Showing{" "}
                  <span className="font-medium text-white/70">
                    {startItem}
                  </span>{" "}
                  –{" "}
                  <span className="font-medium text-white/70">
                    {endItem}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-white/70">
                    {total}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* PAGE SIZE */}
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(
                        Number(
                          event.target.value
                        )
                      );
                      setPage(1);
                    }}
                    className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/70 outline-none transition focus:border-purple-400/40"
                  >
                    <option
                      value={10}
                      className="bg-[#111218]"
                    >
                      10 / page
                    </option>

                    <option
                      value={20}
                      className="bg-[#111218]"
                    >
                      20 / page
                    </option>

                    <option
                      value={50}
                      className="bg-[#111218]"
                    >
                      50 / page
                    </option>
                  </select>

                  {/* PREVIOUS */}
                  <button
                    onClick={() =>
                      setPage(
                        (current) =>
                          Math.max(
                            1,
                            current - 1
                          )
                      )
                    }
                    disabled={page === 1}
                    className="flex h-10 items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">
                      Previous
                    </span>
                  </button>

                  {/* PAGE NUMBERS */}
                  <div className="flex items-center gap-1">
                    {pageNumbers.map(
                      (pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() =>
                            setPage(
                              pageNumber
                            )
                          }
                          className={`h-10 min-w-10 rounded-xl px-3 text-sm transition-all ${
                            page === pageNumber
                              ? "bg-gradient-to-r from-purple-500 to-cyan-400 font-semibold text-white shadow-lg shadow-purple-500/20"
                              : "border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    )}
                  </div>

                  {/* NEXT */}
                  <button
                    onClick={() =>
                      setPage(
                        (current) =>
                          Math.min(
                            totalPages,
                            current + 1
                          )
                      )
                    }
                    disabled={
                      page === totalPages
                    }
                    className="flex h-10 items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <span className="hidden sm:inline">
                      Next
                    </span>

                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}

// =====================================
// STAT CARD
// =====================================

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="glass rounded-2xl p-4 transition-shadow duration-300 hover:shadow-xl hover:shadow-purple-500/5 sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
          {icon}
        </div>
      </div>

      <p className="text-xs text-white/35">
        {label}
      </p>

      <p className="mt-1 font-display text-xl font-bold text-white/90 sm:text-2xl">
        {value}
      </p>
    </motion.div>
  );
}

// =====================================
// STOCK BADGE
// =====================================

function StockBadge({
  stock,
}: {
  stock: number;
}) {
  let classes =
    "border-green-400/20 bg-green-500/10 text-green-300";

  let label = "In Stock";

  if (stock === 0) {
    classes =
      "border-red-400/20 bg-red-500/10 text-red-300";

    label = "Out of Stock";
  } else if (stock < 20) {
    classes =
      "border-orange-400/20 bg-orange-500/10 text-orange-300";

    label = "Low Stock";
  }

  return (
    <span
      className={`inline-flex rounded-lg border px-2.5 py-1.5 text-xs font-medium ${classes}`}
    >
      {label} · {stock}
    </span>
  );
}

// =====================================
// LOADING STATE
// =====================================

function LoadingState() {
  return (
    <div className="divide-y divide-white/[0.06]">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-5"
        >
          <div className="h-12 w-12 animate-pulse rounded-xl bg-white/10" />

          <div className="flex-1 space-y-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />

            <div className="h-3 w-1/5 animate-pulse rounded bg-white/5" />
          </div>

          <div className="hidden h-4 w-20 animate-pulse rounded bg-white/10 md:block" />

          <div className="hidden h-4 w-16 animate-pulse rounded bg-white/10 md:block" />

          <div className="hidden h-4 w-20 animate-pulse rounded bg-white/10 md:block" />
        </div>
      ))}
    </div>
  );
}

// =====================================
// EMPTY STATE
// =====================================

function EmptyState({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <Search
          size={25}
          className="text-white/30"
        />
      </div>

      <h3 className="font-display text-lg font-semibold">
        No products found
      </h3>

      <p className="mt-2 max-w-md text-sm text-white/35">
        {search
          ? `We couldn't find any products matching "${search}".`
          : "There are no products available right now."}
      </p>

      {search && (
        <button
          onClick={onClear}
          className="mt-5 rounded-xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-sm text-purple-200 transition hover:bg-purple-500/20"
        >
          Clear search
        </button>
      )}
    </div>
  );
}