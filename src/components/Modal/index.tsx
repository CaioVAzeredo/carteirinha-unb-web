import { useEffect, useRef, type ReactNode } from 'react';
import './Modal.css';

export default function Modal({ title, className = '', children, close, busy, open = true }: {
  title: string; className?: string; children: ReactNode; close: () => void; busy?: boolean; open?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, [open]);

  return (
    <dialog ref={dialog} aria-label={title} className={className}
      onCancel={event => { event.preventDefault(); if (!busy) close(); }}
      onClick={event => { if (event.target === event.currentTarget && !busy) close(); }}>
      <div className="dialog-content">{children}</div>
    </dialog>
  );
}
