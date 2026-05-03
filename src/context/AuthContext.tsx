import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useSystem } from './SystemContext';

interface UserProfile {
  uid: string;
  phoneNumber: string;
  displayName: string;
  balance: number;
  level: string;
  pin: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, refreshProfile: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useSystem();

  const fetchProfile = async (currentUser: User) => {
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      setProfile({
        ...data,
        isAdmin: currentUser.email === settings.adminEmail || currentUser.email === 'mubaraktelecomltd@mubaraktelecom.com'
      } as UserProfile);
    } else {
      // Create default profile for new users
      const newProfile = {
        uid: currentUser.uid,
        phoneNumber: '',
        displayName: currentUser.displayName || 'User',
        balance: 0,
        level: 'user',
        pin: '', // Will be set in SetupModal
        createdAt: serverTimestamp(),
      };
      await setDoc(userDocRef, newProfile);
      setProfile({ ...newProfile, isAdmin: currentUser.email === settings.adminEmail || currentUser.email === 'mubaraktelecomltd@mubaraktelecom.com' } as any);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Use onSnapshot for real-time updates
        unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setProfile({
              ...data,
              isAdmin: currentUser.email === settings.adminEmail || currentUser.email === 'mubaraktelecomltd@mubaraktelecom.com'
            } as UserProfile);
          } else {
            // Document doesn't exist, create it (legacy fallback from fetchProfile)
            const createInitialProfile = async () => {
              const newProfile = {
                uid: currentUser.uid,
                phoneNumber: '',
                displayName: currentUser.displayName || 'User',
                balance: 0,
                level: 'user',
                pin: '',
                createdAt: serverTimestamp(),
              };
              await setDoc(userDocRef, newProfile);
            };
            createInitialProfile();
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile listen error:", error);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [settings.adminEmail]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
