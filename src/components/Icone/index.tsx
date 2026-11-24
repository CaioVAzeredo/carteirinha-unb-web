import './Icone.css';

export default function Icone({ src }: { src: string }) {
  return <span className="icon" aria-hidden="true" style={{ maskImage: `url("${src}")` }} />;
}
