import logoUnb from '../../assets/img/logo-UnB.png';
import assinatura from '../../assets/img/assinatura.png';
import './RodapeCarteirinha.css';

export default function RodapeCarteirinha() {
  return (
    <footer className="card-footer">
      <img src={logoUnb} alt="Universidade de Brasília" />
      <img src={assinatura} alt="Assinatura da Secretaria de Administração Acadêmica" />
    </footer>
  );
}
