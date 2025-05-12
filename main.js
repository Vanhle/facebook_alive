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
    
    // Log để debug
    console.log('Sheet Range:', sheet['!ref']);
    
    // Đọc dữ liệu với header từ Excel
    const data = XLSX.utils.sheet_to_json(sheet, { 
        raw: false,
        defval: '',
        blankrows: false
    });
    
    // Log dữ liệu để debug
    console.log('Dữ liệu từ Excel:', JSON.stringify(data, null, 2));
    
    return { workbook, sheet, data };
}

// Hàm cập nhật trạng thái và log trong file Excel
function updateExcelFile(workbook, rowIndex, status, logMessage) {
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Cập nhật trực tiếp các cell
    const statusCell = XLSX.utils.encode_cell({r: rowIndex, c: 4}); // Cột E (Status)
    const logCell = XLSX.utils.encode_cell({r: rowIndex, c: 5}); // Cột F (Log)
    
    sheet[statusCell] = { t: 's', v: status };
    sheet[logCell] = { t: 's', v: logMessage };
    
    // Lưu file
    XLSX.writeFile(workbook, EXCEL_FILE, { bookType: 'xlsx' });
    
    console.log(`Đã cập nhật dòng ${rowIndex}: Status=${status}, Log=${logMessage}`);
}

// Hàm kiểm tra xem bài đăng có phải cho ngày hôm nay và đang pending
function isPostForTodayAndPending(post) {
    // Log để debug
    console.log('Kiểm tra post:', JSON.stringify(post, null, 2));
    
    if (!post.Datetime || !post.Type || !post.Status) {
        console.log('Post không hợp lệ:', post);
        return false;
    }
    
    // Chuyển đổi ngày hiện tại sang định dạng M/D/YY
    const today = moment().format('M/D/YY');
    
    // Chuyển đổi ngày từ post sang định dạng M/D/YY
    const postDate = moment(post.Datetime, ['M/D/YY', 'M/D/YYYY']).format('M/D/YY');
    
    console.log('So sánh ngày:', {
        today,
        postDate,
        postStatus: post.Status,
        postType: post.Type
    });
    
    const validTypes = ['post', 'surf'];
    
    return today === postDate && 
           post.Status === 'Pending' && 
           validTypes.includes(post.Type.toLowerCase());
}

// Hàm tạo delay ngẫu nhiên
function randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

// Hàm lấy điểm ngẫu nhiên trên trang
async function getRandomPoint(page) {
    const viewport = await page.evaluate(() => ({
        width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    }));
    
    return {
        x: Math.floor(Math.random() * (viewport.width - 100)) + 50,
        y: Math.floor(Math.random() * (viewport.height - 100)) + 50
    };
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

// Hàm lướt Facebook
async function surfFacebook(page, cursor, duration) {
    try {
        // Kiểm tra và chuẩn hóa thời gian
        let validDuration = 60; // Mặc định 60 giây
        
        // Chuyển đổi duration thành số
        const parsedDuration = parseInt(duration);
        if (!isNaN(parsedDuration) && parsedDuration >= 30) {
            validDuration = parsedDuration;
        } else {
            console.log(`Thời gian ${duration} không hợp lệ hoặc nhỏ hơn 30 giây, sử dụng mặc định 60 giây`);
        }
        
        console.log(`Bắt đầu lướt Facebook trong ${validDuration} giây`);
        const startTime = Date.now();
        
        while (Date.now() - startTime < validDuration * 1000) {
            // Di chuyển chuột đến một điểm ngẫu nhiên trên trang
            const randomPoint = await getRandomPoint(page);
            await cursor.moveTo(randomPoint, {
                moveDelay: 2000, // Tăng thời gian di chuyển
                moveSpeed: 'slow' // Giảm tốc độ di chuyển
            });
            
            // Cuộn trang một khoảng ngẫu nhiên nhỏ hơn
            await page.evaluate(() => {
                const scrollAmount = Math.random() * 300 + 100; // Giảm khoảng cuộn từ 100-400px
                window.scrollBy(0, scrollAmount);
            });
            
            // Tăng thời gian delay giữa các lần cuộn
            await randomDelay(2500, 4000);
            
            // Thỉnh thoảng dừng lại lâu hơn để "đọc"
            if (Math.random() < 0.2) { // 20% cơ hội dừng lại
                console.log('Dừng lại để đọc...');
                await randomDelay(4000, 6000);
            }
        }
        
        console.log('Đã hoàn thành lướt Facebook');
        return { success: true };
    } catch (error) {
        console.error('Lỗi khi lướt Facebook:', error);
        return { success: false, error: error.message };
    }
}

async function processRow(page, cursor, row, workbook, rowIndex) {
    try {
        const currentDate = new Date().toLocaleDateString('en-US');
        const rowDate = new Date(row.Datetime).toLocaleDateString('en-US');
        
        if (rowDate === currentDate && row.Status === 'Pending') {
            let result;
            
            // Kiểm tra và điều hướng về facebook.com
            const currentUrl = await page.url();
            if (!currentUrl.includes('facebook.com')) {
                await page.goto('https://www.facebook.com');
                await page.waitForSelector('[role="main"]');
            }

            switch (row.Type.toLowerCase()) {
                case 'post':
                    result = await createPost(page, cursor, row.Content, row.Image);
                    break;
                case 'surf':
                    const duration = parseInt(row.Content) || 60; // Mặc định 60 giây nếu không hợp lệ
                    result = await surfFacebook(page, cursor, duration);
                    break;
                default:
                    console.log(`Không hỗ trợ loại ${row.Type}`);
                    return;
            }

            const currentTime = moment().format('M/D/YYYY H:mm');
            if (result.success) {
                updateExcelFile(workbook, rowIndex + 1, 'Done', currentTime);
            } else {
                const errorLog = `Error at ${currentTime}: ${result.error}`;
                updateExcelFile(workbook, rowIndex + 1, 'Error', errorLog);
            }
        }
    } catch (error) {
        console.error('Lỗi khi xử lý hàng:', error);
        const errorTime = moment().format('M/D/YYYY H:mm');
        updateExcelFile(workbook, rowIndex + 1, 'Error', `Error at ${errorTime}: ${error.message}`);
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
                console.log(`Đang xử lý hành động ${post.Type}: ${post.Content}`);
                await processRow(page, cursor, post, workbook, i);
                await randomDelay(5000, 10000); // Đợi giữa các hành động
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