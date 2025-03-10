import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import * as adminApi from '../../lib/api/admin';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AlertCircle, CheckCircle, Trash2, Ghost, Users as UsersIcon, UserX } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

// User interface from admin API
interface UserWithStatus {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  whatsappConnected: boolean;
  connectionActive: boolean;
  whatsappLastConnection?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Orphaned session interface
interface OrphanedSession {
  id: string;
  connected: boolean;
  path: string;
  createdAt?: Date;
  lastModified?: Date;
  error?: string;
}

const Users = () => {
  // User-related state
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Orphaned sessions state
  const [orphanedSessions, setOrphanedSessions] = useState<OrphanedSession[]>([]);
  const [loadingOrphaned, setLoadingOrphaned] = useState(false);
  const [orphanedError, setOrphanedError] = useState<string | null>(null);
  const [orphanedToDelete, setOrphanedToDelete] = useState<string | null>(null);
  const [isDeletingOrphaned, setIsDeletingOrphaned] = useState(false);
  
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user, isAuthenticated } = state;
  
  // Redirect if not admin
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getUsers();
        setUsers(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Fetch orphaned sessions
  const fetchOrphanedSessions = async () => {
    try {
      setLoadingOrphaned(true);
      const data = await adminApi.getOrphanedSessions();
      setOrphanedSessions(data);
      setOrphanedError(null);
    } catch (err: any) {
      console.error('Failed to fetch orphaned sessions:', err);
      setOrphanedError(err.message || 'Failed to load orphaned sessions');
    } finally {
      setLoadingOrphaned(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    if (value === 'orphaned' && orphanedSessions.length === 0 && !loadingOrphaned) {
      fetchOrphanedSessions();
    }
  };
  
  // Handle WhatsApp session deletion
  const handleDeleteSession = async (userId: string) => {
    try {
      setIsDeleting(true);
      await adminApi.deleteWhatsAppSession(userId);
      
      // Update the user in the list
      setUsers(users.map(u => 
        u._id === userId 
          ? { ...u, whatsappConnected: false, connectionActive: false } 
          : u
      ));
      
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete WhatsApp session:', err);
      setError(err.message || 'Failed to delete WhatsApp session');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle orphaned session deletion
  const handleDeleteOrphanedSession = async (sessionId: string) => {
    try {
      setIsDeletingOrphaned(true);
      await adminApi.deleteOrphanedSession(sessionId);
      
      // Remove the deleted session from the list
      setOrphanedSessions(orphanedSessions.filter(s => s.id !== sessionId));
      
      setOrphanedToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete orphaned session:', err);
      setOrphanedError(err.message || 'Failed to delete orphaned session');
    } finally {
      setIsDeletingOrphaned(false);
    }
  };
  
  // Format date
  const formatDate = (dateString?: Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <DashboardLayout>
      <motion.div 
        className={cn("container mx-auto px-4 py-8")}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-3xl font-bold mb-6 text-zinc-800 dark:text-zinc-100" 
          variants={itemVariants}
        >
          Kullanıcı Yönetimi
        </motion.h1>
        
        <Tabs defaultValue="users" onValueChange={handleTabChange}>
          <TabsList className="mb-6 bg-zinc-100 dark:bg-zinc-800">
            <TabsTrigger 
              value="users" 
              className={cn(
                "flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"
              )}
            >
              <UsersIcon className="h-4 w-4" />
              <span>Kullanıcılar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orphaned" 
              className={cn(
                "flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"
              )}
            >
              <Ghost className="h-4 w-4" />
              <span>Sahipsiz Bağlantılar</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <motion.div variants={itemVariants}>
              <Card className="border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-800">
                <CardHeader className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-700/60">
                  <CardTitle className="text-zinc-800 dark:text-zinc-100">Kullanıcı Listesi</CardTitle>
                  <CardDescription className="text-zinc-500 dark:text-zinc-400">
                    Sistemdeki kullanıcıları ve WhatsApp bağlantı durumlarını yönetin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-6">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  )}
                  
                  {loading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                            <TableHead className="text-zinc-700 dark:text-zinc-300">Kullanıcı Adı</TableHead>
                            <TableHead className="text-zinc-700 dark:text-zinc-300">E-posta</TableHead>
                            <TableHead className="text-zinc-700 dark:text-zinc-300">Rol</TableHead>
                            <TableHead className="text-zinc-700 dark:text-zinc-300">WhatsApp Durumu</TableHead>
                            <TableHead className="text-zinc-700 dark:text-zinc-300">Son Bağlantı</TableHead>
                            <TableHead className="text-zinc-700 dark:text-zinc-300">İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                Henüz kullanıcı bulunmamaktadır.
                              </TableCell>
                            </TableRow>
                          ) : (
                            users.map(user => (
                              <TableRow 
                                key={user._id}
                                className="border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                              >
                                <TableCell className="font-medium text-zinc-800 dark:text-zinc-200">{user.username}</TableCell>
                                <TableCell className="text-zinc-600 dark:text-zinc-400">{user.email}</TableCell>
                                <TableCell>
                                  <Badge 
                                    className="text-white" 
                                    variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                                  >
                                    {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {user.whatsappConnected ? (
                                    user.connectionActive ? (
                                      <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-1" />
                                        <span className="text-green-600 dark:text-green-400">Aktif</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center">
                                        <AlertCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mr-1" />
                                        <span className="text-yellow-600 dark:text-yellow-400">Bağlı Değil</span>
                                      </div>
                                    )
                                  ) : (
                                    <div className="flex items-center">
                                      <UserX className="h-4 w-4 text-zinc-400 dark:text-zinc-500 mr-1" />
                                      <span className="text-zinc-500 dark:text-zinc-400">Kurulmadı</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-zinc-600 dark:text-zinc-400">
                                  {formatDate(user.whatsappLastConnection)}
                                </TableCell>
                                <TableCell>
                                  {user.whatsappConnected && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          className="text-red-500 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20"
                                          onClick={() => setUserToDelete(user._id)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-1" />
                                          Bağlantıyı Sil
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-zinc-800 dark:text-zinc-100">WhatsApp Bağlantısını Sil</AlertDialogTitle>
                                          <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400">
                                            Bu işlem kullanıcının WhatsApp bağlantısını silecek ve yeniden QR kod okutması gerekecektir. Devam etmek istiyor musunuz?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                                            İptal
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                                            onClick={() => handleDeleteSession(userToDelete!)}
                                            disabled={isDeleting}
                                          >
                                            {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* Orphaned Sessions Tab */}
          <TabsContent value="orphaned">
            <motion.div variants={itemVariants}>
              <Card className="border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-800">
                <CardHeader className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-700/60">
                  <CardTitle className="text-zinc-800 dark:text-zinc-100">Sahipsiz WhatsApp Bağlantıları</CardTitle>
                  <CardDescription className="text-zinc-500 dark:text-zinc-400">
                    Herhangi bir kullanıcıya bağlı olmayan WhatsApp oturumlarını yönetin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {orphanedError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-6">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                        <p className="text-sm">{orphanedError}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end mb-4">
                    <Button 
                      onClick={fetchOrphanedSessions}
                      disabled={loadingOrphaned}
                      className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                    >
                      {loadingOrphaned ? 'Yükleniyor...' : 'Bağlantıları Yenile'}
                    </Button>
                  </div>
                  
                  {loadingOrphaned ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                            <TableHead className="text-zinc-700 dark:text-zinc-300">Oturum ID</TableHead>
                            <TableHead className="text-zinc-700 dark:text-zinc-300">Durum</TableHead>
                            <TableHead className="text-zinc-700 dark:text-zinc-300">Oluşturulma</TableHead>
                            <TableHead className="text-zinc-700 dark:text-zinc-300">Son Değişiklik</TableHead>
                            <TableHead className="text-zinc-700 dark:text-zinc-300">İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orphanedSessions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                Sahipsiz bağlantı bulunmamaktadır.
                              </TableCell>
                            </TableRow>
                          ) : (
                            orphanedSessions.map(session => (
                              <TableRow 
                                key={session.id}
                                className="border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                              >
                                <TableCell className="font-medium text-zinc-800 dark:text-zinc-200">
                                  {session.id.substring(0, 8)}...
                                </TableCell>
                                <TableCell>
                                  {session.connected ? (
                                    <div className="flex items-center">
                                      <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-1" />
                                      <span className="text-green-600 dark:text-green-400">Aktif</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <AlertCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mr-1" />
                                      <span className="text-yellow-600 dark:text-yellow-400">Bağlantı Kesildi</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-zinc-600 dark:text-zinc-400">
                                  {formatDate(session.createdAt)}
                                </TableCell>
                                <TableCell className="text-zinc-600 dark:text-zinc-400">
                                  {formatDate(session.lastModified)}
                                </TableCell>
                                <TableCell>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-red-500 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => setOrphanedToDelete(session.id)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Bağlantıyı Sil
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-zinc-800 dark:text-zinc-100">Sahipsiz Bağlantıyı Sil</AlertDialogTitle>
                                        <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400">
                                          Bu işlem sahipsiz WhatsApp bağlantısını tamamen silecektir. Devam etmek istiyor musunuz?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                                          İptal
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                                          onClick={() => handleDeleteOrphanedSession(orphanedToDelete!)}
                                          disabled={isDeletingOrphaned}
                                        >
                                          {isDeletingOrphaned ? 'Siliniyor...' : 'Evet, Sil'}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default Users; 