import type { ApiErrorBody, Card, Priority } from '../types.ts'

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

async function toApiError(response: Response): Promise<ApiError> {
  // バックエンドの ApiError 形式 { status, message, fieldErrors } を読む
  const body: ApiErrorBody | null = await response.json().catch(() => null)
  return new ApiError(body?.message ?? `エラーが発生しました (${response.status})`, {
    status: response.status,
    fieldErrors: body?.fieldErrors,
  })
}

export interface CreateCardInput {
  title: string
  /** yyyy-MM-dd。未設定は null */
  dueDate: string | null
  priority: Priority
}

/**
 * カードを新規登録する。列（status）は省略し、バックエンド側で To Do になる。
 */
export async function createCard(input: CreateCardInput): Promise<Card> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}/api/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch {
    throw new ApiError('サーバーに接続できませんでした')
  }
  if (!response.ok) throw await toApiError(response)
  return (await response.json()) as Card
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

  if (!response.ok) throw await toApiError(response)
  return (await response.json()) as Card[]
}
