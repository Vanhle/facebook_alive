# Facebook Automation Script

This project automates interactions with Facebook, such as posting content or browsing the platform, based on tasks specified in an Excel file. It uses browser automation tools to mimic human behavior, including realistic mouse movements, and updates task statuses in the Excel file.

## Table of Contents
- [Overview](#overview)
- [Workflow](#workflow)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Excel File Structure](#excel-file-structure)
- [Notes](#notes)
- [License](#license)

## Overview
The script reads tasks from an Excel file (`script.xlsx`) and performs actions on Facebook, such as:
- **Posting**: Creates a post with text and optional images.
- **Surfing**: Simulates browsing by scrolling and moving the mouse randomly for a specified duration.

Tasks are filtered to only process those marked "Pending" for the current date. The script uses:
- **GoLogin**: To manage browser profiles and avoid detection.
- **Puppeteer**: For browser automation.
- **Ghost Cursor**: To simulate natural mouse movements.
- **XLSX**: To read and update the Excel file.
- **Moment**: For date handling.

## Workflow
1. **Read Excel File**: Loads tasks from `materials/script.xlsx`.
2. **Filter Tasks**: Identifies tasks marked "Pending" for the current date (format: `M/D/YY`).
3. **Start Browser**: Launches a browser instance using GoLogin with the specified profile.
4. **Navigate to Facebook**: Ensures the browser is on `facebook.com`.
5. **Process Tasks**:
   - For `post` tasks: Enters content, optionally uploads an image, and submits the post.
   - For `surf` tasks: Scrolls and moves the mouse randomly for the specified duration (in seconds).
6. **Update Excel**: Marks tasks as "Done" or "Error" and logs the result with a timestamp.
7. **Close Browser**: Cleans up after processing all tasks.

## Prerequisites
- **Node.js**: Version 16 or higher.
- **GoLogin Account**: Required for browser profile management. Obtain a token and profile ID from [GoLogin](https://www.gologin.com/).
- **Excel File**: A file named `script.xlsx` in the `materials` directory with the required structure (see [Excel File Structure](#excel-file-structure)).
- **Facebook Account**: Ensure the GoLogin profile is logged into Facebook.

## Installation
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   This installs the required packages: `gologin`, `puppeteer-core`, `ghost-cursor`, `xlsx`, `moment`.

3. **Set Up the Excel File**:
   - Place `script.xlsx` in the `materials` directory.
   - Ensure it follows the structure described in [Excel File Structure](#excel-file-structure).

4. **Configure GoLogin**:
   - Update the `config` object in the script with your GoLogin `token` and `profile_id`.

## Configuration
Edit the script to include your GoLogin credentials:
```javascript
const config = {
    token: 'your-gologin-token',
    profile_id: 'your-profile-id'
};
```

Ensure the `EXCEL_FILE` path is correct:
```javascript
const EXCEL_FILE = 'materials/script.xlsx';
```

## Usage
1. **Prepare the Excel File**:
   - Add tasks to `script.xlsx` with the required columns (see [Excel File Structure](#excel-file-structure)).
   - Set `Status` to `Pending` and `Datetime` to the current date (e.g., `5/13/25`) for tasks to be processed.
   - Example task processing logic:
     ```javascript
     async function processRow(page, cursor, row, workbook, rowIndex) {
         if (row.Status === 'Pending') {
             if (row.Type.toLowerCase() === 'post') {
                 await createPost(page, cursor, row.Content, row.Image);
             } else if (row.Type.toLowerCase() === 'surf') {
                 await surfFacebook(page, cursor, parseInt(row.Content) || 60);
             }
         }
     }
     ```

2. **Run the Script**:
   ```bash
   node index.js
   ```
   Replace `index.js` with the name of your script file.

3. **Monitor Output**:
   - The script logs progress to the console.
   - Check `script.xlsx` for updated `Status` and `Log` columns.

## Excel File Structure
The Excel file (`script.xlsx`) must have the following columns:
| Datetime | Type   | Content          | Image          | Status  | Log  |
|----------|--------|------------------|----------------|---------|------|
| M/D/YY   | post/surf | Post text or duration (seconds) | Image path (optional) | Pending/Done/Error | Log message |

- **Datetime**: Date of the task (e.g., `5/13/25`).
- **Type**: `post` for posting content, `surf` for browsing.
- **Content**: For `post`, the text to post; for `surf`, the duration in seconds (e.g., `60`).
- **Image**: File path to an image for `post` tasks (optional).
- **Status**: `Pending` for tasks to process, updated to `Done` or `Error`.
- **Log**: Stores the result or error message with a timestamp.

## Notes
- **GoLogin**: Ensure your profile is logged into Facebook to avoid login prompts.
- **Image Paths**: Use absolute paths or paths relative to the script for image uploads.
- **Error Handling**: The script logs errors to the Excel file and console. Check the `Log` column for details.
- **Performance**: Random delays and mouse movements are used to mimic human behavior, which may slow down execution.
- **Dependencies**: Ensure all npm packages are installed correctly. If issues arise, try:
  ```bash
  npm install <package>
  ```

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.