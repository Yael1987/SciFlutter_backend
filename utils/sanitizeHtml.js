import sanitizeHTML from 'sanitize-html'
import catchAsync from './catchAsync.js'

const allowTags = ['address', 'article', 'aside', 'footer', 'header', 'h1', 'h2', 'h3', 'h4',
  'h5', 'h6', 'hgroup', 'main', 'nav', 'section', 'blockquote', 'dd', 'div',
  'dl', 'dt', 'figcaption', 'figure', 'hr', 'li', 'main', 'ol', 'p', 'pre',
  'ul', 'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn',
  'em', 'i', 'kbd', 'mark', 'q', 'rb', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp',
  'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr', 'caption',
  'col', 'colgroup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'img', 'italic', 'svg', 'area',
  'embed', 'iframe', 'object', 'picture', 'summary', 'textarea'
]

const config = {
  allowedTags: allowTags,
  allowedAttributes: {
    a: ['href', 'target'],
    img: ['src', 'alt', 'srcset', 'width', 'height', 'title', 'style'],
    '*': ['class', 'value', 'id', 'name', 'data-*', 'style', 'bis_skin-checked', 'draggable', 'contenteditable']
  }
}

export default catchAsync(async (req, res, next) => {
  if (req.body && req.is('json')) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitizeHTML(req.body[key], config)
    })
  }

  next()
})
