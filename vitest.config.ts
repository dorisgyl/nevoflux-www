import { getViteConfig } from 'astro/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default getViteConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/vitest.setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx,astro}'],
      exclude: ['src/tests/**', 'src/env.d.ts'],
    },
  },
});
