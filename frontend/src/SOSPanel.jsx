import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";


function SOSPanel() {

  const [people, setPeople] = useState(1);

  const [children, setChildren] = useState(0);

  const [elderly, setElderly] = useState(0);

  const [medical, setMedical] = useState(false);

  const [description, setDescription] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [result, setResult] =
    useState(null);


  // ==========================================
  // SEND SOS
  // ==========================================

  async function sendSOS() {

    setSending(true);

    setResult(null);


    try {

      // --------------------------------------
      // Get GPS
      // --------------------------------------

      navigator.geolocation.getCurrentPosition(

        async position => {

          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;


          const params =
            new URLSearchParams({

              latitude,

              longitude,

              people_count:
                people,

              children,

              elderly,

              medical_emergency:
                medical,

              description

            });


          const response =
            await fetch(
              `${API}/api/sos/create?${params}`,
              {
                method: "POST"
              }
            );


          const data =
            await response.json();


          setResult(data);

          setSending(false);

        },

        error => {

          console.error(error);

          setResult({

            message:
              "Unable to get GPS location."

          });

          setSending(false);

        }

      );

    }

    catch (error) {

      console.error(error);

      setResult({

        message:
          "Failed to send SOS."

      });

      setSending(false);

    }

  }


  return (

    <div className="sos-panel">

      <div className="sos-title">

        <div className="sos-big-icon">
          🆘
        </div>

        <div>

          <h2>
            Emergency SOS
          </h2>

          <p>
            Send your location to the
            disaster command center.
          </p>

        </div>

      </div>


      {/* =====================================
          PEOPLE
      ====================================== */}

      <label>
        Number of people
      </label>

      <input

        type="number"

        min="1"

        value={people}

        onChange={e =>
          setPeople(
            Number(e.target.value)
          )
        }

      />


      {/* =====================================
          CHILDREN
      ====================================== */}

      <label>
        Children
      </label>

      <input

        type="number"

        min="0"

        value={children}

        onChange={e =>
          setChildren(
            Number(e.target.value)
          )
        }

      />


      {/* =====================================
          ELDERLY
      ====================================== */}

      <label>
        Elderly people
      </label>

      <input

        type="number"

        min="0"

        value={elderly}

        onChange={e =>
          setElderly(
            Number(e.target.value)
          )
        }

      />


      {/* =====================================
          MEDICAL
      ====================================== */}

      <label className="checkbox">

        <input

          type="checkbox"

          checked={medical}

          onChange={e =>
            setMedical(
              e.target.checked
            )
          }

        />

        Medical emergency

      </label>


      {/* =====================================
          DESCRIPTION
      ====================================== */}

      <label>
        Emergency description
      </label>

      <textarea

        placeholder="Describe your emergency..."

        value={description}

        onChange={e =>
          setDescription(
            e.target.value
          )
        }

      />


      {/* =====================================
          BUTTON
      ====================================== */}

      <button

        className="sos-button"

        disabled={sending}

        onClick={sendSOS}

      >

        {sending
          ? "📡 Sending SOS..."
          : "🆘 SEND SOS"}

      </button>


      {/* =====================================
          RESULT
      ====================================== */}

      {result && (

        <div className="sos-result">

          {result.sos_id ? (

            <>

              <strong>
                ✅ SOS Sent Successfully
              </strong>

              <p>
                SOS ID: #{result.sos_id}
              </p>

              <p>
                Priority:
                {" "}
                {result.priority_score}
              </p>

            </>

          ) : (

            <strong>
              ⚠️ {result.message}
            </strong>

          )}

        </div>

      )}

    </div>

  );

}


export default SOSPanel;