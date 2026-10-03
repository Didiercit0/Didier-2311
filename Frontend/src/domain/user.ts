
export interface User { id: string; fullName: string; email: string; balance: number }
export interface LocalAccount extends User { version: 1; salt: string; passwordHash: string }
export interface RegistrationInput { fullName: string; email: string; password: string; confirmPassword: string; accepted: boolean }
export interface LoginInput { email: string; password: string; remember: boolean }
