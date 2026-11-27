import ImagemCarregavel from '../ImagemCarregavel';
import useImage from '../../useImage';
import './CabecalhoCarteirinha.css';

export default function CabecalhoCarteirinha({ nome, foto }: {
  nome: string;
  foto: Blob;
}) {
  const photo = useImage(foto);
  return (
    <header className="band card-band">
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
