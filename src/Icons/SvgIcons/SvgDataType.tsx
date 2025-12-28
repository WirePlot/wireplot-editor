import React from 'react';
import { ColorHelper } from '../../Helpers/ColorHelper';

interface SvgColoredRectProps {
  dataType: string;
}

const SvgDataType: React.FC<SvgColoredRectProps> = ({ dataType }) => (
  <svg
    width="18"
    height="8"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      margin: '0px 4px',
      borderRadius: '5px',
      backgroundColor: ColorHelper.getColorForSchema(dataType),
    }}
  >
    <rect width="18" height="28" rx="5" />
  </svg>
);

export default SvgDataType;
