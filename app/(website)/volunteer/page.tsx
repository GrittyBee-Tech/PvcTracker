"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BadgeCheck,
  GraduationCap,
  ShieldCheck,
  Users,
  ArrowRight,
} from "lucide-react";

const eligibilityCards = [
  {
    title: "Registered user",
    description: "You must already have a PVC WAKA account.",
    icon: Users,
  },
  {
    title: "NIN confirmed",
    description: "Your NIN verification must be complete before applying.",
    icon: ShieldCheck,
  },
  {
    title: "CVR training completed",
    description:
      "You must have completed the Continuous Voter Registration (CVR) training.",
    icon: GraduationCap,
  },
  {
    title: "VIN verified",
    description:
      "You must have verified your Voters Identification Number (VIN).",
    icon: BadgeCheck,
  },
];

const steps = [
  {
    title: "Log in to your account",
    description:
      "Sign in using your email and password. Make sure your NIN status shows Confirmed on your profile before proceeding.",
  },
  {
    title: "Complete the CVR training module",
    description:
      "You must attend and complete the CVR training held on Google Meet. This is mandatory before you can submit your volunteer application.",
    tag: "Required before applying",
  },
  {
    title: "Apply to become a Volunteer",
    description:
      "Go to your profile or volunteer banner on your dashboard and open the volunteer application form.",
  },
  {
    title: "Submit your application",
    description:
      "Complete the short form and submit. You’ll receive confirmation via email, SMS, and in-app notification.",
    tag: "Review typically takes 1–5 business days",
  },
  {
    title: "Wait for admin approval",
    description:
      "Our admin team manually reviews every application. If rejected, you’ll receive feedback and may re-apply.",
  },
  {
    title: "Access your Volunteer Dashboard",
    description:
      "Once approved, your account upgrades instantly. Log back in to access your Volunteer Dashboard.",
    tag: "You are now a Volunteer",
  },
];

export default function VolunteerHeroPage() {
  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <div className="">
        <div className="lg:px-20 mx-auto px-6 md:px-10 py-10 md:py-20">
          <div className="">
            <div className="md:text-xl font-bold font-dm-sans mt-10 md:mt-10 text-primary">
              <hr className="inline-block w-10 md:mb-1.5 mb-1 md:border-[1.25px]" />{" "}
              Volunteer Programme
            </div>
            <h1 className="md:text-7xl font-extrabold md:w-9/12 mt-2  font-space-grotesk  text-[#0A140F]">
              Become a PVC WAKA Volunteer
            </h1>
            <p className="text-md  text-[#0A140F] font-dm-sans md:w-7/12 mt-3 ">
              Join a network of community mobilisers helping Nigerians register,
              verify, and collect their Permanent Voter Cards. As a volunteer,
              you can register multiple people and track your outreach all from
              one dashboard.
            </p>
          </div>
        </div>
      </div>
      <hr className="border-gray-300" />
      {/* ELIGIBILITY SECTION */}
      <section className="py-10 ">
        <div className="px-6  lg:px-20 mx-auto">
          <div className="max-w-3xl">
            <p className="text-sm font-dm-sans font-bold tracking-[0.2em] text-primary uppercase">
              Eligibility
            </p>
            <h2 className="mt-4 text-3xl font-space-grotesk md:text-4xl font-bold text-[#0A140F]">
              Who can become a volunteer?
            </h2>
            <p className="mt-2 text-md font-dm-sans text-primary">
              To apply, you must meet all of the following requirements.
            </p>
          </div>

          <div className="grid gap-6 mt-12 md:grid-cols-2 xl:grid-cols-4">
            {eligibilityCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="w-14 h-14 rounded-xl  flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>

                  <h3 className="mt-3 text-xl font-space-grotesk font-bold text-primary">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-gray-600 font-dm-sans leading-relaxed">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <p className="text-primary font-dm-sans font-medium">
              Not registered yet?{" "}
              <Link
                href="/auth/register"
                className="underline font-dm-sans font-bold"
              >
                Create your account first
              </Link>{" "}
              — the whole process takes less than 5 minutes.
            </p>

            <p className="mt-3 text-primary font-dm-sans font-medium">
              Not done the CVR training? Start the training here.
            </p>
          </div>
        </div>
      </section>

      {/* TRAINING NOTICE */}
      <section className="py-10 bg-green-50">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="rounded-3xl bg-white border border-primary/10 shadow-sm p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-space-grotesk font-bold text-primary">
                  What is the CVR training?
                </h2>

                <p className="mt-2 text-md text-primary font-dm-sans leading-relaxed">
                  The Continuous Voter Registration (CVR) training is a short
                  online training coordinated by Abenol Foundation on Google
                  Meet. It covers how to correctly guide people through voter
                  registration, how to use the Volunteer Dashboard, and INEC's
                  guidelines for PVC collection.
                </p>

                <p className="mt-4 text-lg text-primary font-dm-sans leading-relaxed">
                  You must complete this training before your volunteer
                  application can be submitted.
                </p>
              </div>
              <Link href="https://forms.gle/oGPC7ZYvyW2ZAsKM9" target="_blank">
                <Button className="h-fit px-6 py-6 text-base">
                  Start CVR Training
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* APPLICATION PROCESS */}
      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-bold tracking-[0.2em] text-primary uppercase">
              Application Process
            </p>

            <h2 className="mt-4 text-3xl md:text-5xl font-bold text-primary">
              How to apply — step by step
            </h2>

            <p className="mt-5 text-lg text-gray-600">
              Follow these steps after your NIN has been confirmed.
            </p>
          </div>

          <div className="mt-16 space-y-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex gap-5 rounded-2xl border border-gray-200 p-6"
              >
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-primary">
                      {step.title}
                    </h3>

                    {step.tag && (
                      <span className="rounded-full bg-primary/10 text-primary text-sm font-semibold px-3 py-1">
                        {step.tag}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      {/* <section className="py-24 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to make an impact?
          </h2>

          <p className="mt-6 text-lg md:text-xl text-green-100 leading-relaxed">
            Every PVC registered is one more Nigerian voice counted. Start your
            volunteer journey today.
          </p>

          <Button
            size="lg"
            className="mt-10 bg-white text-primary hover:bg-green-100 px-8"
          >
            Apply to become a volunteer
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section> */}
    </div>
  );
}
