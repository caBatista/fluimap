"use client";

import { useRouter } from "next/navigation";
import { SurveyForm } from "@/components/surveys/surveys-form";

export default function CreateSurveyPage() {
  const router = useRouter();

  return (
    <main className="p-6">
      <SurveyForm onSuccess={() => router.push("/surveys")} />
    </main>
  );
}
