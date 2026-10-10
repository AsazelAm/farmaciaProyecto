import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchableOption {
  value: number;
  label: string;
}

type Props = {
  id?: string;
  options: SearchableOption[];
  selected: SearchableOption[];
  customs: string[];
  onPick: (opt: SearchableOption) => void;
  onPickCustom: (name: string) => void;
  onRemoveSelected: (index: number) => void;
  onRemoveCustom: (index: number) => void;
  placeholder?: string;
  emptyText?: string;
  createVerb?: string;
  invalid?: boolean;
};

const C = {
  dark: "#4A1A6E",
  medium: "#7B3FA0",
  light: "#F3EBF9",
  border: "#D8B4F0",
  text: "#2D0A47",
};

export default function SearchableSelect({
  id,
  options,
  selected,
  customs,
  onPick,
  onPickCustom,
  onRemoveSelected,
  onRemoveCustom,
  placeholder,
  emptyText,
  createVerb,
  invalid,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      options.filter(
        (o) => !selected.some((s) => s.value === o.value) && o.label.toLowerCase().includes(q)
      ),
    [options, selected, q]
  );

  const canCreate =
    query.trim().length > 0 && !options.some((o) => o.label.toLowerCase() === q);

  const commitCustom = () => {
    const name = query.trim();
    if (!name) return;
    onPickCustom(name);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      {(selected.length > 0 || customs.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {selected.map((s, i) => (
            <span
              key={`s-${s.value}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: C.light, color: C.dark }}
            >
              {s.label}
              <button
                type="button"
                onClick={() => onRemoveSelected(i)}
                className="hover:text-red-600"
                aria-label={`Quitar ${s.label}`}
              >
                ✕
              </button>
            </span>
          ))}
          {customs.map((c, i) => (
            <span
              key={`c-${c}-${i}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
            >
              Nuevo: {c}
              <button
                type="button"
                onClick={() => onRemoveCustom(i)}
                className="hover:text-red-600"
                aria-label={`Quitar ${c}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        id={id}
        type="text"
        value={query}
        autoComplete="off"
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (filtered.length > 0) {
              onPick(filtered[0]);
              setQuery("");
            } else if (canCreate) {
              commitCustom();
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all focus:ring-4 focus:ring-purple-100 text-sm font-medium bg-white"
        style={{ borderColor: invalid ? "#f87171" : C.border, color: C.text }}
      />

      {open && (
        <div
          className="absolute z-30 mt-1 w-full bg-white rounded-xl border shadow-xl max-h-56 overflow-y-auto"
          style={{ borderColor: C.border }}
        >
          {filtered.length === 0 && !canCreate && (
            <div className="px-4 py-3 text-sm text-gray-400">
              {emptyText ?? "Sin resultados"}
            </div>
          )}
          {filtered.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onPick(o);
                setQuery("");
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors"
              style={{ color: C.text }}
            >
              {o.label}
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              onClick={commitCustom}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold border-t hover:bg-amber-50 transition-colors text-amber-700"
              style={{ borderColor: C.border }}
            >
              + Agregar "{query.trim()}"
              {createVerb ? ` como nuevo ${createVerb}` : ""}
            </button>
          )}
        </div>
      )}
    </div>
  );
}