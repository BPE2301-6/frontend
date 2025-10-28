import { useState } from 'react';
import Input from '@shared/ui/Input';
import Button from '@shared/ui/Button';
import Avatar from '@shared/ui/Avatar';

function ComponentsDemo() {
  const [inputValue, setInputValue] = useState('');
  const [errorInput, setErrorInput] = useState('');

  return (
    <div className="w-full h-screen bg-figma-bg flex items-center justify-center">
      <div className="flex flex-col items-center space-y-8">
        <div className="flex flex-col space-y-6">
          <h2 className="text-figma-title font-montserrat font-bold text-figma-white text-center mb-4">
            Input Components
          </h2>

          <Input
            placeholder="логин"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <Input
            placeholder="логин"
            value={errorInput}
            onChange={(e) => setErrorInput(e.target.value)}
            error={true}
          />

          <Input placeholder="логин" disabled={true} />
        </div>

        <div className="flex flex-col space-y-6">
          <h2 className="text-figma-title font-montserrat font-bold text-figma-white text-center mb-4">
            Button Components
          </h2>

          <div className="flex space-x-4">
            <Button size="small" onClick={() => {}} />
            <Button size="small" onClick={() => {}} />
          </div>

          <Button variant="error" onClick={() => {}}>
            логин
          </Button>

          <Button variant="primary" onClick={() => {}}>
            Войти
          </Button>

          <Button variant="secondary" onClick={() => {}}>
            Регистрация
          </Button>

          <Button variant="outline" onClick={() => {}}>
            Отмена
          </Button>
        </div>

        <div className="flex flex-col space-y-6">
          <h2 className="text-figma-title font-montserrat font-bold text-figma-white text-center mb-4">
            Avatar Components
          </h2>

          <div className="flex space-x-4">
            <Avatar size="small" />
            <Avatar size="default" />
            <Avatar size="large" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComponentsDemo;
