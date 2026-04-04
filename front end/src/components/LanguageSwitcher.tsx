import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage || i18n.language || 'en';
  const isArabic = current === 'ar';

  const toggleLanguage = () => {
    const next = isArabic ? 'en' : 'ar';
    i18n.changeLanguage(next);
  };

  return (
    <Button
      onClick={toggleLanguage}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1"
      size="sm"
    >
      <Globe className="w-3 h-3" />
      {isArabic ? 'EN' : 'AR'}
    </Button>
  );
};
