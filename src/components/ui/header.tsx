import { Button } from "./button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "./navigation-menu";
import { Menu, MoveRight, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";

function Header1() {
    const { state: authState, logout } = useAuth();
    const navigationItems = [
        {
            title: "Ana Sayfa",
            href: "/",
            description: "",
        },
        {
            title: "Özellikler",
            description: "WhatsApp üzerinden iş süreçlerinizi yönetin.",
            items: [
                {
                    title: "Mesaj Gönderme",
                    href: "/dashboard/send-message",
                },
                {
                    title: "Grup Yönetimi",
                    href: "/dashboard/groups",
                },
                {
                    title: "Zamanlanmış Mesajlar",
                    href: "/dashboard/scheduled-messages",
                },
                {
                    title: "Özel Gün Bildirimleri",
                    href: "/dashboard/special-events",
                },
            ],
        },
        {
            title: "Hakkımızda",
            description: "WhatsApp Mesaj sistemi ile tanışın.",
            items: [
                {
                    title: "Biz Kimiz",
                    href: "/about",
                },
                {
                    title: "İletişim",
                    href: "/contact",
                },
            ],
        },
    ];

    const [isOpen, setOpen] = useState(false);
    return (
        <header className="w-full z-40 fixed top-0 left-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-zinc-800/10 transition-all duration-300">
            <div className="container relative mx-auto min-h-20 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center px-4">
                <div className="justify-start items-center gap-4 lg:flex hidden flex-row">
                    <NavigationMenu className="flex justify-start items-start">
                        <NavigationMenuList className="flex justify-start gap-4 flex-row">
                            {navigationItems.map((item) => (
                                <NavigationMenuItem key={item.title}>
                                    {item.href ? (
                                        <>
                                            <NavigationMenuLink asChild>
                                                <Link to={item.href}>
                                                    <Button variant="ghost" className="text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                                        {item.title}
                                                    </Button>
                                                </Link>
                                            </NavigationMenuLink>
                                        </>
                                    ) : (
                                        <>
                                            <NavigationMenuTrigger className="font-medium text-sm text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                                {item.title}
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent className="!w-[450px] p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                                <div className="flex flex-col lg:grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col h-full justify-between">
                                                        <div className="flex flex-col">
                                                            <p className="text-base text-zinc-800 dark:text-zinc-200">{item.title}</p>
                                                            <p className="text-muted-foreground text-sm">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                        <Button size="sm" className="mt-10 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700">
                                                            Şimdi Başla
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-col text-sm h-full justify-end">
                                                        {item.items?.map((subItem) => (
                                                            <NavigationMenuLink
                                                                asChild
                                                                key={subItem.title}
                                                                className="flex flex-row justify-between items-center hover:bg-zinc-100 dark:hover:bg-zinc-800 py-2 px-4 rounded"
                                                            >
                                                                <Link to={subItem.href} className="flex w-full justify-between items-center">
                                                                    <span className="text-zinc-700 dark:text-zinc-300">{subItem.title}</span>
                                                                    <MoveRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                                                                </Link>
                                                            </NavigationMenuLink>
                                                        ))}
                                                    </div>
                                                </div>
                                            </NavigationMenuContent>
                                        </>
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="flex lg:justify-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            <span className="text-indigo-600 dark:text-indigo-400">WhatsApp</span> Mesajcı
                        </span>
                    </Link>
                </div>
                <div className="flex justify-end w-full gap-4 items-center">
                    <ThemeToggle />
                    {authState?.isAuthenticated ? (
                      <>
                        <Link to="/dashboard">
                          <Button variant="outline" className="hidden md:inline border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100">
                              Dashboard'a Git
                          </Button>
                        </Link>
                        <Button onClick={logout} variant="outline" className="hidden md:inline border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100">
                            Çıkış Yap
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link to="/login">
                            <Button variant="outline" className="hidden md:inline border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100">
                                Giriş Yap
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">
                                Kayıt Ol
                            </Button>
                        </Link>
                      </>
                    )}
                </div>
                <div className="flex w-12 shrink lg:hidden items-end justify-end">
                    <Button variant="ghost" onClick={() => setOpen(!isOpen)} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                    {isOpen && (
                        <div className="absolute top-20 border-t border-zinc-200 dark:border-zinc-800 flex flex-col w-full right-0 bg-white dark:bg-zinc-900 shadow-lg py-4 container gap-8 z-50">
                            {navigationItems.map((item) => (
                                <div key={item.title}>
                                    <div className="flex flex-col gap-2">
                                        {item.href ? (
                                            <Link
                                                to={item.href}
                                                className="flex justify-between items-center"
                                            >
                                                <span className="text-lg text-zinc-700 dark:text-zinc-300">{item.title}</span>
                                                <MoveRight className="w-4 h-4 stroke-1 text-zinc-400 dark:text-zinc-600" />
                                            </Link>
                                        ) : (
                                            <p className="text-lg text-zinc-700 dark:text-zinc-300">{item.title}</p>
                                        )}
                                        {item.items &&
                                            item.items.map((subItem) => (
                                                <Link
                                                    key={subItem.title}
                                                    to={subItem.href}
                                                    className="flex justify-between items-center pl-4"
                                                >
                                                    <span className="text-zinc-500 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                                                        {subItem.title}
                                                    </span>
                                                    <MoveRight className="w-4 h-4 stroke-1 text-zinc-400 dark:text-zinc-600" />
                                                </Link>
                                            ))}
                                    </div>
                                </div>
                            ))}
                            <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                {authState?.isAuthenticated ? (
                                  <>
                                    <Link to="/dashboard" className="w-full">
                                        <Button variant="outline" className="w-full border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            Dashboard'a Git
                                        </Button>
                                    </Link>
                                    <Button onClick={logout} variant="outline" className="w-full border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                        Çıkış Yap
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Link to="/login" className="w-full">
                                        <Button variant="outline" className="w-full border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            Giriş Yap
                                        </Button>
                                    </Link>
                                    <Link to="/register" className="w-full">
                                        <Button className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">
                                            Kayıt Ol
                                        </Button>
                                    </Link>
                                  </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export { Header1 }; 