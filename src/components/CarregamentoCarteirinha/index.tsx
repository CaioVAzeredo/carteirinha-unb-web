import Skeleton from '../Skeleton';
import './CarregamentoCarteirinha.css';

export default function CarregamentoCarteirinha() {
  return (
    <div className="carregamento-carteirinha">
      <p className="sr-only" role="status">Carregando carteirinha…</p>
      <div className="panel carregamento-dados" aria-hidden="true">
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
      <div className="panel carregamento-validacao" aria-hidden="true">
        <Skeleton />
        <Skeleton className="carregamento-qr" />
        <Skeleton />
      </div>
    </div>
  );
}
