document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. XỬ LÝ TRANG CHỦ (index.html)
    // ==========================================
    const newsGrid = document.getElementById('news-grid');
    
    if (newsGrid) {
        fetch('./data/posts.json')
            .then(response => {
                if (!response.ok) throw new Error('Không thể tải file dữ liệu');
                return response.json();
            })
            .then(posts => {
                newsGrid.innerHTML = ''; 
                
                if (posts.length === 0) {
                    newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Chưa có bài đăng tuyển dụng nào.</p>';
                    return;
                }

                posts.forEach(post => {
                    // Cập nhật link Xem chi tiết trỏ về post.html kèm theo ID của bài viết
                    const cardHTML = `
                        <div class="card">
                            <img src="${post.image}" alt="${post.title}" class="card-img" onerror="this.src='https://via.placeholder.com/600x400?text=No+Image'">
                            <div class="card-content">
                                <h3 class="card-title">${post.title}</h3>
                                <div class="card-meta">
                                    <span>💰 ${post.salary}</span>
                                    <span>📍 ${post.location}</span>
                                </div>
                                <p class="card-desc">${post.content}</p>
                                <a href="post.html?id=${post.id}" class="btn-readmore">Xem chi tiết</a>
                            </div>
                        </div>
                    `;
                    newsGrid.innerHTML += cardHTML;
                });
            })
            .catch(error => {
                console.error(error);
                newsGrid.innerHTML = '<p>Không thể tải bài viết lúc này. Vui lòng thử lại sau.</p>';
            });
    }

    // ==========================================
    // 2. XỬ LÝ TRANG CHI TIẾT (post.html)
    // ==========================================
    const postDetail = document.getElementById('post-detail');
    
    if (postDetail) {
        // Lấy ID bài viết từ URL (ví dụ: post.html?id=123456)
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        if (!postId) {
            postDetail.innerHTML = '<div class="detail-body"><h2>Không tìm thấy bài viết.</h2></div>';
            return;
        }

        fetch('./data/posts.json')
            .then(response => response.json())
            .then(posts => {
                // Tìm bài viết có ID trùng khớp
                const post = posts.find(p => p.id == postId);
                
                if (post) {
                    document.title = post.title + " - Tiệm Hoa Nhà Sen";
                    postDetail.innerHTML = `
                        <img src="${post.image}" alt="${post.title}" class="detail-img" onerror="this.src='https://via.placeholder.com/800x400?text=No+Image'">
                        <div class="detail-body">
                            <h1 class="detail-title">${post.title}</h1>
                            <div class="detail-meta">
                                <span>💰 Mức lương: ${post.salary}</span>
                                <span>📍 Địa điểm: ${post.location}</span>
                            </div>
                            <div class="detail-content">
                                ${post.content}
                            </div>
                        </div>
                    `;
                } else {
                    postDetail.innerHTML = '<div class="detail-body"><h2>Bài viết không tồn tại hoặc đã bị xóa.</h2></div>';
                }
            })
            .catch(error => {
                console.error(error);
                postDetail.innerHTML = '<div class="detail-body"><p>Lỗi khi tải dữ liệu bài viết.</p></div>';
            });
    }
});
