import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'
import { KpiCard } from '@/components/KpiCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardKpi {
  open_so: number
  open_po: number
  pending_approvals: number
  material_count: number
  total_ar: number
  total_ap: number
  lot_inconsistent_count: number
}

const currency = (n: number) => `₩${n.toLocaleString()}`

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-kpi'],
    queryFn: () => apiGet<DashboardKpi>('/api/dashboard/kpi'),
  })

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-text-primary">대시보드</h1>

      {isLoading || !data ? (
        <p className="text-sm text-text-secondary">불러오는 중...</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-4 gap-4">
            <KpiCard label="미결 수주" value={data.open_so} />
            <KpiCard label="미결 발주" value={data.open_po} />
            <KpiCard
              label="승인 대기"
              value={data.pending_approvals}
              tone={data.pending_approvals > 0 ? 'warning' : 'default'}
              hint="승인함에서 확인"
            />
            <KpiCard label="등록 품목수" value={data.material_count} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <KpiCard label="매출채권 (AR)" value={currency(data.total_ar)} />
            <KpiCard label="매입채무 (AP)" value={currency(data.total_ap)} />
            <KpiCard
              label="LOT 정합성 불일치"
              value={data.lot_inconsistent_count}
              tone={data.lot_inconsistent_count > 0 ? 'danger' : 'success'}
              hint={data.lot_inconsistent_count > 0 ? '재고 › LOT 정합성에서 확인' : '이상 없음'}
            />
          </div>
        </>
      )}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>모듈 바로가기</CardTitle>
        </CardHeader>
        <p className="text-xs text-text-secondary">좌측 메뉴에서 영업 · 구매 · 생산 · 재고 등 각 업무 화면으로 이동할 수 있습니다.</p>
      </Card>
    </div>
  )
}
