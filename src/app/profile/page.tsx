import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Pencil } from "lucide-react";

export default function ProfilePage() {
    const avatarImage = PlaceHolderImages.find(p => p.id === 'profile-avatar-1');

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="font-headline text-5xl md:text-6xl primary-gradient gradient-text">
                    Your Profile
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Manage your cosmic identity and preferences.
                </p>
            </div>

            <Card className="glassmorphism">
                <CardHeader className="items-center text-center">
                    <div className="relative w-32 h-32">
                        <Avatar className="w-32 h-32 border-4 border-primary/50">
                            {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt="User Avatar" data-ai-hint={avatarImage.imageHint} />}
                            <AvatarFallback>GG</AvatarFallback>
                        </Avatar>
                        <Button size="icon" className="absolute bottom-0 right-0 rounded-full primary-gradient text-primary-foreground">
                            <Pencil className="w-4 h-4"/>
                        </Button>
                    </div>
                    <CardTitle className="font-headline text-3xl mt-4">Captain Astro</CardTitle>
                    <CardDescription>astro.captain@gourmet-galaxy.com</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" defaultValue="Captain Astro" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue="astro.captain@gourmet-galaxy.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" defaultValue="+1 (234) 567-890" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="address">Default Address</Label>
                            <Input id="address" defaultValue="123 Galactic Avenue, Star City, 90210" />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button size="lg" className="primary-gradient text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

             <div className="mt-12">
                <h2 className="font-headline text-3xl mb-4 text-center">Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="glassmorphism">
                         <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Manage your notification preferences.</CardDescription>
                         </CardHeader>
                         <CardContent>
                             <Button className="w-full">Notification Settings</Button>
                         </CardContent>
                    </Card>
                     <Card className="glassmorphism">
                         <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Change password and manage account security.</CardDescription>
                         </CardHeader>
                         <CardContent>
                             <Button className="w-full">Security Settings</Button>
                         </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
