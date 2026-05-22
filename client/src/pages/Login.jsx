import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Shield, User, Building, Landmark, Chrome, Github } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-hot-toast";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 2FA Flow states
  const [is2faRequired, setIs2faRequired] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [tempToken, setTempToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await login(email, password);
      // Check if 2FA is needed
      if (res && res.twoFactorRequired) {
        setIs2faRequired(true);
        setTempToken(res.tempToken);
        toast.success("2FA code required");
      } else {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handle2faSubmit = async (e) => {
    e.preventDefault();
    if (!twoFaCode) {
      toast.error("Please enter your 2FA code");
      return;
    }
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFaCode, tempToken })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message ?? "Invalid 2FA Code");
      
      window.localStorage.setItem("sop-token", payload.token);
      toast.success("Verified!");
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-electric-400 to-violet-400">
              Opportunity OS
            </span>
          </Link>
          <h2 className="text-xl font-display font-semibold text-white mt-4">
            {is2faRequired ? "Two-Factor Verification" : "Sign in to your account"}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {is2faRequired ? "Enter the authenticator code below" : "Enter your email and credentials"}
          </p>
        </div>

        <Card className="p-8">
          {!is2faRequired ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Password
                  </span>
                  <Link to="/forgot-password" className="text-xs text-electric-400 hover:underline">
                    Forgot?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" loading={loading} className="w-full mt-2">
                Sign In
              </Button>

              {/* Divider */}
              <div className="relative my-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-navy-800" />
                </div>
                <span className="relative bg-navy-900 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Or continue with
                </span>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
                    window.location.href = `${apiUrl}/auth/google`;
                  }}
                  className="flex items-center justify-center gap-2 py-2 border border-electric-500/10 rounded-lg text-xs font-semibold text-gray-300 hover:bg-navy-800/40 transition-all duration-200"
                >
                  <Chrome className="h-4 w-4" /> Google
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
                    window.location.href = `${apiUrl}/auth/github`;
                  }}
                  className="flex items-center justify-center gap-2 py-2 border border-electric-500/10 rounded-lg text-xs font-semibold text-gray-300 hover:bg-navy-800/40 transition-all duration-200"
                >
                  <Github className="h-4 w-4" /> GitHub
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handle2faSubmit} className="flex flex-col gap-5">
              <div className="flex justify-center p-4 bg-navy-950 rounded-xl border border-electric-500/10 mb-2">
                <Shield className="h-10 w-10 text-electric-400" />
              </div>

              <Input
                label="Verification Code"
                type="text"
                placeholder="6-digit authentication code"
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value)}
                maxLength={6}
                required
              />

              <Button type="submit" loading={loading} className="w-full mt-2">
                Verify & Login
              </Button>

              <button
                type="button"
                onClick={() => setIs2faRequired(false)}
                className="text-xs text-gray-500 hover:text-white text-center mt-1"
              >
                Back to credentials
              </button>
            </form>
          )}
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-electric-400 font-semibold hover:underline">
            Register Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
