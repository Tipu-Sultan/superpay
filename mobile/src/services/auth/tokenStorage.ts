const KEY = "superpay.session";
export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      return localStorage.getItem(KEY);
    } catch (error) {
      console.error("Token get failed:", error);
      return null;
    }
  },
  async set(token: string): Promise<void> {
    try {
      localStorage.setItem(KEY, token);
    } catch (error) {
      console.error("Token save failed:", error);
      throw new Error("Unable to save your session.");
    }
  },
  async clear(): Promise<void> {
    try {
      localStorage.removeItem(KEY);
    } catch (error) {
      console.error("Token clear failed:", error);
    }
  },
};
