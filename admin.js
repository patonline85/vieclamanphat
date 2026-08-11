document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const editorScreen = document.getElementById('editor-screen');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const postForm = document.getElementById('post-form');
    
    let currentUser = '';
    let currentPass = '';

    // Xử lý nút Đăng Nhập
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Lưu tạm user/pass vào bộ nhớ đệm của tab trình duyệt
        currentUser = document.getElementById('username').value.trim();
        currentPass = document.getElementById('password').value.trim();
        
        // Chuyển sang màn hình soạn thảo
        loginScreen.style.display = 'none';
        editorScreen.style.display = 'block';
    });

    // Xử lý Đăng Xuất
    logoutBtn.addEventListener('click', () => {
        currentUser = '';
        currentPass = '';
        loginScreen.style.display = 'flex';
        editorScreen.style.display = 'none';
        loginForm.reset();
        document.getElementById('login-error').style.display = 'none';
    });

    // Xử lý gửi bài viết
    postForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerText = '⏳ Đang đẩy dữ liệu lên hệ thống...';

        // Lấy nội dung và chuyển ký tự xuống dòng thành thẻ <br>
        let rawContent = document.getElementById('content').value;
        let formattedContent = rawContent.replace(/\n/g, '<br>');

        const newPost = {
            id: Date.now(),
            title: document.getElementById('title').value,
            image: document.getElementById('image').value,
            salary: document.getElementById('salary').value || 'Thỏa thuận',
            location: document.getElementById('location').value || 'Hải Phòng',
            content: formattedContent
        };

        try {
            // GỌI NETLIFY FUNCTION MÀ CHÚNG TA ĐÃ TẠO
            const response = await fetch('/.netlify/functions/admin-api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: currentUser,
                    password: currentPass,
                    newPost: newPost
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert('✅ ' + result.message + ' Netlify đang cập nhật website (1-2 phút).');
                // Xóa nội dung form để viết bài mới
                document.getElementById('title').value = '';
                document.getElementById('image').value = '';
                document.getElementById('content').value = '';
            } else {
                // Nếu sai mật khẩu hoặc lỗi, Netlify Function sẽ báo về đây
                alert('❌ Lỗi: ' + result.error);
                if (response.status === 401) {
                    // Sai mật khẩu -> Đẩy ra ngoài màn hình login
                    logoutBtn.click();
                    document.getElementById('login-error').style.display = 'block';
                }
            }

        } catch (error) {
            console.error(error);
            alert('❌ Lỗi kết nối đến máy chủ Netlify.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = '🚀 Đăng Bài Lên Website';
        }
    });
});
