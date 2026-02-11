import { useState } from 'react';
import './ScanBarcodeScreen.css';

export default function ScanBarcodeScreen({ onNavigate }) {
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleLookup = () => {
    if (!trackingNumber.trim()) {
      window.alert('Please enter a tracking number');
      return;
    }
    window.alert(`Tracking for ${trackingNumber} — Package tracking coming soon!`);
  };

  return (
    <div className="scan screen-scroll">
      <div className="scan__section card">
        <h3 className="card-title">Enter Tracking Number</h3>
        <p className="scan__description">
          Camera scanning coming soon. For now, manually enter your tracking or barcode number.
        </p>
        <input
          className="input"
          type="text"
          value={trackingNumber}
          onChange={e => setTrackingNumber(e.target.value)}
          placeholder="e.g. 9400111899223100001234"
        />
        <button className="btn-primary" onClick={handleLookup}>
          Look Up Package
        </button>
      </div>

      <div className="scan__divider">
        <hr />
        <span>OR</span>
        <hr />
      </div>

      <button
        className="btn-primary scan__new-btn"
        onClick={() => onNavigate('address')}
      >
        Ship a New Package
      </button>
    </div>
  );
}
