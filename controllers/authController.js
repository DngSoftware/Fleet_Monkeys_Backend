const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/authModel');
const PasswordReset = require('../models/passwordResetModel');
const EmailService = require('../utils/emailService');

// Hardcoded JWT secret (not recommended for production)
const JWT_SECRET = '8d9f7e2b4c5a1d3f9e7b2a4c8d5e1f3g9h2j4k6m8n1p3q5r7t9v';

class AuthController {
  static async initialAdminSignup(req, res) {
    try {
      const { FirstName, MiddleName, LastName, EmailID, LoginID, Password, CompanyID } = req.body;
      if (!FirstName || !LastName || !EmailID || !LoginID || !Password || !CompanyID) {
        return res.status(400).json({ message: 'All required fields must be provided' });
      }

      const admins = await User.getAdmins();
      if (admins.length > 0) {
        return res.status(403).json({ message: 'Initial admin already exists. Use admin signup with authentication' });
      }

      const company = await User.getCompanyById(CompanyID);
      if (!company) {
        return res.status(400).json({ message: 'Invalid CompanyID' });
      }

      const userExists = await User.checkExistingUser(LoginID, EmailID);
      if (userExists) {
        return res.status(400).json({ message: 'LoginID or EmailID already exists' });
      }

      const hashedPassword = await bcrypt.hash(Password.trim(), 12);
      const personId = await User.createUser(
        { FirstName, MiddleName, LastName, EmailID, LoginID, Password: hashedPassword, RoleID: 2, CompanyID },
        0
      );

      // Fetch the RoleID for 'Administrator' (already 2, but let's be consistent)
      const adminRole = await User.getRoleById(2); // RoleID 2 is 'Administrator'
      if (!adminRole) {
        return res.status(500).json({ message: 'Administrator role not found in database' });
      }

      const token = jwt.sign(
        { personId, role: adminRole.RoleID },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Sending welcome email with:', { email: EmailID, loginID: LoginID, password: Password });
      if (!EmailID || !LoginID) {
        console.warn('EmailID or LoginID is undefined, email will fail');
      }

      const emailResult = await EmailService.sendWelcomeEmail({
        email: EmailID,
        loginID: LoginID,
        password: Password
      });

      if (!emailResult.success) {
        console.warn('Welcome email failed:', emailResult.message);
      }

      return res.status(201).json({ message: 'Initial admin created successfully', personId, token });
    } catch (error) {
      console.error('Error creating initial admin:', error);
      return res.status(500).json({ message: 'Error creating initial admin', error: error.message });
    }
  }

  static async adminSignup(req, res) {
    try {
      if (!req.user || req.user.role !== 'Administrator') {
        return res.status(401).json({ message: 'Admin authentication required' });
      }

      const { FirstName, MiddleName, LastName, EmailID, LoginID, Password, CompanyID } = req.body;
      if (!FirstName || !LastName || !EmailID || !LoginID || !Password || !CompanyID) {
        return res.status(400).json({ message: 'All required fields must be provided' });
      }

      const company = await User.getCompanyById(CompanyID);
      if (!company) {
        return res.status(400).json({ message: 'Invalid CompanyID' });
      }

      const userExists = await User.checkExistingUser(LoginID, EmailID);
      if (userExists) {
        return res.status(400).json({ message: 'LoginID or EmailID already exists' });
      }

      const hashedPassword = await bcrypt.hash(Password.trim(), 12);
      const personId = await User.createUser(
        { FirstName, MiddleName, LastName, EmailID, LoginID, Password: hashedPassword, RoleID: 2, CompanyID },
        req.user.personId
      );

      // Fetch the RoleID for 'Administrator' (already 2, but let's be consistent)
      const adminRole = await User.getRoleById(2); // RoleID 2 is 'Administrator'
      if (!adminRole) {
        return res.status(500).json({ message: 'Administrator role not found in database' });
      }

      const token = jwt.sign(
        { personId, role: adminRole.RoleID },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Sending welcome email with:', { email: EmailID, loginID: LoginID, password: Password });
      if (!EmailID || !LoginID) {
        console.warn('EmailID or LoginID is undefined, email will fail');
      }

      const emailResult = await EmailService.sendWelcomeEmail({
        email: EmailID,
        loginID: LoginID,
        password: Password
      });

      if (!emailResult.success) {
        console.warn('Welcome email failed:', emailResult.message);
      }

      return res.status(201).json({ message: 'Admin created successfully', personId, token });
    } catch (error) {
      console.error('Error creating admin:', error);
      return res.status(500).json({ message: 'Error creating admin', error: error.message });
    }
  }

  static async createPerson(req, res) {
    try {
      if (!req.user || req.user.role !== 'Administrator') {
        return res.status(401).json({ message: 'Admin authentication required' });
      }

      const { FirstName, MiddleName, LastName, EmailID, LoginID, Password, RoleID, CompanyID } = req.body;
      if (!FirstName || !LastName || !EmailID || !LoginID || !Password || !RoleID || !CompanyID) {
        return res.status(400).json({ message: 'All required fields must be provided' });
      }

      const role = await User.getRoleById(RoleID);
      if (!role || role.RoleName === 'Administrator' || role.RoleName === 'Admin') {
        return res.status(403).json({ message: 'Use admin signup endpoint to create admin accounts' });
      }

      const company = await User.getCompanyById(CompanyID);
      if (!company) {
        return res.status(400).json({ message: 'Invalid CompanyID' });
      }

      const userExists = await User.checkExistingUser(LoginID, EmailID);
      if (userExists) {
        return res.status(400).json({ message: 'LoginID or EmailID already exists' });
      }

      const hashedPassword = await bcrypt.hash(Password.trim(), 12);
      const personId = await User.createUser(
        { FirstName, MiddleName, LastName, EmailID, LoginID, Password: hashedPassword, RoleID, CompanyID },
        req.user.personId
      );

      console.log('Sending welcome email with:', { email: EmailID, loginID: LoginID, password: Password });
      if (!EmailID || !LoginID) {
        console.warn('EmailID or LoginID is undefined, email will fail');
      }

      const emailResult = await EmailService.sendWelcomeEmail({
        email: EmailID,
        loginID: LoginID,
        password: Password
      });

      if (!emailResult.success) {
        console.warn('Welcome email failed:', emailResult.message);
      }

      return res.status(201).json({ message: 'User created successfully', personId });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { LoginID, Password } = req.body;
      if (!LoginID || !Password) {
        return res.status(400).json({ message: 'LoginID and Password are required' });
      }

      const user = await User.getUserByLoginID(LoginID);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials', details: 'No user found with this LoginID' });
      }

      const isPasswordValid = await bcrypt.compare(Password.trim(), user.Password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials', details: 'Incorrect password' });
      }

      const token = jwt.sign(
        { personId: user.PersonID, role: user.RoleID },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          personId: user.PersonID,
          loginID: user.LoginID,
          roleId: user.RoleID,
          roleName: user.RoleName
        }
      });
    } catch (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  }

