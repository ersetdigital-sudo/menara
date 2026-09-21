import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { cookies } from "next/headers";

export default async function PesananLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";

  const isLoginPage = pathname === "/pesanan/login";

  if (!isLoginPage) {
    const cookieStore = await cookies();
    const token = cookieStore.get("pesanan_auth")?.value;

    if (!token) {
      redirect("/pesanan/login");
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-[#111113]">{children}</div>
  );
}
