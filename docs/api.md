
# API Reference

This document provides a reference for the key functions, services, and React hooks used within the MangoDriver Pro application.

## `services/geminiService.ts`

This service is the core module responsible for fetching driver information, either from the local simulation or the online Google Gemini API.

### `getSystemInfo(): Promise<SystemInfo>`

-   **Description:** Asynchronously retrieves information about the host system. In the current implementation, this returns one of several hardcoded hardware profiles to simulate different computer configurations.
-   **Returns:** A `Promise` that resolves to a `SystemInfo` object containing OS, CPU, RAM, and Motherboard details.

### `generateDeviceList(): Promise<Device[]>`

-   **Description:** Simulates a hardware scan of the system to identify major components like the GPU, CPU, and storage devices. The list of devices is based on the currently selected hardware profile.
-   **Returns:** A `Promise` that resolves to an array of `Device` objects.

### `fetchDriverUpdates(devices: Device[], mode: AppMode): Promise<Driver[]>`

-   **Description:** The main function for fetching driver information. It acts as a router, calling the appropriate internal function based on the selected application mode.
-   **Parameters:**
    -   `devices: Device[]`: An array of `Device` objects to find drivers for.
    -   `mode: AppMode`: The application mode (`'online'` or `'offline'`).
-   **Returns:** A `Promise` that resolves to an array of `Driver` objects.
-   **Throws:** An error if the online AI call fails.

### Internal Functions

-   **`fetchOfflineDriverUpdates(devices: Device[]): Promise<Driver[]>`**
    -   Used when `mode` is `'offline'`.
    -   Returns drivers from a hardcoded mock driver list that matches the devices found in the simulated scan. It's fast and works without an internet connection.

-   **`fetchOnlineDriverUpdates(devices: Device[]): Promise<Driver[]>`**
    -   Used when `mode` is `'online'`.
    -   Constructs a detailed prompt with the system and device information.
    -   Sends this prompt to the **`gemini-2.5-flash`** model via the `@google/genai` SDK.
    -   It specifies `responseMimeType: "application/json"` and provides a strict `responseSchema` to ensure the data is returned in a predictable, parseable format.

## React Contexts and Hooks

### `contexts/LanguageContext.tsx`

-   **`useLanguage()`:** A React hook that provides access to the language state.
    -   **Returns:** An object with:
        -   `language: 'en' | 'bn'`: The current language code.
        -   `setLanguage(lang)`: A function to change the language.
        -   `t(key, replacements)`: The translation function. Returns the translated string for the given key in the current language, optionally replacing placeholders.

### `contexts/ThemeContext.tsx`

-   **`useTheme()`:** A React hook that provides access to the theme state.
    -   **Returns:** An object with:
        -   `theme: 'light' | 'dark'`: The current theme.
        -   `setTheme(theme)`: A function to change the theme.
