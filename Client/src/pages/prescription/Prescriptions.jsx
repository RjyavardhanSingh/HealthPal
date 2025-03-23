import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth(); // Fix: Properly import currentUser from AuthContext
  
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!currentUser) {
          setError('User authentication required');
          setLoading(false);
          return;
        }
        
        // First get the authenticated user's MongoDB ID
        const userResponse = await api.auth.getMe();
        if (!userResponse?.data?.data?._id) {
          throw new Error('Could not retrieve user ID');
        }
        
        const patientId = userResponse.data.data._id;
        console.log('Fetching prescriptions for patient ID:', patientId);
        
        // Now fetch prescriptions with the correct MongoDB ID
        const response = await api.prescriptions.getByPatient(patientId);
        setPrescriptions(response.data.data || []);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError(err.response?.data?.message || 'Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a currentUser
    if (currentUser) {
      fetchPrescriptions();
    }
  }, [currentUser]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Prescriptions</h1>
      <p className="text-gray-600 mb-6">View and manage your prescriptions</p>
      
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : prescriptions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {prescriptions.map(prescription => (
            <div 
              key={prescription._id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{prescription.medications[0]?.name || 'Prescription'}</h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {new Date(prescription.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mb-2">
                Prescribed by: Dr. {prescription.doctor?.name || 'Unknown'}
              </p>
              
              <div className="mt-2">
                <Link 
                  to={`/prescriptions/${prescription._id}`}
                  className="text-primary-600 hover:text-primary-800 text-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">No prescriptions found</p>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;