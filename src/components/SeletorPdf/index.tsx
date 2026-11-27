import Skeleton from '../Skeleton';
import { useRef } from 'react';
import { documentText } from 'ionicons/icons';
import Icone from '../Icone';
import './SeletorPdf.css';

export default function SeletorPdf({ processing, onSelect }: {
  processing: boolean;
  onSelect: (file: File) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <>
      <input ref={fileInput} type="file" accept=".pdf,application/pdf" hidden
        onChange={event => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onSelect(file);
        }} />
      <button className="picker" disabled={processing} onClick={() => fileInput.current?.click()}>
        {processing
          ? <Skeleton className="file-circle file-placeholder" />
          : <span className="file-circle" aria-hidden="true"><Icone src={documentText} /><span className="file-add">+</span></span>}
        <strong>Selecionar PDF</strong>
        <span>{processing ? 'Processando arquivo…' : 'Toque para escolher o arquivo'}</span>
      </button>
      {processing && <p className="sr-only" role="status">Processando arquivo PDF.</p>}
    </>
  );
}
