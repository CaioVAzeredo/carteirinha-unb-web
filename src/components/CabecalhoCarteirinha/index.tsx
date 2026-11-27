import ImagemCarregavel from '../ImagemCarregavel';
import { ellipsisVertical } from 'ionicons/icons';
import Icone from '../Icone';
import useImage from '../../useImage';
import './CabecalhoCarteirinha.css';

export default function CabecalhoCarteirinha({ nome, foto, openMenu }: {
  nome: string;
  foto: Blob;
  openMenu: () => void;
}) {
  const photo = useImage(foto);
  return (
    <header className="band card-band">
      <button className="menu-trigger" aria-label="Opções da carteirinha" onClick={openMenu}>
        <Icone src={ellipsisVertical} />
      </button>
      <div className="student">
        <ImagemCarregavel className="foto-estudante" src={photo} alt="Foto do estudante" />
        <div>
          <h1 tabIndex={-1} data-focus>{nome}</h1>
          <p>DISCENTE</p>
        </div>
      </div>
    </header>
  );
}
