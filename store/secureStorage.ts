// securePersistStorage.ts
import * as SecureStore from "expo-secure-store";

// Les seuls caractères autorisés par SecureStore sont [A-Za-z0-9._-]
const sanitizeKey = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, "_");

export const securePersistStorage = {
    getItem: async (key: string): Promise<string | null> => {
        const k = sanitizeKey(key);
        return SecureStore.getItemAsync(k);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        const k = sanitizeKey(key);
        return SecureStore.setItemAsync(k, value);
    },
    removeItem: async (key: string): Promise<void> => {
        const k = sanitizeKey(key);
        return SecureStore.deleteItemAsync(k);
    },
};
