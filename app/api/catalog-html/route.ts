import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

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

export async function POST(request: Request) {
  const formData = await request.formData()
  const action = formData.get('action') as string
  const month = formData.get('month') as string
  const year = formData.get('year') as string
  const clientPath = formData.get('clientPath') as string

  if (!action || !month || !year || !clientPath) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const dateFolder = `${month}-${year.slice(-2)}`

  if (action === 'upload-images') {
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    try {
      const key = `emails/${clientPath}/${dateFolder}/${file.name}`
      const buffer = Buffer.from(await file.arrayBuffer())

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
          ContentType: file.type || 'image/jpeg',
          ACL: 'public-read',
        })
      )

      return NextResponse.json({ uploaded: file.name })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  if (action === 'process-html') {
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const s3Base = `https://s3.${REGION}.amazonaws.com/${BUCKET}/emails/${clientPath}/${dateFolder}/`
    let html = await file.text()

    // Replace src="images/..." and src='images/...' with full S3 URLs
    html = html.replace(/src="images\//g, `src="${s3Base}`)
    html = html.replace(/src='images\//g, `src='${s3Base}`)

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${file.name.replace(/\.html?$/i, '_updated.html')}"`,
      },
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
