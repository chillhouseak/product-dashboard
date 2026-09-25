"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LogOut,
  Package,
  DollarSign,
  Star,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

import {
  getProducts,
  searchProducts,
  getProductsByCategory,
  getCategories,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productService";

import { getAuthToken, removeAuthToken } from "@/lib/auth";

import type { Product, Category } from "@/types/product";

interface ProductFormData {
  title: string;
  category: string;
  price: string;
  stock: string;
  rating: string;
  description: string;
}

interface FormErrors {
  title?: string;
  category?: string;
  price?: string;
  stock?: string;
  rating?: string;
  description?: string;
}

const emptyForm: ProductFormData = {
  title: "",
  category: "",
  price: "",
  stock: "",
  rating: "",
  description: "",
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const urlPage = Number(searchParams.get("page")) || 1;
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "all";
  const urlSort = searchParams.get("sort") || "none";
  const urlOrder = searchParams.get("order") || "asc";

  // Product state
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  // Filters
  const [page, setPage] = useState(urlPage);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [category, setCategory] = useState(urlCategory);

  const [sortBy, setSortBy] = useState(urlSort);
  const [sortOrder, setSortOrder] = useState(urlOrder);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Loading/error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CRUD modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] =
    useState<ProductFormData>(emptyForm);

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Success message
  const [successMessage, setSuccessMessage] = useState("");

  // ---------------------------------------------
  // AUTH
  // ---------------------------------------------

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  // ---------------------------------------------
  // LOAD CATEGORIES
  // ---------------------------------------------

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        setCategoriesLoading(true);

        const data = await getCategories(controller.signal);

        if (!controller.signal.aborted) {
          setCategories(data);
        }
      } catch (error: any) {
        if (
          error?.name === "CanceledError" ||
          error?.code === "ERR_CANCELED" ||
          controller.signal.aborted
        ) {
          return;
        }

        console.error(error);
      } finally {
        if (!controller.signal.aborted) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => controller.abort();
  }, []);

  // ---------------------------------------------
  // SEARCH DEBOUNCE
  // ---------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // ---------------------------------------------
  // UPDATE URL
  // ---------------------------------------------

  useEffect(() => {
    const params = new URLSearchParams();

    params.set("page", page.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    if (category !== "all") {
      params.set("category", category);
    }

    if (sortBy !== "none") {
      params.set("sort", sortBy);
      params.set("order", sortOrder);
    }

    router.replace(`/products?${params.toString()}`, {
      scroll: false,
    });
  }, [
    page,
    debouncedSearch,
    category,
    sortBy,
    sortOrder,
    router,
  ]);

  // ---------------------------------------------
  // LOAD PRODUCTS
  // ---------------------------------------------

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const skip = (page - 1) * pageSize;

        let data;

        if (debouncedSearch.trim()) {
          data = await searchProducts(
            debouncedSearch.trim(),
            pageSize,
            skip,
            controller.signal
          );
        } else if (category !== "all") {
          data = await getProductsByCategory(
            category,
            pageSize,
            skip,
            controller.signal
          );
        } else {
          data = await getProducts(
            pageSize,
            skip,
            controller.signal
          );
        }

        if (!controller.signal.aborted) {
          setProducts(data.products);
          setTotal(data.total);
        }
      } catch (error: any) {
        if (
          error?.name === "CanceledError" ||
          error?.code === "ERR_CANCELED" ||
          controller.signal.aborted
        ) {
          return;
        }

        console.error(error);
        setError(
          "Unable to load products. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [page, pageSize, debouncedSearch, category]);

  // ---------------------------------------------
  // SORT PRODUCTS
  // ---------------------------------------------

  const sortedProducts = useMemo(() => {
    const result = [...products];

    if (sortBy === "title") {
      result.sort((a, b) => {
        const comparison = a.title.localeCompare(b.title);

        return sortOrder === "asc"
          ? comparison
          : -comparison;
      });
    }

    if (sortBy === "price") {
      result.sort((a, b) => {
        const comparison = a.price - b.price;

        return sortOrder === "asc"
          ? comparison
          : -comparison;
      });
    }

    if (sortBy === "rating") {
      result.sort((a, b) => {
        const comparison = a.rating - b.rating;

        return sortOrder === "asc"
          ? comparison
          : -comparison;
      });
    }

    return result;
  }, [products, sortBy, sortOrder]);

  // ---------------------------------------------
  // PAGINATION
  // ---------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

  const startItem =
    total === 0 ? 0 : (page - 1) * pageSize + 1;

  const endItem = Math.min(
    page * pageSize,
    total
  );

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  // ---------------------------------------------
  // LOGOUT
  // ---------------------------------------------

  function handleLogout() {
    removeAuthToken();
    router.replace("/login");
  }

  // ---------------------------------------------
  // FORM
  // ---------------------------------------------

  function openAddModal() {
    setEditingProduct(null);
    setFormData(emptyForm);
    setFormErrors({});
    setShowFormModal(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);

    setFormData({
      title: product.title || "",
      category: product.category || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      rating: product.rating?.toString() || "",
      description: product.description || "",
    });

    setFormErrors({});
    setShowFormModal(true);
  }

  function closeFormModal() {
    if (saving) return;

    setShowFormModal(false);
    setEditingProduct(null);
    setFormData(emptyForm);
    setFormErrors({});
  }

  function handleInputChange(
    field: keyof ProductFormData,
    value: string
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  }

  // ---------------------------------------------
  // FORM VALIDATION
  // ---------------------------------------------

  function validateForm(): boolean {
    const errors: FormErrors = {};

    if (!formData.title.trim()) {
      errors.title = "Product title is required.";
    }

    if (!formData.category.trim()) {
      errors.category = "Category is required.";
    }

    const price = Number(formData.price);

    if (!formData.price.trim()) {
      errors.price = "Price is required.";
    } else if (Number.isNaN(price) || price <= 0) {
      errors.price = "Price must be greater than 0.";
    }

    const stock = Number(formData.stock);

    if (!formData.stock.trim()) {
      errors.stock = "Stock is required.";
    } else if (
      Number.isNaN(stock) ||
      stock < 0 ||
      !Number.isInteger(stock)
    ) {
      errors.stock =
        "Stock must be a whole number greater than or equal to 0.";
    }

    const rating = Number(formData.rating);

    if (!formData.rating.trim()) {
      errors.rating = "Rating is required.";
    } else if (
      Number.isNaN(rating) ||
      rating < 0 ||
      rating > 5
    ) {
      errors.rating = "Rating must be between 0 and 5.";
    }

    if (!formData.description.trim()) {
      errors.description =
        "Product description is required.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  }

  // ---------------------------------------------
  // SAVE PRODUCT
  // ---------------------------------------------

  async function handleSaveProduct() {
    if (saving) return;

    const valid = validateForm();

    if (!valid) return;

    try {
      setSaving(true);

      const productPayload: Partial<Product> = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        rating: Number(formData.rating),
        description: formData.description.trim(),
      };

      if (editingProduct) {
        // UPDATE
        const updatedProduct = await updateProduct(
          editingProduct.id,
          productPayload
        );

        setProducts((previous) =>
          previous.map((product) =>
            product.id === editingProduct.id
              ? {
                  ...product,
                  ...updatedProduct,
                  ...productPayload,
                }
              : product
          )
        );

        showSuccess("Product updated successfully.");
      } else {
        // ADD
        const newProduct = await addProduct(
          productPayload
        );

        const productToAdd: Product = {
          ...newProduct,
          ...productPayload,
          id: newProduct.id,
          images:
            newProduct.images || [
              "https://cdn.dummyjson.com/product-images/placeholder.jpg",
            ],
          thumbnail:
            newProduct.thumbnail ||
            "https://cdn.dummyjson.com/product-images/placeholder.jpg",
        } as Product;

        setProducts((previous) => [
          productToAdd,
          ...previous,
        ]);

        setTotal((previous) => previous + 1);

        showSuccess("Product added successfully.");
      }

      closeFormModal();
    } catch (error) {
      console.error(error);

      setError(
        editingProduct
          ? "Unable to update the product."
          : "Unable to add the product."
      );
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------
  // DELETE PRODUCT
  // ---------------------------------------------

  async function handleDeleteProduct() {
    if (!deleteTarget || deleting) return;

    try {
      setDeleting(true);

      await deleteProduct(deleteTarget.id);

      setProducts((previous) =>
        previous.filter(
          (product) =>
            product.id !== deleteTarget.id
        )
      );

      setTotal((previous) =>
        Math.max(0, previous - 1)
      );

      setDeleteTarget(null);

      showSuccess("Product deleted successfully.");
    } catch (error) {
      console.error(error);

      setError(
        "Unable to delete the product. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  // ---------------------------------------------
  // SUCCESS MESSAGE
  // ---------------------------------------------

  function showSuccess(message: string) {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }

  // ---------------------------------------------
  // FILTER RESET
  // ---------------------------------------------

  function resetFilters() {
    setSearch("");
    setDebouncedSearch("");
    setCategory("all");
    setSortBy("none");
    setSortOrder("asc");
    setPage(1);
  }

  // ---------------------------------------------
  // PAGE CHANGE
  // ---------------------------------------------

  function changePage(newPage: number) {
    if (
      newPage < 1 ||
      newPage > totalPages ||
      newPage === page
    ) {
      return;
    }

    setPage(newPage);
  }

  // ---------------------------------------------
  // RENDER
  // ---------------------------------------------

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08090d] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="glow-purple left-[-150px] top-[-150px]" />
        <div className="glow-cyan right-[-150px] top-[35%]" />
      </div>

      <div className="dashboard-grid pointer-events-none absolute inset-0 opacity-40" />

      {/* Success Toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
              x: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
              x: 20,
            }}
            className="fixed right-6 top-6 z-[100] flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-[#10141d]/95 px-5 py-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
              <CheckCircle2
                size={19}
                className="text-emerald-300"
              />
            </div>

            <span className="text-sm text-white/80">
              {successMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="relative z-20 border-b border-white/[0.07] bg-[#08090d]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 shadow-lg shadow-purple-500/20">
              <Package size={21} />
            </div>

            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">
                NEXORA
              </h1>

              <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
                Product Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">
              Logout
            </span>
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-[1500px] px-5 py-8 lg:px-8">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"
        >
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-purple-300/70">
              Overview
            </p>

            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Product{" "}
              <span className="gradient-text">
                Command Center
              </span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
              Manage, search, filter and organize your
              product catalog from one place.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 px-5 py-3.5 text-sm font-semibold shadow-xl shadow-purple-500/10 transition hover:-translate-y-0.5 hover:shadow-purple-500/20"
          >
            <Plus size={18} />
            Add Product
          </button>
        </motion.div>

        {/* STATS */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Package size={18} />}
            label="Total Products"
            value={total}
          />

          <StatCard
            icon={<Boxes size={18} />}
            label="Current Page"
            value={products.length}
          />

          <StatCard
            icon={<DollarSign size={18} />}
            label="Avg. Price"
            value={
              products.length
                ? `$${(
                    products.reduce(
                      (sum, product) =>
                        sum + product.price,
                      0
                    ) / products.length
                  ).toFixed(2)}`
                : "$0.00"
            }
          />

          <StatCard
            icon={<Star size={18} />}
            label="Avg. Rating"
            value={
              products.length
                ? (
                    products.reduce(
                      (sum, product) =>
                        sum + product.rating,
                      0
                    ) / products.length
                  ).toFixed(1)
                : "0.0"
            }
          />
        </div>

        {/* FILTER PANEL */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass mb-6 rounded-3xl p-4 lg:p-5"
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_190px_160px_150px_auto]">
            {/* SEARCH */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products..."
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-purple-400/40 focus:bg-white/[0.06]"
              />
            </div>

            {/* CATEGORY */}
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
              disabled={categoriesLoading}
              className="h-12 rounded-xl border border-white/10 bg-[#10121a] px-4 text-sm text-white/70 outline-none transition focus:border-purple-400/40"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((item) => (
                <option
                  key={item.slug}
                  value={item.slug}
                >
                  {item.name}
                </option>
              ))}
            </select>

            {/* SORT */}
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              className="h-12 rounded-xl border border-white/10 bg-[#10121a] px-4 text-sm text-white/70 outline-none focus:border-purple-400/40"
            >
              <option value="none">
                Sort By
              </option>
              <option value="title">
                Title
              </option>
              <option value="price">
                Price
              </option>
              <option value="rating">
                Rating
              </option>
            </select>

            {/* ORDER */}
            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value)
              }
              disabled={sortBy === "none"}
              className="h-12 rounded-xl border border-white/10 bg-[#10121a] px-4 text-sm text-white/70 outline-none disabled:opacity-30 focus:border-purple-400/40"
            >
              <option value="asc">
                Ascending
              </option>
              <option value="desc">
                Descending
              </option>
            </select>

            {/* RESET */}
            <button
              onClick={resetFilters}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white/50 transition hover:bg-white/[0.07] hover:text-white"
            >
              <RefreshCw size={15} />
              Reset
            </button>
          </div>
        </motion.div>

        {/* ERROR */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-400/20 bg-red-500/[0.07] p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle
                size={19}
                className="text-red-300"
              />

              <span className="text-sm text-red-200/80">
                {error}
              </span>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="rounded-lg border border-red-300/20 px-3 py-2 text-xs text-red-200 transition hover:bg-red-400/10"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* PRODUCTS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass overflow-hidden rounded-3xl"
        >
          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-white/[0.07] text-left">
                  <th className="px-6 py-5 text-xs font-medium uppercase tracking-wider text-white/30">
                    Product
                  </th>

                  <th className="px-6 py-5 text-xs font-medium uppercase tracking-wider text-white/30">
                    Category
                  </th>

                  <th className="px-6 py-5 text-xs font-medium uppercase tracking-wider text-white/30">
                    Price
                  </th>

                  <th className="px-6 py-5 text-xs font-medium uppercase tracking-wider text-white/30">
                    Rating
                  </th>

                  <th className="px-6 py-5 text-xs font-medium uppercase tracking-wider text-white/30">
                    Stock
                  </th>

                  <th className="px-6 py-5 text-right text-xs font-medium uppercase tracking-wider text-white/30">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <ProductTableSkeleton />
                ) : sortedProducts.length === 0 ? (
                  <EmptyState />
                ) : (
                  sortedProducts.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onEdit={openEditModal}
                      onDelete={setDeleteTarget}
                      onOpen={() =>
                        router.push(
                          `/products/${product.id}`
                        )
                      }
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="space-y-3 p-4 md:hidden">
            {loading ? (
              <MobileSkeleton />
            ) : sortedProducts.length === 0 ? (
              <EmptyState />
            ) : (
              sortedProducts.map((product) => (
                <MobileProductCard
                  key={product.id}
                  product={product}
                  onEdit={openEditModal}
                  onDelete={setDeleteTarget}
                  onOpen={() =>
                    router.push(
                      `/products/${product.id}`
                    )
                  }
                />
              ))
            )}
          </div>

          {/* PAGINATION */}
          {!loading && sortedProducts.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <p className="text-xs text-white/35">
                  Showing{" "}
                  <span className="text-white/70">
                    {startItem}–{endItem}
                  </span>{" "}
                  of{" "}
                  <span className="text-white/70">
                    {total}
                  </span>
                </p>

                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(
                      Number(event.target.value)
                    );
                    setPage(1);
                  }}
                  className="rounded-lg border border-white/10 bg-[#10121a] px-2 py-1.5 text-xs text-white/60 outline-none"
                >
                  <option value={10}>
                    10 / page
                  </option>
                  <option value={20}>
                    20 / page
                  </option>
                  <option value={50}>
                    50 / page
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    changePage(page - 1)
                  }
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/50 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <ChevronLeft size={16} />
                </button>

                {pageNumbers
                  .slice(
                    Math.max(0, page - 3),
                    Math.min(totalPages, page + 2)
                  )
                  .map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() =>
                        changePage(pageNumber)
                      }
                      className={`h-9 min-w-9 rounded-lg px-2 text-xs transition ${
                        pageNumber === page
                          ? "bg-gradient-to-r from-purple-500 to-cyan-400 font-semibold text-white"
                          : "border border-white/10 text-white/50 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                <button
                  onClick={() =>
                    changePage(page + 1)
                  }
                  disabled={page === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/50 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {showFormModal && (
          <ProductFormModal
            editingProduct={editingProduct}
            formData={formData}
            formErrors={formErrors}
            saving={saving}
            categories={categories}
            onChange={handleInputChange}
            onClose={closeFormModal}
            onSave={handleSaveProduct}
          />
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            product={deleteTarget}
            deleting={deleting}
            onCancel={() => {
              if (!deleting) {
                setDeleteTarget(null);
              }
            }}
            onConfirm={handleDeleteProduct}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="glass rounded-2xl p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.06]">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
        {icon}
      </div>

      <p className="text-xs text-white/35">
        {label}
      </p>

      <p className="mt-1 font-display text-xl font-bold">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   PRODUCT ROW
===================================================== */

function ProductRow({
  product,
  onEdit,
  onDelete,
  onOpen,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onOpen: () => void;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group border-b border-white/[0.05] transition hover:bg-white/[0.025]"
    >
      <td
        className="cursor-pointer px-6 py-4"
        onClick={onOpen}
      >
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
            <img
              src={
                product.thumbnail ||
                product.images?.[0]
              }
              alt={product.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
          </div>

          <div className="min-w-0">
            <p className="max-w-[300px] truncate text-sm font-medium text-white/90">
              {product.title}
            </p>

            <p className="mt-1 text-xs text-white/30">
              #{product.id}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className="rounded-lg border border-purple-400/10 bg-purple-400/[0.06] px-3 py-1.5 text-xs text-purple-200/70">
          {product.category}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className="font-display text-sm font-semibold">
          ${product.price.toFixed(2)}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <Star
            size={14}
            className="fill-yellow-400 text-yellow-400"
          />

          <span className="text-sm text-white/70">
            {product.rating.toFixed(1)}
          </span>
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          className={
            product.stock > 20
              ? "text-sm text-emerald-300"
              : product.stock > 0
              ? "text-sm text-yellow-300"
              : "text-sm text-red-300"
          }
        >
          {product.stock}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onEdit(product);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/40 transition hover:border-purple-400/30 hover:bg-purple-400/10 hover:text-purple-200"
            title="Edit"
          >
            <Pencil size={15} />
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete(product);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/40 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

/* =====================================================
   MOBILE CARD
===================================================== */

function MobileProductCard({
  product,
  onEdit,
  onDelete,
  onOpen,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onOpen: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
    >
      <div
        onClick={onOpen}
        className="flex cursor-pointer gap-4"
      >
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10">
          <img
            src={
              product.thumbnail ||
              product.images?.[0]
            }
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">
            {product.title}
          </h3>

          <p className="mt-1 text-xs text-white/30">
            {product.category}
          </p>

          <div className="mt-3 flex items-center gap-4">
            <span className="font-display font-bold">
              ${product.price.toFixed(2)}
            </span>

            <span className="flex items-center gap-1 text-xs text-white/50">
              <Star
                size={13}
                className="fill-yellow-400 text-yellow-400"
              />
              {product.rating.toFixed(1)}
            </span>

            <span className="text-xs text-white/40">
              Stock: {product.stock}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-white/[0.06] pt-3">
        <button
          onClick={() => onEdit(product)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-xs text-white/60 transition hover:bg-white/[0.06] hover:text-white"
        >
          <Pencil size={14} />
          Edit
        </button>

        <button
          onClick={() => onDelete(product)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/10 py-2.5 text-xs text-red-300/70 transition hover:bg-red-400/10 hover:text-red-300"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </motion.div>
  );
}

/* =====================================================
   PRODUCT FORM MODAL
===================================================== */

function ProductFormModal({
  editingProduct,
  formData,
  formErrors,
  saving,
  categories,
  onChange,
  onClose,
  onSave,
}: {
  editingProduct: Product | null;
  formData: ProductFormData;
  formErrors: FormErrors;
  saving: boolean;
  categories: Category[];
  onChange: (
    field: keyof ProductFormData,
    value: string
  ) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl"
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.07] bg-[#10121a]/95 px-6 py-5 backdrop-blur-xl">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-300/60">
              Product Management
            </p>

            <h2 className="font-display text-xl font-bold">
              {editingProduct
                ? "Edit Product"
                : "Add Product"}
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/40 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-30"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5 p-6">
          {/* TITLE */}
          <FormField
            label="Product Title"
            required
            error={formErrors.title}
          >
            <input
              value={formData.title}
              onChange={(event) =>
                onChange(
                  "title",
                  event.target.value
                )
              }
              placeholder="Enter product title"
              className={inputClass(
                Boolean(formErrors.title)
              )}
            />
          </FormField>

          {/* CATEGORY */}
          <FormField
            label="Category"
            required
            error={formErrors.category}
          >
            <input
              list="product-categories"
              value={formData.category}
              onChange={(event) =>
                onChange(
                  "category",
                  event.target.value
                )
              }
              placeholder="e.g. smartphones"
              className={inputClass(
                Boolean(formErrors.category)
              )}
            />

            <datalist id="product-categories">
              {categories.map((category) => (
                <option
                  key={category.slug}
                  value={category.slug}
                >
                  {category.name}
                </option>
              ))}
            </datalist>
          </FormField>

          {/* PRICE / STOCK */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Price"
              required
              error={formErrors.price}
            >
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(event) =>
                  onChange(
                    "price",
                    event.target.value
                  )
                }
                placeholder="99.99"
                className={inputClass(
                  Boolean(formErrors.price)
                )}
              />
            </FormField>

            <FormField
              label="Stock"
              required
              error={formErrors.stock}
            >
              <input
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(event) =>
                  onChange(
                    "stock",
                    event.target.value
                  )
                }
                placeholder="100"
                className={inputClass(
                  Boolean(formErrors.stock)
                )}
              />
            </FormField>
          </div>

          {/* RATING */}
          <FormField
            label="Rating"
            required
            error={formErrors.rating}
          >
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(event) =>
                onChange(
                  "rating",
                  event.target.value
                )
              }
              placeholder="4.5"
              className={inputClass(
                Boolean(formErrors.rating)
              )}
            />
          </FormField>

          {/* DESCRIPTION */}
          <FormField
            label="Description"
            required
            error={formErrors.description}
          >
            <textarea
              rows={5}
              value={formData.description}
              onChange={(event) =>
                onChange(
                  "description",
                  event.target.value
                )
              }
              placeholder="Write a product description..."
              className={`${inputClass(
                Boolean(formErrors.description)
              )} resize-none`}
            />
          </FormField>

          {/* INFO */}
          <div className="rounded-xl border border-purple-400/10 bg-purple-400/[0.04] p-4 text-xs leading-5 text-white/40">
            <strong className="text-purple-200/70">
              Demo API:
            </strong>{" "}
            DummyJSON simulates Add and Update
            requests. The changes are reflected
            immediately in this dashboard but the
            public API does not permanently store
            CRUD changes.
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/50 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
            >
              Cancel
            </button>

            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 px-6 py-3 text-sm font-semibold transition hover:shadow-lg hover:shadow-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  {editingProduct ? (
                    <Pencil size={16} />
                  ) : (
                    <Plus size={17} />
                  )}

                  {editingProduct
                    ? "Save Changes"
                    : "Create Product"}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =====================================================
   FORM FIELD
===================================================== */

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-white/60">
        {label}

        {required && (
          <span className="ml-1 text-purple-300">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

/* =====================================================
   INPUT CLASS
===================================================== */

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 transition ${
    hasError
      ? "border-red-400/40 focus:border-red-400/60"
      : "border-white/10 focus:border-purple-400/40 focus:bg-white/[0.06]"
  }`;
}

/* =====================================================
   DELETE MODAL
===================================================== */

function DeleteModal({
  product,
  deleting,
  onCancel,
  onConfirm,
}: {
  product: Product;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        className="glass w-full max-w-md rounded-3xl p-7"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10">
          <Trash2
            size={23}
            className="text-red-300"
          />
        </div>

        <h2 className="text-center font-display text-xl font-bold">
          Delete Product?
        </h2>

        <p className="mt-3 text-center text-sm leading-6 text-white/40">
          Are you sure you want to delete{" "}
          <span className="font-medium text-white/70">
            "{product.title}"
          </span>
          ? This action will remove the product
          from the current dashboard view.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/50 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState() {
  return (
    <tbody>
      <tr>
        <td colSpan={6}>
          <div className="flex min-h-[350px] flex-col items-center justify-center px-5 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <Package
                size={27}
                className="text-white/30"
              />
            </div>

            <h3 className="font-display text-lg font-semibold">
              No products found
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-white/35">
              Try changing your search or filters
              to find different products.
            </p>
          </div>
        </td>
      </tr>
    </tbody>
  );
}

/* =====================================================
   TABLE SKELETON
===================================================== */

function ProductTableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 8 }).map(
        (_, index) => (
          <tr
            key={index}
            className="border-b border-white/[0.05]"
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 animate-pulse rounded-xl bg-white/[0.07]" />

                <div>
                  <div className="h-3 w-48 animate-pulse rounded bg-white/[0.07]" />
                  <div className="mt-2 h-2 w-16 animate-pulse rounded bg-white/[0.05]" />
                </div>
              </div>
            </td>

            <td className="px-6 py-4">
              <div className="h-7 w-24 animate-pulse rounded-lg bg-white/[0.06]" />
            </td>

            <td className="px-6 py-4">
              <div className="h-3 w-16 animate-pulse rounded bg-white/[0.07]" />
            </td>

            <td className="px-6 py-4">
              <div className="h-3 w-12 animate-pulse rounded bg-white/[0.07]" />
            </td>

            <td className="px-6 py-4">
              <div className="h-3 w-10 animate-pulse rounded bg-white/[0.07]" />
            </td>

            <td className="px-6 py-4">
              <div className="ml-auto h-9 w-20 animate-pulse rounded-lg bg-white/[0.06]" />
            </td>
          </tr>
        )
      )}
    </tbody>
  );
}

/* =====================================================
   MOBILE SKELETON
===================================================== */

function MobileSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-white/[0.07] p-4"
          >
            <div className="flex gap-4">
              <div className="h-20 w-20 rounded-xl bg-white/[0.07]" />

              <div className="flex-1">
                <div className="h-4 w-3/4 rounded bg-white/[0.07]" />

                <div className="mt-3 h-3 w-1/3 rounded bg-white/[0.05]" />

                <div className="mt-4 h-3 w-1/2 rounded bg-white/[0.05]" />
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
}