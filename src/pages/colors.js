import React from 'react';
import COLOR_LOOKUP from '../data/ColorLookup';

function ColorsPage() {
  return (
    <div style={{ backgroundColor: '#DDD' }}>
      <h3>
        Color tools
      </h3>
      <table>
        <tbody>
          <tr style={{ backgroundColor: 'white' }}>
            <th>NAME</th>
            <th>UNFIRED</th>
            <th>FIRED</th>
          </tr>
          {Object.values(COLOR_LOOKUP).map(({ label, before, after }) => (
            <tr key={label}>
              <td>
                {label}
              </td>
              <td style={{ backgroundColor: before, width: '120px', height: '20px' }}>
                {before}
              </td>
              <td style={{ backgroundColor: after, width: '120px', height: '20px' }}>
                {after}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ColorsPage;
