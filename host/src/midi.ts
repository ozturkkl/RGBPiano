import JZZ from 'jzz'

/** Re-attach to an input that has gone silent for this long (handles devices that sleep). */
const IDLE_REBIND_MS = 10_000

/**
 * Reads MIDI from a single selectable input port. Keeps the connection alive across
 * hotplug and idle by periodically re-binding to the selected device.
 */
export class MidiManager {
  private access!: WebMidi.MIDIAccess
  private selectedName = 'None'
  private bound?: WebMidi.MIDIInput
  private lastMessage = 0
  private messageHandler?: (message: number[]) => void
  private stateHandler?: () => void

  async init(): Promise<void> {
    this.access = await JZZ.requestMIDIAccess()
    this.access.onstatechange = () => this.stateHandler?.()
    setInterval(() => this.ensureBound(), 1000)
  }

  get inputs(): string[] {
    if (!this.access) return []
    return Array.from(this.access.inputs.values()).map((i) => i.name ?? 'Unknown')
  }

  onMessage(handler: (message: number[]) => void): void {
    this.messageHandler = handler
  }

  onStateChange(handler: () => void): void {
    this.stateHandler = handler
  }

  select(name: string): void {
    this.selectedName = name
    this.ensureBound()
  }

  private ensureBound(): void {
    if (this.selectedName === 'None') {
      this.detach()
      return
    }

    const input = Array.from(this.access.inputs.values()).find((i) => i.name === this.selectedName)
    if (!input) {
      this.detach()
      return
    }

    const idle = Date.now() - this.lastMessage > IDLE_REBIND_MS
    if (this.bound === input && !idle) return

    this.detach()
    this.bound = input
    this.lastMessage = Date.now()
    input.onmidimessage = (msg: WebMidi.MIDIMessageEvent) => {
      this.lastMessage = Date.now()
      this.messageHandler?.(Array.from(msg.data))
    }
  }

  private detach(): void {
    if (this.bound) {
      this.bound.onmidimessage = null
      this.bound = undefined
    }
  }
}
