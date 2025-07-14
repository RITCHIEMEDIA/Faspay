import { ArrowRight, Shield, Smartphone, Zap, CreditCard, Users, Globe } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-black font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold gold-text-gradient">Faspay</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link href="#services" className="text-sm font-medium hover:text-primary transition-colors">
              Services
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-black">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Banking Made <span className="gold-text-gradient">Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the future of digital banking with Faspay. Send money, manage your finances, and grow your wealth
            with our secure, user-friendly platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-black w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Why Choose Faspay?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built with cutting-edge technology and designed for the modern user
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Bank-Level Security</CardTitle>
              <CardDescription>
                Your money and data are protected with enterprise-grade encryption and security protocols.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Instant Transfers</CardTitle>
              <CardDescription>
                Send and receive money instantly with real-time balance updates and notifications.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <Smartphone className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Mobile First</CardTitle>
              <CardDescription>Optimized for mobile devices with a Progressive Web App experience.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="container px-4 py-16 bg-muted/30">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need for modern digital banking</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CreditCard className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Digital Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Store, send, and receive money with our secure digital wallet. Track all your transactions in real-time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>P2P Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Send money to friends and family instantly using just their phone number or email address.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Global Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Send money internationally with competitive exchange rates and low fees.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Smartphone className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Mobile Banking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Full banking experience on your mobile device with our Progressive Web App technology.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">About Faspay</h2>
            <p className="text-xl text-muted-foreground">Revolutionizing digital banking for the modern world</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                At Faspay, we believe banking should be simple, secure, and accessible to everyone. We're building the
                future of digital finance with cutting-edge technology and user-centric design.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our platform combines the security of traditional banking with the convenience of modern technology,
                providing you with a seamless financial experience that fits your lifestyle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-black">Join Faspay Today</Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">F</span>
                  </div>
                  <h4 className="text-xl font-semibold">Trusted by thousands</h4>
                  <p className="text-sm text-muted-foreground">Join our growing community of satisfied customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Banking with Faspay?</h2>
          <p className="text-muted-foreground">
            Join thousands of users who trust Faspay for their digital banking needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-black w-full sm:w-auto">
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-black font-bold text-sm">F</span>
              </div>
              <span className="font-semibold">Faspay</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Support
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">© 2024 Faspay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
