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
          <tr>
            <th>NAME</th>
            <th>PRE</th>
            <th>FIRED</th>
          </tr>
          {Object.values(COLOR_LOOKUP).map(({ label, before, after }) => (
            <tr key={label}>
              <td>
                {label}
              </td>
              <td style={{ backgroundColor: before, width: '50px', height: '20px' }} />
              <td style={{ backgroundColor: after, width: '50px', height: '20px' }} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ColorsPage;
