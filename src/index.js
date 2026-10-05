import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Не найден element #root в index.html');
}

const root = ReactDOM.createRoot(rootElement);

if (typeof App !== 'function') {
  root.render(
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Ошибка экспорта App</h1>
      <p>
        Файл <code>src/app/App.jsx</code> должен экспортировать компонент App.
      </p>
      <p>
        Ожидался <code>export default function App()</code> или{' '}
        <code>export function App()</code>.
      </p>
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        Получено: {String(typeof App)}
      </pre>
    </div>
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}