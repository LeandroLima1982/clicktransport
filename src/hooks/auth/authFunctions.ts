
// Re-export all auth functions from service files
export {
  signIn,
  signInWithGoogle
} from './services/signInService';

export {
  signUp
} from './services/signUpService';

export {
  signOut,
  resetPassword
} from './services/accountService';

export {
  fetchCompanies
} from './services/companyService';

// Export driver-specific auth functions
export {
  updateDriverLoginStatus,
  checkDriverPasswordChange
} from './services/driver/driverAuthService';

// Export admin-specific auth functions
export {
  verifyAdminRole
} from './services/admin/adminAuthService';

// Export company-specific auth functions
export {
  verifyCompanyAdmin
} from './services/company/companyAuthService';

// Export user role service
export {
  verifyUserRole
} from './services/user/userRoleService';
