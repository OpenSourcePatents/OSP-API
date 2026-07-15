"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { C, F, accent } from "@/lib/theme";

/** Live HH:MM:SS clock in the neon double-layer style. */
function NeonClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setTime(`${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const base: React.CSSProperties = {
    fontFamily: F.display,
    fontSize: 18,
    letterSpacing: 4,
    fontWeight: 700,
  };

  return (
    <div style={{ position: "relative" }} aria-label="local time" suppressHydrationWarning>
      <span style={{ ...base, color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.7)" }}>
        {time || "00:00:00"}
      </span>
      <span
        className="dc-neon-fill"
        aria-hidden
        style={{
          ...base,
          position: "absolute",
          inset: 0,
          color: C.accent,
          animation: "neon-flicker 4s ease-in-out infinite",
        }}
      >
        {time || "00:00:00"}
      </span>
    </div>
  );
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/signup", label: "Sign Up" },
];

function Nav() {
  const pathname = usePathname();
  return (
    <nav style={{ display: "flex", gap: 4 }}>
      {NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="dc-navlink"
            style={{
              fontFamily: F.display,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              padding: "6px 10px",
              borderRadius: 3,
              color: C.white,
              textDecoration: "none",
              border: active ? `1px solid ${accent(0.5)}` : "1px solid transparent",
              transition: "background 0.15s ease",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10,10,15,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${accent(0.15)}`,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          height: 56,
          gap: 16,
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", minWidth: 0 }}
        >
          <img
            src="/osp-logo.jpg"
            alt="OSP"
            className="dc-logo"
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: `1px solid ${accent(0.3)}`,
              boxShadow: `0 0 8px ${accent(0.4)}`,
              animation: "logo-spin 8s linear infinite",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 3,
              color: C.white,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            OSP · CIVIC DATA
          </span>
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 9,
              color: accent(0.6),
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            API v2
          </span>
        </Link>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <NeonClock />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <Nav />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const link: React.CSSProperties = {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.accent,
    letterSpacing: 1,
    textDecoration: "none",
  };
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 2,
        borderTop: `1px solid ${C.border}`,
        padding: 24,
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: F.mono,
          fontSize: 10,
          color: C.faint,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          lineHeight: 2,
        }}
      >
        BUILT BY OPENSOURCEPATENTS · NO ROYALTIES · EVER
      </p>
      <p style={{ fontFamily: F.mono, fontSize: 10, color: "#444", letterSpacing: 1, marginTop: 4 }}>
        <Link href="/" style={link}>HOME</Link>
        <span style={{ color: "#333" }}> · </span>
        <Link href="/docs" style={link}>DOCS</Link>
        <span style={{ color: "#333" }}> · </span>
        <Link href="/pricing" style={link}>PRICING</Link>
        <span style={{ color: "#333" }}> · </span>
        <Link href="/signup" style={link}>GET API KEY</Link>
        <span style={{ color: "#333" }}> · </span>
        <a href="https://github.com/OpenSourcePatents/OSP-API" target="_blank" rel="noopener noreferrer" style={link}>
          GITHUB
        </a>
      </p>
      <p style={{ fontFamily: F.mono, fontSize: 9, color: "#333", letterSpacing: 1, marginTop: 8 }}>
        AGPL-3.0 · DATA FROM CONGRESSWATCH · 100% PUBLIC RECORDS
      </p>
    </footer>
  );
}

export default function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="dc-grid" />
      <div className="dc-vignette" />
      <div className="dc-scanline" />
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ position: "relative", zIndex: 2, flex: 1 }}>{children}</main>
        <Footer />
      </div>
    </>
  );
}
