import { useEffect, useRef } from 'react'

interface ShortcutMap {
  [key: string]: () => void
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.shiftKey && 'shift',
        e.altKey && 'alt',
        e.metaKey && 'meta',
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+')

      if (shortcutsRef.current[key]) {
        e.preventDefault()
        shortcutsRef.current[key]()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
