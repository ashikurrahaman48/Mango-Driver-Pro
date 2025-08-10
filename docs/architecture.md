
# Application Architecture

This document provides a high-level overview of the technical architecture of MangoDriver Pro, outlining the technology stack, core components, and data flow.

## Technology Stack

-   **Frontend Framework:** [React](https://reactjs.org/) 18 (using Hooks and functional components)
-   **Language:** [TypeScript](https://www.typescriptlang.org/) for static typing and improved code quality.
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS workflow.
-   **AI Service:** [Google Gemini API](https://ai.google.dev/) (using the `@google/genai` SDK). The **`gemini-2.5-flash`** model is used for its balance of speed and capability.
-   **Hardware Communication:** [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) for the optional Hardware Monitor feature.
-   **Build System & Packaging:** [Node.js](https://nodejs.org/)/[npm](https://www.npmjs.com/) for dependency management and running scripts, and [Inno Setup](https://jrsoftware.org/isinfo.php) for creating the Windows installer.

## Core Components

### 1. React Frontend Application (`src/`)

The user interface is a single-page application (SPA) built with React.
-   **Component-Based Structure:** The UI is organized into reusable components located in `src/components/`. Key components include `DriverItem`, `SettingsModal`, `BackupModal`, and `SplashScreen`.
-   **State Management:**
    -   **Local State:** Managed within components using `useState` and `useCallback` hooks.
    -   **Global State:** Shared state such as theme and language is managed via React Context in `src/contexts/`. This provides a clean way to pass data through the component tree without prop-drilling.
-   **Type Safety:** TypeScript (`.ts`, `.tsx`) is used for all files to ensure type safety, catch errors early, and improve developer experience with autocompletion.
-   **Internationalization (i18n):** `src/i18n.ts` contains translation strings for English and Bengali. The `useLanguage` hook provides the `t()` function to access these strings.

### 2. Driver Service (`services/geminiService.ts`)

This service isolates the logic for driver detection. It simulates a real driver utility by providing two modes:

-   **Offline Mode:** Uses a set of predefined hardware profiles and corresponding mock driver data. This allows the application to function fully without an internet connection and provides a fast, consistent experience for demonstrations.
-   **Online Mode:** Leverages the Google Gemini API. It takes the simulated hardware list, constructs a detailed prompt asking for the latest drivers, and specifies a JSON schema for the response. This ensures the AI returns structured, reliable data that the application can easily parse and display.

### 3. Hardware Monitor (Web Serial API Integration)

-   The logic is primarily located within `App.tsx` and exposed through the `SettingsModal` component.
-   It uses the `navigator.serial` browser API to request access to a connected serial device (like an Arduino or other microcontroller).
-   Once connected, it creates a reader to listen for incoming data streams, decodes them from `Uint8Array` to text, and parses them as JSON to display real-time hardware information in the UI.

### 4. Build System (`build/`)

-   **Build Script (`build/build.ps1`):** A PowerShell script automates the entire build process. It cleans old artifacts, installs dependencies (`npm ci`), builds the React app (`npm run build`), and compiles the Inno Setup installer. This ensures a repeatable and reliable build.
-   **Installer (`build/inno/`):** Inno Setup is used to create a professional Windows installer (`.exe`). The script (`MangoDriver.iss`) is configured to bundle the built React application, create shortcuts, provide an uninstaller, and support multi-language installation (English and Bengali).

## Data Flow (Online Scan Example)

1.  **User Interaction:** User clicks the "Scan Now" button in the `App` component.
2.  **State Update:** `App.tsx` sets `scanStatus` to `'scanning'`, triggering a UI update to show a spinner.
3.  **Service Call:** `handleScan()` in `App.tsx` calls `generateDeviceList()` from `geminiService.ts` to get a list of simulated hardware.
4.  **AI Query:** `handleScan()` then calls `fetchDriverUpdates()` with the device list and `mode: 'online'`. Inside the service, `fetchOnlineDriverUpdates()` creates a detailed prompt and sends a request to the Google Gemini API.
5.  **API Response:** The Gemini API processes the prompt and returns a JSON array of driver information that conforms to the requested schema.
6.  **Data Processing:** `geminiService.ts` parses the JSON response into an array of `Driver` objects.
7.  **UI Update:** The `Promise` resolves, and `App.tsx` receives the driver array. It updates its `drivers` state, sets `scanStatus` to `'complete'`, and re-renders the UI to display the results in categorized lists.
