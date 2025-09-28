import { FormEvent, useState } from 'react'
import './App.css'

function App() {
  const [fullName, setFullName] = useState('')
  const [greetingName, setGreetingName] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = fullName.trim()
    setGreetingName(trimmedName ? trimmedName : null)
  }

  return (
    <main className="app">
      <section className="card">
        <h1 className="title">Приветствие</h1>
        <p className="subtitle">Введите своё ФИО, чтобы мы могли с вами поздороваться.</p>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="fullName">
            ФИО
          </label>
          <input
            id="fullName"
            className="field-input"
            type="text"
            placeholder="Например, Иванов Иван Иванович"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            required
          />
          <button className="submit-button" type="submit">
            Поздороваться
          </button>
        </form>

        {greetingName !== null && (
          <p className="greeting" role="status" aria-live="polite">
            Привет, {greetingName}!
          </p>
        )}
      </section>
    </main>
  )
}

export default App
