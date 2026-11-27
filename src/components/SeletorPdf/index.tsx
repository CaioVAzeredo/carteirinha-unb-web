import Skeleton from '../Skeleton';
import { documentText } from 'ionicons/icons';
import Icone from '../Icone';
import './SeletorPdf.css';

export default function SeletorPdf({ processing, onPick }: {
  processing: boolean;
  onPick: () => void;
}) {
  return (
    <>
      <button className="picker" disabled={processing} onClick={onPick}>
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
