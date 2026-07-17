import { Link } from 'react-router-dom';
import { clearSession } from '../utils/accounts';

// variant="marketing" -> full public nav (Home, About, How It Works, Register)
// variant="dashboard"  -> logged-in nav with a title/status line + Log Out
export default function Navbar({ variant = 'marketing', title, status, statusColor = '#48bb78' }) {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <Link to="/">
          <img className="logo" src="/logos/logo.png" alt="Meditrac logo" />
        </Link>
      </div>

      {variant === 'marketing' ? (
        <div className="nav-links">
          <Link to="/" className="nav-item">Home</Link>
          <a href="/#how-it-works" className="nav-item">How It Works</a>
          <a href="/#process" className="nav-item">Our Process</a>
          <Link to="/register" className="nav-btn">Register</Link>
        </div>
      ) : (
        <div className="nav-links">
          <div style={{ textAlign: 'right', marginRight: '5px' }}>
            <p style={{ fontWeight: 700, color: '#2d3748', fontSize: '0.9rem', lineHeight: 1 }}>{title}</p>
            <small style={{ color: statusColor, fontWeight: 600, fontSize: '0.75rem' }}>● {status}</small>
          </div>
          <Link
            to="/"
            className="nav-btn"
            style={{ backgroundColor: '#e53e3e', boxShadow: 'none' }}
            onClick={clearSession}
          >
            Log Out
          </Link>
        </div>
      )}
    </nav>
  );
}
