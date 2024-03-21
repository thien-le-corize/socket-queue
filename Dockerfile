# Sử dụng image Node.js 16 làm base
FROM node:16

# Tạo và đặt thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install

# Copy toàn bộ source code vào thư mục làm việc
COPY . .

# Mở cổng 3000 để có thể truy cập ứng dụng từ bên ngoài container
EXPOSE 3000

# Chạy ứng dụng
CMD ["node", "index.js"]