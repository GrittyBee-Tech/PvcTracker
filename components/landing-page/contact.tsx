"use client";

import { useState } from "react";
import Swal from "sweetalert2";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    complaintType: "",
    message: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: "Success!",
          text: "Thank you! Your complaint has been submitted successfully. We'll get back to you soon.",
          icon: "success",
          confirmButtonColor: "#c9a84c",
        });
        setFormData({
          name: "",
          email: "",
          complaintType: "",
          message: "",
          phone: "",
        });
      } else {
        await Swal.fire({
          title: "Error",
          text:
            data.error || "Failed to submit your complaint. Please try again.",
          icon: "error",
          confirmButtonColor: "#c9a84c",
        });
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      await Swal.fire({
        title: "Error",
        text: "An error occurred while submitting your complaint. Please try again later.",
        icon: "error",
        confirmButtonColor: "#c9a84c",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 md:pt-40 px-6 lg:px-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="md:text-5xl text-3xl font-bold font-playfair-display text-gray-100 mb-4">
            Get in <span className="text-[#c9a84c]">Touch</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            We value your feedback and complaints. Please share your concerns
            with us so we can improve our services and address any issues you
            may have encountered.
          </p>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3fbcaa] transition"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3fbcaa] transition"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3fbcaa] transition"
                placeholder="+234 (0)123 456 7890"
              />
            </div>

            {/* Complaint Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Complaint Type *
              </label>
              <select
                name="complaintType"
                value={formData.complaintType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3fbcaa] transition bg-white"
              >
                <option value="">Select a category</option>
                <option value="technical">Technical Issue</option>
                <option value="registration">Registration Problem</option>
                <option value="pvc-collection">PVC Collection Issue</option>
                <option value="user-experience">User Experience</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Complaint Details *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3fbcaa] transition resize-none"
              placeholder="Please describe your complaint in detail. The more information you provide, the better we can assist you."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#c9a84c] hover:bg-[#a58a3a] disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">📧</div>
            <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
            <p className="text-gray-300 break-all">support@pvcwaka.org</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">📞</div>
            <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
            <p className="text-gray-300">+234 (0) 800 123 4567</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Response Time
            </h3>
            <p className="text-gray-300">Within 24-48 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
