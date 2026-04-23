const SELECTED_KEY = "selected_customer_id";

export function getSelectedCustomerId(): string | null {
  try {
    return localStorage.getItem(SELECTED_KEY);
  } catch {
    return null;
  }
}

export function setSelectedCustomerId(id: string) {
  try {
    localStorage.setItem(SELECTED_KEY, id);
  } catch {}
}

export function clearSelectedCustomerId() {
  try {
    localStorage.removeItem(SELECTED_KEY);
  } catch {}
}
