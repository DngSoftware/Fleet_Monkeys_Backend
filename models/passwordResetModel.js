const crypto = require('crypto');
const mysql = require('mysql2/promise');
const poolPromise = require('../config/db.config');
const bcrypt = require('bcryptjs');
const EmailService = require('../utils/emailService');

class PasswordReset {
  // Generate reset token and send email
  static async initiatePasswordReset(EmailID) {
    const pool = await poolPromise;
    
    try {
      // Check if user exists
      const userQuery = `
        SELECT PersonID, EmailID
        FROM dbo_tblperson
        WHERE EmailID = ? AND IsDeleted = 0;
      `;
      const [userRows] = await pool.query(userQuery, [EmailID?.trim()]);
      
      if (!userRows[0]) {
        return { success: false, message: 'No user found with this email' };
      }

      const user = userRows[0];
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

      // Store reset token in database
      const tokenQuery = `
        INSERT INTO dbo_tblpasswordresettokens (
          PersonID, ResetToken, ExpiryDateTime, IsUsed
        ) VALUES (
          ?, ?, ?, 0
        );
      `;
      await pool.query(tokenQuery, [user.PersonID, resetToken, resetTokenExpiry]);

      // Send password reset email
      const emailResult = await EmailService.sendPasswordResetEmail({
        email: EmailID,
        resetToken,
      });

      if (!emailResult.success) {
        return { success: false, message: emailResult.message };
      }

      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Reset password using token
  static async resetPassword(EmailID, resetToken, newPassword) {
    const pool = await poolPromise;
    
    try {
      // Verify reset token
      const tokenQuery = `
        SELECT PersonID, ExpiryDateTime, IsUsed
        FROM dbo_tblpasswordresettokens
        WHERE ResetToken = ? AND IsUsed = 0;
      `;
      const [tokenRows] = await pool.query(tokenQuery, [resetToken]);
      
      if (!tokenRows[0]) {
        return { success: false, message: 'Invalid or used reset token' };
      }

      const tokenData = tokenRows[0];
      
      // Check if token is expired
      if (new Date() > new Date(tokenData.ExpiryDateTime)) {
        return { success: false, message: 'Reset token has expired' };
      }

      // Verify email matches
      const userQuery = `
        SELECT PersonID
        FROM dbo_tblperson
        WHERE EmailID = ? AND PersonID = ? AND IsDeleted = 0;
      `;
      const [userRows] = await pool.query(userQuery, [EmailID?.trim(), tokenData.PersonID]);
      
      if (!userRows[0]) {
        return { success: false, message: 'Invalid email for this reset token' };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword.trim(), 12);

      // Update password
      const updateQuery = `
        UPDATE dbo_tblperson
        SET Password = ?
        WHERE PersonID = ?;
      `;
      await pool.query(updateQuery, [hashedPassword, tokenData.PersonID]);
// 
      // Mark token as used
      const markUsedQuery = `
        UPDATE dbo_tblpasswordresettokens
        SET IsUsed = 1
        WHERE ResetToken = ?;
      `;
      await pool.query(markUsedQuery, [resetToken]);

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PasswordReset;