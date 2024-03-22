import sanitizeHTML from 'sanitize-html'
import catchAsync from './catchAsync.js'

const config = {
  allowedTags: ['a', 'img', 'p', 'h1', 'h2', 'h3', 'strong', 'b', 'i', 'italic', 'em', 'div', 'table', 'th', 'td', 'tbody', 'span', 'cite', 'section', 'article', 'tr', 'svg', 'ul', 'li', 'header', 'footer', 'main', 'br', 'area', 'aside', 'blockquote', 'col', 'figure', 'figcaption', 'embed', 'hgroup', 'iframe', 'mark', 'object', 'ol', 'picture', 'summary', 'textarea', 'time', 'thead'],
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
