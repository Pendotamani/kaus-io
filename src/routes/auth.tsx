import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { KausLogo } from "@/components/KausLogo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Kaus" }] }),
  component: AuthPage,
});

const RESEND_SECONDS = 45;

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (session) navigate({ to: "/chat", replace: true });
  }, [session, navigate]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const cleanPhone = phone.replace(/\D/g, "").slice(0, 10);
  const e164 = `+91${cleanPhone}`;
  const phoneValid = /^[6-9]\d{9}$/.test(cleanPhone);

  const sendOtp = async () => {
    if (!phoneValid) {
      toast.error("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Code sent to ${e164}`);
    setStep("otp");
    setOtp("");
    setResendIn(RESEND_SECONDS);
  };

  const verifyOtp = async (code: string) => {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: e164,
      token: code,
      type: "sms",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      setOtp("");
      return;
    }
    toast.success("Signed in");
    navigate({ to: "/chat", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center h-14 px-4 border-b border-border">
        {step === "otp" ? (
          <Button variant="ghost" size="icon" onClick={() => setStep("phone")} aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : (
          <Button asChild variant="ghost" size="icon" aria-label="Back">
            <Link to="/welcome">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <div className="mx-auto flex items-center gap-2">
          <KausLogo size={24} />
          <span className="font-semibold tracking-tight">Kaus</span>
        </div>
        <div className="w-9" />
      </header>

      <main className="flex-1 flex items-start sm:items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          {step === "phone" ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <h1 className="mt-4 text-2xl font-semibold tracking-tight">
                  Enter your mobile number
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  We'll send you a 6-digit verification code.
                </p>
              </div>

              <label className="text-xs font-medium text-muted-foreground">
                Mobile number
              </label>
              <div className="mt-1.5 flex items-stretch gap-2">
                <div className="inline-flex items-center px-3 rounded-md border border-input bg-muted text-sm font-medium">
                  +91
                </div>
                <Input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10-digit number"
                  value={cleanPhone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && phoneValid) sendOtp();
                  }}
                  className="flex-1 text-base"
                  maxLength={10}
                />
              </div>
              {cleanPhone.length > 0 && !phoneValid && (
                <p className="mt-2 text-xs text-destructive">
                  Indian mobile numbers must be 10 digits starting with 6–9.
                </p>
              )}

              <Button
                onClick={sendOtp}
                disabled={!phoneValid || busy}
                className="mt-6 w-full h-11 text-base"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
              </Button>

              <p className="mt-6 text-[11px] text-muted-foreground text-center">
                By continuing you agree to receive an SMS for verification.
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h1 className="mt-4 text-2xl font-semibold tracking-tight">
                  Verify your number
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-medium text-foreground">{e164}</span>
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(v) => {
                    setOtp(v);
                    if (v.length === 6) verifyOtp(v);
                  }}
                  autoFocus
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={() => verifyOtp(otp)}
                disabled={otp.length !== 6 || busy}
                className="mt-6 w-full h-11 text-base"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Continue"}
              </Button>

              <div className="mt-5 text-center text-sm text-muted-foreground">
                {resendIn > 0 ? (
                  <>Resend code in {resendIn}s</>
                ) : (
                  <button
                    onClick={sendOtp}
                    disabled={busy}
                    className="text-primary font-medium hover:underline"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
