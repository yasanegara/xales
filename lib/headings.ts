export interface Heading {
  level: number
  text: string
  id: string
}

export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function extractHeadings(markdown: string): Heading[] {
  const lines = markdown.split('\n')
  const headings: Heading[] = []

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2]
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip links
        .replace(/[*_`~]/g, '')                   // strip formatting
        .trim()
      headings.push({ level, text, id: headingId(text) })
    }
  }

  return headings
}
