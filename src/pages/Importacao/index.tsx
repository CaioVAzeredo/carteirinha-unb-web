import { addCircleOutline, arrowBack, close } from 'ionicons/icons';
import AvisoPrivacidade from '../../components/AvisoPrivacidade';
import Icone from '../../components/Icone';
import SeletorPdf from '../../components/SeletorPdf';
import iconePdf from '../../assets/img/icone-pdf.png';
import './Importacao.css';

export default function Importacao({ processing, hasCard, onSelect, cancelImport, onInstall }: {
  processing: boolean;
  hasCard: boolean;
  onSelect: (file: File) => void;
  cancelImport: () => void;
  onInstall?: () => void;
}) {
  return (
    <section className="import-content">
      <img className="pdf-icon" src={iconePdf} alt="" />
      <h1 tabIndex={-1} data-focus>Importe sua carteirinha digital em PDF</h1>
      <p className="import-description">Selecione o arquivo PDF da sua carteirinha da UnB para extrair suas informações.</p>
      <SeletorPdf processing={processing} onSelect={onSelect} />
      {(hasCard || processing) && (
        <button className="import-return" type="button" onClick={cancelImport}>
          <Icone src={processing ? close : arrowBack} />
          <span>{processing ? 'Cancelar importação' : 'Voltar para a carteirinha'}</span>
        </button>
      )}
      <AvisoPrivacidade />
      {onInstall && (
        <button className="import-return install-option" type="button" onClick={onInstall}>
          <Icone src={addCircleOutline} />
          Adicionar à tela inicial
        </button>
      )}
    </section>
  );
}
