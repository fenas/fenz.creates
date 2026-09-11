import { redirect } from "next/navigation";
import { initialTutorials } from "@/data/tutorialsData";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return initialTutorials.map((t) => ({
    slug: t.slug,
  }));
}

export default async function TutorialsRedirectPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/tutorial/${slug}`);
}
