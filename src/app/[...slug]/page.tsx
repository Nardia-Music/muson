import { Screen } from "@/components/Screen";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    "diploma",
    "graded-exams",
    "verify",
    "basic-school",
    "about",
    "contact",
    "login",
    "roadmap",
    "candidate",
    "candidate/profile",
    "candidate/register",
    "candidate/application",
    "candidate/theory",
    "candidate/practical",
    "candidate/results",
    "candidate/appeals",
    "admin",
    "admin/applications",
    "admin/application",
    "admin/schedule",
    "admin/integrity",
    "admin/results",
    "admin/certificates",
    "admin/appeals",
    "examiner",
    "examiner/marking",
  ].map((path) => ({ slug: path.split("/") }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return <Screen path={slug.join("/")} />;
}
