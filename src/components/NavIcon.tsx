import React from 'react';
import { StyleSheet } from 'react-native';
import {
  LayoutDashboard,
  MapPin,
  ClipboardCheck,
  CalendarDays,
  Route,
  TriangleAlert,
  ShieldCheck,
  Package,
  WalletCards,
  CalendarHeart,
  BookOpen,
  MessageSquare,
  LogOut,
  Menu,
  Users,
  Clock,
  Search,
  Eye,
  Pencil,
  X,
  Plus,
  Calendar,
  User,
  Settings,
  Camera,
  Trash2,
  Download,
  FileText,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Bell,
  Lock,
  HelpCircle,
  Phone,
  Shield,
  Check,
  Send,
  Info,
} from 'lucide-react-native';

export type NavIconName =
  | 'dashboard'
  | 'menu'
  | 'sites'
  | 'employees'
  | 'shifts'
  | 'attendance'
  | 'leaves'
  | 'patrol'
  | 'incidents'
  | 'loneworker'
  | 'assets'
  | 'payslips'
  | 'holidays'
  | 'policies'
  | 'messages'
  | 'search'
  | 'eye'
  | 'edit'
  | 'close'
  | 'plus'
  | 'calendar'
  | 'profile'
  | 'settings'
  | 'camera'
  | 'delete'
  | 'download'
  | 'document'
  | 'logout'
  | 'back'
  | 'arrow-left'
  | 'chevron-left'
  | 'chevron-right'
  | 'filter'
  | 'bell'
  | 'lock'
  | 'help'
  | 'phone'
  | 'security'
  | 'check'
  | 'send'
  | 'info'
  | 'about';

interface NavIconProps {
  name: NavIconName;
  color?: string;
  size?: number;
  active?: boolean;
}

export const NavIcon: React.FC<NavIconProps> = ({
  name,
  color,
  size = 28,
  active = false,
}) => {
  const iconColor = color || (active ? '#0F172A' : '#94A3B8');
  const lucideStrokeWidth = 2;

  switch (name) {
    case 'dashboard':
      return <LayoutDashboard size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'menu':
      return <Menu size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'sites':
      return <MapPin size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'employees':
      return <Users size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'shifts':
      return <Clock size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'attendance':
      return <ClipboardCheck size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'leaves':
      return <CalendarDays size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'patrol':
      return <Route size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'incidents':
      return <TriangleAlert size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'loneworker':
      return <ShieldCheck size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'assets':
      return <Package size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'payslips':
      return <WalletCards size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'holidays':
      return <CalendarHeart size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'policies':
      return <BookOpen size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'messages':
      return <MessageSquare size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'search':
      return <Search size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'eye':
      return <Eye size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'edit':
      return <Pencil size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'close':
      return <X size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'plus':
      return <Plus size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'calendar':
      return <Calendar size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'profile':
      return <User size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'settings':
      return <Settings size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'camera':
      return <Camera size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'delete':
      return <Trash2 size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'download':
      return <Download size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'document':
      return <FileText size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'logout':
      return <LogOut size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'back':
    case 'arrow-left':
      return <ArrowLeft size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'chevron-left':
      return <ChevronLeft size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'chevron-right':
      return <ChevronRight size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'filter':
      return <Filter size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'bell':
      return <Bell size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'lock':
      return <Lock size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'help':
      return <HelpCircle size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'phone':
      return <Phone size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'security':
      return <Shield size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'check':
      return <Check size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'send':
      return <Send size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'info':
    case 'about':
      return <Info size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    default:
      return <FileText size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
  }
};


const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
