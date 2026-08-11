// ==========================================
// CẤU HÌNH HỆ THỐNG (CHỈ ĐỂ Ở MÁY CÁ NHÂN)
// ==========================================
const CONFIG = {
    ADMIN_USER: "admin",                // Thay đổi tên đăng nhập của bạn
    ADMIN_PASS: "123456",               // Thay đổi mật khẩu của bạn
    GITHUB_USER: "patonline85",         // Tên user GitHub của bạn
    GITHUB_REPO: "tiemhoanhasen",       // Tên kho lưu trữ GitHub
    GITHUB_TOKEN: "ghp_DayLaTokenCuaBanKhongDuocDeLo" // Dán Token GitHub của bạn vào đây
};

// ==========================================
// LOGIC ĐĂNG NHẬP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const editorScreen = document.getElementById('editor-screen');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const errorMsg = document.getElementById('login-error');

    // Kiểm tra trạng thái đăng nhập
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        loginScreen.style.display = 'none';
        editorScreen.style.display = 'block';
    }

    // Xử lý đăng nhập
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        if (user === CONFIG.ADMIN_USER && pass === CONFIG.ADMIN_PASS) {
            sessionStorage.setItem('isLoggedIn', 'true');
            loginScreen.style.display = 'none';
            editorScreen.style.display = 'block';
            errorMsg.style.display = 'none';
        } else {
            errorMsg.style.display = 'block';
        }
    });

    // Xử lý đăng xuất
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isLoggedIn');
        loginScreen.style.display = 'flex';
        editorScreen.style.display = 'none';
        loginForm.reset();
    });

    // ==========================================
    // LOGIC ĐĂNG BÀI LÊN GITHUB
    // ==========================================
    const postForm = document.getElementById('post-form');
    
    postForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerText = '⏳ Đang đẩy dữ liệu lên hệ thống...';

        // Lấy dữ liệu và thay thế \n bằng thẻ <br> để giữ nguyên định dạng ngắt dòng của Facebook
        let rawContent = document.getElementById('content').value;
        let formattedContent = rawContent.replace(/\n/g, '<br>');

        const newPost = {
            id: Date.now(),
            title: document.getElementById('title').value,
            image: document.getElementById('image').value,
            salary: document.getElementById('salary').value, // Mặc định ẩn
            location: document.getElementById('location').value, // Mặc định ẩn
            content: formattedContent
        };

        const path = 'data/posts.json';
        const apiUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/contents/${path}`;

        try {
            // Lấy file cũ
            const getResponse = await fetch(apiUrl, {
                headers: { 'Authorization': `token ${CONFIG.GITHUB_TOKEN}` }
            });
            
            if (!getResponse.ok) throw new Error('Lỗi kết nối API. Vui lòng kiểm tra lại Token hoặc Tên Repo.');
            
            const fileData = await getResponse.json();
            const currentContentStr = decodeURIComponent(escape(atob(fileData.content)));
            let posts = JSON.parse(currentContentStr);
            
            // Thêm bài mới
            posts.unshift(newPost);
            
            // Mã hóa và lưu file mới
            const newContentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(posts, null, 2))));
            
            const putResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 
                    'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Đăng bài: ${newPost.title}`,
                    content: newContentBase64,
                    sha: fileData.sha
                })
            });

            if (putResponse.ok) {
                alert('✅ Đăng bài thành công! Netlify đang cập nhật website (1-2 phút).');
                document.getElementById('title').value = '';
                document.getElementById('image').value = '';
                document.getElementById('content').value = '';
            } else {
                throw new Error('Không thể ghi dữ liệu lên GitHub.');
            }

        } catch (error) {
            console.error(error);
            alert('❌ Lỗi: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = '🚀 Đăng Bài Lên Website';
        }
    });
});
