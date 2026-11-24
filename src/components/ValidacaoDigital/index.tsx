import Modal from '../Modal';
import useImage from '../../useImage';
import './ValidacaoDigital.css';

export default function ValidacaoDigital({ qrCode, validade, expanded, open, close }: {
  qrCode: Blob; validade: string | null;
  expanded: boolean; open: () => void; close: () => void;
}) {
  const qr = useImage(qrCode);
  return (
    <>
      <button className="validation panel" onClick={open} aria-label="Validação digital, ampliar QR Code">
        <strong>VALIDAÇÃO DIGITAL</strong>
        <img src={qr} alt="QR Code da carteirinha" />
        <span className="validity">VALIDADE <span>{validade ?? 'Validade não informada'}</span></span>
      </button>
      {expanded && (
        <Modal title="QR Code ampliado" className="qr-dialog" close={close}>
          <button onClick={close} aria-label="Fechar QR Code ampliado"><img src={qr} alt="QR Code ampliado" /></button>
        </Modal>
      )}
    </>
  );
}
