import { useEffect } from "react";

const BASE_URL = "https://jammsante.lovable.app";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = "JàmmSanté";

interface SEOConfig {
  title: string;
  description: string;
  path?: string;
  type?: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
}

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

function setJsonLd(data: Record<string, unknown>) {
  const id = "dynamic-jsonld";
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function usePageSEO({ title, description, path = "/", type = "website", image, jsonLd }: SEOConfig) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const url = `${BASE_URL}${path}`;
    const img = image || DEFAULT_IMAGE;

    // Title
    document.title = fullTitle;

    // Standard meta
    setMeta("description", description);

    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:url", url, true);
    setMeta("og:type", type, true);
    setMeta("og:image", img, true);
    setMeta("og:site_name", SITE_NAME, true);

    // Twitter
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", img);

    // Canonical
    setCanonical(url);

    // JSON-LD
    if (jsonLd) {
      setJsonLd({ "@context": "https://schema.org", ...jsonLd });
    }

    return () => {
      document.title = `${SITE_NAME} - Votre santé, notre priorité`;
    };
  }, [title, description, path, type, image, jsonLd]);
}
