import CarregamentoCarteirinha from './components/CarregamentoCarteirinha';
import { useCallback, useEffect, useRef, useState } from 'react';
import CabecalhoImportacao from './components/CabecalhoImportacao';
import Dialog from './components/Modal';
import NavegacaoInferior from './components/NavegacaoInferior';
import Notificacao from './components/Notificacao';
import OpcoesCarteirinha from './components/OpcoesCarteirinha';
import PaginaCarteirinha from './pages/Carteirinha';
import Importacao from './pages/Importacao';
import Revisao from './pages/Revisao';
import { changes, loadStoredCard, removeCard, saveCard } from './service/carteirinhaService';
import { chaves, type Campos, type Rascunho } from './types/carteirinha';
import './App.css';

type Modal = 'menu' | 'qr' | 'about' | 'remove' | 'repository' | 'install';

interface InstallPromptEvent extends Event {
  prompt(): Promise<unknown>;
}

export default function App() {
  const [stored, setStored] = useState<Awaited<ReturnType<typeof loadStoredCard>>>(null);
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [importing, setImporting] = useState(false);
  const [edicao, setEdicao] = useState<{ versao: string; criadaEm: string } | null>(null);
  const [draft, setDraft] = useState<Rascunho | null>(null);
  const [processing, setProcessing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<Modal | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [notificacao, setNotificacao] = useState('');
  const [installed, setInstalled] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true,
  );
  const installPrompt = useRef<InstallPromptEvent | null>(null);
  const fecharNotificacao = useCallback(() => setNotificacao(''), []);
  const inputPdf = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      installPrompt.current = event as InstallPromptEvent;
    };
    const handleInstalled = () => {
      installPrompt.current = null;
      setInstalled(true);
      setModal(current => current === 'install' ? null : current);
    };
    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  function installApp() {
    const prompt = installPrompt.current;
    if (!prompt) {
      setModal('install');
      return;
    }
    installPrompt.current = null;
    closeModal();
    void prompt.prompt().catch(() => setModal('install'));
  }

  function cancelImport() {
    attempt.current?.abort();
    attempt.current = null;
    setProcessing(false);
    setDraft(null);
    setEdicao(null);
    setImporting(false);
    setError('');
    setStatus('');
  }

  function escolherPdf() {
    if (!attempt.current) inputPdf.current?.click();
  }

  async function select(file: File) {
    if (attempt.current) return;
    const controller = new AbortController();
    attempt.current = controller;
    setImporting(true);
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

  function editarDados() {
    if (!card || attempt.current) return;
    closeModal();
    setStatus('');
    setEdicao({ versao: card.versao, criadaEm: card.criadaEm });
    setDraft({ ...card, validade: card.validade ?? '' });
  }

  async function save() {
    if (!draft || writing.current) return;
    writing.current = true;
    setBusy(true);
    setError('');
    try {
      const fields = Object.fromEntries(chaves.map(key => [key, draft[key].trim()])) as Campos;
      const saved = { ...draft, ...fields, criadaEm: edicao?.criadaEm ?? new Date().toISOString(), versao: crypto.randomUUID() };
      if (!await saveCard(saved, edicao?.versao)) {
        setError('A carteirinha mudou em outra aba. Cancele a edição e abra os dados atualizados.');
        return;
      }
      await refresh();
      setDraft(null);
      setEdicao(null);
      setImporting(false);
      setNotificacao(edicao ? 'Dados da carteirinha atualizados.' : 'Sua carteirinha foi salva com sucesso.');
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

  const mostrarNavegacao = screen === 'card' || screen === 'import';

  return (
    <main className={`app screen-${screen}${mostrarNavegacao ? ' com-navegacao' : ''}`}>
      <input ref={inputPdf} type="file" accept=".pdf,application/pdf" hidden onChange={event => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (file) void select(file);
      }} />
      {screen !== 'card' && <CabecalhoImportacao />}
      {screen === 'loading' && <CarregamentoCarteirinha />}
      {screen === 'error' && <div className="feedback"><p role="alert">Não foi possível acessar a carteirinha no cache do navegador.</p><button className="primary" onClick={() => void refresh()} data-focus>Tentar novamente</button></div>}
      {screen === 'import' && stored?.needsReimport && (
        <div className="feedback">
          <p>Importe o PDF novamente para atualizar a carteirinha salva no formato anterior.</p>
          <button className="primary" onClick={() => requestRemove(stored.version)}>Remover carteirinha antiga</button>
        </div>
      )}
      {screen === 'import' && (
        <Importacao processing={processing} hasCard={!!card} onPick={escolherPdf}
          cancelImport={cancelImport} />
      )}
      {screen === 'review' && draft && (
        <Revisao draft={draft} editando={!!edicao} busy={busy} onChange={setDraft} onSave={() => void save()} cancel={cancelImport} />
      )}
      {screen === 'card' && card && (
        <>
          <PaginaCarteirinha card={card} expanded={modal === 'qr'}
            openQr={() => setModal('qr')} closeQr={closeModal} />
        </>
      )}
      {(mostrarNavegacao || modal === 'remove') && (
        <OpcoesCarteirinha modal={modal === 'install' ? null : modal}
          busy={busy} error={error} closeModal={closeModal}
          onEdit={screen === 'card' && card ? editarDados : undefined}
          onRequestRemove={card && stored ? () => requestRemove(stored.version) : undefined}
          onAbout={() => setModal('about')} onRepository={() => setModal('repository')}
          onRemove={() => void remove()} onInstall={installed ? undefined : installApp} />
      )}
      {mostrarNavegacao && (
        <NavegacaoInferior tela={screen} menuAberto={modal === 'menu'} processando={processing}
          abrirCarteirinha={cancelImport} escolherPdf={escolherPdf} abrirOpcoes={() => setModal('menu')} />
      )}
      {modal === 'install' && (
        <Dialog title="Adicionar à tela inicial" close={closeModal}>
          <h2>Adicionar à tela inicial</h2>
          <p><strong>Android (Chrome)</strong><br />No menu do navegador, toque em <strong>Instalar e criar atalho</strong> ou <strong>Adicionar à tela inicial</strong>. Em seguida, escolha <strong>Instalar</strong>.</p>
          <p><strong>iPhone (Safari)</strong><br />Toque em <strong>Compartilhar</strong> e em <strong>Adicionar à Tela de Início</strong>. Se aparecer a opção <strong>Abrir como App da Web</strong>, ative-a e toque em <strong>Adicionar</strong>.</p>
          <p>Abra o ícone <strong>Identidade Estudantil</strong> na tela inicial para usar o app sem a barra do navegador.</p>
          <button className="primary" onClick={closeModal}>Fechar</button>
        </Dialog>
      )}
      {error && modal !== 'remove' && <p className="feedback error" role="alert">{error}</p>}
      {notificacao && (
        <Notificacao key={notificacao} mensagem={notificacao} fechar={fecharNotificacao} />
      )}
      <p className={status ? 'feedback notice' : 'sr-only'} role="status">{status}</p>
    </main>
  );
}
