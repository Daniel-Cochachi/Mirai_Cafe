import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-900 text-white flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold text-amber-500 mb-2">☕ Mirai Café</h1>
        <p className="text-neutral-400">Sistema web de cafetería listo para desarrollo</p>

        <Routes>
          <Route path="/" element={<div className="mt-6 text-sm text-neutral-500">Bienvenido al sistema</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
