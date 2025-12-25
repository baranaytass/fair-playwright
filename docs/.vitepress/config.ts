import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'fair-playwright',
  description: 'AI-optimized Playwright test reporter with progressive terminal output',
  base: '/fair-playwright/',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/fair-playwright/logo.png' }]
  ],

  themeConfig: {
    logo: '/logo.png',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v1.1.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/baranaytass/fair-playwright/blob/main/CHANGELOG.md' },
          { text: 'npm', link: 'https://www.npmjs.com/package/fair-playwright' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is fair-playwright?', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Configuration', link: '/guide/configuration' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Step Hierarchy', link: '/guide/step-hierarchy' },
            { text: 'Progressive Output', link: '/guide/progressive-output' },
            { text: 'MCP Integration', link: '/guide/mcp' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Migration Guide', link: '/guide/migration' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'FairReporter', link: '/api/reporter' },
            { text: 'E2E Helper', link: '/api/e2e-helper' },
            { text: 'MCP Server', link: '/api/mcp-server' },
            { text: 'TypeScript Types', link: '/api/types' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Usage', link: '/examples/basic' },
            { text: 'Advanced Tests', link: '/examples/advanced' },
            { text: 'MCP Usage', link: '/examples/mcp' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/baranaytass/fair-playwright' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/fair-playwright' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Baran Aytas'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/baranaytass/fair-playwright/edit/main/docs/:path'
    }
  }
});
