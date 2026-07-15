"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useConnect } from "wagmi";
import { C } from "../lib/tokens";

export default function LandingPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (isConnected) router.push("/dashboard"); }, [isConnected, router]);

  function handleConnect() {
    const c = connectors.find((c) => c.id === "injected") || connectors[0];
    if (c) connect({ connector: c });
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <style>{`
        .hero-word { font-family:'Ragot',sans-serif; font-size:clamp(64px,12vw,140px); font-weight:700; line-height:0.9; letter-spacing:-2px; color:${C.accentDeep}; }
        .hero-word-stroke { font-family:'Ragot',sans-serif; font-size:clamp(64px,12vw,140px); font-weight:700; line-height:0.9; letter-spacing:-2px; color:transparent; -webkit-text-stroke:2px ${C.accentDeep}; }
        .nav-link { color:${C.text3}; text-decoration:none; font-size:14px; font-weight:500; transition:color 120ms; }
        .nav-link:hover { color:${C.accent}; }
        .cta-btn { background:${C.accent}; color:#fff; border:none; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600; padding:14px 32px; border-radius:6px; cursor:pointer; transition:transform 120ms,background 120ms; }
        .cta-btn:hover { transform:scale(0.97); background:${C.accentDeep}; }
        .cta-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .ghost-btn { background:transparent; color:${C.accent}; border:1.5px solid ${C.border}; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; padding:11px 24px; border-radius:6px; cursor:pointer; transition:transform 120ms,border-color 120ms; text-decoration:none; display:inline-block; }
        .ghost-btn:hover { transform:scale(0.97); border-color:${C.accent}; }
        .feature-row { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:${C.border}; border:1px solid ${C.border}; border-radius:8px; overflow:hidden; }
        .feature-cell { background:${C.surface}; padding:28px 24px; }
        .mono { font-family:'DM Mono',monospace; }
        @media(max-width:640px){
          .feature-row { grid-template-columns:1fr; }
          .hero-split { flex-direction:column; gap:8px; }
          .nav-links { display:none; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ padding:"20px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${C.border}`, background:C.bg }}>
        <span style={{ fontFamily:"'Ragot',sans-serif", fontSize:24, color:C.accentDeep, letterSpacing:-0.5 }}>Refilr</span>
        <div className="nav-links" style={{ display:"flex", gap:32 }}>
          <a href="#how" className="nav-link">How it works</a>
          <a href="#security" className="nav-link">Security</a>
        </div>
        {mounted && (
          <button className="cta-btn" onClick={handleConnect} disabled={isPending} style={{ padding:"10px 24px", fontSize:14 }}>
            {isPending ? "Connecting…" : "Launch app"}
          </button>
        )}
      </nav>

      {/* Hero */}
      <section style={{ flex:1, padding:"clamp(48px,8vw,100px) clamp(24px,6vw,80px) 48px", maxWidth:1200, margin:"0 auto", width:"100%" }}>
        <div style={{ marginBottom:20 }}>
          <span className="mono" style={{ fontSize:11, color:C.text3, letterSpacing:"0.15em", textTransform:"uppercase", border:`1px solid ${C.border}`, padding:"4px 10px", borderRadius:20, background:C.surface }}>
            Monad Testnet
          </span>
        </div>

        <div className="hero-split" style={{ display:"flex", alignItems:"flex-end", gap:0, marginBottom:24 }}>
          <div>
            <div className="hero-word">Never</div>
            <div className="hero-word">run dry</div>
            <div className="hero-word-stroke">again.</div>
          </div>
          <div style={{ marginLeft:"auto", maxWidth:320, paddingBottom:8, paddingLeft:24 }}>
            <p style={{ color:C.text2, fontSize:16, lineHeight:1.65, marginBottom:24 }}>
              Refilr watches your onchain wallets and tops them up the moment they run low — automatically, with rules you define and a contract that enforces them.
            </p>
            {mounted && (
              <button className="cta-btn" onClick={handleConnect} disabled={isPending}>
                {isPending ? "Connecting…" : "Connect wallet to start"}
              </button>
            )}
          </div>
        </div>

        {/* live indicator strip */}
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, width:"fit-content", marginBottom:64 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:C.green, display:"inline-block", animation:"blink 1.8s infinite" }} />
          <span className="mono" style={{ fontSize:12, color:C.text3 }}>Automation service active · polling Monad RPC every 15s</span>
        </div>

        {/* How it works — asymmetric, not a 3-clone grid */}
        <div id="how" style={{ marginBottom:64 }}>
          <h2 style={{ fontFamily:"'Ragot',sans-serif", fontSize:"clamp(28px,4vw,44px)", color:C.text1, marginBottom:32, letterSpacing:-1 }}>
            Four steps, zero babysitting.
          </h2>
          <div className="feature-row">
            <div className="feature-cell" style={{ borderRight:`1px solid ${C.border}` }}>
              <div className="mono" style={{ fontSize:11, color:C.text3, marginBottom:12 }}>01 — DEPOSIT</div>
              <div style={{ fontFamily:"'Ragot',sans-serif", fontSize:28, color:C.text1, marginBottom:8, letterSpacing:-0.5 }}>Fund the vault</div>
              <p style={{ color:C.text2, fontSize:14, lineHeight:1.65 }}>Send MON into your secure onchain vault. Only you can withdraw it. The automation service can never touch these funds directly.</p>
            </div>
            <div className="feature-cell">
              <div className="mono" style={{ fontSize:11, color:C.text3, marginBottom:12 }}>02 — REGISTER</div>
              <div style={{ fontFamily:"'Ragot',sans-serif", fontSize:28, color:C.text1, marginBottom:8, letterSpacing:-0.5 }}>Set the rules</div>
              <p style={{ color:C.text2, fontSize:14, lineHeight:1.65 }}>Add your bot, relayer, or hot wallet. Set a threshold, refill amount, cooldown, and daily cap. Each wallet runs on its own policy.</p>
            </div>
            <div className="feature-cell" style={{ borderTop:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}` }}>
              <div className="mono" style={{ fontSize:11, color:C.text3, marginBottom:12 }}>03 — MONITOR</div>
              <div style={{ fontFamily:"'Ragot',sans-serif", fontSize:28, color:C.text1, marginBottom:8, letterSpacing:-0.5 }}>Watch happens</div>
              <p style={{ color:C.text2, fontSize:14, lineHeight:1.65 }}>The off-chain service polls balances continuously. The moment a wallet drops below its threshold, it submits a refuel request.</p>
            </div>
            <div className="feature-cell" style={{ borderTop:`1px solid ${C.border}` }}>
              <div className="mono" style={{ fontSize:11, color:C.text3, marginBottom:12 }}>04 — VERIFY</div>
              <div style={{ fontFamily:"'Ragot',sans-serif", fontSize:28, color:C.text1, marginBottom:8, letterSpacing:-0.5 }}>Contract decides</div>
              <p style={{ color:C.text2, fontSize:14, lineHeight:1.65 }}>Every refuel request is validated onchain — cooldown, daily limit, vault liquidity, authorization. Funds only move when all rules pass.</p>
            </div>
          </div>
        </div>

        {/* Security callout — full-width, different treatment */}
        <div id="security" style={{ background:C.accentDeep, borderRadius:8, padding:"40px 40px", marginBottom:64, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:24 }}>
          <div>
            <div style={{ fontFamily:"'Ragot',sans-serif", fontSize:"clamp(24px,3vw,36px)", color:"#fff", letterSpacing:-0.5, marginBottom:8 }}>
              The service proposes. The contract decides.
            </div>
            <p style={{ color:C.accentSoft, fontSize:14, lineHeight:1.65, maxWidth:480 }}>
              The automation key can only call <span className="mono" style={{ background:"#ffffff18", padding:"1px 6px", borderRadius:3 }}>refuel()</span>. It cannot withdraw, change policies, or register wallets. A compromised key cannot drain your vault faster than your own rules allow.
            </p>
          </div>
          {mounted && (
            <button className="cta-btn" onClick={handleConnect} disabled={isPending} style={{ background:"#fff", color:C.accentDeep, flexShrink:0 }}>
              {isPending ? "Connecting…" : "Open dashboard"}
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"20px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <span style={{ fontFamily:"'Ragot',sans-serif", fontSize:18, color:C.accentDeep }}>Refilr</span>
        <span className="mono" style={{ fontSize:11, color:C.text3 }}>Monad Testnet · not audited · use test funds only</span>
      </footer>
    </div>
  );
}
