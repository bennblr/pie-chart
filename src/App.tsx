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

// Коллекция различных easing функций
const easingFunctions = {
  'linear': (t: number) => t,
  'easeInQuad': (t: number) => t * t,
  'easeOutQuad': (t: number) => t * (2 - t),
  'easeInOutQuad': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  'easeInCubic': (t: number) => t * t * t,
  'easeOutCubic': (t: number) => 1 - Math.pow(1 - t, 3),
  'easeInOutCubic': (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  'easeInQuart': (t: number) => t * t * t * t,
  'easeOutQuart': (t: number) => 1 - Math.pow(1 - t, 4),
  'easeInOutQuart': (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  'easeInQuint': (t: number) => t * t * t * t * t,
  'easeOutQuint': (t: number) => 1 - Math.pow(1 - t, 5),
  'easeInOutQuint': (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  'easeInSine': (t: number) => 1 - Math.cos(t * Math.PI / 2),
  'easeOutSine': (t: number) => Math.sin(t * Math.PI / 2),
  'easeInOutSine': (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  'easeInExpo': (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  'easeOutExpo': (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  'easeInOutExpo': (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  'easeInCirc': (t: number) => 1 - Math.sqrt(1 - t * t),
  'easeOutCirc': (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  'easeInOutCirc': (t: number) => t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
  'easeInBack': (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  'easeOutBack': (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  'easeInOutBack': (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5 ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  'easeInElastic': (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  'easeOutElastic': (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  'easeInOutElastic': (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c5 = (2 * Math.PI) / 4.5;
    return t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2 : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  'easeInBounce': (t: number) => 1 - easingFunctions.easeOutBounce(1 - t),
  'easeOutBounce': (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  'easeInOutBounce': (t: number) => t < 0.5 ? (1 - easingFunctions.easeOutBounce(1 - 2 * t)) / 2 : (1 + easingFunctions.easeOutBounce(2 * t - 1)) / 2,
};

function App() {
  const [chartParams, setChartParams] = useState({
    size: 400,
    ringWidth: 40,
    roundSize: 20,
    shadowBlur: 8,
    shadowOffset: 8,
    roundShadowBlur: 4,
    roundShadowColor: '#000000',
    roundShadowOpacity: 20,
    roundShadowOffset: 2,
    roundShadowMode: 'always' as 'always' | 'after-animation' | 'disabled',
    roundShadowAnimationDuration: 500,
    // Параметры основной анимации
    mainAnimationDuration: 1200,
    // Easing для анимаций теней
    shadowEasing: 'easeOutCubic' as keyof typeof easingFunctions,
    // Параметры анимации иконок
    iconAnimationDelay: 0,
    iconAnimationDuration: 300,
    iconAnimationType: 'scale' as 'fade' | 'scale' | 'slide' | 'bounce',
    // Параметры лейблов сегментов
    showSegmentLabels: true,
    segmentLabelType: 'percentage' as 'percentage' | 'value' | 'custom',
    segmentLabelDistance: 210,
    segmentLabels: ['', '', '', ''],
  });
  const [shadowMode, setShadowMode] = useState<'always' | 'after-animation' | 'disabled'>('always');
  const [cursorMode, setCursorMode] = useState<'pointer' | 'none'>('pointer');
  const [key, setKey] = useState(0); // Для принудительной перерисовки
  const [selectedSegment, setSelectedSegment] = useState<PieChartSector | null>(null);
  const [selectedEasing, setSelectedEasing] = useState<keyof typeof easingFunctions>('easeOutCubic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKey(prev => prev + 1); // Принудительно перерисовываем компонент
  };

  const handleInputChange = (field: string, value: number | string | boolean | string[]) => {
    setChartParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="App">
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Левая панель - конфиги */}
        <div style={{ 
          width: '400px', 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          overflowY: 'auto',
          borderRight: '1px solid #dee2e6'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Настройки диаграммы</h2>
        
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  Размер диаграммы:
                  <input
                    type="number"
                    value={chartParams.size}
                    onChange={(e) => handleInputChange('size', Number(e.target.value))}
                    style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </label>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  Ширина кольца:
                  <input
                    type="number"
                    value={chartParams.ringWidth}
                    onChange={(e) => handleInputChange('ringWidth', Number(e.target.value))}
                    style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </label>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  Размер закруглений:
                  <input
                    type="number"
                    value={chartParams.roundSize}
                    onChange={(e) => handleInputChange('roundSize', Number(e.target.value))}
                    style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </label>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  Размытие тени:
                  <input
                    type="number"
                    value={chartParams.shadowBlur}
                    onChange={(e) => handleInputChange('shadowBlur', Number(e.target.value))}
                    style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </label>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  Смещение тени:
                  <input
                    type="number"
                    value={chartParams.shadowOffset}
                    onChange={(e) => handleInputChange('shadowOffset', Number(e.target.value))}
                    style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </label>
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
          
          {/* Управление тенями закруглений */}
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ff6b35', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Настройки теней закруглений</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="roundShadowMode"
                  value="always"
                  checked={chartParams.roundShadowMode === 'always'}
                  onChange={(e) => handleInputChange('roundShadowMode', e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Всегда включены
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="roundShadowMode"
                  value="after-animation"
                  checked={chartParams.roundShadowMode === 'after-animation'}
                  onChange={(e) => handleInputChange('roundShadowMode', e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Включены после анимации
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="roundShadowMode"
                  value="disabled"
                  checked={chartParams.roundShadowMode === 'disabled'}
                  onChange={(e) => handleInputChange('roundShadowMode', e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Отключены
              </label>
              <div>
                <label>Цвет теней закруглений:</label>
                <input
                  type="color"
                  value={chartParams.roundShadowColor}
                  onChange={(e) => handleInputChange('roundShadowColor', e.target.value)}
                  style={{ width: '100%', height: '30px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Размытие теней закруглений:</label>
                <input
                  type="number"
                  value={chartParams.roundShadowBlur}
                  onChange={(e) => handleInputChange('roundShadowBlur', Number(e.target.value))}
                />
              </div>
              <div>
                <label>Прозрачность теней закруглений:</label>
                <input
                  type="range"
                  value={chartParams.roundShadowOpacity}
                  onChange={(e) => handleInputChange('roundShadowOpacity', Number(e.target.value))}
                  min="0"
                  max="100"
                  step="1"
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {chartParams.roundShadowOpacity}%
                </span>
              </div>
              <div>
                <label>Длина сдвига теней:</label>
                <input
                  type="number"
                  value={chartParams.roundShadowOffset}
                  onChange={(e) => handleInputChange('roundShadowOffset', Number(e.target.value))}
                />
              </div>
              <div>
                <label>Время анимации теней (мс):</label>
                <input
                  type="number"
                  value={chartParams.roundShadowAnimationDuration}
                  onChange={(e) => handleInputChange('roundShadowAnimationDuration', Number(e.target.value))}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  Easing для теней:
                  <select
                    value={chartParams.shadowEasing}
                    onChange={(e) => handleInputChange('shadowEasing', e.target.value as keyof typeof easingFunctions)}
                    style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="easeOutCubic">Ease Out Cubic</option>
                    <option value="easeInCubic">Ease In Cubic</option>
                    <option value="easeInOutCubic">Ease In Out Cubic</option>
                    <option value="easeOutQuart">Ease Out Quart</option>
                    <option value="easeInQuart">Ease In Quart</option>
                    <option value="easeInOutQuart">Ease In Out Quart</option>
                    <option value="easeOutQuint">Ease Out Quint</option>
                    <option value="easeInQuint">Ease In Quint</option>
                    <option value="easeInOutQuint">Ease In Out Quint</option>
                    <option value="easeOutSine">Ease Out Sine</option>
                    <option value="easeInSine">Ease In Sine</option>
                    <option value="easeInOutSine">Ease In Out Sine</option>
                    <option value="easeOutExpo">Ease Out Expo</option>
                    <option value="easeInExpo">Ease In Expo</option>
                    <option value="easeInOutExpo">Ease In Out Expo</option>
                    <option value="easeOutCirc">Ease Out Circ</option>
                    <option value="easeInCirc">Ease In Circ</option>
                    <option value="easeInOutCirc">Ease In Out Circ</option>
                    <option value="easeOutBack">Ease Out Back</option>
                    <option value="easeInBack">Ease In Back</option>
                    <option value="easeInOutBack">Ease In Out Back</option>
                    <option value="easeOutElastic">Ease Out Elastic</option>
                    <option value="easeInElastic">Ease In Elastic</option>
                    <option value="easeInOutElastic">Ease In Out Elastic</option>
                    <option value="easeOutBounce">Ease Out Bounce</option>
                    <option value="easeInBounce">Ease In Bounce</option>
                    <option value="easeInOutBounce">Ease In Out Bounce</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
          
          {/* Управление основной анимацией */}
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ff9800', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Основная анимация</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                  Длительность анимации (мс):
                  <input
                    type="number"
                    value={chartParams.mainAnimationDuration}
                    onChange={(e) => handleInputChange('mainAnimationDuration', Number(e.target.value))}
                    style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </label>
              </div>
            </div>
          </div>
          
          {/* Управление лейблами сегментов */}
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#795548', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Лейблы сегментов</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={chartParams.showSegmentLabels}
                    onChange={(e) => handleInputChange('showSegmentLabels', e.target.checked)}
                  />
                  Показывать лейблы сегментов
                </label>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                  Тип лейбла:
                  <select
                    value={chartParams.segmentLabelType}
                    onChange={(e) => handleInputChange('segmentLabelType', e.target.value as 'percentage' | 'value' | 'custom')}
                    style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="percentage">Проценты</option>
                    <option value="value">Значения</option>
                    <option value="custom">Кастомные</option>
                  </select>
                </label>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                  Расстояние от центра:
                  <input
                    type="number"
                    value={chartParams.segmentLabelDistance}
                    onChange={(e) => handleInputChange('segmentLabelDistance', Number(e.target.value))}
                    style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </label>
              </div>
              {chartParams.segmentLabelType === 'custom' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                    Кастомные лейблы:
                    {chartParams.segmentLabels.map((label, index) => (
                      <input
                        key={index}
                        type="text"
                        value={label}
                        onChange={(e) => {
                          const newLabels = [...chartParams.segmentLabels];
                          newLabels[index] = e.target.value;
                          handleInputChange('segmentLabels', newLabels);
                        }}
                        placeholder={`Лейбл ${index + 1}`}
                        style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    ))}
                  </label>
                </div>
              )}
            </div>
          </div>
          
          {/* Управление анимацией иконок */}
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#9c27b0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Анимация иконок</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                  Тип анимации:
                  <select
                    value={chartParams.iconAnimationType}
                    onChange={(e) => handleInputChange('iconAnimationType', e.target.value as 'fade' | 'scale' | 'slide' | 'bounce')}
                    style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="fade">Fade (исчезновение)</option>
                    <option value="scale">Scale (масштабирование)</option>
                    <option value="slide">Slide (скольжение)</option>
                    <option value="bounce">Bounce (отскок)</option>
                  </select>
                </label>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                  Длительность анимации (мс):
                  <input
                    type="number"
                    value={chartParams.iconAnimationDuration}
                    onChange={(e) => handleInputChange('iconAnimationDuration', Number(e.target.value))}
                    style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </label>
              </div>
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
          
          {/* Управление анимацией */}
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#2ca018', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Настройки анимации</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontWeight: 'bold' }}>Easing функция:</span>
                <select
                  value={selectedEasing}
                  onChange={(e) => setSelectedEasing(e.target.value as keyof typeof easingFunctions)}
                  style={{ 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    backgroundColor: 'white',
                    fontSize: '14px'
                  }}
                >
                  {Object.keys(easingFunctions).map((easingName) => (
                    <option key={easingName} value={easingName}>
                      {easingName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          
            <button type="submit" style={{ 
              marginTop: '20px', 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              width: '100%'
            }}>
              Применить настройки
            </button>
          </form>
        </div>

        {/* Правая панель - график */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#ffffff',
          position: 'relative'
        }}>
          {/* Диаграмма - фиксированная позиция */}
          <div style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1
          }}>
            <PieChart 
              key={key} // Принудительная перерисовка при изменении
              data={data} 
              size={chartParams.size}
              ringWidth={chartParams.ringWidth}
              roundSize={chartParams.roundSize}
              shadowBlur={chartParams.shadowBlur}
              shadowOffset={chartParams.shadowOffset}
              roundShadowBlur={chartParams.roundShadowBlur}
              roundShadowColor={chartParams.roundShadowColor}
              roundShadowOpacity={chartParams.roundShadowOpacity / 100}
              roundShadowOffset={chartParams.roundShadowOffset}
              roundShadowMode={chartParams.roundShadowMode as 'always' | 'after-animation' | 'disabled'}
              roundShadowAnimationDuration={chartParams.roundShadowAnimationDuration}
              animationDuration={chartParams.mainAnimationDuration}
              animationEasing={easingFunctions[selectedEasing]}
              shadowMode={shadowMode}
              cursorMode={cursorMode}
              iconAnimationDelay={chartParams.iconAnimationDelay}
              iconAnimationDuration={chartParams.iconAnimationDuration}
              iconAnimationType={chartParams.iconAnimationType}
              shadowEasing={easingFunctions[chartParams.shadowEasing]}
              showSegmentLabels={chartParams.showSegmentLabels}
              segmentLabelType={chartParams.segmentLabelType}
              segmentLabelDistance={chartParams.segmentLabelDistance}
              segmentLabels={chartParams.segmentLabels}
              onSegmentClick={(segment, index) => {
                setSelectedSegment(segment);
              }}
            />
          </div>
          
          {/* Информация о сегменте - внизу */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '20px', 
            background: '#f8f9fa', 
            color: '#333', 
            borderRadius: '8px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
            minWidth: '300px',
            border: '1px solid #dee2e6',
            zIndex: 2
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Информация о сегменте</h3>
            {selectedSegment ? (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <b>Категория:</b> {selectedSegment.label}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <b>Значение:</b> {selectedSegment.value}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <b>Цвет:</b> <span style={{color: selectedSegment.color}}>{selectedSegment.color}</span>
                </div>
                {selectedSegment.iconUrl && (
                  <img 
                    src={selectedSegment.iconUrl} 
                    alt="icon" 
                    style={{width: 32, height: 32, marginTop: 8}} 
                  />
                )}
              </>
            ) : (
              <div style={{ color: '#666', fontStyle: 'italic' }}>
                Кликните на сегмент для просмотра информации
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
