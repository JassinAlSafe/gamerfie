/**
 * Comprehensive TypeScript interfaces for AuthForm component
 * Provides type safety and clear contracts for all authentication interactions
 */

import { LucideIcon } from "lucide-react";
import {
  AUTH_MODES,
  SUBMIT_PHASES,
  PASSWORD_STRENGTH,
  type AuthMode,
  type SubmitPhase,
  type PasswordStrengthLevel
} from "@/config/auth-form-config";

// Core form interfaces
export interface FormData {
  email: string;
  password: string;
  username: string;
  displayName: string;
  rememberMe: boolean;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
  username?: string;
  displayName?: string;
}

export interface TouchedFields {
  email: boolean;
  password: boolean;
  username: boolean;
  displayName: boolean;
}

export interface FormState {
  data: FormData;
  errors: ValidationErrors;
  touched: TouchedFields;
  isLoading: boolean;
  submitPhase: SubmitPhase;
  authError: string | null;
  successMessage: string;
}

// User detection interfaces
export interface UserDetectionResult {
  exists: boolean;
  email?: string;
  canSignIn?: boolean;
}

export interface UserDetectionState {
  result: UserDetectionResult | null;
  isDetecting: boolean;
}

export interface UsernameCheckResult {
  available: boolean;
  reason?: string;
}

export interface UsernameCheckState {
  available: boolean | null;
  isChecking: boolean;
}

// Component prop interfaces
export interface AuthFormProps {
  mode: AuthMode;
  onSuccess?: () => void;
}

export interface GoogleAuthButtonProps {
  isLoading: boolean;
  submitPhase: SubmitPhase;
  successMessage: string;
  onGoogleAuth: () => void;
}

export interface EmailFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched: boolean;
  isLoading: boolean;
  authError: string | null;
  mode: AuthMode;
  userDetection: UserDetectionState;
}

export interface PasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched: boolean;
  isLoading: boolean;
  authError: string | null;
  mode: AuthMode;
  showStrengthIndicator?: boolean;
}

export interface UsernameFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched: boolean;
  isLoading: boolean;
  usernameCheck: UsernameCheckState;
}

export interface DisplayNameFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched: boolean;
  isLoading: boolean;
}

export interface RememberMeFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface SubmitButtonProps {
  mode: AuthMode;
  isLoading: boolean;
  submitPhase: SubmitPhase;
  successMessage: string;
  disabled?: boolean;
}

// Password strength interfaces
export interface PasswordStrength {
  score: number;
  level: PasswordStrengthLevel;
  label: string;
  color: {
    bg: string;
    text: string;
  };
}

export interface PasswordStrengthIndicatorProps {
  password: string;
  show: boolean;
}

// User detection interfaces
export interface UserDetectionIndicatorProps {
  userDetection: UserDetectionState;
  error?: string;
  touched: boolean;
  email: string;
}

export interface UserDetectionFeedbackProps {
  userDetection: UserDetectionResult;
  mode: AuthMode;
  error?: string;
}

export interface UsernameIndicatorProps {
  usernameCheck: UsernameCheckState;
  error?: string;
}

export interface UsernameFeedbackProps {
  usernameCheck: UsernameCheckState;
  error?: string;
}

// Banner interfaces
export interface SuccessBannerProps {
  message: string;
  show: boolean;
}

export interface ErrorBannerProps {
  message: string;
  show: boolean;
}

// Hook interfaces
export interface UseAuthFormState {
  formData: FormData;
  errors: ValidationErrors;
  touched: TouchedFields;
  isLoading: boolean;
  submitPhase: SubmitPhase;
  authError: string | null;
  successMessage: string;
  userDetection: UserDetectionState;
  usernameCheck: UsernameCheckState;
}

export interface UseAuthFormActions {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleGoogleAuth: () => void;
  clearAuthError: () => void;
  setRememberMe: (checked: boolean) => void;
}

export interface UseAuthFormReturn extends UseAuthFormState, UseAuthFormActions {}

// Authentication response interfaces
export interface AuthResponse {
  data?: {
    user?: any;
    session?: any;
  };
  error?: Error;
}

export interface GoogleAuthResponse extends AuthResponse {
  data?: AuthResponse['data'] & {
    url?: string;
  };
}

// Validation interfaces
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message: string;
}

export interface ValidationRuleSet {
  email: ValidationRule;
  password: ValidationRule;
  username: ValidationRule;
  displayName: ValidationRule;
}

export interface FieldValidator {
  (value: string, mode?: AuthMode): string | undefined;
}

export interface FormValidator {
  (formData: Omit<FormData, 'rememberMe'>, mode: AuthMode): ValidationErrors;
}

// Error handling interfaces
export interface AuthError {
  title: string;
  description: string;
  fieldError?: string;
}

export interface ErrorParser {
  (error: Error, mode: AuthMode): AuthError;
}

export interface UrlErrorParser {
  (errorParam: string): Pick<AuthError, 'title' | 'description'>;
}

// Loading state interfaces
export interface LoadingState {
  phase: SubmitPhase;
  message: string;
  icon?: LucideIcon | string;
  iconWrapper?: string;
}

