import { campos, type Carteirinha } from '../../types/carteirinha';
import './DadosCarteirinha.css';

const camposExibidos = ['matricula', 'cpf', 'nivel', 'curso'] as const;

export default function DadosCarteirinha({ dados }: {
  dados: Pick<Carteirinha, (typeof camposExibidos)[number]>;
}) {
  return (
    <dl className="details panel">
      {camposExibidos.map(campo => (
        <div key={campo}>
          <dt>{campos[campo].toUpperCase()}:</dt>{' '}
          <dd>{dados[campo]}</dd>
        </div>
      ))}
    </dl>
  );
}
