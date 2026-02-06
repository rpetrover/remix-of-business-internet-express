import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Mail, Clock, Bot, BookOpen, AlertCircle, CheckCircle, Zap, Shield, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SupportPage = () => {
  const [chatTriggered, setChatTriggered] = useState(false);

  const openChat = () => {
    // Trigger the floating chat widget by dispatching a custom event
    window.dispatchEvent(new CustomEvent("open-chat-widget"));
  };

  const supportChannels = [
    {
      icon: <Phone className="h-12 w-12 text-primary" />,
      title: "AI Voice Agent",
      description: "Talk to our intelligent AI voice agent — it can answer questions, check availability, and even place orders for you.",
      contact: "1-888-230-FAST",
      contactHref: "tel:+18882303278",
      availability: "24/7 — 365 days a year",
      features: ["Natural voice conversations", "Order placement by phone", "Instant availability checks"],
      cta: "Call Now",
      action: () => window.open("tel:+18882303278"),
    },
    {
      icon: <MessageCircle className="h-12 w-12 text-primary" />,
      title: "AI Live Chat",
      description: "Chat with our AI sales & support agent right here on the website. Get instant answers, compare plans, and place orders.",
      contact: "Instant Response",
      availability: "24/7 — 365 days a year",
      features: ["Real-time AI responses", "Plan comparisons & pricing", "Complete orders in chat"],
      cta: "Start Chat",
      action: openChat,
    },
    {
      icon: <Mail className="h-12 w-12 text-primary" />,
      title: "AI Email Agent",
      description: "Email us and our AI agent will respond automatically with detailed answers, quotes, and order processing.",
      contact: "service@businessinternetexpress.com",
      contactHref: "mailto:service@businessinternetexpress.com",
      availability: "24/7 — Auto-reply powered by AI",
      features: ["Detailed AI-powered replies", "Quote & order processing", "Attachment support"],
      cta: "Send Email",
      action: () => window.open("mailto:service@businessinternetexpress.com"),
    },
  ];

  const supportTypes = [
    {
      icon: <AlertCircle className="h-8 w-8 text-destructive" />,
      title: "Service Outage",
      description: "Report or check status of service interruptions",
      priority: "Critical",
      response: "Instant",
      action: "Call or Chat",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "Technical Issues",
      description: "Internet, phone, or TV technical problems",
      priority: "High",
      response: "Instant",
      action: "Chat or Call",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "New Orders & Quotes",
      description: "Get pricing, check availability, and place new service orders",
      priority: "Standard",
      response: "Instant",
      action: "Any Channel",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "General Questions",
      description: "Product information, provider comparisons, and general inquiries",
      priority: "Standard",
      response: "Instant",
      action: "Chat or Email",
    },
  ];

  const aiCapabilities = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Instant Responses",
      description: "No hold times, no queues. Get answers in seconds, any time of day.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Complete Order Processing",
      description: "Our AI agents can handle your entire order from start to finish — no human handoff needed.",
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: "Expert Knowledge",
      description: "Trained on 28+ providers with detailed pricing, speeds, coverage, and technical specs.",
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Always On",
      description: "24 hours a day, 7 days a week, 365 days a year. Holidays included.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <div className="flex justify-center mb-6">
              <Bot className="h-16 w-16" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              AI-Powered Support
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Instant help, any time. Our AI agents handle everything from questions to complete order placement.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
              <Badge variant="secondary" className="bg-accent text-accent-foreground text-lg px-6 py-2">
                24/7 AI Agents
              </Badge>
              <Badge variant="outline" className="border-primary-foreground text-primary-foreground text-lg px-6 py-2">
                Zero Wait Times
              </Badge>
              <Badge variant="outline" className="border-primary-foreground text-primary-foreground text-lg px-6 py-2">
                Full Order Capability
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={openChat}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat with AI Agent
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <a href="tel:+18882303278">
                  <Phone className="h-5 w-5 mr-2" />
                  Call 1-888-230-FAST
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why AI-Powered Support?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our intelligent agents are trained on everything about business internet — so you get expert-level help instantly.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {aiCapabilities.map((cap, index) => (
              <Card key={index} className="text-center border-none shadow-medium">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">{cap.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{cap.title}</h3>
                  <p className="text-sm text-muted-foreground">{cap.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Channels */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Choose Your Channel
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every channel is powered by AI — call, chat, or email. All available 24/7 with instant responses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="text-center transition-all duration-300 hover:shadow-large">
                <CardHeader>
                  <div className="flex justify-center mb-4">{channel.icon}</div>
                  <CardTitle className="text-xl">{channel.title}</CardTitle>
                  <p className="text-muted-foreground mb-4">{channel.description}</p>
                  <div className="text-center">
                    {channel.contactHref ? (
                      <a
                        href={channel.contactHref}
                        className="text-2xl font-bold text-primary mb-2 block hover:text-primary/80 transition-colors"
                      >
                        {channel.contact}
                      </a>
                    ) : (
                      <div className="text-2xl font-bold text-primary mb-2">{channel.contact}</div>
                    )}
                    <Badge variant="secondary">{channel.availability}</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm">
                    {channel.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button variant="cta" className="w-full" onClick={channel.action}>
                    {channel.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Types */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              What Can Our AI Agents Help With?
            </h2>
            <p className="text-xl text-muted-foreground">
              From outage reports to new orders — our AI handles it all, instantly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {supportTypes.map((type, index) => (
              <Card key={index} className="transition-all duration-300 hover:shadow-medium">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">{type.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{type.title}</h3>
                        <Badge variant={type.priority === "Critical" ? "destructive" : "secondary"}>
                          {type.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{type.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Response: <span className="font-semibold text-primary">{type.response}</span>
                        </span>
                        <Badge variant="outline">{type.action}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Support */}
      <section className="py-20 bg-destructive/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Emergency Service Issues?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Our AI agents are available 24/7 for critical issues. Call or chat immediately for the fastest response.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="destructive" size="lg" asChild>
                <a href="tel:+18882303278">
                  <Phone className="h-5 w-5 mr-2" />
                  Call 1-888-230-FAST
                </a>
              </Button>
              <Button variant="outline" size="lg" onClick={openChat}>
                <MessageCircle className="h-5 w-5 mr-2" />
                Open AI Chat
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              AI-powered emergency support — instant response, no hold times, 24/7/365
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-primary-foreground">
            <Bot className="h-12 w-12 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Our AI agents can help you find the perfect internet plan, compare 28+ providers, and place your order — all in one conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={openChat}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat with AI Agent
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <a href="tel:+18882303278">
                  <Phone className="h-5 w-5 mr-2" />
                  1-888-230-FAST
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SupportPage;
