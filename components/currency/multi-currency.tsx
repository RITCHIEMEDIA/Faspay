"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, RefreshCw, Globe, DollarSign } from "lucide-react"

interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
}

interface ExchangeRate {
  from: string
  to: string
  rate: number
  lastUpdated: string
}

interface CurrencyBalance {
  currency: string
  balance: number
  usdValue: number
}

const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "BTC", name: "Bitcoin", symbol: "₿", flag: "₿" },
]

interface MultiCurrencyProps {
  userId: string
  primaryBalance: number
}

export function MultiCurrency({ userId, primaryBalance }: MultiCurrencyProps) {
  const [balances, setBalances] = useState<CurrencyBalance[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [amount, setAmount] = useState("")
  const [convertedAmount, setConvertedAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    loadCurrencyData()
    fetchExchangeRates()
  }, [userId])

  useEffect(() => {
    calculateConversion()
  }, [amount, fromCurrency, toCurrency, exchangeRates])

  const loadCurrencyData = () => {
    const stored = localStorage.getItem(`faspay_currencies_${userId}`)
    if (stored) {
      setBalances(JSON.parse(stored))
    } else {
      // Initialize with USD balance
      const initialBalances: CurrencyBalance[] = [
        {
          currency: "USD",
          balance: primaryBalance,
          usdValue: primaryBalance,
        },
      ]
      setBalances(initialBalances)
      localStorage.setItem(`faspay_currencies_${userId}`, JSON.stringify(initialBalances))
    }
  }

  const fetchExchangeRates = async () => {
    setIsLoading(true)

    // Simulate API call with realistic exchange rates
    setTimeout(() => {
      const mockRates: ExchangeRate[] = [
        { from: "USD", to: "EUR", rate: 0.85, lastUpdated: new Date().toISOString() },
        { from: "USD", to: "GBP", rate: 0.73, lastUpdated: new Date().toISOString() },
        { from: "USD", to: "JPY", rate: 110.25, lastUpdated: new Date().toISOString() },
        { from: "USD", to: "CAD", rate: 1.25, lastUpdated: new Date().toISOString() },
        { from: "USD", to: "AUD", rate: 1.35, lastUpdated: new Date().toISOString() },
        { from: "USD", to: "CHF", rate: 0.92, lastUpdated: new Date().toISOString() },
        { from: "USD", to: "CNY", rate: 6.45, lastUpdated: new Date().toISOString() },
        { from: "USD", to: "INR", rate: 74.5, lastUpdated: new Date().toISOString() },
        { from: "USD", to: "BTC", rate: 0.000023, lastUpdated: new Date().toISOString() },
      ]

      setExchangeRates(mockRates)
      setLastUpdated(new Date().toISOString())
      setIsLoading(false)
    }, 1000)
  }

  const calculateConversion = () => {
    if (!amount || !exchangeRates.length) {
      setConvertedAmount(0)
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum)) {
      setConvertedAmount(0)
      return
    }

    if (fromCurrency === toCurrency) {
      setConvertedAmount(amountNum)
      return
    }

    // Find exchange rate
    let rate = 1
    const directRate = exchangeRates.find((r) => r.from === fromCurrency && r.to === toCurrency)
    const reverseRate = exchangeRates.find((r) => r.from === toCurrency && r.to === fromCurrency)

    if (directRate) {
      rate = directRate.rate
    } else if (reverseRate) {
      rate = 1 / reverseRate.rate
    } else {
      // Convert through USD
      const fromUsdRate = exchangeRates.find((r) => r.from === "USD" && r.to === fromCurrency)
      const toUsdRate = exchangeRates.find((r) => r.from === "USD" && r.to === toCurrency)

      if (fromUsdRate && toUsdRate) {
        rate = toUsdRate.rate / fromUsdRate.rate
      }
    }

    setConvertedAmount(amountNum * rate)
  }

  const performExchange = async () => {
    if (!amount || convertedAmount === 0) return

    setIsLoading(true)

    // Simulate exchange transaction
    setTimeout(() => {
      const amountNum = Number.parseFloat(amount)

      // Update balances
      const updatedBalances = balances.map((balance) => {
        if (balance.currency === fromCurrency) {
          return { ...balance, balance: balance.balance - amountNum }
        }
        if (balance.currency === toCurrency) {
          return { ...balance, balance: balance.balance + convertedAmount }
        }
        return balance
      })

      // Add new currency balance if it doesn't exist
      if (!updatedBalances.find((b) => b.currency === toCurrency)) {
        const usdRate = exchangeRates.find((r) => r.from === "USD" && r.to === toCurrency)?.rate || 1
        updatedBalances.push({
          currency: toCurrency,
          balance: convertedAmount,
          usdValue: convertedAmount / usdRate,
        })
      }

      setBalances(updatedBalances)
      localStorage.setItem(`faspay_currencies_${userId}`, JSON.stringify(updatedBalances))

      setAmount("")
      setConvertedAmount(0)
      setIsLoading(false)
    }, 1500)
  }

  const formatCurrency = (amount: number, currencyCode: string) => {
    const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode)
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode === "BTC" ? "USD" : currencyCode,
      minimumFractionDigits: currencyCode === "BTC" ? 8 : 2,
      maximumFractionDigits: currencyCode === "BTC" ? 8 : 2,
    })
      .format(amount)
      .replace("$", currency?.symbol || "$")
  }

  const getCurrencyInfo = (code: string) => {
    return SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0]
  }

  const getTotalUsdValue = () => {
    return balances.reduce((total, balance) => {
      if (balance.currency === "USD") return total + balance.balance

      const rate = exchangeRates.find((r) => r.from === "USD" && r.to === balance.currency)?.rate || 1
      return total + balance.balance / rate
    }, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Multi-Currency Wallet</h2>
          <p className="text-muted-foreground">Manage multiple currencies and exchange rates</p>
        </div>
        <Button onClick={fetchExchangeRates} disabled={isLoading} variant="outline" className="bg-transparent">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Rates
        </Button>
      </div>

      {/* Total Portfolio Value */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <p className="text-3xl font-bold">{formatCurrency(getTotalUsdValue(), "USD")}</p>
              <p className="text-xs text-muted-foreground">
                Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Never"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Balances</CardTitle>
          <CardDescription>Your balances across different currencies</CardDescription>
        </CardHeader>
        <CardContent>
          {balances.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No currency balances found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {balances.map((balance) => {
                const currency = getCurrencyInfo(balance.currency)
                const usdRate = exchangeRates.find((r) => r.from === "USD" && r.to === balance.currency)?.rate || 1
                const usdValue = balance.currency === "USD" ? balance.balance : balance.balance / usdRate

                return (
                  <div key={balance.currency} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{currency.flag}</span>
                      <div>
                        <p className="font-semibold">{currency.name}</p>
                        <p className="text-sm text-muted-foreground">{currency.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(balance.balance, balance.currency)}</p>
                      {balance.currency !== "USD" && (
                        <p className="text-sm text-muted-foreground">≈ {formatCurrency(usdValue, "USD")}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currency Exchange */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Exchange</CardTitle>
          <CardDescription>Convert between different currencies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Currency</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center space-x-2">
                        <span>{currency.flag}</span>
                        <span>
                          {currency.code} - {currency.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To Currency</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center space-x-2">
                        <span>{currency.flag}</span>
                        <span>
                          {currency.code} - {currency.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount to Exchange</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          {convertedAmount > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">You'll receive</p>
                  <p className="text-2xl font-bold">{formatCurrency(convertedAmount, toCurrency)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Exchange rate</p>
                  <p className="font-medium">
                    1 {fromCurrency} = {(convertedAmount / Number.parseFloat(amount || "1")).toFixed(6)} {toCurrency}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={performExchange}
            disabled={!amount || convertedAmount === 0 || isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-black"
          >
            {isLoading ? "Processing Exchange..." : "Exchange Currency"}
          </Button>
        </CardContent>
      </Card>

      {/* Exchange Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Current Exchange Rates</CardTitle>
          <CardDescription>Live exchange rates (USD base)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exchangeRates.map((rate) => {
              const currency = getCurrencyInfo(rate.to)
              const previousRate = rate.rate * (0.98 + Math.random() * 0.04) // Simulate previous rate
              const change = ((rate.rate - previousRate) / previousRate) * 100

              return (
                <div key={`${rate.from}-${rate.to}`} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span>{currency.flag}</span>
                      <span className="font-medium">{rate.to}</span>
                    </div>
                    <Badge variant={change >= 0 ? "default" : "destructive"}>
                      {change >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(change).toFixed(2)}%
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">{rate.rate.toFixed(rate.to === "BTC" ? 8 : 4)}</p>
                  <p className="text-xs text-muted-foreground">
                    1 USD = {rate.rate.toFixed(rate.to === "BTC" ? 8 : 4)} {rate.to}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
