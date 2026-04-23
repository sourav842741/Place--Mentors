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

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
    <section className="min-h-screen w-full px-4 md:px-8 py-12 bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-[#020617] dark:via-[#0b1120] dark:to-[#111827] transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* LEFT SIDE */}
        <div className="space-y-8">
          <div>
            <span className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20">
              Get In Touch
            </span>

            <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
              Contact{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Us
              </span>
            </h1>

            <div className="w-24 h-1 rounded-full mt-5 bg-gradient-to-r from-blue-600 to-purple-600" />

            <p className="mt-6 text-base md:text-lg leading-8 text-slate-600 dark:text-slate-300 max-w-xl">
              Have questions or need help? We'd love to hear from you. Send us a
              message and our team will respond as soon as possible.
            </p>
          </div>

          {/* INFO CARDS */}
          <div className="grid gap-4">
            {infoCards.map((item, index) => {
              const Icon = item.icon;

              return (
                <Card
                  key={index}
                  className="border shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm"
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {item.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <Card className="rounded-3xl border shadow-xl bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-3xl text-slate-900 dark:text-white">
              Send us a message
            </CardTitle>

            <CardDescription className="text-slate-500 dark:text-slate-400">
              We'll get back to you soon!
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* NAME */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>

                  <Input
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-11"
                  />

                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>

                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="h-11"
                  />

                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* MESSAGE */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Label>

                  <Textarea
                    rows={5}
                    placeholder="Write your message..."
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                  />

                  {errors.message && (
                    <p className="text-sm text-red-500">{errors.message}</p>
                  )}
                </div>

                {/* BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white"
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
                <CheckCircle2 className="w-14 h-14 mx-auto text-green-500" />

                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Message Sent!
                </h3>

                <p className="text-slate-500 dark:text-slate-400">
                  We'll get back to you soon.
                </p>

                <Button
                  onClick={() => setSuccess(false)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
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
