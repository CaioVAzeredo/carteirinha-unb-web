import { createElement } from 'react';
import { defineCustomElement } from 'ionicons/components/ion-icon.js';
import './Icone.css';

defineCustomElement();

export default function Icone({ src }: { src: string }) {
  return createElement('ion-icon', { src, class: 'icon', 'aria-hidden': 'true' });
}
