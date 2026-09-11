/**
 * Identidade visual do IronPulse: azul profundo + amarelo energia.
 * Minimalista, moderno, com pegada fitness (tipografia forte e caixa alta).
 */
export const colors = {
  bg: '#0B1622',
  bgElevated: '#101F2E',
  surface: '#132435',
  surfaceAlt: '#18304A',
  border: '#1E3A55',

  blue: '#1B6BFF',
  blueSoft: '#3F8CFF',
  blueDeep: '#0E4BC4',

  yellow: '#FFD233',
  yellowDeep: '#F2B705',

  text: '#F2F6FA',
  textMuted: '#8FA6BD',
  textFaint: '#5E7691',

  success: '#2FD07C',
  danger: '#FF5C5C',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const font = {
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  section: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  body: {
    fontSize: 15,
    color: colors.text,
  },
  muted: {
    fontSize: 13,
    color: colors.textMuted,
  },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};

export default { colors, spacing, radius, font, shadow };
