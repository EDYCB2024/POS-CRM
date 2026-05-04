'use client'

import { useState } from 'react'
import { Store, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <Store className="text-white w-8 h-8" />
          </div>
          <h1 className="text-display">Welcome Back</h1>
          <p className="text-body-md text-on-surface-variant">Enter your credentials to access the POS Manager</p>
        </div>

        <div className="bg-white p-lg rounded-2xl border border-outline-variant shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-label-md font-bold text-on-surface" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-body-md focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-label-md font-bold text-on-surface" htmlFor="password">
                  Password
                </label>
                <button type="button" className="text-label-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-surface-container-low border-none rounded-xl text-body-md focus:ring-2 focus:ring-primary transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full bg-primary text-white py-3 rounded-xl font-bold text-body-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-outline-variant text-center">
            <p className="text-label-md text-on-surface-variant">
              Don't have an account?{" "}
              <button className="text-primary font-bold hover:underline">Contact Administrator</button>
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-6 text-label-sm text-outline">
          <button className="hover:text-on-surface-variant transition-colors">Privacy Policy</button>
          <button className="hover:text-on-surface-variant transition-colors">Terms of Service</button>
          <button className="hover:text-on-surface-variant transition-colors">Help Center</button>
        </div>
      </div>
    </div>
  )
}
