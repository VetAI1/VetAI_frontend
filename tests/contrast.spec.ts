import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = ['/', '/login', '/register', '/forgot-password'];
const themes = ['light', 'dark'] as const;

for (const theme of themes) {
  for (const route of routes) {
    test(`has no color contrast violations on ${route} in ${theme} mode`, async ({ page }) => {
      await page.goto(route);
      await page.evaluate((initialTheme) => {
        localStorage.setItem('vetai_theme', initialTheme);
        document.documentElement.classList.toggle('dark', initialTheme === 'dark');
      }, theme);
      await expect(page.locator('html')).toHaveClass(
        theme === 'dark' ? /dark/ : /^(?!.*dark).*$/,
      );

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      const contrastViolations = results.violations.filter(
        ({ id }) => id === 'color-contrast',
      );

      expect(contrastViolations).toEqual([]);
    });
  }
}
