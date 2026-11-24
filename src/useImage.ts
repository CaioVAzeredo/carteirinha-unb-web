import { useEffect, useState } from 'react';

export default function useImage(blob: Blob) {
  const [image, setImage] = useState<{ blob: Blob; url: string }>();
  useEffect(() => {
    const url = URL.createObjectURL(blob);
    setImage({ blob, url });
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  return image?.blob === blob ? image.url : undefined;
}
