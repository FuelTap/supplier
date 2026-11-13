"use client";

import { createContext, useContext } from "react";

// Shape of GET /api/v1/auth/user, shared with the customer app's backend.
type Profile = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

type Account = {
  role: string[];
};

type Status = "pending" | "approved" | "rejected";

export type User = {
  id: string;
  profile: Profile;
  account: Account;
  documents: { bvn: string | null; nin: string | null };
  kyc: {
    overallKycStatus: "not submitted" | "unverified" | "in-progress" | "verified";
    verification: {
      idverification: Status;
      addressVerification: Status;
      livenessVerisfication: Status;
    };
  };
  wallet: { walletExists: boolean };
  bank: { bankExists: boolean };
};

const AuthContext = createContext<{ user: User | null } | undefined>(undefined);

// Makes the signed-in user (loaded on the server by the layout) available to
// client components such as the header.
export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  return (
    <AuthContext.Provider value={{ user: initialUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
