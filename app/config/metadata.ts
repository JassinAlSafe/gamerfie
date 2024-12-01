
import { Metadata } from "next";

export const siteMetadata: Metadata = {
  title: "Track your gaming habits",
  description: "Earn rewards for playing games",
  metadataBase: new URL('https://gamerfie.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gamerfie.com',
    title: 'Track your gaming habits',
    description: 'Earn rewards for playing games',
  }
};