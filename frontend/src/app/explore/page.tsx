import ExplorePageClient from "./ExplorePageClient";

export default async function ExplorePage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants`, {
    next: { revalidate: 0 },
  });

  const restaurants = await res.json();

  const allFoods = restaurants.flatMap((restaurant: any) =>
    restaurant.menu?.map((food: any) => ({
      id: food.id,
      name: food.name,
      price: food.price,
      category: food.category,
      imageUrl: food.imageUrl,
      restaurant: restaurant.name,
    })) || []
  );

  return <ExplorePageClient allFoods={allFoods} />;
}