  static async logout(req, res) {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(400).json({ message: 'No token provided' });
      }

      console.log('Blacklisting token:', token);

      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return res.status(400).json({ message: 'Invalid token' });
      }

      const expiry = new Date(decoded.exp * 1000);
      console.log('Token expiry:', expiry.toISOString());
      await User.blacklistToken(token, expiry);

      const isBlacklisted = await User.isTokenBlacklisted(token);
      console.log('Is token blacklisted after logout?', isBlacklisted);

      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error logging out:', error);
      return res.status(500).json({ message: 'Error logging out', error: error.message });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { EmailID } = req.body;
      if (!EmailID) {
        return res.status(400).json({ message: 'EmailID is required' });
      }

      const result = await PasswordReset.initiatePasswordReset(EmailID);
      if (!result.success) {
        return res.status(404).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error('Error initiating password reset:', error);
      return res.status(500).json({ message: 'Error initiating password reset', error: error.message });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { EmailID, resetToken, newPassword } = req.body;
      if (!EmailID || !resetToken || !newPassword) {
        return res.status(400).json({ message: 'EmailID, resetToken, and newPassword are required' });
      }

      const result = await PasswordReset.resetPassword(EmailID, resetToken, newPassword);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid or used reset token' });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error('Error resetting password:', error);
      return res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
  }

  static async verifyToken(req, res) {
    try {
      const user = await User.getUserByPersonID(req.user.personId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      return res.status(200).json({
        isAuthenticated: true,
        isAdmin: user.RoleName === 'Administrator' || user.RoleName === 'Admin',
        user: {
          personId: user.PersonID,
          roleId: user.RoleID
        }
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ message: 'Error verifying token', error: error.message });
    }
  }
}

module.exports = AuthController;