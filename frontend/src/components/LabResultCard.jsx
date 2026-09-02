import React from 'react';

const LabResultCard = ({ result }) => {
  const { test_name, value, unit, ref, reference_source, status, explanation, next_step } = result;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="test-name">{test_name}</h3>
          {reference_source && (
            <span className="source-tag">
              Source: {reference_source}
            </span>
          )}
        </div>
        <span className={`badge badge-${status}`}>
          {status === 'Critical' && '🔴 '}
          {status === 'Warning' && '🟡 '}
          {status === 'Normal' && '🟢 '}
          {status === 'Invalid' && '⚠️ '}
          {status === 'Unknown' && '⚪ '}
          {status}
        </span>
      </div>
      
      <div className="card-body">
        <div className="stat-group">
          <span className="stat-label">Measured Value</span>
          <span className="stat-value">{value} <span className="stat-subtext">{unit}</span></span>
        </div>
        <div className="stat-group">
          <span className="stat-label">Reference Range</span>
          <span className="stat-value">
            {ref && ref.min !== undefined && ref.max !== undefined 
              ? `${ref.min} - ${ref.max}` 
              : 'N/A'} 
            {ref ? ` ${ref.unit || ''}` : ''}
          </span>
        </div>
      </div>
      
      <div className="card-footer">
        <div className="explanation-title">Clinical Explanation</div>
        <div className="explanation-text">{explanation}</div>
        
        <div className="explanation-title" style={{ marginTop: '1.25rem' }}>Suggested Next Step</div>
        <div className="next-step">{next_step}</div>
      </div>
    </div>
  );
};

export default LabResultCard;
