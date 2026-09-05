function PredictionResult({ result }) {

  if (!result) {
    return null;
  }

  const getRiskClass = (probability) => {
    if (probability >= 80) {
      return "critical";
    }
    if (probability >= 60) {
      return "high";
    }
    if (probability >= 30) {
      return "moderate";
    }
    return "low";
  };

  const getDisasterIcon = (disaster) => {
    const icons = {
      "FLOOD": "🌊",
      "CYCLONE": "🌀",
      "HEATWAVE": "🔥",
      "SEVERE STORM": "⛈️"
    };
    return icons[disaster] || "⚠️";
  };

  // Get probability value - handle different response formats
  const probability = result.risk_percentage ?? result.flood_probability ?? result.confidence ?? 0;
  const riskClass = getRiskClass(probability);
  const disaster = result.predicted_disaster || result.disaster || "UNKNOWN";
  const riskLevel = result.risk_level || "UNKNOWN";

  return (
    <div className="prediction-result">

      <div className={`main-risk ${riskClass}`}>

        <div className="disaster-icon">
          {getDisasterIcon(disaster)}
        </div>

        <div>
          <p>Disaster Prediction</p>
          <h1>{disaster}</h1>
        </div>

      </div>

      <div className="risk-percentage">
        <h2>{probability.toFixed(1)}%</h2>
        <p>Risk Probability</p>
      </div>

      <div className="risk-level">
        Risk Level: <strong className={riskClass}>{riskLevel}</strong>
      </div>

      {result.all_risks && (
        <div className="all-risks">
          <h3>All Disaster Risks</h3>
          {Object.entries(result.all_risks).map(([name, value]) => {
            const itemClass = getRiskClass(value);
            return (
              <div className="risk-item" key={name}>
                <div className="risk-label">
                  <span>{name.toUpperCase()}</span>
                  <strong>{Number(value).toFixed(1)}%</strong>
                </div>
                <div className="progress">
                  <div
                    className={`progress-fill ${name}`}
                    style={{ width: `${Math.min(Number(value), 100)}%` }}
                  />
                </div>
                <small className={itemClass}>{itemClass.toUpperCase()}</small>
              </div>
            );
          })}
        </div>
      )}

      <h3>📋 Input Parameters</h3>
      <div className="input-summary">
        {result.input && (
          <table>
            <tbody>
              <tr>
                <td>Rainfall:</td>
                <td>{result.input.rainfall} mm</td>
              </tr>
              <tr>
                <td>Temperature:</td>
                <td>{result.input.temperature}°C</td>
              </tr>
              <tr>
                <td>Humidity:</td>
                <td>{result.input.humidity}%</td>
              </tr>
              <tr>
                <td>Wind Speed:</td>
                <td>{result.input.wind_speed} km/h</td>
              </tr>
              <tr>
                <td>Pressure:</td>
                <td>{result.input.pressure} mb</td>
              </tr>
              <tr>
                <td>River Level:</td>
                <td>{result.input.river_level} m</td>
              </tr>
              <tr>
                <td>Elevation:</td>
                <td>{result.input.elevation} m</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <div className={`status-banner ${riskClass}`}>
        {riskLevel === "CRITICAL" && "🚨 CRITICAL ALERT - Take immediate action!"}
        {riskLevel === "HIGH" && "⚠️ HIGH RISK - Take preventive measures"}
        {riskLevel === "MODERATE" && "⚡ MODERATE - Stay alert and monitor"}
        {riskLevel === "LOW" && "✅ LOW RISK - Conditions are safe"}
      </div>

    </div>
  );
}

export default PredictionResult;