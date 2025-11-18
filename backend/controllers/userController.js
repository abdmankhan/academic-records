const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Initialize default users for all roles
const initializeDefaultUsers = async () => {
    try {
        // Default admin user
        let admin = await User.findOne({ username: 'ADMIN' });
        if (!admin) {
            const hashedPassword = await bcrypt.hash('adminpw', 10);
            admin = new User({
                username: 'ADMIN',
                password: hashedPassword,
                role: 'admin'
            });
            await admin.save();
            console.log('✅ Default admin user initialized (admin/adminpw)');
        }
        
        // Default university user
        let university = await User.findOne({ username: 'UNIVERSITY' });
        if (!university) {
            const hashedPassword = await bcrypt.hash('universitypw', 10);
            university = new User({
                username: 'UNIVERSITY',
                password: hashedPassword,
                role: 'university',
                organization: 'NIT Warangal'
            });
            await university.save();
            console.log('✅ Default university user initialized (university/universitypw)');
        }
        
        // Default student user
        let student = await User.findOne({ username: 'STUDENT' });
        if (!student) {
            const hashedPassword = await bcrypt.hash('studentpw', 10);
            student = new User({
                username: 'STUDENT',
                password: hashedPassword,
                role: 'student',
                studentId: 'STU001'
            });
            await student.save();
            console.log('✅ Default student user initialized (student/studentpw)');
        }
        
        // Default verifier user (company/government)
        let verifier = await User.findOne({ username: 'VERIFIER' });
        if (!verifier) {
            const hashedPassword = await bcrypt.hash('verifierpw', 10);
            verifier = new User({
                username: 'VERIFIER',
                password: hashedPassword,
                role: 'verifier',
                organization: 'Verification Corp'
            });
            await verifier.save();
            console.log('✅ Default verifier user initialized (verifier/verifierpw)');
        }
    } catch (error) {
        console.error('❌ Failed to initialize default users:', error);
    }
};

// Initialize default users when module is loaded (with delay for MongoDB connection)
setTimeout(initializeDefaultUsers, 2000);

exports.registerUser = async (req, res, next) => {
    try {
        const { username, password, role, studentId, organization } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'username and password required' });
        
        // Validate role
        const validRoles = ['university', 'student', 'verifier', 'admin'];
        const userRole = role || 'student'; // Default to student
        
        if (!validRoles.includes(userRole)) {
            return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ username: username.toUpperCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        const hashed = await bcrypt.hash(password, 10);
        const newUser = new User({
            username: username.toUpperCase(),
            password: hashed,
            role: userRole
        });
        
        // Add role-specific fields
        if (userRole === 'student' && studentId) {
            newUser.studentId = studentId.toUpperCase();
        }
        if ((userRole === 'university' || userRole === 'verifier') && organization) {
            newUser.organization = organization;
        }
        
        await newUser.save();
        res.status(201).json({ 
            message: 'User registered successfully',
            user: { username: newUser.username, role: newUser.role }
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        next(err);
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        
        console.log(`🔐 Login attempt for user: ${username}`);
        
        // Try to find user (case-insensitive search)
        const user = await User.findOne({ username: username.toUpperCase() });
        if (!user) {
            console.log(`❌ User not found: ${username}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            console.log(`❌ Password mismatch for user: ${username}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const tokenPayload = { 
            username: user.username, 
            role: user.role,
            userId: user.studentId || user.username
        };
        
        // Add role-specific information
        if (user.organization) {
            tokenPayload.organization = user.organization;
        }
        if (user.studentId) {
            tokenPayload.studentId = user.studentId;
        }
        
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
        console.log(`✅ Login successful for user: ${user.username} with role: ${user.role}`);
        res.json({ 
            token, 
            username: user.username, 
            role: user.role,
            studentId: user.studentId,
            organization: user.organization
        });
    } catch (err) {
        console.error('❌ Login error:', err);
        next(err);
    }
};

// Development helper endpoint to list users
exports.getUsers = async (req, res, next) => {
    try {
        if (process.env.NODE_ENV !== 'development') {
            return res.status(404).json({ message: 'Not found' });
        }
        
        const users = await User.find({}).select('username role studentId organization');
        const userList = users.map(u => ({ 
            username: u.username, 
            role: u.role || 'user',
            studentId: u.studentId,
            organization: u.organization
        }));
        res.json({ users: userList });
    } catch (err) {
        next(err);
    }
};
