import { useDropdownKeyboard } from "../hooks/useDropdownKeyboard";
import { useRef, useEffect } from "react";

interface SearchDropdownProps<T> {
  value: string;
  onChange: (val: string) => void;
  onSelect: (item: T) => void;
  items: T[];
  onClear: () => void;
  placeholder?: string;
  renderItem: (item: T, highlighted: boolean) => React.ReactNode;
  getKey: (item: T) => string | number;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

export function SearchDropdown<T>({
  value, onChange, onSelect, items, onClear,
  placeholder, renderItem, getKey, style, inputStyle,
}: SearchDropdownProps<T>) {
  const { highlightedIndex, setHighlightedIndex, handleKeyDown, reset } =
    useDropdownKeyboard(items, (item) => { onSelect(item); reset(); }, onClear);

  // 1. Referência para o contêiner do dropdown
  const containerRef = useRef<HTMLDivElement>(null);

  // 2. Lógica para detectar clique fora da caixa
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Se o clique foi fora do elemento referenciado, dispara onClear
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClear();
      }
    };

    // Adiciona o ouvinte de clique
    document.addEventListener("mousedown", handleClickOutside);
    
    // Remove o ouvinte quando o componente for desmontado para evitar vazamento de memória
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClear]);

  return (
    // 3. Adiciona a referência na div principal
    <div ref={containerRef} style={{ position: "relative", ...style }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          className="form-control"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          style={{ paddingRight: 32, ...inputStyle }}
        />
        <div style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          color: "var(--text-muted)", display: "flex", pointerEvents: "none",
        }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
      </div>

      {items.length > 0 && (
        <ul style={{
          position: "absolute", width: "100%", zIndex: 1000,
          marginTop: 4, padding: 0, listStyle: "none",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 6, overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}>
          {items.map((item, index) => (
            <li
              key={getKey(item)}
              onMouseDown={e => { e.preventDefault(); onSelect(item); reset(); }}
              onMouseEnter={() => setHighlightedIndex(index)}
              style={{
                cursor: "pointer",
                background: index === highlightedIndex ? "var(--brand)" : "transparent",
                color: index === highlightedIndex ? "#fff" : "var(--text-primary)",
                borderBottom: index < items.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background 0.1s",
              }}
            >
              {renderItem(item, index === highlightedIndex)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}