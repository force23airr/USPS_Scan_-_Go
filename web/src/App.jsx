import { useState } from 'react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import HomeScreen from './screens/HomeScreen';
import ScanBarcodeScreen from './screens/ScanBarcodeScreen';
import AddressScreen from './screens/AddressScreen';
import PackageDetailsScreen from './screens/PackageDetailsScreen';
import ServiceSelectionScreen from './screens/ServiceSelectionScreen';
import PaymentScreen from './screens/PaymentScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';

const SCREEN_TITLES = {
  home: 'USPS Scan & Go',
  scanBarcode: 'Scan Barcode',
  address: 'Addresses',
  packageDetails: 'Package Details',
  serviceSelection: 'Select Service',
  payment: 'Payment',
  confirmation: 'Confirmation',
};

const WIZARD_STEPS = ['address', 'packageDetails', 'serviceSelection', 'payment', 'confirmation'];

export default function App() {
  const [screen, setScreen] = useState('home');
  const [navData, setNavData] = useState({});
  const [history, setHistory] = useState(['home']);

  const navigate = (newScreen, data = {}) => {
    if (newScreen === 'home') {
      setNavData({});
      setHistory(['home']);
    } else {
      setNavData(prev => ({ ...prev, ...data }));
      setHistory(prev => [...prev, newScreen]);
    }
    setScreen(newScreen);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setScreen(newHistory[newHistory.length - 1]);
    }
  };

  const wizardIndex = WIZARD_STEPS.indexOf(screen);

  return (
    <div className="app">
      <Header
        title={SCREEN_TITLES[screen] || 'USPS Scan & Go'}
        onBack={screen !== 'home' && screen !== 'confirmation' ? goBack : null}
      />
      {wizardIndex >= 0 && <ProgressBar currentIndex={wizardIndex} />}
      <div className="app-content">
        {screen === 'home' && <HomeScreen onNavigate={navigate} />}
        {screen === 'scanBarcode' && <ScanBarcodeScreen onNavigate={navigate} />}
        {screen === 'address' && <AddressScreen onNavigate={navigate} data={navData} />}
        {screen === 'packageDetails' && <PackageDetailsScreen onNavigate={navigate} data={navData} />}
        {screen === 'serviceSelection' && <ServiceSelectionScreen onNavigate={navigate} data={navData} />}
        {screen === 'payment' && <PaymentScreen onNavigate={navigate} data={navData} />}
        {screen === 'confirmation' && <ConfirmationScreen onNavigate={navigate} data={navData} />}
      </div>
    </div>
  );
}
