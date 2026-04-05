import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - OSP Civic Data API",
};

function TierCard({
  name,
  rate,
  price,
  who,
  highlight,
  cta,
}: {
  name: string;
  rate: string;
  price: string;
  who: string;
  highlight?: boolean;
  cta?: { label: string; href: string };
}) {
  return (
    <div style={{
      ...s.tierCard,
      ...(highlight ? { borderColor: "#3b82f6" } : {}),
    }}>
      <p style={s.tierName}>{name}</p>
      <p style={s.tierRate}>{rate}</p>
      <p style={s.tierPrice}>{price}</p>
      <p style={s.tierWho}>{who}</p>
      {cta && <a href={cta.href} style={s.tierCta}>{cta.label}</a>}
    </div>
  );
}

export default function PricingPage() {
  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.title}>API Tiers</h1>
        <p style={s.subtitle}>
          All tiers get full access to every endpoint. The only difference is rate limits.
        </p>

        <div style={s.grid}>
          <TierCard
            name="Free"
            rate="1,000 req/hr"
            price="Free forever"
            who="Everyone — sign up with an email and start building."
            highlight
            cta={{ label: "Get Free Key", href: "/signup" }}
          />
          <TierCard
            name="Discounted"
            rate="10,000 req/hr"
            price="Free or reduced"
            who="Educators (.edu), 501(c)(3) nonprofits, and researchers. Apply by email."
            cta={{ label: "Apply", href: "mailto:opensourcepatents@gmail.com?subject=Discounted%20Tier%20Request" }}
          />
          <TierCard
            name="Paid"
            rate="10,000 req/hr"
            price="Coming soon"
            who="Commercial applications and high-volume users."
          />
          <TierCard
            name="Admin"
            rate="Unlimited"
            price="N/A"
            who="Internal use only."
          />
        </div>

        <div style={s.faq}>
          <h2 style={s.faqTitle}>How do tiers work?</h2>
          <p style={s.faqText}>
            Every new signup gets the <strong>free</strong> tier automatically.
            Rate limits are enforced per API key using a sliding 1-hour window.
            If you hit the limit, you&apos;ll get a <code style={s.code}>401</code> response
            with a message indicating when to retry.
          </p>
          <p style={s.faqText}>
            To request <strong>discounted</strong> access, email{" "}
            <a href="mailto:opensourcepatents@gmail.com" style={s.link}>
              opensourcepatents@gmail.com
            </a>{" "}
            with your name, organization, and a brief description of your use case.
            Edu emails (.edu), registered 501(c)(3) orgs, and academic researchers qualify.
          </p>
        </div>

        <div style={s.ctaRow}>
          <a href="/signup" style={s.ctaPrimary}>Get Free Key</a>
          <a href="/docs" style={s.ctaSecondary}>API Docs</a>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0a0a0f",
    color: "#e0e0e0",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  container: {
    maxWidth: 820,
    margin: "0 auto",
    padding: "3rem 1.5rem",
  },
  title: {
    color: "#fff",
    fontSize: "2rem",
    fontWeight: 700,
    margin: 0,
    textAlign: "center" as const,
  },
  subtitle: {
    color: "#888",
    fontSize: "1rem",
    textAlign: "center" as const,
    marginTop: "0.5rem",
    marginBottom: "2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
    marginBottom: "2.5rem",
  },
  tierCard: {
    backgroundColor: "#12121a",
    border: "1px solid #1e1e2e",
    borderRadius: 10,
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.4rem",
  },
  tierName: {
    color: "#fff",
    fontSize: "1.1rem",
    fontWeight: 700,
    margin: 0,
  },
  tierRate: {
    color: "#3b82f6",
    fontSize: "0.9rem",
    fontWeight: 600,
    margin: 0,
  },
  tierPrice: {
    color: "#aaa",
    fontSize: "0.85rem",
    margin: 0,
  },
  tierWho: {
    color: "#666",
    fontSize: "0.8rem",
    lineHeight: 1.45,
    margin: 0,
    flex: 1,
  },
  tierCta: {
    display: "inline-block",
    marginTop: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#3b82f6",
    color: "#fff",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.8rem",
    textAlign: "center" as const,
  },
  faq: {
    backgroundColor: "#12121a",
    border: "1px solid #1e1e2e",
    borderRadius: 10,
    padding: "1.5rem",
    marginBottom: "2rem",
  },
  faqTitle: {
    color: "#fff",
    fontSize: "1.1rem",
    fontWeight: 600,
    margin: "0 0 0.75rem",
  },
  faqText: {
    color: "#888",
    fontSize: "0.9rem",
    lineHeight: 1.6,
    margin: "0 0 0.75rem",
  },
  code: {
    backgroundColor: "#1a1a2a",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: "0.85em",
    color: "#c8c8d0",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
  },
  ctaRow: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "center",
  },
  ctaPrimary: {
    display: "inline-block",
    padding: "0.75rem 2rem",
    backgroundColor: "#3b82f6",
    color: "#fff",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "1rem",
  },
  ctaSecondary: {
    display: "inline-block",
    padding: "0.75rem 2rem",
    backgroundColor: "transparent",
    color: "#3b82f6",
    border: "1px solid #3b82f6",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "1rem",
  },
};
