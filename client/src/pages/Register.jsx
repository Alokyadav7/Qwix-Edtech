import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Building, Landmark, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-hot-toast";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("student"); // student | company
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password, role });
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Background orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-electric-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-electric-400 to-violet-400">
              Opportunity OS
            </span>
          </Link>
          <h2 className="text-xl font-display font-semibold text-white mt-4">
            Create your account
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Choose your role and complete registrations
          </p>
        </div>

        {/* Role Select Group */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setRole("student")}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 text-center relative overflow-hidden ${
              role === "student"
                ? "border-electric-400 bg-electric-500/10"
                : "border-electric-500/10 bg-navy-900/40 hover:border-electric-400/25"
            }`}
            type="button"
          >
            <User className={`h-6 w-6 ${role === "student" ? "text-electric-400" : "text-gray-400"}`} />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Student</span>
            <span className="text-[10px] text-gray-500">Apply to opportunities, mock code and tests</span>
            {role === "student" && (
              <span className="absolute top-1.5 right-1.5 p-0.5 bg-electric-400 rounded-full text-navy-950">
                <Check className="h-3 w-3" />
              </span>
            )}
          </button>

          <button
            onClick={() => setRole("company")}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 text-center relative overflow-hidden ${
              role === "company"
                ? "border-electric-400 bg-electric-500/10"
                : "border-electric-500/10 bg-navy-900/40 hover:border-electric-400/25"
            }`}
            type="button"
          >
            <Building className={`h-6 w-6 ${role === "company" ? "text-electric-400" : "text-gray-400"}`} />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Company</span>
            <span className="text-[10px] text-gray-500">Post vacancies, check ATS scores, manage funnel</span>
            {role === "company" && (
              <span className="absolute top-1.5 right-1.5 p-0.5 bg-electric-400 rounded-full text-navy-950">
                <Check className="h-3 w-3" />
              </span>
            )}
          </button>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Full Name / Brand Name"
              type="text"
              placeholder="e.g. Arjun Mehta or Meta Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2">
              Register Account
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already registered?{" "}
          <Link to="/login" className="text-electric-400 font-semibold hover:underline">
            Login Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
