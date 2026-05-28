"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function ReportIssuePage() {
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
    <div className="space-y-4 md:px-8 py-4 xl:pr-12">
      <div>
        <h1 className="text-2xl font-bold text-primary">Report an Issue</h1>
        <h5 className="text-primary mt-4">
          Report any issues you encounter with the INEC registration or
          collection centre.
        </h5>
      </div>
      <hr className="text-gray-600 font-semibold my-6" />
      <form onSubmit={handleSubmit} className=" p-2 md:p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Name */}
          <div>
            <label className="block text-lg font-semibold font-space-grotesk text-primary mb-3">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3  text-primary border bg-white border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-lg font-semibold font-space-grotesk text-primary mb-3">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 bg-white py-3  text-primary border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-lg font-semibold font-space-grotesk   text-primary mb-3">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 text-primary bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              placeholder="+234 (0)123 456 7890"
            />
          </div>

          {/* Complaint Type */}
          <div>
            <label className="block text-lg font-semibold font-space-grotesk text-primary mb-3">
              Complaint Type *
            </label>
            <select
              name="complaintType"
              value={formData.complaintType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 text-primary  border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition bg-white"
            >
              <option className="" value="">
                Select a category
              </option>
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
          <label className="block text-lg font-semibold text-primary mb-3">
            Complaint Details *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 border text-primary bg-white border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
            placeholder="Please describe your complaint in detail. The more information you provide, the better we can assist you."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-[#a58a3a] disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </div>
      </form>

      {/* Modal Overlay - NIN verification with fixed position excluding sidebar */}
    </div>
  );
}
