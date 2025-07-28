import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import NeumorphButton from './neumorph-button'

interface SocialLinks {
    name: string;
    href: string;
    logo: string;
    className: string;
}


//? need neumorph button from nxttp.
const SocialsMenu = ({
    SocialLinks = Socials,
    className,

}: {
    SocialLinks?: SocialLinks[]
    className?: string
}) => {
    return (
        <div className={cn("flex flex-col gap-1 w-full max-w-[350px] aspect-[433/300]  p-2 rounded-2xl bg-[#212121]", className)}>
            <ul className="flex justify-center gap-1 w-full  items-center h-1/2">
                {SocialLinks.slice(0, 3).map((item, index) => (
                    <li key={index} className="  w-full h-full">
                        <Link
                            href={item.href}
                            target="_blank"
                            className=""
                        >
                            <NeumorphButton className='w-full h-full'>

                                <Image
                                    src={item.logo}
                                    alt={`${item.name} logo`}
                                    width={20}
                                    height={20}
                                    className={cn(`w-[77%] aspect-square`, item.className)}
                                />
                            </NeumorphButton>
                        </Link>
                    </li>
                ))}
            </ul>

            <ul className="flex justify-center gap-1 w-full items-center h-1/2">
                {SocialLinks.slice(3, 6).map((item, index) => (
                    <li key={index} className=" w-full h-full ">
                        <Link
                            href={item.href}
                            target="_blank"
                            className=""
                        >
                            <NeumorphButton className='w-full h-full'>
                                <Image
                                    src={item.logo}
                                    alt={`${item.name} logo`}
                                    width={20}
                                    height={20}
                                    className={cn(`w-[77%] aspect-square`, item.className)}
                                />
                            </NeumorphButton>
                        </Link>
                    </li>
                ))}
            </ul>


        </div>
    )
}

export default SocialsMenu


const Socials = [
    {
        name: "github",
        href: "#",
        logo: "/icons/github.svg",
        className: "p-1.5 ",
    },
    {
        name: "x.com",
        href: "#",
        logo: "/icons/x.svg",
        className: "p-3 ",
    },
    {
        name: "gmail",
        href: "#",
        logo: "/icons/gmail.svg",
        className: "p-0.5 ",
    },
    {
        name: "discord",
        href: "#",
        logo: "/icons/discord.svg",
        className: " p-1.5 ",
    },
    {
        name: "peerlist",
        href: "#",
        logo: "/icons/peerlist.svg",
        className: "p-1.5 ",
    },
    {
        name: "linkedIn",
        href: "#",
        logo: "/icons/linkdin.svg",
        className: "p-2 ",
    },
];

