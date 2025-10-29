import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

const PendingApproval = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-6">⏳</div>
        
        <h1 className="text-2xl font-bold text-black mb-4">
          Account Pending Approval
        </h1>
        
        <p className="text-black mb-6">
          Your account is currently pending approval from an administrator. 
          You will be able to access all features once your account has been approved.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-black mb-2">Account Details</h3>
          <div className="text-sm text-black">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Status:</strong> Pending Approval</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Check Status
          </button>
          
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Logout
          </button>
        </div>
        
        <p className="text-xs text-black mt-6">
          If you believe this is an error, please contact an administrator.
        </p>
      </GlassCard>
    </div>
  );
};

export default PendingApproval;
