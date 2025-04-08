import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Tabs, TabsList, TabsTrigger, TabsContent, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from 'src/components/ui/shadcn';

interface Translation {
  [key: string]: string;
}

interface Language {
  code: string;
  name: string;
}

const I18nManager: React.FC = () => {
  const [language, setLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState<{ [key: string]: Translation }>({});

  const languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
    { code: 'es', name: 'Español' },
  ];

  const loadTranslations = useCallback(async (lang: string) => {
    try {
      // Replace with actual path to your translation files
      const response = await fetch(`src/public/locales/${lang}.json`);
      const data = await response.json();
      setTranslations(prev => ({ ...prev, [lang]: data }));
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }, []);

  useEffect(() => {
    loadTranslations(language);
  }, [language, loadTranslations]);

  const t = (key: string, placeholders: { [key: string]: string } = {}): string => {
    const translation = translations[language]?.[key] || key;
    let translatedText = translation;

    for (const placeholderKey in placeholders) {
      if (placeholders.hasOwnProperty(placeholderKey)) {
        const placeholderValue = placeholders[placeholderKey];
        translatedText = translatedText.replace(`{{${placeholderKey}}}`, placeholderValue);
      }
    }

    return translatedText;
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (!translations[newLanguage]) {
      loadTranslations(newLanguage);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 flex justify-center">
      <Card className="w-full max-w-2xl bg-card">
        <CardHeader className="bg-card">
          <CardTitle className="text-2xl font-bold bg-card">{t('i18nManager')}</CardTitle>
          <CardDescription className="bg-card">{t('i18nDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="bg-card">
          <div className="mb-4">
            <Label htmlFor="language">{t('selectLanguage')}</Label>
            <Select onValueChange={handleLanguageChange} defaultValue={language}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label>{t('greeting')}</Label>
            <p>{t('helloWorld')}</p>
          </div>

          <div className="mb-4">
            <Label>{t('placeholderExample')}</Label>
            <p>{t('welcomeMessage', { name: 'Miku' })}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default I18nManager;