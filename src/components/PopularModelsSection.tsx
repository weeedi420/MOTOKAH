import { Link } from "react-router-dom";

const models = [
  { make: "toyota",     model: "alphard",      label: "Toyota Alphard",      price: "KES 3.5M+" },
  { make: "toyota",     model: "harrier",      label: "Toyota Harrier",      price: "KES 1.8M+" },
  { make: "toyota",     model: "fielder",      label: "Toyota Fielder",      price: "KES 700K+" },
  { make: "toyota",     model: "probox",       label: "Toyota Probox",       price: "KES 350K+" },
  { make: "toyota",     model: "vitz",         label: "Toyota Vitz",         price: "KES 400K+" },
  { make: "mazda",      model: "demio",        label: "Mazda Demio",         price: "KES 550K+" },
  { make: "honda",      model: "vezel",        label: "Honda Vezel",         price: "KES 1.2M+" },
  { make: "subaru",     model: "forester",     label: "Subaru Forester",     price: "KES 750K+" },
  { make: "toyota",     model: "land-cruiser", label: "Toyota Land Cruiser", price: "KES 3M+"   },
  { make: "toyota",     model: "hilux",        label: "Toyota Hilux",        price: "KES 1.2M+" },
  { make: "nissan",     model: "x-trail",      label: "Nissan X-Trail",      price: "KES 1M+"   },
  { make: "toyota",     model: "prado",        label: "Toyota Prado",        price: "KES 4M+"   },
];

export default function PopularModelsSection() {
  return (
    <section className="py-12 border-b border-border">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-extrabold text-foreground mb-2">Browse by Model</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Find prices, listings and buying guides for the most popular cars in East Africa.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {models.map(({ make, model, label, price }) => (
            <Link
              key={`${make}-${model}`}
              to={`/cars/${make}/${model}`}
              className="flex flex-col items-center justify-center p-3 bg-card border border-border rounded-xl hover:border-primary hover:shadow-sm transition-all text-center group"
            >
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                {label}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{price}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
