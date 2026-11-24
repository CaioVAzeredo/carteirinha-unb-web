export type Campos = {
  nome: string;
  matricula: string;
  cpf: string;
  nivel: string;
  curso: string;
  validade: string;
};

export type DadosExtraidos = Omit<Campos, 'validade'> & { validade: string | null };

export type Midia = { foto: Blob; qrCode: Blob };
export type Rascunho = Campos & Midia;
export type Carteirinha = DadosExtraidos & Midia & { versao: string; criadaEm: string };

export const campos = {
  nome: 'Nome',
  matricula: 'Matrícula',
  cpf: 'CPF',
  nivel: 'Nível',
  curso: 'Curso',
  validade: 'Validade',
} satisfies Record<keyof Campos, string>;

export const chaves = Object.keys(campos) as (keyof Campos)[];

export function validarCampo(campo: keyof Campos, valor: string): string | undefined {
  const texto = valor.trim();
  if (!texto) return 'Preencha este campo.';
  if (campo === 'matricula' && !/^\d{9}$/.test(texto)) return 'Informe 9 dígitos.';
  if (campo === 'cpf' && !/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(texto)) {
    return 'Informe 11 dígitos, com ou sem pontuação.';
  }
}
