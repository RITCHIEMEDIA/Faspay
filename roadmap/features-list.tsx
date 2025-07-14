export interface Feature {
  id: string
  name: string
  description: string
  priority: "Critical" | "High" | "Medium" | "Low"
  complexity: "Simple" | "Medium" | "Complex" | "Very Complex"
  estimatedWeeks: number
  dependencies: string[]
  phase: "Phase 1" | "Phase 2" | "Phase 3" | "Phase 4"
  category: "Core Banking" | "Security" | "UX/UI" | "Advanced Features" | "Business" | "Integrations"
}

export const faspayFeatures: Feature[] = [
  // PHASE 1: MVP Core Features (Weeks 1-12)
  {
    id: "F001",
    name: "Transaction History & Analytics",
    description:
      "Comprehensive transaction history with search, filtering, categorization, and spending analytics with charts and insights.",
    priority: "Critical",
    complexity: "Medium",
    estimatedWeeks: 3,
    dependencies: [],
    phase: "Phase 1",
    category: "Core Banking",
  },
  {
    id: "F002",
    name: "Push Notifications System",
    description:
      "Real-time push notifications for transactions, security alerts, payment requests, and account updates with customizable preferences.",
    priority: "Critical",
    complexity: "Medium",
    estimatedWeeks: 2,
    dependencies: [],
    phase: "Phase 1",
    category: "UX/UI",
  },
  {
    id: "F003",
    name: "Biometric Authentication",
    description: "Fingerprint, Face ID, and voice recognition for secure app access and transaction authorization.",
    priority: "High",
    complexity: "Complex",
    estimatedWeeks: 4,
    dependencies: [],
    phase: "Phase 1",
    category: "Security",
  },
  {
    id: "F004",
    name: "Virtual & Physical Card Management",
    description:
      "Create, manage, freeze/unfreeze virtual cards, order physical cards, set spending limits, and view card transactions.",
    priority: "Critical",
    complexity: "Complex",
    estimatedWeeks: 5,
    dependencies: [],
    phase: "Phase 1",
    category: "Core Banking",
  },
  {
    id: "F005",
    name: "Bill Pay & Recurring Payments",
    description:
      "Pay bills, set up recurring payments, manage payees, and schedule future payments with automatic reminders.",
    priority: "High",
    complexity: "Complex",
    estimatedWeeks: 4,
    dependencies: ["F001"],
    phase: "Phase 1",
    category: "Core Banking",
  },

  // PHASE 2: Enhanced Security & User Experience (Weeks 13-24)
  {
    id: "F006",
    name: "Two-Factor Authentication (2FA)",
    description: "SMS, email, and authenticator app-based 2FA for enhanced account security with backup codes.",
    priority: "Critical",
    complexity: "Medium",
    estimatedWeeks: 2,
    dependencies: ["F003"],
    phase: "Phase 2",
    category: "Security",
  },
  {
    id: "F007",
    name: "Fraud Detection & Monitoring",
    description:
      "AI-powered fraud detection, suspicious activity alerts, transaction blocking, and security scoring system.",
    priority: "Critical",
    complexity: "Very Complex",
    estimatedWeeks: 6,
    dependencies: ["F001", "F006"],
    phase: "Phase 2",
    category: "Security",
  },
  {
    id: "F008",
    name: "Savings Goals & Budgeting",
    description:
      "Create savings goals, budget tracking, spending categories, financial insights, and automated savings rules.",
    priority: "High",
    complexity: "Complex",
    estimatedWeeks: 4,
    dependencies: ["F001"],
    phase: "Phase 2",
    category: "Advanced Features",
  },
  {
    id: "F009",
    name: "International Money Transfers",
    description: "Send money globally with competitive exchange rates, transfer tracking, and multi-currency support.",
    priority: "High",
    complexity: "Very Complex",
    estimatedWeeks: 6,
    dependencies: ["F004"],
    phase: "Phase 2",
    category: "Core Banking",
  },
  {
    id: "F010",
    name: "Advanced Search & Filters",
    description:
      "Powerful search across transactions, contacts, and account data with smart filters and saved searches.",
    priority: "Medium",
    complexity: "Medium",
    estimatedWeeks: 2,
    dependencies: ["F001"],
    phase: "Phase 2",
    category: "UX/UI",
  },

  // PHASE 3: Advanced Financial Features (Weeks 25-36)
  {
    id: "F011",
    name: "Investment Platform Integration",
    description:
      "Basic investment features, portfolio tracking, stock/crypto trading, and investment insights within the banking app.",
    priority: "Medium",
    complexity: "Very Complex",
    estimatedWeeks: 8,
    dependencies: ["F008"],
    phase: "Phase 3",
    category: "Advanced Features",
  },
  {
    id: "F012",
    name: "Loan & Credit Services",
    description:
      "Personal loans, credit score monitoring, loan applications, payment tracking, and credit building tools.",
    priority: "High",
    complexity: "Very Complex",
    estimatedWeeks: 7,
    dependencies: ["F007", "F008"],
    phase: "Phase 3",
    category: "Advanced Features",
  },
  {
    id: "F013",
    name: "Merchant Payment Solutions",
    description:
      "QR code payments, NFC payments, merchant directory, cashback rewards, and loyalty program integration.",
    priority: "High",
    complexity: "Complex",
    estimatedWeeks: 5,
    dependencies: ["F004", "F009"],
    phase: "Phase 3",
    category: "Core Banking",
  },
  {
    id: "F014",
    name: "AI Financial Assistant",
    description: "Chatbot for customer support, financial advice, spending insights, and personalized recommendations.",
    priority: "Medium",
    complexity: "Very Complex",
    estimatedWeeks: 6,
    dependencies: ["F008", "F001"],
    phase: "Phase 3",
    category: "Advanced Features",
  },
  {
    id: "F015",
    name: "Multi-Account Management",
    description:
      "Multiple account types (checking, savings, business), account switching, and consolidated dashboard view.",
    priority: "High",
    complexity: "Complex",
    estimatedWeeks: 4,
    dependencies: ["F008"],
    phase: "Phase 3",
    category: "Core Banking",
  },

  // PHASE 4: Business Features & Advanced Integrations (Weeks 37-48)
  {
    id: "F016",
    name: "Business Banking Suite",
    description: "Business accounts, payroll management, expense tracking, invoicing, and team member access controls.",
    priority: "Medium",
    complexity: "Very Complex",
    estimatedWeeks: 8,
    dependencies: ["F015", "F013"],
    phase: "Phase 4",
    category: "Business",
  },
  {
    id: "F017",
    name: "API & Developer Platform",
    description:
      "Public APIs for third-party integrations, developer portal, webhooks, and SDK for mobile/web applications.",
    priority: "Medium",
    complexity: "Complex",
    estimatedWeeks: 5,
    dependencies: ["F007"],
    phase: "Phase 4",
    category: "Integrations",
  },
  {
    id: "F018",
    name: "Advanced Analytics Dashboard",
    description:
      "Comprehensive financial analytics, spending patterns, income analysis, and predictive financial insights.",
    priority: "Medium",
    complexity: "Complex",
    estimatedWeeks: 4,
    dependencies: ["F014", "F008"],
    phase: "Phase 4",
    category: "Advanced Features",
  },
  {
    id: "F019",
    name: "Cryptocurrency Integration",
    description: "Buy, sell, and store cryptocurrencies, crypto-to-fiat conversion, and crypto payment options.",
    priority: "Low",
    complexity: "Very Complex",
    estimatedWeeks: 6,
    dependencies: ["F011", "F009"],
    phase: "Phase 4",
    category: "Advanced Features",
  },
  {
    id: "F020",
    name: "White-Label Banking Solution",
    description:
      "Customizable banking platform for other businesses, multi-tenant architecture, and brand customization tools.",
    priority: "Low",
    complexity: "Very Complex",
    estimatedWeeks: 10,
    dependencies: ["F016", "F017"],
    phase: "Phase 4",
    category: "Business",
  },
]
