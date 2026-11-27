import { useState } from 'react';
import Skeleton from '../Skeleton';
import './ImagemCarregavel.css';

export default function ImagemCarregavel({ src, alt, className }: {
  src?: string;
  alt: string;
  className: string;
}) {
  const [resolvedSrc, setResolvedSrc] = useState<string>();
  const loading = !src || resolvedSrc !== src;

  return (
    <span className={`imagem-carregavel ${className}`}>
      {loading && <Skeleton className="imagem-placeholder" />}
      {src && (
        <img src={src} alt={alt} className={loading ? 'imagem-pendente' : undefined}
          onLoad={() => setResolvedSrc(src)} onError={() => setResolvedSrc(src)} />
      )}
    </span>
  );
}
