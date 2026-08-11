exports.handler = async function(event, context) {
    // Chỉ chấp nhận request dạng POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Nhận dữ liệu từ trình duyệt gửi lên
        const data = JSON.parse(event.body);
        const { username, password, newPost } = data;

        // 1. KIỂM TRA ĐĂNG NHẬP BẰNG BIẾN MÔI TRƯỜNG NETLIFY
        if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Sai tên đăng nhập hoặc mật khẩu!" })
            };
        }

        // Lấy thông tin GitHub từ biến môi trường
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_USER = process.env.GITHUB_USER;
        const GITHUB_REPO = process.env.GITHUB_REPO;
        const path = 'data/posts.json';
        const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}`;

        // 2. LẤY FILE DỮ LIỆU CŨ TỪ GITHUB
        const getResponse = await fetch(apiUrl, {
            headers: { 
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'Netlify-Function'
            }
        });
        
        if (!getResponse.ok) throw new Error('Không thể đọc file từ GitHub.');
        const fileData = await getResponse.json();
        
        // Giải mã file cũ
        const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        let posts = JSON.parse(currentContent);
        
        // 3. THÊM BÀI MỚI VÀ MÃ HÓA LẠI
        posts.unshift(newPost);
        const newContentBase64 = Buffer.from(JSON.stringify(posts, null, 2), 'utf-8').toString('base64');
        
        // 4. GHI ĐÈ FILE LÊN GITHUB
        const putResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: { 
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Netlify-Function'
            },
            body: JSON.stringify({
                message: `Đăng bài: ${newPost.title}`,
                content: newContentBase64,
                sha: fileData.sha // Yêu cầu bắt buộc của GitHub
            })
        });

        if (!putResponse.ok) throw new Error('Lỗi khi ghi dữ liệu lên GitHub.');

        // Trả về thành công cho trình duyệt
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Đăng bài thành công!" })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};