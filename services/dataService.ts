import { TARecord, MATATAGItem, TATarget, TAAgreement, Signatory, Account } from "../types";

const BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRGRxkahPOc_CiaRX6ZjXNPsREBUxUsJnhDwtTo8Z55gys2UikNMq4KPCmccnjUPyP_yj0d1AQzepFI/pub?output=csv";
const ACCOUNTS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRGRxkahPOc_CiaRX6ZjXNPsREBUxUsJnhDwtTo8Z55gys2UikNMq4KPCmccnjUPyP_yj0d1AQzepFI/pub?gid=2047814881&single=true&output=csv";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

const getRows = async (url: string): Promise<string[]> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  const csvText = await response.text();
  const rows: string[] = [];
  let currentRow = "";
  let inQuotes = false;
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') inQuotes = !inQuotes;
    if (char === '\n' && !inQuotes) {
      rows.push(currentRow);
      currentRow = "";
    } else {
      currentRow += char;
    }
  }
  if (currentRow) rows.push(currentRow);
  return rows;
};

/**
 * Fetches user accounts from the published registry.
 * Fixes Error in file components/Login.tsx on line 4.
 */
export const fetchAccounts = async (): Promise<Account[]> => {
  try {
    const rows = await getRows(ACCOUNTS_URL);
    if (rows.length < 2) return [];

    const headers = parseCSVLine(rows[0]).map(h => h.trim().toUpperCase().replace(/[\s_]/g, ''));
    const findIdx = (name: string) => {
      const search = name.trim().toUpperCase().replace(/[\s_]/g, '');
      return headers.indexOf(search);
    };

    const accounts: Account[] = [];
    for (let i = 1; i < rows.length; i++) {
      const v = parseCSVLine(rows[i]);
      if (v.length < 2) continue;
      
      accounts.push({
        username: v[findIdx("USERNAME")] || "",
        passwordHash: v[findIdx("PASSWORDHASH")] || v[findIdx("PASSWORD")] || "",
        sdo: v[findIdx("SDO")] || "",
        schoolName: v[findIdx("SCHOOLNAME")] || v[findIdx("SCHOOL")] || "",
        email: v[findIdx("EMAIL")] || ""
      });
    }
    return accounts;
  } catch (error) {
    console.error("Fetch Accounts Error:", error);
    return [];
  }
};

