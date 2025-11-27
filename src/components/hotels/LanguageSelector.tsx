import { Language } from '../../types/hotel';

interface LanguageSelectorProps {
    selectedLanguage: string;
    onLanguageChange: (lang: string) => void;
    languages: Language[];
    className?: string;
}

export default function LanguageSelector({
    selectedLanguage,
    onLanguageChange,
    languages,
    className = ''
}: LanguageSelectorProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Language:
            </label>
            <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
                {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                        {lang.nativeName}
                    </option>
                ))}
            </select>

            {/* Translation status indicator */}
            <div className="flex gap-1">
                {languages.map(lang => (
                    <div
                        key={lang.code}
                        className={`w-2 h-2 rounded-full ${lang.code === selectedLanguage
                                ? 'bg-blue-500'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                        title={lang.nativeName}
                    />
                ))}
            </div>
        </div>
    );
}
