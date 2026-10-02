import { useState, useEffect } from 'react';

const COUNTRIES = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
];

export default function PhoneInput({
  value = '',
  onChange,
  name = 'phone',
  placeholder = '9876543210',
  required = false,
  style = {},
}) {
  // Parse initial value if present
  const parsePhone = (val) => {
    if (!val) return { dialCode: '+91', number: '' };
    const matchedCountry = COUNTRIES.find((c) => val.startsWith(c.dialCode));
    if (matchedCountry) {
      return {
        dialCode: matchedCountry.dialCode,
        number: val.replace(matchedCountry.dialCode, '').trim(),
      };
    }
    return { dialCode: '+91', number: val };
  };

  const initialParsed = parsePhone(value);
  const [selectedDialCode, setSelectedDialCode] = useState(initialParsed.dialCode);
  const [phoneNumber, setPhoneNumber] = useState(initialParsed.number);

  useEffect(() => {
    const parsed = parsePhone(value);
    setSelectedDialCode(parsed.dialCode);
    setPhoneNumber(parsed.number);
  }, [value]);

  const handleCountryChange = (e) => {
    const newCode = e.target.value;
    setSelectedDialCode(newCode);
    const fullVal = phoneNumber ? `${newCode} ${phoneNumber}` : '';
    onChange({ target: { name, value: fullVal } });
  };

  const handleNumberChange = (e) => {
    const rawNumber = e.target.value.replace(/[^0-9]/g, '');
    setPhoneNumber(rawNumber);
    const fullVal = rawNumber ? `${selectedDialCode} ${rawNumber}` : '';
    onChange({ target: { name, value: fullVal } });
  };

  const currentCountry = COUNTRIES.find((c) => c.dialCode === selectedDialCode) || COUNTRIES[0];

  return (
    <div style={{ display: 'flex', width: '100%', borderRadius: 8, overflow: 'hidden', border: '1.5px solid #E5E7EB', background: 'white' }}>
      <select
        value={selectedDialCode}
        onChange={handleCountryChange}
        style={{
          padding: '9px 8px',
          border: 'none',
          borderRight: '1px solid #E5E7EB',
          fontSize: 13,
          fontWeight: 600,
          background: '#F9FAFB',
          color: '#374151',
          cursor: 'pointer',
          outline: 'none',
          fontFamily: 'inherit',
          flexShrink: 0,
        }}
      >
        {COUNTRIES.map((c) => (
          <option key={c.code + c.dialCode} value={c.dialCode}>
            {c.flag} {c.dialCode}
          </option>
        ))}
      </select>
      <input
        type="tel"
        name={name}
        value={phoneNumber}
        onChange={handleNumberChange}
        placeholder={placeholder}
        required={required}
        style={{
          flex: 1,
          padding: '9px 12px',
          border: 'none',
          fontSize: 13,
          fontFamily: 'inherit',
          outline: 'none',
          color: '#111',
          background: 'transparent',
          minWidth: 0,
          ...style,
        }}
      />
    </div>
  );
}
