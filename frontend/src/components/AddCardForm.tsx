import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { ApiError, createCard } from '../api/cardApi.ts'
import type { Card, Priority } from '../types.ts'

interface Props {
  onCreated: (card: Card) => void
  onCancel: () => void
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'HIGH', label: '高' },
  { value: 'MEDIUM', label: '中' },
  { value: 'LOW', label: '低' },
]

/** ＋ボタンで開く新規登録フォーム（タイトル・期限・優先度） */
export default function AddCardForm({ onCreated, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('MEDIUM')
  const [submitting, setSubmitting] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError('タスク名は必須です')
      return
    }
    setTitleError(null)
    setError(null)
    setSubmitting(true)
    try {
      const card = await createCard({ title: title.trim(), dueDate: dueDate || null, priority })
      onCreated(card)
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.title) {
        setTitleError(err.fieldErrors.title)
      } else {
        setError(err instanceof Error ? err.message : '登録に失敗しました')
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form
        className="add-card-form"
        role="dialog"
        aria-modal="true"
        aria-label="カードの新規登録"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        noValidate
      >
        <h2>カードを追加</h2>

        <label>
          タスク名
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            autoFocus
            aria-invalid={titleError !== null}
          />
        </label>
        {titleError && <p className="field-error" role="alert">{titleError}</p>}

        <label>
          期限
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        <label>
          優先度
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        {error && <p className="field-error" role="alert">{error}</p>}

        <div className="form-actions">
          <button type="button" className="secondary" onClick={onCancel} disabled={submitting}>
            キャンセル
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? '登録中...' : '登録'}
          </button>
        </div>
      </form>
    </div>
  )
}
