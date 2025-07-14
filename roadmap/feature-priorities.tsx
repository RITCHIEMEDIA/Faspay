"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { faspayFeatures } from "./features-list"

export default function FeaturePriorities() {
  const priorityOrder = ["Critical", "High", "Medium", "Low"] as const

  const getFeaturesByPriority = (priority: string) => faspayFeatures.filter((feature) => feature.priority === priority)

  const getPriorityColor = (priority: string) => {
    const colors = {
      Critical: "bg-red-500",
      High: "bg-orange-500",
      Medium: "bg-yellow-500",
      Low: "bg-green-500",
    }
    return colors[priority as keyof typeof colors]
  }

  const getPriorityDescription = (priority: string) => {
    const descriptions = {
      Critical: "Must-have features for MVP launch",
      High: "Important features for competitive advantage",
      Medium: "Nice-to-have features for enhanced UX",
      Low: "Future enhancements and advanced features",
    }
    return descriptions[priority as keyof typeof descriptions]
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Feature Prioritization Matrix</h2>
        <p className="text-muted-foreground">Features organized by business priority and impact</p>
      </div>

      {priorityOrder.map((priority) => {
        const features = getFeaturesByPriority(priority)
        const totalWeeks = features.reduce((sum, f) => sum + f.estimatedWeeks, 0)

        return (
          <Card key={priority} className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${getPriorityColor(priority)}`} />
                  <div>
                    <CardTitle>{priority} Priority</CardTitle>
                    <p className="text-sm text-muted-foreground">{getPriorityDescription(priority)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{features.length} features</div>
                  <div className="text-xs text-muted-foreground">{totalWeeks} weeks</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{feature.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {feature.phase}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium">{feature.estimatedWeeks}w</div>
                      <div className="text-xs text-muted-foreground">{feature.complexity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
