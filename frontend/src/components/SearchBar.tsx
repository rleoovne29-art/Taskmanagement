import { useState } from 'react'
import type { SubmitEvent } from 'react'

interface Props {
  initialKeyword?: string
  onSearch: (keyword: string) => void
  disabled?: boolean
}

export default function SearchBar({ initialKeyword = '', onSearch, disabled }: Props) {
  const [value, setValue] = useState(initialKeyword)

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
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