export interface LoadingContentProvider {
  (phase: SubmitPhase, mode: AuthMode, successMessage?: string): LoadingState;
}

// Keyboard shortcut interfaces
export interface KeyboardShortcut {
  key: string;
  modifiers: string[];
  description: string;
}

export interface KeyboardShortcutHandler {
  (
    event: KeyboardEvent,
    isLoading: boolean,
    onGoogleAuth: () => void,
    onQuickSubmit: () => void
  ): boolean;
}

// Form field configuration interfaces
export interface FormFieldConfig {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoCapitalize?: string;
  autoComplete?: string;
  autoCorrect?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export interface FormFieldsConfig {
  email: FormFieldConfig;
  password: FormFieldConfig;
  username: FormFieldConfig;
  displayName: FormFieldConfig;
  rememberMe: Pick<FormFieldConfig, 'id' | 'name' | 'label'>;
}

// Style configuration interfaces
export interface StyleConfig {
  className: string;
}

export interface StylesConfig {
  container: StyleConfig;
  successBanner: StyleConfig;
  errorBanner: StyleConfig;
  googleButton: StyleConfig;
  submitButton: StyleConfig;
  form: StyleConfig;
  inputError: StyleConfig;
  floatingIndicator: StyleConfig;
}

// Animation configuration interfaces
export interface AnimationConfig {
  className: string;
}

export interface AnimationsConfig {
  fadeIn: AnimationConfig;
  slideIn: AnimationConfig;
  zoomIn: AnimationConfig;
  successPulse: AnimationConfig;
}

// Timing configuration interfaces
export interface TimingConfig {
  formValidation: number;
  userDetection: number;
  usernameCheck: number;
}

export interface AuthTimingConfig {
  validationDelay: number;
  successDisplay: number;
  stateUpdateDelay: number;
  uiPropagationDelay: number;
  redirectDelay: number;
  googleConnectionDelay: number;
}

// Message configuration interfaces
export interface SuccessMessages {
  signin: string;
  signup: string;
  googleConnecting: string;
  googleRedirecting: string;
  toastSignin: { title: string; description: string };
  toastSignup: { title: string; description: string };
}

export interface UserDetectionMessages {
  emailAvailable: string;
  emailRegistered: string;
  welcomeBack: string;
  usernameAvailable: string;
  usernameTaken: string;
  signinSuggestion: string;
}

// URL parameter handling
export interface UrlParams {
  error?: string;
  authSuccess?: string;
}

export interface UrlParamHandler {
  (params: UrlParams): void;
}

// Component composition interfaces
export interface AuthFormSection {
  component: React.ComponentType<any>;
  props: Record<string, any>;
  order: number;
  condition?: (state: UseAuthFormState) => boolean;
}

export interface AuthFormComposition {
  banner: AuthFormSection;
  googleAuth: AuthFormSection;
  separator: AuthFormSection;
  formFields: AuthFormSection;
  submitButton: AuthFormSection;
}

// Event handler interfaces
export interface FormEventHandlers {
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFieldBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleAuth: () => void;
  onRememberMeChange: (checked: boolean) => void;
}

export interface KeyboardEventHandlers {
  onKeyDown: (e: KeyboardEvent) => void;
}

// State management interfaces
export interface AuthFormStateManager {
  state: UseAuthFormState;
  actions: UseAuthFormActions;
  handlers: FormEventHandlers & KeyboardEventHandlers;
}

// Accessibility interfaces
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  role?: string;
}

export interface FieldAccessibilityConfig {
  label: string;
  description?: string;
  errorId?: string;
  required?: boolean;
}

// Performance interfaces
export interface AuthFormPerformanceConfig {
  enableDebouncing: boolean;
  debounceTimings: TimingConfig;
  enableMemoization: boolean;
  lazyValidation: boolean;
}

// Integration interfaces
export interface AuthService {
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, username: string, displayName?: string) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<GoogleAuthResponse>;
}

export interface UserService {
  checkUserExists: (email: string) => Promise<UserDetectionResult>;
  checkUsernameAvailability: (username: string) => Promise<UsernameCheckResult>;
}

// Export discriminated unions for type safety
export type FieldName = keyof FormData;
export type ValidationResult = string | undefined;
export type LoadingPhase = SubmitPhase;

export type FormFieldValue = 
  | { type: 'string'; field: 'email' | 'password' | 'username' | 'displayName'; value: string }
  | { type: 'boolean'; field: 'rememberMe'; value: boolean };

export type FormAction =
  | { type: 'SET_FIELD'; payload: FormFieldValue }
  | { type: 'SET_ERROR'; payload: { field: FieldName; error: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_TOUCHED'; payload: { field: FieldName; touched: boolean } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMIT_PHASE'; payload: SubmitPhase }
  | { type: 'SET_AUTH_ERROR'; payload: string | null }
  | { type: 'RESET_FORM' };

export type ComponentVariant = 
  | 'default'
  | 'compact'
  | 'inline'
  | 'modal';

export type ValidationTrigger =
  | 'onChange'
  | 'onBlur'
  | 'onSubmit'
  | 'debounced';