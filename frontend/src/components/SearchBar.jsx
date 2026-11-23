import { useState } from 'react'

export default function SearchBar({ initialKeyword = '', onSearch, disabled }) {
  const [value, setValue] = useState(initialKeyword)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(value)
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="タスク名で検索"
        aria-label="タスク名で検索"
      />
      <button type="submit" disabled={disabled}>検索</button>
    </form>
  )
}
