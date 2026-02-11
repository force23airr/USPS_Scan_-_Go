import { useState } from 'react';
import { PACKAGE_CONTENTS, HAZMAT_QUESTIONS } from '../utils/constants';
import './PackageDetailsScreen.css';

export default function PackageDetailsScreen({ onNavigate, data }) {
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('lb');
  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
  const [contents, setContents] = useState(null);
  const [declaredValue, setDeclaredValue] = useState('');
  const [hazmatAnswers, setHazmatAnswers] = useState(HAZMAT_QUESTIONS.map(() => null));
  const [showHazmat, setShowHazmat] = useState(false);

  const handleContentSelect = (contentId) => {
    setContents(contentId);
    setShowHazmat(true);
  };

  const handleHazmatAnswer = (index, answer) => {
    const newAnswers = [...hazmatAnswers];
    newAnswers[index] = answer;
    setHazmatAnswers(newAnswers);
  };

  const hasHazmat = hazmatAnswers.some(a => a === true);
  const allHazmatAnswered = hazmatAnswers.every(a => a !== null);

  const handleNext = () => {
    if (!weight || parseFloat(weight) <= 0) {
      window.alert('Please enter the package weight');
      return;
    }

    if (!contents) {
      window.alert('Please select the package contents type');
      return;
    }

    if (showHazmat && !allHazmatAnswered) {
      window.alert('Please answer all hazardous materials questions');
      return;
    }

    if (hasHazmat) {
      window.alert('Packages containing hazardous materials require special handling. Please visit your local USPS office for assistance.');
      return;
    }

    const weightInOunces = weightUnit === 'lb'
      ? parseFloat(weight) * 16
      : parseFloat(weight);

    onNavigate('serviceSelection', {
      ...data,
      packageDetails: {
        weight: weightInOunces,
        dimensions: {
          length: parseFloat(dimensions.length) || 6,
          width: parseFloat(dimensions.width) || 6,
          height: parseFloat(dimensions.height) || 6,
        },
        contents,
        declaredValue: parseFloat(declaredValue) || 0,
        hazmatScreening: true,
      },
    });
  };

  return (
    <div className="package screen-scroll">
      <div className="card">
        <h3 className="card-title">Package Weight *</h3>
        <div className="package__weight-row">
          <input
            className="input package__weight-input"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="0.0"
            inputMode="decimal"
          />
          <div className="package__unit-toggle">
            <button
              className={`package__unit-btn ${weightUnit === 'lb' ? 'package__unit-btn--active' : ''}`}
              onClick={() => setWeightUnit('lb')}
            >
              lb
            </button>
            <button
              className={`package__unit-btn ${weightUnit === 'oz' ? 'package__unit-btn--active' : ''}`}
              onClick={() => setWeightUnit('oz')}
            >
              oz
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Dimensions (inches) - Optional</h3>
        <div className="package__dims-row">
          <div className="package__dim">
            <span className="package__dim-label">Length</span>
            <input
              className="input"
              value={dimensions.length}
              onChange={e => setDimensions({ ...dimensions, length: e.target.value })}
              placeholder="6"
              inputMode="decimal"
            />
          </div>
          <div className="package__dim">
            <span className="package__dim-label">Width</span>
            <input
              className="input"
              value={dimensions.width}
              onChange={e => setDimensions({ ...dimensions, width: e.target.value })}
              placeholder="6"
              inputMode="decimal"
            />
          </div>
          <div className="package__dim">
            <span className="package__dim-label">Height</span>
            <input
              className="input"
              value={dimensions.height}
              onChange={e => setDimensions({ ...dimensions, height: e.target.value })}
              placeholder="6"
              inputMode="decimal"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">What's in the package? *</h3>
        <div className="package__contents-grid">
          {PACKAGE_CONTENTS.map(item => (
            <button
              key={item.id}
              className={`package__content-btn ${contents === item.id ? 'package__content-btn--active' : ''}`}
              onClick={() => handleContentSelect(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Declared Value (USD) - Optional</h3>
        <div className="package__value-row">
          <span className="package__dollar">$</span>
          <input
            className="input package__value-input"
            value={declaredValue}
            onChange={e => setDeclaredValue(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
        </div>
      </div>

      {showHazmat && (
        <div className="card">
          <h3 className="card-title">Hazardous Materials Screening *</h3>
          <p className="package__hazmat-subtitle">
            Federal law prohibits mailing hazardous materials
          </p>
          {HAZMAT_QUESTIONS.map((question, index) => (
            <div key={index} className="package__hazmat-q">
              <p className="package__hazmat-text">{question}</p>
              <div className="package__yesno-row">
                <button
                  className={`package__yesno-btn ${hazmatAnswers[index] === false ? 'package__yesno-btn--no' : ''}`}
                  onClick={() => handleHazmatAnswer(index, false)}
                >
                  No
                </button>
                <button
                  className={`package__yesno-btn ${hazmatAnswers[index] === true ? 'package__yesno-btn--yes' : ''}`}
                  onClick={() => handleHazmatAnswer(index, true)}
                >
                  Yes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn-primary" onClick={handleNext}>
        Next: Select Service
      </button>
      <div style={{ height: 20 }} />
    </div>
  );
}
