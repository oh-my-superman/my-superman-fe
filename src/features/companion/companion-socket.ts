/**
 * Low-level client for the single FE↔BE realtime WebSocket (`/ws/companion`).
 *
 * The API spec routes every realtime input (call / voice / gps / screen) through
 * this one socket. This class owns only the connection lifecycle and the session
 * handshake (`session.start` → `session.ready`, `session.end` → `session.closed`);
 * feature code sends its own typed frames via {@link CompanionSocket.send}.
 *
 * It is browser-only and lazily resolves its URL, so importing it under SSR is
 * safe — nothing touches `window`/`WebSocket` until {@link CompanionSocket.open}
 * runs (which only happens from a client effect).
 */

/** A realtime frame. `data` is the payload body; top-level fields are also allowed. */
export interface CompanionFrame {
  type: string
  data?: Record<string, unknown>
  [key: string]: unknown
}

export interface SessionInfo {
  sessionId: string
  userId: number
  userName: string
}

export type CompanionStatus =
  /** No socket / no session. */
  | 'idle'
  /** Socket opening or `session.start` sent, waiting for `session.ready`. */
  | 'connecting'
  /** `session.ready` received — the session is live. */
  | 'ready'
  /** `session.end` sent, waiting for `session.closed`. */
  | 'closing'
  /** Gave up after repeated failures. */
  | 'error'

type StatusListener = (status: CompanionStatus) => void
type FrameListener = (frame: CompanionFrame) => void

const READY_TIMEOUT_MS = 8_000
const CLOSE_TIMEOUT_MS = 3_000
const MAX_RECONNECT_ATTEMPTS = 5

