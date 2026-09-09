import type { Preview } from '@storybook/react';
import './preview.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  globalTypes: {
    theme: {
      description: 'Light / dark mode',
      toolbar: {
        icon: 'circlehollow',
        items: ['light', 'dark'],
        showName: true,
      },
    },
  },
  // Matches the consuming apps' own default (index.html checks this same
  // media query before first paint): open Storybook in whichever mode the
  // system is already in, instead of always defaulting to light regardless
  // of it. The toolbar toggle above still overrides this for the session.
  initialGlobals: {
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  },
  decorators: [
    (Story, context) => {
      document.documentElement.classList.toggle('dark', context.globals.theme === 'dark');
      return Story();
    },
  ],
};

export default preview;
