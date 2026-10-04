import React, { useState } from "react";
import {
  Mail,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { toast } from "sonner";
import api from "@/services/api";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email";
    }

    if (!form.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await api.post("/api/contact", form);

      toast.success("Message sent successfully 🎉");

      setForm({
        name: "",
        email: "",
        message: "",
      });

      setSuccess(true);
      setErrors({});
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const infoCards = [
    {
      icon: Mail,
      title: "Email Us",
      value: "souravkumar85055@gmail.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      value: "+91 98765 43210",
    },
    {
      icon: MapPin,
      title: "Our Office",
      value: "Kolkata, West Bengal, India",
    },
  ];

  return (
    <section className="min-h-screen w-full px-4 md:px-8 py-12 bg-bg text-text transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* LEFT SIDE */}
        <div className="space-y-8">
          <div>
            <span className="inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold bg-primary-soft text-primary border-primary/20">
              Get In Touch
            </span>

            <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-text">
              Contact <span className="text-primary">Us</span>
            </h1>

            <div className="w-16 h-1 rounded-full mt-4 bg-primary" />

            <p className="mt-5 text-base md:text-lg leading-relaxed text-text-muted max-w-xl">
              Have questions or need help? We'd love to hear from you. Send us a message and our
              team will respond as soon as possible.
            </p>
          </div>

          {/* INFO CARDS */}
          <div className="grid gap-3">
            {infoCards.map((item, index) => {
              const Icon = item.icon;

              return (
                <Card
                  key={index}
                  className="border border-border shadow-subtle hover:shadow-card hover:border-border-strong transition-all duration-200 rounded-xl bg-surface"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-lg flex items-center justify-center bg-primary-soft text-primary border border-primary/10">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-text text-sm">{item.title}</p>
                      <p className="text-sm text-text-muted">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <Card className="rounded-2xl border border-border shadow-card bg-surface">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text">
              Send us a message
            </CardTitle>

            <CardDescription className="text-text-muted text-sm">
              We'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* NAME */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-text font-medium text-xs">
                    <User className="w-3.5 h-3.5 text-text-muted" />
                    Full Name
                  </Label>

                  <Input
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-10 bg-surface-2 border-border text-text placeholder:text-text-subtle focus-visible:ring-primary"
                  />

                  {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
                </div>

                {/* EMAIL */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-text font-medium text-xs">
                    <Mail className="w-3.5 h-3.5 text-text-muted" />
                    Email Address
                  </Label>

                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-10 bg-surface-2 border-border text-text placeholder:text-text-subtle focus-visible:ring-primary"
                  />

                  {errors.email && <p className="text-xs text-danger">{errors.email}</p>}
                </div>

                {/* MESSAGE */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-text font-medium text-xs">
                    <MessageSquare className="w-3.5 h-3.5 text-text-muted" />
                    Message
                  </Label>

                  <Textarea
                    rows={4}
                    placeholder="Write your message..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="bg-surface-2 border-border text-text placeholder:text-text-subtle focus-visible:ring-primary resize-none"
                  />

                  {errors.message && <p className="text-xs text-danger">{errors.message}</p>}
                </div>

                {/* BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium shadow-subtle transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="py-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 mx-auto text-success" />

                <h3 className="text-xl font-bold text-text">
                  Message Sent!
                </h3>

                <p className="text-sm text-text-muted">We'll get back to you soon.</p>

                <Button
                  onClick={() => setSuccess(false)}
                  className="bg-primary hover:bg-primary-hover text-white rounded-lg h-10 px-6 font-medium shadow-subtle"
                >
                  Send Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
