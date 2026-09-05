import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const DEFAULT_LOCATION = { latitude: 11.75, longitude: 79.76 };

function OperationsPanel({ result }) {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [weather, setWeather] = useState(null);
  const [impact, setImpact] = useState(null);
  const [shelter, setShelter] = useState(null);
  const [route, setRoute] = useState(null);
  const [alert, setAlert] = useState(null);
  const [language, setLanguage] = useState("en");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [adminReply, setAdminReply] = useState("");
  const [sosStatus, setSosStatus] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    const socketUrl = `${API.replace(/^http/, "ws")}/api/messages/ws/1`;
    const socket = new WebSocket(socketUrl);
    socket.onmessage = (event) => {
      const item = JSON.parse(event.data);
      setMessages((current) => current.some((message) => message.id === item.id) ? current : [...current, item]);
    };
    return () => socket.close();
  }, []);

  useEffect(() => {
    const socketUrl = `${API.replace(/^http/, "ws")}/api/sos/ws`;
    const socket = new WebSocket(socketUrl);
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.event === "new_sos") {
        setSosStatus(`SOS #${payload.sos.sos_id} sent automatically to responders.`);
      }
    };
    return () => socket.close();
  }, []);

  const request = async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Request failed");
    return data;
  };

  const loadWeather = async () => {
    setBusy("weather");
    try {
      setWeather(await request(`/api/weather/current?latitude=${location.latitude}&longitude=${location.longitude}`));
    } catch (error) { setWeather({ error: error.message }); }
    finally { setBusy(""); }
  };

  const estimateImpact = async () => {
    if (!result) return;
    setBusy("impact");
    try {
      setImpact(await request(`/api/impact/estimate?risk_percentage=${result.risk_percentage}&population=1000&shelters_capacity=500`, { method: "POST" }));
    } catch (error) { setImpact({ error: error.message }); }
    finally { setBusy(""); }
  };

  const findShelter = async () => {
    setBusy("shelter");
    try {
      setShelter(await request(`/api/shelters/recommend?latitude=${location.latitude}&longitude=${location.longitude}`));
    } catch (error) { setShelter({ error: error.message }); }
    finally { setBusy(""); }
  };

  const findRoute = async () => {
    setBusy("route");
    try {
      setRoute(await request(`/api/routes/safe?start_latitude=${location.latitude}&start_longitude=${location.longitude}&destination_latitude=11.75&destination_longitude=79.76`));
    } catch (error) { setRoute({ error: error.message }); }
    finally { setBusy(""); }
  };

  const createAlert = async () => {
    if (!result) return;
    setBusy("alert");
    try {
      setAlert(await request(`/api/alerts/translate?disaster=${encodeURIComponent(result.predicted_disaster)}&risk_level=${result.risk_level}&language=${language}`, { method: "POST" }));
    } catch (error) { setAlert({ error: error.message }); }
    finally { setBusy(""); }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    setBusy("message");
    try {
      const item = await request(`/api/messages/?user_id=1&sender=citizen&message=${encodeURIComponent(message)}&priority=high`, { method: "POST" });
      setMessages((current) => [...current, item]);
      setMessage("");
    } catch (error) { setMessages([{ message: error.message }]); }
    finally { setBusy(""); }
  };

  const loadMessages = async () => {
    try {
      const data = await request("/api/messages/1");
      setMessages(data.messages || []);
    } catch (error) { setMessages([{ message: error.message }]); }
  };

  const sendAdminReply = async () => {
    if (!adminReply.trim()) return;
    setBusy("reply");
    try {
      const item = await request(`/api/messages/reply?user_id=1&message=${encodeURIComponent(adminReply)}`, { method: "POST" });
      setMessages((current) => [...current, item]);
      setAdminReply("");
    } catch (error) { setMessages([{ message: error.message }]); }
    finally { setBusy(""); }
  };

  const sendVoiceSos = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSosStatus("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN";
    recognition.onresult = async (event) => {
      const description = event.results[0][0].transcript;
      try {
        const response = await request(`/api/sos/create?latitude=${location.latitude}&longitude=${location.longitude}&people_count=1&medical_emergency=false&description=${encodeURIComponent(description)}`, { method: "POST" });
        setSosStatus(`SOS #${response.sos_id} sent. ${description}`);
      } catch (error) { setSosStatus(error.message); }
    };
    recognition.onerror = () => setSosStatus("Could not understand the voice request.");
    recognition.start();
    setSosStatus("Listening for your emergency description...");
  };

  return (
    <section className="operations-panel">
      <div className="section-heading">
        <div><p className="eyebrow">Response center</p><h2>Emergency Operations</h2></div>
        <label className="location-input">Latitude <input type="number" value={location.latitude} onChange={(event) => setLocation({ ...location, latitude: Number(event.target.value) })} /></label>
        <label className="location-input">Longitude <input type="number" value={location.longitude} onChange={(event) => setLocation({ ...location, longitude: Number(event.target.value) })} /></label>
      </div>

      <div className="operations-grid">
        <article className="operation-card"><h3>Live Weather</h3><p>Fetch current conditions for the response location.</p><button onClick={loadWeather}>{busy === "weather" ? "Loading..." : "Get live weather"}</button>{weather && (weather.error ? <p className="inline-error">{weather.error}</p> : <p>{weather.weather.temperature}°C · {weather.weather.humidity}% humidity · {weather.weather.wind_speed} km/h wind</p>)}</article>
        <article className="operation-card"><h3>Impact Analysis</h3><p>Estimate people, shelter, medical and supply needs.</p><button disabled={!result} onClick={estimateImpact}>{busy === "impact" ? "Calculating..." : "Estimate impact"}</button>{impact && (impact.error ? <p className="inline-error">{impact.error}</p> : <p>{impact.estimated_population_affected} people affected · {impact.shelters_required} shelters required</p>)}</article>
        <article className="operation-card"><h3>Smart Shelter</h3><p>Rank open shelters by capacity, safety and distance.</p><button onClick={findShelter}>{busy === "shelter" ? "Searching..." : "Find safest shelter"}</button>{shelter && (shelter.error ? <p className="inline-error">{shelter.error}</p> : <p>{shelter.recommendations?.[0]?.name || "No open shelter found"}</p>)}</article>
        <article className="operation-card"><h3>Safe Route</h3><p>Check the route for known danger zones.</p><button onClick={findRoute}>{busy === "route" ? "Checking..." : "Check safe route"}</button>{route && (route.error ? <p className="inline-error">{route.error}</p> : <p>{route.message || `${route.route?.distance_km} km · ${route.route?.estimated_time_minutes} min`}</p>)}</article>
        <article className="operation-card"><h3>Multilingual Alert</h3><p>Translate the latest AI warning and read it aloud.</p><div className="control-row"><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="en">English</option><option value="ta">Tamil</option><option value="hi">Hindi</option><option value="te">Telugu</option></select><button disabled={!result} onClick={createAlert}>{busy === "alert" ? "..." : "Create alert"}</button></div>{alert && (alert.error ? <p className="inline-error">{alert.error}</p> : <><p>{alert.text}</p><button className="secondary-button" onClick={() => window.speechSynthesis?.speak(new SpeechSynthesisUtterance(alert.speech_text))}>🔊 Speak alert</button></>)}</article>
        <article className="operation-card sos-card"><h3>Voice SOS</h3><p>Speak your emergency description and send your location.</p><button className="sos-button" onClick={sendVoiceSos}>🎙️ Start voice SOS</button>{sosStatus && <p>{sosStatus}</p>}</article>
        <article className="operation-card message-card"><h3>Admin ↔ User Chat</h3><p>Command Center inbox and citizen conversation.</p><div className="control-row"><button onClick={loadMessages}>Refresh inbox</button><span>{messages.filter((item) => item.sender === "citizen" && !item.is_read).length} unread</span></div>{messages.map((item, index) => <p key={`${item.id || "message"}-${index}`} className={`chat-message ${item.priority || "normal"}`}>{item.sender === "admin" ? "Admin" : `Citizen #${item.user_id}`}: {item.message}</p>)}<div className="control-row"><input value={message} placeholder="Citizen message" onChange={(event) => setMessage(event.target.value)} /><button onClick={sendMessage}>{busy === "message" ? "..." : "Send"}</button></div><div className="control-row"><input value={adminReply} placeholder="Admin reply" onChange={(event) => setAdminReply(event.target.value)} /><button onClick={sendAdminReply}>{busy === "reply" ? "..." : "Reply"}</button></div></article>
      </div>
    </section>
  );
}

export default OperationsPanel;
