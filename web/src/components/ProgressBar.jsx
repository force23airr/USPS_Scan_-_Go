import './ProgressBar.css';

const STEP_LABELS = ['Address', 'Package', 'Service', 'Payment', 'Label'];

export default function ProgressBar({ currentIndex }) {
  return (
    <div className="progress-bar">
      {STEP_LABELS.map((label, i) => (
        <div
          key={label}
          className={`progress-step ${i < currentIndex ? 'progress-step--completed' : ''} ${i === currentIndex ? 'progress-step--active' : ''}`}
        >
          <div className="progress-circle">
            {i < currentIndex ? '\u2713' : i + 1}
          </div>
          <span className="progress-label">{label}</span>
          {i < STEP_LABELS.length - 1 && (
            <div className={`progress-line ${i < currentIndex ? 'progress-line--completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}
