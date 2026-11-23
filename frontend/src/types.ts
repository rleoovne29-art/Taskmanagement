// バックエンド CardResponse / enum と対応する型

export type Status = 'TODO' | 'DOING' | 'DONE'
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface Card {
  id: number
  title: string
  /** ISO形式 yyyy-MM-dd。未設定は null */
  dueDate: string | null
  priority: Priority
  status: Status
  createdAt: string
  updatedAt: string
}

/** バックエンド ApiError（GlobalExceptionHandler）のレスポンス形式 */
export interface ApiErrorBody {
  timestamp?: string
  status?: number
  message?: string
  fieldErrors?: Record<string, string>
}
