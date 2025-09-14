import { PieChartSector } from '../PieChart';

export type AdjustedDataItem = {
  name: string;
  percent: number;
  color: string;
  label: string;
  angle: number;
};

export type Segment = AdjustedDataItem & {
  startAngle: number;
  endAngle: number;
};

export type RoundPosition = {
  x: number;
  y: number;
  angle: number;
};

// Функции для отрисовки
export function drawSegmentWithoutRound(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  color: string
) {
  if (!ctx) return;
  
  // Основная часть сегмента (кольцо) без закругления
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
  ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawRoundEnd(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  innerRadius: number,
  roundSize: number,
  endAngle: number,
  color: string
): RoundPosition {
  if (!ctx) return { x: 0, y: 0, angle: 0 };
  
  // Закругление на конце сегмента
  const endX = centerX + Math.cos(endAngle) * (innerRadius + roundSize);
  const endY = centerY + Math.sin(endAngle) * (innerRadius + roundSize);
  
  ctx.beginPath();
  ctx.arc(endX, endY, roundSize, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  
  return { x: endX, y: endY, angle: endAngle };
}

export function drawRoundStart(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  innerRadius: number,
  roundSize: number,
  startAngle: number,
  color: string
): RoundPosition {
  if (!ctx) return { x: 0, y: 0, angle: 0 };
  
  // Закругление на начале сегмента
  const startX = centerX + Math.cos(startAngle) * (innerRadius + roundSize);
  const startY = centerY + Math.sin(startAngle) * (innerRadius + roundSize);
  
  ctx.beginPath();
  ctx.arc(startX, startY, roundSize, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  
  return { x: startX, y: startY, angle: startAngle };
}

export function drawSegmentShadow(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  color: string,
  shadowBlur: number,
  shadowOffset: number
) {
  if (!ctx) return;
  
  // Создаем тень с размытием и смещением
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = shadowOffset;
  ctx.globalAlpha = 0.5;
  
  // Рисуем сегмент для тени
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
  ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  
  ctx.restore();
}

// Функции для обработки данных
export function adjustData(
  data: PieChartSector[],
  minSegmentAngle: number
): AdjustedDataItem[] {
  const totalPercent = data.reduce((sum, item) => sum + item.value, 0);
  const originalData = data.map(item => ({
    name: item.label.charAt(0),
    percent: (item.value / totalPercent) * 100,
    color: item.color,
    label: item.label
  }));
  
  const adjustedData = originalData.map(item => {
    const angle = (item.percent / 100) * Math.PI * 2;
    return {
      ...item,
      angle: Math.max(angle, minSegmentAngle)
    };
  });
  
  // Пересчитываем углы после корректировки
  const totalAngle = adjustedData.reduce((sum, item) => sum + item.angle, 0);
  return adjustedData.map(item => ({
    ...item,
    angle: (item.angle / totalAngle) * Math.PI * 2
  }));
}

// Функции для обработки событий мыши
export function isPointInSegment(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  roundSize: number,
  adjustedData: AdjustedDataItem[]
): boolean {
  return getSegmentIndex(x, y, centerX, centerY, innerRadius, outerRadius, roundSize, adjustedData) !== -1;
}

export function getSegmentIndex(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  roundSize: number,
  adjustedData: AdjustedDataItem[]
): number {
  const dx = x - centerX;
  const dy = y - centerY;
  const r = Math.sqrt(dx * dx + dy * dy);
  
  // Проверяем, что точка находится в допустимом диапазоне радиусов
  if (r < innerRadius - roundSize || r > outerRadius + roundSize) return -1;
  
  let angle = Math.atan2(dy, dx);
  // Нормализуем угол к диапазону [-π/2, 3π/2]
  if (angle < -Math.PI / 2) angle += 2 * Math.PI;
  
  // Сегменты рисуются с -Math.PI/2 (12 часов)
  let currentAngle = -Math.PI / 2;
  
  // Вычисляем углы всех сегментов заранее
  const segmentAngles: Array<{start: number, end: number, index: number}> = [];
  for (let i = 0; i < adjustedData.length; i++) {
    const seg = adjustedData[i];
    const segAngle = seg.angle;
    
    const segmentStartAngle = currentAngle;
    const segmentEndAngle = currentAngle + segAngle;
    
    segmentAngles.push({
      start: segmentStartAngle,
      end: segmentEndAngle,
      index: i
    });
    
    currentAngle += segAngle;
  }
  
  // Проверяем сегменты в обычном порядке
  for (let i = 0; i < adjustedData.length; i++) {
    const seg = adjustedData[i];
    const segAngle = seg.angle;
    const segmentStartAngle = segmentAngles[i].start;
    
    // Расширяем область определения сегмента, включая закругления
    const segmentStartAngleWithRound = segmentStartAngle - (roundSize / (innerRadius + roundSize));
    const segmentEndAngleWithRound = segmentStartAngle + segAngle + (roundSize / (innerRadius + roundSize));
    
    // Проверяем, попадает ли угол в диапазон сегмента
    let isInSegment = angle >= segmentStartAngleWithRound && angle < segmentEndAngleWithRound;
    
    // Если это первый сегмент и точка попадает в него, проверяем пересечение с последним сегментом
    if (i === 0 && isInSegment) {
      const lastIndex = adjustedData.length - 1;
      const lastSegment = segmentAngles[lastIndex];
      const lastSegmentStartWithRound = lastSegment.start - (roundSize / (innerRadius + roundSize));
      const lastSegmentEndWithRound = lastSegment.end + (roundSize / (innerRadius + roundSize));
      
      // Проверяем, попадает ли точка в область последнего сегмента (с учетом перехода через 2π)
      const isInLastSegment = (angle >= lastSegmentStartWithRound && angle < lastSegmentEndWithRound) ||
                             (angle + 2 * Math.PI >= lastSegmentStartWithRound && angle + 2 * Math.PI < lastSegmentEndWithRound);
      
      // Если точка попадает в область последнего сегмента, возвращаем последний сегмент
      if (isInLastSegment) {
        return lastIndex;
      }
    }
    
    if (isInSegment) {
      return i;
    }
  }
  
  return -1;
}

// Функции для отрисовки текста и иконок
export function drawSegmentLabel(
  ctx: CanvasRenderingContext2D,
  endLabelPos: RoundPosition,
  segment: Segment,
  data: PieChartSector[],
  segmentIndex: number,
  progress: number
) {
  if (!ctx || progress < 1) return;
  
  if (data[segmentIndex]?.iconUrl) {
    const img = new Image();
    img.onload = () => {
      if (ctx) {
        const iconSize = 20;
        ctx.drawImage(
          img,
          endLabelPos.x - iconSize / 2,
          endLabelPos.y - iconSize / 2,
          iconSize,
          iconSize
        );
      }
    };
    img.src = data[segmentIndex].iconUrl!;
  } else {
    ctx.save();
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(segment.label.charAt(0), endLabelPos.x, endLabelPos.y);
    ctx.restore();
  }
}

export function drawSegmentText(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  outerRadius: number,
  endLabelPos: RoundPosition,
  segment: Segment,
  progress: number
) {
  if (!ctx || progress <= 0.8) return;
  
  // Проценты и названия (появляются позже)
  const percentX = centerX + Math.cos(endLabelPos.angle) * (outerRadius + 60);
  const percentY = centerY + Math.sin(endLabelPos.angle) * (outerRadius + 60);
  
  ctx.font = '14px Arial';
  ctx.fillStyle = '#333';
  ctx.fillText(segment.percent + '%', percentX, percentY);
  
  // Название категории
  const nameX = centerX + Math.cos(endLabelPos.angle) * (outerRadius + 90);
  const nameY = centerY + Math.sin(endLabelPos.angle) * (outerRadius + 90);
  
  ctx.font = '12px Arial';
  ctx.fillText(segment.label, nameX, nameY);
}
