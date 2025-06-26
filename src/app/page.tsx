'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Brain, 
  Share2, 
  Target, 
  Zap, 
  Star,
  TrendingUp,
  Clock,
  BarChart3
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-muted/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(254,143,84,0.1),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Revolutionary Learning Platform</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight">
              Master Any Subject with{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                Smart Flashcards
              </span>
            </h1>
            
            <p className="mt-8 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your learning with AI-powered spaced repetition, interactive study modes, 
              and collaborative features. Join thousands of students achieving better results.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/sets">
                  Start Learning Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
            
            {/* Social Proof
            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background" />
                  <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-background" />
                  <div className="w-8 h-8 rounded-full bg-primary/40 border-2 border-background" />
                </div>
                <span>10,000+ active learners</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1">4.9/5 rating</span>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Everything You Need to{" "}
              <span className="text-primary">Learn Effectively</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful features designed to help you learn faster, retain more, and achieve your goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Smart Learning</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Advanced spaced repetition algorithms adapt to your learning pace, 
                  ensuring optimal retention and long-term memory.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Test Your Knowledge</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Multiple study modes including quizzes, tests, and interactive challenges 
                  to reinforce your learning and track progress.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Share2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Share & Collaborate</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create study groups, share flashcard sets with classmates, 
                  and learn together with collaborative features.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Progress Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Detailed analytics and insights into your learning patterns, 
                  helping you identify strengths and areas for improvement.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Study Reminders</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Smart notifications and study schedules to keep you on track 
                  and maintain consistent learning habits.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Performance Boost</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Proven to improve retention by up to 300% compared to traditional 
                  study methods through optimized learning algorithms.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Get Started in{" "}
              <span className="text-primary">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our streamlined process makes learning efficient and enjoyable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative">
                <div className="w-20 h-20 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="hidden md:block absolute top-10 left-full w-12 h-0.5 bg-primary/30 transform translate-x-4" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Create Your Sets</h3>
              <p className="text-muted-foreground leading-relaxed">
                Easily create flashcard sets with our intuitive interface. 
                Import from text, CSV, or build them from scratch.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="w-20 h-20 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold group-hover:scale-110 transition-transform">
                  2
                </div>
                <div className="hidden md:block absolute top-10 left-full w-12 h-0.5 bg-primary/30 transform translate-x-4" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Study & Practice</h3>
              <p className="text-muted-foreground leading-relaxed">
                Choose from multiple study modes: spaced repetition, 
                multiple choice, or typing challenges.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-2xl font-semibold mb-4">Track & Improve</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor your progress with detailed analytics and 
                watch your knowledge grow over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1M+</div>
              <div className="text-muted-foreground">Flashcards Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Study Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Loved by Students Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of students who have transformed their learning experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "This app has completely changed how I study. The spaced repetition system 
                  is incredibly effective and I've seen a huge improvement in my retention."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary">S</span>
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Mitchell</div>
                    <div className="text-sm text-muted-foreground">Medical Student</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "The ability to share sets with classmates has made group study sessions 
                  so much more productive. We can all contribute and learn together."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary">J</span>
                  </div>
                  <div>
                    <div className="font-semibold">James Kim</div>
                    <div className="text-sm text-muted-foreground">Computer Science</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "I love how easy it is to create and organize my flashcards. The testing 
                  feature is a game-changer for language learning."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary">E</span>
                  </div>
                  <div>
                    <div className="font-semibold">Emma Lopez</div>
                    <div className="text-sm text-muted-foreground">Language Learner</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary/10 text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 text-primary">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl mb-10 opacity-90 leading-relaxed text-muted-foreground">
            Join 50,000+ students who are already using Recalls to improve their grades, 
            boost retention, and achieve their learning goals
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              className="text-lg px-8 py-6"
              size="lg"
              asChild
            >
              <Link href="/sets">
                Start Learning Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">Recalls</h3>
              <p className="text-muted-foreground leading-relaxed">
                The smart way to learn with flashcards. Transform your study habits 
                and achieve better results with our AI-powered learning platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>Create Sets</li>
                <li>Study Mode</li>
                <li>Test Mode</li>
                <li>Share Sets</li>
                <li>Progress Tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>Help Center</li>
                <li>Study Tips</li>
                <li>API Documentation</li>
                <li>Status Page</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>About Us</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            © {new Date().getFullYear()} Recalls. All rights reserved. Made with ❤️ for learners everywhere.
          </div>
        </div>
      </footer>
    </div>
  );
} 