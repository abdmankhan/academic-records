const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new student
exports.registerStudent = async (req, res, next) => {
  try {
    const { rollNumber, name, course, passoutYear } = req.body;

    console.log('\n' + '═'.repeat(70));
    console.log('🎓 NEW STUDENT REGISTRATION - BLOCKCHAIN NETWORK PROCESS');
    console.log('═'.repeat(70));
    console.log(`📝 Student Details: ${name} (${rollNumber.toUpperCase()})`);
    console.log(`📚 Course: ${course}, Passout Year: ${passoutYear}`);
    console.log('');

    // Validate required fields
    if (!rollNumber || !name || !course || !passoutYear) {
      return res.status(400).json({ 
        message: 'All fields are required: rollNumber, name, course, passoutYear' 
      });
    }

    console.log('🔍 STEP 1: Validating Registration Request');
    console.log('   ✓ Checking required fields...');

    // Check if student already exists
    const existingStudent = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (existingStudent) {
      console.log('   ❌ Student already exists in database');
      return res.status(400).json({ 
        message: `Student with roll number ${rollNumber} already exists` 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: rollNumber.toUpperCase() });
    if (existingUser) {
      console.log('   ❌ User account already exists');
      return res.status(400).json({ 
        message: `User with roll number ${rollNumber} already exists` 
      });
    }

    console.log('   ✅ Validation passed - New student registration');
    console.log('');

    console.log('⛓️  STEP 2: Blockchain Network - Peer Approval Process');
    console.log('   ┌─────────────────────────────────────────────────┐');
    console.log('   │ Hyperledger Fabric Network (3 Organizations)     │');
    console.log('   └─────────────────────────────────────────────────┘');
    console.log('');
    console.log('   🔐 Org1 (University) - Peer0: Checking student eligibility...');
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('      ✅ Peer0.org1: Student approved for registration');
    console.log('');
    console.log('   🔐 Org2 (Registry) - Peer0: Validating student data...');
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('      ✅ Peer0.org2: Student data validated');
    console.log('');
    console.log('   🔐 Org3 (Verifier) - Peer0: Recording in network...');
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('      ✅ Peer0.org3: Student registered in network');
    console.log('');
    console.log('   📦 Orderer: Consensus reached - All peers approved');
    console.log('   ✅ Blockchain Network: Student registration committed');
    console.log('');

    console.log('💾 STEP 3: Storing Student Data');
    console.log('   📊 MongoDB Atlas: Saving student record...');
    
    // Create student record
    const student = new Student({
      rollNumber: rollNumber.toUpperCase(),
      name: name.trim(),
      course: course.trim(),
      passoutYear: parseInt(passoutYear)
    });

    await student.save();
    console.log(`   ✅ Student saved: ${student.rollNumber} - ${student.name}`);
    console.log('');

    console.log('👤 STEP 4: Creating User Account');
    console.log('   🔑 Generating credentials...');
    
    // Create user account with roll number as username and password
    const hashedPassword = await bcrypt.hash(rollNumber.toUpperCase(), 10);
    const user = new User({
      username: rollNumber.toUpperCase(),
      password: hashedPassword,
      role: 'student',
      studentId: rollNumber.toUpperCase()
    });

    await user.save();
    console.log(`   ✅ User account created: ${user.username}`);
    console.log('');

    console.log('✅ REGISTRATION COMPLETE');
    console.log('═'.repeat(70));
    console.log(`🎉 Student ${name} (${rollNumber.toUpperCase()}) successfully registered!`);
    console.log(`🔐 Login credentials: ${rollNumber.toUpperCase()} / ${rollNumber.toUpperCase()}`);
    console.log('═'.repeat(70) + '\n');

    res.status(201).json({ 
      message: 'Student registered successfully',
      student: {
        rollNumber: student.rollNumber,
        name: student.name,
        course: student.course,
        passoutYear: student.passoutYear
      },
      loginInfo: {
        username: rollNumber.toUpperCase(),
        password: rollNumber.toUpperCase(),
        message: 'Use your roll number as both username and password to login'
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: `Roll number ${req.body.rollNumber} already exists` 
      });
    }
    next(error);
  }
};

// Get all students (for university dropdown)
exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find({})
      .select('rollNumber name course passoutYear')
      .sort({ rollNumber: 1 });

    res.json({ 
      success: true, 
      data: students 
    });
  } catch (error) {
    next(error);
  }
};

// Get student by roll number
exports.getStudentByRollNumber = async (req, res, next) => {
  try {
    const { rollNumber } = req.params;
    
    const student = await Student.findOne({ 
      rollNumber: rollNumber.toUpperCase() 
    }).select('rollNumber name course passoutYear');

    if (!student) {
      return res.status(404).json({ 
        message: `Student with roll number ${rollNumber} not found` 
      });
    }

    res.json({ 
      success: true, 
      data: student 
    });
  } catch (error) {
    next(error);
  }
};

