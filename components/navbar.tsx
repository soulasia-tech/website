'use client';

import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, {useEffect, useState} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {User as SupabaseUser} from '@supabase/supabase-js';
import Image from 'next/image';
import {BookingWidgetNew} from "@/components/booking-widget-new";
import {cn} from "@/lib/utils";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useUI} from "@/lib/context";

type NavbarProps = {
    className?: string;
};

const LINKS = [
    {href: '/for-owners', label: 'For Owners'},
    {href: '/partnership', label: 'Partnership'},
    {href: '/sustainability', label: 'Sustainability'},
];

export function Navbar({className}: NavbarProps) {
    const { isActive, setIsActive } = useUI();
    const { isDark, setIsDark } = useUI();

    // Get search parameters
    const searchParams = useSearchParams();
    const city = searchParams.get('city');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const adults = searchParams.get('adults');
    const children = searchParams.get('children');
    const apartments = parseInt(searchParams.get('apartments') || '1', 10);

    // Create initial search params object for BookingWidget
    const initialSearchParams = {
        city: city || '',
        startDate: startDate || '',
        endDate: endDate || '',
        adults: adults || '2',
        children: children || '0',
        apartments: apartments.toString(),
    };

    const pathname = usePathname();

    useEffect(() => {
        const dark = document.querySelector(".dark-header");
        if (!dark) {
            setIsDark(false); // no hero → always white
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            setIsDark(entry.isIntersecting);
        }, {threshold: 0.1});

        observer.observe(dark);
        return () => observer.disconnect();
    }, [pathname]);


    useEffect(() => {
        const search = document.querySelector(".search-widget");
        if (!search) {
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if(window.innerWidth >= 768) {
                setIsActive(!entry.isIntersecting);
            }
        }, {threshold: 0.1});

        observer.observe(search);
        return () => observer.disconnect();
    }, [pathname]);

    const [user, setUser] = useState<SupabaseUser | null>(null);
    const supabase = createClientComponentClient();
    const router = useRouter();

    // Check auth state
    useEffect(() => {
        const getUser = async () => {
            const {data: {user}} = await supabase.auth.getUser();
            setUser(user);
        };

        getUser().then();

        // Listen for auth changes
        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        if (pathname === '/my-bookings') {
            router.push('/');
        }
    };

    const toggle = () => {
        setIsActive(!isActive);
    };

    const [citySelectOpen, setCitySelectOpen] = useState(false)
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);
    const [guestsPopoverOpen, setGuestsPopoverOpen] = useState(false);

    return (
        <>
            <header
                className={[
                    'fixed inset-x-0 top-0 z-50',
                    isDark ? 'bg-transparent border-transparent'
                        : 'bg-[#f8f9fb] supports-[backdrop-filter]:backdrop-blur border-b border-b-[#dee3ed]',
                    'transition-colors',
                    className ?? '',
                ].join(' ')}
                style={{height: 'var(--nav-h)'}}
            >
                <div className="container h-full">
                    <div className="flex h-full items-center justify-between gap-4">
                        <div className="flex h-full items-center">
                            {/* Brand */}
                            <Link href="/" aria-label="Soulasia home"
                                  className="cursor-pointer inline-flex items-center mr-20 shrink-0">
                                <Image
                                    src={isDark ? '/Brand/logo-fill.svg' : '/Brand/logo.svg'}
                                    alt="Soulasia"
                                    width={168}
                                    height={36}
                                    priority
                                    className="h-auto w-[var(--logo-w)]"
                                />
                            </Link>

                            {/* Laptop+ inline nav */}
                            <nav
                                className={[
                                    'hidden lp:flex ml-5 items-center gap-8 text-base font-normal tracking-[-0.01em] mr-8',
                                    isDark ? 'text-white' : 'text-gray-900',
                                ].join(' ')}
                            >
                                {LINKS.map((l) => (
                                    <Link key={l.href} href={l.href} className="hover:opacity-85 transition-opacity">
                                        {l.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div className="flex items-center tb:gap-4 gap-2">
                            {/* Actions */}
                            <Button
                                type="submit"
                                size="responsive"
                                variant="default"
                                className={[
                                    'lp:hidden flex items-center justify-center bg-[#0E3599] hover:bg-[#0b297a]',
                                    'text-white font-medium h-[var(--login-btn)] px-4',
                                ].join(' ')}
                                onClick={() => toggle()}
                            >
                                {!isActive ? 'Search' : 'Close'}
                            </Button>

                            <div className="flex items-center gap-2">
                                {user ? (
                                    <>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    aria-label="Open menu"
                                                    className={[
                                                        'flex h-[--btn-h] w-[--btn-h] items-center justify-center transition-colors',
                                                    ].join(' ')}
                                                >
                                                <span
                                                    className={[
                                                        'flex items-center justify-center w-8 h-8 lp:w-10 lp:h-10 rounded-full font-medium text-base lp:text-lg',
                                                        (isDark ? 'text-[#101828] bg-gray-50' : 'bg-[#0E3599] text-white')
                                                    ].join(' ')}
                                                >
                                                  {(() => {
                                                      return user.user_metadata?.first_name?.[0];
                                                  })()}
                                                </span>
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                {LINKS.map((l) => (
                                                    <DropdownMenuItem key={l.href} asChild
                                                                      className="lp:hidden flex items-center cursor-pointer">
                                                        <Link href={l.href}>{l.label}</Link>
                                                    </DropdownMenuItem>
                                                ))}
                                                <DropdownMenuSeparator className="lp:hidden"/>
                                                <DropdownMenuItem asChild>
                                                    <Link href="/my-bookings"
                                                          className="flex items-center cursor-pointer gap-2">
                                                        <svg className="w-4 h-4" width="24" height="24"
                                                             viewBox="0 0 24 24"
                                                             fill="none"
                                                             xmlns="http://www.w3.org/2000/svg">
                                                            <path
                                                                d="M2 21V6H8V2H16V6H22V21H2ZM9.5 6H14.5V3.5H9.5V6ZM6.175 7.5H3.5V19.5H6.175V7.5ZM16.35 19.5V7.5H7.675V19.5H16.35ZM17.85 7.5V19.5H20.5V7.5H17.85Z"
                                                                fill="#101828"/>
                                                        </svg>
                                                        My bookings
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={handleSignOut}
                                                                  className="flex items-center cursor-pointer gap-2">
                                                    <svg className="w-4 h-4" width="24" height="24" viewBox="0 0 24 24"
                                                         fill="none"
                                                         xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M3 21V3H11.975V4.5H4.5V19.5H11.975V21H3ZM16.65 16.375L15.575 15.3L18.125 12.75H9V11.25H18.075L15.525 8.7L16.6 7.625L21 12.025L16.65 16.375Z"
                                                            fill="black"/>
                                                    </svg>
                                                    Sign out
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/auth/sign-in" className="hidden tb:flex">
                                            <Button
                                                size="responsive"
                                                variant="outline"
                                                className={[
                                                    'h-[var(--login-btn)] px-4 bg-transparent rounded-md font-medium  ',
                                                    isDark
                                                        ? 'border-white hover:text-white text-white hover:bg-white/10'
                                                        : 'border-gray-900 text-gray-900 hover:bg-black/5',
                                                ].join(' ')}
                                            >
                                                Log In
                                            </Button>
                                        </Link>
                                        {/* Phone/Tablet: burger + (tablet shows small login) */}
                                        <div className="lp:hidden flex items-center">
                                            <MobileMenu isDark={isDark}/>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className={cn("bg-[#f8f9fb] w-full border-b border-b-[#dee3ed] h-max mt-[-1px] py-3 flex justify-center", !isDark && isActive ? 'flex' : 'hidden')}>
                    <div className={cn("container mx-auto")}>
                        <BookingWidgetNew
                            initialSearchParams={initialSearchParams}
                            guestsPopoverOpen={guestsPopoverOpen}
                            setGuestsPopoverOpen={setGuestsPopoverOpen}
                            citySelectOpen={citySelectOpen}
                            setCitySelectOpen={setCitySelectOpen}
                            datePopoverOpen={datePopoverOpen}
                            setDatePopoverOpen={setDatePopoverOpen}
                        />
                    </div>
                </div>
            </header>
            {(guestsPopoverOpen || citySelectOpen || datePopoverOpen) && (
                <div
                    className="fixed inset-0 z-40 bg-black/20"
                    onClick={() => {
                        setGuestsPopoverOpen(false)
                        setCitySelectOpen(false)
                    }}
                />
            )}
        </>
    )
}



function MobileMenu({isDark}: { isDark: boolean }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    aria-label="Open menu"
                    className={[
                        'flex h-[--btn-h] w-[--btn-h] items-center justify-center transition-colors',
                    ].join(' ')}
                >
                    {/* hamburger */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M3.75 18C3.5375 18 3.35941 17.9277 3.21575 17.783C3.07191 17.6385 3 17.4594 3 17.2455C3 17.0319 3.07191 16.8541 3.21575 16.7125C3.35941 16.5708 3.5375 16.5 3.75 16.5H20.25C20.4625 16.5 20.6406 16.5723 20.7845 16.717C20.9282 16.8615 21 17.0406 21 17.2545C21 17.4681 20.9282 17.6459 20.7845 17.7875C20.6406 17.9292 20.4625 18 20.25 18H3.75ZM3.75 12.75C3.5375 12.75 3.35941 12.6776 3.21575 12.533C3.07191 12.3885 3 12.2093 3 11.9955C3 11.7818 3.07191 11.6041 3.21575 11.4625C3.35941 11.3208 3.5375 11.25 3.75 11.25H20.25C20.4625 11.25 20.6406 11.3224 20.7845 11.467C20.9282 11.6115 21 11.7907 21 12.0045C21 12.2182 20.9282 12.3959 20.7845 12.5375C20.6406 12.6792 20.4625 12.75 20.25 12.75H3.75ZM3.75 7.5C3.5375 7.5 3.35941 7.42765 3.21575 7.283C3.07191 7.1385 3 6.95935 3 6.7455C3 6.53185 3.07191 6.35415 3.21575 6.2125C3.35941 6.07085 3.5375 6 3.75 6H20.25C20.4625 6 20.6406 6.07235 20.7845 6.217C20.9282 6.3615 21 6.54065 21 6.7545C21 6.96815 20.9282 7.14585 20.7845 7.2875C20.6406 7.42915 20.4625 7.5 20.25 7.5H3.75Z"
                            fill={isDark ? 'white' : '#101828'}/>
                    </svg>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {LINKS.map((l) => (
                    <DropdownMenuItem key={l.href} asChild>
                        <Link href={l.href}>{l.label}</Link>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="tb:hidden"/>
                <DropdownMenuItem asChild>
                    <Link href="/auth/sign-in"
                          className="tb:hidden flex items-center cursor-pointer gap-1">
                        <svg className="w-4 h-4" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M4 3V21H12.975V19.5H5.5V4.5H12.975V3H4Z"
                                  fill="black"/>
                            <path
                                d="M12.5502 16.5L13.6679 15.425L11.4752 12.875H20.5V11.375H11.4252L13.6679 8.825L12.5002 7.75L8.50035 12.15L12.5502 16.5Z"
                                fill="black"/>
                        </svg>
                        Log In
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
