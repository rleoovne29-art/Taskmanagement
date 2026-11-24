import { useEffect, useState } from 'react'
import { fetchCards } from './api/cardApi.ts'
import AddCardForm from './components/AddCardForm.tsx'
import Board from './components/Board.tsx'
import SearchBar from './components/SearchBar.tsx'
import type { Card } from './types.ts'
import './App.css'

export default function App() {
  // 検索のたびに新しいオブジェクトにするので、同じキーワードでも再取得できる
  const [query, setQuery] = useState({ keyword: '' })
  const { keyword } = query
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // cleanup で abort するので、連続検索時は古いリクエストの結果が反映されない
    const controller = new AbortController()
    fetchCards({ keyword: query.keyword, signal: controller.signal })
      .then((data) => {
        setCards(data)
        setLoading(false)
      })
      .catch((e: Error) => {
        if (e.name === 'AbortError') return
        setCards([])
        setError(e.message)
        setLoading(false)
      })
    return () => controller.abort()
  }, [query])

  const handleSearch = (input: string) => {
    setLoading(true)
    setError(null)
    setQuery({ keyword: input.trim() })
  }

  // 登録後は一覧を再取得して、検索条件と整合した表示にする
  const handleCreated = () => {
    setShowForm(false)
    setLoading(true)
    setError(null)
    setQuery({ keyword: query.keyword })
  }

  return (
    <>
      <header className="app-header">
        <h1>タスク管理ボード</h1>
        <SearchBar onSearch={handleSearch} disabled={loading} />
        <button
          type="button"
          className="add-button"
          onClick={() => setShowForm(true)}
          aria-label="カードを追加"
          title="カードを追加"
        >
          ＋
        </button>
      </header>
      {showForm && <AddCardForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />}
      <main>
        {error && <p className="message error" role="alert">{error}</p>}
        {!error && !loading && cards.length === 0 && (
          <p className="message">
            {keyword ? `「${keyword}」に該当するカードがありません` : 'カードがありません'}
          </p>
        )}
        {loading && <p className="message">読み込み中...</p>}
        <Board cards={cards} />
      </main>
    </>
  )
}
