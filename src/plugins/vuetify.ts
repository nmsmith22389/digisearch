import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';

export default createVuetify({
  defaults: {
    global: {
      density: 'compact',
      rounded: 'xl',
    },
  },
});
