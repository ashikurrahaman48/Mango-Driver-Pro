
# Installation Guide

Follow these steps to install MangoDriver Pro on your Windows PC.

## Method 1: Using the Installer (Recommended for Most Users)

This is the easiest and recommended way to get started with MangoDriver Pro.

1.  **Download the Installer:**
    -   Navigate to the [**Latest Release page**](https://github.com/ashikurrahaman48/Mango-Driver-Pro/releases/latest) on GitHub.
    -   Under the "Assets" section, download the `MangoDriver_Pro_Setup_vX.X.X.exe` file (where `X.X.X` is the version number).

2.  **Run the Installer:**
    -   Locate the downloaded `.exe` file in your "Downloads" folder and double-click it.
    -   Windows Defender SmartScreen might show a warning because it's a new application. If this happens, click **"More info"** and then **"Run anyway"** to proceed.

3.  **Follow the Setup Wizard:**
    -   **Language Selection:** Choose your preferred language (English or Bengali).
    -   **License Agreement:** Accept the license agreement to continue.
    -   **Destination:** Choose the installation directory. The default location is recommended.
    -   **Additional Tasks:** Select if you want to create a desktop shortcut for easy access.
    -   **Install:** Review your settings and click **"Install"** to begin the installation.

4.  **Finish Installation:**
    -   Once the installation is complete, click **"Finish"**.
    -   You can now launch MangoDriver Pro from your Start Menu or the desktop shortcut if you created one.

## Method 2: Building from Source (For Developers)

If you are a developer and want to build the project from the source code, follow these steps:

1.  **Prerequisites:**
    -   [Node.js](https://nodejs.org/) (version 18 or newer recommended)
    -   [Git](https://git-scm.com/)
    -   [Inno Setup 6](https://jrsoftware.org/isinfo.php) (must be installed to compile the installer)

2.  **Clone the Repository:**
    Open your terminal or command prompt and run the following command:
    ```bash
    git clone https://github.com/ashikurrahaman48/Mango-Driver-Pro.git
    cd Mango-Driver-Pro
    ```

3.  **Install Dependencies:**
    Install the required Node.js packages.
    ```bash
    npm install
    ```

4.  **Configure API Key:**
    The application's Online Mode requires a Google Gemini API key. You will need to ensure the `process.env.API_KEY` is available in your execution environment.

5.  **Build the Application and Installer:**
    Run the provided PowerShell build script. This single command will build the React app and then compile the Inno Setup installer.
    ```powershell
    # Make sure you are in the root directory of the project
    .\build\build.ps1
    ```
    Upon completion, the final `MangoDriver_Pro_Setup.exe` file will be located in the `build/output/` folder.