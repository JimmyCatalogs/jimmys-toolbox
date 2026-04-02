import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

const BUCKET = 'digital.catalogs.com'
const REGION = process.env.AWS_REGION ?? 'us-east-1'

const s3 = new S3Client({
  region: REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const ALLOWED_FOLDERS = ['pdfs', 'herrschners/pdfs']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const folder = searchParams.get('folder')

  if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
  }

  const prefix = `${folder}/`

  try {
    const result = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
      })
    )

    const files = (result.Contents ?? [])
      .filter((obj) => obj.Key && obj.Key !== prefix && obj.Key.toLowerCase().endsWith('.pdf'))
      .map((obj) => {
        const name = obj.Key!.replace(prefix, '')
        const url = `https://s3.${REGION}.amazonaws.com/${BUCKET}/${obj.Key}`
        return { name, url }
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ files })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const folder = formData.get('folder') as string
  const file = formData.get('file') as File | null

  if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
  }

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const key = `${folder}/${file.name}`
  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: 'application/pdf',
        ACL: 'public-read',
      })
    )

    const url = `https://s3.${REGION}.amazonaws.com/${BUCKET}/${key}`
    return NextResponse.json({ uploaded: file.name, url })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
