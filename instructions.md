# Project Setup Guide (From Zip File)

Follow this step-by-step guide to run the project.

## Step 1: Install Node.js (Required)
You need **Node.js** installed on your computer to run this application.

1.  **Download Node.js**:
    *   Go to the official website: [https://nodejs.org/](https://nodejs.org/)
    *   Download the **LTS (Long Term Support)** version (Recommended).
    *   Run the installer and follow the on-screen instructions (accept defaults).
2.  **Verify Installation**:
    *   Open your terminal (Command Prompt, PowerShell, or Terminal).
    *   Type `node -v` and press Enter. You should see a version number (e.g., `v20.x.x`).
    *   Type `npm -v` and press Enter. You should see a version number.

## Step 2: Extract and Open the Project
1.  **Unzip the file**: Right-click the `.zip` file you received and extract it to a folder on your computer.
2.  **Open in Terminal**:a
    *   Open your terminal.
    *   Navigate to the extracted folder using the `cd` command.
    *   *Example (Windows):* `cd C:\Users\YourName\Downloads\autochat_app`
    *   *Example (Mac):* `cd ~/Downloads/autochat_app`

## Step 3: Install Dependencies
Since the project does not include the heavy `node_modules` folder, you must download the libraries first.

1.  In your terminal (inside the project folder), run:
    ```bash
    npm install
    ```
2.  Wait for the process to complete. It may take a few minutes.

## Step 4: Configure API Key
1.  Inside the project folder, look for a file named `.env.local`.
    *   *If it doesn't exist, create a new file named `.env.local`.*
2.  Open `.env.local` with any text editor (Notepad, VS Code, TextEdit).
3.  Paste the following into it:
    ```env
    HEYGEN_API_KEY=your_actual_heygen_api_key_here
    NEXT_PUBLIC_BASE_API_URL=https://api.heygen.com
    ```
4.  **Crucial:** Replace `your_actual_heygen_api_key_here` with your real HeyGen Enterprise API Key.

## Step 5: Run the App
1.  Start the local server by running:
    ```bash
    npm run dev
    ```
2.  You should behold a message like `Ready in x.xs` and `Local: http://localhost:3000`.

## Step 6: Use the App
1.  Open your web browser (Chrome is recommended).
2.  Go to: **[http://localhost:3000](http://localhost:3000)**
3.  Click "Start Session" to interact with the avatar.

---
**Note:** You do NOT need a purchase token locally right now; just click Start.
