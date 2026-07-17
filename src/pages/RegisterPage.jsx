import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { loadAccounts, saveAccounts, findAccount, setSession } from '../utils/accounts';
import '../styles/register.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  useEffect(() => { document.title = 'Register - Meditrac'; }, []);

  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [accountType, setAccountType] = useState('user'); // 'user' | 'pharmacy'
  const [message, setMessage] = useState(null); // { text, type: 'error' | 'success' }

  // Refs for every field — same "read the DOM value on submit" approach the
  // vanilla version used, just via React refs instead of getElementById.
  const fields = useRef({});
  const setField = (id) => (el) => { fields.current[id] = el; };
  const valueOf = (id) => (fields.current[id]?.value ?? '').trim();

  function switchMode(next) {
    setMode(next);
    setMessage(null);
  }

  function switchAccountType(next) {
    setAccountType(next);
    setMessage(null);
  }

  function redirectToDashboard(type, name) {
    const encodedName = encodeURIComponent(name);
    navigate(type === 'user' ? `/dashboard/user?name=${encodedName}` : `/dashboard/pharmacy?name=${encodedName}`);
  }

  function handleSignup(e, type) {
    e.preventDefault();
    setMessage(null);

    const email = valueOf(`signup-${type}-email`).toLowerCase();
    const name = type === 'user' ? valueOf('signup-user-name') : valueOf('signup-pharmacy-name');

    const accounts = loadAccounts();

    if (findAccount(accounts, type, email)) {
      setMessage({ text: 'An account with this email already exists. Please log in instead.', type: 'error' });
      setMode('login');
      setAccountType(type);
      return;
    }

    // Pharmacies pin their exact location from the dashboard after signing
    // up instead of during registration — latitude/longitude start unset.
    const account = {
      id: `${type}_${Date.now()}`,
      type,
      name,
      email,
      latitude: null,
      longitude: null,
      password: type === 'pharmacy' ? valueOf('signup-pharmacy-password') : valueOf('signup-user-password'),
      createdAt: Date.now(),
    };

    accounts.push(account);
    saveAccounts(accounts);
    setSession(account);
    redirectToDashboard(type, name);
  }

  function handleLogin(e, type) {
    e.preventDefault();
    setMessage(null);

    const email = valueOf(`login-${type}-email`).toLowerCase();
    const password = valueOf(`login-${type}-password`);
    const accounts = loadAccounts();
    const account = findAccount(accounts, type, email);

    if (!account) {
      setMessage({ text: 'Account not found. Please sign up first.', type: 'error' });
      setMode('signup');
      setAccountType(type);
      return;
    }

    if (account.password !== password) {
      setMessage({ text: 'Incorrect password. Please try again.', type: 'error' });
      return;
    }

    setSession(account);
    redirectToDashboard(type, account.name);
  }

  const showForm = `${mode}-${accountType}`;

  return (
    <>
      <Navbar variant="marketing" />

      <div className="main-auth-container">
        <div className="register-logo-container">
          <img className="register-logo" src="/logos/process-illustration.png" alt="" />
        </div>

        <div className="auth-container">
          <h2>{mode === 'signup' ? 'Join Meditrac' : 'Welcome Back'}</h2>
          <p className="auth-subtitle">
            {mode === 'signup' ? 'Select your account type to continue registration' : 'Log in to pick up right where you left off'}
          </p>

          <div className="toggle-buttons" id="type-toggle">
            <button
              type="button"
              className={`toggle-btn ${accountType === 'user' ? 'active' : ''}`}
              onClick={() => switchAccountType('user')}
            >
              Regular User
            </button>
            <button
              type="button"
              className={`toggle-btn ${accountType === 'pharmacy' ? 'active' : ''}`}
              onClick={() => switchAccountType('pharmacy')}
            >
              Pharmacy Portal
            </button>
          </div>

          {message && (
            <p className={`message-box ${message.type} show-message`} style={{ display: 'block' }}>
              {message.text}
            </p>
          )}

          {showForm === 'signup-user' && (
            <form onSubmit={(e) => handleSignup(e, 'user')}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" ref={setField('signup-user-name')} required placeholder="e.g., John Doe" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" ref={setField('signup-user-email')} required placeholder="e.g., john@example.com" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" ref={setField('signup-user-password')} required placeholder="Create a password" />
              </div>
              <button type="submit" className="submit-btn">Register &amp; Log In</button>
            </form>
          )}

          {showForm === 'signup-pharmacy' && (
            <form onSubmit={(e) => handleSignup(e, 'pharmacy')}>
              <div className="form-group">
                <label>Pharmacy / Chemist Name</label>
                <input type="text" ref={setField('signup-pharmacy-name')} required placeholder="e.g., Halisi Pharmaceuticals" />
              </div>
              <div className="form-group">
                <label>Official Email</label>
                <input type="email" ref={setField('signup-pharmacy-email')} required placeholder="e.g., info@halisipharmacy.co.ke" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" ref={setField('signup-pharmacy-password')} required placeholder="Create a password" />
              </div>
              <button type="submit" className="submit-btn">Register Pharmacy Portal</button>
            </form>
          )}

          {showForm === 'login-user' && (
            <form onSubmit={(e) => handleLogin(e, 'user')}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" ref={setField('login-user-email')} required placeholder="e.g., john@example.com" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" ref={setField('login-user-password')} required placeholder="Enter your password" />
              </div>
              <button type="submit" className="submit-btn">Log In</button>
            </form>
          )}

          {showForm === 'login-pharmacy' && (
            <form onSubmit={(e) => handleLogin(e, 'pharmacy')}>
              <div className="form-group">
                <label>Official Email</label>
                <input type="email" ref={setField('login-pharmacy-email')} required placeholder="e.g., info@halisipharmacy.co.ke" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" ref={setField('login-pharmacy-password')} required placeholder="Enter your password" />
              </div>
              <button type="submit" className="submit-btn">Log In</button>
            </form>
          )}

          <p className="switch-hint">
            {mode === 'signup' ? (
              <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); switchMode('login'); }}>Log in instead</a></>
            ) : (
              <>Don't have an account yet? <a href="#" onClick={(e) => { e.preventDefault(); switchMode('signup'); }}>Sign up instead</a></>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
