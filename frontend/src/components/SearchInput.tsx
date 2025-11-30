import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchInput() {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search for a dish or restaurant..."
        className="pl-10 h-12 text-base rounded-full focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:ring-offset-background"
      />
    </div>
  );
}
