import sanitizeHtml from 'sanitize-html'

const ALLOWED_TAGS = [
  'a',
  'b',
  'blockquote',
  'br',
  'caption',
  'code',
  'div',
  'em',
  'figcaption',
  'figure',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]

const ALLOWED_ATTRIBUTES = {
  a: ['href', 'name', 'rel', 'target', 'title'],
  blockquote: ['style'],
  div: ['style'],
  figure: ['style'],
  h2: ['style'],
  h3: ['style'],
  h4: ['style'],
  h5: ['style'],
  h6: ['style'],
  img: ['alt', 'height', 'loading', 'src', 'title', 'width'],
  li: ['style'],
  ol: ['start', 'style', 'type'],
  p: ['style'],
  span: ['style'],
  table: ['style'],
  td: ['colspan', 'rowspan', 'style'],
  th: ['colspan', 'rowspan', 'scope', 'style'],
  tr: ['style'],
  ul: ['style'],
}

const ALLOWED_STYLES = {
  '*': {
    'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i],
    'color': [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i],
    'text-align': [/^(left|right|center|justify)$/],
    'text-decoration': [/^(underline|line-through|none)$/],
  },
  table: {
    'border-collapse': [/^collapse$/],
    'width': [/^\d+(\.\d+)?%$/],
  },
  td: {
    'text-align': [/^(left|right|center|justify)$/],
    'vertical-align': [/^(top|middle|bottom)$/],
    'width': [/^\d+(\.\d+)?%$/],
  },
  th: {
    'text-align': [/^(left|right|center|justify)$/],
    'vertical-align': [/^(top|middle|bottom)$/],
    'width': [/^\d+(\.\d+)?%$/],
  },
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function looksLikeHtml(value: string) {
  return /<[a-z][\s\S]*>/i.test(value)
}

export function sanitizeArticleHtml(content: string) {
  return sanitizeHtml(content, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    allowedStyles: ALLOWED_STYLES,
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          ...attribs,
          rel: attribs.target === '_blank' ? 'noopener noreferrer' : attribs.rel,
        },
      }),
      img: (_tagName, attribs) => ({
        tagName: 'img',
        attribs: {
          ...attribs,
          loading: attribs.loading || 'lazy',
        },
      }),
    },
  }).trim()
}

export function normalizeArticleHtml(content: string) {
  const trimmed = content.trim()
  if (!trimmed) return ''

  if (looksLikeHtml(trimmed)) {
    return sanitizeArticleHtml(trimmed)
  }

  return trimmed
    .split(/\\n|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('')
}

export function articleHtmlToPlainText(content: string) {
  return sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, ' ')
    .trim()
}

export function createArticleExcerpt(content: string, maxLength = 150) {
  const plainText = articleHtmlToPlainText(content)
  if (plainText.length <= maxLength) return plainText
  return `${plainText.slice(0, maxLength).trim()}...`
}
