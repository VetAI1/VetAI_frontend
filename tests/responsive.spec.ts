import { expect, test, type Page } from '@playwright/test';

/**
 * Auditoria de responsividade: abre todas as telas em viewports de celular e
 * falha se a página produzir rolagem horizontal ou se algum elemento
 * ultrapassar a largura da tela.
 *
 * A API é interceptada (a sessão e as listagens são simuladas), de modo que o
 * teste avalia o layout e não depende de backend nem de credenciais reais.
 */

const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'mobile-390', width: 390, height: 844 },
];

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password'];

const PRIVATE_ROUTES = [
  '/analytics/dashboard',
  '/patients',
  '/tutors',
  '/schedule',
  '/monitoring',
  '/vaccines',
  '/medicines',
  '/exams',
  '/consultation',
  '/payments',
  '/catalog',
  '/settings',
  '/profile',
  '/admin/dashboard',
  '/admin/collaborators',
  '/admin/roles',
  '/admin/settings',
  '/admin/subscription',
];

/**
 * Telas de detalhe. Com a API simulada elas caem no estado "não encontrado",
 * o que ainda exercita o cabeçalho, as abas e o esqueleto da página.
 */
const DETAIL_ROUTES = [
  '/patients/demo-id',
  '/tutors/demo-id',
  '/exams/demo-id',
  '/exams/demo-id/prevention',
  '/monitoring/demo-id',
  '/admin/roles/demo-id',
  '/admin/subscription/buy-credits',
];

const USER = {
  id: 'u1',
  name: 'Usuário Teste',
  email: 'teste@vetai.com',
  permissions: ['*'],
  hospital_id: 'h1',
  account: {
    subscription: { status: 'active', blocked: false },
    ai: { available_credits: 1000 },
  },
};

const EMPTY_PAGE = {
  data: [],
  meta: { last: true, first: true, total_elements: 0, total_pages: 1, page: 1, size: 10 },
};

async function stubApi(page: Page) {
  await page.route('**/auth/refresh', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'fake-token', user: USER }),
    }),
  );
  // Qualquer outra chamada à API responde vazio, para as telas renderizarem
  // seus estados vazios em vez de ficarem presas em carregamento.
  await page.route('**/localhost:8080/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(EMPTY_PAGE),
    }),
  );
}

async function seedSession(page: Page) {
  await page.addInitScript((user) => {
    localStorage.setItem('vetai_token', 'fake-token');
    localStorage.setItem('vetai_user', JSON.stringify(user));
  }, USER);
}

/** Elementos que transbordam a largura do viewport. */
async function findOverflow(page: Page) {
  return page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const offenders: { tag: string; cls: string; width: number; right: number }[] = [];
    document.querySelectorAll<HTMLElement>('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      const style = getComputedStyle(el);
      if (style.position === 'fixed') return; // overlays/menus são posicionados à parte
      // tolerância de 1px para arredondamento de subpixel
      if (r.right > docWidth + 1 || r.width > docWidth + 1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 120),
          width: Math.round(r.width),
          right: Math.round(r.right),
        });
      }
    });
    return {
      docScrollWidth: document.documentElement.scrollWidth,
      docClientWidth: docWidth,
      offenders: offenders.slice(0, 5),
    };
  });
}

for (const vp of VIEWPORTS) {
  for (const route of [...PUBLIC_ROUTES, ...PRIVATE_ROUTES, ...DETAIL_ROUTES]) {
    const isPrivate = !PUBLIC_ROUTES.includes(route);

    test(`[${vp.name}] ${route} não tem rolagem horizontal`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await stubApi(page);
      if (isPrivate) await seedSession(page);

      // `networkidle` não é confiável aqui: o app mantém um socket aberto.
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const result = await findOverflow(page);

      expect(
        result.docScrollWidth,
        `${route} rola horizontalmente (${result.docScrollWidth}px > ${result.docClientWidth}px). ` +
          `Elementos: ${JSON.stringify(result.offenders)}`,
      ).toBeLessThanOrEqual(result.docClientWidth + 1);
    });
  }
}
