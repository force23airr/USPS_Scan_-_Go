import { SERVICE_INFO } from '../utils/constants';
import './ConfirmationScreen.css';

export default function ConfirmationScreen({ onNavigate, data }) {
  const { transaction, label, serviceName, selectedService, deliveryDays, price } = data;
  const displayServiceName = serviceName || SERVICE_INFO[selectedService]?.name || selectedService;

  const trackingNumber = label?.trackingNumber || transaction?.trackingNumber;
  const labelImage = label?.labelImage;
  const fromAddr = transaction?.fromAddress || data.fromAddress;
  const toAddr = transaction?.toAddress || data.toAddress;
  const totalPrice = transaction?.price ?? price;
  const weightLb = data.packageDetails ? (data.packageDetails.weight / 16).toFixed(2) : '';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!labelImage) return;
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${labelImage}`;
    link.download = `shipping-label-${trackingNumber || 'label'}.pdf`;
    link.click();
  };

  const handleDone = () => {
    onNavigate('home');
  };

  // Format tracking number with spaces for readability
  const formatTracking = (num) => {
    if (!num) return '';
    return num.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div className="confirm screen-scroll">
      <div className="confirm__hero">
        <div className="confirm__success-icon">&#10003;</div>
        <h2 className="confirm__title">Your Label is Ready!</h2>
        <p className="confirm__subtitle">
          Print it, tape it to your package, and drop it off — no waiting in line
        </p>
      </div>

      {/* Tracking Number */}
      {trackingNumber && (
        <div className="confirm__tracking card">
          <span className="confirm__tracking-label">Tracking Number</span>
          <span className="confirm__tracking-number">{formatTracking(trackingNumber)}</span>
        </div>
      )}

      {/* Shipping Label */}
      <div className="confirm__label-section" id="printable-label">
        {labelImage ? (
          <div className="confirm__label-pdf card">
            <img
              className="confirm__label-img"
              src={`data:image/png;base64,${labelImage}`}
              alt="Shipping Label"
            />
          </div>
        ) : (
          <div className="confirm__label card">
            <div className="confirm__label-header">
              <span className="confirm__label-usps">USPS</span>
              <span className="confirm__label-postage">POSTAGE PAID</span>
            </div>

            <div className="confirm__label-service-row">
              <span className="confirm__label-service">{displayServiceName}</span>
              <span className="confirm__label-price">${totalPrice?.toFixed(2)}</span>
            </div>

            <div className="divider" />

            <div className="confirm__label-addresses">
              <div className="confirm__label-from">
                <span className="confirm__label-addr-title">FROM:</span>
                <p>{fromAddr?.firstName} {fromAddr?.lastName}</p>
                <p>{fromAddr?.streetAddress}</p>
                {fromAddr?.secondaryAddress && <p>{fromAddr.secondaryAddress}</p>}
                <p>{fromAddr?.city}, {fromAddr?.state} {fromAddr?.ZIPCode}</p>
              </div>

              <div className="confirm__label-to">
                <span className="confirm__label-addr-title">SHIP TO:</span>
                <p className="confirm__label-to-name">{toAddr?.firstName} {toAddr?.lastName}</p>
                <p className="confirm__label-to-line">{toAddr?.streetAddress}</p>
                {toAddr?.secondaryAddress && <p className="confirm__label-to-line">{toAddr.secondaryAddress}</p>}
                <p className="confirm__label-to-line">{toAddr?.city}, {toAddr?.state} {toAddr?.ZIPCode}</p>
              </div>
            </div>

            <div className="divider" />

            <div className="confirm__label-footer">
              <span className="confirm__label-weight">Weight: {weightLb} lb</span>
              {trackingNumber && (
                <div className="confirm__label-barcode">
                  <div className="confirm__label-barcode-bars" />
                  <span className="confirm__label-barcode-text">{formatTracking(trackingNumber)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="confirm__actions">
        <button className="btn-primary" onClick={handlePrint}>
          Print Label
        </button>
        {labelImage && (
          <button className="btn-primary confirm__download-btn" onClick={handleDownload}>
            Download Label PDF
          </button>
        )}
      </div>

      {/* Shipment Details */}
      <div className="card">
        <h3 className="card-title">Shipment Details</h3>
        <div className="confirm__detail-row">
          <span className="confirm__detail-label">Service</span>
          <span className="confirm__detail-value">{displayServiceName}</span>
        </div>
        <div className="confirm__detail-row">
          <span className="confirm__detail-label">Est. Delivery</span>
          <span className="confirm__detail-value">{deliveryDays} business days</span>
        </div>
        <div className="confirm__detail-row">
          <span className="confirm__detail-label">Total Paid</span>
          <span className="confirm__detail-value confirm__detail-value--price">
            ${totalPrice?.toFixed(2)}
          </span>
        </div>
        {trackingNumber && (
          <div className="confirm__detail-row">
            <span className="confirm__detail-label">Tracking</span>
            <span className="confirm__detail-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>
              {formatTracking(trackingNumber)}
            </span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="confirm__instructions card">
        <h3 className="card-title">What's Next?</h3>
        <div className="confirm__instruction">
          <span className="confirm__instruction-num">1</span>
          <span>Print this shipping label</span>
        </div>
        <div className="confirm__instruction">
          <span className="confirm__instruction-num">2</span>
          <span>Tape it securely to your package</span>
        </div>
        <div className="confirm__instruction">
          <span className="confirm__instruction-num">3</span>
          <span>Drop it off at any USPS location or blue collection box</span>
        </div>
      </div>

      <button className="btn-secondary" onClick={handleDone}>
        Done — Ship Another Package
      </button>
      <div style={{ height: 20 }} />
    </div>
  );
}
