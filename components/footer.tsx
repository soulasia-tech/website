"use client"

import Link from "next/link"
import Image from 'next/image'

export function Footer() {
    return (
        <footer className="bg-[#141826] text-white pt-8 pb-4">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 tb:grid-cols-2 lp:grid-cols-4 gap-5 tb:gap-8 mb-6">
                    {/* Logo & Tagline */}
                    <div>
                        <Link href="/" className="inline-block mb-2" aria-label="Soulasia Home">
                            <Image src="/Brand/logo-white.svg" alt="Soulasia Logo White" width={120} height={31}
                                   priority/>
                        </Link>
                        <div className="font-normal text-white/80 text-sm full:text-base mt-2">
                            Premium serviced apartments in Kuala Lumpur for short and extended stays.
                        </div>
                        <div className="flex mt-2 tb:mt-4 lp:mt-5 gap-2.5 tb:gap-5">
                            <a href="https://www.instagram.com/soulasia.com.my" target="_blank"
                               rel="noopener noreferrer"
                               aria-label="Instagram">
                                <svg className="w-5 h-5 tb:w-6 tb:h-6 text-white" width="24" height="24"
                                     viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 2.163C15.204 2.163 15.584 2.175 16.85 2.233C20.102 2.381 21.621 3.924 21.769 7.152C21.827 8.417 21.838 8.797 21.838 12.001C21.838 15.206 21.826 15.585 21.769 16.85C21.62 20.075 20.105 21.621 16.85 21.769C15.584 21.827 15.206 21.839 12 21.839C8.796 21.839 8.416 21.827 7.151 21.769C3.891 21.62 2.38 20.07 2.232 16.849C2.174 15.584 2.162 15.205 2.162 12C2.162 8.796 2.175 8.417 2.232 7.151C2.381 3.924 3.896 2.38 7.151 2.232C8.417 2.175 8.796 2.163 12 2.163ZM12 0C8.741 0 8.333 0.014 7.053 0.072C2.695 0.272 0.273 2.69 0.073 7.052C0.014 8.333 0 8.741 0 12C0 15.259 0.014 15.668 0.072 16.948C0.272 21.306 2.69 23.728 7.052 23.928C8.333 23.986 8.741 24 12 24C15.259 24 15.668 23.986 16.948 23.928C21.302 23.728 23.73 21.31 23.927 16.948C23.986 15.668 24 15.259 24 12C24 8.741 23.986 8.333 23.928 7.053C23.732 2.699 21.311 0.273 16.949 0.073C15.668 0.014 15.259 0 12 0ZM12 5.838C8.597 5.838 5.838 8.597 5.838 12C5.838 15.403 8.597 18.163 12 18.163C15.403 18.163 18.162 15.404 18.162 12C18.162 8.597 15.403 5.838 12 5.838ZM12 16C9.791 16 8 14.21 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.21 14.209 16 12 16ZM18.406 4.155C17.61 4.155 16.965 4.8 16.965 5.595C16.965 6.39 17.61 7.035 18.406 7.035C19.201 7.035 19.845 6.39 19.845 5.595C19.845 4.8 19.201 4.155 18.406 4.155Z"/>
                                </svg>
                            </a>
                            <a href="https://www.linkedin.com/company/soulasia-my/" target="_blank"
                               rel="noopener noreferrer"
                               aria-label="LinkedIn">
                                <svg className="w-5 h-5 tb:w-6 tb:h-6 text-white" width="24" height="24"
                                     viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M19 0H5C2.239 0 0 2.239 0 5V19C0 21.761 2.239 24 5 24H19C21.762 24 24 21.761 24 19V5C24 2.239 21.762 0 19 0ZM8 19H5V8H8V19ZM6.5 6.732C5.534 6.732 4.75 5.942 4.75 4.968C4.75 3.994 5.534 3.204 6.5 3.204C7.466 3.204 8.25 3.994 8.25 4.968C8.25 5.942 7.467 6.732 6.5 6.732ZM20 19H17V13.396C17 10.028 13 10.283 13 13.396V19H10V8H13V9.765C14.396 7.179 20 6.988 20 12.241V19Z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                    {/* Menu */}
                    <div>
                        <div className="mb-2 font-normal text-white/80 text-base lp:text-lg full:text-xl">Menu</div>
                        <ul className="space-y-1">
                            <li>
                                <Link href="/for-owners"
                                      className="font-semibold text-white text-white text-base lp:text-lg full:text-xl hover:underline">For
                                    Owners</Link>
                            </li>
                            <li>
                                <Link href="/sustainability"
                                      className="font-semibold text-white text-white text-base lp:text-lg full:text-xl hover:underline">Sustainability</Link>
                            </li>
                        </ul>
                    </div>
                    {/* Company Info */}
                    <div className="text-white">
                        <div className="font-normal text-white/80 text-base lp:text-lg full:text-xl mb-2">Company</div>
                        <div className="font-semibold text-white text-base lp:text-lg full:text-xl mb-1">
                            Soulasia Management Sdn. Bhd.<br/>
                            Registration Number - 202301007902 (1501823-H)
                        </div>
                    </div>
                    {/* Contact Info */}
                    <div className="text-white">
                        <div className="font-normal text-white/80 text-base lp:text-lg full:text-xl mb-2">Contact</div>
                        <div className="font-semibold text-base lp:text-lg full:text-xl mb-1">+60 3 21818729</div>
                        <div className="font-semibold text-base lp:text-lg full:text-xl mb-1">info@soulasia.com.my</div>
                        <div className="font-normal text-white/80 text-sm full:text-base mb-1">B1-22-2, The Soho Suites
                            @KLCC, 20 Jalan Perak 50450, WP Kuala Lumpur, Malaysia
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 tb:grid-cols-4 flex border-t border-gray-700 pt-4 mb-6 gap-4 tb:gap-8">
                    {/* Company Info */}
                    <div className="col-span-1 text-white text-xs tb:text-sm lp:text-base">
                        © {new Date().getFullYear()} Soulasia. <br className="hidden tb:flex lp:hidden"/> All rights
                        reserved.
                    </div>
                    <div className="col-span-3 grid grid-cols-3 gap-8">
                        <Link href="/privacy-policy"
                              className="text-white/80 font-normal text-xs tb:text-sm lp:text-base hover:underline">Privacy
                            Policy</Link>
                        <Link href="/refund-policy"
                              className="text-white/80 font-normal text-xs tb:text-sm lp:text-base hover:underline">Refund
                            Policy</Link>
                        <Link href="/terms"
                              className="text-white/80 font-normal text-xs tb:text-sm lp:text-base hover:underline">Terms
                            & Conditions</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
} 
