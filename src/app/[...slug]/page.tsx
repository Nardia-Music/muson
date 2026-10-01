import { Screen } from "@/components/Screen";
import type { Metadata } from "next";

const titles: Record<string, string> = {
  diploma: "Diploma School", "graded-exams": "Graded examinations", verify: "Certificate verification",
  "basic-school": "Basic School", about: "About MUSON", contact: "Contact", login: "Log in", signup: "Sign up", roadmap: "Demo roadmap",
  candidate: "Student dashboard", "candidate/profile": "My profile", "candidate/register": "Exam registration",
  "candidate/application": "Diploma application", "candidate/theory": "Theory examination", "candidate/practical": "Practical submission",
  "candidate/results": "Results and certificates", "candidate/appeals": "Result appeals",
  admin: "Administration", "admin/applications": "Application review", "admin/application": "Applicant details",
  "admin/schedule": "Entrance examination scheduling", "admin/integrity": "Integrity review", "admin/results": "Publish results",
  "admin/certificates": "Certificate administration", "admin/appeals": "Appeal administration",
  examiner: "Examiner queue", "examiner/marking": "Assessment marking",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${titles[slug.join("/")] || "MUSON"} | MUSON` };
}

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
    "signup",
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
