
/**
 * VALIDATION SERVICE (CLOUD-BASED)
 * Menghubungkan aplikasi ke Database Validasi Spreadsheet.
 */

// TEMPELKAN LINK GAS WEB APP VALIDASI ANDA DI SINI
const VALIDATION_GAS_URL = "https://script.google.com/macros/s/AKfycbz33Q7PhQa-h-JcWh2RLzeuJRlHNmuKS-LWwyZ_kNSY0SOyrIRLr0yuBbNvjFJblBxmUA/exec";

export const getUserLocation = (): Promise<string> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("Not Supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => {
        resolve("Permission Denied");
      },
      { timeout: 5000 }
    );
  });
};

/**
 * Memeriksa status penggunaan saat ini tanpa menambah hitungan.
 */
export const getUsageStatusCloud = async (deviceId: string, feature: string, limit: number, gasUrl: string): Promise<boolean> => {
  try {
    if (!VALIDATION_GAS_URL.startsWith('https://script.google.com')) return true;

    const response = await fetch(VALIDATION_GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "checkUsage",
        deviceId,
        feature,
        limit,
        gasUrl: gasUrl || "NONE"
      })
    });

    if (!response.ok) return true;
    const result = await response.json();
    return result.status !== 'LIMIT_REACHED';
  } catch (e) {
    return true;
  }
};

/**
 * Memvalidasi dan mencatat penggunaan (Increment) dengan identifikasi ganda.
 */
export const validateUsageCloud = async (deviceId: string, feature: string, limit: number, gasUrl: string, localCount: number): Promise<boolean> => {
  try {
    const location = await getUserLocation();
    
    if (!VALIDATION_GAS_URL.startsWith('https://script.google.com')) {
       console.warn("GAS Validasi URL belum diatur!");
       return true; 
    }

    const response = await fetch(VALIDATION_GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "checkAndUpdateUsage",
        deviceId,
        feature,
        limit,
        gasUrl: gasUrl || "NONE",
        localCount,
        location,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) return true;

    const result = await response.json();
    
    if (result.status === 'LIMIT_REACHED') {
      return false;
    }

    return true; 
  } catch (e) {
    console.warn("Cloud validation error:", e);
    return true;
  }
};
