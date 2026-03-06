"use client";

import { useState } from "react";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-6">
      <div
        className="rounded-xl p-6 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(201,127,74,0.04), rgba(17,24,39,0.6))",
          border: "1px solid rgba(201,127,74,0.1)",
        }}
      >
        <h3
          className="font-display"
          style={{
            fontSize: "1.1rem",
            color: "#e8e0d4",
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          When the Index Moves, You&apos;ll Know
        </h3>
        <p
          className="font-editorial"
          style={{
            fontSize: "0.8rem",
            color: "rgba(232,224,212,0.35)",
            fontStyle: "italic",
            marginBottom: 16,
            maxWidth: 380,
            margin: "0 auto 16px",
            lineHeight: 1.6,
          }}
        >
          Weekly updates on what shifted, why it matters, and what
          history suggests about what comes next.
        </p>

        {status === "success" ? (
          <div
            className="font-data"
            style={{
              fontSize: "0.75rem",
              color: "#6a8a72",
              padding: "8px 0",
            }}
          >
            You&apos;re in. Watch for the first update.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 max-w-sm mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-3 py-2 rounded-lg font-data outline-none transition-all duration-300"
              style={{
                fontSize: "0.8rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,127,74,0.12)",
                color: "#e8e0d4",
              }}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-4 py-2 rounded-lg font-data transition-all duration-300 cursor-pointer hover:opacity-90 disabled:opacity-50"
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                background:
                  "linear-gradient(135deg, #c97f4a, #a5653a)",
                color: "#0a0f1a",
                letterSpacing: "0.04em",
              }}
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <div
            className="font-data"
            style={{
              fontSize: "0.65rem",
              color: "#c44a2e",
              marginTop: 8,
            }}
          >
            Something went wrong. Try again.
          </div>
        )}
      </div>
    </section>
  );
}
