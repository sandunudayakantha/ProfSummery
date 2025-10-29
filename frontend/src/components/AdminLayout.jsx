import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <AdminSidebar />
      <div className="lg:ml-64">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
