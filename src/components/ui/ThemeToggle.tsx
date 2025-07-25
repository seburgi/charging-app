import { memo } from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = memo(() => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  const handleToggle = () => {
    // Haptic feedback on theme toggle
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    toggleTheme();
  };
  
  return (
    <button
        onClick={handleToggle}
        className="
          p-3 md:p-2 rounded-lg transition-colors duration-200
          hover:bg-gray-100 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500
          text-gray-700 dark:text-gray-200
          min-h-[44px] min-w-[44px] touch-manipulation
          flex items-center justify-center
        "
        aria-label="Toggle theme"
      >
      {isDarkMode ? (
        // Sun icon
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;