"use client";

import { Shop } from "../page";
import { useParams } from "next/navigation";

export default function ShopCategoryPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "new";
  return <Shop slug={slug} />;
}
