import React, { useState, useEffect } from 'react';

interface HumanVerificationProps {
  onVerificationComplete: (isHuman: boolean) => void;
}

const HumanVerification: React.FC<HumanVerificationProps> = ({ onVerificationComplete }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Genera un texto CAPTCHA aleatorio
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    setError('');
  };

  // Genera el CAPTCHA al cargar el componente
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Verifica si el usuario ingresó el CAPTCHA correctamente
  const handleVerify = () => {
    if (userInput.toLowerCase() === captchaText.toLowerCase()) {
      onVerificationComplete(true);
    } else {
      setError('Verificación incorrecta. Intente nuevamente.');
      setAttempts(attempts + 1);
      generateCaptcha();
      
      // Si hay demasiados intentos fallidos, podría ser un bot
      if (attempts >= 3) {
        setError('Demasiados intentos fallidos. Espere unos minutos antes de intentar nuevamente.');
        setTimeout(() => {
          setAttempts(0);
          generateCaptcha();
        }, 30000); // 30 segundos de espera
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Verificación de Seguridad</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Para proteger nuestro sitio contra ataques , necesitamos verificar que eres humano.
        </p>
        
        <div className="mb-4">
          <div className="bg-gray-100 p-3 rounded-md text-center font-mono text-lg tracking-wider select-none mb-2"
               style={{ letterSpacing: '0.5em', fontStyle: 'italic', textDecoration: 'line-through' }}>
            {captchaText}
          </div>
          <button 
            onClick={generateCaptcha}
            className="text-blue-600 hover:text-blue-800 text-xs"
          >
            Generar nuevo código
          </button>
        </div>
        
        <div className="mb-4">
          <label htmlFor="captcha-input" className="block text-sm font-medium text-gray-700 mb-1">
            Ingrese el código mostrado arriba:
          </label>
          <input
            id="captcha-input"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese el código"
          />
        </div>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <button
          onClick={handleVerify}
          disabled={!userInput}
          className={`w-full py-2 px-4 rounded transition-colors ${
            !userInput 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Verificar
        </button>
      </div>
    </div>
  );
};

export default HumanVerification;