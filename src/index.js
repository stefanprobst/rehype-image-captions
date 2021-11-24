import { h } from 'hastscript'

export default function withImageCaptions() {
  /** @type {import('unified').Transformer<import('hast').Root>} */
  const transformer = function transformer(tree, _file) {
    for (let paragraphIndex = 0; paragraphIndex < tree.children.length; paragraphIndex++) {
      const paragraph = tree.children[paragraphIndex]
      if (paragraph.type !== 'element' || paragraph.tagName !== 'p') continue

      const elements = []
      let nextIndex = 0

      for (let imageIndex = 0; imageIndex < paragraph.children.length; imageIndex++) {
        const image = paragraph.children[imageIndex]
        if (image.type !== 'element' || image.tagName !== 'img') continue

        if (image.properties == null) continue
        const title = image.properties['title']
        if (typeof title !== 'string' || title.length === 0) continue

        delete image.properties['title']
        const figureElement = h('figure', image, h('figcaption', title))

        if (imageIndex > 0) {
          const first = paragraph.children[nextIndex]
          if (
            imageIndex - nextIndex > 1 ||
            first.type !== 'text' ||
            first.value.trim().length > 0
          ) {
            elements.push({
              ...paragraph,
              children: paragraph.children.slice(nextIndex, imageIndex),
            })
          } else if (imageIndex - nextIndex === 1) {
            /** Avoid creating paragraph for single whitespace-only text node. */
            elements.push(first)
          }
        }

        elements.push(figureElement)
        nextIndex = imageIndex + 1
      }

      if (elements.length === 0) continue

      if (nextIndex < paragraph.children.length) {
        elements.push({ ...paragraph, children: paragraph.children.slice(nextIndex) })
      }

      tree.children.splice(paragraphIndex, 1, ...elements)
      paragraphIndex += elements.length - 1
    }
  }

  return transformer
}
