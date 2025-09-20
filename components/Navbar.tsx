// components/Navbar.tsx
import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Palette, Heart } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Artwork, Location, TimeRange } from "@/types";

type NavbarProps = {
  loading: boolean;
  chatQuery: {
    location?: Location;
    movement?: string;
    artist?: string;
  };
  galleryArtworks: Artwork[];
  setShowGalleryModal: (show: boolean) => void;
};

export default function Navbar({
  loading,
  chatQuery,
  galleryArtworks,
  setShowGalleryModal,
}: NavbarProps) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <header
      className="bg-black/20 backdrop-blur-sm border-b border-gray-700"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Site Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {t("site.name")}
              </h1>
              <p className="text-gray-300 text-sm">{t("site.tagline")}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6" role="navigation">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              {t("nav.explore")}
            </Link>
            <Link
              href="/themes"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              {t("nav.themes")}
            </Link>
            <Link
              href="/stories"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              {t("nav.stories")}
            </Link>
            <Link
              href="/guide"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              {t("nav.guide")}
            </Link>
            <Link
              href="/about"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              {t("nav.about")}
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <LanguageSwitcher />

            {loading && (
              <div className="flex items-center">
                <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-blue-400">{t("header.updating")}</span>
              </div>
            )}

            {/* Gallery Button */}
            {galleryArtworks && (
              <button
                onClick={() => setShowGalleryModal(true)}
                className="relative flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                title={t("header.viewGallery")}
              >
                <Heart size={16} />
                <span className="text-sm font-medium">{t("header.gallery")}</span>
                {galleryArtworks.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {galleryArtworks.length}
                  </span>
                )}
              </button>
              )}
          </div>
        </div>
      </div>
    </header>
  );
}
