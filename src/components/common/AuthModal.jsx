import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { X, Eye, EyeOff, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, KeyRound } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, setAuthModalTab, authReason, login, signup } = useAuth();

  const [showForgotNotice, setShowForgotNotice] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isJamia, setIsJamia] = useState(true);
  const [collegeName, setCollegeName] = useState('');
  const [course, setCourse] = useState('B.Tech CSE');
  const [signupError, setSignupError] = useState('');
  const [signupSuccessMsg, setSignupSuccessMsg] = useState('');
  const [signupSubmitting, setSignupSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);

    const res = await login(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.message);
    }
    setLoginSubmitting(false);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccessMsg('');

    // Email Regex Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail.trim())) {
      setSignupError('Please enter a syntactically valid email (e.g. saquib@example.com).');
      return;
    }

    if (password.length < 8) {
      setSignupError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setSignupError('Password and Confirm Password do not match.');
      return;
    }

    if (!isJamia && !collegeName.trim()) {
      setSignupError('Please enter your College or University Name.');
      return;
    }

    setSignupSubmitting(true);
    const res = await signup({
      fullName,
      email: signupEmail,
      phone,
      password,
      confirmPassword,
      isJamia,
      collegeName: isJamia ? 'Jamia Hamdard' : collegeName,
      course: isJamia ? course : ''
    });

    if (res.success) {
      setSignupSuccessMsg(res.message || 'Account Created! Your account has been created as a Visitor.');
    } else {
      setSignupError(res.message);
    }
    setSignupSubmitting(false);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 flex min-h-full items-center justify-center">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md my-auto bg-[#121721] border border-[#30363d] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl text-white z-[10000]">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#1e2530] text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1b5e20] to-[#2f9e44] p-0.5 mx-auto shadow-lg">
            <div className="w-full h-full rounded-[14px] bg-[#0d1117] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#2f9e44]" />
            </div>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">GFG CAMPUS BODY</h2>
          <p className="text-[11px] text-gray-400">Connect. Learn. Build. Grow together.</p>
        </div>

        {/* Context-aware action reason banner */}
        {authReason && authReason !== 'sign in to continue' && (
          <div className="p-2.5 rounded-xl bg-[#2f9e44]/15 border border-[#2f9e44]/30 text-[#2f9e44] text-[11px] font-mono text-center font-bold animate-in fade-in">
            Please sign in to {authReason}.
          </div>
        )}

        {/* Auth Mode Toggle Tabs */}
        <div className="flex rounded-xl bg-[#0d1117] p-1 border border-[#30363d]">
          <button
            type="button"
            onClick={() => { setAuthModalTab('login'); setLoginError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authModalTab === 'login'
                ? 'bg-[#2f9e44] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalTab('signup'); setSignupError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authModalTab === 'signup'
                ? 'bg-[#2f9e44] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            JOIN COMMUNITY
          </button>
        </div>

        {/* Form Body Box */}
        <div className="max-h-[65vh] overflow-y-auto pr-1">
          
          {/* TAB 1: LOGIN FORM */}
          {authModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {loginError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2 text-xs font-medium">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="saquib@example.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-gray-300 font-semibold">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotNotice(!showForgotNotice)}
                    className="text-[11px] text-[#2f9e44] hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>

                {showForgotNotice && (
                  <div className="mb-3 p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2 text-left animate-fade-in">
                    <div className="flex items-center justify-between text-[#2f9e44] font-bold text-xs">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4" /> Forgot your password?
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowForgotNotice(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      Password reset by email isn't available yet. If you're signed in, you can change your password from:
                    </p>
                    <div className="p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[10px] font-mono text-[#2f9e44] font-bold text-center">
                      Profile → Settings → Security
                    </div>
                  </div>
                )}
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-3.5 pr-10 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-[#2f9e44]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginSubmitting}
                className="w-full py-3 rounded-xl gradient-button font-bold text-xs shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loginSubmitting ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-gray-400">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setAuthModalTab('signup')}
                  className="text-[#2f9e44] font-bold hover:underline"
                >
                  Create Account
                </button>
              </div>
            </form>
          ) : (
            /* TAB 2: SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
              
              {signupSuccessMsg ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-[#2f9e44]/40 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#2f9e44] mx-auto" />
                  <h4 className="text-sm font-bold text-white">✓ Account Created</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Welcome to GFG Campus Community. Your account has been registered as a <strong>Visitor</strong>. Official GFG membership is verified by the Campus Body.
                  </p>
                  <button
                    type="button"
                    onClick={closeAuthModal}
                    className="w-full py-2.5 rounded-xl gradient-button font-bold text-xs"
                  >
                    Explore Community
                  </button>
                </div>
              ) : (
                <>
                  {signupError && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>{signupError}</span>
                      </div>
                      {signupError.toLowerCase().includes('already exists') && (
                        <button
                          type="button"
                          onClick={() => {
                            setLoginEmail(signupEmail);
                            setSignupError('');
                            setAuthModalTab('login');
                          }}
                          className="w-full py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          Sign In Instead <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Saquib Sarfaraz"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-white text-xs font-medium focus:outline-none focus:border-[#2f9e44]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="saquib@example.com"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-white text-xs font-medium focus:outline-none focus:border-[#2f9e44]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-white text-xs font-medium focus:outline-none focus:border-[#2f9e44]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Password *</label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 8 chars"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-3 pr-8 py-2 text-white text-xs font-medium focus:outline-none focus:border-[#2f9e44]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-white text-xs font-medium focus:outline-none focus:border-[#2f9e44]"
                      />
                    </div>
                  </div>

                  {/* Jamia Selection */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Are you from Jamia Hamdard? *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsJamia(true)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          isJamia
                            ? 'bg-[#2f9e44] text-white border-[#2f9e44] shadow-md'
                            : 'bg-[#0d1117] text-gray-400 border-[#30363d] hover:text-white'
                        }`}
                      >
                        Yes ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsJamia(false)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          !isJamia
                            ? 'bg-[#2f9e44] text-white border-[#2f9e44] shadow-md'
                            : 'bg-[#0d1117] text-gray-400 border-[#30363d] hover:text-white'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Conditional College Input */}
                  {isJamia ? (
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Programme / Course (Optional)</label>
                      <select
                        value={course}
                        onChange={e => setCourse(e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-white text-xs font-medium focus:outline-none focus:border-[#2f9e44]"
                      >
                        <option value="B.Tech CSE">B.Tech CSE</option>
                        <option value="B.Tech ECE">B.Tech ECE</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                        <option value="Diploma CSE">Diploma CSE</option>
                        <option value="B.Sc CS">B.Sc Computer Science</option>
                        <option value="Other">Other Programme</option>
                      </select>
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <label className="block text-gray-300 font-semibold mb-1">College / University Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Delhi Technological University"
                        value={collegeName}
                        onChange={e => setCollegeName(e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2 text-white text-xs font-medium focus:outline-none focus:border-[#2f9e44]"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={signupSubmitting}
                    className="w-full py-3 rounded-xl gradient-button font-bold text-xs shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {signupSubmitting ? 'Creating Visitor Account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

            </form>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
}
