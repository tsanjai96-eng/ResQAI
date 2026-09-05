import { useState } from "react";


function PredictionForm({ onPredict }) {


  const [formData, setFormData] = useState({

    rainfall: 150,

    temperature: 30,

    humidity: 85,

    wind_speed: 60,

    pressure: 1005,

    river_level: 5,

    elevation: 20

  });


  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };


  const handleSubmit = (e) => {

    e.preventDefault();


    const numericData = {

      rainfall:

        Number(formData.rainfall),

      temperature:

        Number(formData.temperature),

      humidity:

        Number(formData.humidity),

      wind_speed:

        Number(formData.wind_speed),

      pressure:

        Number(formData.pressure),

      river_level:

        Number(formData.river_level),

      elevation:

        Number(formData.elevation)

    };


    onPredict(

      numericData

    );

  };


  return (

    <div className="prediction-card">


      <div className="card-header">

        <h2>

          🌍 Live Environmental Data

        </h2>

        <p>

          Enter current disaster indicators

        </p>

      </div>


      <form

        onSubmit={handleSubmit}

      >


        <div className="input-grid">


          <div className="input-group">

            <label>

              Rainfall (mm)

            </label>

            <input

              type="number"

              name="rainfall"

              value={formData.rainfall}

              onChange={handleChange}

              required

            />

          </div>


          <div className="input-group">

            <label>

              Temperature (°C)

            </label>

            <input

              type="number"

              name="temperature"

              value={formData.temperature}

              onChange={handleChange}

              required

            />

          </div>


          <div className="input-group">

            <label>

              Humidity (%)

            </label>

            <input

              type="number"

              name="humidity"

              value={formData.humidity}

              onChange={handleChange}

              required

            />

          </div>


          <div className="input-group">

            <label>

              Wind Speed (km/h)

            </label>

            <input

              type="number"

              name="wind_speed"

              value={formData.wind_speed}

              onChange={handleChange}

              required

            />

          </div>


          <div className="input-group">

            <label>

              Pressure (hPa)

            </label>

            <input

              type="number"

              name="pressure"

              value={formData.pressure}

              onChange={handleChange}

              required

            />

          </div>


          <div className="input-group">

            <label>

              River Level (m)

            </label>

            <input

              type="number"

              step="0.1"

              name="river_level"

              value={formData.river_level}

              onChange={handleChange}

              required

            />

          </div>


          <div className="input-group">

            <label>

              Elevation (m)

            </label>

            <input

              type="number"

              name="elevation"

              value={formData.elevation}

              onChange={handleChange}

              required

            />

          </div>


        </div>


        <button

          type="submit"

          className="predict-button"

        >

          🧠 Predict Disaster

        </button>


      </form>


    </div>

  );

}


export default PredictionForm;