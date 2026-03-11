import { notFound } from "next/navigation";
import { ServicePage } from "@/components/service-page";
import { getServicePage, servicePages } from "@/components/service-data";

export function generateStaticParams() {
  return servicePages.map((service) => ({ slug: service.slug }));
}

export function generateMetadata({ params }) {
  const service = getServicePage(params.slug);

  if (!service) {
    return { title: "Service" };
  }

  return {
    title: service.name
  };
}

export default function Page({ params }) {
  const service = getServicePage(params.slug);

  if (!service) {
    notFound();
  }

  return <ServicePage service={service} />;
}
