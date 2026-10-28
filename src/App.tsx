import React, { useState, useEffect, useRef } from 'react';
import { WeddingConfig } from './types/wedding';
import { defaultWeddingConfig } from './data/defaultConfig';
import { InvitationCover } from './components/InvitationCover';
import { SaveTheDateHero } from './components/SaveTheDateHero';
import { FamilyDetails } from './components/FamilyDetails';
import { CouplePortraits } from './components/CouplePortraits';
import { VenueSection } from './components/VenueSection';
import { GallerySection } from './components/GallerySection';
import { RSVPSection } from './components/RSVPSection';
import { LoveStorySection } from './components/LoveStorySection';
import { BankingSection } from './components/BankingSection';
import { WishesSection } from './components/WishesSection';
import { ClosingSection } from './components/ClosingSection';
import { MusicPlayer, MusicPlayerHandle } from './components/MusicPlayer';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';

export function App() {
  const [config, setConfig] = useState<WeddingConfig>(defaultWeddingConfig);
  const [loading, setLoading] = useState(true);
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState<string>('admin');

  const musicPlayerRef = useRef<MusicPlayerHandle | null>(null);

  // Check URL path on mount and on popstate
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      if (path === '/admin' || path.startsWith('/admin/')) {
        setIsAdminPath(true);
      } else {
        setIsAdminPath(false);
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  // Check existing admin session in localStorage
  useEffect(() => {
    const token = localStorage.getItem('wedding_admin_token');
    const user = localStorage.getItem('wedding_admin_user');
    if (token) {
      // Verify token
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            setAdminToken(token);
            if (user) setAdminUsername(user);
          } else {
            localStorage.removeItem('wedding_admin_token');
            localStorage.removeItem('wedding_admin_user');
            setAdminToken(null);
          }
        })
        .catch(() => {
          setAdminToken(null);
        });
    }
  }, []);

  // Fetch wedding configuration
  const loadConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);

        // Update document title and OG meta dynamically
        if (data.seo?.pageTitle) {
          document.title = data.seo.pageTitle;
        }
      }
    } catch (err) {
      console.warn('Could not load remote config, using defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Opening the invitation card
  const handleOpenInvitation = async () => {
    setIsCoverOpen(true);
    document.body.classList.remove('cover-is-open');

    // Trigger music playback from user click
    if (musicPlayerRef.current) {
      await musicPlayerRef.current.playMusic();
    }
  };

  // Lock body scroll while cover is closed
  useEffect(() => {
    if (!isAdminPath) {
      if (!isCoverOpen && config.cover.enabled) {
        document.body.classList.add('cover-is-open');
      } else {
        document.body.classList.remove('cover-is-open');
      }
    } else {
      document.body.classList.remove('cover-is-open');
    }
  }, [isCoverOpen, config.cover.enabled, isAdminPath]);

  // Navigate between public and admin
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    if (path === '/admin') {
      setIsAdminPath(true);
    } else {
      setIsAdminPath(false);
      loadConfig(); // Reload any fresh edits
    }
  };

  // Logout handler
  const handleLogout = async () => {
    if (adminToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch {
        // Ignore
      }
    }
    localStorage.removeItem('wedding_admin_token');
    localStorage.removeItem('wedding_admin_user');
    setAdminToken(null);
  };

  // Admin Route View
  if (isAdminPath) {
    if (!adminToken) {
      return (
        <AdminLogin
          onLoginSuccess={(token, user) => {
            setAdminToken(token);
            setAdminUsername(user);
          }}
          onBackToInvitation={() => navigateTo('/')}
        />
      );
    }
    return (
      <AdminDashboard
        token={adminToken}
        username={adminUsername}
        onLogout={handleLogout}
        onViewPublic={() => navigateTo('/')}
      />
    );
  }

  // Public Wedding Invitation View
  return (
    <div className="relative min-h-screen">
      {/* Background Music Player */}
      <MusicPlayer ref={musicPlayerRef} config={config} />

      {/* Opening Invitation Card */}
      {config.cover.enabled && (
        <InvitationCover
          config={config}
          isOpen={isCoverOpen}
          onOpen={handleOpenInvitation}
        />
      )}

      {/* Long-form Invitation Page */}
      <main className="invitation">
        {/* Section 1: Hero */}
        <SaveTheDateHero config={config} />

        {/* Section 1.5: Love Story (fills empty space with milestone memories) */}
        <LoveStorySection config={config} />

        {/* Section 2: Family details & timeline */}
        <FamilyDetails config={config} />

        {/* Section 3: Couple Portraits */}
        <CouplePortraits config={config} />

        {/* Section 4: Venue & Maps & Countdown & Calendar */}
        <VenueSection config={config} />

        {/* Section 5: Gallery */}
        <GallerySection config={config} />

        {/* Section 6: RSVP */}
        <RSVPSection config={config} />

        {/* Section 7: Wishes */}
        <WishesSection config={config} />

        {/* Section 8: Banking QR & Gift Box */}
        <BankingSection config={config} />

        {/* Section 9: Closing */}
        <ClosingSection config={config} />
      </main>
    </div>
  );
}

export default App;
