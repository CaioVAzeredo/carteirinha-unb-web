import { shieldCheckmarkOutline } from 'ionicons/icons';
import Icone from '../Icone';
import './AvisoPrivacidade.css';

export default function AvisoPrivacidade() {
  return (
    <aside className="security">
      <span className="shield"><Icone src={shieldCheckmarkOutline} /></span>
      <div>
        <strong>Seus dados estão seguros</strong>
        <p>Todo o processamento é feito localmente no seu dispositivo.</p>
      </div>
    </aside>
  );
}
