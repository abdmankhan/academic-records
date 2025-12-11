# MongoDB Atlas Setup Guide

## ✅ Connection Configured

Your MongoDB Atlas connection has been set up! The connection string is stored in `/backend/.env`

## 🔧 Important: MongoDB Atlas Configuration

### 1. **IP Whitelist** (Required!)

MongoDB Atlas requires you to whitelist IP addresses that can connect:

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Click on **Network Access** (left sidebar)
3. Click **Add IP Address**
4. Choose one of:
   - **Add Current IP Address** (for your current location)
   - **Allow Access from Anywhere** (for development: `0.0.0.0/0`)
     - ⚠️ **Warning:** Only use this for development, not production!

### 2. **Database User**

Your connection string uses:
- **Username:** `abdmankhan`
- **Password:** `Mongo@2025`
- **Database:** `academic-certificates`

Make sure this user has read/write permissions in MongoDB Atlas.

### 3. **Connection String**

Your connection string is:
```
##hidden
```

## 🚀 Testing the Connection

### Start the Backend

```bash
cd backend
npm start
```

You should see:
```
🔌 Connecting to MongoDB...
📍 Connection URI: mongodb+srv://abdmankhan:****@tmstoybooks.x3xuj.mongodb.net/academic-certificates?retryWrites=true&w=majority
✅ MongoDB connected successfully
📊 Database: academic-certificates
```

### Test Student Registration

1. Start frontend: `cd frontend && npm start`
2. Go to http://localhost:3000/register
3. Register a student
4. Check MongoDB Atlas → Collections → You should see `students` and `users` collections

## 🔍 Troubleshooting

### Error: "MongoServerSelectionError"

**Cause:** Your IP is not whitelisted

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Add your current IP address
3. Wait 1-2 minutes for changes to propagate
4. Restart backend

### Error: "Authentication failed"

**Cause:** Wrong username/password

**Solution:**
1. Check your MongoDB Atlas → Database Access
2. Verify username and password
3. Update `.env` file if needed

### Error: "Connection timeout"

**Cause:** Network/firewall issues

**Solution:**
1. Check your internet connection
2. Try from a different network
3. Check if your firewall is blocking MongoDB ports

## 📝 Environment Variables

The `.env` file contains:
- `MONGODB_URI` - Your Atlas connection string
- `PORT` - Backend port (5000)
- `JWT_SECRET` - Secret for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS

## 🔒 Security Notes

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Change JWT_SECRET** in production
3. **Use specific IP whitelist** in production (not 0.0.0.0/0)
4. **Use strong passwords** for database users

## ✅ Verification

After setup, verify everything works:

1. ✅ Backend starts without MongoDB errors
2. ✅ Can register a student
3. ✅ Can login with registered student
4. ✅ University can see students in dropdown
5. ✅ Certificates are stored and retrieved

---

**Your MongoDB Atlas is now configured!** 🎉


