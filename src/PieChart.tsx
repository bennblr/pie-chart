import React, { useRef, useEffect, useMemo } from 'react';
import {
  adjustData,
  drawSegmentWithoutRound,
  drawRoundEnd,
  drawRoundStart,
  drawSegmentShadow,
  drawSegmentLabel,
  isPointInSegment,
  getSegmentIndex,
  type AdjustedDataItem
} from './utils/pieChartUtils';

export type PieChartSector = {
  label: string;
  value: number; // абсолютное значение, не процент
  color: string;
  iconUrl?: string;
};

export type PieChartProps = {
  data: PieChartSector[];
  size?: number;
  strokeWidth?: number;
  ringWidth?: number; // Ширина кольца
  roundSize?: number; // Диаметр окружностей закруглений
  shadowBlur?: number; // Размытие тени
  shadowOffset?: number; // Смещение тени
  animationDuration?: number; // Длительность анимации
  animationEasing?: (t: number) => number; // Функция easing
  onSegmentClick?: (segment: PieChartSector, index: number) => void; // Клик по сегменту
  shadowMode?: 'always' | 'after-animation' | 'disabled'; // Режим отображения тени
  cursorMode?: 'pointer' | 'none'; // Режим курсора
};

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 500,
  strokeWidth = 24,
  ringWidth = 50,
  roundSize = 25,
  shadowBlur = 8,
  shadowOffset = 8,
  animationDuration = 1500,
  animationEasing = (t: number) => t,
  onSegmentClick,
  shadowMode = 'always',
  cursorMode = 'pointer',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialRender, setIsInitialRender] = React.useState(true);
  
  // Центр и размеры диаграммы
  const centerX = size / 2;
  const centerY = size / 2;
  const padding = 20;
  const innerRadius = (size / 2) - ringWidth - padding;
  const outerRadius = innerRadius + ringWidth; // Ширина кольца из пропса
  const minSegmentAngle = (1.5 * roundSize * 2) / (innerRadius + roundSize); // Минимальный угол для 1.5 диаметра круга

  // Корректируем данные (увеличиваем маленькие сегменты)
  const adjustedData = useMemo(() => {
    return adjustData(data, minSegmentAngle);
  }, [data, minSegmentAngle]);

  // Функция для отрисовки графика
  const drawChart = React.useCallback((progress: number = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем сегменты в обратном порядке
    let currentAngle = -Math.PI / 2;
    const segments = [];
    
    // Сначала вычисляем все углы
    for (let i = 0; i < adjustedData.length; i++) {
      const item = adjustedData[i];
      let segmentAngle;
      
      if (i === 0) {
        // Первый сегмент начинается с частичного заполнения
        const minAngle = (roundSize * 2) / (innerRadius + roundSize); // Минимальный угол для смещения закругления
        segmentAngle = Math.max(minAngle, item.angle * progress);
      } else {
        segmentAngle = item.angle * progress;
      }
      
      segments.push({
        ...item,
        startAngle: currentAngle,
        endAngle: currentAngle + segmentAngle
      });
      currentAngle += segmentAngle;
    }
    
    // Рисуем тени сегментов
    const shouldDrawShadow = shadowMode === 'always' || (shadowMode === 'after-animation' && progress >= 1);
    
    if (shouldDrawShadow) {
      for (let i = segments.length - 1; i >= 0; i--) {
        const segment = segments[i];
        
        drawSegmentShadow(
          ctx,
          centerX,
          centerY,
          innerRadius,
          outerRadius,
          segment.startAngle, 
          segment.endAngle, 
          segment.color,
          shadowBlur,
          shadowOffset
        );
      }
    }
    
    // Сначала рисуем закругления в начале сегментов
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];
      
      drawRoundStart(
        ctx,
        centerX,
        centerY,
        innerRadius,
        roundSize,
        segment.startAngle, 
        segment.color
      );
    }
    
         // Затем рисуем все сегменты
     for (let i = segments.length - 1; i >= 0; i--) {
       const segment = segments[i];
       
       drawSegmentWithoutRound(
         ctx,
         centerX,
         centerY,
         innerRadius,
         outerRadius,
         segment.startAngle, 
         segment.endAngle, 
         segment.color
       );
     }
    
    // Затем рисуем закругления в конце сегментов
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];
      
      // Закругление на конце сегмента
      const endLabelPos = drawRoundEnd(
        ctx,
        centerX,
        centerY,
        innerRadius,
        roundSize,
        segment.endAngle, 
        segment.color
      );
      
             // В закруглении на конце: иконка или первая буква (только после завершения анимации)
       drawSegmentLabel(ctx, endLabelPos, segment, data, i, progress);
     }
       }, [adjustedData, centerX, centerY, innerRadius, outerRadius, roundSize, shadowBlur, shadowOffset, data, shadowMode]);

  // Анимация только при первом рендере
  useEffect(() => {
    if (!isInitialRender) {
      drawChart(1);
      return;
    }

    let progress = 0;
    const duration = animationDuration;
    const easing = animationEasing;
    const startTime = Date.now();

    function animate() {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      progress = Math.min(elapsed / duration, 1);
      progress = easing(progress);
      
      drawChart(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsInitialRender(false);
      }
    }

    animate();
  }, [adjustedData, centerX, centerY, innerRadius, outerRadius, roundSize, minSegmentAngle, shadowBlur, shadowOffset, animationDuration, animationEasing, isInitialRender]);

  // Перерисовка при изменении выбранного сегмента
  useEffect(() => {
    if (!isInitialRender) {
      drawChart(1);
    }
  }, [drawChart, isInitialRender]);

  // --- Обработчик клика по сегменту ---
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onSegmentClick) return;
    
    function handleClick(e: MouseEvent) {
      const rect = canvas?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (isPointInSegment(x, y, centerX, centerY, innerRadius, outerRadius, roundSize, adjustedData)) {
        const segmentIndex = getSegmentIndex(x, y, centerX, centerY, innerRadius, outerRadius, roundSize, adjustedData);
        if (segmentIndex !== -1) {
          onSegmentClick?.(data[segmentIndex], segmentIndex);
        }
      }
    }
    
    function handleMouseMove(e: MouseEvent) {
      if (cursorMode === 'none') return;
      
      const rect = canvas?.getBoundingClientRect();
      if (!rect || !canvas) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (isPointInSegment(x, y, centerX, centerY, innerRadius, outerRadius, roundSize, adjustedData)) {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'default';
      }
    }
    
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [centerX, centerY, innerRadius, outerRadius, adjustedData, data, onSegmentClick, roundSize]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        backgroundColor: 'transparent',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    />
  );
}; 