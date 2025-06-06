"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-[#112362] text-white pt-8 pb-4">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* Logo & Tagline */}
          <div>
            <Link href="/" className="inline-block mb-2" aria-label="Soulasia Home">
              <Image src="/Brand/logo white.svg" alt="Soulasia Logo White" width={120} height={28} priority />
            </Link>
            <p className="mt-2 text-sm text-white" style={{ color: '#fff' }}>
              Premium serviced apartments in Kuala Lumpur for short and extended stays.
            </p>
            <div className="flex mt-4 space-x-3">
              <a href="https://www.instagram.com/soulasia.com.my" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Button variant="ghost" size="icon" className="footer-social-icon">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Button>
              </a>
              <a href="https://www.linkedin.com/company/soulasia-my/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Button variant="ghost" size="icon" className="footer-social-icon">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </Button>
              </a>
            </div>
          </div>
          {/* Contact Info */}
          <div className="text-white">
            <div className="footer-section-title mb-2 font-semibold text-base">Contact</div>
            <p className="text-xs mb-1" style={{ color: '#fff' }}>+60 3 21818729</p>
            <p className="text-xs mb-1" style={{ color: '#fff' }}>info@soulasia.com.my</p>
            <p className="text-xs mb-1" style={{ color: '#fff' }}>B1-22-2, The Soho Suites @KLCC, 20 Jalan Perak 50450, WP Kuala Lumpur, Malaysia</p>
          </div>
          {/* Policies */}
          <div>
            <div className="footer-section-title mb-2 font-semibold text-base">Policies</div>
            <ul className="space-y-1">
              <li>
                <Link href="/privacy-policy" className="footer-link">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/refund-policy" className="footer-link">Refund Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="footer-link">Terms & Conditions</Link>
              </li>
            </ul>
          </div>
          {/* Company Info */}
          <div className="text-white">
            <div className="footer-section-title mb-2 font-semibold text-base">Company</div>
            <p className="text-xs" style={{ color: '#fff' }}>Soulasia Management Sdn. Bhd.</p>
            <p className="text-xs" style={{ color: '#fff' }}>Registration Number - 202301007902 (1501823-H)</p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4 text-center text-xs" style={{ color: '#fff' }}>
          © {new Date().getFullYear()} Soulasia. All rights reserved.
        </div>
      </div>
      <style jsx>{`
        .footer-link {
          color: #7ecfff;
          font-weight: 500;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: #fff;
          text-decoration: underline;
        }
        .footer-section-title {
          font-size: 1rem;
          font-weight: 600;
        }
        .footer-social-icon {
          width: 36px;
          height: 36px;
          background: #22336a;
          color: #fff;
        }
      `}</style>
    </footer>
  )
} 