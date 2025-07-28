import React from 'react'
import SocialsMenu from './ui/socials-menu'
import Image from 'next/image';

const SocialDemo = () => {

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

    return (
        <>
            <Image
                src={`/assets/praypepe.png`}
                alt={`idk`}
                width={500}
                height={500}
                className="absolute -bottom-5 -left-5 w-[170px]"
            />
            <div className="relative size-full flex-1  flex items-center justify-center">
                <SocialsMenu SocialLinks={Socials} />
                <p className='font-inter text-lg absolute bottom-0 right-0'>Socials Menu</p>
            </div>
        </>
    )
}

export default SocialDemo  