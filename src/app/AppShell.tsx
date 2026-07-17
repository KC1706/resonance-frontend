import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

/** The one shell all personas share: 238px sidebar + scrolling main (prototype layout). */
export function AppShell() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "238px 1fr",
        height: "100vh",
        fontFamily: "var(--font-body)",
        color: "var(--color-text)",
        background: "var(--color-bg)",
      }}
    >
      <Sidebar />
      <main className="scroll" style={{ height: "100vh" }}>
        <Outlet />
      </main>
    </div>
  );
}
