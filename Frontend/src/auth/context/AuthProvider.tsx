import { logIn, register } from '../../services/api/userServices'
import {
	AuthContextType,
	AuthProviderProps,
	UserLogged
} from '../typescript/interface'
import { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<UserLogged | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const storedToken = localStorage.getItem('token')
		if (storedToken) {
			setUser({ id: '', email: '', token: storedToken })
			decodeToken(storedToken)
		}
	}, [])

	const loginUser = async (email: string, password: string) => {
		const credentials = { email, password }
		try {
			console.log('Logging in with credentials:', credentials)
			const response = await logIn(credentials)
			console.log('Login response:', response)
			setUser({ id: response.id, email: response.email, token: response.token })
			localStorage.setItem('token', response.token)
			decodeToken(response.token)
			setError(null)
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message)
				throw err
			} else {
				setError('Error desconocido durante el inicio de sesión')
				throw new Error('Error desconocido durante el inicio de sesión')
			}
		}
	}

	const logout = () => {
		setUser(null)
		localStorage.removeItem('token')
	}

	const registerUser = async (
		firstName: string,
		lastName: string,
		email: string,
		phoneNumber: string,
		password: string,
		confirmPassword: string
	) => {
		const credentials = {
			firstName,
			lastName,
			email,
			phoneNumber,
			password,
			confirmPassword
		}
		console.log('Registering user with credentials:', credentials)
		try {
			const response = await register(credentials)
			console.log('Register response:', response)
			setUser({ id: response.userId, email: '', token: response.token })
			localStorage.setItem('token', response.token)
			decodeToken(response.token)
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message)
				throw err
			} else {
				setError('Error desconocido durante el registro')
				throw new Error('Error desconocido durante el registro')
			}
		}
	}

	const decodeToken = (token: string) => {
		try {
			const decodedToken = JSON.parse(atob(token.split('.')[1])) 
			console.log('Decoded token:', decodedToken)
		} catch (error) {
			console.error('Error decoding token:', error)
		}
	}

	const authContextValue: AuthContextType = {
		user,
		error,
		loginUser,
		registerUser,
		logout
	}

	return (
		<AuthContext.Provider value={authContextValue}>
			{children}
		</AuthContext.Provider>
	)
}
