import { Link, useNavigate } from 'react-router-dom';

const BusinessCard = ({ business, onDelete }) => {
  const navigate = useNavigate();
  
  // Find user's role in this business
  const userRole = business.userRole || business.partners?.find(
    p => p.user?._id === JSON.parse(localStorage.getItem('user'))?._id
  )?.role || 'viewer';

  const isOwner = userRole === 'owner';

  const handleCardClick = () => {
    navigate(`/business/${business._id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent card click when deleting
    
    if (window.confirm(`Are you sure you want to delete "${business.name}"?\n\nThis will permanently delete:\n• The business\n• All transactions\n• All documents\n• All partner access\n\nThis action cannot be undone.`)) {
      if (onDelete) {
        onDelete(business._id);
      }
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="card hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{business.name}</h3>
          {business.description && (
            <p className="text-gray-600 mt-1">{business.description}</p>
          )}
        </div>
        <span className={`badge badge-${userRole}`}>
          {userRole}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          <span className="font-medium">{business.partners?.length || 0}</span> partner(s)
        </div>
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/business/${business._id}`}
            className="btn btn-primary text-sm"
          >
            View Details
          </Link>
          {isOwner && onDelete && (
            <button
              onClick={handleDelete}
              className="btn btn-danger text-sm"
              title="Delete Business"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;

