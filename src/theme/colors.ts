export type ThemeType = {
  text: string;
  textSecondary: string;
  background: string;
  inputBg: string;
  border: string;
  primary: string;
  card: string;
  surface: string;
  placeholder: string;
  socialIconBg: string;
};

export const lightTheme: ThemeType = {
  text: '#2F2F2F',
  textSecondary: '#8A8A8A',
  background: '#FFFFFF',
  inputBg: '#FFFFFF',
  border: '#E0E1E6',
  primary: '#0094E8',
  card: '#FFFFFF',
  surface: '#F8F8F9',
  placeholder: '#9CA3AF',
  socialIconBg: '#F3F4F6',
};

export const darkTheme: ThemeType = {
  text: '#F2F3F5',
  textSecondary: '#B0B4BA',
  background: '#000000',
  inputBg: '#1E1F22',
  border: '#2E3135',
  primary: '#0094E8',
  card: '#0F1112',
  surface: '#151617',
  placeholder: '#9CA3AF',
  socialIconBg: '#111214',
};

export default lightTheme;
