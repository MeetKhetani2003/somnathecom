"use client";

import { Breadcrumb } from "@/components/UI";
import { IconArrowRight } from "@/components/Icons";
import { navigate } from "@/store";

export default function WishlistPage() {
  return (
    <div className="page-enter pt-24 lg:pt-32 pb-24">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}/>
        <div className="mt-12 lg:mt-20">
          <h1 className="editorial-h text-ink text-[56px] md:text-[88px] lg:text-[112px]">Saved.</h1>
          <p className="serif-h text-[22px] lg:text-[28px] text-muted mt-6 max-w-2xl leading-[1.4]">
            Sign in to sync your saved pieces across devices.
          </p>
          <button onClick={() => navigate("/account")} className="mt-10 btn-fill">Sign In <IconArrowRight size={14}/></button>
        </div>
      </div>
    </div>
  );
}
