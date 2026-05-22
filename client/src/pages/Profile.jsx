import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-hot-toast";
import { User, Mail, ShieldAlert, Award, FileText, CheckCircle2, QrCode } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";

export default function Profile() {
  const { user, updateUser } = useAuth();
  
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  // 2FA setups
  const [is2faEnabled, setIs2faEnabled] = useState(user?.twoFactorEnabled ?? false);
  const [qrCode, setQrCode] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [showQrPanel, setShowQrPanel] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toggling2fa, setToggling2fa] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = window.localStorage.getItem("sop-token");
      const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/student/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, bio })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message ?? "Profile update failed");
      
      updateUser(payload.user);
      toast.success("Profile saved!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handle2faToggle = async () => {
    if (is2faEnabled) {
      // Disable
      setToggling2fa(true);
      try {
        const token = window.localStorage.getItem("sop-token");
        const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
        const res = await fetch(`${apiUrl}/auth/disable-2fa`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Disable failed");
        setIs2faEnabled(false);
        setShowQrPanel(false);
        toast.success("2FA Disabled!");
      } catch (err) {
        toast.error(err.message);
      } finally {
        setToggling2fa(false);
      }
    } else {
      // Enable: request QR code
      setToggling2fa(true);
      try {
        const token = window.localStorage.getItem("sop-token");
        const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
        const res = await fetch(`${apiUrl}/auth/enable-2fa`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message ?? "Failed to request 2FA");
        
        setQrCode(payload.qrCode); // data URI
        setShowQrPanel(true);
        toast.success("Scan the QR code to set up 2FA");
      } catch (err) {
        toast.error(err.message);
      } finally {
        setToggling2fa(false);
      }
    }
  };

  const handleVerify2faSetup = async () => {
    if (!twoFaCode) return;
    setToggling2fa(true);
    try {
      const token = window.localStorage.getItem("sop-token");
      const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/confirm-2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ code: twoFaCode })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message ?? "Verification failed");

      setIs2faEnabled(true);
      setShowQrPanel(false);
      setTwoFaCode("");
      toast.success("2FA Enabled successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToggling2fa(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6 text-left">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900/60 to-electric-500/5 p-6 rounded-2xl border border-electric-500/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-2">
            <User className="h-6 w-6 text-electric-400" />
            My Account & Settings
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your personal credentials, bio, and security keys.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left side Form (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card hoverable={false} className="p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Profile Settings</h3>
            
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email (Cannot Change)"
                type="email"
                value={email}
                disabled
                className="opacity-60 cursor-not-allowed"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bio Summary</label>
                <textarea
                  placeholder="Tell recruiters about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full p-3.5 bg-navy-950/80 border border-electric-500/15 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-electric-400"
                />
              </div>

              <Button type="submit" loading={saving} className="w-fit">
                Save Changes
              </Button>
            </form>
          </Card>
        </div>

        {/* Right side Security (4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card hoverable={false} className="p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-400" /> Account Security
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">2FA Authentication</span>
                  <span className="text-[10px] text-gray-500 block">Protect login steps</span>
                </div>
                <button
                  onClick={handle2faToggle}
                  disabled={toggling2fa}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    is2faEnabled ? "bg-neon-500" : "bg-navy-800"
                  }`}
                  type="button"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      is2faEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* QR Panel for activation setup */}
              {showQrPanel && qrCode && (
                <div className="mt-4 p-4 bg-navy-950 rounded-xl border border-electric-500/10 flex flex-col items-center gap-4 text-center">
                  <div className="bg-white p-2 rounded-lg">
                    <img src={qrCode} alt="2FA QR Code" className="h-32 w-32 object-contain" />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Scan this image inside your Authenticator App (Google Authenticator / Authy), then type the code below to confirm setup.
                  </p>
                  
                  <div className="w-full flex gap-2">
                    <Input
                      placeholder="6-digit code"
                      value={twoFaCode}
                      onChange={(e) => setTwoFaCode(e.target.value)}
                      maxLength={6}
                    />
                    <Button onClick={handleVerify2faSetup} loading={toggling2fa} size="sm">
                      Verify
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
