import { Skull, User } from 'lucide-react'

export function BossRace({
  playerChars,
  bossChars,
  bossName,
  bossWpm,
  finishChars,
}: {
  playerChars: number
  bossChars: number
  bossName: string
  bossWpm: number
  finishChars: number
}) {
  const scale = Math.max(finishChars, playerChars, 1)
  const lead = Math.round(playerChars - bossChars)
  const status =
    playerChars === 0 && bossChars === 0
      ? 'Start typing to begin the race'
      : lead > 0
        ? `You lead by ${lead} chars`
        : lead < 0
          ? `${bossName} leads by ${-lead} chars`
          : 'Neck and neck'

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4" aria-label="Boss race">
      <RaceLane icon={<User className="size-4" aria-hidden="true" />} label="You" value={playerChars} scale={scale} barClass="bg-foreground" />
      <RaceLane
        icon={<Skull className="size-4" aria-hidden="true" />}
        label={`${bossName} · ${bossWpm} wpm`}
        value={bossChars}
        scale={scale}
        barClass="bg-primary"
      />
      <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
        {status}
      </p>
    </div>
  )
}

function RaceLane({
  icon,
  label,
  value,
  scale,
  barClass,
}: {
  icon: React.ReactNode
  label: string
  value: number
  scale: number
  barClass: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-44 shrink-0 items-center gap-2 truncate text-sm text-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-[width] duration-100 ease-linear ${barClass}`}
          style={{ width: `${Math.min((value / scale) * 100, 100)}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-muted-foreground">{Math.round(value)}</span>
    </div>
  )
}
