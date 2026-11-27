import { cardOutline, documentAttachOutline, settingsOutline } from 'ionicons/icons';
import Icone from '../Icone';
import './NavegacaoInferior.css';

export default function NavegacaoInferior({ tela, menuAberto, processando, abrirCarteirinha, escolherPdf, abrirOpcoes }: {
  tela: 'card' | 'import';
  menuAberto: boolean;
  processando: boolean;
  abrirCarteirinha: () => void;
  escolherPdf: () => void;
  abrirOpcoes: () => void;
}) {
  return (
    <nav className="navegacao-inferior" aria-label="Navegação principal">
      <button type="button" aria-current={tela === 'card' ? 'page' : undefined} onClick={abrirCarteirinha}>
        <Icone src={cardOutline} />
        Carteirinha
      </button>
      <button type="button" aria-current={tela === 'import' ? 'page' : undefined}
        disabled={processando} onClick={escolherPdf}>
        <Icone src={documentAttachOutline} />
        Importar PDF
      </button>
      <button type="button" aria-haspopup="dialog" aria-expanded={menuAberto} onClick={abrirOpcoes}>
        <Icone src={settingsOutline} />
        Opções
      </button>
    </nav>
  );
}
