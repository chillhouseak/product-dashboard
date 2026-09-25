export function saveAuthToken(token: string) {
  localStorage.setItem("token", token);
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("token");
}

export function removeAuthToken() {
  localStorage.removeItem("token");
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}