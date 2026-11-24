import logoImportacao from '../../assets/img/logo-UnB-import-pdf.png';
import './CabecalhoImportacao.css';

export default function CabecalhoImportacao() {
  return (
    <header className="band import-band">
      <img src={logoImportacao} alt="Identidade Estudantil — Universidade de Brasília" />
    </header>
  );
}
