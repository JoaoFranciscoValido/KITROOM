import { productById } from '../data/catalogue';
import type { ArtKit } from '../components/KitArt';
import { SELLER_WHATSAPP } from '../config';
import { kitOf } from './constants';
import type { Customer, Line } from './store';

export interface KV { k: string; v: string }

export interface LineView {
  id: string;
  n: number;
  name: string;
  meta: string;
  productId: string | null;
  special: boolean;
  isShirt: boolean;
  kit: ArtKit;
  thumbView: 'front' | 'back';
  cname: string;
  cnum: string;
  qty: number;
  /** Rows shown on the cart line. */
  specs: KV[];
  /** First order message, sent with the shirt image: size, name, Nº number (empty ones are skipped). */
  first: string[];
  /** Second order message: everything else. */
  rest: KV[];
}

export function lineView(l: Line, idx: number): LineView {
  const sp = !!l.special;
  const p = sp ? null : productById[l.productId];
  const name = sp ? (l.title ? l.title + ' (special request)' : 'Special shirt request') : p!.name;
  const meta = sp ? 'Special request · customer photo' : p!.team + ' · ' + p!.season;
  const isShirt = sp || p!.type === 'Shirt';

  const specs: KV[] = [{ k: 'Size', v: l.size }];
  if (isShirt) specs.push({ k: 'Name', v: l.name || 'None' }, { k: 'Number', v: l.number || 'None' }, { k: 'Other', v: l.other || 'None' });

  const first = [l.size];
  if (l.name) first.push(l.name);
  if (l.number) first.push('Nº' + l.number);

  const rest: KV[] = [];
  if (sp) rest.push({ k: 'Type', v: 'Shirt not in catalogue (see photo)' });
  if (isShirt) rest.push({ k: 'Other customization', v: l.other || 'None' });
  rest.push({ k: 'Quantity', v: String(l.qty) });

  return {
    id: l.id, n: idx + 1, name, meta, productId: p ? p.id : null, special: sp, isShirt,
    kit: sp ? { image: l.image } : kitOf(p!),
    thumbView: !sp && isShirt && (l.name || l.number) ? 'back' : 'front',
    cname: l.name, cnum: l.number, qty: l.qty, specs, first, rest,
  };
}

export function customerRows(c: Customer): KV[] {
  const rows: KV[] = [{ k: 'Customer', v: c.name || '—' }, { k: 'Phone', v: c.phone || '—' }];
  if (c.email) rows.push({ k: 'Email', v: c.email });
  rows.push({ k: 'Preferred contact', v: c.contact }, { k: 'Additional notes', v: c.notes || 'None' });
  return rows;
}

export const formatDate = (d: Date) =>
  d.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const formatTime = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export function orderText(ref: string | null, dateLabel: string, lines: LineView[], cust: KV[]) {
  return [
    `*Order request ${ref || ''}*`,
    `Submitted: ${dateLabel}`,
    '',
    ...lines.map(l => `${l.n}. ${l.name}\n` + l.first.join('\n') + '\n' + l.rest.map(r => `${r.k}: ${r.v}`).join('\n')),
    '',
    ...cust.map(r => `${r.k}: ${r.v}`),
  ].join('\n');
}

export const whatsappHref = (text: string) => `https://wa.me/${SELLER_WHATSAPP}?text=${encodeURIComponent(text)}`;
