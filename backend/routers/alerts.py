from io import BytesIO

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from gtts import gTTS


router = APIRouter(prefix="/alerts", tags=["Alerts"])

TRANSLATIONS = {
    "en": "Emergency alert: {disaster} risk is {risk_level}. Please move to a safe shelter.",
    "ta": "அவசர எச்சரிக்கை: {disaster} ஆபத்து {risk_level}. பாதுகாப்பான தங்குமிடத்திற்கு செல்லவும்.",
    "hi": "आपातकालीन चेतावनी: {disaster} का जोखिम {risk_level} है। सुरक्षित आश्रय में जाएं।",
    "te": "అత్యవసర హెచ్చరిక: {disaster} ప్రమాదం {risk_level}. సురక్షిత ఆశ్రయానికి వెళ్లండి.",
    "kn": "ತುರ್ತು ಎಚ್ಚರಿಕೆ: {disaster} ಅಪಾಯ {risk_level} ಆಗಿದೆ. ಸುರಕ್ಷಿತ ಆಶ್ರಯಕ್ಕೆ ತೆರಳಿ.",
    "ml": "അടിയന്തര മുന്നറിയിപ്പ്: {disaster} അപകടസാധ്യത {risk_level}. സുരക്ഷിത അഭയകേന്ദ്രത്തിലേക്ക് മാറുക.",
}

DISASTER_NAMES = {
    "en": {"flood": "flood", "cyclone": "cyclone", "heatwave": "heatwave"},
    "ta": {"flood": "வெள்ளம்", "cyclone": "சூறாவளி", "heatwave": "வெப்ப அலை"},
    "hi": {"flood": "बाढ़", "cyclone": "चक्रवात", "heatwave": "लू"},
    "te": {"flood": "వరద", "cyclone": "తుఫాను", "heatwave": "వడగాడ్పు"},
    "kn": {"flood": "ಪ್ರವಾಹ", "cyclone": "ಚಂಡಮಾರುತ", "heatwave": "ಉಷ್ಣ ಅಲೆ"},
    "ml": {"flood": "വെള്ളപ്പൊക്കം", "cyclone": "ചുഴലിക്കാറ്റ്", "heatwave": "ഉഷ്ണതരംഗം"},
}

RISK_LEVELS = {
    "en": {"low": "low", "moderate": "moderate", "high": "high", "critical": "critical"},
    "ta": {"low": "குறைவு", "moderate": "மிதமான", "high": "அதிகம்", "critical": "மிகவும் ஆபத்தான"},
    "hi": {"low": "कम", "moderate": "मध्यम", "high": "उच्च", "critical": "गंभीर"},
    "te": {"low": "తక్కువ", "moderate": "మోస్తరు", "high": "అధిక", "critical": "అత్యంత ప్రమాదకర"},
    "kn": {"low": "ಕಡಿಮೆ", "moderate": "ಮಧ್ಯಮ", "high": "ಹೆಚ್ಚು", "critical": "ಗಂಭೀರ"},
    "ml": {"low": "കുറഞ്ഞ", "moderate": "മിതമായ", "high": "ഉയർന്ന", "critical": "അതീവ ഗുരുതര"},
}

TTS_LANGUAGES = {
    "en": "en",
    "ta": "ta",
    "hi": "hi",
    "te": "te",
    "kn": "kn",
    "ml": "ml",
}


@router.post("/translate")
def translate_alert(disaster: str, risk_level: str, language: str = "en"):
    language = language.lower()
    selected_language = language if language in TRANSLATIONS else "en"
    template = TRANSLATIONS[selected_language]
    disaster_key = disaster.lower().replace(" ", "")
    level_key = risk_level.lower()
    localized_disaster = DISASTER_NAMES[selected_language].get(disaster_key, disaster)
    localized_level = RISK_LEVELS[selected_language].get(level_key, risk_level)
    text = template.format(disaster=localized_disaster, risk_level=localized_level)
    return {
        "language": selected_language,
        "text": text,
        "speech_supported": True,
        "speech_text": text,
    }


@router.get("/speech")
def alert_speech(text: str, language: str = "en"):
    selected_language = language.lower()
    if selected_language not in TTS_LANGUAGES:
        selected_language = "en"

    audio = BytesIO()
    try:
        gTTS(text=text, lang=TTS_LANGUAGES[selected_language], tld="co.in").write_to_fp(audio)
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Language voice service unavailable: {error}",
        ) from error

    audio.seek(0)
    return StreamingResponse(audio, media_type="audio/mpeg")
