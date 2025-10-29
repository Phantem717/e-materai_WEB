FROM registry.access.redhat.com/ubi8/nodejs-18:latest

WORKDIR /app

# Salin dependencies dan instal
COPY package*.json ./
RUN npm install --legacy-peer-deps


# Salin semua file
COPY . .

# Build aplikasi
RUN npm run build

# Jalankan aplikasi dengan opsi IP fleksibel
CMD ["npx", "next", "start", "-p", "4000", "-H", "0.0.0.0"]
