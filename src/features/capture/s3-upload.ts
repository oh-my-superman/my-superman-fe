import { serviceUrl } from '#/lib/service-url'

/**
 * Browser-side S3 upload via a BE-issued **presigned URL**. AWS credentials
 * NEVER live in the frontend — the BE (which holds them) signs a short-lived
 * PUT URL, and we upload the bytes straight to S3.
 *
 * BE contract (configurable via `VITE_PRESIGN_API_PATH`, default
 * `/api/uploads/presign`):
 *   POST {API}/api/uploads/presign
 *     body: { contentType, sessionId }   // contentType required + MIME-validated
 *     200:  { url, s3Uri, key, expiresInSeconds }   // url = presigned PUT URL
 *
 * The PUT below MUST use the same Content-Type as `contentType` — it's part of
 * the signature, so a mismatch makes S3 return 403.
 */

const PRESIGN_PATH =
  import.meta.env.VITE_PRESIGN_API_PATH?.trim() || '/api/uploads/presign'

/** Evidence bucket. Used only to build the `s3://` URI when the BE returns a
 *  bare object key instead of a full URI. */
const BUCKET = 's3-superman'

export interface PresignParams {
  contentType: string
  sessionId?: string | null
}

interface PresignResult {
  url: string
  s3Uri: string
}

async function requestPresignedUpload(
  params: PresignParams,
): Promise<PresignResult> {
  const response = await fetch(serviceUrl(PRESIGN_PATH), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    throw new Error(`presign ${response.status}`)
  }

  const json = (await response.json()) as Record<string, unknown>
  const url = json.url ?? json.uploadUrl ?? json.presignedUrl
  if (typeof url !== 'string' || !url) {
    throw new Error('presign: response has no upload url')
  }

  // Prefer an explicit s3:// URI; otherwise build it from the object key.
  const s3UriField = json.s3Uri ?? json.s3uri
  const key = json.key ?? json.objectKey
  const s3Uri =
    typeof s3UriField === 'string' && s3UriField
      ? s3UriField
      : typeof key === 'string' && key
        ? `s3://${BUCKET}/${key.replace(/^\/+/, '')}`
        : null
  if (!s3Uri) {
    throw new Error('presign: response has no key or s3Uri')
  }
  return { url, s3Uri }
}

/**
 * Get a presigned URL from the BE, PUT the blob to S3, and return the
 * `s3://…` URI to report as evidence.
 */
export async function uploadToS3(
  blob: Blob,
  params: PresignParams,
): Promise<string> {
  const { url, s3Uri } = await requestPresignedUpload(params)
  const put = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': params.contentType },
    body: blob,
  })
  if (!put.ok) {
    throw new Error(`S3 PUT ${put.status}`)
  }
  return s3Uri
}
