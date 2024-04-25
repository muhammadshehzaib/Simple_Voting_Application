import React from "react";
import images1 from "../Images/hero (1).webp";

const HeroSection = () => {
  return (
    <div className="bg-white mt-12">
      <div className="px-3 mx-auto max-w-full pb-10 text-center md:pb-16 ">
        <h1 className="leading-tighter font-heading mb-6 text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
          Explore the world of Voting with React.js + Tailwind CSS
        </h1>
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 text-xl font-normal text-gray-600 dark:text-slate-400">
            "Secure, transparent, and decentralized voting web app leveraging
            Ethereum blockchain for trust and integrity in electoral
            processes.Empowering users with immutable records and cryptographic
            security for voting."
          </p>
        </div>
        <div className="relative m-auto max-w-5xl">
          <img src={images1} alt="" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
