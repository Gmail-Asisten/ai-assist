"use client";

import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Mail } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/inbox" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md bg-background rounded-3xl border border-border shadow-2xl p-8 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 cursor-pointer bg-transparent border-none"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Logo & Brand */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mb-4 shadow-lg">
                  <Sparkles className="w-7 h-7 text-background" />
                </div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight font-display mb-2">
                  Welcome back
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[260px]">
                  Sign in to manage your inbox with AI superpowers
                </p>
              </div>

              {/* Divider with label */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-3 text-muted-foreground font-medium uppercase tracking-wider">
                    Continue with
                  </span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border-2 border-border bg-background hover:bg-muted hover:border-foreground/20 transition-all duration-200 cursor-pointer text-foreground font-semibold text-[15px] shadow-sm"
              >
                <GoogleIcon />
                Continue with Google
              </motion.button>

              {/* Gmail scopes disclaimer */}
              <div className="mt-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-muted/60 border border-border/60">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We'll request access to read, label, and send emails on your behalf so our AI can help manage your inbox.
                </p>
              </div>

              {/* Terms */}
              <p className="text-center text-[11px] text-muted-foreground/60 mt-5 leading-relaxed">
                By continuing, you agree to our{" "}
                <a href="#" className="underline hover:text-muted-foreground transition-colors">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-muted-foreground transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
