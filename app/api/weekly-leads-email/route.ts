import { NextResponse } from 'next/server'

export const DEFAULT_CATALOG_SLUGS = [
  'bargain-shopping',
  'herrschners-catalog',
  'jessica-london',
  'florida-oranges',
  'movies-unlimited-catalog',
  'buy-smoked-meats',
  'museum-gifts',
  'luxury-timepieces',
  'veseys-Catalogue',
  'video-collection-catalog',
  'woman-within',
  'critics-choice-video-catalog',
  'shooting-arrows',
  'rosarycard.net',
  'collectors-choice-music-catalog',
  'garage-organization-products',
  'positive-promotions-promo-code',
  'business-promotional-products',
  'water-purifier',
]

export const DEFAULT_EMAIL_TEMPLATE = `TO: {catalog}<br/>

CONTACT: {email}<br/>
PERIOD: As of {sendDate},  there are {numberOfLeads} new leads for this catalog, and the oldest one that has not been exported yet is dated  {oldestLeadDate}. <br/>
NOTE: If these numbers look very off, it could be because
we have now fully converted to our new portal, detailed below. If you have never downloaded your leads from the portal, your last pickup date and lead count may be initially very high. It should stabilize after your first download. If you continue to experience inaccuracies, please reach out to us. <br/>

<br/>
WEBSITE: Leads are now found at <a href="https://portal.catalogshub.com/leads">our portal</a>. For a guide on how to retrieve leads in the portal, see <a href="https://docs.google.com/document/d/1ILONUzvMtSmKyUezRUA4sYtLFfMEFWAh_jM22IJ4BHI/edit?usp=sharing">this document</a> <br/>
<br/>
LOGIN: We now require a Google account sign-in using an email associated with your account. If your email is not working, or if you would like to edit your account emails, please reach out to jimmyw@catalogs.com or bibic@catalogs.com<br/>
<br/>
<br/>
We are constantly monitoring the landing page for your catalog and are aware that you may have important changes.  Please make sure that the information is accurate. <br/>
<br/>
Here are your contacts for updating your catalog cover, digital catalog and offer codes:<br/>
<br/>
Bibi Chand<br/>
<br/>
bibic@catalogs.com<br/>
<br/>
954-908-7202<br/>
<br/>
<br/>
Jimmy Watson<br/>
<br/>
jimmyw@catalogs.com`

interface CatalogResult {
  slug: string
  catalog: string
  email: string
  leads: number
  oldestLeadDate: string
  success: boolean
  error?: string
}

async function fetchCatalogData(slug: string) {
  const query = `{
    catalogs(filter: {slug: {equalTo: "${slug}"}}) {
      name
      accountByAccount {
        email
      }
      subscriptionsByCatalog(orderBy: DATE_ASC, filter: {exportStatus: {equalTo: "R"}}) {
        date
      }
    }
  }`

  const res = await fetch('https://gql.catalogshub.com/production', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) throw new Error(`GQL request failed: ${res.status}`)
  const json = await res.json()
  return json.data.catalogs[0]
}

function renderTemplate(
  template: string,
  vars: {
    catalog: string
    email: string
    numberOfLeads: number
    oldestLeadDate: string
    sendDate: string
  }
): string {
  return template
    .replaceAll('{catalog}', vars.catalog)
    .replaceAll('{email}', vars.email)
    .replaceAll('{numberOfLeads}', String(vars.numberOfLeads))
    .replaceAll('{oldestLeadDate}', vars.oldestLeadDate)
    .replaceAll('{sendDate}', vars.sendDate)
}

async function sendEmail(
  catalog: string,
  email: string,
  numberOfLeads: number,
  lastDownloadDate: Date,
  sendDate: Date,
  template: string
): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) throw new Error('SENDGRID_API_KEY is not set')

  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`

  const body = renderTemplate(template, {
    catalog,
    email,
    numberOfLeads,
    oldestLeadDate: fmt(lastDownloadDate),
    sendDate: fmt(sendDate),
  })

  const mailOptions = {
    personalizations: [
      {
        to: email.split(';').map((e) => ({ email: e.trim() })),
        bcc: [{ email: 'jimmyw@catalogs.com' }, { email: 'bibic@catalogs.com' }],
      },
    ],
    from: { email: 'service@catalogs.com', name: 'service' },
    subject: `Catalogs.com - New Leads (${catalog})`,
    trackingSettings: {
      clickTracking: { enable: false, enableText: true },
    },
    content: [{ type: 'text/html', value: body }],
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(mailOptions),
  })

  if (!res.ok) {
    const responseBody = await res.text()
    throw new Error(`SendGrid error ${res.status}: ${responseBody}`)
  }
}

export async function POST(request: Request) {
  let slugs = DEFAULT_CATALOG_SLUGS
  let emailTemplate = DEFAULT_EMAIL_TEMPLATE

  try {
    const body = await request.json()
    if (Array.isArray(body.slugs) && body.slugs.length > 0) slugs = body.slugs
    if (typeof body.emailTemplate === 'string' && body.emailTemplate.trim()) {
      emailTemplate = body.emailTemplate
    }
  } catch {
    // no body or invalid JSON — use defaults
  }

  const results: CatalogResult[] = []
  const sendDate = new Date()

  for (const slug of slugs) {
    try {
      const data = await fetchCatalogData(slug)
      const catalog: string = data.name
      const email: string = data.accountByAccount.email
      const subscriptions: { date: string }[] = data.subscriptionsByCatalog
      const numberOfLeads = subscriptions.length
      const lastDownloadDate =
        numberOfLeads > 0 ? new Date(subscriptions[0].date) : new Date()

      await sendEmail(catalog, email, numberOfLeads, lastDownloadDate, sendDate, emailTemplate)

      const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
      results.push({
        slug,
        catalog,
        email,
        leads: numberOfLeads,
        oldestLeadDate: numberOfLeads > 0 ? fmt(lastDownloadDate) : 'N/A',
        success: true,
      })
    } catch (err) {
      results.push({
        slug,
        catalog: slug,
        email: '',
        leads: 0,
        oldestLeadDate: 'N/A',
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return NextResponse.json(results)
}
