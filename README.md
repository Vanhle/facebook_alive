# Facebook Automation Script

[English version below](#english)

Dự án này tự động hóa các tương tác với Facebook như đăng bài, lướt feed, like và comment dựa trên các tác vụ được chỉ định trong file Excel. Sử dụng các công cụ tự động hóa trình duyệt để mô phỏng hành vi người dùng thực, bao gồm di chuyển chuột tự nhiên và cập nhật trạng thái tác vụ trong file Excel.

## Mục lục
- [Tổng quan](#tổng-quan)
- [Quy trình làm việc](#quy-trình-làm-việc)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Sử dụng](#sử-dụng)
- [Cấu trúc File Excel](#cấu-trúc-file-excel)
- [Ghi chú](#ghi-chú)
- [Giấy phép](#giấy-phép)

## Tổng quan
Script đọc các tác vụ từ file Excel (`script.xlsx`) và thực hiện các hành động trên Facebook, bao gồm:
- **Đăng bài**: Tạo bài viết với nội dung văn bản và hình ảnh tùy chọn
- **Lướt feed**: Mô phỏng việc duyệt bằng cách cuộn và di chuyển chuột ngẫu nhiên
- **Like/React**: Thực hiện các reaction ngẫu nhiên trên các bài viết
- **Comment**: Bình luận tự động với nội dung từ file comments.json

Các tác vụ được lọc để chỉ xử lý những tác vụ được đánh dấu "Pending" cho ngày hiện tại. Script sử dụng:
- **GoLogin**: Quản lý profile trình duyệt và tránh phát hiện
- **Puppeteer**: Tự động hóa trình duyệt
- **Ghost Cursor**: Mô phỏng di chuyển chuột tự nhiên
- **XLSX**: Đọc và cập nhật file Excel
- **Moment**: Xử lý thời gian

## Quy trình làm việc
1. **Đọc File Excel**: Tải tác vụ từ `materials/script.xlsx`
2. **Lọc tác vụ**: Xác định các tác vụ đánh dấu "Pending" cho ngày hiện tại (định dạng: `M/D/YY`)
3. **Khởi động trình duyệt**: Khởi chạy trình duyệt sử dụng GoLogin với profile đã chỉ định
4. **Điều hướng Facebook**: Đảm bảo trình duyệt đang ở `facebook.com`
5. **Xử lý tác vụ**:
   - Tác vụ `post`: Nhập nội dung, tải lên hình ảnh (nếu có) và đăng bài
   - Tác vụ `surf`: Cuộn và di chuyển chuột ngẫu nhiên trong thời gian chỉ định
   - Tác vụ `like`: Thực hiện reaction ngẫu nhiên trên số lượng bài viết chỉ định
   - Tác vụ `comment`: Bình luận tự động với nội dung ngẫu nhiên từ file comments.json
6. **Cập nhật Excel**: Đánh dấu tác vụ là "Done" hoặc "Error" và ghi log kết quả với timestamp
7. **Đóng trình duyệt**: Dọn dẹp sau khi xử lý tất cả tác vụ

## Yêu cầu hệ thống
- **Node.js**: Phiên bản 16 trở lên
- **Tài khoản GoLogin**: Yêu cầu cho quản lý profile trình duyệt. Lấy token và profile ID từ [GoLogin](https://www.gologin.com/)
- **File Excel**: File `script.xlsx` trong thư mục `materials` với cấu trúc yêu cầu
- **File Comments**: File `comments.json` trong thư mục `materials` chứa danh sách comment mẫu
- **Tài khoản Facebook**: Đảm bảo profile GoLogin đã đăng nhập vào Facebook

## Cài đặt
1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Cài đặt Dependencies**:
   ```bash
   npm install
   ```
   Cài đặt các package cần thiết: `gologin`, `puppeteer-core`, `ghost-cursor`, `xlsx`, `moment`

3. **Thiết lập file Excel và Comments**:
   - Đặt `script.xlsx` trong thư mục `materials`
   - Đặt `comments.json` trong thư mục `materials`
   - Đảm bảo tuân thủ cấu trúc mô tả trong [Cấu trúc File Excel](#cấu-trúc-file-excel)

4. **Cấu hình GoLogin**:
   - Cập nhật object `config` trong script với `token` và `profile_id` của bạn

## Cấu hình
Chỉnh sửa script để thêm thông tin đăng nhập GoLogin:
```javascript
const config = {
    token: 'your-gologin-token',
    profile_id: 'your-profile-id'
};
```

Đảm bảo đường dẫn `EXCEL_FILE` chính xác:
```javascript
const EXCEL_FILE = 'materials/script.xlsx';
```

## Sử dụng
1. **Chuẩn bị File Excel**:
   - Thêm tác vụ vào `script.xlsx` với các cột yêu cầu
   - Đặt `Status` là `Pending` và `Datetime` là ngày hiện tại
   - Ví dụ logic xử lý tác vụ:
     ```javascript
     async function processRow(page, cursor, row, workbook, rowIndex) {
         if (row.Status === 'Pending') {
             switch(row.Type.toLowerCase()) {
                 case 'post':
                     await createPost(page, cursor, row.Content, row.Image);
                     break;
                 case 'surf':
                     await surfFacebook(page, cursor, parseInt(row.Content));
                     break;
                 case 'like':
                     await reactRandomPosts(page, cursor, parseInt(row.Content));
                     break;
                 case 'comment':
                     await commentRandomPosts(page, cursor, parseInt(row.Content));
                     break;
             }
         }
     }
     ```

2. **Chạy Script**:
   ```bash
   node index.js
   ```

3. **Theo dõi Output**:
   - Script ghi log tiến trình vào console
   - Kiểm tra `script.xlsx` để xem cột `Status` và `Log` được cập nhật

## Cấu trúc File Excel
File Excel (`script.xlsx`) phải có các cột sau:
| Datetime | Type | Content | Image | Status | Log |
|----------|------|---------|-------|--------|-----|
| M/D/YY | post/surf/like/comment | Nội dung post hoặc số lượng | Đường dẫn ảnh (tùy chọn) | Pending/Done/Error | Log message |

- **Datetime**: Ngày của tác vụ (VD: `5/13/25`)
- **Type**: `post` để đăng bài, `surf` để lướt, `like` để thả tim, `comment` để bình luận
- **Content**: 
  - Với `post`: nội dung bài viết
  - Với `surf`: thời gian lướt (giây)
  - Với `like`: số lượng reaction
  - Với `comment`: số lượng comment
- **Image**: Đường dẫn đến file ảnh cho tác vụ `post` (tùy chọn)
- **Status**: `Pending` cho tác vụ cần xử lý, được cập nhật thành `Done` hoặc `Error`
- **Log**: Lưu kết quả hoặc thông báo lỗi với timestamp

## Ghi chú
- **GoLogin**: Đảm bảo profile đã đăng nhập Facebook để tránh prompt đăng nhập
- **Đường dẫn ảnh**: Sử dụng đường dẫn tuyệt đối hoặc tương đối với script
- **Xử lý lỗi**: Script ghi log lỗi vào file Excel và console
- **Hiệu suất**: Sử dụng delay ngẫu nhiên và di chuyển chuột để mô phỏng hành vi người dùng
- **Comments**: Đảm bảo file `comments.json` chứa đủ nội dung comment mẫu
- **Dependencies**: Nếu gặp vấn đề, thử cài đặt lại package:
  ```bash
  npm install <package>
  ```

## Giấy phép
Dự án này được cấp phép theo Giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

<a name="english"></a>
# Facebook Automation Script (English)

This project automates Facebook interactions such as posting, feed scrolling, liking, and commenting based on tasks specified in an Excel file. It uses browser automation tools to simulate real user behavior, including natural mouse movements and task status updates in the Excel file.

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
The script reads tasks from an Excel file (`script.xlsx`) and performs actions on Facebook, including:
- **Posting**: Creates posts with text content and optional images
- **Feed Scrolling**: Simulates browsing by scrolling and moving the mouse randomly
- **Like/React**: Performs random reactions on posts
- **Comment**: Automatic commenting with content from comments.json

Tasks are filtered to only process those marked "Pending" for the current date. The script uses:
- **GoLogin**: For browser profile management and detection avoidance
- **Puppeteer**: For browser automation
- **Ghost Cursor**: For natural mouse movement simulation
- **XLSX**: For Excel file reading and updating
- **Moment**: For time handling

## Workflow
1. **Read Excel File**: Loads tasks from `materials/script.xlsx`
2. **Filter Tasks**: Identifies tasks marked "Pending" for the current date (format: `M/D/YY`)
3. **Start Browser**: Launches browser instance using GoLogin with specified profile
4. **Navigate to Facebook**: Ensures browser is on `facebook.com`
5. **Process Tasks**:
   - `post` tasks: Enter content, upload images (if any) and post
   - `surf` tasks: Scroll and move mouse randomly for specified duration
   - `like` tasks: Perform random reactions on specified number of posts
   - `comment` tasks: Auto-comment with random content from comments.json
6. **Update Excel**: Mark tasks as "Done" or "Error" and log results with timestamp
7. **Close Browser**: Clean up after processing all tasks

## Prerequisites
- **Node.js**: Version 16 or higher
- **GoLogin Account**: Required for browser profile management. Get token and profile ID from [GoLogin](https://www.gologin.com/)
- **Excel File**: `script.xlsx` in `materials` directory with required structure
- **Comments File**: `comments.json` in `materials` directory containing sample comments
- **Facebook Account**: Ensure GoLogin profile is logged into Facebook

## Installation
1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   Installs required packages: `gologin`, `puppeteer-core`, `ghost-cursor`, `xlsx`, `moment`

3. **Set Up Excel and Comments Files**:
   - Place `script.xlsx` in `materials` directory
   - Place `comments.json` in `materials` directory
   - Ensure compliance with structure described in [Excel File Structure](#excel-file-structure)

4. **Configure GoLogin**:
   - Update `config` object in script with your `token` and `profile_id`

## Configuration
Edit script to add GoLogin credentials:
```javascript
const config = {
    token: 'your-gologin-token',
    profile_id: 'your-profile-id'
};
```

Ensure `EXCEL_FILE` path is correct:
```javascript
const EXCEL_FILE = 'materials/script.xlsx';
```

## Usage
1. **Prepare Excel File**:
   - Add tasks to `script.xlsx` with required columns
   - Set `Status` to `Pending` and `Datetime` to current date
   - Example task processing logic:
     ```javascript
     async function processRow(page, cursor, row, workbook, rowIndex) {
         if (row.Status === 'Pending') {
             switch(row.Type.toLowerCase()) {
                 case 'post':
                     await createPost(page, cursor, row.Content, row.Image);
                     break;
                 case 'surf':
                     await surfFacebook(page, cursor, parseInt(row.Content));
                     break;
                 case 'like':
                     await reactRandomPosts(page, cursor, parseInt(row.Content));
                     break;
                 case 'comment':
                     await commentRandomPosts(page, cursor, parseInt(row.Content));
                     break;
             }
         }
     }
     ```

2. **Run Script**:
   ```bash
   node index.js
   ```

3. **Monitor Output**:
   - Script logs progress to console
   - Check `script.xlsx` for updated `Status` and `Log` columns

## Excel File Structure
Excel file (`script.xlsx`) must have following columns:
| Datetime | Type | Content | Image | Status | Log |
|----------|------|---------|-------|--------|-----|
| M/D/YY | post/surf/like/comment | Post content or quantity | Image path (optional) | Pending/Done/Error | Log message |

- **Datetime**: Task date (e.g., `5/13/25`)
- **Type**: `post` for posting, `surf` for browsing, `like` for reactions, `comment` for commenting
- **Content**: 
  - For `post`: post content
  - For `surf`: duration in seconds
  - For `like`: number of reactions
  - For `comment`: number of comments
- **Image**: File path to image for `post` tasks (optional)
- **Status**: `Pending` for tasks to process, updated to `Done` or `Error`
- **Log**: Stores result or error message with timestamp

## Notes
- **GoLogin**: Ensure profile is logged into Facebook to avoid login prompts
- **Image Paths**: Use absolute paths or paths relative to script
- **Error Handling**: Script logs errors to Excel file and console
- **Performance**: Uses random delays and mouse movements to simulate human behavior
- **Comments**: Ensure `comments.json` contains sufficient sample comments
- **Dependencies**: If issues arise, try reinstalling package:
  ```bash
  npm install <package>
  ```

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.