import {
  addCircleOutline as iconInstall,
  documentAttachOutline as iconImport,
  trashOutline as iconTrash,
  informationCircle as iconInfo,
  logoGithub as iconGithub,
  close as iconClose,
} from 'ionicons/icons';
import Icon from '../Icone';
import Dialog from '../Modal';
import './OpcoesCarteirinha.css';

export default function OpcoesCarteirinha({
  modal, busy, error, closeModal, onImport, onRequestRemove, onAbout, onRepository, onRemove, onInstall,
}: {
  modal: 'menu' | 'about' | 'remove' | 'repository' | 'qr' | null;
  busy: boolean;
  error: string;
  closeModal: () => void;
  onImport: () => void;
  onRequestRemove: () => void;
  onAbout: () => void;
  onRepository: () => void;
  onRemove: () => void;
  onInstall?: () => void;
}) {
  return (
    <>
      <Dialog title="Carteirinha" className="menu-dialog" open={modal === 'menu'} close={closeModal}>
        <div className="handle" aria-hidden="true" />
        <h2>Carteirinha</h2>
        <button onClick={onImport}><Icon src={iconImport} />Importar novo PDF</button>
        <button onClick={onRequestRemove}><Icon src={iconTrash} />Remover carteirinha</button>
        <button onClick={onAbout}><Icon src={iconInfo} />Sobre o aplicativo</button>
        <button onClick={onRepository}><Icon src={iconGithub} />Repositório</button>
        {onInstall && <button onClick={onInstall}><Icon src={iconInstall} />Adicionar à tela inicial</button>}
        <button onClick={closeModal}><Icon src={iconClose} />Cancelar</button>
      </Dialog>
      {modal === 'repository' && (
        <Dialog title="Repositório" close={closeModal}>
          <h2>Repositório</h2>
          <p>Este é o repositório da Identidade Estudantil da UnB para web. No GitHub, você encontra o código-fonte e as instruções para rodar o projeto.</p>
          <div className="actions">
            <button autoFocus onClick={closeModal}>Fechar</button>
            <a className="primary repository-action" href="https://github.com/CaioVAzeredo/carteirinha-unb-web"
              target="_blank" rel="noopener noreferrer">Abrir no GitHub</a>
          </div>
        </Dialog>
      )}
      {modal === 'about' && (
        <Dialog title="Sobre o aplicativo" close={closeModal}>
          <h2>Sobre o aplicativo</h2>
          <p>Identidade Estudantil processa o PDF e armazena a carteirinha no cache deste navegador. Ao limpar os dados do site, será necessário importar o PDF novamente.</p>
          <p>Eu sou Caio de Azeredo e desenvolvi este aplicativo. <a href="https://github.com/CaioVAzeredo"
            target="_blank" rel="noopener noreferrer">Meu GitHub</a></p>
          <button className="primary" onClick={closeModal}>OK</button>
        </Dialog>
      )}
      {modal === 'remove' && (
        <Dialog title="Remover carteirinha" close={closeModal} busy={busy}>
          <h2>Remover carteirinha</h2>
          <p>Deseja remover a carteirinha salva neste dispositivo?</p>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="actions">
            <button autoFocus disabled={busy} onClick={closeModal}>Cancelar</button>
            <button className="danger" disabled={busy} onClick={onRemove}>{busy ? 'Removendo…' : 'Remover'}</button>
          </div>
        </Dialog>
      )}
    </>
  );
}
