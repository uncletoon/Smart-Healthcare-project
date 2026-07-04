import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await register({
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        password,
        role: "adminUser", // Automatically register as an admin for the dashboard
      });
      navigate("/facility-dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        .auth-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #F8F9FA;
          font-family: 'Outfit', sans-serif;
        }

        .auth-card-container {
          max-width: 380px;
          width: 100%;
          background: #ffffff;
          background: linear-gradient(0deg, #ffffff 0%, #f4faf8 100%);
          border-radius: 40px;
          padding: 30px 35px;
          border: 5px solid #ffffff;
          box-shadow: rgba(0, 77, 64, 0.15) 0px 30px 30px -20px;
          margin: 20px;
        }

        .heading {
          text-align: center;
          font-weight: 900;
          font-size: 30px;
          color: #004D40;
        }

        .form {
          margin-top: 20px;
        }

        .form .input-group {
          width: 100%;
        }

        .form .input {
          width: 100%;
          background: white;
          border: 1px solid #e0f2f1;
          padding: 15px 20px;
          border-radius: 20px;
          margin-top: 15px;
          box-shadow: #e0f2f1 0px 10px 10px -5px;
          border-inline: 2px solid transparent;
          box-sizing: border-box;
          transition: all 0.2s ease-in-out;
        }

        .form .input::placeholder {
          color: rgb(170, 170, 170);
        }

        .form .input:focus {
          outline: none;
          border-inline: 2px solid #00695C;
          border-color: #00695C;
        }

        .form .login-button {
          display: block;
          width: 100%;
          font-weight: bold;
          background: linear-gradient(45deg, #004D40 0%, #00695C 100%);
          color: white;
          padding-block: 15px;
          margin: 20px auto;
          border-radius: 20px;
          box-shadow: rgba(0, 77, 64, 0.25) 0px 20px 10px -15px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        .form .login-button:hover:not(:disabled) {
          transform: scale(1.03);
          box-shadow: rgba(0, 77, 64, 0.3) 0px 23px 10px -20px;
        }

        .form .login-button:active:not(:disabled) {
          transform: scale(0.95);
          box-shadow: rgba(0, 77, 64, 0.2) 0px 15px 10px -10px;
        }

        .form .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .social-account-container {
          margin-top: 25px;
        }

        .social-account-container .title {
          display: block;
          text-align: center;
          font-size: 11px;
          color: #666666;
        }

        .social-account-container .social-accounts {
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 8px;
        }

        .social-account-container .social-accounts .social-button {
          background: linear-gradient(45deg, #004D40 0%, #00695C 100%);
          border: 5px solid white;
          padding: 5px;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: grid;
          place-content: center;
          box-shadow: rgba(0, 77, 64, 0.2) 0px 12px 10px -8px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        .social-account-container .social-accounts .social-button .svg {
          fill: white;
          margin: auto;
        }

        .social-account-container .social-accounts .social-button:hover {
          transform: scale(1.2);
        }

        .social-account-container .social-accounts .social-button:active {
          transform: scale(0.9);
        }

        .agreement {
          display: block;
          text-align: center;
          margin-top: 15px;
        }

        .agreement a {
          text-decoration: none;
          color: #00695C;
          font-size: 11px;
          font-weight: 500;
        }

        .agreement a:hover {
          text-decoration: underline;
        }

        .error-banner {
          background-color: #fee4e2;
          border: 1px solid #fda29b;
          color: #b42318;
          padding: 10px;
          border-radius: 12px;
          font-size: 12px;
          margin-top: 15px;
          text-align: center;
        }

        .navigation-links {
          margin-top: 15px;
          text-align: center;
          font-size: 12px;
          color: #666666;
        }

        .navigation-links a {
          color: #00695C;
          font-weight: 600;
          text-decoration: none;
          margin-left: 5px;
        }

        .navigation-links a:hover {
          text-decoration: underline;
        }
      ` }} />

      <div className="auth-card-container">
        <div className="heading">Sign Up</div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <input
              required
              className="input"
              type="text"
              name="fullName"
              id="fullName"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              required
              className="input"
              type="email"
              name="email"
              id="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              required
              className="input"
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              required
              className="input"
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <input
            className="login-button"
            type="submit"
            value={submitting ? "Signing Up..." : "Sign Up"}
            disabled={submitting}
          />
        </form>

        <div className="social-account-container">
          <span className="title">Or Sign up with</span>
          <div className="social-accounts">
            <button className="social-button google" type="button">
              <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 488 512">
                <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
              </svg>
            </button>
            {/* <button className="social-button apple" type="button">
              <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
            </button>
            <button className="social-button twitter" type="button">
              <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
              </svg>
            </button> */}
          </div>
        </div>

        <div className="navigation-links">
          Already have an account? <Link to="/facility-dashboard/login">Sign In</Link>
        </div>

        <span className="agreement">
          <a href="#">Learn user licence agreement</a>
        </span>
      </div>
    </div>
  );
};
export default Register;
