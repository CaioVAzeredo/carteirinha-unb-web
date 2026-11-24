export type RegiaoPdfEmPontos = {
  origemX: number;
  origemY: number;
  largura: number;
  altura: number;
};

export const LARGURA_PAGINA_CARTEIRINHA_PDF = 240;

export const REGIAO_FOTO_ESTUDANTE: RegiaoPdfEmPontos = {
  origemX: 171,
  origemY: 47,
  largura: 41,
  altura: 53,
};

export const REGIAO_QRCODE: RegiaoPdfEmPontos = {
  origemX: 70,
  origemY: 168,
  largura: 100,
  altura: 96,
};
