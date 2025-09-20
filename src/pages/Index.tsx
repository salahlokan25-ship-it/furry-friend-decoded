import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, Heart, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const products = [
  {
    id: 1,
    name: "QuietClip: Stress-Free Pet Nail Trimmer",
    price: "$24.99",
    image: "https://petparadise.it.com/cdn/shop/files/store2image32.png?v=1746823288&width=400",
    description: "Revolutionary quiet nail trimmer that reduces pet anxiety during grooming sessions.",
    category: "Grooming",
    rating: 4.8,
    forPet: "both"
  },
  {
    id: 2,
    name: "PurrFect Paws: Ultimate Cat Grooming Hammock",
    price: "$24.99",
    image: "https://petparadise.it.com/cdn/shop/files/store2image17.png?v=1746803732&width=400",
    description: "Transform nail-trimming from a battle to a calm 5-minute session with this innovative hammock.",
    category: "Grooming",
    rating: 4.9,
    forPet: "cat"
  },
  {
    id: 3,
    name: "TugJoy: Interactive Dog Toy That Bonds & Cleans",
    price: "$19.99",
    image: "https://petparadise.it.com/cdn/shop/files/store2image27.png?v=1746816894&width=400",
    description: "Durable rope toy that survives even the toughest chewers while promoting dental health.",
    category: "Toys",
    rating: 4.7,
    forPet: "dog"
  },
  {
    id: 4,
    name: "TrackTag: Anti-Loss Pet Locators",
    price: "$24.99",
    image: "https://petparadise.it.com/cdn/shop/files/store2image53.png?v=1746890042&width=400",
    description: "Advanced GPS tracking system to keep your beloved pets safe and never lose them again.",
    category: "Safety",
    rating: 4.6,
    forPet: "both"
  },
  {
    id: 5,
    name: "SpaSpray: 2-in-1 Pet Grooming Brush",
    price: "$23.99",
    image: "https://petparadise.it.com/cdn/shop/files/store2image43.png?v=1746871079&width=400",
    description: "Revolutionary grooming brush with built-in spray system for professional results at home.",
    category: "Grooming",
    rating: 4.8,
    forPet: "both"
  }
];

const Index = () => {
  const { toast } = useToast();

  const handleAddToWishlist = (productName: string) => {
    toast({
      title: "Added to Wishlist! ❤️",
      description: `${productName} has been saved to your wishlist.`,
      duration: 3000,
    });
  };

  const handleViewProduct = (productName: string) => {
    toast({
      title: "Opening Pet Paradise Store",
      description: `Redirecting to ${productName} on Pet Paradise...`,
      duration: 3000,
    });
    window.open("https://petparadise.it.com/", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Pet Paradise Store
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Premium pet products recommended by veterinarians and loved by pet parents worldwide
          </p>
          <Badge variant="secondary" className="text-lg px-6 py-2">
            ✨ 50% OFF First Order + Free Worldwide Shipping
          </Badge>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Carefully curated products that enhance your pet's wellbeing and strengthen your bond
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge 
                  className="absolute top-3 left-3" 
                  variant={product.forPet === 'dog' ? 'default' : product.forPet === 'cat' ? 'secondary' : 'outline'}
                >
                  {product.forPet === 'both' ? 'Dogs & Cats' : product.forPet === 'dog' ? 'Dogs' : 'Cats'}
                </Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleAddToWishlist(product.name)}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="mb-2">
                    {product.category}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    {product.rating}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">
                    {product.price}
                  </div>
                  <Button 
                    onClick={() => handleViewProduct(product.name)}
                    className="group/btn"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Shop Now
                    <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
          <h3 className="text-2xl font-bold mb-4">Join 2000+ Happy Pet Parents</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Experience premium quality products with 30-day happiness guarantee, 24/7 expert support, and free worldwide shipping.
          </p>
          <Button size="lg" onClick={() => window.open("https://petparadise.it.com/", "_blank")}>
            <ExternalLink className="h-5 w-5 mr-2" />
            Visit Pet Paradise Store
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
