/* ReportModal — the 신고 안내 모달. A danger-tone bottom sheet with a 10-second
 * cancellable countdown, evidence summary, and report / cancel actions. */

const {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} = window.DesignSystem_b303af
const { Icon } = window

function EvidenceRow({ icon, label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 14px',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--destructive)',
          flex: 'none',
        }}
      >
        <Icon name={icon} size={17} />
      </span>
      <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 600 }}>
        {label}
      </span>
      <span
        style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}
      >
        {value}
      </span>
    </div>
  )
}

function ReportModal({ open, onOpenChange }) {
  const [count, setCount] = React.useState(10)
  React.useEffect(() => {
    if (!open) {
      setCount(10)
      return
    }
    const t = setInterval(
      () => setCount((c) => (c <= 1 ? (clearInterval(t), 0) : c - 1)),
      1000,
    )
    return () => clearInterval(t)
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      tone="danger"
      bottomSheet
      showCloseButton={false}
    >
      <DialogHeader style={{ textAlign: 'left' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 2,
          }}
        >
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 99,
              background: 'color-mix(in srgb, var(--destructive) 14%, #fff)',
              color: 'var(--destructive)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <Icon name="alertTriangle" size={20} />
          </span>
          <DialogTitle>위급 상황이 감지됐어요</DialogTitle>
        </div>
        <DialogDescription style={{ textAlign: 'left' }}>
          비명·다툼 소리와 비정상 이동이 감지됐어요. 곧 보호자에게 위치와 직전
          증거를 전송합니다.
        </DialogDescription>
      </DialogHeader>

      {/* Countdown */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 16px',
          borderRadius: 'var(--radius-lg)',
          background: 'color-mix(in srgb, var(--destructive) 8%, #fff)',
        }}
      >
        <div
          style={{ position: 'relative', width: 46, height: 46, flex: 'none' }}
        >
          <svg
            width="46"
            height="46"
            viewBox="0 0 46 46"
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle
              cx="23"
              cy="23"
              r="20"
              fill="none"
              stroke="color-mix(in srgb, var(--destructive) 18%, #fff)"
              strokeWidth="4"
            />
            <circle
              cx="23"
              cy="23"
              r="20"
              fill="none"
              stroke="var(--destructive)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 20}
              strokeDashoffset={2 * Math.PI * 20 * (1 - count / 10)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 17,
              color: 'var(--destructive)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {count}
          </span>
        </div>
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--neutral-700)',
            lineHeight: 1.4,
          }}
        >
          <b>{count}초 후 자동 신고</b>됩니다.
          <br />
          괜찮다면 지금 취소하세요.
        </span>
      </div>

      {/* Evidence */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <EvidenceRow icon="mic" label="직전 녹음" value="1분 12초" />
        <EvidenceRow icon="mapPin" label="실시간 위치" value="역삼동 골목" />
      </div>

      <DialogFooter>
        <Button variant="destructive" block onClick={() => onOpenChange(false)}>
          <Icon name="phone" size={18} /> 지금 바로 112 신고
        </Button>
        <Button variant="ghost" block onClick={() => onOpenChange(false)}>
          괜찮아요, 취소할게요
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

Object.assign(window, { ReportModal })
