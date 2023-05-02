import React, { useState } from 'react';




interface AuthFormProps {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ username, password, onUsernameChange, onPasswordChange }) => {
  return (
    <div>
      <Input label="Username" value={username} onChange={onUsernameChange} />
      <br />
      <Input label="Password" value={password} onChange={onPasswordChange} />
    </div>
  );
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const Input: React.FC<InputProps> = ({ label, value, onChange }) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  }

  return (
    <div>
      <label>
        {label}:
        <input type="text" value={value} onChange={handleInputChange} />
      </label>
    </div>
  );
}

export default AuthForm;