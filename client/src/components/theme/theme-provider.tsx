"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type ThemeColors = {
  primary: string
  secondary: string
  accent: string
}

export type ThemeConfig = {
  variant: string
  primary: string
  secondary: string
  accent: string
  appearance: "light" | "dark" | "system"
  radius: number
}

export type ThemePreset = {
  name: string
  config: ThemeConfig
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
}

type ThemeProviderState = {
  currentTheme: string
  themeConfig: ThemeConfig
  appearance: "light" | "dark" | "system"
  setTheme: (themeName: string) => void
  setCustomTheme: (config: ThemeConfig) => void
  setAppearance: (mode: "light" | "dark" | "system") => void
  availableThemes: string[]
}

const defaultThemes = {
  default: {
    variant: "professional",
    primary: "oklch(70% 0.1 20)",
    secondary: "oklch(65% 0.15 40)",
    accent: "oklch(75% 0.12 30)",
    appearance: "light" as const,
    radius: 0.5
  },
  luxury: {
    variant: "elegant",
    primary: "oklch(30% 0.15 25)",
    secondary: "oklch(60% 0.1 40)",
    accent: "oklch(80% 0.08 45)",
    appearance: "dark" as const,
    radius: 0.75
  },
  modern: {
    variant: "minimal",
    primary: "oklch(50% 0.2 230)",
    secondary: "oklch(60% 0.15 250)",
    accent: "oklch(70% 0.1 220)",
    appearance: "system" as const,
    radius: 1.0
  }
}

const initialState: ThemeProviderState = {
  currentTheme: "default",
  themeConfig: defaultThemes.default,
  appearance: "light",
  setTheme: () => null,
  setCustomTheme: () => null,
  setAppearance: () => null,
  availableThemes: Object.keys(defaultThemes)
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "default",
  storageKey = "usa-luxury-theme",
  ...props
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const { themeName } = JSON.parse(stored)
        return themeName
      } catch {
        return defaultTheme
      }
    }
    return defaultTheme
  })

  const [customThemes, setCustomThemes] = useState<Record<string, ThemeConfig>>(() => {
    const stored = localStorage.getItem(`${storageKey}-custom`)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return {}
      }
    }
    return {}
  })

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const allThemes = { ...defaultThemes, ...customThemes }
    return allThemes[currentTheme] || defaultThemes.default
  })

  useEffect(() => {
    const root = window.document.documentElement
    const allThemes = { ...defaultThemes, ...customThemes }
    const config = allThemes[currentTheme] || defaultThemes.default

    // Apply theme configuration
    root.style.setProperty('--theme-primary', config.primary)
    root.style.setProperty('--theme-secondary', config.secondary)
    root.style.setProperty('--theme-accent', config.accent)
    root.style.setProperty('--theme-radius', `${config.radius}rem`)

    // Handle appearance mode
    root.classList.remove('light', 'dark')
    if (config.appearance === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(config.appearance)
    }

    setThemeConfig(config)

    // Save theme preference
    localStorage.setItem(storageKey, JSON.stringify({ 
      themeName: currentTheme,
      config 
    }))
  }, [currentTheme, customThemes, storageKey])

  const value = {
    currentTheme,
    themeConfig,
    appearance: themeConfig.appearance,
    setTheme: (themeName: string) => {
      setCurrentTheme(themeName)
    },
    setCustomTheme: (config: ThemeConfig) => {
      const newCustomThemes = {
        ...customThemes,
        [`custom-${Date.now()}`]: config
      }
      setCustomThemes(newCustomThemes)
      localStorage.setItem(`${storageKey}-custom`, JSON.stringify(newCustomThemes))
    },
    setAppearance: (mode: "light" | "dark" | "system") => {
      const newConfig = { ...themeConfig, appearance: mode }
      const allThemes = { ...defaultThemes, ...customThemes }
      const themeName = currentTheme
      allThemes[themeName] = newConfig
      if (currentTheme.startsWith('custom-')) {
        setCustomThemes({ ...customThemes, [themeName]: newConfig })
      }
      setThemeConfig(newConfig)
    },
    availableThemes: [...Object.keys(defaultThemes), ...Object.keys(customThemes)]
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
