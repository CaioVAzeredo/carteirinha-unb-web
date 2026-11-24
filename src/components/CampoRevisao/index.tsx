import type { HTMLAttributes } from 'react';
import './CampoRevisao.css';

export default function CampoRevisao({ id, label, value, error, inputMode, onChange }: {
  id: string;
  label: string;
  value: string;
  error?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  onChange: (value: string) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={event => onChange(event.target.value)}
        inputMode={inputMode}
        autoCapitalize="characters"
        spellCheck={false}
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <small id={`${id}-error`}>{error}</small>}
    </div>
  );
}
