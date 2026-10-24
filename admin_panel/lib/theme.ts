export const toggleTheme = () => {
  const dark = document.documentElement.classList.toggle('dark');
  try {
    localStorage.setItem('fi-admin-theme', dark ? 'dark' : 'light');
  } catch {
    /* storage unavailable */
  }
  return dark;
};
