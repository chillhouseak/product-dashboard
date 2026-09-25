"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { getProduct } from "@/services/productService";
import { getAuthToken } from "@/lib/auth";

import type { Product } from "@/types/product";

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const productId = Number(params.id);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(0);

  // =====================================
  // AUTH + PRODUCT FETCH
  // =====================================

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (
      !params.id ||
      Number.isNaN(productId) ||
      productId <= 0
    ) {
      setError("Invalid product ID.");
      setLoading(false);
      return;
    }

    const controller =
      new AbortController();

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const data = await getProduct(
          productId,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setProduct(data);
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
          "Product not found or unable to load the product."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      controller.abort();
    };
  }, [params.id, productId, router]);

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return <ProductLoading />;
  }

  // =====================================
  // ERROR
  // =====================================

  if (error || !product) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08090d] px-4 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="glow-purple left-[-100px] top-[-100px]" />
          <div className="glow-cyan right-[-100px] bottom-[-100px]" />
        </div>

        <div className="dashboard-grid pointer-events-none absolute inset-0 opacity-40" />

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="glass relative z-10 max-w-md rounded-3xl p-8 text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10">
            <AlertCircle
              size={28}
              className="text-red-300"
            />
          </div>

          <h1 className="font-display text-2xl font-bold">
            Product Not Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/40">
            {error ||
              "The product you are looking for does not exist."}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() =>
                router.push("/products")
              }
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Products
            </button>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 px-5 py-3 text-sm font-medium text-white"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // =====================================
  // PRODUCT DATA
  // =====================================

  const images =
    product.images?.length
      ? product.images
      : [product.thumbnail];

  const currentImage =
    images[selectedImage] ||
    product.thumbnail;

  // =====================================
  // IMAGE NAVIGATION
  // =====================================

  function previousImage() {
    setSelectedImage((current) =>
      current === 0
        ? images.length - 1
        : current - 1
    );
  }

  function nextImage() {
    setSelectedImage((current) =>
      current === images.length - 1
        ? 0
        : current + 1
    );
  }

  // =====================================
  // UI
  // =====================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08090d] text-white">
      {/* Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="glow-purple left-[-100px] top-[-100px]" />
        <div className="glow-cyan right-[-100px] top-[300px]" />
      </div>

      <div className="dashboard-grid pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative z-10">
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <button
              onClick={() =>
                router.push("/products")
              }
              className="group flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 shadow-lg shadow-purple-500/20">
                <Package size={20} />
              </div>

              <div className="text-left">
                <p className="font-display text-lg font-bold">
                  NEXORA
                </p>

                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                  Product Intelligence
                </p>
              </div>
            </button>

            <button
              onClick={() =>
                router.push("/products")
              }
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={16} />

              <span className="hidden sm:inline">
                Back to Products
              </span>
            </button>
          </div>
        </header>

        {/* ================================= */}
        {/* CONTENT */}
        {/* ================================= */}

        <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}

          <motion.div
            initial={{
              opacity: 0,
              x: -10,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="mb-6 flex items-center gap-2 text-xs text-white/35"
          >
            <button
              onClick={() =>
                router.push("/products")
              }
              className="transition hover:text-white"
            >
              Products
            </button>

            <span>/</span>

            <span className="text-white/60">
              {product.title}
            </span>
          </motion.div>

          {/* Main Card */}

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
            className="glass overflow-hidden rounded-3xl"
          >
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              {/* ================================= */}
              {/* IMAGE SECTION */}
              {/* ================================= */}

              <div className="border-b border-white/10 p-5 sm:p-8 lg:border-b-0 lg:border-r">
                {/* Main Image */}

                <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.015]">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/[0.08] via-transparent to-cyan-400/[0.06]" />

                  <motion.img
                    key={currentImage}
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    src={currentImage}
                    alt={product.title}
                    className="relative z-10 h-[75%] w-[75%] object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Previous */}

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={
                          previousImage
                        }
                        className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/60 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
                      >
                        <ChevronLeft
                          size={20}
                        />
                      </button>

                      <button
                        onClick={
                          nextImage
                        }
                        className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/60 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
                      >
                        <ChevronRight
                          size={20}
                        />
                      </button>
                    </>
                  )}

                  {/* Image counter */}

                  <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[11px] text-white/50 backdrop-blur-md">
                    {selectedImage + 1} /{" "}
                    {images.length}
                  </div>
                </div>

                {/* Thumbnails */}

                {images.length > 1 && (
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {images
                      .slice(0, 5)
                      .map(
                        (
                          image,
                          index
                        ) => (
                          <button
                            key={image}
                            onClick={() =>
                              setSelectedImage(
                                index
                              )
                            }
                            className={`aspect-square overflow-hidden rounded-xl border transition-all ${
                              selectedImage ===
                              index
                                ? "border-purple-400 bg-purple-500/10 ring-2 ring-purple-500/20"
                                : "border-white/10 bg-white/[0.03] hover:border-white/25"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${product.title} ${index + 1}`}
                              className="h-full w-full object-contain p-2"
                            />
                          </button>
                        )
                      )}
                  </div>
                )}
              </div>

              {/* ================================= */}
              {/* PRODUCT INFORMATION */}
              {/* ================================= */}

              <div className="p-5 sm:p-8 lg:p-10">
                {/* Category */}

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium capitalize text-purple-200">
                    {product.category}
                  </span>

                  {product.brand && (
                    <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/45">
                      {product.brand}
                    </span>
                  )}
                </div>

                {/* Title */}

                <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  {product.title}
                </h1>

                {/* Rating */}

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <=
                            Math.round(
                              product.rating
                            )
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-white/15"
                          }
                        />
                      )
                    )}
                  </div>

                  <span className="text-sm text-white/55">
                    {product.rating.toFixed(
                      1
                    )}{" "}
                    / 5
                  </span>

                  <span className="text-sm text-white/25">
                    •
                  </span>

                  <span className="text-sm text-white/45">
                    {product.reviews?.length ||
                      0}{" "}
                    reviews
                  </span>
                </div>

                {/* Description */}

                <p className="mt-6 text-sm leading-7 text-white/45 sm:text-base">
                  {product.description}
                </p>

                {/* Price */}

                <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <p className="text-xs uppercase tracking-wider text-white/30">
                    Current Price
                  </p>

                  <div className="mt-2 flex flex-wrap items-end gap-3">
                    <span className="font-display text-4xl font-bold">
                      $
                      {product.price.toFixed(
                        2
                      )}
                    </span>

                    {product.discountPercentage >
                      0 && (
                      <span className="mb-1 rounded-lg bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-300">
                        {
                          product.discountPercentage
                        }
                        % OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock */}

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                      <ShoppingBag
                        size={18}
                        className="text-cyan-300"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-white/35">
                        Availability
                      </p>

                      <p className="mt-1 text-sm font-medium text-white/75">
                        {product.availabilityStatus ||
                          (product.stock > 0
                            ? "In Stock"
                            : "Out of Stock")}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-medium ${
                      product.stock > 0
                        ? "text-green-300"
                        : "text-red-300"
                    }`}
                  >
                    {product.stock} units
                  </span>
                </div>

                {/* Feature cards */}

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <InfoFeature
                    icon={
                      <Truck size={17} />
                    }
                    label="Shipping"
                    value={
                      product.shippingInformation ||
                      "Standard shipping"
                    }
                  />

                  <InfoFeature
                    icon={
                      <ShieldCheck
                        size={17}
                      />
                    }
                    label="Warranty"
                    value={
                      product.warrantyInformation ||
                      "Warranty included"
                    }
                  />

                  <InfoFeature
                    icon={
                      <RotateCcw
                        size={17}
                      />
                    }
                    label="Returns"
                    value={
                      product.returnPolicy ||
                      "Return available"
                    }
                  />
                </div>

                {/* SKU */}

                {product.sku && (
                  <div className="mt-5 text-xs text-white/30">
                    SKU:{" "}
                    <span className="text-white/50">
                      {product.sku}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ================================= */}
          {/* REVIEWS */}
          {/* ================================= */}

          <section className="mt-8">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/60">
                Customer Feedback
              </p>

              <h2 className="mt-2 font-display text-2xl font-bold">
                Reviews
              </h2>
            </div>

            {product.reviews &&
            product.reviews.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {product.reviews.map(
                  (
                    review,
                    index
                  ) => (
                    <motion.div
                      key={`${review.reviewerEmail}-${index}`}
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        delay:
                          index * 0.05,
                      }}
                      className="glass rounded-2xl p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-white/85">
                            {
                              review.reviewerName
                            }
                          </p>

                          <p className="mt-1 text-xs text-white/30">
                            {
                              review.reviewerEmail
                            }
                          </p>
                        </div>

                        <div className="flex items-center gap-1 rounded-lg bg-yellow-500/10 px-2 py-1">
                          <Star
                            size={13}
                            className="fill-yellow-400 text-yellow-400"
                          />

                          <span className="text-xs text-yellow-200">
                            {
                              review.rating
                            }
                          </span>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-white/45">
                        {review.comment}
                      </p>

                      <p className="mt-4 text-xs text-white/25">
                        {new Date(
                          review.date
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </motion.div>
                  )
                )}
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 text-center">
                <p className="text-sm text-white/35">
                  No reviews available for
                  this product.
                </p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

// =====================================
// INFO FEATURE
// =====================================

function InfoFeature({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <div className="mb-2 text-purple-300">
        {icon}
      </div>

      <p className="text-[10px] uppercase tracking-wider text-white/25">
        {label}
      </p>

      <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/50">
        {value}
      </p>
    </div>
  );
}

// =====================================
// LOADING
// =====================================

function ProductLoading() {
  return (
    <main className="min-h-screen bg-[#08090d] p-4 text-white sm:p-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 h-6 w-32 animate-pulse rounded bg-white/10" />

        <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] lg:grid-cols-2">
          <div className="p-5 sm:p-8">
            <div className="aspect-square animate-pulse rounded-3xl bg-white/5" />
          </div>

          <div className="space-y-5 p-5 sm:p-8 lg:p-10">
            <div className="h-7 w-24 animate-pulse rounded bg-white/10" />

            <div className="h-12 w-4/5 animate-pulse rounded bg-white/10" />

            <div className="h-5 w-1/3 animate-pulse rounded bg-white/5" />

            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
            </div>

            <div className="h-28 animate-pulse rounded-2xl bg-white/5" />

            <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    </main>
  );
}