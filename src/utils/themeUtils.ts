export const getThemeColors = (theme: any) => {
  // Si no hay tema, usar valores por defecto
  if (!theme) {
    return {
      background: '#ffffff',
      text: '#1f2937',
      primary: '#2563eb',
    };
  }

  // Usar los colores personalizados directamente
  return {
    background: theme.secondary_color || '#ffffff',
    text: theme.tertiary_color || '#1f2937',
    primary: theme.primary_color || '#2563eb',
  };
};

export const applyThemeToDocument = (theme: any) => {
  if (!theme) return;

  const colors = getThemeColors(theme);
  const root = document.documentElement;

  // Aplicar variables CSS globales
  root.style.setProperty('--theme-bg', colors.background);
  root.style.setProperty('--theme-text', colors.text);
  root.style.setProperty('--theme-primary', colors.primary);
  
  // Aplicar al body también
  document.body.style.backgroundColor = colors.background;
  document.body.style.color = colors.text;
};