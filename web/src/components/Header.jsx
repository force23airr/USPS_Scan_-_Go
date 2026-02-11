import './Header.css';

export default function Header({ title, onBack }) {
  return (
    <header className="header">
      <div className="header__left">
        {onBack && (
          <button className="header__back" onClick={onBack}>
            &larr; Back
          </button>
        )}
      </div>
      <h1 className="header__title">{title}</h1>
      <div className="header__right" />
    </header>
  );
}
