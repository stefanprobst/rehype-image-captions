import { unified } from 'unified'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import fromMarkdown from 'remark-parse'
import toHast from 'remark-rehype'
import toHtml from 'rehype-stringify'
import withImageCaptions from '../src/index.js'

const image = `
# Heading

Some text.

![An image with title](/image.png "This is the title.")

Some more text.
`

const images = `
# Heading

Some text.

![An image with title](/image.png "This is the title.")
![Another image with title](/another-image.png "This is another title.")

Some more text.
`

const inline = `
# Heading

Some text. ![An image with title](/image.png "This is the title.") Some more text.
`

const mdProcessor = (doc) =>
  unified().use(fromMarkdown).use(toHast).use(withImageCaptions).use(toHtml).process(doc)

test('create figure, remove title attr, and not wrap in paragraph', async () => {
  const file = await mdProcessor(image)
  assert.is(
    String(file),
    `<h1>Heading</h1>
<p>Some text.</p>
<figure><img src="/image.png" alt="An image with title"><figcaption>This is the title.</figcaption></figure>
<p>Some more text.</p>`,
  )
})

test('create two figures, not wrapped in paragraphs', async () => {
  const file = await mdProcessor(images)
  assert.is(
    String(file),
    `<h1>Heading</h1>
<p>Some text.</p>
<figure><img src="/image.png" alt="An image with title"><figcaption>This is the title.</figcaption></figure>
<figure><img src="/another-image.png" alt="Another image with title"><figcaption>This is another title.</figcaption></figure>
<p>Some more text.</p>`,
  )
})

test('create figure from inline image, creating new paragraphs for before/after text', async () => {
  const file = await mdProcessor(inline)
  assert.is(
    String(file),
    `<h1>Heading</h1>
<p>Some text. </p><figure><img src="/image.png" alt="An image with title"><figcaption>This is the title.</figcaption></figure><p> Some more text.</p>`,
  )
})

test.run()
