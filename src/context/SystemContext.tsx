import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SystemSettings {
  appName: string;
  adminEmail: string;
  primaryColor: string;
  logoUrl?: string;
  isDualBalanceEnabled?: boolean;
  whatsapp?: string;
  telegram?: string;
  youtube?: string;
  shopping?: string;
  mainBalanceCommission?: number;
  levelSettings?: Record<string, {
    mainCommission: number;
    driveCommission: number;
    registrationCost: number;
  }>;
}

interface SystemContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  loading: boolean;
}

const defaultSettings: SystemSettings = {
  appName: 'Mubarak Telecom',
  adminEmail: 'mubaraktelecomltd@gmail.com',
  primaryColor: '#0ea5e9', // default sky-500
  logoUrl: 'https://i.postimg.cc/8P2Tjy1L/Logo.jpg',
};

const SystemContext = createContext<SystemContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  loading: true,
});

export const SystemProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'config');
    
    const unsubscribe = onSnapshot(settingsDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SystemSettings;
        setSettings(data);
        document.documentElement.style.setProperty('--primary-color', data.primaryColor);
      } else {
        // Just use defaults if document doesn't exist yet
        setSettings(defaultSettings);
        document.documentElement.style.setProperty('--primary-color', defaultSettings.primaryColor);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching settings:", error);
      // Fallback to defaults on permission error too, so app can still load
      setSettings(defaultSettings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    const settingsDocRef = doc(db, 'settings', 'config');
    await setDoc(settingsDocRef, { ...settings, ...newSettings }, { merge: true });
  };

  return (
    <SystemContext.Provider value={{ settings, updateSettings, loading }}>
      {!loading && children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
