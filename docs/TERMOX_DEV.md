# 📱 Termux Development Guide - Bakso Premium

Panduan development di Termux (Android) untuk Bakso Premium Ordering System.

---

## 📋 Prerequisites

### 1. Install Termux
Download dari F-Droid (recommended) atau GitHub Releases.

### 2. Setup Initial Termux
```bash
# Update packages
pkg update && pkg upgrade -y

# Install essential tools
pkg install -y git nodejs-lts python make clang pkg-config libc++
```

---

## 🗄️ Database Setup

### Opsi 1: Remote MySQL (Recommended ✅)

Gunakan MySQL dari VPS untuk menghindari kompilasi native module.

#### Setup di VPS:
```bash
# Login ke MySQL
mysql -u root -p

# Create database & user
CREATE DATABASE bakso_db;
CREATE USER 'bakso_user'@'%' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON bakso_db.* TO 'bakso_user'@'%';
FLUSH PRIVILEGES;
```

#### Konfigurasi di Termux:
```bash
cd /data/data/com.termux/files/home/bakso-premium/backend

# Edit .env
nano .env
```

Isi konfigurasi database:
```env
DB_HOST=your_vps_ip_or_hostname
DB_PORT=3306
DB_NAME=bakso_db
DB_USER=bakso_user
DB_PASSWORD=your_secure_password
```

### Opsi 2: SQLite (Tidak Direkomendasikan)

SQLite memerlukan kompilasi native module yang kompleks di Termux.

---

## 🚀 Installation

### 1. Clone Repository
```bash
cd /data/data/com.termux/files/home
git clone <repository_url> bakso-premium
cd bakso-premium
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Setup Environment Variables
```bash
# Backend
cd ../backend
cp .env.example .env
nano .env  # Edit sesuai kebutuhan

# Frontend
cd ../frontend
cp .env.example .env
nano .env  # Edit API URL
```

---

## 🔧 Running with PM2

### Install PM2
```bash
npm install -g pm2
```

### Start Applications
```bash
cd /data/data/com.termux/files/home/bakso-premium

# Start dengan ecosystem config
pm2 start ecosystem.config.js

# Atau manual
pm2 start backend/src/server.js --name bakso-backend
pm2 start frontend --name bakso-frontend -- npm run dev
```

### PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs

# Restart
pm2 restart all

# Stop
pm2 stop all

# Delete
pm2 delete all

# Monitor
pm2 monit

# Save process list
pm2 save

# Startup on boot (requires root)
pm2 startup
```

---

## 🧪 Testing

### Run E2E Tests
```bash
cd backend
node test-e2e.js http://localhost:9000
```

### Manual Testing
```bash
# Health check
curl http://localhost:9000/api/health

# Admin login
curl -X POST http://localhost:9000/api/auth/staff \
  -H "Content-Type: application/json" \
  -d '{"phone":"081234567890","password":"admin123"}'
```

---

## 📝 Development Tips

### 1. Storage Management
```bash
# Check storage
df -h

# Clean npm cache
npm cache clean --force

# Remove node_modules
find . -name "node_modules" -type d -exec rm -rf {} +
```

### 2. Port Management
```bash
# Check running ports
netstat -tulpn 2>/dev/null || ss -tulpn

# Kill process on port
kill $(lsof -t -i:9000) 2>/dev/null
```

### 3. Background Processes
```bash
# Run in background
npm run dev &

# Bring to foreground
fg

# Stop background job
Ctrl+C
```

### 4. Session Management
```bash
# Install tmux for persistent sessions
pkg install tmux

# Start tmux session
tmux new -s bakso

# Detach: Ctrl+B, D
# Reattach: tmux attach -t bakso
```

---

## 🔐 Security

### 1. Firewall (VPS)
```bash
# UFW (Ubuntu)
ufw allow 3306/tcp
ufw allow 9000/tcp
ufw allow 9001/tcp
```

### 2. Environment Variables
Jangan commit `.env` ke git! Gunakan `.env.example` sebagai template.

### 3. MySQL Remote Access
Di VPS, edit `/etc/mysql/mysql.conf.d/mysqld.cnf`:
```ini
bind-address = 0.0.0.0
```

---

## 🐛 Troubleshooting

### Error: Cannot find module
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Error: Port already in use
```bash
# Kill process
kill $(lsof -t -i:9000)

# Or change port in .env
PORT=9002
```

### Error: Permission denied
```bash
# Fix permissions
chmod -R 755 /data/data/com.termux/files/home/bakso-premium
```

### PM2 processes keep restarting
```bash
# Check logs
pm2 logs --lines 50

# Restart with clean
pm2 delete all
pm2 start ecosystem.config.js
```

### Database connection failed
```bash
# Test connection from Termux
mysql -h <vps_ip> -u bakso_user -p

# Check VPS firewall
ssh <vps_ip> sudo ufw status
```

---

## 📊 Project Structure

```
bakso-premium/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── test-e2e.js
│   └── ecosystem.config.js
├── frontend/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🎯 Default Credentials

| Role | Phone | Password |
|------|-------|----------|
| Admin | 081234567890 | admin123 |
| Kitchen | 081234567891 | kitchen123 |
| Driver | 081234567892 | driver123 |

---

## 📚 Useful Commands

```bash
# Git
git status
git add .
git commit -m "message"
git push

# Node.js
node --version
npm --version
npm list -g --depth=0

# Process management
ps aux
kill <pid>
top

# File operations
ls -la
cd <directory>
cat <file>
nano <file>
```

---

## 🔗 External Resources

- [Termux Official Wiki](https://wiki.termux.com/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Sequelize Documentation](https://sequelize.org/)
- [Express.js Documentation](https://expressjs.com/)

---

**Happy Coding! 🚀**
