"use server"

import { signIn } from "../lib/auth"
import { AuthError } from "next-auth"

/**
 * Server action to authenticate a user using credentials.
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", Object.fromEntries(formData))
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid email or password."
        case "CallbackRouteError":
          return "Account may be inactive or invalid credentials."
        default:
          return "An authentication error occurred. Please try again."
      }
    }
    throw error
  }
}
