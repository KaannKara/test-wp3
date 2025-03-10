import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Loader2 } from 'lucide-react';
import { useWhatsApp } from '../../contexts/WhatsAppContext';

export default function Settings() {
  const { silentMessageMode, loading, setSilentMessageMode, error } = useWhatsApp();
  const [localSilentMode, setLocalSilentMode] = useState(silentMessageMode);

  useEffect(() => {
    setLocalSilentMode(silentMessageMode);
  }, [silentMessageMode]);

  const handleSilentModeChange = async () => {
    try {
      await setSilentMessageMode(!localSilentMode);
      console.log(`Sessiz mesaj modu ${!localSilentMode ? 'etkinleştirildi' : 'devre dışı bırakıldı'}.`);
    } catch (error) {
      console.error('Sessiz mesaj modu güncellenirken bir hata oluştu.', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Ayarlar</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Ayarları</CardTitle>
            <CardDescription>
              WhatsApp bağlantınızla ilgili ayarları yapılandırın
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Sessiz Mesaj Modu</h3>
                <p className="text-sm text-muted-foreground">
                  WhatsApp mesajları geldiğinde sayfanın otomatik yenilenmesini engeller. 
                  Bu özelliği etkinleştirmek, uygulama performansını artırır.
                </p>
              </div>
              
              {/* Basit Toggle Düğmesi */}
              <div 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${localSilentMode ? 'bg-green-500' : 'bg-gray-200'}`}
                onClick={() => {
                  if (!loading.silentMode) {
                    setLocalSilentMode(!localSilentMode);
                    handleSilentModeChange();
                  }
                }}
              >
                <span 
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${localSilentMode ? 'translate-x-6' : 'translate-x-1'}`} 
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              {loading.silentMode ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ayarlar güncelleniyor...
                </span>
              ) : (
                `Son güncelleme: ${new Date().toLocaleString()}`
              )}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 