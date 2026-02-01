import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Bell, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { user } = useAuth();

  return (
    <AppLayout title="Settings">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl space-y-6"
      >
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold">Account</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Account settings and preferences coming soon.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">Notification preferences coming soon.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold">Privacy</h2>
              <p className="text-sm text-muted-foreground">Privacy settings coming soon.</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </AppLayout>
  );
};

export default Settings;
