"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
const MotionButton = motion(Button);

// Animation variants for staggered student fields
const containerVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 18,
      mass: 0.6,
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.985,
    transition: { duration: 0.18, ease: 'easeOut' }
  }
} satisfies Variants;

const fieldVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 160, damping: 20, mass: 0.5 }
  },
  exit: { opacity: 0, y: 4, transition: { duration: 0.15 } }
} satisfies Variants;

export default function Onboarding() {
  const [role, setRole] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // guard against double click
    setError("");
    if (!role || (role === "STUDENT" && (!year || !section))) {
      setError("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setSubmitting(false);
        return;
      }
      // Save onboarding info to user metadata
      const updates: { role: string; year?: string; section?: string } = { role };
      if (role === "STUDENT") {
        updates.year = year;
        updates.section = section;
      }
      const { error: updateError } = await supabase.auth.updateUser({ data: updates });
      if (updateError) {
        setError(updateError.message);
        setSubmitting(false);
        return;
      }
      // Sync user to database (best effort)
      try {
        const syncResponse = await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
              name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split('@')[0],
            role,
            year: role === "STUDENT" ? year : null,
            section: role === "STUDENT" ? section : null,
          }),
        });
        const syncResult = await syncResponse.json();
        if (!syncResult.success) {
          console.error('User sync failed:', syncResult.error);
        }
      } catch (syncErr) {
        console.error('User sync error:', syncErr);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/25 via-primary/5 to-secondary/25 opacity-35 blur-md" aria-hidden />
        <div className="relative rounded-2xl border border-white/10 bg-white/5 dark:bg-black/30 backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_20px_-8px_rgba(0,0,0,0.55)] px-6 py-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary via-foreground to-primary/70">Welcome</h1>
            <p className="mt-2 text-sm text-foreground/70">Tell us a little about you to finish setting things up.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-wide text-foreground/70">Select your role</p>
              <div className="grid grid-cols-2 gap-3">
                {['STUDENT','TEACHER'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={clsx(
                      'group relative overflow-hidden rounded-xl border px-4 py-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                      'before:absolute before:inset-0 before:-z-10 before:opacity-0 before:transition before:duration-500 before:[background:radial-gradient(circle_at_30%_20%,theme(colors.primary)/35,transparent_70%)] hover:before:opacity-100',
                      role === r
                        ? 'border-primary/60 bg-primary/20 text-foreground shadow-[0_0_0_1px_theme(colors.primary/40),0_0_18px_-6px_theme(colors.primary/45)]'
                        : 'border-white/10 bg-white/2.5 text-foreground/80 hover:border-primary/40 hover:text-foreground'
                    )}
                  >
                    <span className="relative z-10">{r === 'STUDENT' ? 'Student' : 'Teacher'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Student extra fields */}
            <AnimatePresence mode="wait">
              {role === 'STUDENT' && (
                <motion.div
                  key="studentFields"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="space-y-5"
                >
                  <motion.div variants={fieldVariants} className="space-y-2">
                    <label className="block text-xs font-medium tracking-wide uppercase text-foreground/60">Year</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      required
                      className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm border border-white/10 focus:border-primary/60 focus:ring-2 focus:ring-primary/30 outline-none transition placeholder:text-foreground/30"
                      placeholder="Eg. 2"
                    />
                  </motion.div>
                  <motion.div variants={fieldVariants} className="space-y-2">
                    <label className="block text-xs font-medium tracking-wide uppercase text-foreground/60">Section</label>
                    <input
                      type="text"
                      value={section}
                      onChange={e => setSection(e.target.value.toUpperCase())}
                      required
                      className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm border border-white/10 focus:border-primary/60 focus:ring-2 focus:ring-primary/30 outline-none transition placeholder:text-foreground/30"
                      placeholder="Eg. A"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200"
              >
                {error}
              </motion.div>
            )}

            {/* Helper note moved above submit for better context */}
            <p className="text-[10px] text-center text-foreground/40 -mt-2">You can change these later in settings.</p>

            {/* Submit button */}
            <MotionButton
              whileTap={!submitting ? { scale: 0.95 } : undefined}
              whileHover={!submitting ? { translateY: -2 } : undefined}
              disabled={!role || submitting}
              type="submit"
              aria-busy={submitting}
              className="relative w-full h-11 text-sm font-medium overflow-hidden"
            >
              <span className="relative flex w-full items-center justify-center">
                {/* Spinner (absolutely positioned so text stays centered) */}
                <AnimatePresence initial={false}>
                  {submitting && (
                    <motion.span
                      key="spinner"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-4 inline-block size-4 rounded-full border-2 border-primary/30 border-t-primary"
                      style={{ willChange: 'transform' }}
                      aria-hidden="true"
                    />
                  )}
                </AnimatePresence>
                {/* Text swap */}
                <AnimatePresence mode="wait" initial={false}>
                  {submitting ? (
                    <motion.span
                      key="processing"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="tracking-wide text-xs"
                      aria-live="polite"
                    >
                      Processing...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="continue"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      Continue
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              {/* Spinner rotation animation */}
              <style jsx>{`
                [aria-busy='true'] [key='spinner'], [aria-busy='true'] .spinner {
                  animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>
            </MotionButton>
            {/* Removed helper text from below submit */}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
