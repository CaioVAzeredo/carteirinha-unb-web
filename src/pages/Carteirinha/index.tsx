import CabecalhoCarteirinha from '../../components/CabecalhoCarteirinha';
import DadosCarteirinha from '../../components/DadosCarteirinha';
import RodapeCarteirinha from '../../components/RodapeCarteirinha';
import ValidacaoDigital from '../../components/ValidacaoDigital';
import type { Carteirinha } from '../../types/carteirinha';

export default function CarteirinhaPage({ card, openMenu, expanded, openQr, closeQr }: {
  card: Carteirinha; openMenu: () => void; expanded: boolean; openQr: () => void; closeQr: () => void;
}) {
  return (
    <>
      <CabecalhoCarteirinha nome={card.nome} foto={card.foto} openMenu={openMenu} />
      <DadosCarteirinha dados={card} />
      <ValidacaoDigital qrCode={card.qrCode} validade={card.validade} expanded={expanded} open={openQr} close={closeQr} />
      <RodapeCarteirinha />
    </>
  );
}
