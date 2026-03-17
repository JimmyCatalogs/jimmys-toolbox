import { NextRequest, NextResponse } from 'next/server'
import { extractSkus, ClientKey } from '@/lib/sku-extractor'

// pdf-parse is CommonJS; use require to avoid ESM default-export mismatch
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string; numpages: number }>

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const client = formData.get('client') as ClientKey | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!client || !['herrschners', 'veseys'].includes(client)) {
      return NextResponse.json({ error: 'Invalid client selection' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfData = await pdfParse(buffer)
    const skus = extractSkus(pdfData.text, client)

    return NextResponse.json({
      skus,
      pdfName: file.name,
      totalPages: pdfData.numpages,
    })
  } catch (err) {
    console.error('PDF scan error:', err)
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 })
  }
}
