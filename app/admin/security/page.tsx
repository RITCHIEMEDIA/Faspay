"use client"
export default function AdminSecurityPage() {
  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-bold mb-2">Security</h2>
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <p>Manage your PIN and biometric authentication here.</p>
        <a href="/admin/settings" className="btn btn-primary w-full">Go to Settings</a>
      </div>
    </div>
  )
}