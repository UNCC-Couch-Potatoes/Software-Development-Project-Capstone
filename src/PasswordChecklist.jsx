import { passwordChecks } from './passwordRules';
import './password.css';

function PasswordChecklist({ password }) {
  return (
    <ul className="password-rules">
      {passwordChecks(password).map((check) => (
        <li key={check.label} className={check.met ? 'met' : ''}>
          {check.label}
        </li>
      ))}
    </ul>
  );
}

export default PasswordChecklist;