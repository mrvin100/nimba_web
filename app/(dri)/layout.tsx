/**
 * Layout for the DRI analyst workspace. The parenthesised `(dri)` route group
 * gives this role its own layout without adding a segment to the URL, so further
 * roles (DCM, Risques, Comité) can be added later as sibling groups without
 * reorganising existing routes. Session enforcement is wired in NIMBA-9.
 */
export default function DriLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen">{children}</div>;
}
