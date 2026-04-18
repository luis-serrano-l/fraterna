# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run lint       # Run ESLint
```

No test suite configured.

## Architecture

**Stack:** React Native 0.79 + Expo 53 + Expo Router 5 + TypeScript (strict). New Architecture enabled.

### Routing

File-based routing via Expo Router. Entry: `app/_layout.tsx` → `app/(tabs)/_layout.tsx` with 4 tabs:
- `index.tsx` — main journaling screen
- `notes.tsx` — note-taking with folders
- `history.tsx` — historical view by field
- `settings.tsx` — field customization & ordering

### State & Persistence

No global store. Each tab manages its own state via `useState` + `useFocusEffect` (reload on focus) + `useEffect` (sync to AsyncStorage).

AsyncStorage keys:
- `'notes'` — array of journal entries
- `'visibleFields'` — `Record<fieldId, boolean>`
- `'fieldOrder'` — ordered array of field IDs
- `'customFields'` — user-defined field definitions
- `'editedFieldLabels'` — label overrides for default fields

Fully offline. No network requests.

### Field System (`constants/Fields.ts`)

11 default fields (planVida, mortificacion, presenciaDios, etc.) plus user-defined custom fields. Helper functions: `getAllFields()`, `addCustomField()`, `editCustomField()`, `removeCustomField()`, `editFieldLabel()`, `cleanupFieldOrder()`. Each entry is typed dynamically with field keys as properties.

### Theme (`hooks/useTheme.ts`)

Single `useTheme()` hook returns a memoized object with `colors`, `typography`, `spacing`, `borderRadius`, `shadows`, `layout`. Auto light/dark via `useColorScheme()`. Always use this hook for styling — avoid hardcoded colors or sizes.

### Key Patterns

- **Gestures:** `react-native-gesture-handler` + `react-native-reanimated` for swipe-to-delete and drag-to-reorder
- **Editing:** modal-based (full-screen modals for entries, inline modals for fields/folders)
- **Icons:** `IconSymbol` component handles SF Symbols (iOS) / Material Icons (Android) divergence
- **Path alias:** `@/*` maps to project root (use in all imports)
- **Haptics:** `expo-haptics` on tab interactions via `HapticTab`
