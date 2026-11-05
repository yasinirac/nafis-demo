import type { Config } from 'tailwindcss';

// Every colour maps to a CSS variable defined in src/styles/tokens.css,
// so the tokens file stays the single source of truth.
const v = (name: string) => `var(--${name})`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: v('ground'),
        surface: v('surface'),
        ink: v('ink'),
        ink2: v('ink-2'),
        muted: v('muted'),
        line: v('line'),
        line2: v('line-2'),
        control: v('control'),
        accent: {
          DEFAULT: v('accent'),
          tint: v('accent-tint'),
          hover: v('accent-hover'),
        },
        warn: {
          text: v('warn-text'),
          bg: v('warn-bg'),
          bar: v('warn-bar'),
        },
        crit: {
          text: v('crit-text'),
          bg: v('crit-bg'),
        },
        good: {
          icon: v('good-icon'),
          bg: v('good-bg'),
        },
        series: {
          1: v('series-1'),
          2: v('series-2'),
          3: v('series-3'),
          muted: v('series-muted'),
        },
        seq: {
          1: v('seq-1'),
          2: v('seq-2'),
          3: v('seq-3'),
          4: v('seq-4'),
          5: v('seq-5'),
        },
        ord: {
          1: v('ord-1'),
          2: v('ord-2'),
          3: v('ord-3'),
          4: v('ord-4'),
        },
        code: {
          bg: v('code-bg'),
          ink: v('code-ink'),
          muted: v('code-muted'),
        },
      },
      fontFamily: {
        sans: ['Roboto', '"Noto Kufi Arabic"', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'Alexandria', 'system-ui', 'sans-serif'],
        arabic: ['"Noto Kufi Arabic"', 'Roboto', 'system-ui', 'sans-serif'],
        'arabic-heading': ['Alexandria', '"Noto Kufi Arabic"', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
      maxWidth: {
        content: '1360px',
      },
      screens: {
        nav: '900px',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
} satisfies Config;
