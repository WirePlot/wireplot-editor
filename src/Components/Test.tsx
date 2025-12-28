import React, { useState } from 'react';

const ResizableComponent: React.FC = () => {
  const [widths, setWidths] = useState([31.67, 31.67, 31.66]); // Initial widths in vw
  const [heights, setHeights] = useState([50, 50]); // Initial heights in vh for the middle panel
  const [activeVerticalHandle, setActiveVerticalHandle] = useState<number | null>(null);
  const [activeHorizontalHandle, setActiveHorizontalHandle] = useState<number | null>(null);

  const handleMouseDown = (index: number, isVertical: boolean = true) => (event: React.MouseEvent): void => {
    if (isVertical) {
      setActiveVerticalHandle(index);
    } else {
      setActiveHorizontalHandle(index);
    }
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidths = [...widths];
    const startHeights = [...heights];

    const handleMouseMove = (moveEvent: MouseEvent): void => {
      if (isVertical) {
        const deltaX = moveEvent.clientX - startX;
        const deltaVw = (deltaX / window.innerWidth) * 100; // Convert pixels to vw
        const newWidths = [...startWidths];
        newWidths[index] += deltaVw;
        newWidths[index + 1] -= deltaVw;

        // Ensure the widths do not go below 5vw
        if (newWidths[index] < 5) {
          newWidths[index + 1] += newWidths[index] - 5;
          newWidths[index] = 5;
        } else if (newWidths[index + 1] < 5) {
          newWidths[index] += newWidths[index + 1] - 5;
          newWidths[index + 1] = 5;
        }

        // Ensure the total width does not exceed 95vw
        const totalWidth = newWidths.reduce((acc, width) => acc + width, 0);
        if (totalWidth > 95) {
          const scaleFactor = 95 / totalWidth;
          const adjustedWidths = newWidths.map(width => width * scaleFactor);
          setWidths(adjustedWidths);
        } else {
          setWidths(newWidths);
        }
      } else {
        const deltaY = moveEvent.clientY - startY;
        const deltaVh = (deltaY / window.innerHeight) * 100; // Convert pixels to vh
        const newHeights = [...startHeights];
        newHeights[index] += deltaVh;
        newHeights[index + 1] -= deltaVh;

        // Ensure the heights do not go below 5vh
        if (newHeights[index] < 5) {
          newHeights[index + 1] += newHeights[index] - 5;
          newHeights[index] = 5;
        } else if (newHeights[index + 1] < 5) {
          newHeights[index] += newHeights[index + 1] - 5;
          newHeights[index + 1] = 5;
        }

        // Ensure the total height is always 100vh
        const totalHeight = newHeights.reduce((acc, height) => acc + height, 0);
        const scaleFactor = 100 / totalHeight;
        const adjustedHeights = newHeights.map(height => height * scaleFactor);

        setHeights(adjustedHeights);
      }
    };

    const handleMouseUp = (): void => {
      setActiveVerticalHandle(null);
      setActiveHorizontalHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {widths.map((width, index) => (
        <React.Fragment key={index}>
          {index === 1 ? (
            <div style={{ width: `${width}vw`, display: 'flex', flexDirection: 'column' }}>
              {heights.map((height, subIndex) => (
                <React.Fragment key={subIndex}>
                  <div style={{
                    height: `${height}vh`,
                    border: '1px solid black',
                    padding: '10px',
                    boxSizing: 'border-box'
                  }}>
                    Component 2.{subIndex + 1}
                  </div>
                  {subIndex < heights.length - 1 && (
                    <div
                      style={{
                        height: '10px',
                        cursor: 'ns-resize',
                        backgroundColor: activeHorizontalHandle === subIndex ? 'orange' : '#ccc',
                        transition: 'background-color 0.3s'
                      }}
                      onMouseDown={handleMouseDown(subIndex, false)}
                      onMouseEnter={() => setActiveHorizontalHandle(subIndex)}
                      onMouseLeave={() => setActiveHorizontalHandle(null)}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div style={{
              width: `${width}vw`,
              border: '1px solid black',
              padding: '10px',
              boxSizing: 'border-box'
            }}>
              Component {index + 1}
            </div>
          )}
          {index < widths.length - 1 && (
            <div
              style={{
                width: '10px',
                cursor: 'ew-resize',
                backgroundColor: activeVerticalHandle === index ? 'orange' : '#ccc',
                transition: 'background-color 0.3s'
              }}
              onMouseDown={handleMouseDown(index)}
              onMouseEnter={() => setActiveVerticalHandle(index)}
              onMouseLeave={() => setActiveVerticalHandle(null)}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ResizableComponent;
