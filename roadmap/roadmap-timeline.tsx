"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Users, Zap, Shield, TrendingUp, Building, Puzzle } from "lucide-react"
import { faspayFeatures } from "./features-list"

const phaseIcons = {
  "Phase 1": Calendar,
  "Phase 2": Shield,
  "Phase 3": TrendingUp,
  "Phase 4": Building,
}

const categoryIcons = {
  "Core Banking": Zap,
  Security: Shield,
  "UX/UI": Users,
  "Advanced Features": TrendingUp,
  Business: Building,
  Integrations: Puzzle,
}

const priorityColors = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
}

const complexityColors = {
  Simple: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Complex: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "Very Complex": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function FaspayRoadmap() {
  const phases = ["Phase 1", "Phase 2", "Phase 3", "Phase 4"] as const

  const getPhaseFeatures = (phase: string) => faspayFeatures.filter((feature) => feature.phase === phase)

  const getTotalWeeks = (phase: string) =>
    getPhaseFeatures(phase).reduce((total, feature) => total + feature.estimatedWeeks, 0)

  const getPhaseDescription = (phase: string) => {
    const descriptions = {
      "Phase 1": "MVP Core Features - Essential banking functionality and security",
      "Phase 2": "Enhanced Security & UX - Advanced security features and user experience improvements",
      "Phase 3": "Advanced Financial Features - Investment, loans, and AI-powered features",
      "Phase 4": "Business & Integrations - Enterprise features and third-party integrations",
    }
    return descriptions[phase as keyof typeof descriptions]
  }

  const getPhaseTimeline = (phase: string) => {
    const timelines = {
      "Phase 1": "Weeks 1-12 (Q1 2024)",
      "Phase 2": "Weeks 13-24 (Q2 2024)",
      "Phase 3": "Weeks 25-36 (Q3 2024)",
      "Phase 4": "Weeks 37-48 (Q4 2024)",
    }
    return timelines[phase as keyof typeof timelines]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <span className="text-black font-bold text-2xl">F</span>
          </div>
          <h1 className="text-4xl font-bold gold-text-gradient">Faspay Development Roadmap</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive 48-week development plan to build the most advanced digital banking platform
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary">20</div>
              <p className="text-sm text-muted-foreground">Total Features</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary">48</div>
              <p className="text-sm text-muted-foreground">Development Weeks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary">4</div>
              <p className="text-sm text-muted-foreground">Development Phases</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary">6</div>
              <p className="text-sm text-muted-foreground">Feature Categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Phase Breakdown */}
        {phases.map((phase, phaseIndex) => {
          const PhaseIcon = phaseIcons[phase]
          const phaseFeatures = getPhaseFeatures(phase)
          const totalWeeks = getTotalWeeks(phase)

          return (
            <Card key={phase} className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <PhaseIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{phase}</CardTitle>
                      <CardDescription>{getPhaseDescription(phase)}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{getPhaseTimeline(phase)}</div>
                    <div className="text-xs text-muted-foreground">{totalWeeks} weeks total</div>
                  </div>
                </div>
                <Progress value={(phaseIndex + 1) * 25} className="mt-4" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {phaseFeatures.map((feature) => {
                    const CategoryIcon = categoryIcons[feature.category]

                    return (
                      <Card key={feature.id} className="border-muted">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <CategoryIcon className="h-4 w-4 text-primary" />
                              <CardTitle className="text-sm">{feature.name}</CardTitle>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${priorityColors[feature.priority]}`} />
                              <span className="text-xs text-muted-foreground">{feature.priority}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{feature.estimatedWeeks}w</span>
                            </div>
                            <Badge variant="secondary" className={complexityColors[feature.complexity]}>
                              {feature.complexity}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Category:</span>
                            <Badge variant="outline" className="text-xs">
                              {feature.category}
                            </Badge>
                          </div>

                          {feature.dependencies.length > 0 && (
                            <div className="pt-2 border-t">
                              <span className="text-xs text-muted-foreground">Dependencies:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {feature.dependencies.map((dep) => (
                                  <Badge key={dep} variant="outline" className="text-xs">
                                    {dep}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Implementation Strategy */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">Implementation Strategy</CardTitle>
            <CardDescription>Key principles and approaches for successful delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-primary">Development Approach</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Agile methodology with 2-week sprints</li>
                  <li>• Continuous integration and deployment</li>
                  <li>• Test-driven development (TDD)</li>
                  <li>• Code reviews and pair programming</li>
                  <li>• Regular security audits and penetration testing</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-primary">Quality Assurance</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Automated testing at all levels</li>
                  <li>• User acceptance testing (UAT)</li>
                  <li>• Performance and load testing</li>
                  <li>• Accessibility compliance (WCAG 2.1)</li>
                  <li>• Cross-platform compatibility testing</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-primary">Risk Management</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Regular dependency updates and security patches</li>
                  <li>• Backup and disaster recovery planning</li>
                  <li>• Compliance with banking regulations</li>
                  <li>• Data privacy and GDPR compliance</li>
                  <li>• Scalability planning and monitoring</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-primary">Success Metrics</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• User adoption and engagement rates</li>
                  <li>• Transaction success rates &gt;99.9%</li>
                  <li>• App performance (load time &lt;2s)</li>
                  <li>• Customer satisfaction scores</li>
                  <li>• Security incident response time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">Recommended Technology Stack</CardTitle>
            <CardDescription>Modern, scalable technologies for enterprise-grade banking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-primary">Frontend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Framework:</span>
                    <span className="text-muted-foreground">Next.js 14+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UI Library:</span>
                    <span className="text-muted-foreground">shadcn/ui + Tailwind</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State Management:</span>
                    <span className="text-muted-foreground">Zustand/Redux Toolkit</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PWA:</span>
                    <span className="text-muted-foreground">Workbox + Service Workers</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-primary">Backend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Runtime:</span>
                    <span className="text-muted-foreground">Node.js + TypeScript</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database:</span>
                    <span className="text-muted-foreground">PostgreSQL + Redis</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ORM:</span>
                    <span className="text-muted-foreground">Prisma/Drizzle</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Authentication:</span>
                    <span className="text-muted-foreground">NextAuth.js/Supabase Auth</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-primary">Infrastructure</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hosting:</span>
                    <span className="text-muted-foreground">Vercel/AWS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database:</span>
                    <span className="text-muted-foreground">Supabase/Neon</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monitoring:</span>
                    <span className="text-muted-foreground">Sentry + Analytics</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CI/CD:</span>
                    <span className="text-muted-foreground">GitHub Actions</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
