
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let active = true;

    const enableRecovery = () => {
      if (!active) return;
      setRecoveryReady(true);
      setErrorMsg("");
      setCheckingSession(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        enableRecovery();
      }
    });

    const checkRecoverySession = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, "")
        );

        const recoveryLink =
          urlParams.get("type") === "recovery" ||
          hashParams.get("type") === "recovery";

        const authError =
          urlParams.get("error_description") ||
          hashParams.get("error_description") ||
          urlParams.get("error") ||
          hashParams.get("error");

        if (authError) {
          throw new Error(
            authError.replace(/\+/g, " ")
          );
        }

        // Allow Supabase time to process the recovery URL and emit
        // PASSWORD_RECOVERY before checking the resulting session.
        await new Promise((resolve) => window.setTimeout(resolve, 300));

        if (!active) return;

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!active) return;

        if (error) {
          throw error;
        }

        if (session && (recoveryLink || window.location.pathname === "/reset-password")) {
          enableRecovery();
          return;
        }

        if (!session) {
          setErrorMsg(
            "This password-reset link is invalid or has expired. Please request a new recovery email."
          );
          return;
        }

        setErrorMsg(
          "Please open the password-recovery link from your email to set a new password."
        );
      } catch (err) {
        if (!active) return;

        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Unable to verify this recovery link. Please request a new one."
        );
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    };

    void checkRecoverySession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password.length < 8) {
      setErrorMsg("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        setRecoveryReady(false);
        setErrorMsg(
          "Your recovery session has expired. Please request a new password-reset email."
        );
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      setSuccessMsg(
        "Your password has been updated successfully. Redirecting you to login..."
      );

      await supabase.auth.signOut();

      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Unable to update your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-blue-700">
            ZIST Admin
          </h1>

          <h2 className="mt-3 text-xl font-semibold text-slate-800">
            Set New Password
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Choose a new password for your account.
          </p>
        </div>

        {checkingSession ? (
          <p
            className="py-6 text-center text-slate-600"
            role="status"
          >
            Verifying your recovery link...
          </p>
        ) : recoveryReady ? (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                New password
              </label>

              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Confirm new password
              </label>

              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Enter the password again"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div
                role="status"
                className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
              >
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || Boolean(successMsg)}
              className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating password..." : "Update Password"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div
              role="alert"
              className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800"
            >
              {errorMsg ||
                "Your recovery link could not be verified. Please request a new one."}
            </div>

            <p className="text-sm text-slate-600">
              Open a fresh password-recovery email to continue.
            </p>

            <Link
              to="/login"
              className="block text-center font-semibold text-blue-700 hover:underline"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
