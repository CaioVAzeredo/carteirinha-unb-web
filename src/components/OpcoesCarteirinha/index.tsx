import {
  documentAttachOutline as iconImport,
  trashOutline as iconTrash,
  informationCircle as iconInfo,
  close as iconClose,
} from 'ionicons/icons';
import Icon from '../Icone';
import Dialog from '../Modal';
import './OpcoesCarteirinha.css';

export default function OpcoesCarteirinha({
  modal, busy, error, closeModal, onImport, onRequestRemove, onAbout, onRemove,
}: {
  modal: 'menu' | 'about' | 'remove' | 'qr' | null;
  busy: boolean;
  error: string;
  closeModal: () => void;
  onImport: () => void;
  onRequestRemove: () => void;
  onAbout: () => void;
  onRemove: () => void;
}) {
  return (
    <>
      {modal === 'menu' && (
        <Dialog title="Carteirinha" className="menu-dialog" close={closeModal}>
          <div className="handle" aria-hidden="true" />
          <h2>Carteirinha</h2>
          <button onClick={onImport}><Icon src={iconImport} />Importar novo PDF</button>
          <button onClick={onRequestRemove}><Icon src={iconTrash} />Remover carteirinha</button>
          <button onClick={onAbout}><Icon src={iconInfo} />Sobre o aplicativo</button>
          <button onClick={closeModal}><Icon src={iconClose} />Cancelar</button>
        </Dialog>
      )}
      {modal === 'about' && (
        <Dialog title="Sobre o aplicativo" close={closeModal}>
          <h2>Sobre o aplicativo</h2>
          <p>Identidade Estudantil processa o PDF e armazena a carteirinha no cache deste navegador. Ao limpar os dados do site, será necessário importar o PDF novamente.</p>
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
