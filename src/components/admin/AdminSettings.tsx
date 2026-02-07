import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Database } from 'lucide-react';
import AdminUsersManager from './AdminUsersManager';
import AdminDataManager from './AdminDataManager';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-4 w-4" />
            Admin Users
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Database className="h-4 w-4" />
            Data Manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users"><AdminUsersManager /></TabsContent>
        <TabsContent value="data"><AdminDataManager /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
