/**
 * Header.jsx
 *
 * Shared top bar used across screens.
 *
 * No onBack → shows EyEagle logo (HomeScreen)
 * onBack + title → shows back button + screen title (ReviewScreen)
 */

import './Header.css';

export default function Header({ title, onBack, backLabel = '‹ Back' }) {
  return (
    <header className="app-header">
      {onBack ? (
        <button className="header-back" onClick={onBack} aria-label="Back">
          {backLabel}
        </button>
      ) : (
        <span className="header-logo">EyEagle</span>
      )}
      {title && <h1 className="header-title">{title}</h1>}
    </header>
  );
}
