import { NeonTitle, C } from "osp-arcade";

const stage: React.CSSProperties = { background: C.bg, padding: 32 };

/** The hero title, at its default 64px cap. */
export function Hero() {
  return (
    <div style={stage}>
      <NeonTitle>CIVIC DATA</NeonTitle>
    </div>
  );
}

/** A two-line hero, as used on the landing page. */
export function Stacked() {
  return (
    <div style={stage}>
      <NeonTitle>
        CIVIC DATA
        <br />
        API
      </NeonTitle>
    </div>
  );
}

/** A smaller page-heading variant. */
export function Compact() {
  return (
    <div style={stage}>
      <NeonTitle size={40} letterSpacing={4} strokeWidth={1.5}>
        PRICING
      </NeonTitle>
    </div>
  );
}
