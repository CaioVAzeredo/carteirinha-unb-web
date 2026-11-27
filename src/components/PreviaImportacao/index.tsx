import ImagemCarregavel from '../ImagemCarregavel';
import useImage from '../../useImage';
import './PreviaImportacao.css';

export default function PreviaImportacao({ foto, qrCode }: { foto: Blob; qrCode: Blob }) {
  const photo = useImage(foto);
  const qr = useImage(qrCode);

  return (
    <div className="media">
      <figure>
        <ImagemCarregavel className="preview-photo" src={photo} alt="Foto extraída do PDF" />
        <figcaption>Foto</figcaption>
      </figure>
      <figure>
        <ImagemCarregavel className="preview-qr" src={qr} alt="QR Code extraído do PDF" />
        <figcaption>QR Code</figcaption>
      </figure>
    </div>
  );
}
