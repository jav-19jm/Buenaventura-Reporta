import { CityServicesFilter } from "../../components/user/CityServicesFilter";

export function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      <p className="mb-6 max-w-2xl text-gray-700">
        Lugares y entidades de Buenaventura que prestan servicios a la comunidad. También los puedes ver en el mapa.
      </p>
      <CityServicesFilter />
    </div>
  );
}
