import { useState } from "react";

export default function CopyEmail({ email }) {
  const [msg, setMsg] = useState("");
  const copy = async () => {
    try { await navigator.clipboard.writeText(email); setMsg("Copied to clipboard"); }
    catch { setMsg("Copy failed. Select the address above instead."); }
    setTimeout(() => setMsg(""), 2600);
  };
  return (
    <>
      <button className="roll" onClick={copy}><span data-text="Copy email">Copy email</span></button>
      <span className="copy-status" role="status" aria-live="polite">{msg}</span>
    </>
  );
}