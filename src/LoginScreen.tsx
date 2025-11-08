import { useAuth0 } from '@auth0/auth0-react';
import './LoginScreen.css';

export default function LoginScreen() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Planetary Researchers</h1>
        <p className="login-subtitle">Voice Chat Investigation Game</p>
        <p className="login-description">
          Interview 10 planetary researchers and identify who is telling the truth
        </p>
        <button
          className="login-button"
          onClick={() => loginWithRedirect()}
        >
          Log In
        </button>
      </div>
    </div>
  );
}
