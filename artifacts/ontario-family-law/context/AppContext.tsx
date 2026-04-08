import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserRole = "served" | "serving" | null;

export interface DeadlineItem {
  id: string;
  title: string;
  date: string;
  description: string;
  completed: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChildInfo {
  id: string;
  name: string;
  birthYear: string;
}

export interface CaseParties {
  respondentName: string;
  respondentCity: string;
  children: ChildInfo[];
}

export interface AppState {
  userRole: UserRole;
  caseIssues: string[];
  caseParties: CaseParties;
  deadlines: DeadlineItem[];
  messages: Message[];
  hasOnboarded: boolean;
}

interface AppContextType extends AppState {
  setUserRole: (role: UserRole) => void;
  setCaseIssues: (issues: string[]) => void;
  setCaseParties: (parties: CaseParties) => void;
  addDeadline: (deadline: Omit<DeadlineItem, "id" | "completed">) => void;
  toggleDeadline: (id: string) => void;
  removeDeadline: (id: string) => void;
  addMessage: (msg: Omit<Message, "id" | "timestamp">) => void;
  clearMessages: () => void;
  completeOnboarding: () => void;
  resetCase: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "@ontario_family_law_state";

const INITIAL_PARTIES: CaseParties = {
  respondentName: "",
  respondentCity: "",
  children: [],
};

const INITIAL_STATE: AppState = {
  userRole: null,
  caseIssues: [],
  caseParties: INITIAL_PARTIES,
  deadlines: [],
  messages: [],
  hasOnboarded: false,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<AppState>;
          setState((prev) => ({
            ...prev,
            ...parsed,
            caseParties: { ...INITIAL_PARTIES, ...(parsed.caseParties ?? {}) },
          }));
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((nextState: AppState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, []);

  const setUserRole = useCallback(
    (role: UserRole) => {
      setState((prev) => {
        const next = { ...prev, userRole: role };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const setCaseIssues = useCallback(
    (issues: string[]) => {
      setState((prev) => {
        const next = { ...prev, caseIssues: issues };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const setCaseParties = useCallback(
    (parties: CaseParties) => {
      setState((prev) => {
        const next = { ...prev, caseParties: parties };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const addDeadline = useCallback(
    (deadline: Omit<DeadlineItem, "id" | "completed">) => {
      setState((prev) => {
        const next = {
          ...prev,
          deadlines: [
            ...prev.deadlines,
            {
              ...deadline,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              completed: false,
            },
          ],
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const toggleDeadline = useCallback(
    (id: string) => {
      setState((prev) => {
        const next = {
          ...prev,
          deadlines: prev.deadlines.map((d) =>
            d.id === id ? { ...d, completed: !d.completed } : d
          ),
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeDeadline = useCallback(
    (id: string) => {
      setState((prev) => {
        const next = {
          ...prev,
          deadlines: prev.deadlines.filter((d) => d.id !== id),
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const addMessage = useCallback(
    (msg: Omit<Message, "id" | "timestamp">) => {
      setState((prev) => {
        const next = {
          ...prev,
          messages: [
            ...prev.messages,
            {
              ...msg,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              timestamp: Date.now(),
            },
          ],
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearMessages = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, messages: [] };
      persist(next);
      return next;
    });
  }, [persist]);

  const completeOnboarding = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, hasOnboarded: true };
      persist(next);
      return next;
    });
  }, [persist]);

  const resetCase = useCallback(() => {
    const fresh = { ...INITIAL_STATE };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setState(fresh);
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setUserRole,
        setCaseIssues,
        setCaseParties,
        addDeadline,
        toggleDeadline,
        removeDeadline,
        addMessage,
        clearMessages,
        completeOnboarding,
        resetCase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
