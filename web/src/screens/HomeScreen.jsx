import './HomeScreen.css';

export default function HomeScreen({ onNavigate }) {
  return (
    <div className="home">
      <div className="home__hero">
        <h2 className="home__title">Ship From Home</h2>
        <p className="home__subtitle">
          Enter your shipping info, pay online, and print a label — no waiting in line at the post office
        </p>

        <button
          className="btn-primary home__cta"
          onClick={() => onNavigate('address')}
        >
          Ship New Package
        </button>

        <button
          className="home__scan-btn"
          onClick={() => onNavigate('scanBarcode')}
        >
          Scan Package Barcode
        </button>
      </div>

      <div className="home__steps card">
        <h3 className="card-title">How it works</h3>
        <div className="home__step">
          <span className="home__step-number">1</span>
          <span>Enter sender & recipient addresses</span>
        </div>
        <div className="home__step">
          <span className="home__step-number">2</span>
          <span>Enter package details</span>
        </div>
        <div className="home__step">
          <span className="home__step-number">3</span>
          <span>Select shipping speed & pay</span>
        </div>
        <div className="home__step">
          <span className="home__step-number">4</span>
          <span>Print your label, tape it on, and drop off</span>
        </div>
      </div>
    </div>
  );
}
