import axios, { AxiosError } from 'axios'

interface ErrorResponse {
  message: string
}

// ✅ Utility function to extract error message
export function getErrorMessage(error: unknown): string {
  // Axios error
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>
    return (
      axiosError.response?.data?.message ||
      axiosError.message ||
      'Request failed'
    )
  }

  // Standard Error
  if (error instanceof Error) {
    return error.message
  }

  // String error
  if (typeof error === 'string') {
    return error
  }

  // Unknown error
  return 'An unknown error occurred'
}
