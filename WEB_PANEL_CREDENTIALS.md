# 🔐 WEB PANEL LOGIN CREDENTIALS

**IMPORTANT: Save these credentials securely!**

## Web Panel Access
- **URL:** http://localhost:3067
- **Username:** `admin`
- **Password:** `8XRmou+3bOrVVmHVQjq3Uw==`

## Security Notes
- These credentials are randomly generated and secure
- The password is Base64 encoded in the .env file
- JWT Secret is a 64-character hex string for maximum security
- Change the username if desired in the .env file

## How to Change Credentials

Edit the `.env` file:
```bash
nano .env
```

Update these lines:
```env
ADMIN_USERNAME=your_new_username
ADMIN_PASSWORD=your_new_password
JWT_SECRET=keep_the_generated_secret_or_generate_new_one
```

Save and restart the bot:
```bash
./start.sh
```

---

**⚠️  DO NOT SHARE THESE CREDENTIALS WITH ANYONE!**
