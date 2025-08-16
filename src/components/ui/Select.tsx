import { useEffect, useRef, useState } from 'react';

export type Option = { value: string; label: string };

type Props = {
  value?: string;
  options: Option[];
  placeholder?: string;
  onChange: (v: string) => void;
};

export function Select({ value, options, placeholder = 'Elegí…', onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = () => setOpen(false);
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, []);

  const current = options.find(o => o.value === value);

  return (
    <div className="slt" ref={ref}>
      <button
        type="button"
        className="slt-btn"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{current?.label ?? placeholder}</span>
        <span className="slt-caret">▾</span>
      </button>

      {open && (
        <div className="slt-menu" role="listbox">
          {options.map(o => (
            <button
              key={o.value}
              className={`slt-opt ${o.value === value ? 'is-active' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
              role="option"
              aria-selected={o.value === value}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ✅ export named + default para que TS/Vercel no se queje
export default Select;
