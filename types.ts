export interface MATATAGItem {
  status: string;
  issue: string;
}

export interface TATarget {
  objective: string;
  plannedAction: string;
  dueDate: string;
  status: string;
  helpNeeded: string;
}

export interface TAAgreement {
  agree: string;
  specificOffice: string;
  dueDate: string;
  status: string;
}

export interface Signatory {
  name: string;
  position: string;
}

export interface TARecord {
  id: string;
  office: string;
  district: string;
  divisionSchool: string;
  period: string;
  taReceiver: string;
  taProvider: string;
  
  access: MATATAGItem[];
  equity: MATATAGItem[];
  quality: MATATAGItem[];
  resilience: MATATAGItem[];
  enabling: MATATAGItem[];

  reasons: string[];
  targets: TATarget[];
  agreements: TAAgreement[];
  receiverSignatories: Signatory[];
  providerSignatories: Signatory[];

  misc: {
    taName4: string;
    taPosition4: string;
    taSignature4: string;
    deptName5: string;
    deptPosition5: string;
    deptSignature5: string;
    taName5: string;
    taPosition5: string;
    taSignature5: string;
    deptTeamDate: string;
    taTeamDate: string;
  };

  raw: string[];
}

export interface FTADStats {
  totalTA: number;
  completionRate: number;
  activeMonitoring: number;
  pendingRequests: number;
}

/**
 * Account interface for user registry and authentication.
 * Fixes Error in file services/authService.ts on line 2.
 */
export interface Account {
  username: string;
  passwordHash: string;
  sdo: string;
  schoolName: string;
  email: string;
}

/**
 * UserSession interface for tracking the currently logged-in user.
 * Fixes Error in file services/authService.ts on line 2 and Login.tsx on line 6.
 */
export interface UserSession {
  username: string;
  sdo: string;
  schoolName: string;
  email: string;
}