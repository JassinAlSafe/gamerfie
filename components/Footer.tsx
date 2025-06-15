"use client";
import React from "react";
import Link from "next/link";
import {
  IconBrandThreads,
  IconBrandInstagram,
  IconBrandDiscord,
  IconBrandLinkedin,
  IconDeviceGamepad2,
} from "./ui/custom-icons";

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-t from-gray-950 to-gray-900 border-t border-gray-800/50">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/20">
                <IconDeviceGamepad2 className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Game Vault
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
              Your ultimate gaming companion for tracking progress, discovering
              new games, and connecting with fellow gamers worldwide.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3">
              {[
                {
                  icon: IconBrandLinkedin,
                  href: "https://www.linkedin.com/company/amedesign-swe/",
                  label: "LinkedIn",
                },
                {
                  icon: IconBrandThreads,
                  href: "https://threads.net/@gamerfie",
                  label: "Threads",
                },
                {
                  icon: IconBrandInstagram,
                  href: "https://instagram.com/gamerfie",
                  label: "Instagram",
                },
                {
                  icon: IconBrandDiscord,
                  href: "https://discord.gg/gamerfie",
                  label: "Discord",
                },
              ].map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-purple-500/30 rounded-lg transition-all duration-300 hover:scale-110"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Platform */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-4">
                {[
                  { label: "Home", href: "/" },
                  { label: "Explore Games", href: "/explore" },
                  { label: "All Games", href: "/all-games" },
                  { label: "Reviews", href: "/reviews" },
                  { label: "Community", href: "/community" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm group relative"
                    >
                      <span className="relative">
                        {label}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
                Support
              </h4>
              <ul className="space-y-4">
                {[
                  { label: "FAQ", href: "/info/faq" },
                  { label: "Contact Us", href: "/info/contact" },
                  { label: "About", href: "/info/about" },
                  { label: "Accessibility", href: "/accessibility" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm group relative"
                    >
                      <span className="relative">
                        {label}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
                Legal
              </h4>
              <ul className="space-y-4">
                {[
                  { label: "Privacy Policy", href: "/info/privacy" },
                  { label: "Terms of Service", href: "/info/terms" },
                  { label: "Sitemap", href: "/sitemap" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm group relative"
                    >
                      <span className="relative">
                        {label}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter/CTA Section */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
              Stay Updated
            </h4>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Get the latest gaming news and platform updates.
            </p>
            <Link
              href="/signup"
              className="group inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              <span>Join Community</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Game Vault by AmeDesign. All rights
              reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-500 text-sm">
              <span>Made with</span>
              <span className="text-purple-400 animate-pulse">♥</span>
              <span>for gamers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
    </footer>
  );
}