/** Resolve `ws(s)://<be-host>/ws/companion`, honoring `VITE_WS_BASE_URL`. */
function resolveWsUrl(): string {
  const base = import.meta.env.VITE_WS_BASE_URL
  if (base) return `${base.replace(/\/+$/, '')}/ws/companion`
  // Fallback: same host as the page, BE default port 8080.
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.hostname}:8080/ws/companion`
}

export class CompanionSocket {
  #url: string | null
  #socket: WebSocket | null = null
  #status: CompanionStatus = 'idle'
  #session: SessionInfo | null = null
  #enabled = false
  /** User intent: should a session be kept alive (and reconnected on drops)? */
  #wantOpen = false
  #reconnectAttempts = 0

  #statusListeners = new Set<StatusListener>()
  #frameListeners = new Set<FrameListener>()
  #readyWaiters: Array<{
    resolve: (s: SessionInfo) => void
    reject: (e: Error) => void
  }> = []
  #closeWaiters: Array<() => void> = []

  #readyTimer: ReturnType<typeof setTimeout> | null = null
  #closeTimer: ReturnType<typeof setTimeout> | null = null
  #reconnectTimer: ReturnType<typeof setTimeout> | null = null
  #lifecycleBound = false

  constructor(url?: string) {
    // Resolved lazily in #connect() so the URL (and `window`) are only touched
    // on the client.
    this.#url = url ?? null
  }

  get status(): CompanionStatus {
    return this.#status
  }
  get session(): SessionInfo | null {
    return this.#session
  }
  get enabled(): boolean {
    return this.#enabled
  }

  /** Subscribe to status changes. Fires immediately with the current status. */
  onStatus(fn: StatusListener): () => void {
    this.#statusListeners.add(fn)
    fn(this.#status)
    return () => this.#statusListeners.delete(fn)
  }

  /** Subscribe to every inbound frame (control frames are emitted too). */
  onFrame(fn: FrameListener): () => void {
    this.#frameListeners.add(fn)
    return () => this.#frameListeners.delete(fn)
  }

  /**
   * Open the realtime session (connect + `session.start`). Resolves once
   * `session.ready` arrives. Calling it again while live just refreshes the
   * user/protection-mode context. No-op under SSR.
   */
  open(info: {
    userId: number
    userName: string
    enabled?: boolean
  }): Promise<SessionInfo> {
    if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
      return Promise.reject(new Error('CompanionSocket is browser-only'))
    }
    this.#enabled = info.enabled ?? true
    this.#wantOpen = true
    this.#session = this.#session
      ? { ...this.#session, userId: info.userId, userName: info.userName }
      : {
          sessionId: `fe-${crypto.randomUUID()}`,
          userId: info.userId,
          userName: info.userName,
        }

    const ready = new Promise<SessionInfo>((resolve, reject) => {
      this.#readyWaiters.push({ resolve, reject })
    })

    this.#bindLifecycle()
    if (this.#status === 'ready') {
      // Already live — push the refreshed context and resolve right away.
      this.#sendSessionStart()
      this.#resolveReady()
    } else {
      this.#reconnectAttempts = 0
      this.#armReadyTimeout()
      this.#connect()
    }
    return ready
  }

  /**
   * Update protection mode (`enabled`) on the live session without tearing it
   * down. Re-sends `session.start`, which the BE also reads as a mode update.
   */
  setEnabled(enabled: boolean): void {
    this.#enabled = enabled
    if (this.#status === 'ready') this.#sendSessionStart()
  }

  /** Send a raw frame. Returns false if the socket is not open. */
  send(frame: CompanionFrame): boolean {
    if (this.#socket?.readyState === WebSocket.OPEN) {
      this.#socket.send(JSON.stringify(frame))
      return true
    }
    return false
  }

  /**
   * End the session (`session.end`) and close the socket. Resolves once
   * `session.closed` arrives, or after a short timeout if the BE never replies.
   */
  close(): Promise<void> {
    this.#wantOpen = false
    this.#clearReconnect()
    this.#clearReadyTimer()

    const live =
      this.#socket?.readyState === WebSocket.OPEN && this.#session !== null
    if (!live) {
      this.#finalizeClose()
      return Promise.resolve()
    }

    this.#setStatus('closing')
    this.send({ type: 'session.end', session_id: this.#session!.sessionId })
    return new Promise<void>((resolve) => {
      this.#closeWaiters.push(resolve)
      this.#closeTimer = setTimeout(() => {
        if (this.#status === 'closing') this.#finalizeClose()
      }, CLOSE_TIMEOUT_MS)
    })
  }

  // --- internals ---------------------------------------------------------

  #connect(): void {
    if (
      this.#socket &&
      (this.#socket.readyState === WebSocket.OPEN ||
        this.#socket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }
    this.#setStatus('connecting')

    let socket: WebSocket
    try {
      this.#url ??= resolveWsUrl()
      socket = new WebSocket(this.#url)
    } catch (err) {
      this.#scheduleReconnect()
      void err
      return
    }
    this.#socket = socket

    socket.onopen = () => {
      this.#reconnectAttempts = 0
      this.#sendSessionStart()
    }
    socket.onmessage = (ev) => this.#handleMessage(ev)
    socket.onclose = () => this.#handleClose()
    // `onerror` is always followed by `onclose`; reconnect is handled there.
    socket.onerror = () => {}
  }

  #sendSessionStart(): void {
    if (!this.#session) return
    this.send({
      type: 'session.start',
      session_id: this.#session.sessionId,
      userId: this.#session.userId,
      userName: this.#session.userName,
      enabled: this.#enabled,
    })
  }

  #handleMessage(ev: MessageEvent): void {
    if (typeof ev.data !== 'string') {
      // Binary inbound (e.g. AI→FE PCM16 audio). Forwarded raw; playback is out
      // of scope for the session layer.
      this.#emitFrame({ type: 'binary', data: { payload: ev.data } })
      return
    }

    let frame: CompanionFrame
    try {
      frame = JSON.parse(ev.data) as CompanionFrame
    } catch {
      return
    }
    if (typeof frame.type !== 'string') return

    if (frame.type === 'session.ready') {
      this.#clearReadyTimer()
      this.#setStatus('ready')
      this.#resolveReady()
    } else if (frame.type === 'session.closed') {
      this.#finalizeClose()
    }

    this.#emitFrame(frame)
  }

  #handleClose(): void {
    this.#destroySocket()
    if (!this.#wantOpen) {
      // Expected close (after `session.end`, or never opened).
      this.#finalizeClose()
      return
    }
    // Unexpected drop while a session should be live → reconnect.
    this.#scheduleReconnect()
  }

  #scheduleReconnect(): void {
    if (!this.#wantOpen) return
    if (this.#reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      // Stop hammering, but keep `wantOpen` so a foreground/`online` resume can
      // try again — e.g. when the BE comes up after the FE. (Explicit close()
      // clears `wantOpen`, so this never fights a real shutdown.)
      this.#rejectReady(new Error('companion: reconnect attempts exhausted'))
      this.#setStatus('error')
      return
    }
    this.#setStatus('connecting')
    this.#clearReconnect()
    const delay = Math.min(1_000 * 2 ** this.#reconnectAttempts, 10_000)
    this.#reconnectAttempts += 1
    this.#reconnectTimer = setTimeout(() => this.#connect(), delay)
  }

  /** Tear down everything and return to `idle`; resolves pending close waiters. */
  #finalizeClose(): void {
    this.#clearReadyTimer()
    this.#clearReconnect()
    this.#clearCloseTimer()
    this.#unbindLifecycle()
    this.#destroySocket()
    this.#session = null
    this.#closeWaiters.splice(0).forEach((resolve) => resolve())
    this.#rejectReady(new Error('companion: session closed'))
    this.#setStatus('idle')
  }

  // --- mobile / PWA lifecycle -------------------------------------------
  //
  // Mobile browsers (and installed PWAs) suspend backgrounded pages: the socket
  // is frozen and often silently killed. iOS Safari may not even fire `close`,
  // leaving a half-open socket that looks OPEN but is dead. So we never tear the
  // session down on backgrounding — we keep `wantOpen` and proactively
  // reconnect when the page returns to the foreground or the network recovers.

  #bindLifecycle(): void {
    if (this.#lifecycleBound || typeof document === 'undefined') return
    this.#lifecycleBound = true
    document.addEventListener('visibilitychange', this.#onVisibilityChange)
    window.addEventListener('pageshow', this.#onResume)
    window.addEventListener('online', this.#onResume)
  }

  #unbindLifecycle(): void {
    if (!this.#lifecycleBound || typeof document === 'undefined') return
    this.#lifecycleBound = false
    document.removeEventListener('visibilitychange', this.#onVisibilityChange)
    window.removeEventListener('pageshow', this.#onResume)
    window.removeEventListener('online', this.#onResume)
  }

  #onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') this.#onResume()
  }

  /**
   * Foreground / network-recovery hook: if a session should be live but the
   * socket isn't open, reconnect immediately (resetting the backoff so resume
   * is snappy). A half-open socket that still reads OPEN is left alone — the
   * browser surfaces its death via `close`, which routes back to reconnect.
   */
  #onResume = (): void => {
    if (!this.#wantOpen) return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return
    if (this.#socket?.readyState === WebSocket.OPEN) return
    this.#reconnectAttempts = 0
    this.#clearReconnect()
    this.#armReadyTimeout()
    this.#connect()
  }

  #destroySocket(): void {
    const socket = this.#socket
    this.#socket = null
    if (!socket) return
    socket.onopen = null
    socket.onmessage = null
    socket.onclose = null
    socket.onerror = null
    try {
      socket.close()
    } catch {
      // ignore
    }
  }

  #armReadyTimeout(): void {
    this.#clearReadyTimer()
    this.#readyTimer = setTimeout(() => {
      this.#rejectReady(new Error('companion: session.ready timed out'))
    }, READY_TIMEOUT_MS)
  }

  #resolveReady(): void {
    const session = this.#session
    if (!session) return
    this.#readyWaiters.splice(0).forEach((w) => w.resolve(session))
  }

  #rejectReady(err: Error): void {
    this.#readyWaiters.splice(0).forEach((w) => w.reject(err))
  }

  #setStatus(status: CompanionStatus): void {
    if (status === this.#status) return
    this.#status = status
    this.#statusListeners.forEach((fn) => fn(status))
  }

  #emitFrame(frame: CompanionFrame): void {
    this.#frameListeners.forEach((fn) => fn(frame))
  }

  #clearReadyTimer(): void {
    if (this.#readyTimer) {
      clearTimeout(this.#readyTimer)
      this.#readyTimer = null
    }
  }

  #clearCloseTimer(): void {
    if (this.#closeTimer) {
      clearTimeout(this.#closeTimer)
      this.#closeTimer = null
    }
  }

  #clearReconnect(): void {
    if (this.#reconnectTimer) {
      clearTimeout(this.#reconnectTimer)
      this.#reconnectTimer = null
    }
  }
}
