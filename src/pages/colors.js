import React from 'react';
import COLOR_LOOKUP from '../data/ColorLookup';

function ColorsPage() {
  return (
    <div style={{ backgroundColor: '#DDD', pointerEvents: 'all' }}>
      <h3>
        Color tools
      </h3>
      <table>
        <tbody>
          <tr style={{ backgroundColor: 'white' }}>
            <th>NAME</th>
            <th>UNFIRED</th>
            <th>PBN.FIRED</th>
            <th>ATM.FIRED</th>
            <th>ROOKWOOD</th>
          </tr>
          {Object.values(COLOR_LOOKUP).map(({
            label, before, after, atomizerAfter, rookwoodTarget,
          }) => (
            <tr key={label}>
              <td>
                {label}
              </td>
              <td style={{
                backgroundColor: before, width: '120px', height: '20px', userSelect: 'text',
              }}
              >
                {before}
              </td>
              <td style={{
                backgroundColor: after, width: '120px', height: '20px', userSelect: 'text',
              }}
              >
                {after}
              </td>
              <td style={{
                backgroundColor: atomizerAfter, width: '120px', height: '20px', userSelect: 'text',
              }}
              >
                {atomizerAfter}
              </td>
              <td style={{
                backgroundColor: rookwoodTarget, width: '120px', height: '20px', userSelect: 'text',
              }}
              >
                {rookwoodTarget}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ColorsPage;
