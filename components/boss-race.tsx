import { Music } from 'lucide-react'
import { PixelSprite } from '@/components/pixel-sprite'
import { bossHealth, bossTheme } from '@/lib/boss'

export function BossRace({
  tierId,
  bossName,
  bossWpm,
  playerChars,
  bossChars,
  totalChars,
  active,
}: {
  tierId: string
  bossName: string
  bossWpm: number
  playerChars: number
  bossChars: number
  totalChars: number
  active: boolean
}) {
  const { color, song } = bossTheme(tierId)
  const health = bossHealth(playerChars, bossChars)
  const lead = Math.round(playerChars - bossChars)
  const danger = health < 25
  const sprite = BOSS_SPRITES.has(tierId) ? tierId : 'custom'

  const status = !active
    ? 'Ready when you are'
    : lead > 0
      ? `You lead by ${lead} chars`
      : lead < 0
        ? `${bossName} leads by ${-lead} chars`
        : 'Neck and neck'

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-foreground/80 bg-card p-4" aria-label="Boss fight">
      <div className="flex items-center justify-between gap-3 font-mono text-xs">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Music className="size-3.5" aria-hidden="true" />
          <span className="truncate">{song}</span>
        </span>
        <span className="shrink-0 uppercase tracking-widest text-muted-foreground">
          {bossName} · {bossWpm} wpm
        </span>
      </div>

      <div className="relative pt-9">
        <div
          className="relative h-5 overflow-hidden rounded-sm border-2 border-foreground"
          style={{ backgroundColor: color }}
          role="meter"
          aria-label="Your health"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(health)}
        >
          <div
            className="absolute inset-y-0 right-0 bg-primary transition-[width] duration-150 ease-linear"
            style={{ width: `${health}%` }}
          />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_9px,rgb(0_0_0/0.18)_9px,rgb(0_0_0/0.18)_10px)]" />
        </div>

        <div
          className="absolute top-0 flex items-end transition-[left] duration-150 ease-linear"
          style={{ left: `${100 - health}%` }}
        >
          <PixelSprite
            sprite={sprite}
            color={color}
            className={`-ml-9 size-9 ${active ? 'pixel-bob' : ''}`}
          />
          <PixelSprite
            sprite="player"
            color="var(--primary)"
            className={`size-9 ${danger ? 'pixel-shake' : ''} ${active ? 'pixel-bob' : ''}`}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
        <span aria-live="polite" className="shrink-0">
          {status}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-150 ease-linear"
            style={{ width: `${Math.min((playerChars / Math.max(totalChars, 1)) * 100, 100)}%` }}
          />
        </div>
        <span className="shrink-0 tabular-nums">
          {Math.min(Math.round((playerChars / Math.max(totalChars, 1)) * 100), 100)}%
        </span>
      </div>
    </div>
  )
}

const BOSS_SPRITES = new Set(['rookie', 'keysmith', 'demon', 'overlord'])
