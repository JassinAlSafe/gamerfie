"use client";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  IconBrandTwitter,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandDiscord,
} from "@tabler/icons-react";

export function Footer() {
  return (
    <footer className="bg-background text-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Gamerfie</h3>
            <p className="text-sm text-muted-foreground">
              Track your games, share your thoughts, connect with gamers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/games" className="text-sm hover:underline">
                  Games
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-sm hover:underline">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm hover:underline">
                  Community
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-sm hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:underline">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://twitter.com/gamerfie"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconBrandTwitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://facebook.com/gamerfie"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconBrandFacebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://instagram.com/gamerfie"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconBrandInstagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://discord.gg/gamerfie"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconBrandDiscord className="h-5 w-5" />
                  <span className="sr-only">Discord</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Gamerfie. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <Button variant="link" asChild>
              <Link href="/accessibility" className="text-sm">
                Accessibility
              </Link>
            </Button>
            <Button variant="link" asChild>
              <Link href="/sitemap" className="text-sm">
                Sitemap
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
