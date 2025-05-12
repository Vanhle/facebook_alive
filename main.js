import GoLogin from 'gologin';
import puppeteer from 'puppeteer-core';
import { createCursor } from 'ghost-cursor';

const config = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODIxODdmODdlNDYwYzE0NDhkOTdlZjIiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2ODIxYTAzYjhlNTQ1NTJkNTE4NGQxODcifQ.VIkUirhAhp2MjVhbBup8XLqqsS4wkSfZRcel0qF8LHQ',
    profile_id: '67c803048a8f4f9417d8ba90'
};

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
    // Inject CSS
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
            .mouse-helper.button-1 {
                background-color: rgba(0, 0, 0, 0.8);
            }
            .mouse-helper.button-2 {
                background-color: rgba(0, 0, 255, 0.8);
            }
            .mouse-helper.button-3 {
                background-color: rgba(255, 0, 0, 0.8);
            }
            .mouse-helper.button-4 {
                background-color: rgba(0, 255, 0, 0.8);
            }
            .mouse-helper.button-5 {
                background-color: rgba(255, 0, 255, 0.8);
            }
        `;
        document.head.appendChild(style);

        // Tạo element cho con trỏ chuột
        const box = document.createElement('div');
        box.classList.add('mouse-helper');
        document.body.appendChild(box);

        // Cập nhật vị trí con trỏ
        window.addEventListener('mousemove', event => {
            box.style.left = event.pageX + 'px';
            box.style.top = event.pageY + 'px';
            event.stopPropagation();
        }, true);

        // Hiệu ứng khi click
        window.addEventListener('mousedown', event => {
            box.classList.add('button-' + event.which);
            event.stopPropagation();
        }, true);
        window.addEventListener('mouseup', event => {
            box.classList.remove('button-' + event.which);
            event.stopPropagation();
        }, true);

        // Đảm bảo con trỏ luôn hiển thị
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

(async () => {
    const GL = new GoLogin(config);
    let browser;
    
    try {
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

        // Cài đặt helper hiển thị con trỏ chuột
        await installMouseHelper(page);
        console.log('Đã kích hoạt hiển thị con trỏ chuột');

        // Đợi trang load xong
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Cấu hình ghost cursor với các tùy chọn nâng cao
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

        // Thực hiện một số chuyển động ngẫu nhiên trước khi click
        await cursor.toggleRandomMove(true);
        
        // Di chuyển đến một điểm ngẫu nhiên trên trang
        const randomPoint = await getRandomPoint(page);
        await cursor.moveTo(randomPoint, {
            moveSpeed: 'natural',
            moveDelay: 1000,
            randomizeMoveDelay: true
        });
        
        // Di chuyển đến vị trí mục tiêu với các tùy chọn tự nhiên
        await cursor.moveTo({
            x: 750,
            y: 105
        }, {
            moveSpeed: 'natural',
            moveDelay: 1500,
            randomizeMoveDelay: true
        });

        // Click để mở popup
        await cursor.click(undefined, {
            moveDelay: 1000,
            hesitate: 500,
            waitForClick: 200,
            clickCount: 1,
            moveSpeed: 'natural'
        });

        console.log('Đã click vào vị trí "Bạn đang nghĩ gì" với chuyển động tự nhiên');

        // Đợi popup xuất hiện
        await randomDelay(1000, 2000);

        // Tìm và focus vào textarea để nhập nội dung
        const textareaSelector = 'div[contenteditable="true"][role="textbox"]';
        await page.waitForSelector(textareaSelector);
        
        // Di chuyển chuột đến textarea
        const textareaElement = await page.$(textareaSelector);
        const textareaBox = await textareaElement.boundingBox();
        await cursor.moveTo({
            x: textareaBox.x + textareaBox.width / 2,
            y: textareaBox.y + textareaBox.height / 2
        });
        
        // Click vào textarea
        await cursor.click();
        
        // Gõ nội dung với tốc độ tự nhiên
        const content = "Hiii everyone";
        await page.keyboard.type(content, { delay: 100 });

        await randomDelay(1000, 2000);

        // Tìm và click nút đăng
        const postButtonSelector = 'div[aria-label="Đăng"]';
        await page.waitForSelector(postButtonSelector);
        
        const postButton = await page.$(postButtonSelector);
        const postButtonBox = await postButton.boundingBox();
        
        // Di chuyển đến nút đăng
        await cursor.moveTo({
            x: postButtonBox.x + postButtonBox.width / 2,
            y: postButtonBox.y + postButtonBox.height / 2
        });
        
        // Click nút đăng
        await cursor.click();

        console.log('Đã đăng bài viết thành công');
        
        // Đợi một chút để đảm bảo bài đăng được xử lý
        await randomDelay(3000, 5000);
        
    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();