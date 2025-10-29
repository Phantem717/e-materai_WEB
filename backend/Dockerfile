# Gunakan base image Node.js
FROM node:18-alpine

# Tentukan direktori kerja dalam container
WORKDIR /app

# Salin package.json dan package-lock.json ke container
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua file aplikasi ke dalam container
COPY . .

# Ekspos port aplikasi
EXPOSE 6000

# Jalankan aplikasi
CMD ["npm", "start"]
