'use client'

import { Music, Skull, User } from 'lucide-react'
import { PixelSprite } from '@/components/pixel-sprite'
import { BOSS_TIERS, CUSTOM_BOSS_COLOR, CUSTOM_BOSS_MAX, CUSTOM_BOSS_MIN, CUSTOM_BOSS_SONG, type BossConfig } from '@/lib/boss'
import { cn } from '@/lib/utils'

export type Mode = 'solo' | 'boss'

export function ModeSelector({
  mode,
  onModeChange,
  boss,
  onBossChange,
  disabled,
}: {
  mode: Mode
  onModeChange: (mode: Mode) => void
  boss: BossConfig
  onBossChange: (boss: BossConfig) => void
  disabled: boolean
}) {
  return (
    <div className={cn('flex flex-col gap-4 transition-opacity', disabled && 'pointer-events-none opacity-40')}>
      <div role="radiogroup" aria-label="Game mode" className="inline-flex self-start rounded-lg bg-secondary p-1 font-mono text-sm">
        <ModeButton active={mode === 'solo'} disabled={disabled} onClick={() => onModeChange('solo')}>
          <User className="size-4" aria-hidden="true" />
          Solo
        </ModeButton>
        <ModeButton active={mode === 'boss'} disabled={disabled} onClick={() => onModeChange('boss')}>
          <Skull className="size-4" aria-hidden="true" />
          Boss
        </ModeButton>
      </div>

      {mode === 'boss' && (
        <div className="flex flex-col gap-3">
          <div role="radiogroup" aria-label="Boss difficulty" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {BOSS_TIERS.map((tier) => (
              <TierButton
                key={tier.id}
                active={boss.tierId === tier.id}
                disabled={disabled}
                title={tier.name}
                subtitle={`${tier.wpm} wpm`}
                caption={tier.tagline}
                sprite={tier.id}
                color={tier.color}
                song={tier.song}
                onClick={() => onBossChange({ tierId: tier.id, name: tier.name, wpm: tier.wpm })}
              />
            ))}
            <TierButton
              active={boss.tierId === 'custom'}
              disabled={disabled}
              title="Custom"
              subtitle={boss.tierId === 'custom' ? `${boss.wpm} wpm` : 'You pick'}
              caption="Set the pace"
              sprite="custom"
              color={CUSTOM_BOSS_COLOR}
              song={CUSTOM_BOSS_SONG}
              onClick={() => onBossChange({ tierId: 'custom', name: 'Custom Boss', wpm: boss.wpm })}
            />
          </div>

          {boss.tierId === 'custom' && (
            <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
              <label htmlFor="boss-speed" className="shrink-0 text-xs uppercase tracking-widest text-muted-foreground">
                Boss speed
              </label>
              <input
                id="boss-speed"
                type="range"
                min={CUSTOM_BOSS_MIN}
                max={CUSTOM_BOSS_MAX}
                step={5}
                value={boss.wpm}
                disabled={disabled}
                onChange={(e) => onBossChange({ ...boss, wpm: Number(e.target.value) })}
                className="h-2 flex-1 cursor-pointer accent-primary"
              />
              <output htmlFor="boss-speed" className="w-20 text-right font-mono text-lg font-semibold tabular-nums text-primary">
                {boss.wpm} wpm
              </output>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ModeButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-4 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-primary',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function TierButton({
  active,
  disabled,
  title,
  subtitle,
  caption,
  sprite,
  color,
  song,
  onClick,
}: {
  active: boolean
  disabled: boolean
  title: string
  subtitle: string
  caption: string
  sprite: string
  color: string
  song: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary',
        active ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50',
      )}
    >
      <PixelSprite sprite={sprite} color={color} className="mb-1 size-10" />
      <span className="text-sm font-medium text-foreground">{title}</span>
      <span className={cn('font-mono text-sm tabular-nums', active ? 'text-primary' : 'text-muted-foreground')}>{subtitle}</span>
      <span className="text-xs text-muted-foreground">{caption}</span>
      <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <Music className="size-3 shrink-0" aria-hidden="true" />
        <span className="truncate">{song}</span>
      </span>
    </button>
  )
}
