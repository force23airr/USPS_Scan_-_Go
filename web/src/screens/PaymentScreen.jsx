import { useState } from 'react';
import { createTransaction, processPayment, createLabel } from '../services/api';
import { SERVICE_INFO } from '../utils/constants';
import './PaymentScreen.css';

export default function PaymentScreen({ onNavigate, data }) {
  const { fromAddress, toAddress, packageDetails, selectedService, price, deliveryDays } = data;

  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const serviceName = SERVICE_INFO[selectedService]?.name || selectedService;

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      window.alert('Please enter a valid card number');
      return;
    }
    if (!expiry || expiry.length < 5) {
      window.alert('Please enter a valid expiry date');
      return;
    }
    if (!cvc || cvc.length < 3) {
      window.alert('Please enter a valid CVC');
      return;
    }
    if (!cardName) {
      window.alert('Please enter the name on card');
      return;
    }

    setLoading(true);
    try {
      const transactionResult = await createTransaction({
        fromAddress,
        toAddress,
        weight: packageDetails.weight,
        dimensions: packageDetails.dimensions,
        contents: packageDetails.contents,
        declaredValue: packageDetails.declaredValue,
        hazmatScreening: packageDetails.hazmatScreening,
        selectedService,
        price,
      });

      if (!transactionResult.success) {
        throw new Error('Failed to create transaction');
      }

      const transaction = transactionResult.transaction;

      const paymentResult = await processPayment(transaction.id, {
        paymentMethod: 'card',
      });

      if (!paymentResult.success) {
        throw new Error('Payment failed');
      }

      // Create shipping label
      const labelResult = await createLabel(transaction.id);

      if (!labelResult.success) {
        throw new Error('Failed to create shipping label');
      }

      onNavigate('confirmation', {
        ...data,
        transaction: labelResult.transaction,
        label: labelResult.label,
        serviceName,
      });
    } catch (error) {
      window.alert(error.message || 'Payment could not be processed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment screen-scroll">
      <div className="card">
        <h3 className="card-title">Order Summary</h3>
        <div className="payment__row">
          <span className="payment__label">Service</span>
          <span className="payment__value">{serviceName}</span>
        </div>
        <div className="payment__row">
          <span className="payment__label">Delivery</span>
          <span className="payment__value">{deliveryDays} business days</span>
        </div>
        <div className="payment__row">
          <span className="payment__label">Recipient</span>
          <span className="payment__value">{toAddress.firstName} {toAddress.lastName}</span>
        </div>
        <div className="divider" />
        <div className="payment__row">
          <span className="payment__total-label">Total</span>
          <span className="payment__total-price">${price.toFixed(2)}</span>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Payment Details</h3>

        <label className="label">Card Number</label>
        <input
          className="input"
          value={cardNumber}
          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          inputMode="numeric"
          maxLength={19}
        />

        <div className="form-row">
          <div className="form-half">
            <label className="label">Expiry</label>
            <input
              className="input"
              value={expiry}
              onChange={e => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              inputMode="numeric"
              maxLength={5}
            />
          </div>
          <div className="form-half">
            <label className="label">CVC</label>
            <input
              className="input"
              value={cvc}
              onChange={e => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
              placeholder="123"
              type="password"
              inputMode="numeric"
              maxLength={4}
            />
          </div>
        </div>

        <label className="label">Name on Card</label>
        <input
          className="input"
          value={cardName}
          onChange={e => setCardName(e.target.value)}
          placeholder="John Doe"
        />
      </div>

      <button
        className="btn-primary"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? <span className="spinner" /> : `Pay $${price.toFixed(2)}`}
      </button>

      <p className="payment__secure-text">Your payment is secure and encrypted</p>
      <div style={{ height: 20 }} />
    </div>
  );
}
