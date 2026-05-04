import { createContext, ReactNode, useContext, useState } from 'react'
import {ActiveTabContextValue, Tab} from "../features/git/model/gitTypes"

export const ActiveTabContext = createContext<ActiveTabContextValue | null>(null);

export function ActiveTabProvider({ children }: { children: ReactNode }) {
    const [activeTab, setActiveTab] = useState<Tab>("/");

  return (
    <ActiveTabContext.Provider value={{activeTab, setActiveTab}}>
        {children}
    </ActiveTabContext.Provider>
  )
}

export function useActiveTab() {
    const context = useContext(ActiveTabContext);

    if (!context) {
        throw new Error("useActiveTab must be used inside ActiveTabProvider");
    }

    return context;
}
