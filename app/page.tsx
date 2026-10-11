import { Keyboard } from 'lucide-react'
import { TypingGame } from '@/components/typing-game'

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-2">
          <Keyboard className="size-6 text-primary" aria-hidden="true" />
          <span className="font-mono text-lg font-semibold tracking-tight">type30</span>
        </div>
        <span className="font-mono text-sm text-muted-foreground">made by nelj</span>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 pb-24">
        <h1 className="sr-only">30 second typing speed test</h1>
        <TypingGame />
      </main>
    </div>
  )
}
