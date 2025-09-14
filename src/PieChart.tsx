import React, { useRef, useEffect, useMemo } from 'react';
import {
  adjustData,
  drawSegmentWithoutRound,
  drawRoundEnd,
  drawRoundStart,
  drawSegmentShadow,
  drawRoundShadow,
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
  roundShadowBlur?: number; // Размытие тени закруглений
  roundShadowColor?: string; // Цвет тени закруглений
  roundShadowOpacity?: number; // Прозрачность тени закруглений
  roundShadowOffset?: number; // Смещение тени закруглений наружу
  roundShadowMode?: 'always' | 'after-animation' | 'disabled'; // Режим отображения тени закруглений
  roundShadowAnimationDuration?: number; // Длительность анимации теней закруглений
  animationDuration?: number; // Длительность анимации
  animationEasing?: (t: number) => number; // Функция easing
  onSegmentClick?: (segment: PieChartSector, index: number) => void; // Клик по сегменту
  shadowMode?: 'always' | 'after-animation' | 'disabled'; // Режим отображения тени
  cursorMode?: 'pointer' | 'none'; // Режим курсора
  shadowEasing?: (t: number) => number; // Функция easing для теней
  // Настройки анимации иконок
  iconAnimationDelay?: number; // Задержка перед появлением иконок (мс)
  iconAnimationDuration?: number; // Длительность анимации иконок (мс)
  iconAnimationEasing?: (t: number) => number; // Функция easing для иконок
  iconAnimationType?: 'fade' | 'scale' | 'slide' | 'bounce'; // Тип анимации иконок
  // Настройки лейблов сегментов
  showSegmentLabels?: boolean; // Показывать ли лейблы сегментов
  segmentLabelType?: 'percentage' | 'value' | 'custom'; // Тип лейбла
  segmentLabelDistance?: number; // Расстояние от центра до лейбла
  segmentLabels?: string[]; // Кастомные лейблы для сегментов
};

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 500,
  strokeWidth = 24,
  ringWidth = 50,
  roundSize = 25,
  shadowBlur = 8,
  shadowOffset = 8,
  roundShadowBlur = 4,
  roundShadowColor = '#000000',
  roundShadowOpacity = 0.2,
  roundShadowOffset = 2,
  roundShadowMode = 'always',
  animationDuration = 1500,
  roundShadowAnimationDuration = 500,
  animationEasing = (t: number) => t,
  onSegmentClick,
  shadowMode = 'always',
  cursorMode = 'pointer',
  shadowEasing = (t: number) => t,
  // Настройки анимации иконок
  iconAnimationDelay = 0,
  iconAnimationDuration = 300,
  iconAnimationEasing = (t: number) => t,
  iconAnimationType = 'scale',
  // Настройки лейблов сегментов
  showSegmentLabels = true,
  segmentLabelType = 'percentage',
  segmentLabelDistance = 210,
  segmentLabels,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialRender, setIsInitialRender] = React.useState(true);
  const [iconPositions, setIconPositions] = React.useState<Array<{x: number, y: number, label: string, iconUrl?: string}>>([]);
  const [showIcons, setShowIcons] = React.useState(false);
  const [segmentLabelPositions, setSegmentLabelPositions] = React.useState<Array<{x: number, y: number, label: string, angle: number}>>([]);

  // Функция для генерации CSS стилей анимации иконок
  const getIconAnimationStyles = (animationType: string) => {
    const baseStyles = {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      width: 20,
      height: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center' as const,
      lineHeight: 1,
      opacity: 0,
      pointerEvents: 'none' as const,
      transition: `all ${iconAnimationDuration}ms ease-out`,
    };

    switch (animationType) {
      case 'fade':
        return {
          ...baseStyles,
          transform: 'scale(1)',
        };
      case 'scale':
        return {
          ...baseStyles,
          transform: 'scale(0.5)',
        };
      case 'slide':
        return {
          ...baseStyles,
          transform: 'translateY(20px) scale(0.8)',
        };
      case 'bounce':
        return {
          ...baseStyles,
          transform: 'scale(0.3)',
          transition: `all ${iconAnimationDuration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
        };
      default:
        return {
          ...baseStyles,
          transform: 'scale(0.5)',
        };
    }
  };

  const getIconVisibleStyles = (animationType: string) => {
    switch (animationType) {
      case 'fade':
        return { opacity: 1 };
      case 'scale':
        return { opacity: 1, transform: 'scale(1)' };
      case 'slide':
        return { opacity: 1, transform: 'translateY(0) scale(1)' };
      case 'bounce':
        return { opacity: 1, transform: 'scale(1)' };
      default:
        return { opacity: 1, transform: 'scale(1)' };
    }
  };
  
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
  const drawChart = React.useCallback((progress: number = 1, shadowProgress: number = 1, mainShadowProgress: number = 1, iconProgress: number = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Сбрасываем все свойства контекста для чистой отрисовки
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';
    
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
    
    // Вычисляем прогресс анимации основных теней
    let mainShadowProgressValue = 1;
    if (shadowMode === 'after-animation') {
      if (progress < 1) {
        mainShadowProgressValue = 0; // Полная прозрачность до завершения основной анимации
      } else {
        mainShadowProgressValue = mainShadowProgress; // Используем отдельный прогресс для основных теней
      }
    } else if (shadowMode === 'always') {
      mainShadowProgressValue = progress; // Следуем основной анимации
    } else {
      mainShadowProgressValue = 0; // Тени отключены
    }
    
    const shouldDrawShadow = mainShadowProgressValue > 0;
    
    // Вычисляем прогресс анимации теней закруглений
    let roundShadowProgress = 0;
    if (roundShadowMode === 'after-animation') {
      if (progress < 1) {
        roundShadowProgress = 0; // Полная прозрачность до завершения основной анимации
      } else {
        // Используем переданный shadowProgress напрямую
        roundShadowProgress = shadowProgress;
      }
    } else if (roundShadowMode === 'always') {
      // Для режима 'always' тени должны анимироваться вместе с основной анимацией
      roundShadowProgress = progress; // Используем основную анимацию
    }
    
    const shouldDrawRoundShadow = roundShadowMode !== 'disabled' && roundShadowProgress > 0;
    
    // Тени закруглений будут нарисованы после основных теней сегментов
    
    // Затем рисуем основные закругления в начале сегментов
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
    
    // Затем рисуем тени закруглений в конце сегментов
    if (shouldDrawRoundShadow) {
      // Создаем временный canvas для теней закруглений
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        // Полностью сбрасываем контекст временного canvas
        tempCtx.shadowColor = 'transparent';
        tempCtx.shadowBlur = 0;
        tempCtx.shadowOffsetX = 0;
        tempCtx.shadowOffsetY = 0;
        tempCtx.globalAlpha = 1;
        tempCtx.filter = 'none';
        tempCtx.globalCompositeOperation = 'source-over';
        
        for (let i = segments.length - 1; i >= 0; i--) {
          const segment = segments[i];
          
          // Рисуем тень закругления в конце (ПЕРЕД основным кругом)
          drawRoundShadow(
            tempCtx,
            centerX,
            centerY,
            innerRadius,
            outerRadius,
            roundSize,
            segment.endAngle,
            roundShadowBlur,
            roundShadowColor,
            1, // Передаем 1, чтобы избежать двойного применения roundShadowOpacity
            roundShadowOffset,
            segments,
            i,
            roundShadowProgress,
            roundShadowOpacity
          );
        }
        
        // Копируем результат на основной canvas
        ctx.drawImage(tempCanvas, 0, 0);
      }
    }
    
    // Очищаем центр круга после отрисовки теней закруглений
    if (shouldDrawRoundShadow) {
      ctx.globalCompositeOperation = 'destination-out';
      
      // Очищаем центральную область (внутри innerRadius)
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      
      // Очищаем область ЗА внешним кругом (после outerRadius)
      // Создаем кольцо от outerRadius до очень большого радиуса
      const largeRadius = Math.max(canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(centerX, centerY, largeRadius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2, true); // Обратное направление
      ctx.fillStyle = '#000000';
      ctx.fill();
      
      ctx.globalCompositeOperation = 'source-over';
    }
    
    // Рисуем основную тень графика после всех очисток
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
          shadowOffset,
          mainShadowProgressValue
        );
      }
    }
    
    // Теперь рисуем тени закруглений ПОСЛЕ основных теней сегментов
    if (shouldDrawRoundShadow) {
      // Создаем временный canvas для теней закруглений
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        // Полностью сбрасываем контекст временного canvas
        tempCtx.shadowColor = 'transparent';
        tempCtx.shadowBlur = 0;
        tempCtx.shadowOffsetX = 0;
        tempCtx.shadowOffsetY = 0;
        tempCtx.globalAlpha = 1;
        tempCtx.filter = 'none';
        tempCtx.globalCompositeOperation = 'source-over';
        
        // Рисуем тени закруглений в начале сегментов
        for (let i = segments.length - 1; i >= 0; i--) {
          const segment = segments[i];
          
          // У первого сегмента (i === 0) не должно быть тени
          if (i !== 0) {
            drawRoundShadow(
              tempCtx,
              centerX,
              centerY,
              innerRadius,
              outerRadius,
              roundSize,
              segment.startAngle,
              roundShadowBlur,
              roundShadowColor,
              roundShadowOpacity,
              roundShadowOffset,
              segments,
              i,
              roundShadowProgress,
              roundShadowOpacity
            );
          }
        }
        
        // Рисуем тени закруглений в конце сегментов
        for (let i = segments.length - 1; i >= 0; i--) {
          const segment = segments[i];
          
          drawRoundShadow(
            tempCtx,
            centerX,
            centerY,
            innerRadius,
            outerRadius,
            roundSize,
            segment.endAngle,
            roundShadowBlur,
            roundShadowColor,
            1,
            roundShadowOffset,
            segments,
            i,
            roundShadowProgress,
            roundShadowOpacity
          );
        }
        
        // Копируем результат на основной canvas
        ctx.drawImage(tempCanvas, 0, 0);
      }
    }
    
    
    // Затем рисуем основные закругления в конце сегментов
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
      
             // Позиции иконок вычисляются в отдельном useEffect
     }
       }, [adjustedData, centerX, centerY, innerRadius, outerRadius, roundSize, shadowBlur, shadowOffset, roundShadowBlur, roundShadowColor, roundShadowOpacity, roundShadowOffset, roundShadowMode, roundShadowAnimationDuration, data, shadowMode]);

  // Вычисляем позиции иконок один раз при изменении данных
  useEffect(() => {
    // Вычисляем сегменты так же, как в drawChart
    let currentAngle = -Math.PI / 2; // Начинаем с -90 градусов
    const segments = [];
    
    for (let i = 0; i < adjustedData.length; i++) {
      const item = adjustedData[i];
      const startAngle = currentAngle;
      const endAngle = currentAngle + item.angle;
      
      segments.push({
        startAngle,
        endAngle,
        color: item.color,
        label: item.label
      });
      
      currentAngle = endAngle;
    }
    
    const positions = segments.map((segment, i) => {
      // Вычисляем позицию закругления в конце сегмента
      const endLabelPos = {
        x: centerX + Math.cos(segment.endAngle) * (innerRadius + roundSize),
        y: centerY + Math.sin(segment.endAngle) * (innerRadius + roundSize),
        angle: segment.endAngle
      };
      
      return {
        x: endLabelPos.x,
        y: endLabelPos.y,
        label: segment.label,
        iconUrl: data[i]?.iconUrl
      };
    });
    
    setIconPositions(positions);
  }, [adjustedData, centerX, centerY, innerRadius, roundSize, data]);

  // Вычисляем позиции лейблов сегментов
  useEffect(() => {
    if (!showSegmentLabels) {
      setSegmentLabelPositions([]);
      return;
    }

    // Вычисляем сегменты так же, как в drawChart
    let currentAngle = -Math.PI / 2; // Начинаем с -90 градусов
    const segments = [];
    
    for (let i = 0; i < adjustedData.length; i++) {
      const item = adjustedData[i];
      const originalItem = data[i]; // Используем исходные данные для получения value
      const startAngle = currentAngle;
      const endAngle = currentAngle + item.angle;
      
      segments.push({
        startAngle,
        endAngle,
        color: item.color,
        label: item.label,
        value: originalItem ? originalItem.value : 0
      });
      
      currentAngle = endAngle;
    }
    
    const positions = segments.map((segment, i) => {
      // Вычисляем центр сегмента
      const midAngle = (segment.startAngle + segment.endAngle) / 2;
      const labelX = centerX + Math.cos(midAngle) * segmentLabelDistance;
      const labelY = centerY + Math.sin(midAngle) * segmentLabelDistance;
      
      // Определяем текст лейбла
      let labelText = '';
      if (segmentLabelType === 'percentage') {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const percentage = ((segment.value / total) * 100).toFixed(1);
        labelText = `${percentage}%`;
      } else if (segmentLabelType === 'value') {
        labelText = segment.value.toString();
      } else if (segmentLabelType === 'custom' && segmentLabels && segmentLabels[i]) {
        labelText = segmentLabels[i];
      } else {
        labelText = segment.label;
      }
      
      return {
        x: labelX,
        y: labelY,
        label: labelText,
        angle: midAngle
      };
    });
    
    setSegmentLabelPositions(positions);
  }, [adjustedData, centerX, centerY, segmentLabelDistance, showSegmentLabels, segmentLabelType, segmentLabels]);

  // Анимация только при первом рендере
  useEffect(() => {
    if (!isInitialRender) {
      drawChart(1, 0, 0, 1);
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
      
      drawChart(progress, 0, 0, 0);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsInitialRender(false);
      }
    }

    animate();
  }, [adjustedData, centerX, centerY, innerRadius, outerRadius, roundSize, minSegmentAngle, shadowBlur, shadowOffset, roundShadowBlur, roundShadowColor, roundShadowOpacity, roundShadowOffset, roundShadowMode, roundShadowAnimationDuration, animationDuration, animationEasing, isInitialRender]);

  // Единая анимация для всех теней
  React.useEffect(() => {
    if (isInitialRender) {
      return;
    }

    // Определяем, нужно ли анимировать тени
    const needsMainShadowAnimation = shadowMode === 'after-animation';
    const needsRoundShadowAnimation = roundShadowMode === 'after-animation';
    const needsRoundShadowWithMain = roundShadowMode === 'always';
    
    if (!needsMainShadowAnimation && !needsRoundShadowAnimation && !needsRoundShadowWithMain) {
      // Если анимация не нужна, сразу отрисовываем финальное состояние
      const finalMainShadowProgress = shadowMode === 'always' ? 1 : 0;
      const finalRoundShadowProgress = roundShadowMode === 'disabled' ? 0 : 1;
      drawChart(1, finalRoundShadowProgress, finalMainShadowProgress, 1);
      
      // Показываем иконки сразу
      setShowIcons(true);
      return;
    }

    // Показываем иконки мгновенно
    setShowIcons(true);

    // Анимация теней начинается сразу
    let mainShadowProgress = 0;
    let roundShadowProgress = 0;
    const shadowStartTime = Date.now();
    
    // Используем максимальную длительность анимации
    const mainShadowDuration = needsMainShadowAnimation ? animationDuration : 0;
    const roundShadowDuration = needsRoundShadowAnimation ? roundShadowAnimationDuration : 0;
    const maxDuration = Math.max(mainShadowDuration, roundShadowDuration);

    const animateShadows = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - shadowStartTime;
      
      // Вычисляем прогресс для каждой анимации
      if (needsMainShadowAnimation) {
        const rawProgress = Math.min(elapsed / mainShadowDuration, 1);
        mainShadowProgress = shadowEasing(rawProgress);
      } else {
        mainShadowProgress = shadowMode === 'always' ? 1 : 0;
      }
      
      if (needsRoundShadowAnimation) {
        const rawProgress = Math.min(elapsed / roundShadowDuration, 1);
        roundShadowProgress = shadowEasing(rawProgress);
      } else if (needsRoundShadowWithMain) {
        // Для режима 'always' тени закруглений анимируются вместе с основной анимацией
        roundShadowProgress = 1; // Всегда полная прозрачность, так как анимация уже завершена
      } else {
        roundShadowProgress = 0;
      }
      
      // Перерисовываем с новым прогрессом всех теней
      drawChart(1, roundShadowProgress, mainShadowProgress, 0);
      
      if (elapsed < maxDuration) {
        requestAnimationFrame(animateShadows);
      } else {
        // После завершения всех анимаций теней
        const finalMainShadowProgress = shadowMode === 'always' ? 1 : (needsMainShadowAnimation ? 1 : 0);
        const finalRoundShadowProgress = roundShadowMode === 'always' ? 1 : (needsRoundShadowAnimation ? 1 : 0);
        drawChart(1, finalRoundShadowProgress, finalMainShadowProgress, 0);
      }
    };

    animateShadows();
  }, [isInitialRender, shadowMode, roundShadowMode, animationDuration, roundShadowAnimationDuration, drawChart]);

  // Перерисовка при изменении выбранного сегмента
  useEffect(() => {
    if (!isInitialRender) {
      // После завершения всех анимаций отрисовываем финальное состояние
      const finalMainShadowProgress = shadowMode === 'always' ? 1 : 0;
      const finalRoundShadowProgress = roundShadowMode === 'always' ? 1 : 0;
      drawChart(1, finalRoundShadowProgress, finalMainShadowProgress, 1);
    }
  }, [drawChart, isInitialRender, shadowMode, roundShadowMode]);

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
    <div style={{ position: 'relative', display: 'inline-block' }}>
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        backgroundColor: 'transparent',
        borderRadius: '8px',
        }}
      />
      {/* HTML элементы для иконок с настраиваемой CSS анимацией */}
      {iconPositions.map((icon, index) => (
        <div
          key={index}
          style={{
            ...getIconAnimationStyles(iconAnimationType),
            left: icon.x - 10,
            top: icon.y - 10,
            ...(showIcons ? getIconVisibleStyles(iconAnimationType) : {}),
          }}
        >
          {icon.iconUrl ? (
            <img
              src={icon.iconUrl}
              alt={icon.label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            icon.label.charAt(0)
          )}
        </div>
      ))}
      
      {/* HTML элементы для лейблов сегментов */}
      {segmentLabelPositions.map((label, index) => (
        <div
          key={`segment-label-${index}`}
          style={{
            ...getIconAnimationStyles(iconAnimationType),
            position: 'absolute',
            left: label.x - 20,
            top: label.y - 10,
            color: '#333',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 10,
            textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
            ...(showIcons ? getIconVisibleStyles(iconAnimationType) : {}),
          }}
        >
          {label.label}
        </div>
      ))}
    </div>
  );
}; 