export const fetchFTADData = async (): Promise<TARecord[]> => {
  try {
    const rows = await getRows(BASE_URL);
    
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const cells = parseCSVLine(rows[i]).map(c => c.toUpperCase());
      if (cells.includes("OFFICE") && cells.includes("DISTRICT") && cells.includes("DIVISION/SCHOOL")) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) return [];

    const rawHeaders = parseCSVLine(rows[headerRowIndex]);
    // Create a normalized list of headers for fuzzy matching (no spaces, no underscores, uppercase)
    const normalizedHeaders = rawHeaders.map(h => h.trim().toUpperCase().replace(/[\s_]/g, ''));
    
    const findIdx = (name: string) => {
      const search = name.trim().toUpperCase().replace(/[\s_]/g, '');
      return normalizedHeaders.indexOf(search);
    };

    const records: TARecord[] = [];
    
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const v = parseCSVLine(rows[i]);
      if (v.length < 5) continue;

      const rawOffice = v[findIdx("OFFICE")] || "";
      const isGarbage = rawOffice.startsWith('●') || rawOffice.length > 60 || rawOffice.trim() === "";
      if (isGarbage) continue;

      const extractMATATAG = (prefix: string): MATATAGItem[] => {
        const items: MATATAGItem[] = [];
        for (let j = 1; j <= 5; j++) {
          const sIdx = findIdx(`${prefix}STATUS${j}`);
          const iIdx = findIdx(`${prefix}ISSUE${j}`);
          if (sIdx !== -1 && v[sIdx]) items.push({ status: v[sIdx], issue: v[iIdx] || "" });
        }
        return items;
      };

      const extractTargets = (): TATarget[] => {
        const targets: TATarget[] = [];
        for (let j = 1; j <= 5; j++) {
          const objIdx = findIdx(`OBJECTIVE${j}`);
          const obj = objIdx !== -1 ? v[objIdx] : "";
          if (!obj) continue;
          
          targets.push({
            objective: obj,
            plannedAction: v[findIdx(`PLANNED ACTION${j}`)] || "",
            dueDate: v[findIdx(`DUE DATE${j}`)] || "",
            status: v[findIdx(`STATUS${j}`)] || "",
            helpNeeded: v[findIdx(`HELP NEEDED${j}`)] || ""
          });
        }
        return targets;
      };

      const extractAgreements = (): TAAgreement[] => {
        const agreements: TAAgreement[] = [];
        for (let j = 1; j <= 5; j++) {
          const agreeIdx = findIdx(`AGREE${j}`);
          const agree = agreeIdx !== -1 ? v[agreeIdx] : "";
          if (!agree) continue;
          
          agreements.push({
            agree: agree,
            specificOffice: v[findIdx(`SPECIFIC OFFICE${j}`)] || "",
            dueDate: v[findIdx(`DUE DATE_A${j}`)] || v[findIdx(`DUE DATE ${j}`)] || "",
            status: v[findIdx(`STATUS_A${j}`)] || v[findIdx(`STATUS ${j}`)] || ""
          });
        }
        return agreements;
      };

      const extractSignatories = (prefix: string): Signatory[] => {
        const sigs: Signatory[] = [];
        for (let j = 1; j <= 5; j++) {
          const nameIdx = findIdx(`NAME${prefix}${j}`);
          const name = nameIdx !== -1 ? v[nameIdx] : "";
          if (!name) continue;
          
          sigs.push({
            name: name,
            position: v[findIdx(`POSITION${prefix}${j}`)] || ""
          });
        }
        return sigs;
      };

      records.push({
        id: `row-${i}`,
        office: rawOffice,
        district: v[findIdx("DISTRICT")] || "",
        divisionSchool: v[findIdx("DIVISION/SCHOOL")] || "",
        period: v[findIdx("PERIOD")] || "",
        taReceiver: v[findIdx("TA RECEIVER")] || v[findIdx("TA RECIEVER")] || "",
        taProvider: v[findIdx("TA PROVIDER")] || v[findIdx("TRA PROVIDER")] || "",
        access: extractMATATAG("ACCESS"),
        equity: extractMATATAG("EQUITY"),
        quality: extractMATATAG("QUALITY"),
        resilience: extractMATATAG("RESILIENCE"),
        enabling: extractMATATAG("ENABLING"),
        reasons: [v[findIdx("REASON1")], v[findIdx("REASON2")], v[findIdx("REASON3")]].filter(Boolean),
        targets: extractTargets(), 
        agreements: extractAgreements(),
        receiverSignatories: extractSignatories("R"),
        providerSignatories: extractSignatories("P"),
        misc: { 
          taName4: v[findIdx("TA NAME4")] || "", 
          taPosition4: v[findIdx("TA POSITION4")] || "", 
          taSignature4: "", 
          deptName5: v[findIdx("DEPT NAME5")] || "", 
          deptPosition5: v[findIdx("DEPT POSITION5")] || "", 
          deptSignature5: "",
          taName5: v[findIdx("TA NAME5")] || "", 
          taPosition5: v[findIdx("TA POSITION5")] || "", 
          taSignature5: "",
          deptTeamDate: v[findIdx("DEPT TEAM DATE")] || "", 
          taTeamDate: v[findIdx("TA TEAM DATE")] || "" 
        },
        raw: v
      });
    }
    return records;
  } catch (error) {
    console.error("Fetch FTAD Data Error:", error);
    return [];
  }
};