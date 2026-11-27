import { useState, type FormEvent } from 'react';
import { campos, chaves, validarCampo, type Rascunho } from '../../types/carteirinha';
import CampoRevisao from '../../components/CampoRevisao';
import PreviaImportacao from '../../components/PreviaImportacao';
import './Revisao.css';

export default function Revisao({ draft, editando, busy, onChange, onSave, cancel }: {
  draft: Rascunho; editando: boolean; busy: boolean; onChange: (draft: Rascunho) => void;
  onSave: () => void; cancel: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [missing] = useState(() => chaves.filter(key => !draft[key].trim()).map(key => campos[key]));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const invalid = chaves.find(key => validarCampo(key, draft[key]));
    if (invalid) {
      document.getElementById(invalid)?.focus();
      return;
    }
    onSave();
  }

  return (
    <form className="review" onSubmit={submit} autoComplete="off">
      <h1 tabIndex={-1} data-focus>{editando ? 'Editar dados da carteirinha' : 'Revise os dados'}</h1>
      <PreviaImportacao foto={draft.foto} qrCode={draft.qrCode} />
      {!editando && missing.length > 0 && <p className="notice">Preencha os campos que o PDF não forneceu: {missing.join(', ')}.</p>}
      <fieldset disabled={busy}>
        {chaves.map(key => (
          <CampoRevisao
            key={key}
            id={key}
            label={campos[key]}
            value={draft[key]}
            error={submitted ? validarCampo(key, draft[key]) : undefined}
            inputMode={key === 'matricula' ? 'numeric' : undefined}
            onChange={value => onChange({ ...draft, [key]: value })}
          />
        ))}
        <div className="actions">
          <button type="button" onClick={cancel}>× &nbsp; Cancelar</button>
          <button className="primary" type="submit">{busy ? 'Salvando…' : editando ? 'Salvar alterações' : '✓  Confirmar'}</button>
        </div>
      </fieldset>
    </form>
  );
}
