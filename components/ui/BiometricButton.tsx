export default function BiometricButton({ onSuccess }: { onSuccess: () => void }) {
  // This uses the WebAuthn API for fingerprint/biometric auth (mobile browsers)
  const handleBiometric = async () => {
    if (!window.PublicKeyCredential) {
      alert("Biometric authentication not supported on this device.")
      return
    }
    try {
      // This is a demo; in production, use proper WebAuthn registration & verification
      await navigator.credentials.get({ publicKey: {/* ... */} })
      onSuccess()
    } catch {
      alert("Biometric authentication failed.")
    }
  }

  return (
    <button className="btn btn-secondary w-full mt-2" onClick={handleBiometric}>
      Use Fingerprint / Biometric
    </button>
  )
}