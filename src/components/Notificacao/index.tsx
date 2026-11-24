import { useEffect } from 'react';
import './Notificacao.css';

export default function Notificacao({ mensagem, fechar }: {
  mensagem: string;
  fechar: () => void;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(fechar, 5000);
    return () => window.clearTimeout(timeout);
  }, [fechar]);

  return (
    <div className="notificacao">
      <p role="status">{mensagem}</p>
      <button type="button" onClick={fechar} aria-label="Fechar notificação">×</button>
    </div>
  );
}
