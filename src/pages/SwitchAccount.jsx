import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SwitchAccount() {
  const isRTL = localStorage.getItem("bato_language") !== "en";
  const t = (en, ar) => isRTL ? ar : en;
  const target = new URLSearchParams(window.location.search).get("email") || "";
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [wrongAccount, setWrongAccount] = useState(false);
  const returnUrl = new URL("/SwitchAccount", window.location.origin);
  returnUrl.searchParams.set("email", target);

  const acceptAccount = (account) => {
    if (!target || account.email?.toLowerCase() === target.toLowerCase()) {
      window.location.replace("/Dashboard");
      return true;
    }
    setWrongAccount(true);
    setError(t("You signed in with a different account. Please sign in as ", "سجّلت الدخول بحساب مختلف. يرجى تسجيل الدخول باستخدام ") + target + ".");
    return false;
  };

  useEffect(() => {
    let active = true;
    base44.auth.me()
      .then(account => { if (active) acceptAccount(account); })
      .catch(() => {})
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [target]);

  const signIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await base44.auth.loginViaEmailPassword(target, password);
      if (acceptAccount(result.user)) return;
    } catch {
      setError(t("Sign-in failed. Check your password, or use the BATO sign-in page below.", "تعذّر تسجيل الدخول. تحقّق من كلمة المرور أو استخدم خيارات تسجيل الدخول أدناه."));
    } finally {
      setPassword("");
      setBusy(false);
    }
  };

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex items-center justify-center p-6" style={{ background: "#eeebe6" }}>
      <section className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-5 shadow-sm">
        <h1 className="text-xl font-semibold text-[#3a2e1e]">{t("Switch BATO account", "تبديل حساب باتو")}</h1>
        {checking ? <p role="status">{t("Checking your session…", "جارٍ التحقق من تسجيل الدخول…")}</p> : (
          <>
            <p className="text-sm text-gray-600">{t("Sign in as ", "للمتابعة، سجّل الدخول باستخدام ")}<strong dir="ltr" className="break-all">{target || t("your other account", "حسابك الآخر")}</strong>{t(" to continue.", ".")}</p>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            {wrongAccount ? (
              <Button className="w-full" onClick={() => base44.auth.logout(returnUrl.toString())}>{t("Sign out and try again", "تسجيل الخروج والمحاولة مجددًا")}</Button>
            ) : (
              <>
                {target && (
                  <form onSubmit={signIn} className="space-y-3">
                    <label className="block text-sm">
                      {t("Email", "البريد الإلكتروني")}
                      <Input type="email" name="username" autoComplete="username" value={target} readOnly />
                    </label>
                    <label className="block text-sm">
                      {t("Password", "كلمة المرور")}
                      <Input type="password" name="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required disabled={busy} />
                    </label>
                    <Button type="submit" className="w-full" disabled={busy}>{busy ? t("Signing in…", "جارٍ تسجيل الدخول…") : t("Sign in", "تسجيل الدخول")}</Button>
                  </form>
                )}
                <Button variant="outline" className="w-full" disabled={busy} onClick={() => base44.auth.redirectToLogin(returnUrl.toString())}>
                  {t("Other sign-in options", "خيارات أخرى لتسجيل الدخول")}
                </Button>
              </>
            )}
            <a href="/Dashboard" className="block text-center text-sm text-gray-600 underline">{t("Back to BATO", "العودة إلى باتو")}</a>
          </>
        )}
      </section>
    </main>
  );
}
