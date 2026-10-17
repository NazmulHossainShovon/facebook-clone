"use client";
import React, { useState } from "react";

export default function CopyKeyButton({ apiKey }: { apiKey: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // ignore
    }
  };

  return (
    <div>
      <button className="px-2 py-1 border rounded" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
    </div>
  );
}
