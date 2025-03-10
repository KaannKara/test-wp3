import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useWhatsApp } from '../../contexts/WhatsAppContext';
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { AlertCircle, CheckCircle2, Calendar, FileText, Trash2 } from "lucide-react";
import { SpecialEvent, BirthdayEvent, PolicyEvent } from '../../lib/types/whatsapp';
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

const SpecialEvents = () => {
  const { 
    connectionStatus,
    error: contextError, 
    loading,
    excelFiles, 
    specialEvents,
    createBirthdayEvent, 
    createPolicyEvent, 
    deleteSpecialEvent, 
    uploadExcelFile
  } = useWhatsApp();
  
  // Event type states
  const [activeTab, setActiveTab] = useState("birthdays");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFileHeaders, setSelectedFileHeaders] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setLocalError] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  
  // Birthday specific states
  const [birthdayDateColumn, setBirthdayDateColumn] = useState<string | null>(null);
  const [birthdayNameColumn, setBirthdayNameColumn] = useState<string | null>(null);
  const [birthdayPhoneColumn, setBirthdayPhoneColumn] = useState<string | null>(null);
  const [birthdayTemplate, setBirthdayTemplate] = useState(
    "🎂 Değerli Müşterimiz {{AD_SOYAD}},\n\nDoğum gününüzü en içten dileklerimizle kutlarız! Nice mutlu ve sağlıklı yıllara...\n\nBizi tercih ettiğiniz için teşekkür ederiz.\n\nSaygılarımızla,\n[ŞİRKET ADI]"
  );
  const [birthdayDaysAdvance, setBirthdayDaysAdvance] = useState(0);
  const [birthdayTime, setBirthdayTime] = useState("09:00");
  
  // Policy notification specific states
  const [policyDateColumn, setPolicyDateColumn] = useState<string | null>(null);
  const [policyNumberColumn, setPolicyNumberColumn] = useState<string | null>(null);
  const [policyNameColumn, setPolicyNameColumn] = useState<string | null>(null);
  const [policyPhoneColumn, setPolicyPhoneColumn] = useState<string | null>(null);
  const [policyTemplate, setPolicyTemplate] = useState(
    "📝 Değerli Müşterimiz {{AD_SOYAD}},\n\n{{POLİÇE_NO}} numaralı poliçenizin bitiş tarihi {{BİTİŞ_TARİHİ}} tarihinde sona erecektir.\n\nPoliçenizi yenilemek için lütfen bizimle iletişime geçiniz.\n\nSaygılarımızla,\n[ŞİRKET ADI]"
  );
  const [policyDaysBefore, setPolicyDaysBefore] = useState(7);
  const [policyTime, setPolicyTime] = useState("10:00");
  
  // Load file headers when selected file changes
  useEffect(() => {
    if (selectedFile) {
      const file = excelFiles.find(f => f._id === selectedFile);
      if (file) {
        setSelectedFileHeaders(file.headers);
      }
    }
  }, [selectedFile, excelFiles]);
  
  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const result = await uploadExcelFile(file) as any;
        
        if (result && typeof result === 'object' && result._id) {
          setSelectedFile(result._id);
        }
        
        // Clear input value to allow uploading the same file again
        e.target.value = '';
      } catch (error) {
        console.error('File upload error:', error);
      }
    }
  };
  
  // Handle file selection
  const handleFileSelection = (fileId: string) => {
    setSelectedFile(fileId);
  };

  // Handle birthday setup form submit
  const handleBirthdaySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !birthdayDateColumn || !birthdayNameColumn || !birthdayPhoneColumn) {
      setLocalError('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    
    try {
      await createBirthdayEvent({
        name: name || 'Doğum Günü Bildirimi',
        excelFileId: selectedFile,
        dateColumn: birthdayDateColumn,
        nameColumn: birthdayNameColumn,
        phoneColumn: birthdayPhoneColumn,
        daysAdvance: birthdayDaysAdvance,
        sendTime: birthdayTime,
        messageTemplate: birthdayTemplate
      });
      
      setSuccess('Doğum günü bildirimleri başarıyla ayarlandı!');
      setLocalError(null);
      
      // Form alanlarını temizle
      setName('');
      setBirthdayDateColumn(null);
      setBirthdayNameColumn(null);
      setBirthdayPhoneColumn(null);
      setBirthdayDaysAdvance(0);
      setBirthdayTime('09:00');
    } catch (error) {
      console.error('Birthday setup error:', error);
      setLocalError('Doğum günü ayarları kaydedilirken bir hata oluştu');
    }
  };
  
  // Handle policy notification setup form submit
  const handlePolicySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !policyDateColumn || !policyNumberColumn || !policyPhoneColumn) {
      setLocalError('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    
    try {
      await createPolicyEvent({
        name: name || 'Poliçe Bildirimi',
        excelFileId: selectedFile,
        dateColumn: policyDateColumn,
        policyNumberColumn: policyNumberColumn,
        nameColumn: policyNameColumn || '',
        phoneColumn: policyPhoneColumn,
        daysBefore: policyDaysBefore,
        sendTime: policyTime,
        messageTemplate: policyTemplate
      });
      
      setSuccess('Poliçe bildirimleri başarıyla ayarlandı!');
      setLocalError(null);
      
      // Form alanlarını temizle
      setName('');
      setPolicyDateColumn(null);
      setPolicyNumberColumn(null);
      setPolicyNameColumn(null);
      setPolicyPhoneColumn(null);
      setPolicyDaysBefore(7);
      setPolicyTime('10:00');
    } catch (error) {
      console.error('Policy setup error:', error);
      setLocalError('Poliçe ayarları kaydedilirken bir hata oluştu');
    }
  };
  
  // Handle deleting a scheduled event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteSpecialEvent(eventId);
      setSuccess('Etkinlik başarıyla silindi!');
      setLocalError(null);
    } catch (error) {
      console.error('Event deletion error:', error);
      setLocalError('Etkinlik silinirken bir hata oluştu');
    }
  };
  
  // Doğum günü bildirimi için tip dönüşümü
  const getBirthdayDaysAdvance = (event: SpecialEvent): number => {
    return (event as BirthdayEvent).daysAdvance || 0;
  };
  
  // Poliçe bildirimi için tip dönüşümü
  const getPolicyDaysBefore = (event: SpecialEvent): number => {
    return (event as PolicyEvent).daysBefore || 7;
  };
  
  const getPolicyNumberColumn = (event: SpecialEvent): string => {
    return (event as PolicyEvent).policyNumberColumn || '';
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
          Özel Gün Bildirimleri
        </motion.h1>
        
        {!connectionStatus || connectionStatus === 'disconnected' ? (
          <motion.div 
            className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-400 p-4 mb-6"
            variants={itemVariants}
          >
            <p className="font-bold">WhatsApp bağlı değil</p>
            <p>Bu özelliği kullanmak için lütfen WhatsApp'ı bağlayın</p>
          </motion.div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-100 dark:bg-zinc-800">
              <TabsTrigger 
                value="birthdays" 
                className={cn(
                  "flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"
                )}
              >
                <Calendar className="h-4 w-4" />
                <span>Doğum Günleri</span>
              </TabsTrigger>
              <TabsTrigger 
                value="policies" 
                className={cn(
                  "flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"
                )}
              >
                <FileText className="h-4 w-4" />
                <span>Poliçe Bildirimleri</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Doğum Günü Sekme İçeriği */}
            <TabsContent value="birthdays">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Card className="border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-800">
                    <CardHeader className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-700/60">
                      <CardTitle className="text-zinc-800 dark:text-zinc-100">Doğum Günü Bildirimleri</CardTitle>
                      <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Doğum günü geldiğinde otomatik WhatsApp mesajları gönderin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <form onSubmit={handleBirthdaySetup}>
                        <div className="space-y-4">
                          {/* Excel Dosyası Yükleme/Seçme */}
                          <div>
                            <Label htmlFor="birthdayFile" className="text-zinc-700 dark:text-zinc-300">Excel Dosyası Yükle</Label>
                            <Input 
                              id="birthdayFile"
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={handleFileUpload}
                              className="mt-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                            />
                            
                            {excelFiles.length > 0 && (
                              <div className="mt-3">
                                <Label htmlFor="selectBirthdayFile" className="text-zinc-700 dark:text-zinc-300">Mevcut Dosya Seçin</Label>
                                <Select
                                  value={selectedFile || ''}
                                  onValueChange={handleFileSelection}
                                >
                                  <SelectTrigger className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                    <SelectValue placeholder="Dosya seçin" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                    {excelFiles.map(file => (
                                      <SelectItem key={file._id} value={file._id}>
                                        {file.originalName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                          
                          {/* Sütun Seçimleri */}
                          {selectedFileHeaders.length > 0 && (
                            <>
                              <div>
                                <Label htmlFor="birthdayDateColumn">Doğum Tarihi Sütunu</Label>
                                <Select
                                  value={birthdayDateColumn || ''}
                                  onValueChange={setBirthdayDateColumn}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sütun seçin" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                    {selectedFileHeaders.map(header => (
                                      <SelectItem key={header} value={header}>
                                        {header}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="birthdayNameColumn">Ad Soyad Sütunu</Label>
                                <Select
                                  value={birthdayNameColumn || ''}
                                  onValueChange={setBirthdayNameColumn}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sütun seçin" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                    {selectedFileHeaders.map(header => (
                                      <SelectItem key={header} value={header}>
                                        {header}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="birthdayPhoneColumn">Telefon Sütunu</Label>
                                <Select
                                  value={birthdayPhoneColumn || ''}
                                  onValueChange={setBirthdayPhoneColumn}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sütun seçin" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                    {selectedFileHeaders.map(header => (
                                      <SelectItem key={header} value={header}>
                                        {header}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                          
                          {/* Bildirim Zamanı Ayarları */}
                          <div>
                            <Label htmlFor="birthdayTime">Bildirim Zamanı</Label>
                            <Select
                              value={birthdayTime}
                              onValueChange={setBirthdayTime}
                            >
                              <SelectTrigger id="birthdayTime">
                                <SelectValue placeholder="Saat seçin" />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                {Array.from({length: 24}, (_, i) => {
                                  const hour = i < 10 ? `0${i}` : `${i}`;
                                  return [
                                    <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                                      {`${hour}:00`} 
                                    </SelectItem>,
                                    <SelectItem key={`${hour}:30`} value={`${hour}:30`}>
                                      {`${hour}:30`}
                                    </SelectItem>
                                  ];
                                }).flat()}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="birthdayDaysAdvance">Bildirim Gönderimi</Label>
                            <Select
                              value={birthdayDaysAdvance.toString()}
                              onValueChange={(value) => setBirthdayDaysAdvance(parseInt(value))}
                            >
                              <SelectTrigger id="birthdayDaysAdvance">
                                <SelectValue placeholder="Zamanlama seçin" />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                <SelectItem value="0">Doğum günü günü</SelectItem>
                                <SelectItem value="1">1 gün önce</SelectItem>
                                <SelectItem value="2">2 gün önce</SelectItem>
                                <SelectItem value="3">3 gün önce</SelectItem>
                                <SelectItem value="7">1 hafta önce</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Mesaj Şablonu */}
                          <div>
                            <Label htmlFor="birthdayTemplate">Mesaj Şablonu</Label>
                            
                            {selectedFileHeaders.length > 0 && (
                              <div className="mt-2 mb-3">
                                <p className="text-sm text-gray-600 mb-2">Şablona eklemek için sütunlara tıklayın:</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedFileHeaders.map((header) => (
                                    <button
                                      key={header}
                                      type="button"
                                      onClick={() => {
                                        setBirthdayTemplate(prev => `${prev} {{${header}}}`);
                                      }}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                                               bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                                    >
                                      <span className="mr-1">+</span> {header}
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => setBirthdayTemplate(prev => `${prev} {{DOĞUM_TARİHİ}}`)}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                                             bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                                  >
                                    <span className="mr-1">+</span> Doğum Tarihi
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            <Textarea
                              id="birthdayTemplate"
                              value={birthdayTemplate}
                              onChange={e => setBirthdayTemplate(e.target.value)}
                              placeholder="Doğum günü mesaj şablonunuzu girin..."
                              rows={6}
                              className="mt-2"
                            />
                            
                            <div className="mt-2 text-sm text-gray-500">
                              <p>Kullanabileceğiniz özel alanlar:</p>
                              <ul className="list-disc pl-5 mt-1">
                                <li><code>{"{{AD_SOYAD}}"}</code> - Kişinin adı ve soyadı</li>
                                <li><code>{"{{DOĞUM_TARİHİ}}"}</code> - Doğum tarihi</li>
                                <li><code>{"{{SütunAdı}}"}</code> - Excel dosyasındaki diğer sütunlar</li>
                              </ul>
                            </div>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={loading.tasks}
                          >
                            {loading.tasks ? 'Ayarlanıyor...' : 'Doğum Günü Bildirimlerini Ayarla'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Card className="border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-800">
                    <CardHeader className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-700/60">
                      <CardTitle className="text-zinc-800 dark:text-zinc-100">Aktif Etkinlikler</CardTitle>
                      <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Ayarlanmış doğum günü bildirimleri
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {loading && (
                        <div className="flex justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                        </div>
                      )}
                      
                      {!loading && specialEvents.filter(event => event.type === "birthday").length === 0 && (
                        <p className="text-zinc-500 dark:text-zinc-400 italic text-center py-8">Henüz bir doğum günü bildirimi ayarlanmamış</p>
                      )}
                      
                      {!loading && specialEvents.filter(event => event.type === "birthday").map((event) => (
                        <div 
                          key={event._id} 
                          className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 bg-zinc-50 dark:bg-zinc-900/50 hover:shadow-sm transition-all duration-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-zinc-800 dark:text-zinc-200">{event.name}</h3>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                <span className="font-medium">Dosya:</span> {excelFiles.find(f => f._id === event.excelFileId)?.filename || 'Bilinmeyen dosya'}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                                  {event.nameColumn} (İsim)
                                </Badge>
                                <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                                  {event.dateColumn} (Tarih)
                                </Badge>
                                <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                                  {event.phoneColumn} (Telefon)
                                </Badge>
                              </div>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                                <span className="font-medium">Gönderim Zamanı:</span> {getBirthdayDaysAdvance(event)} gün önce, saat {event.sendTime}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteEvent(event._id)}
                              className="text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
            
            {/* Poliçe Bildirimleri Sekme İçeriği */}
            <TabsContent value="policies">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Card className="border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-800">
                    <CardHeader className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-700/60">
                      <CardTitle className="text-zinc-800 dark:text-zinc-100">Poliçe Bildirimleri</CardTitle>
                      <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Poliçe bitiş tarihleri için önceden otomatik mesajlar gönderin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <form onSubmit={handlePolicySetup}>
                        <div className="space-y-4">
                          {/* Etkinlik Adı */}
                          <div className="space-y-2">
                            <Label htmlFor="policyName" className="text-zinc-700 dark:text-zinc-300">Etkinlik Adı</Label>
                            <Input 
                              id="policyName"
                              placeholder="Poliçe Bildirimi"
                              value={name}
                              onChange={e => setName(e.target.value)}
                              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                            />
                          </div>
                          
                          {/* Excel Dosyası Yükleme/Seçme */}
                          <div className="space-y-2">
                            <Label htmlFor="policyFile" className="text-zinc-700 dark:text-zinc-300">Excel Dosyası Yükle</Label>
                            <Input 
                              id="policyFile"
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={handleFileUpload}
                              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                            />
                            
                            {excelFiles.length > 0 && (
                              <div className="mt-3">
                                <Label htmlFor="selectPolicyFile" className="text-zinc-700 dark:text-zinc-300">Mevcut Dosya Seçin</Label>
                                <Select
                                  value={selectedFile || ''}
                                  onValueChange={handleFileSelection}
                                >
                                  <SelectTrigger className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                    <SelectValue placeholder="Dosya seçin" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                    {excelFiles.map(file => (
                                      <SelectItem key={file._id} value={file._id}>{file.filename}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                          
                          {/* Sütun Seçimleri */}
                          {selectedFile && selectedFileHeaders.length > 0 && (
                            <div className="space-y-4 border border-zinc-200 dark:border-zinc-700 rounded-md p-4 bg-zinc-50 dark:bg-zinc-900/30">
                              <h3 className="font-medium text-zinc-800 dark:text-zinc-200">Sütun Eşleştirmeleri</h3>
                              
                              <div className="grid gap-4">
                                <div>
                                  <Label htmlFor="policyDateCol" className="text-zinc-700 dark:text-zinc-300">Bitiş Tarihi Sütunu</Label>
                                  <Select
                                    value={policyDateColumn || ''}
                                    onValueChange={val => setPolicyDateColumn(val)}
                                  >
                                    <SelectTrigger className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                      <SelectValue placeholder="Sütun seçin" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                      {selectedFileHeaders.map(header => (
                                        <SelectItem key={header} value={header}>{header}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label htmlFor="policyNumberCol" className="text-zinc-700 dark:text-zinc-300">Poliçe Numarası Sütunu</Label>
                                  <Select
                                    value={policyNumberColumn || ''}
                                    onValueChange={val => setPolicyNumberColumn(val)}
                                  >
                                    <SelectTrigger className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                      <SelectValue placeholder="Sütun seçin" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                      {selectedFileHeaders.map(header => (
                                        <SelectItem key={header} value={header}>{header}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label htmlFor="policyPhoneCol" className="text-zinc-700 dark:text-zinc-300">Telefon Sütunu</Label>
                                  <Select
                                    value={policyPhoneColumn || ''}
                                    onValueChange={val => setPolicyPhoneColumn(val)}
                                  >
                                    <SelectTrigger className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                      <SelectValue placeholder="Sütun seçin" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                      {selectedFileHeaders.map(header => (
                                        <SelectItem key={header} value={header}>{header}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label htmlFor="policyNameCol" className="text-zinc-700 dark:text-zinc-300">Müşteri Adı Sütunu</Label>
                                  <Select
                                    value={policyNameColumn || ''}
                                    onValueChange={val => setPolicyNameColumn(val)}
                                  >
                                    <SelectTrigger className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                      <SelectValue placeholder="Sütun seçin" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                      {selectedFileHeaders.map(header => (
                                        <SelectItem key={header} value={header}>{header}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Gönderim Ayarları */}
                          <div className="space-y-4 border border-zinc-200 dark:border-zinc-700 rounded-md p-4 bg-zinc-50 dark:bg-zinc-900/30">
                            <h3 className="font-medium text-zinc-800 dark:text-zinc-200">Gönderim Ayarları</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="policyDaysBefore" className="text-zinc-700 dark:text-zinc-300">Kaç Gün Önce</Label>
                                <Select
                                  value={policyDaysBefore.toString()}
                                  onValueChange={val => setPolicyDaysBefore(parseInt(val))}
                                >
                                  <SelectTrigger className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                    <SelectValue placeholder="Gün seçin" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                    {[1, 3, 5, 7, 10, 15, 30].map(day => (
                                      <SelectItem key={day} value={day.toString()}>{day} gün önce</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="policyTime" className="text-zinc-700 dark:text-zinc-300">Saat</Label>
                                <Select
                                  value={policyTime}
                                  onValueChange={setPolicyTime}
                                >
                                  <SelectTrigger className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                    <SelectValue placeholder="Saat seçin" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                    {[...Array(24)].map((_, hour) => [0, 30].map(minute => (
                                      <SelectItem 
                                        key={`${hour}:${minute}`} 
                                        value={`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
                                      >
                                        {`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
                                      </SelectItem>
                                    ))).flat()}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          
                          {/* Mesaj Şablonu */}
                          <div className="space-y-2">
                            <Label htmlFor="policyTemplate" className="text-zinc-700 dark:text-zinc-300">Mesaj Şablonu</Label>
                            <Textarea 
                              id="policyTemplate"
                              value={policyTemplate}
                              onChange={e => setPolicyTemplate(e.target.value)}
                              rows={6}
                              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                            />
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Desteklenen değişkenler: {'{{AD_SOYAD}}'}, {'{{POLİÇE_NO}}'}, {'{{BİTİŞ_TARİHİ}}'}
                            </p>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                          >
                            Poliçe Bildirimlerini Ayarla
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Card className="border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-800">
                    <CardHeader className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-700/60">
                      <CardTitle className="text-zinc-800 dark:text-zinc-100">Aktif Etkinlikler</CardTitle>
                      <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Ayarlanmış poliçe bildirimleri
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {loading && (
                        <div className="flex justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                        </div>
                      )}
                      
                      {!loading && specialEvents.filter(event => event.type === "policy").length === 0 && (
                        <p className="text-zinc-500 dark:text-zinc-400 italic text-center py-8">Henüz bir poliçe bildirimi ayarlanmamış</p>
                      )}
                      
                      {!loading && specialEvents.filter(event => event.type === "policy").map((event) => (
                        <div 
                          key={event._id} 
                          className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 bg-zinc-50 dark:bg-zinc-900/50 hover:shadow-sm transition-all duration-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-zinc-800 dark:text-zinc-200">{event.name}</h3>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                <span className="font-medium">Dosya:</span> {excelFiles.find(f => f._id === event.excelFileId)?.filename || 'Bilinmeyen dosya'}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                                  {event.dateColumn} (Bitiş Tarihi)
                                </Badge>
                                <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                                  {event.nameColumn || 'Seçilmedi'} (İsim)
                                </Badge>
                                <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                                  {event.phoneColumn} (Telefon)
                                </Badge>
                                <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                                  {getPolicyNumberColumn(event)} (Poliçe No)
                                </Badge>
                              </div>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                                <span className="font-medium">Gönderim Zamanı:</span> {getPolicyDaysBefore(event)} gün önce, saat {event.sendTime}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteEvent(event._id)}
                              className="text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        )}

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300">Başarılı</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}
        
        {(error || contextError) && (
          <Alert className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-800 dark:text-red-300">Hata</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-400">
              {error || contextError}
            </AlertDescription>
          </Alert>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default SpecialEvents; 