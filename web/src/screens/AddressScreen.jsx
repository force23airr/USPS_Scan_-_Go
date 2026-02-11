import { useState } from 'react';
import { validateAddress } from '../services/api';
import './AddressScreen.css';

export default function AddressScreen({ onNavigate, data }) {
  const [activeTab, setActiveTab] = useState('from');
  const [loading, setLoading] = useState(false);

  const [fromAddress, setFromAddress] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    secondaryAddress: '',
    city: '',
    state: '',
    ZIPCode: '',
    phone: '',
  });

  const [toAddress, setToAddress] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    secondaryAddress: '',
    city: '',
    state: '',
    ZIPCode: '',
    phone: '',
  });

  const currentAddress = activeTab === 'from' ? fromAddress : toAddress;
  const setCurrentAddress = activeTab === 'from' ? setFromAddress : setToAddress;

  const updateField = (field, value) => {
    setCurrentAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateCurrentAddress = async () => {
    const addr = currentAddress;
    if (!addr.streetAddress || !addr.city || !addr.state || !addr.ZIPCode) {
      window.alert('Please fill in all required address fields');
      return false;
    }

    setLoading(true);
    try {
      const result = await validateAddress({
        streetAddress: addr.streetAddress,
        secondaryAddress: addr.secondaryAddress,
        city: addr.city,
        state: addr.state,
        ZIPCode: addr.ZIPCode,
      });

      if (result.success && result.address) {
        setCurrentAddress(prev => ({
          ...prev,
          streetAddress: result.address.streetAddress,
          city: result.address.city,
          state: result.address.state,
          ZIPCode: result.address.ZIPCode,
        }));
        return true;
      }
    } catch (error) {
      window.alert('Could not validate address. Please check and try again.');
      return false;
    } finally {
      setLoading(false);
    }
    return true;
  };

  const handleNext = async () => {
    if (activeTab === 'from') {
      const valid = await validateCurrentAddress();
      if (valid) {
        setActiveTab('to');
      }
    } else {
      const valid = await validateCurrentAddress();
      if (valid) {
        onNavigate('packageDetails', { fromAddress, toAddress });
      }
    }
  };

  return (
    <div className="address screen">
      <div className="address__tabs">
        <button
          className={`address__tab ${activeTab === 'from' ? 'address__tab--active' : ''}`}
          onClick={() => setActiveTab('from')}
        >
          From (Sender)
        </button>
        <button
          className={`address__tab ${activeTab === 'to' ? 'address__tab--active' : ''}`}
          onClick={() => setActiveTab('to')}
        >
          To (Recipient)
        </button>
      </div>

      <div className="screen-scroll">
        <div className="form-row">
          <div className="form-half">
            <label className="label">First Name *</label>
            <input
              className="input"
              value={currentAddress.firstName}
              onChange={e => updateField('firstName', e.target.value)}
              placeholder="John"
            />
          </div>
          <div className="form-half">
            <label className="label">Last Name *</label>
            <input
              className="input"
              value={currentAddress.lastName}
              onChange={e => updateField('lastName', e.target.value)}
              placeholder="Doe"
            />
          </div>
        </div>

        <label className="label">Street Address *</label>
        <input
          className="input"
          value={currentAddress.streetAddress}
          onChange={e => updateField('streetAddress', e.target.value)}
          placeholder="123 Main St"
        />

        <label className="label">Apt, Suite, Unit (Optional)</label>
        <input
          className="input"
          value={currentAddress.secondaryAddress}
          onChange={e => updateField('secondaryAddress', e.target.value)}
          placeholder="Apt 4B"
        />

        <label className="label">City *</label>
        <input
          className="input"
          value={currentAddress.city}
          onChange={e => updateField('city', e.target.value)}
          placeholder="Miami"
        />

        <div className="form-row">
          <div className="form-half">
            <label className="label">State *</label>
            <input
              className="input"
              value={currentAddress.state}
              onChange={e => updateField('state', e.target.value.toUpperCase())}
              placeholder="FL"
              maxLength={2}
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <div className="form-half">
            <label className="label">ZIP Code *</label>
            <input
              className="input"
              value={currentAddress.ZIPCode}
              onChange={e => updateField('ZIPCode', e.target.value)}
              placeholder="33189"
              inputMode="numeric"
              maxLength={10}
            />
          </div>
        </div>

        <label className="label">Phone (Optional)</label>
        <input
          className="input"
          value={currentAddress.phone}
          onChange={e => updateField('phone', e.target.value)}
          placeholder="305-555-1234"
          type="tel"
        />
      </div>

      <div className="footer">
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={loading}
          style={{ marginTop: 0 }}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            activeTab === 'from' ? 'Next: Recipient Address' : 'Next: Package Details'
          )}
        </button>
      </div>
    </div>
  );
}
