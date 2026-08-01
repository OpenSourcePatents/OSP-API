import { Card, CardHeaderBar, TagPill, C, F, accent } from "osp-arcade";

const stage: React.CSSProperties = { background: C.bg, padding: 24 };
const title: React.CSSProperties = {
  fontFamily: F.display,
  fontSize: 16,
  fontWeight: 700,
  color: C.white,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  margin: "0 0 8px",
};
const bodyText: React.CSSProperties = {
  fontFamily: F.body,
  fontSize: 14,
  color: C.muted,
  lineHeight: 1.5,
  margin: 0,
};
const arrow: React.CSSProperties = {
  fontFamily: F.display,
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  letterSpacing: 1,
  display: "inline-block",
  marginTop: 12,
};

/** The canonical nav card: header bar + tag, title, body, and a CTA arrow. */
export function NavCard() {
  return (
    <div style={stage}>
      <div style={{ width: 300 }}>
        <Card
          link
          header={<CardHeaderBar right={<TagPill color={C.accent} borderColor={accent(0.4)}>REFERENCE</TagPill>} />}
        >
          <div style={{ padding: "16px 14px" }}>
            <h3 style={title}>API Documentation</h3>
            <p style={bodyText}>13 endpoints, full parameter tables, example responses.</p>
            <span style={arrow}>EXPLORE DOCS →</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

/** A plain surface card with no header bar. */
export function Plain() {
  return (
    <div style={stage}>
      <div style={{ width: 300 }}>
        <Card>
          <div style={{ padding: 16 }}>
            <h4 style={{ ...title, fontSize: 12 }}>Stock Trades</h4>
            <p style={{ ...bodyText, fontSize: 13 }}>
              STOCK Act disclosures with ticker, amount range, trade type, and timing.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/** A custom border color for a highlighted (success) card. */
export function Highlighted() {
  return (
    <div style={stage}>
      <div style={{ width: 300 }}>
        <Card
          borderColor={C.success}
          header={<CardHeaderBar dotColor={C.success} label="ONLINE" right={<TagPill color={C.success}>PUBLIC</TagPill>} />}
        >
          <div style={{ padding: "16px 14px" }}>
            <h3 style={title}>Members Endpoint</h3>
            <p style={bodyText}>536 members of Congress. No API key required.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
