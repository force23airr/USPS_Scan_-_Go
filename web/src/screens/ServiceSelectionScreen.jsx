import { useState, useEffect } from 'react';
import { getShippingRates } from '../services/api';
import { SERVICE_INFO } from '../utils/constants';
import './ServiceSelectionScreen.css';

export default function ServiceSelectionScreen({ onNavigate, data }) {
  const { fromAddress, toAddress, packageDetails } = data;

  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const result = await getShippingRates({
        originZIPCode: fromAddress.ZIPCode,
        destinationZIPCode: toAddress.ZIPCode,
        weight: packageDetails.weight,
        dimensions: packageDetails.dimensions,
      });

      if (result.success && result.rates) {
        setRates(result.rates);
        if (result.rates.length > 0) {
          setSelectedService(result.rates[0]);
        }
      }
    } catch (error) {
      window.alert('Could not fetch shipping rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!selectedService) {
      window.alert('Please select a shipping service');
      return;
    }

    onNavigate('payment', {
      ...data,
      selectedService: selectedService.mailClass,
      price: selectedService.totalPrice,
      deliveryDays: selectedService.deliveryDays,
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner--dark" />
        <p className="loading-text">Fetching shipping rates...</p>
      </div>
    );
  }

  return (
    <div className="services screen">
      <div className="screen-scroll">
        <div className="card">
          <h3 className="services__summary-title">Shipment Summary</h3>
          <div className="services__summary-row">
            <span className="services__summary-label">From:</span>
            <span className="services__summary-value">
              {fromAddress.city}, {fromAddress.state} {fromAddress.ZIPCode}
            </span>
          </div>
          <div className="services__summary-row">
            <span className="services__summary-label">To:</span>
            <span className="services__summary-value">
              {toAddress.city}, {toAddress.state} {toAddress.ZIPCode}
            </span>
          </div>
          <div className="services__summary-row">
            <span className="services__summary-label">Weight:</span>
            <span className="services__summary-value">
              {(packageDetails.weight / 16).toFixed(2)} lb
            </span>
          </div>
        </div>

        <h3 className="services__section-title">Select Shipping Service</h3>

        {rates.map(rate => {
          const serviceInfo = SERVICE_INFO[rate.mailClass] || {
            name: rate.productName,
            description: `Delivery in ${rate.deliveryDays} days`,
          };
          const isSelected = selectedService?.productId === rate.productId;

          return (
            <button
              key={rate.productId}
              className={`services__card ${isSelected ? 'services__card--selected' : ''}`}
              onClick={() => setSelectedService(rate)}
            >
              <div className="services__card-header">
                <div className="services__card-info">
                  <span className={`services__card-name ${isSelected ? 'services__card-name--selected' : ''}`}>
                    {serviceInfo.name}
                  </span>
                  <span className="services__card-desc">{serviceInfo.description}</span>
                  <span className="services__card-days">{rate.deliveryDays} business days</span>
                </div>
                <span className={`services__card-price ${isSelected ? 'services__card-price--selected' : ''}`}>
                  ${rate.totalPrice.toFixed(2)}
                </span>
              </div>
              {isSelected && (
                <div className="services__card-badge">Selected</div>
              )}
            </button>
          );
        })}

        {rates.length === 0 && (
          <div className="services__empty">
            <p>No shipping rates available for this route.</p>
            <button className="btn-primary" onClick={fetchRates} style={{ maxWidth: 200 }}>
              Retry
            </button>
          </div>
        )}

        <div style={{ height: 100 }} />
      </div>

      <div className="footer">
        {selectedService && (
          <div className="services__total-row">
            <span className="services__total-label">Total:</span>
            <span className="services__total-price">${selectedService.totalPrice.toFixed(2)}</span>
          </div>
        )}
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={!selectedService}
          style={{ marginTop: 0 }}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
