import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function HomePage() {
  useEffect(() => { document.title = 'Meditrac'; }, []);

  return (
    <>
      <Navbar variant="marketing" />

      <header className="header">
        <img className="background" src="/logos/img.png" alt="consultant" />
        <div className="intro-text">
          <h1>Find medicine anytime, anywhere</h1>
          <p className="hero-subtext">Skip the calls and empty-handed trips. Meditrac connects you with verified local pharmacy stock in real time.</p>
        </div>
        <Link to="/register" className="get-started-btn">Get Started</Link>
      </header>

      <main>
        <section className="benefits-section">
          <h2 className="benefits-heading">Why choose Meditrac</h2>
          <div className="benefits-container">
            <div className="benefit-box">
              <img className="benefit-icon" src="/logos/icon-search.png" alt="" />
              <h3>Find medicine fast</h3>
              <p>Search any medicine and see which pharmacies have it now.</p>
            </div>
            <div className="benefit-box">
              <img className="benefit-icon" src="/logos/icon-location.png" alt="" />
              <h3>Nearby pharmacy finder</h3>
              <p>Discover every pharmacy near you on one simple map view.</p>
            </div>
            <div className="benefit-box">
              <img className="benefit-icon" src="/logos/icon-clock.png" alt="" />
              <h3>Real-time stock status</h3>
              <p>Know before you go - stock levels update as they change.</p>
            </div>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <h2>How It Works</h2>
          <div className="how-container">
            <div className="how-step">
              <div className="step-num">1</div>
              <h3>Search Medicine</h3>
              <p>Type the medication you need into our real-time tracking engine.</p>
            </div>
            <div className="how-step">
              <div className="step-num">2</div>
              <h3>Locate Stock</h3>
              <p>View verified local pharmacies closest to you matching your criteria.</p>
            </div>
            <div className="how-step">
              <div className="step-num">3</div>
              <h3>Pick Up</h3>
              <p>Check operating hours, grab contact details, and head over with complete certainty.</p>
            </div>
          </div>
        </section>

        <section className="process-section" id="process">
          <div className="process-visual">
            <img src="/logos/process-illustration.png" alt="Pharmacy illustration with pill bottle and medicine icons" />
          </div>
          <div className="process-text">
            <h2>Our Process</h2>
            <p className="section-subtext">How we sync with local pharmacies to keep medicine verification practical and reliable.</p>
            <div className="process-grid">
              <div className="process-card">
                <h4>Stock Synchronization</h4>
                <p>Partner local pharmacies update their dashboard inventories daily to reflect exact stock on shelves, reducing double trips for rare prescriptions.</p>
              </div>
              <div className="process-card">
                <h4>Neighborhood Mapping</h4>
                <p>We filter search results by proximity so you can easily discover chemists in your immediate estate or estate routes without traveling to the CBD.</p>
              </div>
              <div className="process-card">
                <h4>Verification &amp; Pricing</h4>
                <p>Pharmacies supply baseline pricing and cross-verify active items on their profiles, letting patients budget and check availability concurrently.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pharmacy-promo">
          <div className="promo-visual">
            <div className="blob blob-light"></div>
            <div className="blob blob-dark">
              <div className="icon-pill icon-capsule"></div>
              <div className="icon-pill icon-tablet"></div>
              <div className="icon-syringe">
                <div className="syringe-plunger"></div>
                <div className="syringe-grip"></div>
                <div className="syringe-barrel"></div>
                <div className="syringe-needle"></div>
              </div>
              <div className="icon-dot"></div>
            </div>
          </div>

          <div className="promo-content">
            <h2>Are you a pharmacy partner?</h2>
            <p className="promo-subtitle">Grow with Meditrac for pharmacies</p>

            <ul className="promo-list">
              <li><span className="arrow">&#8594;</span> Broadcast live medicine stock</li>
              <li><span className="arrow">&#8594;</span> Reach nearby patients searching now</li>
              <li><span className="arrow">&#8594;</span> Reduce wasted walk-in trips</li>
              <li><span className="arrow">&#8594;</span> Trusted by pharmacies nationwide</li>
            </ul>

            <Link to="/register" className="promo-btn">Learn more</Link>
          </div>
        </section>

        <section className="about-heading" id="about-us">
          <h1>Who are we?</h1>
          <p className="first-paragraph">At Meditrac, we believe that access to essential medicine should never be a guessing game. Founded with a simple but powerful vision, Meditrac was built to solve a frustration familiar to millions — arriving at a pharmacy only to find that the medication you urgently need is out of stock.</p>
          <p className="second-paragraph">We work closely with pharmacies and healthcare providers to maintain an accurate, up-to-date database of medicine stock across a wide network of outlets. Whether you are searching for a hard-to-find drug, Meditrac puts the information you need at your fingertips.</p>
        </section>

        <section className="auth-placeholder-section" id="login-section">
          <h2>Access Meditrac Ecosystem</h2>
          <div className="auth-cards">
            <div className="auth-card">
              <h3>For Users</h3>
              <p>Track medications, locate nearby stocks instantly via maps, and get live pharmacy alerts.</p>
              <Link to="/register" className="active-auth-btn">Sign Up as User</Link>
            </div>
            <div className="auth-card">
              <h3>For Pharmacies</h3>
              <p>Broadcast your live inventory stock, minimize overhead, and capture nearby traffic requests.</p>
              <Link to="/register" className="active-auth-btn secondary">Register Pharmacy Portal</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <img className="footer-logo" src="/logos/logo.png" alt="Meditrac logo" />
            <p>Your neighborhood pharmacy navigator.</p>
          </div>
          <div className="footer-links-column">
            <h4>Navigation</h4>
            <Link to="/">Home</Link>
            <a href="#about-us">About Us</a>
            <a href="#how-it-works">How It Works</a>
          </div>
          <div className="footer-links-column">
            <h4>Support</h4>
            <p className="footer-contact-info"> +254 712 345 678</p>
            <p className="footer-contact-info"> support@meditrac.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <small>&copy; 2026 Meditrac. All Rights Reserved.</small>
        </div>
      </footer>
    </>
  );
}
