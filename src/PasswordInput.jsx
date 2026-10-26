import { useState } from 'react';
import './password.css';

function PasswordInput(props) {
  // false = hidden (dots), true = visible (text)
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        style={{ paddingRight: '4.5rem' }}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

export default PasswordInput;