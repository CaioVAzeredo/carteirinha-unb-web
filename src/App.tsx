import { useCallback, useEffect, useRef, useState } from 'react';
import CabecalhoImportacao from './components/CabecalhoImportacao';
import Notificacao from './components/Notificacao';
import OpcoesCarteirinha from './components/OpcoesCarteirinha';
import PaginaCarteirinha from './pages/Carteirinha';
import Importacao from './pages/Importacao';
import Revisao from './pages/Revisao';
import { changes, loadStoredCard, removeCard, saveCard } from './service/carteirinhaService';
import { chaves, type Campos, type Rascunho } from './types/carteirinha';
import './App.css';

type Modal = 'menu' | 'qr' | 'about' | 'remove';

export default function App() {
  const [stored, setStored] = useState<Awaited<ReturnType<typeof loadStoredCard>>>(null);
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [importing, setImporting] = useState(false);
  const [draft, setDraft] = useState<Rascunho | null>(null);
  const [processing, setProcessing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<Modal | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [notificacao, setNotificacao] = useState('');
  const fecharNotificacao = useCallback(() => setNotificacao(''), []);
  const attempt = useRef<AbortController | null>(null);
  const writing = useRef(false);
  const versionToRemove = useRef<string | null>(null);
  const revision = useRef(0);
  const storedVersion = useRef<string | undefined>(undefined);

  async function refresh() {
    const current = ++revision.current;
    try {
      const stored = await loadStoredCard();
      if (current !== revision.current) return;
      setStored(stored);
      if (storedVersion.current !== stored?.version) {
        setModal(modal => stored && modal === 'remove' ? modal : null);
        storedVersion.current = stored?.version;
      }
      setLoadFailed(false);
    } catch {
      if (current !== revision.current) return;
      setLoadFailed(true);
    } finally {
      if (current === revision.current) setReady(true);
    }
  }

  useEffect(() => {
    void refresh();
    const update = () => { void refresh(); };
    changes?.addEventListener('message', update);
    window.addEventListener('focus', update);
    return () => {
      revision.current++;
      attempt.current?.abort();
      changes?.removeEventListener('message', update);
      window.removeEventListener('focus', update);
    };
  }, []);

  const card = stored?.card;
  const screen = !ready ? 'loading' : loadFailed ? 'error' : draft ? 'review' : importing || !stored || stored.needsReimport ? 'import' : 'card';
  useEffect(() => { document.querySelector<HTMLElement>('[data-focus]')?.focus(); }, [screen]);

  function cancelImport() {
    attempt.current?.abort();
    attempt.current = null;
    setProcessing(false);
    setDraft(null);
    setImporting(false);
    setError('');
    setStatus('');
  }

  async function select(file: File) {
    if (attempt.current) return;
    const controller = new AbortController();
    attempt.current = controller;
    setProcessing(true);
    setError('');
    setStatus('');
    try {
      const { PdfError, processPdf } = await import('./service/pdfService');
      const data = await processPdf(file, controller.signal).catch(error => {
        if (error instanceof PdfError && attempt.current === controller) setError(error.message);
        if (error instanceof PdfError || controller.signal.aborted) return null;
        throw error;
      });
      if (data && attempt.current === controller) setDraft(data);
    } catch {
      if (attempt.current === controller) setError('Não foi possível processar o PDF. Tente novamente.');
    } finally {
      if (attempt.current === controller) {
        attempt.current = null;
        setProcessing(false);
      }
    }
  }

  async function save() {
    if (!draft || writing.current) return;
    writing.current = true;
    setBusy(true);
    setError('');
    try {
      const fields = Object.fromEntries(chaves.map(key => [key, draft[key].trim()])) as Campos;
      const saved = { ...draft, ...fields, criadaEm: new Date().toISOString(), versao: crypto.randomUUID() };
      await saveCard(saved);
      await refresh();
      setDraft(null);
      setImporting(false);
      setNotificacao('Sua carteirinha foi salva com sucesso.');
    } catch {
      setError('Não foi possível salvar a carteirinha no navegador. Tente novamente.');
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }

  function requestRemove(version: string) {
    versionToRemove.current = version;
    setError('');
    setModal('remove');
  }

  async function remove() {
    const version = versionToRemove.current;
    if (!version || writing.current) return;
    writing.current = true;
    setBusy(true);
    setError('');
    try {
      const removed = await removeCard(version);
      await refresh();
      setModal(null);
      if (removed) setNotificacao('Carteirinha removida.');
      else setStatus('A carteirinha foi atualizada em outra aba. Confira os dados antes de remover.');
    } catch {
      setError('Não foi possível remover a carteirinha. Tente novamente.');
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }

  function closeModal() { setModal(null); setError(''); }

  return (
    <main className={`app screen-${screen}`}>
      {screen !== 'card' && <CabecalhoImportacao />}
      {screen === 'loading' && <p className="feedback" role="status">Carregando carteirinha…</p>}
      {screen === 'error' && <div className="feedback"><p role="alert">Não foi possível acessar a carteirinha no cache do navegador.</p><button className="primary" onClick={() => void refresh()} data-focus>Tentar novamente</button></div>}
      {screen === 'import' && stored?.needsReimport && (
        <div className="feedback">
          <p>Importe o PDF novamente para atualizar a carteirinha salva no formato anterior.</p>
          <button className="primary" onClick={() => requestRemove(stored.version)}>Remover carteirinha antiga</button>
        </div>
      )}
      {screen === 'import' && (
        <Importacao processing={processing} hasCard={!!card} onSelect={file => void select(file)} cancelImport={cancelImport} />
      )}
      {screen === 'review' && draft && (
        <Revisao draft={draft} busy={busy} onChange={setDraft} onSave={() => void save()} cancel={cancelImport} />
      )}
      {screen === 'card' && card && (
        <>
          <PaginaCarteirinha card={card} openMenu={() => setModal('menu')} expanded={modal === 'qr'}
            openQr={() => setModal('qr')} closeQr={closeModal} />
        </>
      )}
      {stored && (screen === 'card' || modal === 'remove') && (
        <OpcoesCarteirinha modal={modal}
          busy={busy} error={error} closeModal={closeModal}
          onImport={() => { closeModal(); setImporting(true); setStatus(''); }}
          onRequestRemove={() => requestRemove(stored.version)}
          onAbout={() => setModal('about')} onRemove={() => void remove()} />
      )}
      {error && modal !== 'remove' && <p className="feedback error" role="alert">{error}</p>}
      {notificacao && (
        <Notificacao key={notificacao} mensagem={notificacao} fechar={fecharNotificacao} />
      )}
      <p className={status ? 'feedback notice' : 'sr-only'} role="status">{status}</p>
    </main>
  );
}
