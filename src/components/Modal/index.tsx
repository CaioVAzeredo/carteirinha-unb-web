import { useEffect, useRef, type ReactNode } from 'react';
import './Modal.css';

export default function Modal({ title, className = '', children, close, busy }: {
  title: string; className?: string; children: ReactNode; close: () => void; busy?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);

  return (
    <dialog ref={dialog} aria-label={title} className={className}
      onCancel={event => { event.preventDefault(); if (!busy) close(); }}
      onClick={event => { if (event.target === event.currentTarget && !busy) close(); }}>
      <div className="dialog-content">{children}</div>
    </dialog>
  );
}
