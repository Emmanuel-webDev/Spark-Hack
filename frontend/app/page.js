"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useConnectWithNetwork } from "../lib/useConnectWithNetwork";

export default function LandingPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { handleConnect, isPending, error } = useConnectWithNetwork();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (isConnected) router.push("/dashboard"); }, [isConnected, router]);

  return (
    <div style={{ minHeight: "100vh", background: "#F5EBFA", display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <nav style={{ padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #D4C4DF", background: "#F5EBFA" }}>
        <span style={{ fontFamily: "'Ragot',sans-serif", fontSize: 24, color: "#49225B", letterSpacing: -0.5 }}>Refilr</span>
        <div className="nav-links" style={{ gap: 32 }}>
          <a href="#how" className="nav-link">How it works</a>
          <a href="#security" className="nav-link">Security</a>
        </div>
        {mounted && (
          <button className="cta-btn" onClick={handleConnect} disabled={isPending} style={{ padding: "10px 24px", fontSize: 14 }}>
            {isPending ? "Connecting…" : "Launch app"}
          </button>
        )}
      </nav>

      {/* Hero */}
      <section style={{ flex: 1, padding: "clamp(48px,8vw,100px) clamp(24px,6vw,80px) 48px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div style={{ marginBottom: 20 }}>
          <span className="mono" style={{ fontSize: 11, color: "#A56ABD", letterSpacing: "0.15em", textTransform: "uppercase", border: "1px solid #D4C4DF", padding: "4px 10px", borderRadius: 20, background: "#fff" }}>
            Monad Testnet
          </span>
        </div>

        <div className="hero-split" style={{ display: "flex", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <div className="hero-word">Never</div>
            <div className="hero-word">run dry</div>
            <div className="hero-word-stroke">again.</div>
          </div>
          <div style={{ marginLeft: "auto", maxWidth: 320, paddingBottom: 8, paddingLeft: 24 }}>
            <p style={{ color: "#6E3482", fontSize: 16, lineHeight: 1.65, marginBottom: 24 }}>
              Refilr watches your onchain wallets and tops them up the moment they run low — automatically, with rules you define and a contract that enforces them.
            </p>
            {mounted && (
              <button className="cta-btn" onClick={handleConnect} disabled={isPending}>
                {isPending ? "Connecting…" : "Connect wallet to start"}
              </button>
            )}
            {error && (
              <p style={{ color: "#8b2a2a", fontSize: 12, marginTop: 10 }}>{error}</p>
            )}
          </div>
        </div>

        {/* live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#fff", border: "1px solid #D4C4DF", borderRadius: 6, width: "fit-content", marginBottom: 64 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2d7a50", display: "inline-block", animation: "blink 1.8s infinite" }} />
          <span className="mono" style={{ fontSize: 12, color: "#A56ABD" }}>Automation service active · polling Monad RPC every 15s</span>
        </div>

        {/* How it works */}
        <div id="how" style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: "'Ragot',sans-serif", fontSize: "clamp(28px,4vw,44px)", color: "#49225B", marginBottom: 32, letterSpacing: -1 }}>
            Four steps, zero babysitting.
          </h2>
          <div className="feature-row">
            <div className="feature-cell" style={{ borderRight: "1px solid #D4C4DF" }}>
              <div className="mono" style={{ fontSize: 11, color: "#A56ABD", marginBottom: 12 }}>01 — DEPOSIT</div>
              <div style={{ fontFamily: "'Ragot',sans-serif", fontSize: 28, color: "#49225B", marginBottom: 8, letterSpacing: -0.5 }}>Fund the vault</div>
              <p style={{ color: "#6E3482", fontSize: 14, lineHeight: 1.65 }}>Send MON into your secure onchain vault. Only you can withdraw it. The automation service can never touch these funds directly.</p>
            </div>
            <div className="feature-cell">
              <div className="mono" style={{ fontSize: 11, color: "#A56ABD", marginBottom: 12 }}>02 — REGISTER</div>
              <div style={{ fontFamily: "'Ragot',sans-serif", fontSize: 28, color: "#49225B", marginBottom: 8, letterSpacing: -0.5 }}>Set the rules</div>
              <p style={{ color: "#6E3482", fontSize: 14, lineHeight: 1.65 }}>Add your bot, relayer, or hot wallet. Set a threshold, refill amount, cooldown, and daily cap. Each wallet runs on its own policy.</p>
            </div>
            <div className="feature-cell" style={{ borderTop: "1px solid #D4C4DF", borderRight: "1px solid #D4C4DF" }}>
              <div className="mono" style={{ fontSize: 11, color: "#A56ABD", marginBottom: 12 }}>03 — MONITOR</div>
              <div style={{ fontFamily: "'Ragot',sans-serif", fontSize: 28, color: "#49225B", marginBottom: 8, letterSpacing: -0.5 }}>Watch it happen</div>
              <p style={{ color: "#6E3482", fontSize: 14, lineHeight: 1.65 }}>The off-chain service polls balances continuously. The moment a wallet drops below its threshold, it submits a refuel request.</p>
            </div>
            <div className="feature-cell" style={{ borderTop: "1px solid #D4C4DF" }}>
              <div className="mono" style={{ fontSize: 11, color: "#A56ABD", marginBottom: 12 }}>04 — VERIFY</div>
              <div style={{ fontFamily: "'Ragot',sans-serif", fontSize: 28, color: "#49225B", marginBottom: 8, letterSpacing: -0.5 }}>Contract decides</div>
              <p style={{ color: "#6E3482", fontSize: 14, lineHeight: 1.65 }}>Every refuel is validated onchain — cooldown, daily limit, vault liquidity, authorization. Funds only move when all rules pass.</p>
            </div>
          </div>
        </div>

        {/* Security callout */}
        <div id="security" style={{ background: "#49225B", borderRadius: 8, padding: "40px", marginBottom: 64, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontFamily: "'Ragot',sans-serif", fontSize: "clamp(22px,3vw,34px)", color: "#fff", letterSpacing: -0.5, marginBottom: 8 }}>
              The service proposes. The contract decides.
            </div>
            <p style={{ color: "#D4B8E0", fontSize: 14, lineHeight: 1.65, maxWidth: 480 }}>
              The automation key can only call <span className="mono" style={{ background: "#ffffff18", padding: "1px 6px", borderRadius: 3 }}>refuel()</span>. It cannot withdraw, change policies, or register wallets. A compromised key cannot drain your vault faster than your own rules allow.
            </p>
          </div>
          {mounted && (
            <button className="cta-btn" onClick={handleConnect} disabled={isPending} style={{ background: "#fff", color: "#49225B", flexShrink: 0 }}>
              {isPending ? "Connecting…" : "Open dashboard"}
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #D4C4DF", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontFamily: "'Ragot',sans-serif", fontSize: 18, color: "#49225B" }}>Refilr</span>
        <span className="mono" style={{ fontSize: 11, color: "#A56ABD" }}>Monad Testnet · not audited · use test funds only</span>
      </footer>
    </div>
  );
}