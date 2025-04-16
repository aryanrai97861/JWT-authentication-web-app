const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/middleware');
const db = require('../config/db');
const mongoose = require('mongoose'); // Add this import for mongoose.Types.ObjectId

// Register routing
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login routing
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: existingUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Protected routing
router.get('/profile', authenticateToken, (req, res) => {
    res.status(200).json({
        message: 'Protected route accessed successfully',
        userId: req.user.userId
    });
});

// GET /accounts - Fetch list of companies with match scores
router.get('/accounts', authenticateToken, async (req, res) => {
    try {
        // Get pagination parameters with defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Query the database for accounts
        const accounts = await db.collection('accounts').find({})
            .sort({ matchScore: -1 }) // Sort by match score descending
            .skip(skip)
            .limit(limit)
            .toArray();
        
        // Get total count for pagination
        const total = await db.collection('accounts').countDocuments();
        
        return res.status(200).json({
            success: true,
            accounts: accounts,
            pagination: {
                totalResults: total,
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch accounts' 
        });
    }
});

// POST /accounts/:id/status - Update target status of a company
router.post('/accounts/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['Prospect', 'Target', 'Customer', 'Archived'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: Prospect, Target, Customer, Archived'
            });
        }
        
        // Check if account exists
        const account = await db.collection('accounts').findOne({ 
            _id: new mongoose.Types.ObjectId(id) 
        });
        
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }
        
        // Update account status
        const result = await db.collection('accounts').updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { 
                $set: { 
                    status: status,
                    updatedAt: new Date()
                } 
            }
        );
        
        if (result.modifiedCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'Status update failed or no changes were made'
            });
        }
        
        // Get updated account
        const updatedAccount = await db.collection('accounts').findOne({ 
            _id: new mongoose.Types.ObjectId(id) 
        });
        
        return res.status(200).json({
            success: true,
            message: `Account status updated to ${status}`,
            account: updatedAccount
        });
    } catch (error) {
        console.error('Error updating account status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update account status'
        });
    }
});

module.exports = router;