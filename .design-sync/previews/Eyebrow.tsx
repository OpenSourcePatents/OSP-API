import { Eyebrow, C } from "osp-arcade";

const stage: React.CSSProperties = { background: C.bg, padding: 24 };

/** A left-aligned section eyebrow. */
export function Default() {
  return (
    <div style={stage}>
      <Eyebrow>WHAT THE API COVERS</Eyebrow>
    </div>
  );
}

/** Centered, over a section that leads with it. */
export function Centered() {
  return (
    <div style={stage}>
      <Eyebrow align="center">THREE LINES OF CODE</Eyebrow>
    </div>
  );
}

/** Tinted with the accent to open a highlighted section. */
export function Accented() {
  return (
    <div style={stage}>
      <Eyebrow color={C.accent}>CONGRESSIONAL ACCOUNTABILITY DATA</Eyebrow>
    </div>
  );
}
