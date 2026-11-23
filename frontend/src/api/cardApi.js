const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  constructor(message, { status, fieldErrors } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors ?? {}
  }
}

/**
 * カードを取得する。keyword を渡すとタイトル部分一致で絞り込む（未指定・空なら全件）。
 */
export async function fetchCards({ keyword, signal } = {}) {
  const params = new URLSearchParams()
  const trimmed = keyword?.trim()
  if (trimmed) params.set('keyword', trimmed)
  const query = params.toString()

  let response
  try {
    response = await fetch(`${BASE_URL}/api/cards${query ? `?${query}` : ''}`, { signal })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new ApiError('サーバーに接続できませんでした')
  }

  if (!response.ok) {
    // バックエンドの ApiError 形式 { status, message, fieldErrors } を読む
    const body = await response.json().catch(() => null)
    throw new ApiError(body?.message ?? `エラーが発生しました (${response.status})`, {
      status: response.status,
      fieldErrors: body?.fieldErrors,
    })
  }
  return response.json()
}
