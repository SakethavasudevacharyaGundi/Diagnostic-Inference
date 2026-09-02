import React, { useState } from 'react';

const LabForm = ({ onSubmit, isLoading }) => {
  const [labs, setLabs] = useState([
    { test_name: '', value: '', unit: '' }
  ]);

  const DEMO_PAYLOAD = [
    { test_name: "Hemoglobin", value: "14.0", unit: "g/dL" },
    { test_name: "Hemoglobin", value: "11.0", unit: "g/dL" },
    { test_name: "Hemoglobin", value: "5.0", unit: "g/dL" },
    { test_name: "Trombosit", value: "500.0", unit: "10^3/uL" },
    { test_name: "Trombosit", value: "50.0", unit: "10^3/uL" },
    { test_name: "Potassium", value: "4.5", unit: "mmol/L" },
    { test_name: "Potassium", value: "2.0", unit: "mmol/L" },
    { test_name: "UnknownTestName", value: "100.0", unit: "unknown" },
    { test_name: "Hemoglobin", value: "-500.0", unit: "g/dL" },
    { test_name: "Hemoglobin", value: "12.0", unit: "g/dL" }
  ];

  const handleAddRow = () => {
    setLabs([...labs, { test_name: '', value: '', unit: '' }]);
  };

  const handleRemoveRow = (index) => {
    const newLabs = labs.filter((_, i) => i !== index);
    setLabs(newLabs.length ? newLabs : [{ test_name: '', value: '', unit: '' }]);
  };

  const handleChange = (index, field, val) => {
    const newLabs = [...labs];
    newLabs[index][field] = val;
    setLabs(newLabs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out completely empty rows
    const validLabs = labs.filter(l => l.test_name || l.value || l.unit).map(l => ({
      ...l,
      value: parseFloat(l.value) || 0 // Parse strictly to float
    }));
    onSubmit(validLabs);
  };

  return (
    <div className="form-container">
      <div className="flex-between">
        <h2>Enter Lab Results</h2>
        <button 
          type="button" 
          onClick={() => setLabs(DEMO_PAYLOAD)}
          className="btn btn-outline"
        >
          Load 10-Test Demo Matrix
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {labs.map((lab, idx) => (
          <div key={idx} className="form-row">
            <input
              type="text"
              placeholder="Test Name (e.g. Hemoglobin)"
              className="form-input"
              value={lab.test_name}
              onChange={(e) => handleChange(idx, 'test_name', e.target.value)}
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Value"
              className="form-input"
              value={lab.value}
              onChange={(e) => handleChange(idx, 'value', e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Unit (e.g. g/dL)"
              className="form-input"
              value={lab.unit}
              onChange={(e) => handleChange(idx, 'unit', e.target.value)}
              required
            />
            <button 
              type="button" 
              onClick={() => handleRemoveRow(idx)}
              className="btn btn-danger"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}

        <div className="flex-between" style={{ marginTop: '1rem' }}>
          <button type="button" onClick={handleAddRow} className="btn btn-outline">
            + Add Another Test
          </button>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? <div className="spinner"></div> : "Analyze Results"}
        </button>
      </form>
    </div>
  );
};

export default LabForm;
