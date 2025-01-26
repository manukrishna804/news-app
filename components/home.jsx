import { useNavigate } from 'react-router-dom';
import './home.css';

export default function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div 
      className="home-container"
      style={{ backgroundImage: 'url("./images/homebg.png")' }}
    >
      <header className="header">
        <nav className="nav-container">
          <div className="nav-content">
            <a href="/" className="logo">
              <img src="./images/logo.png" alt="Univoice" />
            </a>
            <ul className="nav-links">
              <li><a href="/">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
        </nav>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">Ecosphere</h1>
              <p className="hero-subtitle">Amplifying Voices, Defining News</p>
              <button
                onClick={handleLogin}
                className="login-button"
              >
                Login Here
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Ecosphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}