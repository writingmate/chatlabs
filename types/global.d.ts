declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
