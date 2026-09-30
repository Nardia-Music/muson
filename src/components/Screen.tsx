"use client";

import { Suspense } from "react";
import {
  Overview,
  Profile,
  Register,
  Theory,
  Practical,
  Results,
  Appeals,
} from "@/features/Candidate";
import {
  AdminOverview,
  GradingQueue,
  Marking,
  Integrity,
  PublishResults,
  IssueCertificates,
  AdminAppeals,
} from "@/features/Staff";
import {
  DiplomaApplication,
  ApplicationQueue,
  ApplicationReview,
  Scheduling,
} from "@/features/Admissions";
import {
  Home,
  Diploma,
  GradedExams,
  Verify,
  BasicSchool,
  About,
  Contact,
  Login,
  Roadmap,
} from "@/features/Public";

const screens = {
  "/": Home,
  diploma: Diploma,
  "graded-exams": GradedExams,
  verify: Verify,
  "basic-school": BasicSchool,
  about: About,
  contact: Contact,
  login: Login,
  roadmap: Roadmap,
  candidate: Overview,
  "candidate/profile": Profile,
  "candidate/register": Register,
  "candidate/application": DiplomaApplication,
  "candidate/theory": Theory,
  "candidate/practical": Practical,
  "candidate/results": Results,
  "candidate/appeals": Appeals,
  admin: AdminOverview,
  "admin/applications": ApplicationQueue,
  "admin/application": ApplicationReview,
  "admin/schedule": Scheduling,
  "admin/integrity": Integrity,
  "admin/results": PublishResults,
  "admin/certificates": IssueCertificates,
  "admin/appeals": AdminAppeals,
  examiner: GradingQueue,
  "examiner/marking": Marking,
};

export function Screen({ path }: { path: string }) {
  const View = screens[path as keyof typeof screens];
  return (
    <Suspense fallback={<div className="loading">Opening workspace...</div>}>
      <View />
    </Suspense>
  );
}
