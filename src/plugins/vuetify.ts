import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify, type ThemeDefinition } from 'vuetify';

const light: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#1976D2',
    secondary: '#424242',
  },
};

const dark: ThemeDefinition = {
  dark: true,
  colors: {
    primary: '#90CAF9',
    secondary: '#EEEEEE',
  },
};

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: { light, dark },
  },
  defaults: {
    global: {
      density: 'compact',
      rounded: 'xl',
    },
  },
});
