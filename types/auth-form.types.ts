// Core form data interface
export interface FormData {
  email: string;
  password: string;
  username: string;
  displayName: string;
  rememberMe?: boolean;
}

// Form validation errors
export interface ValidationErrors {
  email?: string;
  password?: string;
  username?: string;
  displayName?: string;
}

// Form field touched state
export interface TouchedFields {
  email: boolean;
  password: boolean;
  username: boolean;
  displayName: boolean;
}

// Submit phase for progressive loading
export type SubmitPhase = 'idle' | 'validating' | 'authenticating' | 'redirecting';

// Authentication mode
export type AuthMode = 'signin' | 'signup';

// User detection result from API
export interface UserDetectionResult {
  exists: boolean;
  provider?: string;
  hasPassword?: boolean;
  needsVerification?: boolean;
  username?: string;
  displayName?: string;
}

// Username availability result
export interface UsernameAvailability {
  available: boolean;
  reason?: string;
}

// Auth form state interface
export interface AuthFormState {
  formData: FormData;
  errors: ValidationErrors;
  touched: TouchedFields;
  submitPhase: SubmitPhase;
  isLoading: boolean;
  successMessage: string;
  authError: string | null;
  
  // User detection state
  userDetection: UserDetectionResult | null;
  isDetecting: boolean;
  
  // Username checking state
  usernameAvailable: boolean | null;
  checkingUsername: boolean;
}

// Auth form actions
export type AuthFormAction =
  | { type: 'SET_FIELD'; field: keyof FormData; value: string }
  | { type: 'SET_ERROR'; field: keyof ValidationErrors; error: string | undefined }
  | { type: 'SET_ERRORS'; errors: ValidationErrors }
  | { type: 'SET_TOUCHED'; field: keyof TouchedFields }
  | { type: 'SET_SUBMIT_PHASE'; phase: SubmitPhase }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_SUCCESS_MESSAGE'; message: string }
  | { type: 'SET_AUTH_ERROR'; error: string | null }
  | { type: 'SET_USER_DETECTION'; detection: UserDetectionResult | null }
  | { type: 'SET_IS_DETECTING'; detecting: boolean }
  | { type: 'SET_USERNAME_AVAILABLE'; available: boolean | null }
  | { type: 'SET_CHECKING_USERNAME'; checking: boolean }
  | { type: 'CLEAR_AUTH_ERROR' }
  | { type: 'RESET_FORM' };

// Initial form state
export const initialAuthFormState: AuthFormState = {
  formData: {
    email: '',
    password: '',
    username: '',
    displayName: '',
    rememberMe: false,
  },
  errors: {},
  touched: {
    email: false,
    password: false,
    username: false,
    displayName: false,
  },
  submitPhase: 'idle',
  isLoading: false,
  successMessage: '',
  authError: null,
  userDetection: null,
  isDetecting: false,
  usernameAvailable: null,
  checkingUsername: false,
};

// Auth form reducer
export const authFormReducer = (
  state: AuthFormState,
  action: AuthFormAction
): AuthFormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error,
        },
      };
    
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
      };
    
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.field]: true,
        },
      };
    
    case 'SET_SUBMIT_PHASE':
      return {
        ...state,
        submitPhase: action.phase,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading,
      };
    
    case 'SET_SUCCESS_MESSAGE':
      return {
        ...state,
        successMessage: action.message,
      };
    
    case 'SET_AUTH_ERROR':
      return {
        ...state,
        authError: action.error,
      };
    
    case 'SET_USER_DETECTION':
      return {
        ...state,
        userDetection: action.detection,
      };
    
    case 'SET_IS_DETECTING':
      return {
        ...state,
        isDetecting: action.detecting,
      };
    
    case 'SET_USERNAME_AVAILABLE':
      return {
        ...state,
        usernameAvailable: action.available,
      };
    
    case 'SET_CHECKING_USERNAME':
      return {
        ...state,
        checkingUsername: action.checking,
      };
    
    case 'CLEAR_AUTH_ERROR':
      return {
        ...state,
        authError: null,
      };
    
    case 'RESET_FORM':
      return initialAuthFormState;
    
    default:
      return state;
  }
};