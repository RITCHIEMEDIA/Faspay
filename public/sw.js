const CACHE_NAME = "faspay-v1.2.0"
const urlsToCache = [
  "/",
  "/dashboard",
  "/auth/login",
  "/auth/signup",
  "/dashboard/send",
  "/dashboard/receive",
  "/dashboard/history",
  "/dashboard/cards",
  "/dashboard/settings",
  "/admin",
  "/admin/auth",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/apple-touch-icon.png",
]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache")
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log("Service worker installed and cache populated")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Cache installation failed:", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith("http")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        console.log("Serving from cache:", event.request.url)
        return response
      }

      console.log("Fetching from network:", event.request.url)
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch((error) => {
          console.error("Fetch failed:", error)

          // Return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return (
              caches.match("/offline.html") ||
              new Response("Offline", {
                status: 503,
                statusText: "Service Unavailable",
              })
            )
          }

          throw error
        })
    }),
  )
})

// Push notification event
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event)

  let notificationData = {
    title: "Faspay Notification",
    body: "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: "faspay-notification",
    requireInteraction: false,
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/icon-192x192.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
    data: {
      url: "/dashboard",
    },
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = { ...notificationData, ...data }
    } catch (error) {
      console.error("Error parsing push data:", error)
      notificationData.body = event.data.text() || notificationData.body
    }
  }

  event.waitUntil(self.registration.showNotification(notificationData.title, notificationData))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event)

  event.notification.close()

  if (event.action === "dismiss") {
    return
  }

  const urlToOpen = event.notification.data?.url || "/dashboard"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus()
        }
      }

      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    }),
  )
})

// Background sync event
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag)

  if (event.tag === "background-sync-transactions") {
    event.waitUntil(syncTransactions())
  }
})

// Sync transactions function
async function syncTransactions() {
  try {
    console.log("Syncing transactions...")

    // Get pending transactions from IndexedDB or localStorage
    const pendingTransactions = await getPendingTransactions()

    for (const transaction of pendingTransactions) {
      try {
        // Attempt to sync transaction with server
        const response = await fetch("/api/transactions/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transaction),
        })

        if (response.ok) {
          // Remove from pending list
          await removePendingTransaction(transaction.id)
          console.log("Transaction synced:", transaction.id)
        }
      } catch (error) {
        console.error("Failed to sync transaction:", transaction.id, error)
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error)
  }
}

// Helper functions for transaction sync
async function getPendingTransactions() {
  // In a real app, this would read from IndexedDB
  // For demo purposes, return empty array
  return []
}

async function removePendingTransaction(transactionId) {
  // In a real app, this would remove from IndexedDB
  console.log("Removing pending transaction:", transactionId)
}

// Message event for communication with main thread
self.addEventListener("message", (event) => {
  console.log("Service worker received message:", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// Error event
self.addEventListener("error", (event) => {
  console.error("Service worker error:", event.error)
})

// Unhandled rejection event
self.addEventListener("unhandledrejection", (event) => {
  console.error("Service worker unhandled rejection:", event.reason)
})

console.log("Faspay Service Worker loaded successfully")
