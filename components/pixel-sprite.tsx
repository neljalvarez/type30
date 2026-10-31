import { memo } from 'react'

/**
 * 10x10 pixel art. Legend: # body color, o dark outline, w white, y gold,
 * r red, f skin, . empty.
 */
export const SPRITES: Record<string, string[]> = {
  rookie: [
    '....yy....',
    '....oo....',
    '..oooooo..',
    '.o######o.',
    '.o#w##w#o.',
    '.o#o##o#o.',
    '.o######o.',
    '.o#oooo#o.',
    '..oooooo..',
    '.oo....oo.',
  ],
  keysmith: [
    '...oooo...',
    '..o####o..',
    '..o####o..',
    '.oooooooo.',
    '.offffffo.',
    '.ofoffofo.',
    '.o######o.',
    '.o######o.',
    '..o####o..',
    '...o##o...',
  ],
  demon: [
    'yy......yy',
    '.yo....oy.',
    '..oooooo..',
    '.o#o##o#o.',
    '.o#rr#rr#o',
    '.o######o.',
    '.o#w#w#w#o',
    '.o######o.',
    '..oooooo..',
    '..o....o..',
  ],
  overlord: [
    'y.y.yy.y.y',
    '.yyyyyyyy.',
    '.oooooooo.',
    '.owwwwwwo.',
    '.owoowoowo',
    '.owoowoowo',
    '.owwwwwwo.',
    '..owowowo.',
    '..owowowo.',
    '...oooo...',
  ],
  custom: [
    '.oooooooo.',
    'o########o',
    'o##wwww##o',
    'o#ww##ww#o',
    'o#####ww#o',
    'o####ww##o',
    'o####ww##o',
    'o########o',
    'o####ww##o',
    '.oooooooo.',
  ],
  player: [
    '..oooooo..',
    '.o######o.',
    'o########o',
    'o#oo##oo#o',
    'o#oo##oo#o',
    'o########o',
    'o#o####o#o',
    'o##oooo##o',
    '.o######o.',
    '..oooooo..',
  ],
}

const PALETTE: Record<string, string> = {
  o: '#2B1B15',
  w: '#FFFFFF',
  y: '#FFD23F',
  r: '#E5322D',
  f: '#F2B880',
}

export const PixelSprite = memo(function PixelSprite({
  sprite,
  color,
  className,
}: {
  sprite: string
  color: string
  className?: string
}) {
  const rows = SPRITES[sprite] ?? SPRITES.custom
  return (
    <svg viewBox="0 0 10 10" className={className} shapeRendering="crispEdges" aria-hidden="true">
      {rows.flatMap((row, y) =>
        row.split('').map((cell, x) =>
          cell === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={cell === '#' ? color : PALETTE[cell]} />,
        ),
      )}
    </svg>
  )
})
