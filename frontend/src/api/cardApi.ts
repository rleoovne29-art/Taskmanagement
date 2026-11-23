import type { ApiErrorBody, Card } from '../types.ts'

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  status?: number
  fieldErrors: Record<string, string>

  constructor(message: string, options: { status?: number; fieldErrors?: Record<string, string> } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.fieldErrors = options.fieldErrors ?? {}
  }
}

interface FetchCardsOptions {
  keyword?: string
  signal?: AbortSignal
}

/**
 * カードを取得する。keyword を渡すとタイトル部分一致で絞り込む（未指定・空なら全件）。
 */
export async function fetchCards({ keyword, signal }: FetchCardsOptions = {}): Promise<Card[]> {
  const params = new URLSearchParams()
  const trimmed = keyword?.trim()
  if (trimmed) params.set('keyword', trimmed)
  const query = params.toString()

  let response: Response
  try {
    response = await fetch(`${BASE_URL}/api/cards${query ? `?${query}` : ''}`, { signal })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError('サーバーに接続できませんでした')
  }

  if (!response.ok) {
    // バックエンドの ApiError 形式 { status, message, fieldErrors } を読む
    const body: ApiErrorBody | null = await response.json().catch(() => null)
    throw new ApiError(body?.message ?? `エラーが発生しました (${response.status})`, {
      status: response.status,
      fieldErrors: body?.fieldErrors,
    })
  }
  return (await response.json()) as Card[]
}
