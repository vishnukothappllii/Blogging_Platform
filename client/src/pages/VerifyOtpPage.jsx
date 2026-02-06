import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../components/ui/use-toast"

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { verifyOtp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!otp) {
      toast({ variant: "destructive", title: "Missing OTP", description: "Please enter the OTP." })
      return
    }

    setIsLoading(true)
    const result = await verifyOtp(otp)
    setIsLoading(false)

    if (result.success) {
      toast({ title: "OTP Verified", description: "Signed in successfully." })
      navigate("/dashboard")
    } else {
      toast({ variant: "destructive", title: "Invalid OTP", description: result.message })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 p-4 dark:from-gray-900 dark:to-blue-900">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white/60 p-8 shadow-2xl backdrop-blur-lg dark:bg-gray-800/60 animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Verify Your OTP</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Welcome to our blogging platform, where your voice matters! We're thrilled to have you join our community of passionate writers and storytellers.
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Enter the OTP sent to your email to verify your account and unlock a world of creative possibilities. Share your ideas, connect with readers, and build your online presence with our industry-leading tools designed for bloggers.
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            If you haven't received the OTP, please check your spam folder or request a new one from your account settings.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              OTP *
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  )
}