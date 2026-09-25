"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { loginUser } from "@/services/authService";
import { saveAuthToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const data = await loginUser({
        username,
        password,
      });

      saveAuthToken(data.accessToken);

      router.push("/products");
    } catch {
      setError(
        "Invalid username or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08090d] px-6">

      <div className="glow-purple left-[-100px] top-[-100px]" />
      <div className="glow-cyan bottom-[-100px] right-[-100px]" />

      <div className="dashboard-grid absolute inset-0 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-2xl lg:grid-cols-2"
      >

        {/* LEFT SIDE */}

        <div className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden border-r border-white/10 p-10 lg:flex">

          <div>
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20">
                <Sparkles size={20} />
              </div>

              <span className="font-display text-xl font-bold">
                NEXORA
              </span>
            </div>

            <div className="max-w-md">
              <p className="mb-5 text-sm uppercase tracking-[0.3em] text-violet-300">
                Product Intelligence
              </p>

              <h1 className="font-display text-5xl font-bold leading-tight">
                Manage your
                <span className="gradient-text block">
                  products smarter.
                </span>
              </h1>

              <p className="mt-6 max-w-sm text-base leading-7 text-zinc-400">
                A modern workspace for managing products,
                monitoring inventory and keeping your catalog
                organized.
              </p>
            </div>
          </div>

          <div className="relative">
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [0, 2, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mx-auto w-fit rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-20 w-28 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02]"
                  />
                ))}
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <ShieldCheck size={16} />
            Secure admin workspace
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-md">

            <div className="mb-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300 lg:hidden">
                <Sparkles />
              </div>

              <h2 className="font-display text-3xl font-bold">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Sign in to access your product workspace.
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Username
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60 focus:bg-white/[0.06]"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm outline-none transition focus:border-violet-500/60 focus:bg-white/[0.06]"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
                >
                  {error}
                </motion.div>
              )}

              <button
                disabled={loading}
                className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 font-medium shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.025] p-4">
              <p className="text-xs text-zinc-500">
                Demo credentials
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                Username: <span className="text-violet-300">emilys</span>
              </p>

              <p className="mt-1 text-sm text-zinc-300">
                Password: <span className="text-cyan-300">emilyspass</span>
              </p>
            </div>

          </div>
        </div>

      </motion.div>
    </main>
  );
}