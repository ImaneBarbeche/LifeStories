import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './en/translation.json';
import translationFr from './fr/translation.json';


i18next.use(initReactI18next).init({
    lng: 'en',
    debug: true,
    resources: {
        en: {
            translation: translationEn,
        },
        fr: {
            translation: translationFr,
        },
    },
});

export default i18next;