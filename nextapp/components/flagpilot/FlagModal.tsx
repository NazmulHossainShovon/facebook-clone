"use client";
import React, { useEffect, useState } from "react";

type VariantInput = {
  key: string;
  value: string;
};

type Flag = {
  _id?: string;
  key: string;
  description?: string;
  status: "active" | "paused" | "archived";
  minImpressionsBeforeOptimization: number;
  variants: { key: string; value: unknown }[];
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function parseVariantValue(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function stringifyVariantValue(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export default function FlagModal({
  open,
  projectId,
  flag,
  onClose,
  onSaved,
}: {
  open: boolean;
  projectId: string;
  flag?: Flag | null;
  onClose: () => void;
  onSaved: (f: unknown) => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "paused" | "archived">("active");
  const [minImpressionsBeforeOptimization, setMinImpressionsBeforeOptimization] = useState(100);
  const [variants, setVariants] = useState<VariantInput[]>([
    { key: "control", value: "false" },
    { key: "variant_b", value: "true" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (flag) {
      setDisplayName(flag.key.replace(/_/g, " "));
      setKey(flag.key || "");
      setDescription(flag.description || "");
      setStatus(flag.status || "active");
      setMinImpressionsBeforeOptimization(flag.minImpressionsBeforeOptimization || 100);
      setVariants(
        (flag.variants || []).map((variant) => ({
          key: variant.key,
          value: stringifyVariantValue(variant.value),
        }))
      );
      return;
    }

    setDisplayName("");
    setKey("");
    setDescription("");
    setStatus("active");
    setMinImpressionsBeforeOptimization(100);
    setVariants([
      { key: "control", value: "false" },
      { key: "variant_b", value: "true" },
    ]);
  }, [flag, open]);

  useEffect(() => {
    if (!flag) {
      setKey(slugify(displayName));
    }
  }, [displayName, flag]);

  if (!open) return null;

  const updateVariant = (idx: number, patch: Partial<VariantInput>) => {
    setVariants((current) =>
      current.map((variant, currentIdx) => {
        if (currentIdx !== idx) return variant;
        return { ...variant, ...patch };
      })
    );
  };

  const addVariant = () => {
    setVariants((current) => [
      ...current,
      { key: `variant_${current.length + 1}`, value: "" },
    ]);
  };

  const removeVariant = (idx: number) => {
    setVariants((current) => current.filter((_, currentIdx) => currentIdx !== idx));
  };

  const save = async () => {
    setError(null);

    if (!projectId || !key.trim()) {
      setError("Project and key are required");
      return;
    }

    if (variants.length < 2) {
      setError("At least two variants are required");
      return;
    }

    const normalizedVariants = variants.map((variant) => ({
      key: variant.key.trim(),
      value: parseVariantValue(variant.value),
    }));

    if (normalizedVariants.some((variant) => !variant.key)) {
      setError("Each variant needs a key");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        projectId,
        key,
        description: description || undefined,
        status,
        minImpressionsBeforeOptimization,
        variants: normalizedVariants,
      };

      let res: Response;
      if (flag && flag._id) {
        res = await fetch(
          (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") +
            "/api/flagpilot/flags/" +
            flag._id,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(
          (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/api/flagpilot/flags",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      }

      if (!res.ok) {
        const maybeErr = await res.json().catch(() => null);
        throw new Error(maybeErr?.error || "Failed to save flag");
      }

      const data = await res.json();
      onSaved(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save flag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded shadow p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">{flag ? "Edit Flag" : "Create Flag"}</h3>

        <label className="block mb-2">
          <div className="text-sm text-gray-600">Display name</div>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full border rounded px-2 py-1"
          />
        </label>

        <label className="block mb-2">
          <div className="text-sm text-gray-600">Flag key</div>
          <input
            value={key}
            onChange={(e) => setKey(slugify(e.target.value))}
            className="mt-1 block w-full border rounded px-2 py-1"
          />
        </label>

        <label className="block mb-2">
          <div className="text-sm text-gray-600">Description</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border rounded px-2 py-1"
            rows={3}
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <label className="block">
            <div className="text-sm text-gray-600">Status</div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "active" | "paused" | "archived")}
              className="mt-1 block w-full border rounded px-2 py-1"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <label className="block">
            <div className="text-sm text-gray-600">Min impressions before optimization</div>
            <input
              type="number"
              min={1}
              value={minImpressionsBeforeOptimization}
              onChange={(e) => setMinImpressionsBeforeOptimization(Number(e.target.value) || 100)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </label>
        </div>

        <div className="border rounded p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Variants</div>
            <button type="button" className="px-2 py-1 border rounded" onClick={addVariant}>
              Add Variant
            </button>
          </div>

          <div className="hidden md:grid grid-cols-[1fr_2fr_auto] gap-2 text-xs font-semibold text-gray-500 mb-1">
            <div>Key</div>
            <div>Value</div>
            <div></div>
          </div>

          {variants.map((variant, idx) => (
            <div key={`${variant.key}-${idx}`} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 mb-2">
              <input
                value={variant.key}
                onChange={(e) => updateVariant(idx, { key: slugify(e.target.value) })}
                placeholder="variant key"
                className="border rounded px-2 py-1"
              />
              <textarea
                value={variant.value}
                onChange={(e) => updateVariant(idx, { value: e.target.value })}
                placeholder='JSON or primitive, e.g. {"btnColor":"green"} or true'
                className="border rounded px-2 py-1"
                rows={2}
              />
              <button
                type="button"
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => removeVariant(idx)}
                disabled={variants.length <= 2}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 rounded" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={save} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
