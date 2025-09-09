// File: frontend/app/page.tsx

'use client';

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-white">
      {/* Header */}
      <header className="w-full py-6 px-6 md:px-12 flex justify-between items-center shadow-md bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-slate-800">Solopreneur Toolkit</h1>
        <div className="space-x-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-md text-sm font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 transition"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 flex-col-reverse lg:flex-row items-center justify-between px-6 md:px-12 py-16 gap-10">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Your All-in-One <br />
            <span className="text-blue-600">Digital Toolkit</span>
          </h2>
          <p className="text-lg text-slate-700 mb-8">
            Empower your solopreneur journey with smart tools for planning, productivity, and performance — all in one place.
          </p>
          <div className="flex gap-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-md font-semibold hover:bg-slate-100 transition"
            >
              I already have an account
            </Link>
          </div>
        </div>
        <div className="relative w-full max-w-md lg:max-w-lg">
          <Image
            src="/illustration.svg" // Replace with your illustration
            alt="Digital Toolkit Illustration"
            width={500}
            height={500}
            className="w-full h-auto"
            priority
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm text-slate-500 bg-slate-50">
        &copy; {new Date().getFullYear()} Solopreneur Toolkit. All rights reserved.
      </footer>
    </main>
  );
}
