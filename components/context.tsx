// context/UIContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type UIContextType = {
    isActive: boolean;
    setIsActive: (value: boolean) => void;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
    const [isActive, setIsActive] = useState(false);

    return (
        <UIContext.Provider value={{ isActive, setIsActive }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error("useUI must be used within UIProvider");
    }
    return context;
}
