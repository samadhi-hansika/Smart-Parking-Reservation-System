import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  LogOut
} from "lucide-react";

import { auth, db } from "../firebase";
import DashboardNavbar from "../components/layout/DashboardNavbar";
import Btn from "../components/common/Btn";

export default function UserProfile({ user }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const profileSnapshot = await getDoc(doc(db, "users", user.uid));
        const profileData = profileSnapshot.exists() ? profileSnapshot.data() : {};
        if (!cancelled) {
          setName(profileData.name || user.displayName || user.email?.split("@")[0] || "");
          setEmail(profileData.email || user.email || "");
        }
      } catch (loadError) {
        console.error("Profile load error:", loadError);
        if (!cancelled) {
          setName(user.displayName || user.email?.split("@")[0] || "");
          setEmail(user.email || "");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadProfile();
    return () => { cancelled = true; };
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await setDoc(doc(db, "users", user.uid), { name: cleanName }, { merge: true });
      setName(cleanName);
      setNotice("Profile name successfully updated.");
    } catch (saveError) {
      console.error("Save profile error:", saveError);
      setError("Could not update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordNotice("");

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordNotice("Password updated successfully.");
    } catch (err) {
      console.error("Password update error:", err);
      if (["auth/wrong-password", "auth/invalid-credential"].includes(err.code)) {
        setPasswordError("Current password is incorrect.");
      } else {
        setPasswordError(err.message || "Could not update password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="dashboard-page-wrapper">
      <DashboardNavbar user={user} />

      <main className="dashboard-main-content">
        <div className="container max-w-3xl">
          {/* Header */}
          <div className="profile-header-banner">
            <div className="profile-avatar-circle">
              <span className="profile-initials">
                {name ? name.slice(0, 2).toUpperCase() : "U"}
              </span>
            </div>
            <div className="profile-banner-info">
              <h1>{name || "Driver Profile"}</h1>
              <p>{email}</p>
              <span className="profile-badge-pill">Verified ParkLink Driver</span>
            </div>
          </div>

          {/* Feedback messages */}
          {error && <div className="alert-box alert-error mb-4">{error}</div>}
          {notice && <div className="alert-box alert-success mb-4">{notice}</div>}

          {/* Personal Info Form */}
          <div className="settings-card-modern">
            <div className="settings-card-title">
              <UserRound size={20} className="text-primary" />
              <h3>Personal Details</h3>
            </div>
            <p className="settings-card-sub">Update your account name and contact information.</p>

            <form onSubmit={saveProfile} className="settings-form">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <UserRound size={17} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon input-disabled">
                  <Mail size={17} />
                  <input type="email" value={email} readOnly disabled />
                </div>
                <small className="field-hint">Email address cannot be changed.</small>
              </div>

              <Btn
                type="submit"
                variant="primary"
                disabled={loading || saving}
                className="mt-2"
              >
                {saving ? "Saving Changes…" : "Save Changes"}
              </Btn>
            </form>
          </div>

          {/* Security & Password */}
          <div className="settings-card-modern mt-4">
            <div className="settings-card-title">
              <LockKeyhole size={20} className="text-primary" />
              <h3>Security & Password</h3>
            </div>
            <p className="settings-card-sub">Ensure your account is protected with a strong password.</p>

            {passwordError && <div className="alert-box alert-error mb-3">{passwordError}</div>}
            {passwordNotice && <div className="alert-box alert-success mb-3">{passwordNotice}</div>}

            <form onSubmit={changePassword} className="settings-form">
              <div className="form-group">
                <label>Current Password</label>
                <div className="input-with-icon">
                  <LockKeyhole size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-with-icon">
                    <LockKeyhole size={17} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-with-icon">
                    <LockKeyhole size={17} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>
              </div>

              <Btn
                type="submit"
                variant="primary"
                disabled={saving}
                className="mt-2"
              >
                {saving ? "Updating Password…" : "Update Password"}
              </Btn>
            </form>
          </div>

          {/* Sign Out Card */}
          <div className="settings-card-modern mt-4 signout-card">
            <div>
              <h3>Sign Out of Session</h3>
              <p>Log out of your ParkLink account on this device.</p>
            </div>
            <Btn variant="outline" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Log Out</span>
            </Btn>
          </div>
        </div>
      </main>
    </div>
  );
}
export { UserProfile };
