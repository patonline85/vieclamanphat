document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) return;

    // Tải dữ liệu từ file JSON cục bộ
    fetch('./data/posts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải file dữ liệu');
            }
            return response.json();
        })
        .then(posts => {
            newsGrid.innerHTML = ''; // Xóa chữ "Đang tải..."
            
            if (posts.length === 0) {
                newsGrid.innerHTML = '<p>Chưa có bài đăng nào.</p>';
                return;
            }

            // Tạo giao diện cho từng bài viết
            posts.forEach(post => {
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
                            <a href="#" class="btn-readmore">Xem chi tiết</a>
                        </div>
                    </div>
                `;
                newsGrid.innerHTML += cardHTML;
            });
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu bài viết:', error);
            newsGrid.innerHTML = '<p>Không thể tải bài viết lúc này. Vui lòng thử lại sau.</p>';
        });
});