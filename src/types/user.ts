export interface User {
	id: string
	email: string
	name: string | null
	role: string
	passwordHash: string | null
	emailVerified: Date | null
	image: string | null
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export interface CreateUserRequest {
	email: string
	name?: string
	role: "admin" | "user"
	password?: string
}

export interface UpdateUserRequest {
	email?: string
	name?: string
	role?: "admin" | "user"
	password?: string
}

export interface UserListQuery {
	search?: string
	role?: "admin" | "user"
	deleted?: "true" | "false"
}
