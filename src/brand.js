/* ==========================================================================
   Camacho — Configuração de marca
   --------------------------------------------------------------------------
   O nome da marca mora AQUI, num lugar só. As páginas declaram encaixes
   (`data-brand="name"`) e este módulo os preenche. Trocar o nome do negócio
   passa a ser trocar uma linha, não caçar strings em três arquivos.

   Para experimentar sem editar nada: ?brand=Camacho na URL.
   ========================================================================== */

export const BRAND = {
  name: 'Camacho',
  version: '1.0.0',
  domain: 'camacho.ai',
  person: 'Leonardo Camacho',
  role: 'Consultor',
  /* Placeholder explícito: o telefone real ainda não foi definido. Trocar
     antes de qualquer peça impressa — ver Pendências no README. */
  phone: '+55 11 90000-0000',
};

/** Deriva domínio e e-mail de um nome novo, mantendo o resto. */
export function deriveBrand(name, base = BRAND) {
  const slug = name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
  return { ...base, name, domain: `${slug}.ai` };
}

/**
 * O símbolo é uma LETRA, e é o único ponto do sistema que depende do nome.
 * Todo o resto — motor, paleta, tipografia, grade — é indiferente a ele.
 */
export const markFitsName = (name) => name.trim().toUpperCase().startsWith('C');

/**
 * Preenche os encaixes de marca do documento.
 *   data-brand="name" | "domain" | "person" | "role" | "phone"
 *   data-brand="email"          → person em minúsculas @ domínio
 *   data-brand-canvas           → redesenha o wordmark ditherizado
 */
export function applyBrand(root = document, brand = BRAND) {
  const email = `${brand.person.split(' ')[0].toLowerCase()}@${brand.domain}`;
  const values = { ...brand, email };

  root.querySelectorAll('[data-brand]').forEach((el) => {
    const value = values[el.dataset.brand];
    if (value != null) el.textContent = value;
  });

  /* Canvas que compõem o próprio nome em partículas */
  root.querySelectorAll('canvas[data-brand-canvas]').forEach((el) => {
    const opts = el.dataset.opts ? JSON.parse(el.dataset.opts) : {};
    el.dataset.opts = JSON.stringify({ ...opts, text: brand.name });
    delete el.dataset.cmcDone;
  });

  return values;
}

/** Lê ?brand= da URL, se houver. */
export function brandFromUrl(fallback = BRAND) {
  const param = new URLSearchParams(location.search).get('brand');
  return param ? deriveBrand(param.trim(), fallback) : fallback;
}
