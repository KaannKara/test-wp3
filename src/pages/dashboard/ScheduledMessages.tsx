import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useWhatsApp } from '../../contexts/WhatsAppContext';
import { ScheduleType } from '../../lib/types/whatsapp';
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { AlertCircle, CheckCircle2, Trash2, Play, Calendar, FileText, RefreshCw } from "lucide-react";
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

const ScheduledMessages = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const groupIdParam = queryParams.get('groupId');
  
  const { 
    connectionStatus, 
    groups, 
    excelFiles, 
    scheduledMessages,
    scheduledTasks,
    loading, 
    error: contextError, 
    uploadExcelFile,
    scheduleMessage,
    fetchScheduledTasks,
    createScheduledTask,
    deleteScheduledTask,
    runScheduledTask,
    clearError,
    deleteExcelFile
  } = useWhatsApp();
  
  // Legacy system state
  const [selectedGroup, setSelectedGroup] = useState<string | null>(groupIdParam);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFileHeaders, setSelectedFileHeaders] = useState<string[]>([]);
  const [selectedDateField, setSelectedDateField] = useState<string | null>(null);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setLocalError] = useState<string | null>(null);

  // New scheduler system state
  const [activeTab, setActiveTab] = useState("legacy");
  const [taskName, setTaskName] = useState('');
  const [selectedTaskGroup, setSelectedTaskGroup] = useState<string | null>(groupIdParam);
  const [selectedTaskFile, setSelectedTaskFile] = useState<string | null>(null);
  const [selectedTaskFileHeaders, setSelectedTaskFileHeaders] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('expiry-date');
  const [expiryDateColumn, setExpiryDateColumn] = useState<string | null>(null);
  const [expiryDateFormat, setExpiryDateFormat] = useState('DD.MM.YYYY');
  const [minutes, setMinutes] = useState(30);
  const [hours, setHours] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [taskMessageTemplate, setTaskMessageTemplate] = useState('🚨 BUGÜN BİTEN POLİÇELER ({{TODAY_DATE}}):\n\n{{DETAILS}}\n➖➖➖➖➖➖➖➖➖');
  const [groupByDate, setGroupByDate] = useState(true);
  
  // Clear error and success on component unmount
  useEffect(() => {
    return () => {
      clearError();
      setSuccess(null);
      setLocalError(null);
    };
  }, [clearError]);

  // Update selected group when groupIdParam changes
  useEffect(() => {
    if (groupIdParam) {
      setSelectedGroup(groupIdParam);
      setSelectedTaskGroup(groupIdParam);
    }
  }, [groupIdParam]);

  // Update selected file headers when selected file changes
  useEffect(() => {
    if (selectedFile) {
      const file = excelFiles.find(f => f._id === selectedFile);
      if (file) {
        setSelectedFileHeaders(file.headers);
      }
    }
  }, [selectedFile, excelFiles]);

  // Update selected task file headers when selected task file changes
  useEffect(() => {
    if (selectedTaskFile) {
      const file = excelFiles.find(f => f._id === selectedTaskFile);
      if (file) {
        setSelectedTaskFileHeaders(file.headers);
      }
    }
  }, [selectedTaskFile, excelFiles]);

  // Load scheduled tasks
  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchScheduledTasks();
    }
  }, [connectionStatus, fetchScheduledTasks]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        // The API actually returns an ExcelFile object but the type definition is incorrect
        // Cast the result to any first, then check if it has the expected structure
        const result = await uploadExcelFile(file) as any;
        
        if (result && typeof result === 'object' && result._id) {
          setSelectedFile(result._id);
          setSelectedTaskFile(result._id);
        }
        
        // Clear input value to allow uploading the same file again
      e.target.value = '';
      } catch (error) {
        console.error('File upload error:', error);
      }
    }
  };

  const handleFileSelection = (fileId: string) => {
    setSelectedFile(fileId);
  };
  
  const handleTaskFileSelection = (fileId: string) => {
    setSelectedTaskFile(fileId);
    setSelectedColumns([]);
    setColumnOrder([]);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGroup || !selectedFile || !selectedDateField || !messageTemplate) {
      setSuccess(null);
      setLocalError('Please select a group, file, date field, and enter a message template');
      return;
    }
    
    try {
      await scheduleMessage(selectedGroup, selectedFile, selectedDateField, messageTemplate);
      setSuccess('Message scheduled successfully!');
      setLocalError(null);
    } catch (error) {
      console.error('Schedule error:', error);
    }
  };

  // Toggle column selection and update order
  const toggleColumnSelection = (column: string) => {
    setSelectedColumns(prev => {
      // If column is already selected, remove it
      if (prev.includes(column)) {
        // Also remove from column order
        setColumnOrder(currentOrder => currentOrder.filter(c => c !== column));
        return prev.filter(c => c !== column);
      } 
      // If column is not selected, add it
      else {
        // Add to column order at the end
        setColumnOrder(currentOrder => [...currentOrder, column]);
        return [...prev, column];
      }
    });
  };

  // Move column up in ordering
  const moveColumnUp = (column: string) => {
    setColumnOrder(current => {
      const index = current.indexOf(column);
      if (index <= 0) return current;
      
      const newOrder = [...current];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      return newOrder;
    });
  };

  // Move column down in ordering
  const moveColumnDown = (column: string) => {
    setColumnOrder(current => {
      const index = current.indexOf(column);
      if (index === -1 || index >= current.length - 1) return current;
      
      const newOrder = [...current];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      return newOrder;
    });
  };

  // Ensure no duplicates in column order array
  useEffect(() => {
    // Remove any duplicates from columnOrder
    const uniqueOrder = [...new Set(columnOrder)];
    if (uniqueOrder.length !== columnOrder.length) {
      setColumnOrder(uniqueOrder);
    }
  }, [columnOrder]);

  // Make sure columns are properly ordered whenever selectedColumns changes
  useEffect(() => {
    ensureAllColumnsOrdered();
  }, [selectedColumns]);

  // Get selected columns in their display order - with extra safety check for duplicates
  const getOrderedSelectedColumns = () => {
    // Get only the selected columns that are in the order array, and ensure no duplicates
    const ordered = columnOrder.filter(col => selectedColumns.includes(col));
    return [...new Set(ordered)]; // Extra safety to prevent duplicates
  };
  
  // Ensures newly selected columns are properly ordered
  const ensureAllColumnsOrdered = () => {
    // Find any selected columns that aren't in columnOrder
    const unorderedColumns = selectedColumns.filter(
      col => !columnOrder.includes(col)
    );
    
    // If there are any unordered columns, add them to columnOrder
    if (unorderedColumns.length > 0) {
      setColumnOrder(current => [...current, ...unorderedColumns]);
    }
  };
  
  // Create a formatted preview of how the message will appear
  const getMessagePreview = () => {
    const orderedColumns = getOrderedSelectedColumns();
    if (orderedColumns.length === 0) return '';
    
    // Create a preview with sample data
    return orderedColumns.map(column => {
      // Add emoji based on column type
      let emoji = '📋';
      if (column.toLowerCase().includes('prim')) emoji = '💰';
      if (column.toLowerCase().includes('poliçe') || column.toLowerCase().includes('police')) emoji = '📝';
      if (column.toLowerCase().includes('tarih')) emoji = '📅';
      if (column.toLowerCase().includes('telefon')) emoji = '☎️';
      if (column.toLowerCase().includes('plaka')) emoji = '🚗';
      if (column.toLowerCase().includes('gün')) emoji = '⏳';
      if (column.toLowerCase().includes('tc')) emoji = '🪪';
      
      // Sample value based on column type
      let sampleValue = 'Örnek Değer';
      if (column.toLowerCase().includes('prim')) sampleValue = '5.241,25 TL';
      if (column.toLowerCase().includes('tarih')) sampleValue = '07.03.2025';
      if (column.toLowerCase().includes('telefon')) sampleValue = '(555) 123-4567';
      if (column.toLowerCase().includes('tc')) sampleValue = '12345678901';
      if (column.toLowerCase().includes('plaka')) sampleValue = '34ABC123';
      if (column.toLowerCase().includes('gün')) sampleValue = '15';
      
      return `${emoji} ${column}: ${sampleValue}`;
    }).join('\n');
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskName || !selectedTaskFile || !scheduleType || !selectedTaskGroup || selectedColumns.length === 0 || !taskMessageTemplate) {
      setLocalError('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    
    if (scheduleType !== 'expiry-date' && expiryDateColumn && !expiryDateColumn) {
      setLocalError('Bitiş tarihi sütunu seçilmelidir');
      return;
    }
    
    setLocalError('');
    
    try {
      const selectedGroups = [selectedTaskGroup].filter(Boolean) as string[];
      
      // Use ordered columns - ensure there are no duplicates
      const orderedColumns = Array.from(new Set(getOrderedSelectedColumns()));
      
      const taskData = {
        name: taskName,
        excelFileId: selectedTaskFile,
        scheduleType,
        selectedGroups,
        selectedColumns: orderedColumns, // Ensure no duplicates
        messageTemplate: taskMessageTemplate,
        groupByDate,
        
        ...(scheduleType === 'minutely' && {
          minutes: minutes
        }),
        ...(scheduleType === 'hourly' && {
          hours: hours
        }),
        ...(scheduleType === 'daily' && {
          timeOfDay: timeOfDay
        }),
        ...(scheduleType === 'once' && {
          scheduledDateTime: scheduledDateTime
        }),
        ...(expiryDateColumn && {
          expiryDateColumn: expiryDateColumn,
          expiryDateFormat: expiryDateFormat || 'DD.MM.YYYY',
          groupByDate: groupByDate
        })
      };
      
      await createScheduledTask(taskData);
      setSuccess('Zamanlanmış mesaj başarıyla oluşturuldu');
      fetchScheduledTasks();
      
      setTaskName('');
      setScheduleType('daily');
      setMinutes(30);
      setHours(1);
      setTimeOfDay('09:00');
      setScheduledDateTime('');
      setExpiryDateColumn('');
      setExpiryDateFormat('DD.MM.YYYY');
      setGroupByDate(true);
      setSelectedColumns([]);
      setColumnOrder([]);
      setTaskMessageTemplate('🚨 BUGÜN BİTEN POLİÇELER ({{TODAY_DATE}}):\n\n{{DETAILS}}\n➖➖➖➖➖➖➖➖➖');
    } catch (error) {
      setLocalError('Zamanlanmış mesaj oluşturulurken bir hata oluştu: ' + (error as Error).message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteScheduledTask(taskId);
      setSuccess('Görev başarıyla silindi!');
      setLocalError(null);
    } catch (error) {
      console.error('Task deletion error:', error);
    }
  };

  const handleRunTask = async (taskId: string) => {
    try {
      await runScheduledTask(taskId);
      setSuccess('Görev başarıyla başlatıldı!');
      setLocalError(null);
    } catch (error) {
      console.error('Task run error:', error);
    }
  };

  // Render task status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Aktif</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">Duraklatıldı</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Tamamlandı</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Başarısız</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Render schedule type details
  const renderScheduleDetails = (task: any) => {
    switch (task.scheduleType) {
      case 'minutely':
        return <span>Her {task.minutes} dakikada bir</span>;
      case 'hourly':
        return <span>Her {task.hours} saatte bir</span>;
      case 'daily':
        return <span>Her gün saat {task.timeOfDay}</span>;
      case 'once':
        return <span>Bir kez: {new Date(task.scheduledDateTime).toLocaleString()}</span>;
      case 'expiry-date':
        return <span>"{task.expiryDateColumn}" alanı bugün olanlar</span>;
      default:
        return <span>{task.scheduleType}</span>;
    }
  };

  // Add function to handle file deletion
  const handleDeleteFile = async (fileId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the dropdown from closing
    e.stopPropagation(); // Prevent the click from being captured by parent elements
    
    if (window.confirm('Bu Excel dosyasını silmek istediğinizden emin misiniz?')) {
      try {
        await deleteExcelFile(fileId);
        
        // If the deleted file was selected, reset selection
        if (selectedFile === fileId) {
          setSelectedFile('');
        }
        if (selectedTaskFile === fileId) {
          setSelectedTaskFile('');
          setSelectedColumns([]);
          setColumnOrder([]);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  // Component başında eklenecek fonksiyon (useWhatsApp çağrısından sonra)
  const handleManualRefresh = () => {
    // Localstorage'daki kontrol flag'ini temizle
    localStorage.removeItem('tasksChecked');
    // Yeniden veri yüklemeyi tetikle
    fetchScheduledTasks();
  };
  
  return (
    <DashboardLayout>
      <motion.div 
        className={cn("container mx-auto px-4 py-8")}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-5 mt-5">
          <motion.h1 
            className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50"
            variants={itemVariants}
          >
            Zamanlanmış Mesajlar
          </motion.h1>
          
          <Button 
            onClick={handleManualRefresh}
            variant="outline" 
            size="sm"
            className="mt-2 md:mt-0"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
        
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
                value="legacy" 
                className={cn(
                  "flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"
                )}
              >
                <Calendar className="h-4 w-4" />
                <span>Basit Zamanlayıcı</span>
              </TabsTrigger>
              <TabsTrigger 
                value="new" 
                className={cn(
                  "flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"
                )}
              >
                <FileText className="h-4 w-4" />
                <span>Gelişmiş Zamanlayıcı</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Basit Zamanlayıcı Tab */}
            <TabsContent value="legacy">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Card className="border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-800">
                    <CardHeader className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-700/60">
                      <CardTitle className="text-zinc-800 dark:text-zinc-100">Zamanlanmış Mesaj Oluştur</CardTitle>
                      <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Belirli bir tarih geldiğinde gönderilecek mesajları planlayın
                    </CardDescription>
                  </CardHeader>
                    <CardContent className="pt-6">
                    <form onSubmit={handleScheduleSubmit}>
                      <div className="space-y-4">
                        {/* Group selection */}
                          <div className="space-y-2">
                            <Label htmlFor="group" className="text-zinc-700 dark:text-zinc-300">WhatsApp Grubu Seçin</Label>
                          <Select
                            value={selectedGroup || ''}
                            onValueChange={setSelectedGroup}
                          >
                              <SelectTrigger className="w-full bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                <SelectValue placeholder="Grup seçin" />
                            </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                              {groups.map(group => (
                                <SelectItem key={group.id} value={group.id}>
                                  {group.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                </div>
                        
                        {/* Excel file upload & selection */}
                          <div className="space-y-2">
                            <Label htmlFor="file" className="text-zinc-700 dark:text-zinc-300">Excel Dosyası Yükle</Label>
                          <Input 
                            id="file"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                          />
                          
                          {excelFiles.length > 0 && (
                              <div className="mt-3">
                                <Label htmlFor="selectFile" className="text-zinc-700 dark:text-zinc-300">Mevcut Dosya Seçin</Label>
                              <Select
                                value={selectedFile || ''}
                                onValueChange={handleFileSelection}
                              >
                                  <SelectTrigger className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                    <SelectValue placeholder="Dosya seçin" />
                                </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                  {excelFiles.map(file => (
                                      <div key={file._id} className="flex items-center justify-between pr-2">
                                        <SelectItem value={file._id}>
                                          {file.originalName || file.filename}
                                    </SelectItem>
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          onClick={(e) => handleDeleteFile(file._id, e)}
                                          className="text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                  ))}
                                </SelectContent>
                              </Select>
                </div>
                          )}
              </div>
                        
                        {/* Date field selection */}
                        {selectedFileHeaders.length > 0 && (
                          <div>
                              <Label htmlFor="dateField">Tarih Alanını Seçin</Label>
                            <Select
                              value={selectedDateField || ''}
                              onValueChange={setSelectedDateField}
                            >
                              <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                  <SelectValue placeholder="Tarih alanını seçin" />
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
          )}
          
                        {/* Message template */}
                        <div>
                            <Label htmlFor="messageTemplate">Mesaj Şablonu</Label>
                            
                            {selectedFileHeaders.length > 0 && (
                              <div className="mt-2 mb-3">
                                <p className="text-sm text-gray-600 mb-2">Şablona eklemek için sütunlara tıklayın:</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedFileHeaders.map((header) => (
                                    <button
                                      key={header}
                                      type="button"
                                      onClick={() => {
                                        // Mesaj şablonuna sütun adını ekle
                                        setMessageTemplate(prev => `${prev} {{${header}}}`);
                                      }}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                                               bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                                    >
                                      <span className="mr-1">+</span> {header}
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => setMessageTemplate(prev => `${prev} {{TODAY_DATE}}`)}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                                             bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                                  >
                                    <span className="mr-1">+</span> Bugünün Tarihi
                                  </button>
                                </div>
                              </div>
                            )}
                            
                          <Textarea
                            id="messageTemplate"
                            value={messageTemplate}
                            onChange={e => setMessageTemplate(e.target.value)}
                              placeholder="Mesaj şablonunuzu girin..."
                            rows={5}
                              className="mt-2"
                            />
                            
                            <div className="mt-2 text-sm text-gray-500">
                              <p>Kullanabileceğiniz özel alanlar:</p>
                              <ul className="list-disc pl-5 mt-1">
                                <li><code>{"{{SütunAdı}}"}</code> - Excel dosyasındaki belirli bir sütunu ekler</li>
                                <li><code>{"{{TODAY_DATE}}"}</code> - Bugünün tarihi (GG.AA.YYYY)</li>
                              </ul>
                            </div>
                </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium"
                          disabled={loading.scheduleMessage}
                        >
                          {loading.scheduleMessage ? 'Planlanıyor...' : 'Mesajı Planla'}
                        </Button>
                </div>
                    </form>
                  </CardContent>
                </Card>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Card className="border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-800">
                    <CardHeader className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-700/60">
                      <CardTitle className="text-zinc-800 dark:text-zinc-100">Aktif Zamanlanmış Mesajlar</CardTitle>
                      <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Mevcut zamanlanmış mesajlarınızı görüntüleyin
                    </CardDescription>
                  </CardHeader>
                    <CardContent className="pt-6">
                    {loading.messages ? (
                        <p>Zamanlanmış mesajlar yükleniyor...</p>
                    ) : scheduledMessages.length === 0 ? (
                        <p>Zamanlanmış mesaj bulunamadı</p>
                    ) : (
                      <div className="space-y-4">
                        {scheduledMessages.map(message => (
                          <div key={message._id} className="border rounded-lg p-4">
                              <p className="font-semibold">Grup: {message.groupName}</p>
                              <p>Dosya: {message.fileName}</p>
                              <p>Tarih Alanı: {message.dateField}</p>
                              <p>Hedef Tarih: {message.targetDate}</p>
                              <p>Durum: {message.status === 'pending' ? 'Bekliyor' : 
                                         message.status === 'sent' ? 'Gönderildi' : 
                                         message.status === 'failed' ? 'Başarısız' : message.status}</p>
              </div>
                        ))}
            </div>
          )}
                  </CardContent>
                </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
            
            {/* Gelişmiş Zamanlayıcı Tab */}
            <TabsContent value="new">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Card className="border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-800">
                    <CardHeader className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-700/60">
                      <CardTitle className="text-zinc-800 dark:text-zinc-100">Gelişmiş Görev Oluştur</CardTitle>
                      <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Excel dosyalarına dayalı otomatik zamanlanmış görevler oluşturun
                    </CardDescription>
                  </CardHeader>
                    <CardContent className="pt-6">
                    <form onSubmit={handleTaskSubmit}>
                      <div className="space-y-4">
                        {/* Task name */}
                        <div>
                            <Label htmlFor="taskName">Görev Adı</Label>
                          <Input
                            id="taskName"
                            value={taskName}
                            onChange={e => setTaskName(e.target.value)}
                              placeholder="Görev adını girin"
                            required
                          />
                        </div>
                        
                        {/* Group selection */}
                        <div>
                            <Label htmlFor="taskGroup">WhatsApp Grubu Seçin</Label>
                          <Select
                            value={selectedTaskGroup || ''}
                            onValueChange={setSelectedTaskGroup}
                          >
                            <SelectTrigger>
                                <SelectValue placeholder="Grup seçin" />
                            </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                              {groups.map(group => (
                                <SelectItem key={group.id} value={group.id}>
                                  {group.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
            </div>
                        
                        {/* Excel file upload & selection */}
                        <div>
                            <Label htmlFor="taskFile">Excel Dosyası Yükle</Label>
                          <Input 
                            id="taskFile"
                    type="file" 
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                          />
                          
                          {excelFiles.length > 0 && (
                            <div className="mt-2">
                                <Label htmlFor="selectTaskFile">Mevcut Dosya Seçin</Label>
                              <Select
                                value={selectedTaskFile || ''}
                                onValueChange={handleTaskFileSelection}
                              >
                                <SelectTrigger>
                                    <SelectValue placeholder="Dosya seçin" />
                                </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                  {excelFiles.map(file => (
                                      <div key={file._id} className="flex items-center justify-between pr-2">
                                        <SelectItem value={file._id}>
                                      {file.originalName}
                                    </SelectItem>
                                        <Button 
                                          variant="destructive" 
                                          size="sm"
                                          className="ml-2 px-2 py-0 h-6"
                                          onClick={(e) => handleDeleteFile(file._id, e)}
                                          disabled={loading.deleteFile}
                                        >
                                          <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="16" 
                                            height="16" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                          >
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                          </svg>
                                        </Button>
                                      </div>
                                  ))}
                                </SelectContent>
                              </Select>
              </div>
            )}
          </div>
          
                        {/* Column selection */}
                        {selectedTaskFileHeaders.length > 0 && (
          <div>
                            <Label
                              htmlFor="columnSelection"
                              className="text-zinc-700 dark:text-zinc-300"
                            >
                              Dahil Edilecek Sütunları Seçin ve Sıralayın
                            </Label>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                              Mesajda kullanmak istediğiniz sütunları seçin ve gösterim sırasını ayarlayın.
                              Sütunlar seçtiğiniz sırada mesaja eklenecektir.
                            </p>
                            <div className="grid grid-cols-1 gap-2 mt-2 border border-zinc-200 dark:border-zinc-700 rounded-md p-3 bg-zinc-50 dark:bg-zinc-800/50">
                              {selectedTaskFileHeaders.map((header: string) => (
                                <div 
                                  key={header} 
                                  className="flex items-center justify-between p-2 rounded hover:bg-white dark:hover:bg-zinc-800 transition-colors duration-150 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                                >
                                  <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`column-${header}`}
                                    checked={selectedColumns.includes(header)}
                                    onCheckedChange={() => toggleColumnSelection(header)}
                                      className="border-zinc-300 dark:border-zinc-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                    />
                                    <Label 
                                      htmlFor={`column-${header}`}
                                      className="text-zinc-700 dark:text-zinc-300 cursor-pointer"
                                    >
                                      {header}
                                    </Label>
                                  </div>
                                  
                                  {selectedColumns.includes(header) && (
                                    <div className="flex space-x-1">
                                      <Button 
                                        type="button"
                                        variant="outline" 
                                        size="sm"
                                        className="h-7 w-7 p-0 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        onClick={() => moveColumnUp(header)}
                                        disabled={columnOrder.indexOf(header) <= 0}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M18 15l-6-6-6 6"/>
                                        </svg>
                                      </Button>
                                      
                                      <Button 
                                        type="button"
                                        variant="outline" 
                                        size="sm"
                                        className="h-7 w-7 p-0 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        onClick={() => moveColumnDown(header)}
                                        disabled={columnOrder.indexOf(header) === -1 || columnOrder.indexOf(header) >= getOrderedSelectedColumns().length - 1}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M6 9l6 6 6-6"/>
                                        </svg>
                                      </Button>
                                    </div>
                                  )}
              </div>
                              ))}
              </div>

                              {selectedColumns.length > 0 && (
                                <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 rounded-md">
                                  <h3 className="text-sm font-medium mb-2 text-zinc-800 dark:text-zinc-200">Mesajda Görünecek Sütun Sırası:</h3>
                                  <ol className="list-decimal pl-5 space-y-1">
                                    {getOrderedSelectedColumns().map((column, index) => (
                                      <li key={`${column}-${index}`} className="text-indigo-600 dark:text-indigo-400">
                                        {column}
                                      </li>
                                    ))}
                                  </ol>
                                  <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded text-sm text-indigo-700 dark:text-indigo-300">
                                    <p className="font-medium">Bilgi: Mesaj Formatı</p>
                                    <p className="mt-1">Excel'deki seçilen sütunlar, yukarıdaki sırayla mesaja dahil edilecektir.</p>
                                    <p className="mt-1 font-medium">Örnek Görünüm:</p>
                                    <pre className="mt-1 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded font-mono text-xs whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                                      {getMessagePreview() || 'Lütfen en az bir sütun seçin'}
                                    </pre>
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                        
                        {/* Schedule type selection */}
                        <div className="mb-4">
                            <Label htmlFor="scheduleType">Zamanlama Türü</Label>
                          <Select 
                            value={scheduleType} 
                            onValueChange={(value: ScheduleType) => setScheduleType(value)}
                          >
                              <SelectTrigger className="w-full bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                <SelectValue placeholder="Zamanlama türü seçin" />
                            </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                              <SelectItem value="expiry-date">Bitiş Tarihi Bugün Olanlar (Her Gün Kontrol)</SelectItem>
                                <SelectItem value="once">Bir Kez (Belirli Tarih ve Saat)</SelectItem>
                                <SelectItem value="daily">Günlük (Her Gün Belirli Saatte)</SelectItem>
                                <SelectItem value="hourly">Saatlik (Belirli Saat Aralığında)</SelectItem>
                                <SelectItem value="minutely">Dakikalık (Belirli Dakika Aralığında)</SelectItem>
                            </SelectContent>
                          </Select>
                            <p className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">
                              {scheduleType === 'expiry-date' ? 
                              "Excel dosyasındaki kayıtlardan bitiş tarihi bugün olanlara göre mesaj gönderir. Her gün çalışır." : 
                              scheduleType === 'once' ? 
                              "Belirtilen tarih ve saatte bir kez çalışır." : 
                              scheduleType === 'daily' ? 
                              "Her gün belirtilen saatte çalışır." : 
                              scheduleType === 'hourly' ? 
                              "Belirtilen saat aralığında tekrar eden şekilde çalışır." : 
                              "Belirtilen dakika aralığında tekrar eden şekilde çalışır."}
                          </p>
                        </div>
                        
                        {/* Schedule type specific options */}
                        {scheduleType && (
                          <>
                            {scheduleType === 'minutely' && (
                              <div className="mb-4">
                                <Label htmlFor="minutes">Her X Dakika</Label>
                                <Input
                                  id="minutes"
                                  type="number"
                                  min="1"
                                  max="60"
                                  value={minutes}
                                  onChange={e => setMinutes(parseInt(e.target.value))}
                                />
                              </div>
                            )}
                            
                            {scheduleType === 'hourly' && (
                              <div className="mb-4">
                                <Label htmlFor="hours">Her X Saat</Label>
                                <Input
                                  id="hours"
                                  type="number"
                                  min="1"
                                  max="24"
                                  value={hours}
                                  onChange={e => setHours(parseInt(e.target.value))}
                                />
                              </div>
                            )}
                            
                            {scheduleType === 'daily' && (
                              <div className="mb-4">
                                <Label htmlFor="timeOfDay">Gönderim Saati</Label>
                                <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Saati seçin" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {[...Array(24)].map((_, hour) => 
                                        [0, 30].map(minute => (
                                          <SelectItem 
                                            key={`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`} 
                                            value={`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
                                          >
                                            {`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
                                          </SelectItem>
                                        ))
                                      ).flat()}
                                  </SelectContent>
                                </Select>
                                <p className="text-sm text-gray-500 mt-1">
                                  Mesajlar her gün bu saatte gönderilecektir. Varsayılan: 09:00
                                </p>
              </div>
            )}
                            
                            {scheduleType === 'once' && (
                              <div className="mb-4">
                                <Label htmlFor="scheduledDateTime">Tarih ve Saat</Label>
                                <Input
                                  id="scheduledDateTime"
                                  type="datetime-local"
                                  value={scheduledDateTime}
                                  onChange={e => setScheduledDateTime(e.target.value)}
                                />
          </div>
                            )}

                            {/* Tüm zamanlama türleri için bitiş tarihi kontrolü seçenekleri */}
                              <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-800/70 mb-4">
                                <h3 className="font-medium text-zinc-800 dark:text-zinc-200 mb-3">Bitiş Tarihi Ayarları</h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                  Excel dosyasındaki kayıtlardan bitiş tarihi bugün olanları filtreleyip gönderir.
                                </p>
                                
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="expiryDateColumn" className="text-zinc-700 dark:text-zinc-300">Bitiş Tarihi Sütunu</Label>
                                    <Select
                                      value={expiryDateColumn || ''}
                                      onValueChange={setExpiryDateColumn}
                                    >
                                      <SelectTrigger className="w-full bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                        <SelectValue placeholder="Tarih sütunu seçin" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                        {selectedTaskFileHeaders.map(header => (
                                          <SelectItem key={header} value={header}>{header}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="expiryDateFormat" className="text-zinc-700 dark:text-zinc-300">Tarih Formatı</Label>
                                    <Select
                                      value={expiryDateFormat}
                                      onValueChange={setExpiryDateFormat}
                                    >
                                      <SelectTrigger className="w-full bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                        <SelectValue placeholder="Format seçin" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                        <SelectItem value="DD.MM.YYYY">GG.AA.YYYY (30.01.2023)</SelectItem>
                                        <SelectItem value="DD/MM/YYYY">GG/AA/YYYY (30/01/2023)</SelectItem>
                                        <SelectItem value="DD-MM-YYYY">GG-AA-YYYY (30-01-2023)</SelectItem>
                                        <SelectItem value="YYYY-MM-DD">YYYY-AA-GG (2023-01-30)</SelectItem>
                                        <SelectItem value="YYYY/MM/DD">YYYY/AA/GG (2023/01/30)</SelectItem>
                                        <SelectItem value="MM/DD/YYYY">AA/GG/YYYY (01/30/2023)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        Excel dosyasındaki tarih biçimini seçin
                                      </p>
                                    </div>
                                  </div>
                              </div>
                            
            
                            {/* Bitiş tarihi gruplandırma seçeneği */}
                                <div className="mb-4">
                              <div className="flex items-center space-x-2">
                                    <Checkbox 
                                      id="groupByDate" 
                                      checked={groupByDate}
                                      onCheckedChange={(checked) => setGroupByDate(checked === true)}
                                  className="border-zinc-300 dark:border-zinc-600"
                                    />
                                <Label 
                                  htmlFor="groupByDate" 
                                  className="cursor-pointer text-zinc-700 dark:text-zinc-300"
                                >
                                      Mesajları Bitiş Tarihine Göre Grupla
                                    </Label>
                                  </div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 ml-6">
                                    Bu seçenek etkinleştirildiğinde, aynı bitiş tarihine sahip tüm mesajlar tek bir WhatsApp mesajı olarak gönderilir. Devre dışı bırakıldığında, her kayıt için ayrı mesaj gönderilir.
                                  </p>
                                </div>
                            
                            {/* Günlük kontrol saati seçimi */}
                            {(scheduleType !== 'expiry-date' && scheduleType !== 'daily') && (
                              <div className="mb-4">
                                <Label 
                                  htmlFor="timeOfDay" 
                                  className="text-zinc-700 dark:text-zinc-300"
                                >
                                  Günlük Kontrol Saati
                                </Label>
                                <Select 
                                  value={timeOfDay} 
                                  onValueChange={setTimeOfDay}
                                >
                                  <SelectTrigger className="w-full bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                    <SelectValue placeholder="Saati seçin" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 z-50">
                                    {[...Array(24)].map((_, hour) => 
                                      [0, 30].map(minute => (
                                        <SelectItem 
                                          key={`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`} 
                                          value={`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
                                        >
                                          {`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
                                        </SelectItem>
                                      ))
                                    ).flat()}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                  Bitiş tarihi kontrolleri belirlenen sıklıkla yapılacaktır.
                                </p>
                          </div>
                            )}
                          </>
                        )}
            
                        {/* Message template */}
            <div>
                            <Label htmlFor="taskMessageTemplate">Mesaj Şablonu</Label>
                            
                            {selectedTaskFileHeaders.length > 0 && (
                              <div className="mt-2 mb-3">
                                <p className="text-sm text-gray-600 mb-2">Şablona eklemek için sütunlara tıklayın:</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedTaskFileHeaders.map((header) => (
                                    <button
                                      key={header}
                                      type="button"
                                      onClick={() => {
                                        // Mesaj şablonuna sütun adını ekle
                                        setTaskMessageTemplate(prev => `${prev} {{${header}}}`);
                                      }}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                                               bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                                    >
                                      <span className="mr-1">+</span> {header}
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => setTaskMessageTemplate(prev => `${prev} {{TODAY_DATE}}`)}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                                             bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                                  >
                                    <span className="mr-1">+</span> Bugünün Tarihi
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setTaskMessageTemplate(prev => `${prev} {{DETAILS}}`)}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm 
                                             bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200"
                                  >
                                    <span className="mr-1">+</span> Tüm Detaylar
                                  </button>
                                </div>
                              </div>
                            )}
                            
                          <Textarea
                            id="taskMessageTemplate"
                            value={taskMessageTemplate}
                            onChange={e => setTaskMessageTemplate(e.target.value)}
                              placeholder="Mesaj şablonunuzu girin..."
                            rows={5}
                              className="mt-2"
                            />
                            
                            <div className="mt-2 text-sm text-gray-500">
                              <p>Kullanabileceğiniz özel alanlar:</p>
                              <ul className="list-disc pl-5 mt-1">
                                <li><code>{"{{DETAILS}}"}</code> - Seçilen tüm sütunları listeler</li>
                                <li><code>{"{{TODAY_DATE}}"}</code> - Bugünün tarihi (GG.AA.YYYY)</li>
                                <li><code>{"{{SütunAdı}}"}</code> - Excel dosyasındaki belirli bir sütunu ekler</li>
                              </ul>
                            </div>
            </div>
            
                        <Button 
                type="submit"
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium"
                          disabled={loading.createTask}
                        >
                {loading.createTask ? 'Görev Oluşturuluyor...' : 'Görevi Oluştur'}
                        </Button>
            </div>
          </form>
                  </CardContent>
                </Card>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Card className="border border-zinc-200 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-800">
                    <CardHeader className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-700/60">
                      <CardTitle className="text-zinc-800 dark:text-zinc-100">Aktif Görevler</CardTitle>
                      <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Zamanlanmış ve otomatik çalışan görevlerinizi görüntüleyin
                    </CardDescription>
                  </CardHeader>
                    <CardContent className="pt-6">
                    {loading.tasks ? (
                        <div className="flex justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                        </div>
                      ) : (
                        scheduledTasks.length === 0 ? (
                          <p className="text-center py-8 text-zinc-500 dark:text-zinc-400">Henüz zamanlanmış görev bulunmuyor</p>
                    ) : (
                      <div className="space-y-4">
                        {scheduledTasks.map(task => (
                              <div 
                                key={task._id}
                                className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 hover:shadow-sm transition-all duration-200"
                              >
                                <div className="flex justify-between items-start mb-2">
                              <div>
                                    <h3 className="font-medium text-zinc-800 dark:text-zinc-200">{task.name}</h3>
                                    <div className="flex items-center mt-1">
                                      <Badge 
                                        variant="outline" 
                                        className="mr-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                                      >
                                        {renderScheduleDetails(task)}
                                      </Badge>
                                  {renderStatusBadge(task.status)}
                                </div>
                              </div>
                                  <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => handleRunTask(task._id)}
                                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 border-indigo-200 dark:border-indigo-800/30"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => handleDeleteTask(task._id)}
                                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-200 dark:border-red-800/30"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
        </div>
        
                                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                  <p>
                                    <span className="font-medium">Dosya:</span> {typeof task.excelFile === 'string' ? task.excelFile : task.excelFile.originalName || task.excelFile.filename}
                              </p>
                              {task.nextRun && (
                                    <p>
                                      <span className="font-medium">Sonraki çalışma:</span> {new Date(task.nextRun).toLocaleString()}
                                </p>
                              )}
                              {task.lastRun && (
                                    <p>
                                      <span className="font-medium">Son çalışma:</span> {new Date(task.lastRun).toLocaleString()}
                                </p>
                              )}
                            </div>
                            
                                {task.selectedColumns && task.selectedColumns.length > 0 && (
                              <div className="mt-2">
                                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Seçilen Sütunlar:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {task.selectedColumns.map((column: string) => (
                                        <Badge 
                                          key={column} 
                                          variant="outline"
                                          className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                                        >
                                          {column}
                                        </Badge>
                                  ))}
            </div>
            </div>
          )}
        </div>
                        ))}
                      </div>
                        )
                    )}
                  </CardContent>
                </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Success and Error alerts */}
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

export default ScheduledMessages;
