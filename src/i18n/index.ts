import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import en from './en';

i18n.translations = {
    en,
};

i18n.defaultLocale = 'en';
i18n.locale = Localization.locale;
i18n.fallbacks = true;
