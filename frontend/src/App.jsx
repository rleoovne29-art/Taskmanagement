import { useEffect, useState } from 'react'
import { fetchCards } from './api/cardApi.js'
import Board from './components/Board.jsx'
import SearchBar from './components/SearchBar.jsx'
import './App.css'

export default function App() {
  // 検索のたびに新しいオブジェクトにするので、同じキーワードでも再取得できる
  const [query, setQuery] = useState({ keyword: '' })
  const { keyword } = query
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // cleanup で abort するので、連続検索時は古いリクエストの結果が反映されない
    const controller = new AbortController()
    fetchCards({ keyword: query.keyword, signal: controller.signal })
      .then((data) => {
        setCards(data)
        setLoading(false)
      })
      .catch((e) => {
        if (e.name === 'AbortError') return
        setCards([])
        setError(e.message)
        setLoading(false)
      })
    return () => controller.abort()
  }, [query])

  const handleSearch = (input) => {
    setLoading(true)
    setError(null)
    setQuery({ keyword: input.trim() })
  }

  return (
    <>
      <header className="app-header">
        <h1>タスク管理ボード</h1>
        <SearchBar onSearch={handleSearch} disabled={loading} />
      </header>
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
