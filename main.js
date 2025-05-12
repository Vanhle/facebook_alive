import GoLogin from 'gologin';
import puppeteer from 'puppeteer-core';
import { createCursor } from 'ghost-cursor';
import XLSX from 'xlsx';
import moment from 'moment';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXCEL_FILE = 'materials/script.xlsx';
const FB_URL = 'https://www.facebook.com';

const config = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODIxODdmODdlNDYwYzE0NDhkOTdlZjIiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2ODIxYTAzYjhlNTQ1NTJkNTE4NGQxODcifQ.VIkUirhAhp2MjVhbBup8XLqqsS4wkSfZRcel0qF8LHQ',
    profile_id: '67c803048a8f4f9417d8ba90'
};

// Hàm đọc dữ liệu từ file Excel
function readExcelFile() {
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { raw: false });
    return { workbook, sheet, data };
}

// Hàm cập nhật trạng thái và log trong file Excel
function updateExcelFile(workbook, rowIndex, status, logMessage) {
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Đọc lại toàn bộ dữ liệu hiện tại
    const currentData = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });
    
    // Cập nhật Status và Log cho dòng cụ thể
    currentData[rowIndex - 1].Status = status;
    currentData[rowIndex - 1].Log = logMessage;
    
    // Tạo worksheet mới từ dữ liệu đã cập nhật
    const newSheet = XLSX.utils.json_to_sheet(currentData, { 
        header: ["Datetime", "Content", "Image", "Status", "Log"]
    });
    
    // Cập nhật lại worksheet trong workbook
    workbook.Sheets[workbook.SheetNames[0]] = newSheet;
    
    // Lưu file
    XLSX.writeFile(workbook, EXCEL_FILE, { bookType: 'xlsx' });
    
    console.log(`Đã cập nhật dòng ${rowIndex}: Status=${status}, Log=${logMessage}`);
}

// Hàm kiểm tra xem bài đăng có phải cho ngày hôm nay và đang pending
function isPostForTodayAndPending(post) {
    const today = moment().format('M/D/YYYY');
    const postDateFormatted = moment(post.Datetime, 'M/D/YYYY').format('M/D/YYYY');
    return today === postDateFormatted && post.Status === 'Pending';
}

// Hàm tạo điểm ngẫu nhiên trong viewport
async function getRandomPoint(page) {
    const viewport = await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight
    }));
    
    return {
        x: Math.floor(Math.random() * viewport.width),
        y: Math.floor(Math.random() * viewport.height)
    };
}

// Hàm delay ngẫu nhiên
async function randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
}

