exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const { username, password, newPost, imageData } = data;

        // Kiểm tra quyền
        if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Sai tên đăng nhập hoặc mật khẩu!" })
            };
        }

        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_USER = process.env.GITHUB_USER;
        const GITHUB_REPO = process.env.GITHUB_REPO;

        // BƯỚC 1: UPLOAD ẢNH LÊN GITHUB NẾU CÓ
        let finalImagePath = "https://via.placeholder.com/600x400?text=No+Image";
        
        if (imageData && imageData.base64 && imageData.filename) {
            const imagePath = `images/${imageData.filename}`;
            const imageApiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${imagePath}`;

            const imgResponse = await fetch(imageApiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Netlify-Function'
                },
                body: JSON.stringify({
                    message: `Tải ảnh lên: ${imageData.filename}`,
                    content: imageData.base64
                })
            });

            if (!imgResponse.ok) {
                console.error("Lỗi khi upload ảnh lên GitHub");
            } else {
                finalImagePath = imagePath; // Lấy đường dẫn ảnh vừa upload thành công
            }
        }

        // BƯỚC 2: GÁN ĐƯỜNG DẪN ẢNH VÀO BÀI ĐĂNG
        newPost.image = finalImagePath;

        // BƯỚC 3: CẬP NHẬT FILE POSTS.JSON
        const jsonPath = 'data/posts.json';
        const jsonApiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${jsonPath}`;

        const getResponse = await fetch(jsonApiUrl, {
            headers: { 
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'Netlify-Function'
            }
        });
        
        if (!getResponse.ok) throw new Error('Không thể đọc file dữ liệu từ GitHub.');
        const fileData = await getResponse.json();
        
        const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        let posts = JSON.parse(currentContent);
        
        posts.unshift(newPost);
        const newContentBase64 = Buffer.from(JSON.stringify(posts, null, 2), 'utf-8').toString('base64');
        
        const putResponse = await fetch(jsonApiUrl, {
            method: 'PUT',
            headers: { 
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Netlify-Function'
            },
            body: JSON.stringify({
                message: `Đăng bài: ${newPost.title}`,
                content: newContentBase64,
                sha: fileData.sha
            })
        });

        if (!putResponse.ok) throw new Error('Lỗi khi ghi dữ liệu lên GitHub.');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Hoàn tất!" })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
