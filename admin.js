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
        currentUser = document.getElementById('username').value.trim();
        currentPass = document.getElementById('password').value.trim();
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

    // Xử lý gửi bài viết & Ảnh
    postForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerText = '⏳ Đang xử lý ảnh & đẩy dữ liệu...';

        // 1. Lấy dữ liệu ảnh và chuyển sang Base64
        const imageFile = document.getElementById('image-upload').files[0];
        let imageData = null;

        if (imageFile) {
            const base64String = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result.split(',')[1]);
                reader.readAsDataURL(imageFile);
            });
            
            // Tạo tên file duy nhất tránh trùng lặp
            const uniqueFilename = Date.now() + '_' + imageFile.name.replace(/\s+/g, '-');
            imageData = {
                filename: uniqueFilename,
                base64: base64String
            };
        }

        // 2. Xử lý nội dung văn bản
        let rawContent = document.getElementById('content').value;
        let formattedContent = rawContent.replace(/\n/g, '<br>');

        const newPost = {
            id: Date.now(),
            title: document.getElementById('title').value,
            salary: document.getElementById('salary').value || 'Thỏa thuận',
            location: document.getElementById('location').value || 'Hải Phòng',
            content: formattedContent
            // URL ảnh sẽ được Netlify Function gán sau khi upload thành công
        };

        try {
            // 3. Gọi API của Netlify Function
            const response = await fetch('/.netlify/functions/admin-api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: currentUser,
                    password: currentPass,
                    newPost: newPost,
                    imageData: imageData // Gửi kèm dữ liệu ảnh
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert('✅ Đăng bài thành công! Website sẽ được cập nhật trong 1-2 phút.');
                document.getElementById('title').value = '';
                document.getElementById('image-upload').value = '';
                document.getElementById('content').value = '';
            } else {
                alert('❌ Lỗi: ' + result.error);
                if (response.status === 401) {
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
