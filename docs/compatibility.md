
# System Requirements & Compatibility

This document outlines the system and browser requirements for installing and running MangoDriver Pro.

## Supported Operating Systems

MangoDriver Pro is designed and tested for **Microsoft Windows**.

-   :white_check_mark: **Windows 11** (64-bit)
-   :white_check_mark: **Windows 10** (32-bit & 64-bit)
-   :heavy_check_mark: **Windows 8/8.1** (32-bit & 64-bit) - *Expected to work, but not officially tested.*
-   :heavy_check_mark: **Windows 7** (32-bit & 64-bit) - *Expected to work, but not officially tested.*

## Minimum Hardware Requirements

-   **Processor:** 1 GHz or faster processor
-   **RAM:** 2 GB
-   **Hard Disk Space:** 200 MB for application files. Additional space is required for downloading and installing drivers.
-   **Display:** 1024x768 screen resolution or higher.

## Runtime & Browser Requirements

The application's user interface is built on modern web technologies and requires a compatible browser or webview environment.

-   :white_check_mark: **Google Chrome** (Version 89 or newer)
-   :white_check_mark: **Microsoft Edge** (Chromium-based, Version 89 or newer)
-   :warning: **Firefox, Safari, and others:** These browsers **do not** support the **Web Serial API**, which is required for the Hardware Monitor feature. The core driver scanning functionality will work, but the "Connect Device" feature in the settings will be unavailable or non-functional.

### Internet Connection

-   **Offline Mode:** No internet connection is required to use the Offline Mode. Scanning is performed against a local database of drivers.
-   **Online Mode:** A stable internet connection is required to use the Online Mode, as it communicates with the Google Gemini API to fetch the latest driver information from the cloud.

### Web Serial API

The **Hardware Monitor** feature is an advanced capability that allows MangoDriver Pro to connect to external hardware (like a microcontroller) for diagnostic purposes. This feature is exclusively available in browsers that support the Web Serial API, such as Google Chrome and Microsoft Edge. Users on other browsers will see a notification that the API is not supported.
