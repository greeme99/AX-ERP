import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '로그인 실패 (서버 응답 오류)')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-card border border-border-default bg-card p-8 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-lg font-semibold text-brand">AX ERP</span>
        </div>
        <p className="mb-6 text-xs text-text-secondary">역할별 데모 계정으로 접속하세요.</p>

        <label className="mb-1 block text-xs text-text-secondary">이메일</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@standard-erp.local"
          required
          className="mb-3"
        />
        <label className="mb-1 block text-xs text-text-secondary">비밀번호</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="demo1234"
          required
          className="mb-4"
        />
        {error && <p className="mb-3 text-xs text-danger">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? '로그인 중...' : '로그인'}
        </Button>
        <p className="mt-4 text-[11px] text-text-secondary">
          데모 계정: admin / sales / purchase / production · 비밀번호 demo1234
        </p>
      </form>
    </div>
  )
}
