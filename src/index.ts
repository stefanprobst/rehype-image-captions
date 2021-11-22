import type * as Hast from 'hast'
import type { Transformer } from 'unified'
import { visit, SKIP } from 'unist-util-visit'
import { h } from 'hastscript'

export default function withImageCaptions(): Transformer<Hast.Root> {
  const transformer: Transformer<Hast.Root> = function transformer(tree, _file) {
    visit(tree, 'element', function onElement(node, index, parent) {
      if (node.tagName !== 'img') return

      if (node.properties == null) return
      if (index == null || parent == null) return

      const title = node.properties['title']
      if (typeof title !== 'string') return
      if (title.length === 0) return

      const figure = h('figure', [node, h('figcaption', title)])

      parent.children[index] = figure

      return SKIP
    })
  }

  return transformer
}
