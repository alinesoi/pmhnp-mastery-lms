const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('common.next').NextConfig} */
const nextConfig = {
  // Required by PostHog's reverse-proxy rewrites below so the trailing-slash
  // handling on /ingest/* doesn't 308-redirect ingestion requests.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const backend = process.env.LEARNHOUSE_BACKEND_INTERNAL_URL || 'http://localhost:3030'
    // FastAPI collection routes require a trailing slash, but Next strips it
    // before rewriting and the backend then 307s to a broken absolute URL.
    // Exact-match rules re-add the slash for every collection root.
    const slashRoots = [
      'activities', 'assignments', 'blocks', 'boards', 'certifications',
      'chapters', 'comments', 'communities', 'courses', 'discussions',
      'folders', 'media', 'orgs', 'payments', 'playgrounds', 'podcasts',
      'roles', 'usergroups',
    ]
    return [
      ...slashRoots.map((root) => ({
        source: `/api/v1/${root}`,
        destination: `${backend}/api/v1/${root}/`,
      })),
      // Backend API proxy (Learnhouse API in docker on host port 3010)
      {
        source: '/api/v1/:path*',
        destination: `${backend}/api/v1/:path*`,
      },
      {
        source: '/content/:path*',
        destination: `${backend}/content/:path*`,
      },
      // PostHog reverse proxy (US cloud) — served same-origin so adblockers
      // don't strip ingestion. The client SDK points at api_host: '/ingest'.
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/embed/:orgslug/course/:courseuuid/activity/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *',
          },
        ],
      },
    ]
  },
  reactStrictMode: false,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@phosphor-icons/react',
      'framer-motion',
      'lucide-react',
      '@emoji-mart/react',
      '@emoji-mart/data',
      'dayjs',
      'highlight.js',
      'recharts',
      '@radix-ui/react-icons',
      '@hello-pangea/dnd',
      'react-i18next',
      '@tiptap/core',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-table',
      '@tiptap/extension-table-cell',
      '@tiptap/extension-table-header',
      '@tiptap/extension-table-row',
      '@tiptap/extension-youtube',
      '@tiptap/extension-link',
      '@tiptap/extension-placeholder',
      '@tiptap/extension-code-block-lowlight',
      '@tiptap/extension-heading',
      '@tiptap/extension-bullet-list',
      '@tiptap/extension-ordered-list',
      '@tiptap/extension-list-item',
      '@tiptap/extension-collaboration',
      '@tiptap/extension-collaboration-caret',
      '@uiw/react-codemirror',
      'lowlight',
      'katex',
      'react-katex',
    ],
  },
  // Ensure consistent build IDs across multiple pods in Kubernetes
  generateBuildId: async () => {
    return process.env.BUILD_ID || 'learnhouse-production'
  },
}

// Generate runtime config for development and Vercel builds.
// The client only reads window.__RUNTIME_CONFIG__ (served from
// public/runtime-config.js), so on Vercel this file must be produced at
// build time. Client-side API calls always go through the same-origin
// /api/v1 rewrite proxy; the absolute backend URL stays server-side only.
if (process.env.NODE_ENV === 'development' || process.env.VERCEL) {
  const fs = require('fs')
  const path = require('path')
  const runtimeConfig = {}

  Object.keys(process.env).forEach((key) => {
    if (key.startsWith('NEXT_PUBLIC_')) {
      runtimeConfig[key] = process.env[key]
    }
  })

  if (process.env.VERCEL) {
    runtimeConfig.NEXT_PUBLIC_LEARNHOUSE_API_URL = '/api/v1/'
    runtimeConfig.NEXT_PUBLIC_LEARNHOUSE_BACKEND_URL = ''
    // Media through the same-origin /content rewrite (avoids the
    // http://localhost fallback in getMediaUrl on the client)
    runtimeConfig.NEXT_PUBLIC_LEARNHOUSE_MEDIA_URL = '/'
  }

  const publicDir = path.join(__dirname, 'public')
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })

  fs.writeFileSync(
    path.join(publicDir, 'runtime-config.js'),
    `window.__RUNTIME_CONFIG__ = ${JSON.stringify(runtimeConfig)};`,
    'utf8'
  )
}

// Always wrap with Sentry — DSN is resolved at runtime, not build time
module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  disableLogger: true,
  tunnelRoute: "/monitoring",
  sourcemaps: {
    disable: !process.env.SENTRY_ORG || !process.env.SENTRY_PROJECT,
  },
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayIframe: true,
    excludeReplayShadowDom: true,
  },
});
