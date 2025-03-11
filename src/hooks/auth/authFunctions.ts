
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
