import React, { useState } from 'react';
import './App.css';
import { PieChart, PieChartSector } from './PieChart';

const data: PieChartSector[] = [
  {
    label: 'Супермаркеты',
    value: 33,
    color: '#FE788B',
  },
  {
    label: 'Аптеки',
    value: 30,
    color: '#76E1A1',
  },
  {
    label: 'Переводы',
    value: 26,
    color: '#4FC5DF',
  },
  {
    label: 'Остальное',
    value: 2,
    color: '#B4CDDB',
    iconUrl: 'https://cdn-icons-png.freepik.com/512/9831/9831317.png?ga=GA1.1.714606025.1754404327',
  },
  {
    label: 'Фастфуд',
    value: 8,
    color: '#FF9675',
    iconUrl: 'https://cdn-icons-png.freepik.com/512/9831/9831317.png?ga=GA1.1.714606025.1754404327',
  },
  {
    label: 'Транспорт',
    value: 1,
    color: '#6489F1',
    iconUrl: 'https://cdn-icons-png.freepik.com/512/9831/9831317.png?ga=GA1.1.714606025.1754404327',
  },
];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function App() {
  const [chartParams, setChartParams] = useState({
    size: 400,
    strokeWidth: 24,
    ringWidth: 40,
    roundSize: 20,
    shadowBlur: 8,
    shadowOffset: 8,
  });
  const [shadowMode, setShadowMode] = useState<'always' | 'after-animation' | 'disabled'>('always');
  const [cursorMode, setCursorMode] = useState<'pointer' | 'none'>('pointer');
  const [key, setKey] = useState(0); // Для принудительной перерисовки
  const [selectedSegment, setSelectedSegment] = useState<PieChartSector | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKey(prev => prev + 1); // Принудительно перерисовываем компонент
  };

  const handleInputChange = (field: string, value: number) => {
    setChartParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>PieChart Demo</h1>
        
        {/* Форма настроек */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#2ca018', borderRadius: '8px' }}>
          <h3>Настройки диаграммы</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', maxWidth: '600px' }}>
            <div>
              <label>Размер диаграммы:</label>
              <input
                type="number"
                value={chartParams.size}
                onChange={(e) => handleInputChange('size', Number(e.target.value))}
                min="200"
                max="800"
                step="10"
              />
            </div>
            <div>
              <label>Толщина линий:</label>
              <input
                type="number"
                value={chartParams.strokeWidth}
                onChange={(e) => handleInputChange('strokeWidth', Number(e.target.value))}
                min="10"
                max="50"
                step="2"
              />
            </div>
            <div>
              <label>Ширина кольца:</label>
              <input
                type="number"
                value={chartParams.ringWidth}
                onChange={(e) => handleInputChange('ringWidth', Number(e.target.value))}
                min="20"
                max="100"
                step="5"
              />
            </div>
            <div>
              <label>Размер закруглений:</label>
              <input
                type="number"
                value={chartParams.roundSize}
                onChange={(e) => handleInputChange('roundSize', Number(e.target.value))}
                min="10"
                max="50"
                step="5"
              />
            </div>
            <div>
              <label>Размытие тени:</label>
              <input
                type="number"
                value={chartParams.shadowBlur}
                onChange={(e) => handleInputChange('shadowBlur', Number(e.target.value))}
                min="0"
                max="20"
                step="1"
              />
            </div>
            <div>
              <label>Смещение тени:</label>
              <input
                type="number"
                value={chartParams.shadowOffset}
                onChange={(e) => handleInputChange('shadowOffset', Number(e.target.value))}
                min="0"
                max="20"
                step="1"
              />
            </div>
          </div>
          
          {/* Управление тенью */}
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#2ca018', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Настройки тени</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="shadowMode"
                  value="always"
                  checked={shadowMode === 'always'}
                  onChange={(e) => setShadowMode(e.target.value as 'always' | 'after-animation' | 'disabled')}
                  style={{ marginRight: '8px' }}
                />
                Всегда включена
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="shadowMode"
                  value="after-animation"
                  checked={shadowMode === 'after-animation'}
                  onChange={(e) => setShadowMode(e.target.value as 'always' | 'after-animation' | 'disabled')}
                  style={{ marginRight: '8px' }}
                />
                Включена после анимации
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="shadowMode"
                  value="disabled"
                  checked={shadowMode === 'disabled'}
                  onChange={(e) => setShadowMode(e.target.value as 'always' | 'after-animation' | 'disabled')}
                  style={{ marginRight: '8px' }}
                />
                Отключена
              </label>
            </div>
          </div>
          
          {/* Управление курсором */}
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#2ca018', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Настройки курсора</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="cursorMode"
                  value="pointer"
                  checked={cursorMode === 'pointer'}
                  onChange={(e) => setCursorMode(e.target.value as 'pointer' | 'none')}
                  style={{ marginRight: '8px' }}
                />
                Pointer (курсор-указатель)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="cursorMode"
                  value="none"
                  checked={cursorMode === 'none'}
                  onChange={(e) => setCursorMode(e.target.value as 'pointer' | 'none')}
                  style={{ marginRight: '8px' }}
                />
                None (отключить логику курсора)
              </label>
            </div>
          </div>
          
          <button type="submit" style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Применить настройки
          </button>
        </form>

        {/* Диаграмма */}
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}><div style={{ padding: '20px' }}>
          <PieChart 
            key={key} // Принудительная перерисовка при изменении
            data={data} 
            size={chartParams.size}
            strokeWidth={chartParams.strokeWidth}
            ringWidth={chartParams.ringWidth}
            roundSize={chartParams.roundSize}
            shadowBlur={chartParams.shadowBlur}
            shadowOffset={chartParams.shadowOffset}
            animationDuration={1200}
            animationEasing={easeOutCubic}
            shadowMode={shadowMode}
            cursorMode={cursorMode}
            onSegmentClick={(segment, index) => {
              setSelectedSegment(segment);
            }}
          />
        </div>
        
          <div style={{marginTop: 24, padding: 16, background: '#fff', color: '#222', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto'}}>
            <h3>Информация о сегменте</h3>
            <div><b>Категория:</b> {selectedSegment?.label}</div>
            <div><b>Значение:</b> {selectedSegment?.value}</div>
            <div><b>Цвет:</b> <span style={{color: selectedSegment?.color}}>{selectedSegment?.color}</span></div>
            {selectedSegment?.iconUrl && <img src={selectedSegment?.iconUrl} alt="icon" style={{width: 32, height: 32, marginTop: 8}} />}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
