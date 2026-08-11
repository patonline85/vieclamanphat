document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('post-form');
    if (!form) return;

    // Phục hồi cấu hình cũ đã lưu trên trình duyệt của bạn
    document.getElementById('gh-owner').value = localStorage.getItem('gh-owner') || '';
    document.getElementById('gh-repo').value = localStorage.getItem('gh-repo') || '';
    document.getElementById('gh-token').value = localStorage.getItem('gh-token') || '';

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Đang xử lý...';

        const owner = document.getElementById('gh-owner').value.trim();
        const repo = document.getElementById('gh-repo').value.trim();
        const token = document.getElementById('gh-token').value.trim();
        
        // Lưu lại cấu hình cho những lần đăng bài sau
        localStorage.setItem('gh-owner', owner);
        localStorage.setItem('gh-repo', repo);
        localStorage.setItem('gh-token', token);

        // Tạo object bài viết mới
        const newPost = {
            id: Date.now(),
            title: document.getElementById('title').value,
            image: document.getElementById('image').value,
            salary: document.getElementById('salary').value,
            location: document.getElementById('location').value,
            content: document.getElementById('content').value
        };

        const path = 'data/posts.json';
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

        try {
            // Bước 1: Lấy file posts.json hiện tại từ GitHub để lấy mã SHA
            const getResponse = await fetch(apiUrl, {
                headers: { 'Authorization': `token ${token}` }
            });
            
            if (!getResponse.ok) {
                throw new Error('Không thể đọc file từ GitHub. Kiểm tra lại Token, Tên User hoặc Tên Repo.');
            }
            
            const fileData = await getResponse.json();
            
            // Giải mã nội dung Base64 hiện tại (Hỗ trợ tiếng Việt)
            const currentContentStr = decodeURIComponent(escape(atob(fileData.content)));
            let posts = JSON.parse(currentContentStr);
            
            // Bước 2: Thêm bài đăng mới lên đầu mảng
            posts.unshift(newPost);
            
            // Bước 3: Mã hóa lại mảng thành Base64 để gửi lên GitHub
            const newContentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(posts, null, 2))));
            
            // Bước 4: Đẩy (Commit) file mới lên GitHub
            const putResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `CMS: Thêm bài tuyển dụng - ${newPost.title}`,
                    content: newContentBase64,
                    sha: fileData.sha // Bắt buộc phải có mã SHA cũ để ghi đè
                })
            });

            if (putResponse.ok) {
                alert('Đăng bài thành công! Mã nguồn đã được cập nhật lên GitHub. Netlify sẽ tự động Deploy trong 1-2 phút.');
                
                // Xóa nội dung form (không xóa cấu hình GitHub)
                document.getElementById('title').value = '';
                document.getElementById('image').value = '';
                document.getElementById('salary').value = '';
                document.getElementById('location').value = '';
                document.getElementById('content').value = '';
            } else {
                throw new Error('Lỗi khi ghi đè file lên GitHub.');
            }

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Đăng Bài';
        }
    });
});