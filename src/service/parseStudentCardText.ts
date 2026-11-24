import type { DadosExtraidos } from '../types/carteirinha';

const REGEX_CPF = /(?:CPF\s*:?\s*)?(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i;
const CARACTERES_INVISIVEIS = /[\u200B-\u200D\uFEFF\u00AD]/g;
const NIVEIS_CONHECIDOS = [
  'GRADUACAO',
  'POS-GRADUACAO',
  'MESTRADO',
  'DOUTORADO',
];

export function parseStudentCardText(textoCompleto: string): DadosExtraidos {
  const linhas = obterLinhasValidas(textoCompleto);
  const cpf = obterCpf(linhas);
  const matricula = obterMatricula(linhas, cpf);
  const nivel = obterNivel(linhas, cpf);
  const nome = obterNome(linhas, nivel);
  const curso = obterCurso(linhas, nome);
  const validade = obterValidade(linhas);


  return {
    matricula,
    cpf,
    nivel,
    nome,
    curso,
    validade,
  };
}

function obterLinhasValidas(textoCompleto: string): string[] {
  return textoCompleto
    .replace(CARACTERES_INVISIVEIS, '')
    .replace(/\u00A0/g, ' ')
    .split(/\r?\n/)
    .map((linha: string): string => linha.replace(/\s+/g, ' ').trim())
    .filter((linha: string): boolean => linha.length > 0);
}

function obterMatricula(linhas: string[], cpf: string): string {
  const linhaComRotulo = linhas.find((linha: string): boolean =>
    normalizarTextoParaComparacao(linha).startsWith('MATRICULA')
  );

  if (linhaComRotulo !== undefined) {
    const digitos = apenasDigitos(linhaComRotulo);

    if (digitos.length >= 9) {
      return digitos.slice(0, 9);
    }
  }

  const indiceCpf = obterIndiceCpf(linhas, cpf);
  const linhasAntesDoCpf = indiceCpf > 0 ? linhas.slice(0, indiceCpf) : [];
  const digitosAntesDoCpf = linhasAntesDoCpf
    .map((linha: string): string => apenasDigitos(linha))
    .join('');

  if (digitosAntesDoCpf.length >= 9) {
    return digitosAntesDoCpf.slice(0, 9);
  }

  const linhaSomenteMatricula = linhas.find((linha: string): boolean =>
    apenasDigitos(linha).length === 9 &&
    REGEX_CPF.test(linha) === false &&
    normalizarTextoParaComparacao(linha).includes('VALIDADE') === false
  );

  if (linhaSomenteMatricula !== undefined) {
    return apenasDigitos(linhaSomenteMatricula);
  }

  const linhaComMatriculaSolta = linhas.find((linha: string): boolean => {
    const textoNormalizado = normalizarTextoParaComparacao(linha);
    const digitos = apenasDigitos(linha);

    return digitos.length >= 9 &&
      REGEX_CPF.test(linha) === false &&
      textoNormalizado.includes('VALIDADE') === false;
  });

  if (linhaComMatriculaSolta !== undefined) {
    return apenasDigitos(linhaComMatriculaSolta).slice(0, 9);
  }

  return '';
}

function obterCpf(linhas: string[]): string {
  const linhaCpf = linhas.find((linha: string): boolean => REGEX_CPF.test(linha));

  if (linhaCpf === undefined) {
    return '';
  }

  const resultado = linhaCpf.match(REGEX_CPF);

  if (resultado === null) {
    return '';
  }

  return resultado[1];
}

function obterNivel(linhas: string[], cpf: string): string {
  const indiceCpf = obterIndiceCpf(linhas, cpf);

  if (indiceCpf < 0) {
    return '';
  }

  const nivel = linhas.slice(indiceCpf + 1).find((linha: string): boolean =>
    obterNivelDaLinha(linha) !== null
  );

  if (nivel === undefined) {
    return '';
  }

  const nivelExtraido = obterNivelDaLinha(nivel);

  if (nivelExtraido === null) {
    return '';
  }

  return nivelExtraido;
}

function obterIndiceCpf(linhas: string[], cpf: string): number {
  return linhas.findIndex((linha: string): boolean =>
    REGEX_CPF.test(linha) && apenasDigitos(linha).includes(apenasDigitos(cpf))
  );
}

function obterNome(linhas: string[], nivel: string): string {
  const indiceNivel = linhas.findIndex((linha: string): boolean =>
    obterNivelDaLinha(linha) === nivel
  );

  if (indiceNivel < 0) {
    return '';
  }

  const nome = linhas.slice(indiceNivel + 1).find((linha: string): boolean =>
    ehLinhaValorAluno(linha)
  );

  if (nome === undefined) {
    return '';
  }

  return removerRotuloPorComparacao(nome, ['NOME']);
}

function obterCurso(linhas: string[], nome: string): string {
  const indiceNome = linhas.findIndex((linha: string): boolean =>
    removerRotuloPorComparacao(linha, ['NOME']) === nome
  );

  if (indiceNome < 0) {
    return '';
  }

  const curso = linhas.slice(indiceNome + 1).find((linha: string): boolean =>
    ehLinhaCurso(linha)
  );

  if (curso === undefined) {
    return '';
  }

  return removerRotuloPorComparacao(curso, ['CURSO']);
}

function obterValidade(linhas: string[]): string | null {
  const indiceLinhaValidade = linhas.findIndex((linha: string): boolean =>
    normalizarTextoParaComparacao(linha).startsWith('VALIDADE')
  );

  if (indiceLinhaValidade < 0) {
    return null;
  }

  const validadeNaLinha = linhas[indiceLinhaValidade].replace(/^VALIDADE\s*:?\s*/i, '').trim();

  if (validadeNaLinha) return validadeNaLinha;

  const proximaLinha = linhas[indiceLinhaValidade + 1];

  if (proximaLinha === undefined || proximaLinha.length === 0) {
    return null;
  }

  return proximaLinha;
}

function obterNivelDaLinha(linha: string): string | null {
  const linhaSemRotulo = removerRotuloPorComparacao(linha, ['NIVEL']);
  const linhaNormalizada = normalizarTextoParaComparacao(linhaSemRotulo);
  const encontrouNivel = NIVEIS_CONHECIDOS.includes(linhaNormalizada);

  if (encontrouNivel === false) {
    return null;
  }

  return linhaSemRotulo;
}

function ehLinhaCurso(linha: string): boolean {
  const linhaNormalizada = normalizarTextoParaComparacao(linha);
  const linhaSemRotulo = removerRotuloPorComparacao(linha, ['CURSO']);

  if (linhaSemRotulo.length === 0) {
    return false;
  }

  if (linhaNormalizada.includes('SECRETARIO')) {
    return false;
  }

  if (linhaNormalizada.includes('SAA/UNB')) {
    return false;
  }

  if (linhaNormalizada.startsWith('VALIDADE')) {
    return false;
  }

  return ehTextoMaiusculo(linhaSemRotulo);
}

function ehLinhaValorAluno(linha: string): boolean {
  const linhaNormalizada = normalizarTextoParaComparacao(linha);

  if (linhaNormalizada.startsWith('CURSO')) {
    return false;
  }

  if (linhaNormalizada.startsWith('VALIDADE')) {
    return false;
  }

  if (linhaNormalizada.includes('SECRET')) {
    return false;
  }

  return ehTextoMaiusculo(removerRotuloPorComparacao(linha, ['NOME']));
}

function ehTextoMaiusculo(texto: string): boolean {
  const possuiLetra = /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(texto);

  if (possuiLetra === false) {
    return false;
  }

  return texto === texto.toUpperCase();
}

function removerRotuloPorComparacao(linha: string, rotulos: string[]): string {
  const partes = linha.trim().split(/\s+/);
  const primeiraParte = partes[0]?.replace(/:$/, '') ?? '';
  const primeiraParteNormalizada = normalizarTextoParaComparacao(primeiraParte);

  if (rotulos.includes(primeiraParteNormalizada) === false) {
    return linha.trim();
  }

  return partes.slice(1).join(' ').replace(/^:\s*/, '').trim();
}

function normalizarTextoParaComparacao(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function apenasDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}
