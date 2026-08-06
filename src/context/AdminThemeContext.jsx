import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext({
  theme: 'dark',
  isLight: false,
  toggleTheme: () => {}
});

export function AdminThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('gfg-admin-theme') || localStorage.getItem('admin_theme') || 'dark';
  });

  const isLight = theme === 'light';

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('gfg-admin-theme', nextTheme);
  };

  useEffect(() => {
    localStorage.setItem('gfg-admin-theme', theme);
  }, [theme]);

  return (
    <AdminThemeContext.Provider value={{ theme, isLight, toggleTheme }}>
      <div className={isLight ? 'admin-light-mode' : 'admin-dark-mode'}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

export default AdminThemeContext;
