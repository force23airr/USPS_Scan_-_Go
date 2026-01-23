// USPS Brand Colors
export const COLORS = {
  primary: '#004B87',      // USPS Blue
  primaryDark: '#003366',
  secondary: '#DA291C',    // USPS Red
  background: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6B7280',
  grayLight: '#E5E7EB',
  grayDark: '#374151',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

// Package contents categories
export const PACKAGE_CONTENTS = [
  { id: 'merchandise', label: 'Merchandise / Goods' },
  { id: 'gift', label: 'Gift' },
  { id: 'documents', label: 'Documents' },
  { id: 'returned_goods', label: 'Returned Goods' },
  { id: 'sample', label: 'Commercial Sample' },
  { id: 'other', label: 'Other' },
];

// Hazmat screening questions
export const HAZMAT_QUESTIONS = [
  'Does your package contain lithium batteries?',
  'Does your package contain perfume, cologne, or nail polish?',
  'Does your package contain aerosols or compressed gas?',
  'Does your package contain flammable liquids or solids?',
  'Does your package contain any hazardous materials?',
];

// Service tier icons/descriptions
export const SERVICE_INFO = {
  PRIORITY_MAIL_EXPRESS: {
    name: 'Priority Mail Express',
    description: 'Fastest option with overnight to 2-day delivery',
    icon: 'rocket',
  },
  PRIORITY_MAIL: {
    name: 'Priority Mail',
    description: '1-3 business days delivery',
    icon: 'airplane',
  },
  USPS_GROUND_ADVANTAGE: {
    name: 'USPS Ground Advantage',
    description: '2-5 business days, best value',
    icon: 'truck',
  },
  FIRST_CLASS_MAIL: {
    name: 'First-Class Mail',
    description: '2-5 business days for lightweight packages',
    icon: 'mail',
  },
};