// Hàm để hiển thị con trỏ chuột
async function installMouseHelper(page) {
    await page.evaluate(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .mouse-helper {
                pointer-events: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 20px;
                height: 20px;
                background-color: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(0, 0, 0, 0.8);
                border-radius: 50%;
                margin-left: -10px;
                margin-top: -10px;
                transition: background-color 0.2s ease;
                z-index: 999999;
            }
            .mouse-helper.button-1 { background-color: rgba(0, 0, 0, 0.8); }
            .mouse-helper.button-2 { background-color: rgba(0, 0, 255, 0.8); }
            .mouse-helper.button-3 { background-color: rgba(255, 0, 0, 0.8); }
            .mouse-helper.button-4 { background-color: rgba(0, 255, 0, 0.8); }
            .mouse-helper.button-5 { background-color: rgba(255, 0, 255, 0.8); }
        `;
        document.head.appendChild(style);
        const box = document.createElement('div');
        box.classList.add('mouse-helper');
        document.body.appendChild(box);

        window.addEventListener('mousemove', event => {
            box.style.left = event.pageX + 'px';
            box.style.top = event.pageY + 'px';
            event.stopPropagation();
        }, true);

        window.addEventListener('mousedown', event => {
            box.classList.add('button-' + event.which);
            event.stopPropagation();
        }, true);
        window.addEventListener('mouseup', event => {
            box.classList.remove('button-' + event.which);
            event.stopPropagation();
        }, true);

        const observer = new MutationObserver(() => {
            if (!document.querySelector('.mouse-helper')) {
                document.body.appendChild(box);
            }
        });
        observer.observe(document.body, {
            childList: true
        });
    });
}

// Hàm đăng bài với nội dung và ảnh
async function createPost(page, cursor, content, imagePath = null) {
    try {
        // Click để mở popup
        await cursor.moveTo({
            x: 750,
            y: 105
        }, {
            moveSpeed: 'natural',
            moveDelay: 1500,
            randomizeMoveDelay: true
        });

        await cursor.click(undefined, {
            moveDelay: 1000,
            hesitate: 500,
            waitForClick: 200,
            clickCount: 1,
            moveSpeed: 'natural'
        });

        console.log('Đã mở popup đăng bài');
        await randomDelay(1000, 2000);

        // Nhập nội dung
        const textareaSelector = 'div[contenteditable="true"][role="textbox"]';
        await page.waitForSelector(textareaSelector);
        
        const textareaElement = await page.$(textareaSelector);
        const textareaBox = await textareaElement.boundingBox();
        await cursor.moveTo({
            x: textareaBox.x + textareaBox.width / 2,
            y: textareaBox.y + textareaBox.height / 2
        });
        
        await cursor.click();
        await page.keyboard.type(content, { delay: 100 });

        // Nếu có ảnh, thêm ảnh vào bài đăng
        if (imagePath) {
            console.log('Đang thêm ảnh:', imagePath);
            
            // Click nút thêm ảnh/video
            const mediaButtonSelector = 'div[aria-label="Ảnh/video"]';
            await page.waitForSelector(mediaButtonSelector);
            const mediaButton = await page.$(mediaButtonSelector);
            const mediaButtonBox = await mediaButton.boundingBox();
            
            await cursor.moveTo({
                x: mediaButtonBox.x + mediaButtonBox.width / 2,
                y: mediaButtonBox.y + mediaButtonBox.height / 2
            });
            await cursor.click();
            
            // Đợi input file xuất hiện và upload ảnh
            const fileInput = await page.waitForSelector('input[type="file"]');
            await fileInput.uploadFile(imagePath);
            
            // Đợi ảnh tải lên
            await randomDelay(2000, 3000);
        }

        // Click nút đăng
        const postButtonSelector = 'div[aria-label="Đăng"]';
        await page.waitForSelector(postButtonSelector);
        
        const postButton = await page.$(postButtonSelector);
        const postButtonBox = await postButton.boundingBox();
        
        await cursor.moveTo({
            x: postButtonBox.x + postButtonBox.width / 2,
            y: postButtonBox.y + postButtonBox.height / 2
        });
        
        await cursor.click();
        console.log('Đã đăng bài thành công');
        
        // Đợi bài đăng được xử lý
        await randomDelay(3000, 5000);
        return { success: true };
    } catch (error) {
        console.error('Lỗi khi đăng bài:', error);
        return { success: false, error: error.message };
    }
}

// Hàm chính
(async () => {
    let browser;
    const GL = new GoLogin(config);

    try {
        // Đọc dữ liệu từ Excel
        const { workbook, data } = readExcelFile();
        const todayPendingPosts = data.filter(post => isPostForTodayAndPending(post));

        if (todayPendingPosts.length === 0) {
            console.log('Không có bài đăng pending nào cho ngày hôm nay');
            return;
        }

        console.log(`Có ${todayPendingPosts.length} bài đăng pending cần xử lý cho ngày hôm nay`);

        const { status, wsUrl } = await GL.start().catch((e) => {
            console.error(e);
            return { status: 'failure' };
        });

        if (status === 'failure') {
            throw new Error('Không thể khởi động trình duyệt');
        }

        console.log('Trình duyệt đã được khởi động thành công');
        console.log('WebSocket URL:', wsUrl);

        browser = await puppeteer.connect({
            browserWSEndpoint: wsUrl.toString(),
            defaultViewport: null
        });

        const pages = await browser.pages();
        const page = pages[0];

        // Kiểm tra và điều hướng về Facebook nếu cần
        const currentUrl = await page.url();
        if (!currentUrl.includes('facebook.com')) {
            console.log('Đang điều hướng về Facebook...');
            await page.goto(FB_URL, { waitUntil: 'networkidle0' });
            await randomDelay(3000, 5000);
        }

        await installMouseHelper(page);
        console.log('Đã kích hoạt hiển thị con trỏ chuột');

        await new Promise(resolve => setTimeout(resolve, 5000));

        const cursor = createCursor(page, {
            start: { x: 0, y: 0 },
            performRandomMoves: true,
            defaultOptions: {
                moveSpeed: 'natural',
                moveDelay: 2000,
                randomizeMoveDelay: true,
                paddingPercentage: 30
            }
        });

        // Xử lý từng bài đăng
        for (let i = 0; i < data.length; i++) {
            const post = data[i];
            if (isPostForTodayAndPending(post)) {
                console.log('Đang xử lý bài đăng:', post.Content);
                
                // Kiểm tra lại URL trước mỗi lần đăng để đảm bảo vẫn ở Facebook
                const currentUrl = await page.url();
                if (!currentUrl.includes('facebook.com')) {
                    console.log('Đang điều hướng về Facebook...');
                    await page.goto(FB_URL, { waitUntil: 'networkidle0' });
                    await randomDelay(3000, 5000);
                }
                
                const result = await createPost(page, cursor, post.Content, post.Image || null);
                
                // Cập nhật trạng thái và log
                const currentTime = moment().format('M/D/YYYY H:mm');
                if (result.success) {
                    updateExcelFile(workbook, i + 1, 'Done', currentTime);
                    console.log('Đã cập nhật trạng thái và log:', currentTime);
                } else {
                    const errorLog = `Error at ${currentTime}: ${result.error}`;
                    updateExcelFile(workbook, i + 1, 'Error', errorLog);
                    console.log('Đã cập nhật lỗi:', errorLog);
                }
                
                await randomDelay(5000, 10000); // Đợi giữa các bài đăng
            }
        }

    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('Đã đóng trình duyệt');
        }
    }
})();