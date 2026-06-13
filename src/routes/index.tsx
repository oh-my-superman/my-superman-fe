import { createFileRoute } from '@tanstack/react-router'
import { clamp } from 'es-toolkit'

import { Button } from '#/components/ui/button'
import { useCounterStore } from '#/stores/counter-store'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { count, increment, decrement, reset } = useCounterStore()

  // es-toolkit: keep the count within [0, 10]
  const clamped = clamp(count, 0, 10)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <p className="text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>

      <div className="flex flex-col items-center gap-4">
        <p className="text-2xl font-semibold tabular-nums">
          count: {count} (clamped 0–10: {clamped})
        </p>
        <div className="flex gap-2">
          <Button onClick={decrement} variant="outline">
            -
          </Button>
          <Button onClick={increment}>+</Button>
          <Button onClick={reset} variant="secondary">
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
